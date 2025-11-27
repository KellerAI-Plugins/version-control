#!/usr/bin/env node

/**
 * Fixes common code quality issues:
 * - Trailing whitespace
 * - Missing final newline
 * - Inconsistent line endings
 */

const fs = require('fs');
const path = require('path');

const PATTERNS = {
  // File types to process
  include: ['**/*.{js,json,md,yml,yaml,ts,tsx,jsx}'],
  // Directories to skip
  exclude: ['node_modules', '.git', 'dist', 'build', '.next']
};

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Skip excluded directories
    if (stat.isDirectory()) {
      if (!PATTERNS.exclude.includes(file)) {
        walkDir(filePath, callback);
      }
      return;
    }

    // Check if file matches patterns
    const ext = path.extname(file);
    const isMarkdown = ext === '.md';
    const isYaml = ['.yml', '.yaml'].includes(ext);
    const isCode = ['.js', '.json', '.ts', '.tsx', '.jsx'].includes(ext);

    if (isCode || isMarkdown || isYaml) {
      callback(filePath);
    }
  });
}

let filesFixed = 0;
const cwd = process.cwd();

console.log('🧹 Fixing common issues...');

walkDir(cwd, (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Fix trailing whitespace on each line
    const lines = content.split('\n');
    const fixedLines = lines.map(line => {
      const trimmed = line.trimRight();
      if (trimmed !== line) {
        modified = true;
      }
      return trimmed;
    });

    // Ensure file ends with newline
    let output = fixedLines.join('\n');
    if (output.length > 0 && !output.endsWith('\n')) {
      output += '\n';
      modified = true;
    }

    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, output, 'utf-8');
      const relativePath = path.relative(cwd, filePath);
      console.log(`✅ Fixed: ${relativePath}`);
      filesFixed++;
    }
  } catch (error) {
    const relativePath = path.relative(cwd, filePath);
    console.error(`⚠️  Could not process ${relativePath}: ${error.message}`);
  }
});

console.log(`\n📊 Fixed ${filesFixed} file(s) with common issues`);
