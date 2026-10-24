import { describe, it, expect, beforeEach } from 'vitest';
import { GitService } from '../../platform/orchestrator/src/git/git.service.js';
import { MockRunnerAdapter } from '@forgeos/runner';

describe('Task 2.4: Git Integration & Isolated Worktrees (FR-040, FR-041, FR-046)', () => {
  let mockRunner: MockRunnerAdapter;
  let gitService: GitService;

  beforeEach(() => {
    mockRunner = new MockRunnerAdapter({
      defaultExitCode: 0,
      defaultStdout: '',
    });
    gitService = new GitService(mockRunner);
  });

  describe('FR-040: Git Integration (Status, Branch, Commit)', () => {
    it('parses repository status and modified files', async () => {
      mockRunner = new MockRunnerAdapter({
        defaultExitCode: 0,
        defaultStdout: '## main\n M src/index.ts\n?? tests/new.test.ts\n',
      });
      gitService = new GitService(mockRunner);

      const status = await gitService.getStatus();
      expect(status.currentBranch).toBe('main');
      expect(status.isClean).toBe(false);
      expect(status.modifiedFiles).toContain('src/index.ts');
      expect(status.untrackedFiles).toContain('tests/new.test.ts');
    });

    it('creates branches and commits', async () => {
      let executedCommands: Array<{ command: string; args?: string[] }> = [];
      const trackingRunner = {
        async execute(opts: any) {
          executedCommands.push(opts);
          return { exitCode: 0, success: true, stdout: 'commit [main abc1234]', stderr: '', durationMs: 10, timedOut: false, logs: [] };
        },
      };

      const customGit = new GitService(trackingRunner as any);
      await customGit.createBranch('feature/auth-v2');
      await customGit.commit('feat(auth): add OAuth2 provider', ['src/auth.ts']);

      expect(executedCommands.some((c) => c.command === 'git' && c.args?.includes('checkout') && c.args?.includes('feature/auth-v2'))).toBe(true);
      expect(executedCommands.some((c) => c.command === 'git' && c.args?.includes('commit'))).toBe(true);
    });
  });

  describe('FR-041: Isolated Worktree Management', () => {
    it('creates and cleans up isolated worktrees', async () => {
      let executedCommands: Array<{ command: string; args?: string[] }> = [];
      const trackingRunner = {
        async execute(opts: any) {
          executedCommands.push(opts);
          return { exitCode: 0, success: true, stdout: '', stderr: '', durationMs: 10, timedOut: false, logs: [] };
        },
      };

      const customGit = new GitService(trackingRunner as any);
      const worktree = await customGit.createWorktree('.worktrees/agent-task-1', 'task/agent-1');

      expect(worktree.path).toBe('.worktrees/agent-task-1');
      expect(worktree.branch).toBe('task/agent-1');
      expect(executedCommands.some((c) => c.command === 'git' && c.args?.includes('worktree') && c.args?.includes('add'))).toBe(true);

      await customGit.removeWorktree('.worktrees/agent-task-1');
      expect(executedCommands.some((c) => c.command === 'git' && c.args?.includes('worktree') && c.args?.includes('remove'))).toBe(true);
    });
  });

  describe('FR-046: Diff & Change Summary Generation', () => {
    it('generates unified diff and change statistics', async () => {
      const mockDiff =
        'diff --git a/src/index.ts b/src/index.ts\n' +
        '--- a/src/index.ts\n' +
        '+++ b/src/index.ts\n' +
        '@@ -1,3 +1,4 @@\n' +
        '+export const newFeature = true;\n';

      mockRunner = new MockRunnerAdapter({
        defaultExitCode: 0,
        defaultStdout: mockDiff,
      });
      gitService = new GitService(mockRunner);

      const diffSummary = await gitService.getDiffSummary('HEAD~1');
      expect(diffSummary.rawDiff).toContain('+export const newFeature = true;');
      expect(diffSummary.filesChanged).toContain('src/index.ts');
      expect(diffSummary.insertions).toBeGreaterThanOrEqual(1);
    });
  });
});
