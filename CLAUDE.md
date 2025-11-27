# Version Control Plugin - Integration Guide

## Overview

The **version-control** plugin is a unified GitHub coordination engine that transforms CodeRabbit feedback from repetitive manual work into a single atomic workflow.

**Core Insight:** You were typing the same queries, edits, commits, and GraphQL mutations repeatedly. This plugin makes that a single command.

## What This Solves

### Before
```bash
# Manual process (what you were doing)
1. Query PR #6 for CodeRabbit findings
2. Read the YAML file mentioned in finding
3. Identify the syntax issue
4. Switch to feature/github-actions-automation branch
5. Edit the file
6. Commit with message
7. Push to remote
8. Repeat for 6 more findings across different branches
9. Query review thread IDs
10. Run GraphQL mutation for each thread
11. Verify all resolved
```

### After
```bash
# Atomic command (what this plugin enables)
/fix-coderabbit-findings --prs 6,7 --auto-fix --resolve

# Result: All findings fixed, commits pushed, conversations resolved
```

## Core Components

### Commands

**\`/fix-coderabbit-findings\`** - Main entry point
- Queries CodeRabbit findings across specified PRs
- Shows summary of what's already fixed vs needs fixing
- Applies remaining fixes with optional auto-mode
- Resolves conversation threads
- Supports multi-account switching

### Agents

**\`coderabbit-orchestrator\`** - Handles the actual workflow
- Queries GitHub GraphQL for findings
- Coordinates fixes across multiple feature branches
- Manages branch switching and atomic commits
- Resolves conversations via GraphQL mutations
- Tracks progress with episodic memory

### Skills

**\`coderabbit-workflow\`** - Defines the complete process
- Step-by-step workflow documentation
- Integration points with Claude Code, TaskMaster, Agent Mail
- Multi-account/org coordination patterns
- Examples and quick reference

## Multi-Account & Organization Support

This plugin handles your dual GitHub setup:

\`\`\`yaml
Accounts:
  - KellerAI-Plugins (organization account)
  - Personal account

Organizations:
  - KellerAI-Plugins orgs
  - Your personal orgs
  - Each repo may be in different account/org
\`\`\`

**Usage:**
\`\`\`bash
# Default: Uses GITHUB_TOKEN and current context
/fix-coderabbit-findings --prs 6,7

# Switch accounts
/fix-coderabbit-findings --account KellerAI-Plugins --prs 6,7

# Switch organization
/fix-coderabbit-findings --account KellerAI-Plugins --org your-org --all-open
\`\`\`

## Integration with Your Workflow

### Claude Code
- Uses MorphLLM tools for intelligent file editing
- Understands context from actual code
- Applies fixes semantically, not just string matching

### TaskMaster
- Links CodeRabbit fixes to task IDs
- Updates task status when findings are resolved
- Tracks work across sessions

### Agent Mail
- Notifies team about findings and fixes
- Coordinates across multiple agents
- Sends handoff messages when switching context

### Episodic Memory
- Learns common CodeRabbit patterns in your repos
- Stores solution templates
- Predicts fixes for recurring issues

## Example Usage Patterns

### Pattern 1: Quick Fix Session
\`\`\`bash
# See what CodeRabbit found
/fix-coderabbit-findings --prs 6,7 --review-only

# If findings look straightforward
/fix-coderabbit-findings --prs 6,7 --auto-fix
\`\`\`

### Pattern 2: Multi-Branch Coordination
\`\`\`bash
# Fixes span multiple feature branches
# Agent automatically handles branch switching
/fix-coderabbit-findings --prs 6,7 --auto-fix --resolve

# Result: All branches updated, all conversations resolved
\`\`\`

### Pattern 3: Cross-Account Work
\`\`\`bash
# Working across KellerAI-Plugins and personal repos
/fix-coderabbit-findings --account KellerAI-Plugins --prs 6,7
/fix-coderabbit-findings --account personal-account --prs 3,4
\`\`\`

### Pattern 4: Organization-Wide
\`\`\`bash
# Process all open PRs with findings in entire org
/fix-coderabbit-findings --account KellerAI-Plugins --org your-org --all-open
\`\`\`

## Architecture

\`\`\`
version-control/
├── .claude-plugin/
│   ├── plugin.json          # Plugin manifest
│   └── marketplace.json     # Marketplace registration
│
├── commands/
│   ├── fix-coderabbit-findings.md    # Main command entry
│   ├── resolve-reviews.md             # Resolve conversations
│   ├── pr-status.md                   # Show PR status
│   └── sync-accounts.md               # Switch GitHub accounts
│
├── agents/
│   ├── coderabbit-orchestrator.md    # Main orchestration
│   ├── pr-coordinator.md              # PR management
│   └── branch-manager.md              # Branch coordination
│
├── skills/
│   ├── coderabbit-workflow/           # Core workflow skill
│   ├── github-graphql-operations/     # GraphQL helpers
│   ├── pr-fixing-patterns/            # Common fix patterns
│   └── multi-account-coordination/    # Account switching
│
├── scripts/                            # Executable automation
├── references/                         # Deep documentation
└── CLAUDE.md                          # This file
\`\`\`

## Future Enhancements

- **Auto-detection:** Watch open PRs and auto-queue findings
- **Pattern learning:** Learn your common CodeRabbit issues
- **Batch processing:** Group similar findings across repos
- **Custom rules:** Define acceptable issue types per repo
- **Team workflows:** Coordinate findings across team
- **Dashboard:** Real-time status of all findings and fixes

## Quick Start

1. **Activate the plugin** in your Claude Code settings
2. **View available commands:** \`/help\` or check commands/ directory
3. **Try the main command:** \`/fix-coderabbit-findings --prs <number>\`
4. **Review findings:** Use \`--review-only\` flag first
5. **Apply fixes:** Use \`--auto-fix\` flag for atomic processing

## Key Design Principles

1. **Atomic Operations**: Fix, commit, push, resolve in one operation
2. **Multi-Account Ready**: Seamlessly switch between accounts/orgs
3. **No Manual Typing**: Eliminate repetitive GraphQL queries and branch switching
4. **Integration-First**: Works with TaskMaster, Agent Mail, episodic memory
5. **Learning System**: Improves with each session via episodic memory

This plugin transforms CodeRabbit from a friction point into a seamless part of your rapid development workflow.
