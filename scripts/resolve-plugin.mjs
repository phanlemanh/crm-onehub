#!/usr/bin/env node
/**
 * resolve-plugin.mjs — locate an INSTALLED sibling plugin's version root.
 *
 * Why this exists (the bug it replaces): the skills used to inline a glob over
 * `$HOME/.claude/plugins/cache` down to a plugin's version directory, then
 * "take the newest", in five places. `ls` sorts LEXICALLY, so with 1.9.2, 1.11.2, 1.18.0 and
 * 1.20.1 in the cache, "the newest" is `1.9.2` — the OLDEST. The gate would
 * then grade with judge personas and an evidence template from an ancient
 * release, silently, and still print a green report. Version skew that never
 * announces itself is exactly the false-green class this kit exists to stop.
 *
 * Three rules this encodes, none of which a shell glob can:
 *   1. SEMVER order, not filename order.
 *   2. A candidate must actually CARRY the files the caller needs
 *      (`--require`) — a half-written or partially-synced cache entry is
 *      skipped, never returned as a directory that dies one step later.
 *   3. Failure is LOUD and actionable: what was looked for, where, and the
 *      exact install command — never a silent fallback to a stale version.
 *
 * A plugin locating ITSELF must not use this — the harness already provides
 * `${CLAUDE_PLUGIN_ROOT}`. This is only for reaching a DIFFERENT plugin, where
 * no such variable exists.
 *
 * Usage:
 *   resolve-plugin.mjs --plugin <name> [--require <relpath>]...
 *                      [--cache-root <dir>]... [--root <dir>] [--json]
 * Prints the resolved version root on stdout. Exit 0 = resolved, 1 = not found.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const argv = process.argv.slice(2);
const many = (flag) => argv.reduce((acc, a, i) => (a === flag && argv[i + 1] ? acc.concat(argv[i + 1]) : acc), []);
const one = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };

const plugin = one('--plugin');
const requires = many('--require');
const explicitRoot = one('--root');
const asJson = argv.includes('--json');
const cacheRoots = many('--cache-root').length
  ? many('--cache-root')
  : [path.join(os.homedir(), '.claude', 'plugins', 'cache')];

if (!plugin) {
  process.stderr.write('resolve-plugin: --plugin <name> is required\n');
  process.exit(2);
}

const dirs = (p) => { try { return fs.readdirSync(p, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name); } catch { return []; } };
const carries = (root) => requires.every(rel => { try { return fs.statSync(path.join(root, rel)).isFile(); } catch { return false; } });

// Numeric-segment comparison with release-beats-prerelease. Returns >0 when a is newer.
function cmpVer(a, b) {
  const [ca, pa = ''] = String(a).split('-');
  const [cb, pb = ''] = String(b).split('-');
  const na = ca.split('.').map(n => parseInt(n, 10) || 0);
  const nb = cb.split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(na.length, nb.length); i++) {
    const d = (na[i] || 0) - (nb[i] || 0);
    if (d) return d;
  }
  if (!pa && pb) return 1;      // 1.2.0 newer than 1.2.0-rc1
  if (pa && !pb) return -1;
  return pa < pb ? -1 : pa > pb ? 1 : 0;
}

function emit(root, version, candidates) {
  process.stdout.write(asJson
    ? JSON.stringify({ root, version, candidates }, null, 2) + '\n'
    : root + '\n');
  process.exit(0);
}

if (explicitRoot) {
  if (!carries(explicitRoot)) {
    process.stderr.write(
      `resolve-plugin: --root "${explicitRoot}" does not carry ${requires.join(', ') || '(nothing required)'}\n` +
      'A declared root is still verified — the kit does not take a path\'s word for it.\n');
    process.exit(1);
  }
  emit(path.resolve(explicitRoot), null, []);
}

// cacheRoot / <marketplace> / <plugin> / <version>
const found = [];
const skipped = [];
for (const cacheRoot of cacheRoots) {
  for (const mkt of dirs(cacheRoot)) {
    const base = path.join(cacheRoot, mkt, plugin);
    for (const version of dirs(base)) {
      const root = path.join(base, version);
      (carries(root) ? found : skipped).push({ root, version });
    }
  }
}

if (!found.length) {
  process.stderr.write(
    `resolve-plugin: no usable install of "${plugin}" found.\n` +
    `  needed inside it: ${requires.join(', ') || '(nothing required)'}\n` +
    `  searched: ${cacheRoots.join(', ')}\n` +
    (skipped.length
      ? `  found but UNUSABLE (missing the files above): ${skipped.map(s => s.version).join(', ')}\n`
      : '') +
    `  fix: claude plugin install ${plugin}@acceptance-gate-kit\n`);
  process.exit(1);
}

found.sort((a, b) => cmpVer(b.version, a.version));
emit(found[0].root, found[0].version, found.map(f => f.version));
