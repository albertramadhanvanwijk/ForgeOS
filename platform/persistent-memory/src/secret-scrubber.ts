/**
 * Automated Secret Scrubber (MEM-007)
 * Scans candidate text against known API keys, tokens, and credentials.
 * Redacts tokens and prevents private cryptographic keys from memory persistence.
 */

export interface ScrubResult {
  hasSecrets: boolean;
  cleanContent: string;
  detectedTypes: string[];
}

export class SecretScrubber {
  private secretPatterns: Array<{ type: string; regex: RegExp; replacement: string }> = [
    {
      type: 'github_pat',
      regex: /ghp_[a-zA-Z0-9]{36,}/g,
      replacement: '[REDACTED_SECRET:GITHUB_PAT]',
    },
    {
      type: 'github_fine_grained',
      regex: /github_pat_[a-zA-Z0-9_]{36,}/g,
      replacement: '[REDACTED_SECRET:GITHUB_PAT]',
    },
    {
      type: 'openai_key',
      regex: /sk-[a-zA-Z0-9_-]{12,}/g,
      replacement: '[REDACTED_SECRET:OPENAI_KEY]',
    },
    {
      type: 'password',
      regex: /(?:password|passwd|pwd)\s*[:=]\s*['"]?([^\s'";]+)['"]?/gi,
      replacement: '[REDACTED_SECRET:PASSWORD]',
    },
    {
      type: 'anthropic_key',
      regex: /sk-ant-[a-zA-Z0-9_-]{20,}/g,
      replacement: '[REDACTED_SECRET:ANTHROPIC_KEY]',
    },
    {
      type: 'aws_key',
      regex: /AKIA[0-9A-Z]{16}/g,
      replacement: '[REDACTED_SECRET:AWS_ACCESS_KEY]',
    },
    {
      type: 'jwt_token',
      regex: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
      replacement: '[REDACTED_SECRET:JWT_TOKEN]',
    },
  ];

  private privateKeyRegex = /-----BEGIN [A-Z\s]*PRIVATE KEY-----[\s\S]*?-----END [A-Z\s]*PRIVATE KEY-----/i;

  public scrub(content: string): ScrubResult {
    // Check if raw private cryptographic key is present
    if (this.privateKeyRegex.test(content)) {
      throw new Error(
        'Secret detected: Private cryptographic keys cannot be stored in Persistent Memory (MEM-007).'
      );
    }

    let scrubbed = content;
    const detectedTypes: string[] = [];

    for (const pattern of this.secretPatterns) {
      if (pattern.regex.test(scrubbed)) {
        detectedTypes.push(pattern.type);
        scrubbed = scrubbed.replace(pattern.regex, pattern.replacement);
      }
    }

    return {
      hasSecrets: detectedTypes.length > 0,
      cleanContent: scrubbed,
      detectedTypes,
    };
  }
}
