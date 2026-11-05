import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { fileURLToPath } from 'node:url';
import { install, SKILLS, VERSION } from '../bin/install.mjs';

const entry = fileURLToPath(new URL('../bin/install.mjs', import.meta.url));
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skhy skills-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true })); return root;
}
const skill = (root, name = 'plan-execution') => path.join(root, '.agents/skills', name);

test('fresh installation exits with four standalone directories and preserves the project', t => {
  const root = fixture(t); fs.writeFileSync(path.join(root, 'AGENTS.md'), 'User rules');
  const result = JSON.parse(execFileSync(process.execPath, [entry, '--root', root], { encoding: 'utf8', timeout: 5000 }));
  assert.deepEqual(result.installed, SKILLS); assert.equal(result.version, VERSION);
  for (const name of SKILLS) {
    assert.ok(fs.lstatSync(skill(root, name)).isDirectory());
    assert.ok(fs.readFileSync(path.join(skill(root, name), 'SKILL.md'), 'utf8').length);
  }
  assert.equal(fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8'), 'User rules');
  assert.ok(!fs.existsSync(path.join(root, '.skhy')));
  assert.ok(!fs.existsSync(path.join(root, 'node_modules')));
});
test('unchanged installation is idempotent and needs no backup', t => {
  const root = fixture(t); install(root); const result = install(root);
  assert.deepEqual(result.installed, []); assert.deepEqual(result.unchanged, SKILLS); assert.equal(result.backup, null);
});
test('preflight conflict preserves custom files and does not partially install missing skills', t => {
  const root = fixture(t); install(root);
  fs.writeFileSync(path.join(skill(root), 'SKILL.md'), 'Custom rule');
  fs.rmSync(skill(root, 'solution-design'), { recursive: true });
  assert.throws(() => install(root), /Existing skills differ/);
  assert.equal(fs.readFileSync(path.join(skill(root), 'SKILL.md'), 'utf8'), 'Custom rule');
  assert.ok(!fs.existsSync(skill(root, 'solution-design')));
});
test('explicit replacement backs up complete custom skills and leaves unrelated skills intact', t => {
  const root = fixture(t); install(root);
  fs.writeFileSync(path.join(skill(root), 'SKILL.md'), 'Custom rule');
  fs.writeFileSync(path.join(skill(root), 'custom.txt'), 'Preserve this file');
  fs.mkdirSync(skill(root, 'unrelated')); fs.writeFileSync(path.join(skill(root, 'unrelated'), 'SKILL.md'), 'Other');
  const result = install(root, { replaceExisting: true });
  assert.equal(fs.readFileSync(path.join(root, result.backup, 'plan-execution/SKILL.md'), 'utf8'), 'Custom rule');
  assert.equal(fs.readFileSync(path.join(root, result.backup, 'plan-execution/custom.txt'), 'utf8'), 'Preserve this file');
  assert.ok(!fs.existsSync(path.join(skill(root), 'custom.txt')));
  assert.equal(fs.readFileSync(path.join(skill(root, 'unrelated'), 'SKILL.md'), 'utf8'), 'Other');
});
test('symlinked installation targets cannot replace external content', t => {
  const root = fixture(t), outside = fixture(t);
  fs.writeFileSync(path.join(outside, 'SKILL.md'), 'External');
  fs.mkdirSync(path.join(root, '.agents/skills'), { recursive: true }); fs.symlinkSync(outside, skill(root), 'dir');
  assert.throws(() => install(root, { replaceExisting: true }), /Symlink/);
  assert.ok(fs.lstatSync(skill(root)).isSymbolicLink());
  assert.equal(fs.readFileSync(path.join(outside, 'SKILL.md'), 'utf8'), 'External');
});
test('symlinked discovery and backup parents cannot escape the project', t => {
  const root = fixture(t), outside = fixture(t); fs.symlinkSync(outside, path.join(root, '.agents'), 'dir');
  assert.throws(() => install(root), /Symlink/); fs.unlinkSync(path.join(root, '.agents'));
  install(root); fs.writeFileSync(path.join(skill(root), 'SKILL.md'), 'Custom');
  fs.symlinkSync(outside, path.join(root, '.skhy'), 'dir');
  assert.throws(() => install(root, { replaceExisting: true }), /Symlink/);
  assert.deepEqual(fs.readdirSync(outside), []);
});
test('nested links in a custom skill are preserved and rejected before replacement', t => {
  const root = fixture(t), outside = fixture(t); install(root);
  fs.symlinkSync(outside, path.join(skill(root), 'external'), 'dir');
  assert.throws(() => install(root, { replaceExisting: true }), /regular files/);
  assert.ok(fs.lstatSync(path.join(skill(root), 'external')).isSymbolicLink());
});
test('filesystem failure during replacement restores earlier directories', t => {
  const root = fixture(t); install(root);
  for (const name of ['task-discovery', 'plan-execution']) fs.writeFileSync(path.join(skill(root, name), 'SKILL.md'), `Custom ${name}`);
  fs.rmSync(skill(root, 'solution-design'), { recursive: true });
  const original = fs.renameSync;
  fs.renameSync = (from, to) => {
    if (String(from).includes('.skhyskills-') && to === skill(fs.realpathSync(root), 'plan-execution')) throw new Error('Synthetic disk error');
    return original(from, to);
  };
  syncBuiltinESMExports();
  try { assert.throws(() => install(root, { replaceExisting: true }), /Synthetic disk error/); }
  finally { fs.renameSync = original; syncBuiltinESMExports(); }
  for (const name of ['task-discovery', 'plan-execution']) assert.equal(fs.readFileSync(path.join(skill(root, name), 'SKILL.md'), 'utf8'), `Custom ${name}`);
  assert.ok(!fs.existsSync(skill(root, 'solution-design')));
  const retry = install(root, { replaceExisting: true });
  assert.deepEqual(retry.installed, ['task-discovery', 'solution-design', 'plan-execution']);
  assert.deepEqual(retry.unchanged, ['delegate-work']);
});
test('CLI works through an npm-style executable symlink', t => {
  const root = fixture(t), link = path.join(root, 'skhyskills'); fs.symlinkSync(entry, link);
  const result = JSON.parse(execFileSync(process.execPath, [link, '--root', root], { encoding: 'utf8' }));
  assert.deepEqual(result.installed, SKILLS);
});
test('help, version and invalid options do not modify a consumer project', t => {
  const root = fixture(t);
  assert.match(execFileSync(process.execPath, [entry], { cwd: root, encoding: 'utf8' }), /Usage/);
  assert.equal(execFileSync(process.execPath, [entry, '--version'], { cwd: root, encoding: 'utf8' }).trim(), VERSION);
  assert.throws(() => execFileSync(process.execPath, [entry, '--unknown'], { cwd: root, stdio: 'pipe' }));
  assert.throws(() => execFileSync(process.execPath, [entry, '--root'], { cwd: root, stdio: 'pipe' }));
  assert.deepEqual(fs.readdirSync(root), []);
});

test('fresh and repeated installation ignore unrelated directories and broken links', t => {
  const root = fixture(t);
  const custom = skill(root, 'custom-tools');
  const link = skill(root, 'work-in-progress');
  fs.mkdirSync(custom, { recursive: true });
  fs.writeFileSync(path.join(custom, 'notes.txt'), 'Keep this');
  fs.symlinkSync('not-installed-yet', link);

  assert.deepEqual(install(root).installed, SKILLS);
  assert.equal(install(root, { replaceExisting: true }).backup, null);
  assert.equal(fs.readFileSync(path.join(custom, 'notes.txt'), 'utf8'), 'Keep this');
  assert.equal(fs.readlinkSync(link), 'not-installed-yet');
});
