import { ToolProcessor, ToolInput, ToolResult } from '@/types/tool';

// Base64URL → standard Base64 → decode
function base64UrlDecode(base64url: string): string {
  // Replace URL-safe chars and restore padding
  const b64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '==='.slice((b64.length + 3) % 4);
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf8');
  }
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}

// Known registered claim names (RFC 7519 §4.1)
const REGISTERED_CLAIMS: Record<string, string> = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  exp: 'Expiration Time',
  nbf: 'Not Before',
  iat: 'Issued At',
  jti: 'JWT ID',
};

// Numeric date claims — render as ISO + unix value
const DATE_CLAIMS = new Set(['exp', 'nbf', 'iat']);

function formatClaims(payload: Record<string, unknown>): string {
  const lines: string[] = [];
  // Registered claims first
  for (const key of Object.keys(REGISTERED_CLAIMS)) {
    if (!(key in payload)) continue;
    const val = payload[key];
    if (DATE_CLAIMS.has(key) && typeof val === 'number') {
      const d = new Date(val * 1000);
      lines.push(`${key} (${REGISTERED_CLAIMS[key]}): ${d.toISOString()} (unix: ${val})`);
    } else {
      lines.push(`${key} (${REGISTERED_CLAIMS[key]}): ${JSON.stringify(val)}`);
    }
  }
  // Remaining custom claims
  for (const key of Object.keys(payload)) {
    if (key in REGISTERED_CLAIMS) continue;
    lines.push(`${key}: ${JSON.stringify(payload[key])}`);
  }
  return lines.join('\n');
}

export const jwtDecoderProcessor: ToolProcessor = {
  inputLabel: 'JWT Token',
  inputPlaceholder: 'Paste a JWT here (eyJ…)…',
  autoProcess: false,
  exampleInput:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImlzcyI6ImV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDM2MDB9.signature_not_verified',

  process(input: ToolInput): ToolResult {
    const raw = input.value.trim();
    if (!raw) return { error: 'Paste a JWT token to decode.' };

    const parts = raw.split('.');
    if (parts.length !== 3) {
      return { error: `A JWT must have exactly 3 parts separated by dots (got ${parts.length}).` };
    }

    let header: Record<string, unknown>;
    let payload: Record<string, unknown>;

    try {
      header = JSON.parse(base64UrlDecode(parts[0]));
    } catch {
      return { error: 'Failed to decode JWT header. The first segment is not valid Base64URL-encoded JSON.' };
    }

    try {
      payload = JSON.parse(base64UrlDecode(parts[1]));
    } catch {
      return { error: 'Failed to decode JWT payload. The second segment is not valid Base64URL-encoded JSON.' };
    }

    const headerJson = JSON.stringify(header, null, 2);
    const payloadJson = JSON.stringify(payload, null, 2);
    const claims = formatClaims(payload);

    const output = [
      '⚠️  Decoding a JWT does not verify its signature or prove that the token is authentic.',
      '',
      '── HEADER ──────────────────────────────────────────────────────────',
      headerJson,
      '',
      '── PAYLOAD ─────────────────────────────────────────────────────────',
      payloadJson,
      '',
      '── REGISTERED CLAIMS (human-readable) ──────────────────────────────',
      claims || '(none)',
      '',
      '── SIGNATURE ───────────────────────────────────────────────────────',
      `${parts[2]}`,
      '(signature is NOT verified)',
    ].join('\n');

    return {
      output: {
        value: output,
        type: 'text',
        label: 'Decoded JWT',
        copyable: true,
        downloadFilename: 'jwt-decoded.txt',
        downloadMime: 'text/plain',
      },
      meta: {
        algorithm: String(header.alg ?? 'unknown'),
        type: String(header.typ ?? 'JWT'),
      },
      warnings: [{ message: 'Decoding a JWT does not verify its signature or prove the token is authentic.' }],
    };
  },
};
