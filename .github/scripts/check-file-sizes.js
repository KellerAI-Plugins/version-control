#!/usr/bin/env node

/**
 * Enforces file size limits to prevent large files in the repository
 *
 * Limits:
 * - Individual files: 1 MB
 * - Images: 500 KB
 * - Videos: Not allowed
 */

const fs = require('fs');
const path = require('path');

const SIZE_LIMITS = {
  default: 1024 * 1024, // 1 MB
  images: 500 * 1024,   // 500 KB
  videos: 0              // Not allowed
};

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
const VIDEO_EXTS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '.cache'];

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(file)) {
        walkDir(filePath, callback);
      }
      return;
    }

    callback(filePath, stat.size);
  });
}

let errorCount = 0;
const cwd = process.cwd();

console.log('📏 Checking file sizes...');

walkDir(cwd, (filePath, size) => {
  const ext = path.extname(filePath).toLowerCase();
  const relativePath = path.relative(cwd, filePath);

  // Check video files (not allowed)
  if (VIDEO_EXTS.includes(ext)) {
    console.error(`❌ ${relativePath}: Video files not allowed in repository`);
    errorCount++;
    return;
  }

  // Determine size limit
  let limit;
  if (IMAGE_EXTS.includes(ext)) {
    limit = SIZE_LIMITS.images;
  } else {
    limit = SIZE_LIMITS.default;
  }

  // Check size
  if (size > limit) {
    const sizeMB = (size / (1024 * 1024)).toFixed(2);
    const limitMB = (limit / (1024 * 1024)).toFixed(2);
    console.error(`❌ ${relativePath}: ${sizeMB}MB exceeds limit of ${limitMB}MB`);
    errorCount++;
  }
});

console.log(`\n📊 File size check complete, ${errorCount} issue(s) found`);

if (errorCount > 0) {
  process.exit(1);
}
