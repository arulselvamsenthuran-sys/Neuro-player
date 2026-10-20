import { pipeline, env } from '@xenova/transformers';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempCache  = path.join(__dirname, '.temp_qwen_cache');
const finalDir   = path.join(__dirname, 'models', 'Xenova', 'Qwen1.5-0.5B-Chat');

env.cacheDir = tempCache;
env.allowLocalModels = false;

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

console.log('Downloading Xenova/Qwen1.5-0.5B-Chat ...');
try {
  await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat');
} catch (e) {
  // pipeline init may fail on first load — files are still cached
  console.log('Pipeline init warning (expected):', e.message?.slice(0, 120));
}

// Find snapshot
const snapshotsDir = path.join(tempCache, 'models--Xenova--Qwen1.5-0.5B-Chat', 'snapshots');
if (!fs.existsSync(snapshotsDir)) {
  console.error('ERROR: snapshot dir not found at', snapshotsDir);
  process.exit(1);
}

const commits = fs.readdirSync(snapshotsDir);
if (commits.length === 0) {
  console.error('ERROR: no snapshot commits found');
  process.exit(1);
}

const snapshotDir = path.join(snapshotsDir, commits[0]);
console.log('Copying from snapshot:', snapshotDir);
console.log('Copying to:', finalDir);
copyDir(snapshotDir, finalDir);

// Cleanup temp cache
try { fs.rmSync(tempCache, { recursive: true, force: true }); } catch (_) {}

// Verify
const tokenizer = path.join(finalDir, 'tokenizer.json');
if (fs.existsSync(tokenizer)) {
  console.log('SUCCESS: tokenizer.json found at', tokenizer);
  console.log('Offline Copilot model is ready!');
} else {
  console.error('ERROR: tokenizer.json missing — copy may have failed');
  console.log('Files present:', fs.readdirSync(finalDir));
}
