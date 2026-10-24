'use client';

import React from 'react';

interface DiffLine {
  type: 'same' | 'added' | 'removed';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
}

interface VisualDiffViewerProps {
  filename: string;
  originalCode?: string;
  modifiedCode: string;
}

// Compute clean line-by-line diff between two code strings
function computeLineDiff(original: string, modified: string): DiffLine[] {
  const oldLines = original.split('\n');
  const newLines = modified.split('\n');
  const result: DiffLine[] = [];

  let oldIdx = 0;
  let newIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (oldIdx < oldLines.length && newIdx < newLines.length) {
      if (oldLines[oldIdx] === newLines[newIdx]) {
        result.push({
          type: 'same',
          oldLineNumber: oldIdx + 1,
          newLineNumber: newIdx + 1,
          content: oldLines[oldIdx],
        });
        oldIdx++;
        newIdx++;
      } else {
        // Find if oldLine exists further down in newLines
        const foundInNew = newLines.slice(newIdx, newIdx + 5).indexOf(oldLines[oldIdx]);
        if (foundInNew > 0) {
          // Lines were added
          for (let i = 0; i < foundInNew; i++) {
            result.push({
              type: 'added',
              newLineNumber: newIdx + 1,
              content: newLines[newIdx],
            });
            newIdx++;
          }
        } else {
          result.push({
            type: 'removed',
            oldLineNumber: oldIdx + 1,
            content: oldLines[oldIdx],
          });
          oldIdx++;
        }
      }
    } else if (oldIdx < oldLines.length) {
      result.push({
        type: 'removed',
        oldLineNumber: oldIdx + 1,
        content: oldLines[oldIdx],
      });
      oldIdx++;
    } else if (newIdx < newLines.length) {
      result.push({
        type: 'added',
        newLineNumber: newIdx + 1,
        content: newLines[newIdx],
      });
      newIdx++;
    }
  }

  return result;
}

export function VisualDiffViewer({
  filename,
  originalCode = '',
  modifiedCode,
}: VisualDiffViewerProps) {
  const diffLines = computeLineDiff(originalCode, modifiedCode);

  const additions = diffLines.filter((l) => l.type === 'added').length;
  const deletions = diffLines.filter((l) => l.type === 'removed').length;

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-zinc-800 bg-[#0a0a0d] font-mono text-xs">
      {/* Diff Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-400">
        <span className="font-semibold text-zinc-200">{filename}</span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-400 font-bold">+{additions} lines</span>
          <span className="text-red-400 font-bold">-{deletions} lines</span>
        </div>
      </div>

      {/* Diff Lines Table */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto divide-y divide-zinc-900/40">
        <table className="w-full border-collapse">
          <tbody>
            {diffLines.map((line, idx) => {
              let rowBg = 'hover:bg-zinc-900/50';
              let textCol = 'text-zinc-300';
              let prefix = ' ';

              if (line.type === 'added') {
                rowBg = 'bg-emerald-950/40 text-emerald-200';
                textCol = 'text-emerald-300';
                prefix = '+';
              } else if (line.type === 'removed') {
                rowBg = 'bg-red-950/40 text-red-200';
                textCol = 'text-red-300';
                prefix = '-';
              }

              return (
                <tr key={idx} className={`${rowBg} leading-relaxed transition-colors`}>
                  {/* Old line number */}
                  <td className="w-10 select-none px-2 py-0.5 text-right font-mono text-[10px] text-zinc-600">
                    {line.oldLineNumber || ''}
                  </td>
                  {/* New line number */}
                  <td className="w-10 select-none px-2 py-0.5 text-right font-mono text-[10px] text-zinc-600 border-r border-zinc-800/60">
                    {line.newLineNumber || ''}
                  </td>
                  {/* Gutter prefix (+/-) */}
                  <td className="w-6 select-none px-2 py-0.5 text-center font-mono font-bold">
                    <span
                      className={
                        line.type === 'added'
                          ? 'text-emerald-400'
                          : line.type === 'removed'
                          ? 'text-red-400'
                          : 'text-zinc-600'
                      }
                    >
                      {prefix}
                    </span>
                  </td>
                  {/* Line Content */}
                  <td className={`px-2 py-0.5 whitespace-pre font-mono ${textCol}`}>
                    {line.content || ' '}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
