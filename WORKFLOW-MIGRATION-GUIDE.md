# Automated Review Workflow - Migration Guide

This guide helps migrate projects to use standardized automated review workflows.

## Quick Start (5 minutes)

For most KellerAI projects, migration involves:

1. Copy standardized workflow files to your project
2. Update git identity if needed
3. Add validation scripts
4. Test on a PR

## Step-by-Step Migration

### 1. Copy Workflow Files

Copy these three workflow files to your project's `.github/workflows/` directory:

```bash
# From reaper-lint project
cp -r .github/workflows/*.yml /path/to/your/project/.github/workflows/
```

**Files to copy:**
- `coderabbit-auto-fix.yml` - Automatic fixing on PR open/update
- `coderabbit-feedback.yml` - Reactive fixing on CodeRabbit comments
- `validate-pr.yml` - PR validation and security checks

### 2. Copy Validation Scripts

Copy the scripts directory:

```bash
cp -r .github/scripts /path/to/your/project/.github/
```

**Scripts included:**
- `validate-frontmatter.js` - Validates YAML frontmatter
- `fix-common-issues.js` - Fixes whitespace and line endings
- `check-file-sizes.js` - Enforces file size limits
- `check-blocked-files.js` - Prevents sensitive files
- `verify-agent-consistency.js` - Verifies naming consistency

### 3. Update Git Identity (if needed)

In your workflow files, the git identity is set to:

```yaml
git config --global user.name "KellerAI CI"
git config --global user.email "ci@kellerai.dev"
```

This is the **standard for all KellerAI projects**. If your project uses a different identity, update these lines in:
- `coderabbit-auto-fix.yml` (lines 27-30)
- `coderabbit-feedback.yml` (lines 31-33)

### 4. Customize Validation Scripts (Optional)

Edit validation scripts if your project structure differs:

**Example: Skip frontmatter validation if no agents/skills/commands**

In `.github/scripts/validate-frontmatter.js`, modify the directories to check:

```javascript
const dirsToCheck = ['agents', 'skills'] // Remove 'commands' if not used
  .filter(dir => fs.existsSync(path.join(process.cwd(), dir)));
```

**Example: Adjust file size limits**

In `.github/scripts/check-file-sizes.js`:

```javascript
const SIZE_LIMITS = {
  default: 2 * 1024 * 1024, // Increase to 2 MB if needed
  images: 500 * 1024,
  videos: 0
};
```

### 5. Test the Workflows

Create a test PR to verify workflows run correctly:

1. Create a test branch with a small change
2. Push and open a PR
3. Check that workflows run:
   - "Validate PR Content" should pass/comment
   - "Process CodeRabbit Feedback" should run
4. Verify comment formatting is correct
5. If CodeRabbit comments, verify auto-fix workflow responds

### 6. Commit and Merge

```bash
git add .github/
git commit -m "ci: standardize automated review workflows

- Add standard validate-pr workflow
- Add standard coderabbit-auto-fix workflow
- Add standard coderabbit-feedback workflow
- Add validation scripts (frontmatter, file sizes, blocked files, etc)
- Use KellerAI CI standard git identity
- Implement consistent comment formatting and commit messages
"
git push
# Create PR and merge
```

## Project-Specific Customizations

Some projects may need customizations:

### No Agent/Skill/Command Structure

If your project doesn't use agents, skills, or commands:

**Option 1:** Remove validation from scripts

```bash
# Edit validate-frontmatter.js to remove directories you don't use
const dirsToCheck = ['agents'] // Only check agents
```

**Option 2:** Skip validation step

Edit `.github/workflows/validate-pr.yml` and remove the step:

```yaml
# Remove this step if not needed:
- name: Validate frontmatter
  run: |
    npm install --save-dev yaml
    node .github/scripts/validate-frontmatter.js
```

### Different Node Version

If your project requires a different Node version (default is 18):

Edit both workflow files and change:

```yaml
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change from '18' to your version
```

### Different ESLint/Prettier Configuration

Workflows use your project's existing configuration files:

- `.eslintrc.*` - ESLint config
- `.prettierrc*` - Prettier config
- `.editorconfig` - Editor config

No changes needed if these files exist. Scripts will use them automatically.

### Skip Linting for Specific Files

Some projects don't need linting (e.g., generated code, markdown):

Edit `.github/workflows/coderabbit-auto-fix.yml`:

```yaml
- name: Run ESLint auto-fix
  run: |
    npx eslint \
      --fix \
      "**/*.js" \
      --ignore-pattern "generated/**" \
      --ignore-pattern "migrations/**" \
      --max-warnings 0 2>/dev/null || true
```

## Troubleshooting

### Workflow doesn't run

**Check**: GitHub Actions are enabled for your repository
- Go to Settings → Actions → General
- Ensure "Allow all actions and reusable workflows" is selected

### Validate PR step fails

**Common causes:**
1. `.github/scripts/` directory missing → Copy scripts from reaper-lint
2. YAML module not installed → Workflow installs it automatically
3. Frontmatter validation too strict → Customize the script

**Check logs:**
1. Go to PR → Checks tab
2. Click "Validate PR Content" → "Validate PR Content"
3. Look at "Validate frontmatter" step output

### CodeRabbit Auto-Fix commits but shouldn't

The workflow checks if CodeRabbit has commented before running fixes.

**Verify:**
1. Does the PR have any CodeRabbit comments?
2. Check the "Fetch PR comments for feedback" step output
3. If no comments, workflow should skip the fix step

### Commit message is wrong

Check git config in workflow:

```yaml
- name: Configure git
  run: |
    git config --global user.name "KellerAI CI"
    git config --global user.email "ci@kellerai.dev"
```

The name/email in commits must match these values exactly.

### Comments appear malformed

Check the workflow file's comment script. Common issues:

1. **Missing newlines**: Comment script should use `.join('\n')`
2. **Emoji not displaying**: Update to standard emoji set
3. **Wrong PR number**: Ensure `PR_NUMBER` is set correctly

See `WORKFLOWS-STANDARD.md` for standard comment format.

## Checking Migration Success

After migration, verify:

**Checklist:**

- [ ] Three workflow files exist in `.github/workflows/`
- [ ] Five validation scripts exist in `.github/scripts/`
- [ ] Test PR created with validation check passing
- [ ] Workflow ran and commented on PR
- [ ] Git commits use "KellerAI CI" identity
- [ ] Commit messages follow standard format
- [ ] Comment uses standard emoji and formatting
- [ ] No lint warnings or errors in workflow logs

## Reporting Issues

If you encounter issues during migration:

1. Check the Troubleshooting section above
2. Run validation scripts locally: `node .github/scripts/validate-frontmatter.js`
3. Review workflow logs in GitHub Actions tab
4. Check that tool versions match:
   - Node.js: 18
   - actions/checkout: v4
   - actions/setup-node: v4
   - actions/github-script: v7

## Keeping Workflows Updated

As tool versions or standards change:

1. Check `WORKFLOWS-STANDARD.md` for updates
2. Update workflow files in your project
3. Update validation scripts if new requirements added
4. Commit changes with `ci:` prefix

Example:

```bash
git commit -m "ci: update workflow tool versions

- Update ESLint to latest
- Update Prettier to latest
- Update Node.js to 20
"
```

## Questions or Feedback

For questions about the standardization:

1. Review `WORKFLOWS-STANDARD.md` - comprehensive reference
2. Check `WORKFLOW-MIGRATION-GUIDE.md` (this file) - implementation help
3. Compare with existing reaper-lint workflows - working example
4. Review specific workflow files - detailed comments

---

**Last Updated**: November 2024
**Standard Version**: 1.0
