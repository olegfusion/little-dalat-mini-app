import sharp from 'sharp';
import { readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename, dirname } from 'path';

const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);
const ROOT = join(import.meta.dirname, '..');

async function convertFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (!EXTENSIONS.has(ext)) return;

  const avifPath = filePath.slice(0, -ext.length) + '.avif';
  if (existsSync(avifPath)) {
    console.log(`SKIP (exists): ${avifPath}`);
    return;
  }

  try {
    await sharp(filePath).avif({ quality: 80 }).toFile(avifPath);
    console.log(`OK: ${filePath} → ${avifPath}`);
  } catch (err) {
    console.error(`FAIL: ${filePath} — ${err.message}`);
  }
}

async function walkDir(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      await walkDir(fullPath);
    } else {
      await convertFile(fullPath);
    }
  }
}

// Convert Ảnh Menu/
const anhMenuDir = join(ROOT, 'Ảnh Menu');
if (existsSync(anhMenuDir)) {
  console.log('=== Converting Ảnh Menu/ ===');
  await walkDir(anhMenuDir);
}

// Convert public/logo.png
const logoFile = join(ROOT, 'public', 'logo.png');
if (existsSync(logoFile)) {
  console.log('=== Converting public/logo.png ===');
  await convertFile(logoFile);
}

console.log('Done!');
