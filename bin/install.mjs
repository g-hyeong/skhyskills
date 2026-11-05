#!/usr/bin/env node
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';

const bundle = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../skills');
const packageFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../package.json');
export const VERSION = JSON.parse(fs.readFileSync(packageFile, 'utf8')).version;
export const SKILLS = ['task-discovery', 'solution-design', 'plan-execution', 'delegate-work'];

function exists(file) {
  try { fs.lstatSync(file); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}
function safePath(root, relative) {
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if (exists(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error(`Symlink path is not allowed: ${relative}`);
  }
  return current;
}
function fingerprint(folder) {
  const hash = createHash('sha256');
  function walk(current, prefix) {
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) throw new Error('Skill trees must contain only regular files and directories');
    hash.update(`${stat.isDirectory() ? 'd' : 'f'}:${prefix}\0`);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(current).sort()) walk(path.join(current, name), `${prefix}/${name}`);
    } else hash.update(fs.readFileSync(current));
  }
  walk(folder, ''); return hash.digest('hex');
}
function inspectTarget(root, name) {
  const target = safePath(root, `.agents/skills/${name}`);
  if (!exists(target)) return { exists: false };
  const stat = fs.lstatSync(target);
  if (!stat.isDirectory()) throw new Error(`Skill path is not a directory: ${name}`);
  return { exists: true, inode: stat.ino, digest: fingerprint(target) };
}

export function install(rootInput, { replaceExisting = false } = {}) {
  if (!rootInput) throw new Error('Specify the target project with --root');
  const root = fs.realpathSync(rootInput);
  if (!fs.statSync(root).isDirectory()) throw new Error('Project root must be a directory');
  const discovery = safePath(root, '.agents/skills');
  if (exists(discovery) && !fs.statSync(discovery).isDirectory()) throw new Error('Skill discovery path must be a directory');
  const plan = SKILLS.map(name => {
    const source = path.join(bundle, name), previous = inspectTarget(root, name);
    const sourceDigest = fingerprint(source);
    const unchanged = previous.exists && previous.digest === sourceDigest;
    return { name, source, previous, unchanged };
  });
  const conflicts = plan.filter(x => x.previous.exists && !x.unchanged);
  if (conflicts.length && !replaceExisting)
    throw new Error(`Existing skills differ: ${conflicts.map(x => x.name).join(', ')}. Review them before using --replace-existing to back up and replace them.`);
  const changes = plan.filter(x => !x.unchanged);
  if (!changes.length) return { version: VERSION, installed: [], unchanged: SKILLS, backup: null };
  const backupRelative = conflicts.length ? `.skhy/backups/${Date.now()}-${randomUUID()}` : null;
  const backup = backupRelative ? safePath(root, backupRelative) : null;
  fs.mkdirSync(discovery, { recursive: true });
  const staging = fs.mkdtempSync(path.join(safePath(root, '.agents'), '.skhyskills-'));
  const applied = [];
  try {
    for (const item of changes) fs.cpSync(item.source, path.join(staging, item.name), { recursive: true, errorOnExist: true, force: false });
    if (backup) fs.mkdirSync(backup, { recursive: true });
    for (const item of changes) {
      if (JSON.stringify(inspectTarget(root, item.name)) !== JSON.stringify(item.previous)) throw new Error(`Skill changed during installation: ${item.name}`);
      const target = path.join(discovery, item.name);
      const entry = { target, saved: null, installed: false };
      if (item.previous.exists) {
        entry.saved = path.join(backup, item.name);
        fs.renameSync(target, entry.saved);
      }
      applied.push(entry);
      fs.renameSync(path.join(staging, item.name), target);
      entry.installed = true;
    }
  } catch (error) {
    for (const entry of applied.reverse()) {
      if (entry.installed) fs.rmSync(entry.target, { recursive: true });
      if (entry.saved) fs.renameSync(entry.saved, entry.target);
    }
    throw error;
  } finally { fs.rmSync(staging, { recursive: true, force: true }); }
  return { version: VERSION, installed: changes.map(x => x.name), unchanged: plan.filter(x => x.unchanged).map(x => x.name),
    backup: backupRelative, next: 'Start with task-discovery, or resume the current task phase.' };
}

function main(args) {
  if (!args.length || args.includes('--help')) {
    console.log('Usage: skhyskills --root <project-directory> [--replace-existing]\nInstalls four local skills. --replace-existing backs up differing skill directories under .skhy/backups before replacement.'); return;
  }
  if (args.length === 1 && args[0] === '--version') { console.log(VERSION); return; }
  let root, replaceExisting = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--root' && !root && args[i + 1] && !args[i + 1].startsWith('--')) root = args[++i];
    else if (args[i] === '--replace-existing' && !replaceExisting) replaceExisting = true;
    else throw new Error(`Unknown or incomplete option: ${args[i]}`);
  }
  console.log(JSON.stringify(install(root, { replaceExisting })));
}
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
