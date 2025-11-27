# Workflow Standardization - Implementation Checklist

Use this checklist when standardizing a new project or verifying an existing one.

## Pre-Migration

- [ ] Read `WORKFLOWS-STANDARD.md` for requirements
- [ ] Read `WORKFLOW-MIGRATION-GUIDE.md` for steps
- [ ] Review your project's current workflows (if any)
- [ ] Identify project-specific needs (different node version, custom file patterns, etc.)
- [ ] Get approval to make changes to CI/CD

## File Setup

### Workflow Files
- [ ] `.github/workflows/validate-pr.yml` copied from reaper-lint
- [ ] `.github/workflows/coderabbit-auto-fix.yml` copied from reaper-lint
- [ ] `.github/workflows/coderabbit-feedback.yml` copied from reaper-lint
- [ ] All workflow files are in `.github/workflows/` directory

### Validation Scripts
- [ ] `.github/scripts/` directory exists
- [ ] `.github/scripts/validate-frontmatter.js` exists
- [ ] `.github/scripts/fix-common-issues.js` exists
- [ ] `.github/scripts/check-file-sizes.js` exists
- [ ] `.github/scripts/check-blocked-files.js` exists
- [ ] `.github/scripts/verify-agent-consistency.js` exists
- [ ] All scripts are executable (if needed)

### Configuration Files
- [ ] `.github/workflows-config.json` exists (optional, for reference)
- [ ] Project has `.eslintrc.*` or uses default
- [ ] Project has `.prettierrc*` or uses default
- [ ] `.gitignore` excludes `.env*` and sensitive files

## Customization

### Project Structure
- [ ] Identify if project uses agents/skills/commands
  - [ ] Yes → Keep `validate-frontmatter.js` as-is
  - [ ] No → Customize or remove from validate-pr.yml
- [ ] Identify source directories
  - [ ] Default (root-level) → No change needed
  - [ ] Custom (e.g., `src/`) → Update tool patterns in workflows
- [ ] Identify build/dist directories to exclude from validation

### Node.js Version
- [ ] Default (18) → No change
- [ ] Custom version → Update in both workflows
  - [ ] coderabbit-auto-fix.yml line ~25
  - [ ] coderabbit-feedback.yml line ~26
  - [ ] validate-pr.yml line ~24

### Tool Versions
- [ ] actions/checkout → v4 (standard)
- [ ] actions/setup-node → v4 (standard)
- [ ] actions/github-script → v7 (standard)
- [ ] All versions match standard (see WORKFLOWS-STANDARD.md)

### File Patterns
- [ ] Prettier patterns match your source files
  - [ ] Default: `**/*.{js,json,yaml,yml,md}` → OK
  - [ ] Custom → Update in coderabbit-auto-fix.yml line ~65
- [ ] ESLint patterns match your source files
  - [ ] Default: `**/*.js` → OK
  - [ ] Custom → Update in coderabbit-auto-fix.yml line ~66

### Size Limits (Optional)
- [ ] File size limits appropriate for your project
  - [ ] Default (1 MB) → OK
  - [ ] Custom → Update in check-file-sizes.js

## Standard Compliance

### Git Configuration
- [ ] Workflow uses `git config --global user.name "KellerAI CI"`
- [ ] Workflow uses `git config --global user.email "ci@kellerai.dev"`
- [ ] Both coderabbit workflows have identical git config
- [ ] Validate PR workflow does not commit (read-only)

### Commit Messages
- [ ] Auto-fix commits start with `ci: apply CodeRabbit feedback`
- [ ] Commit includes bulleted list of fixes
- [ ] Commit author is `KellerAI CI <ci@kellerai.dev>`
- [ ] Example format in WORKFLOWS-STANDARD.md section "Commit Messages"

### Comment Formatting
- [ ] Comments use 🤖 emoji for main report
- [ ] Comments use ✅ emoji for successful fixes
- [ ] Comments use 🔍 emoji for validation checks
- [ ] Comments use ⚠️ emoji for warnings
- [ ] Comments include standard structure (see WORKFLOWS-STANDARD.md)
- [ ] Comments end with "*This was an automated response...*"

### Permissions
- [ ] Validate PR: `contents: read, pull-requests: write`
- [ ] Auto-Fix: `contents: write, pull-requests: write`
- [ ] Feedback: `contents: write, pull-requests: write`

## Testing

### Initial Test (5-10 minutes)

1. Create test branch with small change
   ```bash
   git checkout -b test/workflows
   echo "# Test" > test.md
   git add test.md
   git commit -m "test: create test file"
   git push -u origin test/workflows
   ```

2. Create PR on GitHub
   - [ ] Go to GitHub
   - [ ] Create Pull Request from test/workflows
   - [ ] Wait for "Validate PR Content" workflow
   - [ ] Check it completes (pass or fail, doesn't matter for initial test)
   - [ ] Verify comment was created

3. Check workflow results
   - [ ] Go to PR
   - [ ] Go to "Checks" tab
   - [ ] Verify "Validate PR Content" shows results
   - [ ] Verify comment is visible on PR timeline
   - [ ] Verify comment format matches standard

4. Cleanup
   - [ ] Close PR without merging
   - [ ] Delete branch: `git branch -D test/workflows`
   - [ ] Delete remote: `git push origin --delete test/workflows`

### Validation Test (if applicable)

If project has agents/skills/commands:

1. Check that frontmatter validation works
   - [ ] Go to validate-pr.yml
   - [ ] Look for "Validate frontmatter" step
   - [ ] Verify it runs without errors

2. Check that file size validation works
   - [ ] Go to check-file-sizes.js
   - [ ] Verify default limits are appropriate
   - [ ] Create file slightly over limit to test (then remove)

3. Check that blocked files validation works
   - [ ] Go to check-blocked-files.js
   - [ ] Verify patterns match your project's sensitive files
   - [ ] Create .env file to test (then remove)

### CodeRabbit Integration Test

Once workflows pass validation test:

1. Make a PR with formatting issues
   - [ ] Create branch with non-standard formatting
   - [ ] Push and create PR
   - [ ] Wait for CodeRabbit to comment

2. Verify auto-fix workflow responds
   - [ ] Check "CodeRabbit Auto-Fix" workflow ran
   - [ ] Verify it created a commit with auto-fixes
   - [ ] Verify comment was created

3. Verify feedback workflow can respond
   - [ ] Add a comment to CodeRabbit's feedback
   - [ ] Verify "CodeRabbit Feedback Handler" workflow ran
   - [ ] Verify it responded with comment

## Documentation

### Project Documentation
- [ ] Project README updated with workflow description
- [ ] CLAUDE.md updated (if exists) with workflow info
- [ ] Documentation mentions where to find standards (link to reaper-lint)

### Standards Compliance
- [ ] Project does not deviate from standard without documented reason
- [ ] Any deviations documented in project's documentation
- [ ] Link to WORKFLOWS-STANDARD.md included

## Final Verification

### Checklist Complete?
- [ ] All workflow files in place
- [ ] All validation scripts in place
- [ ] Git configuration matches standard
- [ ] Commit message format matches standard
- [ ] Comment format matches standard
- [ ] Permissions set correctly
- [ ] Initial test passed
- [ ] Validation tests passed (if applicable)
- [ ] CodeRabbit integration test passed
- [ ] Documentation updated

### Ready to Commit?
- [ ] Create PR with your changes
- [ ] Verify workflows run on this PR
- [ ] Get review approval
- [ ] Merge to main

### Post-Merge Verification
- [ ] Delete test branch
- [ ] Monitor next few PRs for workflow behavior
- [ ] Verify comments format correctly
- [ ] Verify commits use correct author
- [ ] No workflow failures in action logs

## Common Issues

### Validation Scripts Not Found
- [ ] Check `.github/scripts/` directory exists
- [ ] Check all 5 scripts are present
- [ ] Check Node.js can find them (run `node .github/scripts/validate-frontmatter.js` locally)

### Wrong Git Author in Commits
- [ ] Check workflow line ~28 (auto-fix) or ~31 (feedback)
- [ ] Verify it uses `git config --global user.name "KellerAI CI"`
- [ ] Verify it uses `git config --global user.email "ci@kellerai.dev"`
- [ ] May take next PR to see effect

### Comments Not Appearing
- [ ] Check `GITHUB_TOKEN` permission (should be implicit)
- [ ] Check workflow ran successfully
- [ ] Check "Process CodeRabbit Feedback" step output
- [ ] Verify PR permissions allow comments

### Tool Not Finding Files
- [ ] Check Prettier/ESLint patterns in workflow
- [ ] Verify patterns match your file locations
- [ ] Run tools locally to verify they work
- [ ] Check `.eslintignore` and `.prettierignore` aren't too broad

## Sign-Off

Project Lead: _________________ Date: _______

Project Name: _________________________________

Version: 1.0 ☐ Custom: ________________

Notes:
_____________________________________________________________
_____________________________________________________________

---

**Keep this checklist for future reference.**

Questions? See:
- WORKFLOWS-STANDARD.md - comprehensive reference
- WORKFLOW-MIGRATION-GUIDE.md - detailed steps and troubleshooting
- STANDARDIZATION-ANALYSIS.md - why standardization matters
