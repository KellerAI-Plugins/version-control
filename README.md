# Version Control Plugin

**Unified GitHub coordination engine** that makes CodeRabbit feedback → fix → resolve a seamless, atomic workflow.

## Problem

You're constantly typing the same repetitive commands:
1. Query CodeRabbit findings across multiple PRs
2. Switch between feature branches
3. Apply fixes to the right files
4. Commit and push
5. Query GitHub GraphQL for review threads
6. Resolve conversations

This is friction that slows down precision code development.

## Solution

**One command handles everything:**

```bash
/fix-coderabbit-findings --prs 6,7 --auto-fix --resolve
```

Result: Findings fixed, commits pushed, conversations resolved.

## Features

✅ **Query CodeRabbit Findings** - Across multiple PRs, multiple accounts/orgs  
✅ **Smart Fix Application** - Applies fixes to correct feature branches  
✅ **Atomic Commits** - Single logical commit per fix  
✅ **Conversation Resolution** - Via GitHub GraphQL mutations  
✅ **Multi-Account Support** - Switch between GitHub accounts seamlessly  
✅ **Multi-Org Support** - Handle repos across different organizations  
✅ **Integration Ready** - Works with TaskMaster, Agent Mail, episodic memory  

## Quick Start

```bash
# See what CodeRabbit found
/fix-coderabbit-findings --prs 6,7 --review-only

# Apply fixes automatically
/fix-coderabbit-findings --prs 6,7 --auto-fix

# Apply fixes AND resolve conversations
/fix-coderabbit-findings --prs 6,7 --auto-fix --resolve

# Switch accounts
/fix-coderabbit-findings --account KellerAI-Plugins --prs 6,7

# Process entire organization
/fix-coderabbit-findings --account KellerAI-Plugins --org your-org --all-open
```

## What Gets Automated

### Query & Analyze
- Scan specified PRs for CodeRabbit reviews
- Identify all findings with severity levels
- Check which findings are already fixed
- Show summary of remaining work

### Fix Application
- Read affected files
- Understand issues in context
- Apply fixes to appropriate feature branches
- Commit with descriptive message
- Push to remote

### Conversation Resolution
- Query GitHub GraphQL for review threads
- Resolve each thread via mutation
- Verify all conversations marked as resolved

### Integration
- Link fixes to TaskMaster tasks
- Send Agent Mail notifications
- Store patterns in episodic memory
- Track work across sessions

## Architecture

```
commands/
  ├── fix-coderabbit-findings.md    # Main entry point
  ├── resolve-reviews.md
  ├── pr-status.md
  └── sync-accounts.md

agents/
  ├── coderabbit-orchestrator.md    # Core workflow engine
  ├── pr-coordinator.md
  └── branch-manager.md

skills/
  ├── coderabbit-workflow/          # Complete workflow guide
  ├── github-graphql-operations/    # GraphQL helper patterns
  ├── pr-fixing-patterns/           # Common fix templates
  └── multi-account-coordination/   # Account switching logic
```

## Example: Actual Usage

**Session starts:**
```
User: /fix-coderabbit-findings --prs 6,7 --auto-fix --resolve
```

**Agent processes:**
```
✓ Querying PR #6 CodeRabbit findings...
  Found 5 findings (3 already fixed, 2 remaining)

✓ Querying PR #7 CodeRabbit findings...
  Found 1 finding (not yet fixed)

✓ Applying fixes...
  ✓ feature/github-actions-automation: 1 fix
  ✓ feature/universal-agent-protocol-skill: 1 fix
  ✓ feature/universal-agent-protocol: 1 fix

✓ Pushing branches...
  ✓ 3 branches updated

✓ Resolving conversations...
  ✓ PR #6: 5 threads resolved
  ✓ PR #7: 1 thread resolved

Summary:
  Total findings: 7
  Findings fixed: 4
  Findings already fixed: 3
  Conversations resolved: 6
```

## Integration with Your Tools

**Claude Code**: Uses MorphLLM for intelligent file editing  
**TaskMaster**: Links fixes to task IDs, updates task status  
**Agent Mail**: Notifies team about findings and fixes  
**Episodic Memory**: Learns patterns, improves over time  
**GitHub GraphQL**: Queries findings and resolves conversations  

## Design Philosophy

1. **Eliminate friction** - No manual querying, branch switching, or repetitive typing
2. **Atomic operations** - Fix, commit, push, resolve in one operation
3. **Context aware** - Understands which file goes with which branch
4. **Multi-account ready** - Seamlessly switch between accounts/orgs
5. **Learning system** - Improves with each session

## Why This Matters

When CodeRabbit feedback becomes automatic and frictionless, you:
- Respond to feedback faster
- Maintain code precision without sacrificing velocity
- Reduce cognitive load from context switching
- Keep focus on what matters: shipping quality code

This plugin turns CodeRabbit from a blocker into a seamless part of your development workflow.

## Next Steps

- [ ] Install plugin in Claude Code settings
- [ ] View available commands with `/help`
- [ ] Run first command: `/fix-coderabbit-findings --prs <number> --review-only`
- [ ] Apply fixes: `/fix-coderabbit-findings --prs <number> --auto-fix`
- [ ] Check integration docs in CLAUDE.md

---

**Unlocking precision at scale:** When feedback loops are instantaneous and frictionless, engineering excellence becomes the default.
