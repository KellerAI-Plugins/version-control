#!/usr/bin/env node

/**
 * Validates YAML frontmatter in agents, skills, and commands
 *
 * Requirements:
 * - All .md files must start with YAML frontmatter
 * - Frontmatter must be valid YAML between --- delimiters
 * - Required fields: name, description
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const dirsToCheck = ['agents', 'skills', 'commands'].filter(dir =>
  fs.existsSync(path.join(process.cwd(), dir))
);

let errorCount = 0;
let fileCount = 0;

console.log('🔍 Validating frontmatter in:', dirsToCheck.join(', '));

dirsToCheck.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(dirPath, f));

  files.forEach(filePath => {
    fileCount++;
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);

    // Check for frontmatter delimiter
    if (!content.startsWith('---')) {
      console.error(`❌ ${relativePath}: Missing frontmatter start`);
      errorCount++;
      return;
    }

    // Extract frontmatter
    const endDelimiter = content.indexOf('\n---\n', 4);
    if (endDelimiter === -1) {
      console.error(`❌ ${relativePath}: Missing frontmatter end delimiter`);
      errorCount++;
      return;
    }

    const frontmatterStr = content.substring(4, endDelimiter);

    try {
      const frontmatter = yaml.parse(frontmatterStr);

      // Validate required fields
      const required = ['name', 'description'];
      const missing = required.filter(field => !frontmatter[field]);

      if (missing.length > 0) {
        console.error(`❌ ${relativePath}: Missing required fields: ${missing.join(', ')}`);
        errorCount++;
        return;
      }

      // Validate field types
      if (typeof frontmatter.name !== 'string' || frontmatter.name.trim() === '') {
        console.error(`❌ ${relativePath}: 'name' must be a non-empty string`);
        errorCount++;
        return;
      }

      if (typeof frontmatter.description !== 'string' || frontmatter.description.trim() === '') {
        console.error(`❌ ${relativePath}: 'description' must be a non-empty string`);
        errorCount++;
        return;
      }

      console.log(`✅ ${relativePath}: Valid`);
    } catch (error) {
      console.error(`❌ ${relativePath}: Invalid YAML - ${error.message}`);
      errorCount++;
    }
  });
});

console.log(`\n📊 Validation complete: ${fileCount} files checked, ${errorCount} errors`);

if (errorCount > 0) {
  process.exit(1);
}
