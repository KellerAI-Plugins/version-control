---
name: coderabbit-workflow
description: Complete CodeRabbit feedback processing workflow - query findings, apply fixes, resolve conversations with multi-account/org support
---

# CodeRabbit Workflow: End-to-End Automation

**The problem you solve:** Manually querying CodeRabbit, identifying findings, typing fixes, and resolving conversations is repetitive friction. This workflow makes it atomic.

**The solution:** One command processes all CodeRabbit findings across multiple PRs, applies fixes, and resolves conversations.

---

## Core Workflow Steps

### Phase 1: Query & Categorize (Automated)

```bash
# List all open PRs
gh pr list --state open

# For each PR, query CodeRabbit reviews
gh pr view <NUMBER> --json reviews | \
  jq '.reviews[] | select(.author.login == "coderabbitai")'

# Extract findings:
# - Severity (Critical, Major, Minor)
# - File and line number
# - Issue type (syntax, style, security, etc.)
# - Suggested fix
```

**Goal:** Build a findings inventory with:
- Which findings are already fixed (check commits)
- Which findings need action
- Which findings affect which branches

### Phase 2: Smart Fix Application

For each unresolved finding:

1. **Identify affected file**
   ```bash
   # Check which branches have the file
   git branch --contains <file>
   ```

2. **Read and understand the issue**
   ```bash
   # Examine the exact location
   sed -n '<line-start>,<line-end>p' <file>
   ```

3. **Apply fix to correct branch**
   ```bash
   git checkout <feature-branch>
   # Edit file (using MorphLLM tools)
   git add <file>
   ```

4. **Commit with context**
   ```bash
   git commit -m "fix: <finding-type> - <description>

   Resolves CodeRabbit finding in PR #<number>
   - Issue: <what was wrong>
   - Fix: <what changed>
   - Branch: feature/<specific-branch>"
   ```

5. **Push immediately**
   ```bash
   git push origin <feature-branch>
   ```

### Phase 3: Conversation Resolution (via GraphQL)

After all fixes are applied:

1. **Query review threads**
   ```bash
   gh api graphql -f query='
   query {
     repository(owner: "ACCOUNT", name: "REPO") {
       pullRequest(number: PR_NUMBER) {
         reviewThreads(first: 100) {
           nodes {
             id
             isResolved
           }
         }
       }
     }
   }'
   ```

2. **Resolve unresolved threads**
   ```bash
   gh api graphql -f threadId="THREAD_ID" -f query='
   mutation($threadId: ID!) {
     resolveReviewThread(input: {threadId: $threadId}) {
       thread { isResolved }
     }
   }'
   ```

3. **Verify all resolved**
   ```bash
   # Check that isResolved: true for all threads
   ```

---

## Multi-Account & Organization Support

This workflow handles:

**Multiple GitHub Accounts:**
- Primary account (personal)
- Organization account (KellerAI-Plugins)
- Switch via `GITHUB_TOKEN` or gh config

**Multiple Organizations:**
- KellerAI-Plugins orgs
- Your personal orgs
- Each repo may be in different account/org

**Configuration Pattern:**
```bash
# Switch context for each repo
gh auth switch --hostname github.com --user <account>

# Or use gh api with explicit account
gh api repos/<ACCOUNT>/<REPO>/pulls/<NUMBER>
```

---

## Integration with Claude Code Components

### TaskMaster Linking
Each CodeRabbit fix can link to a TaskMaster task:
```bash
# Commit message includes task ID
git commit -m "fix: YAML syntax

Fixes CodeRabbit finding in PR #6
Related task: task-X.Y"
```

### Agent Mail Coordination
When fixing finds in multi-branch scenarios:
```
Notify team:
- Which findings were found
- Which branches got fixes
- Which are still pending
- When conversations will be resolved
```

### Episodic Memory
Store findings pattern for future:
```
Learned: CodeRabbit patterns in [project]
- Common issues: YAML indentation, missing URLs
- Standard fixes: [pattern matches]
- Resolution time: [typical duration]
```

---

## Example: Processing 7 CodeRabbit Findings

**Initial State:**
```
PR #6: 5 CodeRabbit findings
  - YAML syntax (validate-pr.yml)
  - JavaScript syntax (SKILL.md)
  - Missing URLs (3× marketplace.json)

PR #7: 1 CodeRabbit finding
  - Missing URL (marketplace.json)

PR #8, #9: No CodeRabbit findings
```

**Workflow Execution:**
```
1. Query both PRs
   ✓ 6 findings found, 1 already fixed

2. Identify affected branches
   validate-pr.yml → feature/github-actions-automation
   SKILL.md → feature/universal-agent-protocol-skill
   marketplace.json × 3 → feature/universal-agent-protocol

3. Apply fixes
   ✓ feature/github-actions-automation: 1 fix
   ✓ feature/universal-agent-protocol-skill: 1 fix
   ✓ feature/universal-agent-protocol: 3 fixes

4. Commit and push
   ✓ All branches updated

5. Resolve conversations
   ✓ PR #6: 5 threads → isResolved: true
   ✓ PR #7: 1 thread → isResolved: true
```

**Result:**
```
All CodeRabbit findings addressed
Conversation threads marked resolved
PRs ready for review/merge
```

---

## When to Use This Workflow

✅ **Use this when:**
- You have CodeRabbit findings across multiple PRs
- Findings span different feature branches
- You need atomic fix application and resolution
- You switch between GitHub accounts/orgs

❌ **Skip this when:**
- Only fixing a single file in one branch
- Manual editing is simpler than querying
- You're reviewing findings (use `--review-only` flag)

---

## Quick Reference Commands

```bash
# Process specific PRs with auto-fix
/fix-coderabbit-findings --prs 6,7 --auto-fix

# Review findings without fixing
/fix-coderabbit-findings --prs 6,7 --review-only

# Process all open PRs in current repo
/fix-coderabbit-findings --all-open --auto-fix

# Switch accounts and process
/fix-coderabbit-findings --account KellerAI-Plugins --prs 6,7

# Process organization repos
/fix-coderabbit-findings --account KellerAI-Plugins --org your-org --all-open
```

---

## Integration Points

- **GitHub GraphQL API**: Query findings, resolve conversations
- **Git CLI**: Branch switching, commits, push
- **Claude Code**: File editing, code understanding
- **TaskMaster**: Link fixes to tasks
- **Agent Mail**: Coordinate with team
- **Episodic Memory**: Learn patterns
