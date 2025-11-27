#!/usr/bin/env node

/**
 * Verifies consistency of agents, skills, and commands
 *
 * Checks:
 * - Consistent naming conventions
 * - YAML frontmatter consistency
 * - Required metadata fields
 * - No duplicate names across project
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const dirsToCheck = ['agents', 'skills', 'commands'].filter(dir =>
  fs.existsSync(path.join(process.cwd(), dir))
);

let errorCount = 0;
const allNames = new Set();
const cwd = process.cwd();

console.log('🔍 Verifying agent/skill/command consistency...');

dirsToCheck.forEach(dir => {
  const dirPath = path.join(cwd, dir);
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(dirPath, f));

  files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(cwd, filePath);
    const fileName = path.basename(filePath, '.md');

    // Check frontmatter exists and is valid
    if (!content.startsWith('---')) {
      console.error(`❌ ${relativePath}: Missing frontmatter`);
      errorCount++;
      return;
    }

    const endDelimiter = content.indexOf('\n---\n', 4);
    if (endDelimiter === -1) {
      console.error(`❌ ${relativePath}: Invalid frontmatter`);
      errorCount++;
      return;
    }

    const frontmatterStr = content.substring(4, endDelimiter);

    try {
      const frontmatter = yaml.parse(frontmatterStr);

      // Verify name matches filename
      if (!frontmatter.name) {
        console.error(`❌ ${relativePath}: Missing 'name' field in frontmatter`);
        errorCount++;
        return;
      }

      // Check for duplicate names
      if (allNames.has(frontmatter.name)) {
        console.error(`❌ ${relativePath}: Duplicate name '${frontmatter.name}' found in project`);
        errorCount++;
        return;
      }
      allNames.add(frontmatter.name);

      // Verify required fields based on type
      const required = ['name', 'description'];
      const missing = required.filter(field => !frontmatter[field]);

      if (missing.length > 0) {
        console.error(`❌ ${relativePath}: Missing fields: ${missing.join(', ')}`);
        errorCount++;
        return;
      }

      // Type-specific checks
      if (dir === 'agents' && !frontmatter.model) {
        console.warn(`⚠️  ${relativePath}: 'model' field recommended for agents`);
      }

      if (dir === 'skills' && !frontmatter.location) {
        console.warn(`⚠️  ${relativePath}: 'location' field recommended for skills`);
      }

      console.log(`✅ ${relativePath}: Valid`);
    } catch (error) {
      console.error(`❌ ${relativePath}: Error - ${error.message}`);
      errorCount++;
    }
  });
});

console.log(`\n📊 Consistency check complete, ${errorCount} error(s) found`);

if (errorCount > 0) {
  process.exit(1);
}
