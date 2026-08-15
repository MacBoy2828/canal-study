/** Compare semver-ish strings. Returns true when remote is newer than local. */
export function isRemoteNewer(remote: string, local: string): boolean {
  const a = parseVersion(remote);
  const b = parseVersion(local);
  for (let i = 0; i < 3; i += 1) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return false;
}

export function normalizeVersion(tagOrVersion: string): string {
  return tagOrVersion.trim().replace(/^v/i, '');
}

function parseVersion(input: string): [number, number, number] {
  const cleaned = normalizeVersion(input);
  const parts = cleaned.split(/[.+-]/).map((p) => Number.parseInt(p, 10));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}
