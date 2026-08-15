#!/usr/bin/env node
/**
 * Bump Canal Study versions in app.json + package.json.
 * Usage: node scripts/bump-version.mjs [patch|minor|major|x.y.z]
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const appPath = path.join(root, 'app.json');
const pkgPath = path.join(root, 'package.json');

const arg = (process.argv[2] || 'patch').trim();
const app = JSON.parse(fs.readFileSync(appPath, 'utf8'));
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function parseSemver(v) {
  const m = String(v).trim().replace(/^v/i, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) throw new Error(`Invalid semver: ${v}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function format([a, b, c]) {
  return `${a}.${b}.${c}`;
}

const current = app.expo?.version || pkg.version || '0.0.0';
let next;

if (/^\d+\.\d+\.\d+$/.test(arg) || /^v\d+\.\d+\.\d+$/i.test(arg)) {
  next = arg.replace(/^v/i, '');
} else {
  const [major, minor, patch] = parseSemver(current);
  if (arg === 'major') next = format([major + 1, 0, 0]);
  else if (arg === 'minor') next = format([major, minor + 1, 0]);
  else if (arg === 'patch') next = format([major, minor, patch + 1]);
  else {
    console.error('Usage: node scripts/bump-version.mjs [patch|minor|major|x.y.z]');
    process.exit(1);
  }
}

const versionCode = Number(app.expo?.android?.versionCode || 0) + 1;

app.expo.version = next;
if (!app.expo.android) app.expo.android = {};
app.expo.android.versionCode = versionCode;
if (app.expo.ios) {
  app.expo.ios.buildNumber = String(versionCode);
}
pkg.version = next;

fs.writeFileSync(appPath, `${JSON.stringify(app, null, 2)}\n`);
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log(`Bumped ${current} → ${next} (versionCode ${versionCode})`);
