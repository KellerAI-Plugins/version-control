# Automated Review Workflows - Standardization Guide

This document defines the standard automated review and feedback handling workflows for KellerAI projects.

## Overview

All projects use a consistent CI/CD workflow for automated code review and fixing. The standard consists of three complementary workflows:

1. **Validate PR** - Security and structure validation
2. **CodeRabbit Auto-Fix** - Automatic fixing on PR open/update
3. **CodeRabbit Feedback Handler** - Reactive fixing on comment feedback

## Standardization Rules

### Git Configuration

All automated commits must use consistent git identity:

```yaml
git config --global user.name "KellerAI CI"
git config --global user.email "ci@kellerai.dev"
```

**Why**: Consistent author information makes it easy to identify and audit automated changes across all projects.

### Commit Messages

Auto-fix commits follow a structured format:

```
ci: apply CodeRabbit feedback

- Code formatting (Prettier)
- Linting rules (ESLint)
- YAML frontmatter validation
- Whitespace normalization
```

**Format**:
- Type: `ci:` (for CI/automation commits)
- Subject: Brief description
- Body: Bulleted list of what was fixed

### Comment Formatting

All feedback comments use consistent structure and emoji:

```markdown
## 🤖 CodeRabbit Auto-Fix Report

Processed **{count}** CodeRabbit feedback item(s).

### Auto-Fixes Applied:
- ✅ Code formatting (Prettier)
- ✅ Linting rules (ESLint)
- ✅ YAML frontmatter validation
- ✅ Trailing whitespace removal
- ✅ File newline standardization

Changes have been committed to this branch. Please re-review if needed.

---
*This was an automated response to CodeRabbit feedback.*
```

**Emoji Convention**:
- 🤖 for main auto-fix report
- ✅ for successful fixes
- 🔍 for validation checks
- ⚠️ for warnings/issues

### Tool Installation & Usage

Standard tools are installed in a single step to avoid duplication:

```yaml
- name: Install linting tools
  run: |
    npm install --save-dev \
      eslint \
      prettier \
      yaml \
      @babel/parser \
      @babel/core
```

Each tool runs separately with clear step separation:

```yaml
- name: Run Prettier
  run: npx prettier --write "**/*.{js,json,yaml,yml,md}" || true

- name: Run ESLint auto-fix
  run: npx eslint --fix "**/*.js" --max-warnings 0 2>/dev/null || true
```

### Validation Scripts

Required validation scripts live in `.github/scripts/`:

1. **validate-frontmatter.js** - Validates YAML frontmatter in agents, skills, commands
2. **fix-common-issues.js** - Fixes common issues (trailing whitespace, line endings)
3. **check-file-sizes.js** - Ensures files don't exceed size limits
4. **check-blocked-files.js** - Prevents committing sensitive files
5. **verify-agent-consistency.js** - Ensures agent naming and configuration consistency

## Workflow Specifications

### 1. Validate PR Workflow

**File**: `.github/workflows/validate-pr.yml`

**Trigger**: PR open, synchronize, reopen

**Permissions**: read contents, write pull-requests

**Purpose**: Security and structural validation before code review

**Steps**:
1. Checkout code
2. Setup Node.js 18
3. Validate frontmatter (YAML)
4. Check file sizes
5. Check for blocked files (credentials, secrets)
6. Verify agent/skill/command consistency
7. Comment validation results

**Key Points**:
- Read-only on contents (no auto-fix)
- Always comments results regardless of success
- Should complete in < 1 minute
- Can block merge if critical issues found

### 2. CodeRabbit Auto-Fix Workflow

**File**: `.github/workflows/coderabbit-auto-fix.yml`

**Trigger**: PR open, synchronize, reopen

**Permissions**: write contents, write pull-requests

**Purpose**: Automatically fix formatting and linting issues

**Steps**:
1. Checkout code
2. Setup Node.js 18
3. Configure git (KellerAI CI)
4. Fetch PR comments to check for CodeRabbit feedback
5. Conditionally install tools (only if feedback exists)
6. Run Prettier formatting
7. Run ESLint auto-fix
8. Validate frontmatter
9. Check common issues
10. Commit changes if any
11. Comment summary

**Key Points**:
- Runs on PR creation/update, not on demand
- Checks for CodeRabbit feedback before running fixes
- Skips expensive tool installation if no feedback
- Commits with proper git identity
- Creates summary comment for visibility

### 3. CodeRabbit Feedback Handler Workflow

**File**: `.github/workflows/coderabbit-feedback.yml`

**Trigger**: issue_comment created, pull_request_review_comment created

**Permissions**: write contents, write pull-requests

**Purpose**: React to CodeRabbit comments with automated fixes

**Steps**:
1. Checkout code
2. Setup Node.js 18
3. Configure git (KellerAI CI)
4. Install dependencies
5. Run auto-fix tools (Prettier, ESLint)
6. Validate fixes
7. Commit if changes
8. Reply to comment

**Key Points**:
- Only runs if comment is from CodeRabbit bot
- Should be fast (tools pre-loaded)
- Replies directly to the comment thread
- Complements auto-fix workflow

## Implementation Checklist

For each project, ensure:

- [ ] `.github/workflows/validate-pr.yml` exists with standard structure
- [ ] `.github/workflows/coderabbit-auto-fix.yml` exists with standard structure
- [ ] `.github/workflows/coderabbit-feedback.yml` exists with standard structure
- [ ] `.github/scripts/` directory exists with all required validation scripts
- [ ] Git config uses `KellerAI CI` / `ci@kellerai.dev`
- [ ] Commit messages follow `ci: apply CodeRabbit feedback` format
- [ ] Comments use standard emoji and formatting
- [ ] Node.js version is consistent (18)
- [ ] Action versions are consistent (checkout@v4, setup-node@v4, github-script@v7)

## Project-Specific Configuration

Projects can customize:

1. **Which validation scripts run** (e.g., not all need agent validation)
2. **File patterns for tools** (e.g., different source directories)
3. **Tool configurations** (ESLint/Prettier rules per-project)

But MUST maintain:
1. Git identity consistency
2. Commit message format
3. Comment format and emoji
4. Tool versions
5. Action versions

## Validation Scripts Template

Each script should:

1. Be Node.js based (runs in workflow)
2. Exit with code 0 on success, non-zero on failure
3. Use clear console output for logging
4. Support CI environment variables
5. Have no external dependencies beyond npm packages

Example:

```javascript
// .github/scripts/validate-frontmatter.js
const fs = require('fs');
const path = require('path');

const agentDirs = [
  'agents',
  'skills',
  'commands'
];

let hasErrors = false;

agentDirs.forEach(dir => {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

  files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    // Validate YAML frontmatter
    if (!content.startsWith('---')) {
      console.error(`❌ Missing frontmatter in ${dir}/${file}`);
      hasErrors = true;
    }
  });
});

process.exit(hasErrors ? 1 : 0);
```

## Rollout Plan

1. **Phase 1** (Complete): Document standard in this file
2. **Phase 2** (Next): Create shared validation scripts repository
3. **Phase 3** (Next): Update all projects to use standardized workflows
4. **Phase 4** (Optional): Create GitHub Actions composite action for shared steps

## Maintenance

- Review this standard quarterly
- Update tool versions when new releases are available
- Sync changes across all projects when standards change
- Document any project-specific deviations with rationale
