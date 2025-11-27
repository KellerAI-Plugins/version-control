---
description: Fix CodeRabbit findings across specified PRs with optional account/org switching and automatic conversation resolution
model: claude-sonnet-4-5-20250929
allowed-tools: Task, AskUserQuestion
---

# Fix CodeRabbit Findings

Queries CodeRabbit findings on specified PRs, applies fixes to correct feature branches, and optionally resolves conversation threads. Handles multi-account and multi-org GitHub setups seamlessly.

## Usage

```bash
# Review findings without fixing
/fix-coderabbit-findings --prs 6,7 --review-only

# Apply fixes automatically
/fix-coderabbit-findings --prs 6,7 --auto-fix

# Apply fixes and resolve conversations
/fix-coderabbit-findings --prs 6,7 --auto-fix --resolve

# Switch to different GitHub account
/fix-coderabbit-findings --account KellerAI-Plugins --prs 6,7 --auto-fix

# Process all open PRs in organization
/fix-coderabbit-findings --account KellerAI-Plugins --org your-org --all-open --auto-fix --resolve

# Process all open PRs in current repo
/fix-coderabbit-findings --all-open --auto-fix
```

## Parameters

- `--prs NUMBER,NUMBER,...`: Specific PR numbers to process (e.g., `--prs 6,7,8`)
- `--all-open`: Process all open PRs with CodeRabbit findings (optional, default: false)
- `--account ACCOUNT`: Switch GitHub account (KellerAI-Plugins, personal, etc.) (optional)
- `--org ORG`: Process specific organization (optional)
- `--review-only`: Show findings without applying fixes (optional, default: false)
- `--auto-fix`: Apply fixes automatically (optional, default: interactive)
- `--resolve`: Resolve conversation threads after fixing (optional, default: false)

## What Gets Done

**Query Phase** (always runs):
- Scans specified PRs for CodeRabbit reviews
- Categorizes findings: already fixed vs remaining
- Shows summary of work needed

**Fix Phase** (if `--auto-fix` or user selects):
- Identifies which feature branch each finding affects
- Reads affected files with full context
- Applies fixes using intelligent code understanding
- Commits with descriptive messages linking to PR and finding details
- Pushes all updated branches to remote

**Resolution Phase** (if `--resolve`):
- Queries GitHub GraphQL for all review threads
- Filters for CodeRabbit conversation threads
- Marks unresolved threads as resolved
- Verifies all conversations are closed

## Example Session

```
$ /fix-coderabbit-findings --prs 6,7 --auto-fix --resolve

Querying CodeRabbit findings...
✓ PR #6: 5 findings found (3 already fixed, 2 remaining)
✓ PR #7: 1 finding found (0 already fixed, 1 remaining)

Total: 7 findings | Already fixed: 3 | Remaining: 4

Applying 4 remaining fixes...
✓ feature/github-actions-automation: 1 fix
  - YAML syntax in validate-pr.yml (line 54)

✓ feature/universal-agent-protocol-skill: 1 fix
  - JavaScript syntax in SKILL.md (line 212)

✓ feature/universal-agent-protocol: 2 fixes
  - Missing repository URLs in marketplace.json ×2

Summary: 4 fixes applied | 3 branches updated | All pushed

Resolving conversation threads...
✓ PR #6: 2 threads marked as resolved
✓ PR #7: 1 thread marked as resolved

=== ALL COMPLETE ===
Total findings: 7
Fixed in this session: 4
Already fixed: 3
Conversations resolved: 3
```

## How It Coordinates Fixes Across Branches

When findings span multiple feature branches:

1. Identifies which branch each file belongs to
2. Switches to each branch (maintaining git state)
3. Applies fix to that branch specifically
4. Commits with branch context in message
5. Pushes branch individually
6. Reports which branches were updated

Example: If findings are in files on 3 different branches:
- `feature/github-actions-automation` (1 file)
- `feature/universal-agent-protocol-skill` (1 file)
- `feature/universal-agent-protocol` (2 files)

The agent intelligently applies fixes to each and pushes all 3.

## Multi-Account Support

Switch between GitHub accounts for different organizations:

```bash
# Current account (uses GITHUB_TOKEN)
/fix-coderabbit-findings --prs 6,7

# Switch to KellerAI-Plugins account
/fix-coderabbit-findings --account KellerAI-Plugins --prs 6,7

# Switch to personal account
/fix-coderabbit-findings --account personal-account --prs 3,4
```

Each invocation independently switches context and operates in that account.

## When to Use Each Mode

| Mode | Use When | Example |
|------|----------|---------|
| `--review-only` | You want to see what needs fixing before committing | `--prs 6,7 --review-only` |
| `--auto-fix` | Findings are straightforward and need fixing | `--prs 6,7 --auto-fix` |
| `--auto-fix --resolve` | You want complete atomic workflow (fix + close) | `--prs 6,7 --auto-fix --resolve` |
| `--all-open` | Process entire org repos in one command | `--org your-org --all-open --auto-fix` |

## Integration

This command integrates with:
- **Claude Code**: Uses MorphLLM for intelligent file editing
- **GitHub API**: Queries CodeRabbit reviews and resolves conversations
- **Git**: Handles branch switching and commits
- **TaskMaster**: Links fixes to task IDs (in commit messages)
- **Agent Mail**: Notifies about progress (optional)
- **Episodic Memory**: Learns common CodeRabbit patterns

## Troubleshooting

**"No CodeRabbit findings detected"**
- Verify PR numbers are correct
- Check PR has CodeRabbit reviews (may be rate-limited)
- Try `--review-only` first to see all reviews

**"Could not find affected file in any branch"**
- File may have been deleted or moved
- Verify the file path is correct
- Check which branches currently have the file

**"GitHub authentication failed"**
- Run `gh auth login` to re-authenticate
- Verify GITHUB_TOKEN is set correctly
- Use `gh auth status` to check current account

**"Fix conflicts with existing code"**
- Agent will report specific conflict location
- May need manual resolution
- Run again after manually fixing conflict

---

Delegates to `coderabbit-orchestrator` agent for actual workflow execution.
