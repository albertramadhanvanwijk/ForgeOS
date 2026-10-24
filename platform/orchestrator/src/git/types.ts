export interface GitStatus {
  currentBranch: string;
  isClean: boolean;
  modifiedFiles: string[];
  untrackedFiles: string[];
  stagedFiles: string[];
}

export interface WorktreeInfo {
  path: string;
  branch: string;
  commitHash?: string;
}

export interface DiffSummary {
  rawDiff: string;
  filesChanged: string[];
  insertions: number;
  deletions: number;
}
