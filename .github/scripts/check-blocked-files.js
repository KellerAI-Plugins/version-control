#!/usr/bin/env node

/**
 * Prevents committing sensitive files that should never be in version control
 *
 * Blocked patterns:
 * - .env files and local config
 * - API keys and credentials
 * - Private keys and tokens
 * - IDE settings with secrets
 */

const fs = require('fs');
const path = require('path');

const BLOCKED_PATTERNS = [
  // Environment files
  /^\.env(\..*)?$/,
  /^\.env\.local$/,
  /^\.env\..*\.local$/,

  // Credentials and secrets
  /\.key$/,
  /\.pem$/,
  /private[-_]key/i,
  /secret[-_]key/i,
  /credentials/i,
  /oauth[-_]token/i,
  /api[-_]key/i,
  /auth[-_]token/i,

  // IDE settings with secrets
  /\.vscode\/settings\.json$/,
  /\.idea\/.*\.xml$/,
  /\.idea\/.*\.yml$/,
];

const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', '.next'];

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

    callback(filePath);
  });
}

let blockedCount = 0;
const cwd = process.cwd();

console.log('🔐 Checking for blocked/sensitive files...');

walkDir(cwd, (filePath) => {
  const relativePath = path.relative(cwd, filePath);
  const fileName = path.basename(filePath);

  // Check against blocked patterns
  const isBlocked = BLOCKED_PATTERNS.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(fileName) || pattern.test(relativePath);
    }
    return relativePath.includes(pattern);
  });

  if (isBlocked) {
    console.error(`❌ BLOCKED: ${relativePath}`);
    console.error(`   This file should not be committed. Add to .gitignore`);
    blockedCount++;

    // Check if file contains suspicious content
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const suspiciousPatterns = [
        /api[_-]?key\s*[:=]/i,
        /secret\s*[:=]/i,
        /password\s*[:=]/i,
        /token\s*[:=]/i,
        /private[_-]?key\s*[:=]/i,
      ];

      const hasSuspicious = suspiciousPatterns.some(p => p.test(content));
      if (hasSuspicious) {
        console.error(`   ⚠️  File appears to contain credentials!`);
      }
    } catch (error) {
      // Binary file, skip content check
    }
  }
});

console.log(`\n📊 Blocked file check complete, ${blockedCount} file(s) found`);

if (blockedCount > 0) {
  process.exit(1);
}
