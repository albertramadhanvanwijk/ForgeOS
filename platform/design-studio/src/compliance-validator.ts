import type { DesignSystemSpec, UIComplianceResult, UIComplianceViolation } from './types.js';

export function validateUICompliance(
  sourceCode: string,
  approvedSpec: DesignSystemSpec
): UIComplianceResult {
  const violations: UIComplianceViolation[] = [];

  // Extract all approved hex colors in lowercase
  const approvedColors = new Set<string>();
  if (approvedSpec.tokens?.colors) {
    for (const val of Object.values(approvedSpec.tokens.colors)) {
      if (typeof val === 'string' && val.startsWith('#')) {
        approvedColors.add(val.toLowerCase());
      }
    }
  }

  // Regex to detect hex color codes
  const hexPattern = /#([0-9a-fA-F]{3,8})\b/g;
  let match: RegExpExecArray | null;

  while ((match = hexPattern.exec(sourceCode)) !== null) {
    const hex = match[0].toLowerCase();
    // Ignore short standard grayscale if defined or check against approvedColors
    if (!approvedColors.has(hex)) {
      violations.push({
        rule: 'unapproved-color',
        message: `Disallowed rogue hex color detected: ${match[0]}. Must use tokens from approved design system.`,
      });
    }
  }

  // Accessibility rule 1: img tag missing alt attribute
  const imgPattern = /<img\b(?![^>]*\balt=)[^>]*>/gi;
  if (imgPattern.test(sourceCode)) {
    violations.push({
      rule: 'accessibility-alt-missing',
      message: 'Image element detected without required alt attribute.',
    });
  }

  // Accessibility rule 2: button without text content or aria-label
  const emptyButtonPattern = /<button(?:(?!aria-label)[\s\S])*?>\s*<\/button>/i;
  if (emptyButtonPattern.test(sourceCode)) {
    violations.push({
      rule: 'accessibility-button-empty',
      message: 'Button element detected with empty label/content and missing aria-label.',
    });
  }

  return {
    compliant: violations.length === 0,
    violations,
  };
}
