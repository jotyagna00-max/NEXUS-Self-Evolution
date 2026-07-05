/**
 * Downloads the Phi-4-mini GGUF model for use with the bundled node-llama-cpp.
 *
 * Usage:
 *   node scripts/download-model.js
 *
 * The model is saved to ./llama-models/ (or a custom path via --dir).
 * About 2.5 GB download.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const MODEL_REPO = 'bartowski/Phi-4-mini-instruct-GGUF';
const MODEL_FILE = 'Phi-4-mini-instruct-Q4_K_M.gguf';

const args = process.argv.slice(2);
const dirFlag = args.indexOf('--dir');
const outDir = dirFlag !== -1 ? path.resolve(args[dirFlag + 1]) : path.join(ROOT, 'llama-models');
const outPath = path.join(outDir, MODEL_FILE);

async function main() {
  if (fs.existsSync(outPath)) {
    const size = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
    console.log(`✓ Model already exists at ${outPath} (${size} MB)`);
    process.exit(0);
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const url = `https://huggingface.co/${MODEL_REPO}/resolve/main/${MODEL_FILE}`;
  console.log(`Downloading ${MODEL_FILE} from ${url}`);
  console.log(`Saving to ${outPath}\n`);

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);

  const total = parseInt(resp.headers.get('content-length') || '0', 10);
  const reader = resp.body.getReader();
  const writer = fs.createWriteStream(outPath);

  let downloaded = 0;
  const start = Date.now();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    writer.write(Buffer.from(value));
    downloaded += value.length;

    if (total > 0) {
      const pct = ((downloaded / total) * 100).toFixed(1);
      const elapsed = ((Date.now() - start) / 1000).toFixed(0);
      const speed = (downloaded / 1024 / 1024 / Math.max(1, Number(elapsed))).toFixed(1);
      process.stdout.write(`\r${pct}% — ${(downloaded / 1024 / 1024).toFixed(0)} / ${(total / 1024 / 1024).toFixed(0)} MB — ${speed} MB/s`);
    }
  }

  writer.end();
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(0);
  const size = (downloaded / 1024 / 1024).toFixed(1);
  console.log(`\n\n✓ Complete — ${size} MB downloaded in ${elapsed}s`);
}

main().catch(err => {
  console.error('Download failed:', err.message);
  process.exit(1);
});
