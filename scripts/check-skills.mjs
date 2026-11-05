import * as fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { SKILLS } from '../bin/install.mjs';

const root = fileURLToPath(new URL('../skills/', import.meta.url));
assert.deepEqual(fs.readdirSync(root).sort(), [...SKILLS].sort());
let documents = 0;
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    assert.ok(!entry.isSymbolicLink(), `Unexpected symlink: ${entry.name}`);
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    assert.ok(entry.isFile());
    if (!entry.name.endsWith('.md')) continue;
    const text = fs.readFileSync(file, 'utf8'); documents++;
    assert.ok(!text.includes('/Users/'), `Personal path: ${file}`);
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      const link = match[1].split('#')[0];
      if (!link || /^https?:\/\//.test(link)) continue;
      const resolved = path.resolve(directory, link);
      assert.ok(resolved.startsWith(root), `Reference escapes skills: ${file}`);
      assert.ok(fs.existsSync(resolved), `Missing reference: ${file} -> ${link}`);
    }
  }
}
for (const name of SKILLS) {
  const text = fs.readFileSync(path.join(root, name, 'SKILL.md'), 'utf8');
  const front = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(front, `Missing frontmatter: ${name}`);
  assert.ok(front[1].split('\n').includes(`name: ${name}`));
  assert.ok(/^description: \S.+$/m.test(front[1]), `Missing plain description: ${name}`);
  assert.ok(front[1].split('\n').every(line => /^(name|description): /.test(line)), `Unexpected metadata: ${name}`);
}
walk(root);
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0);
assert.equal(Object.keys(pkg.devDependencies ?? {}).length, 0);
console.log(`Validated ${SKILLS.length} skills and ${documents} Markdown files; no runtime dependencies.`);
