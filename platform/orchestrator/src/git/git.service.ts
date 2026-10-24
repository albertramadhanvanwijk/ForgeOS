import { IRunnerAdapter } from '@forgeos/runner';
import { GitStatus, WorktreeInfo, DiffSummary } from './types.js';

export class GitService {
  constructor(private readonly runner: IRunnerAdapter) {}

  public async getStatus(cwd?: string): Promise<GitStatus> {
    const result = await this.runner.execute({
      command: 'git',
      args: ['status', '--short', '--branch'],
      cwd,
    });

    if (!result.success) {
      throw new Error(`git status failed: ${result.stderr}`);
    }

    const lines = result.stdout.split('\n').map((l) => l.trimEnd()).filter(Boolean);
    let currentBranch = 'unknown';
    const modifiedFiles: string[] = [];
    const untrackedFiles: string[] = [];
    const stagedFiles: string[] = [];

    for (const line of lines) {
      if (line.startsWith('##')) {
        const branchPart = line.substring(2).trim().split('...')[0].trim();
        currentBranch = branchPart;
        continue;
      }

      const col1 = line[0];
      const col2 = line[1];
      const file = line.substring(3).trim();

      if (col1 === '?' && col2 === '?') {
        untrackedFiles.push(file);
      } else {
        if (col1 && col1 !== ' ' && col1 !== '?') {
          stagedFiles.push(file);
        }
        if (col2 && col2 !== ' ') {
          modifiedFiles.push(file);
        }
      }
    }

    const isClean = modifiedFiles.length === 0 && untrackedFiles.length === 0 && stagedFiles.length === 0;

    return {
      currentBranch,
      isClean,
      modifiedFiles,
      untrackedFiles,
      stagedFiles,
    };
  }

  public async createBranch(branchName: string, baseBranch?: string, cwd?: string): Promise<void> {
    const args = baseBranch
      ? ['checkout', '-b', branchName, baseBranch]
      : ['checkout', '-b', branchName];

    const result = await this.runner.execute({
      command: 'git',
      args,
      cwd,
    });

    if (!result.success) {
      throw new Error(`Failed to create branch ${branchName}: ${result.stderr}`);
    }
  }

  public async createWorktree(worktreePath: string, branchName: string, cwd?: string): Promise<WorktreeInfo> {
    const result = await this.runner.execute({
      command: 'git',
      args: ['worktree', 'add', '-b', branchName, worktreePath],
      cwd,
    });

    if (!result.success) {
      throw new Error(`Failed to create worktree at ${worktreePath}: ${result.stderr}`);
    }

    return {
      path: worktreePath,
      branch: branchName,
    };
  }

  public async removeWorktree(worktreePath: string, force = true, cwd?: string): Promise<void> {
    const args = ['worktree', 'remove'];
    if (force) args.push('--force');
    args.push(worktreePath);

    const result = await this.runner.execute({
      command: 'git',
      args,
      cwd,
    });

    if (!result.success) {
      throw new Error(`Failed to remove worktree at ${worktreePath}: ${result.stderr}`);
    }
  }

  public async getDiffSummary(baseRef = 'HEAD~1', cwd?: string): Promise<DiffSummary> {
    const result = await this.runner.execute({
      command: 'git',
      args: ['diff', baseRef],
      cwd,
    });

    if (!result.success) {
      throw new Error(`git diff failed: ${result.stderr}`);
    }

    const rawDiff = result.stdout;
    const lines = rawDiff.split('\n');
    const filesChanged = new Set<string>();
    let insertions = 0;
    let deletions = 0;

    for (const line of lines) {
      if (line.startsWith('diff --git')) {
        const parts = line.split(' ');
        if (parts.length >= 4) {
          const filePath = parts[3].replace(/^b\//, '');
          filesChanged.add(filePath);
        }
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        insertions++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        deletions++;
      }
    }

    return {
      rawDiff,
      filesChanged: Array.from(filesChanged),
      insertions,
      deletions,
    };
  }

  public async commit(message: string, files?: string[], cwd?: string): Promise<string> {
    // Stage files
    const addArgs = files && files.length > 0 ? ['add', ...files] : ['add', '.'];
    const addRes = await this.runner.execute({
      command: 'git',
      args: addArgs,
      cwd,
    });

    if (!addRes.success) {
      throw new Error(`git add failed: ${addRes.stderr}`);
    }

    // Commit
    const commitRes = await this.runner.execute({
      command: 'git',
      args: ['commit', '-m', message],
      cwd,
    });

    if (!commitRes.success) {
      throw new Error(`git commit failed: ${commitRes.stderr}`);
    }

    return commitRes.stdout.trim();
  }
}
