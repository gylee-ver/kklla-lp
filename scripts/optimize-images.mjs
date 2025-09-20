import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const projectRoot = path.resolve(process.cwd());
const publicDir = path.join(projectRoot, 'public');
const outDir = path.join(publicDir, 'optimized');

const INPUTS = ['header.png', '1.png', '2.png', '3.png', '4.png', '5.png', '6-1.png', '7.png', '8.png', 'kakao.png'];

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function optimizeOne(filename) {
  const srcPath = path.join(publicDir, filename);
  const base = path.parse(filename).name;
  const outWebp = path.join(outDir, `${base}.webp`);

  const stat = await fs.promises.stat(srcPath).catch(() => null);
  if (!stat) {
    console.warn(`[skip] not found: ${filename}`);
    return;
  }

  const input = sharp(srcPath, { failOn: 'none' });
  const meta = await input.metadata();
  const targetWidth = Math.min(1200, meta.width || 1200); // 충분한 선명도 유지

  const pipeline = input.resize({ width: targetWidth, withoutEnlargement: true });

  await pipeline
    .webp({ quality: 82, effort: 4 })
    .toFile(outWebp);

  const origSize = stat.size;
  const newSize = (await fs.promises.stat(outWebp)).size;
  const ratio = ((1 - newSize / origSize) * 100).toFixed(1);
  console.log(`${filename} -> optimized/${base}.webp  (${(origSize/1e6).toFixed(1)}MB -> ${(newSize/1e6).toFixed(1)}MB, -${ratio}%)`);
}

async function main() {
  await ensureDir(outDir);
  for (const f of INPUTS) {
    await optimizeOne(f);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


