---
name: repo-initialization
description: Use when creating new repositories or initializing existing directories with KellerAI standards. Provides step-by-step workflow for TaskMaster setup, Claude Code configuration, MCP server integration, and standard directory structure.
---

# Repository Initialization Skill

Complete workflow for initializing repositories to KellerAI standards. Ensures consistent setup across all projects with proper TaskMaster configuration, Claude Code integration, and standard tooling.

## When to Use This Skill

- Creating a new project repository
- Converting an existing directory to KellerAI standards
- Setting up TaskMaster in a repository
- Configuring Claude Code for a project
- Adding MCP server configuration

## Prerequisites

Before starting, verify these tools are installed:

```bash
# Required
git --version          # Git for version control
gh --version           # GitHub CLI for repo operations
task-master --version  # TaskMaster for task management

# Verify Claude Code
claude --version       # Claude Code CLI
```

## Initialization Workflow

### Phase 1: Directory Structure

Create the standard directory tree:

```bash
# Core directories
mkdir -p .taskmaster/tasks
mkdir -p .taskmaster/docs
mkdir -p .taskmaster/reports
mkdir -p .taskmaster/templates
mkdir -p .claude/commands

# Plugin directories (all projects)
mkdir -p agents
mkdir -p commands
mkdir -p skills
mkdir -p scripts
mkdir -p references

# Plugin metadata (if --type plugin)
mkdir -p .claude-plugin
```

### Phase 2: TaskMaster Configuration

Create `.taskmaster/config.json`:

```json
{
  "models": {
    "main": {
      "provider": "claude-code",
      "modelId": "opus",
      "maxTokens": 32000,
      "temperature": 0.2
    },
    "research": {
      "provider": "claude-code",
      "modelId": "opus",
      "maxTokens": 32000,
      "temperature": 0.1
    },
    "fallback": {
      "provider": "claude-code",
      "modelId": "sonnet",
      "maxTokens": 64000,
      "temperature": 0.2
    }
  },
  "global": {
    "logLevel": "info",
    "debug": false,
    "defaultNumTasks": 10,
    "defaultSubtasks": 5,
    "defaultPriority": "medium",
    "projectName": "PROJECT_NAME_HERE",
    "responseLanguage": "English",
    "enableCodebaseAnalysis": true,
    "enableProxy": false,
    "defaultTag": "main"
  },
  "claudeCode": {}
}
```

Create `.taskmaster/tasks/tasks.json`:

```json
{
  "tasks": [],
  "metadata": {
    "createdAt": "TIMESTAMP",
    "version": "1.0.0"
  }
}
```

### Phase 3: Claude Code Configuration

Create `.claude/settings.json`:

```json
{
  "allowedTools": [
    "Edit",
    "Bash(task-master *)",
    "Bash(git add *)",
    "Bash(git commit *)",
    "Bash(git push *)",
    "Bash(git status)",
    "Bash(git diff *)",
    "Bash(npm run *)",
    "Bash(npm install *)",
    "mcp__task_master_ai__*",
    "mcp__plugin_morphllm_morphllm-mcp__*",
    "mcp__plugin_mindpilot_mindpilot__*",
    "mcp__serena__*",
    "mcp__clearthought__*",
    "mcp__episodic-memory__*"
  ]
}
```

### Phase 4: MCP Server Configuration

Create `.mcp.json`:

```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
      }
    },
    "morphllm": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-morphllm"],
      "env": {}
    },
    "mindpilot": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-mindpilot"],
      "env": {}
    }
  }
}
```

### Phase 5: Project Files

Create `.gitignore`:

```gitignore
# Environment
.env
.env.local
.env.*.local

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.swp
*.swo

# MCP (contains API keys)
.mcp.json

# Claude local settings
.claude/settings.local.json

# Logs
*.log
logs/

# Build outputs
dist/
build/
out/

# Test coverage
coverage/
.nyc_output/
```

Create `.env.template`:

```bash
# KellerAI Project Environment Template
# Copy to .env and fill in values - DO NOT commit .env

# Required for TaskMaster AI operations
ANTHROPIC_API_KEY=

# Optional: Research features
PERPLEXITY_API_KEY=

# GitHub (usually handled by gh CLI auth)
GITHUB_TOKEN=
```

Create `CLAUDE.md`:

```markdown
# PROJECT_NAME

## Overview

[Brief project description]

## Task Master AI Instructions

**Import Task Master's development workflow commands and guidelines:**
@./.taskmaster/CLAUDE.md

## Project-Specific Context

[Add project-specific instructions here]

## Key Directories

- `agents/` - Agent definitions
- `commands/` - Slash commands
- `skills/` - Skill workflows
- `scripts/` - Executable automation
- `references/` - Deep documentation

## Development Workflow

1. Check current task: `task-master next`
2. Review task details: `task-master show <id>`
3. Implement changes
4. Log progress: `task-master update-subtask --id=<id> --prompt="..."`
5. Complete task: `task-master set-status --id=<id> --status=done`
```

Create `README.md`:

```markdown
# PROJECT_NAME

[Brief description]

## Quick Start

```bash
# Install dependencies
npm install

# Start development
task-master next
```

## Project Structure

```
PROJECT_NAME/
├── .taskmaster/     # Task management
├── .claude/         # Claude Code config
├── agents/          # Agent definitions
├── commands/        # Slash commands
├── skills/          # Skill workflows
├── scripts/         # Automation
└── references/      # Documentation
```

## Development

This project uses TaskMaster for task management:

```bash
task-master list           # View all tasks
task-master next           # Get next task
task-master show <id>      # View task details
task-master set-status --id=<id> --status=done  # Complete task
```

## License

MIT
```

### Phase 6: Plugin Metadata (if --type plugin)

Create `.claude-plugin/plugin.json`:

```json
{
  "name": "PROJECT_NAME",
  "version": "1.0.0",
  "description": "PROJECT_DESCRIPTION",
  "author": "KellerAI",
  "license": "MIT",
  "repository": "https://github.com/KellerAI-Plugins/PROJECT_NAME",
  "keywords": [],
  "components": {
    "agents": [],
    "commands": [],
    "skills": []
  }
}
```

Create `.claude-plugin/marketplace.json`:

```json
{
  "slug": "PROJECT_NAME",
  "category": "development",
  "visibility": "public",
  "featured": false,
  "installMethod": "git",
  "installUrl": "https://github.com/KellerAI-Plugins/PROJECT_NAME"
}
```

### Phase 7: Git Initialization

```bash
# Initialize git
git init

# Add all files
git add .

# Initial commit
git commit -m "chore: initialize KellerAI repository structure"
```

### Phase 8: GitHub Repository (optional)

```bash
# Create GitHub repo (public)
gh repo create ORG/PROJECT_NAME --public --source=. --push

# Or create private repo
gh repo create ORG/PROJECT_NAME --private --source=. --push
```

## Verification Checklist

After initialization, verify:

- [ ] `.taskmaster/config.json` exists with claude-code provider
- [ ] `.taskmaster/tasks/tasks.json` exists (empty but valid)
- [ ] `.claude/settings.json` exists with tool allowlist
- [ ] `.mcp.json` exists (but gitignored)
- [ ] `.gitignore` includes all standard patterns
- [ ] `CLAUDE.md` exists with project context
- [ ] Git repository initialized
- [ ] Initial commit created

## Common Issues

### TaskMaster Not Finding Config

Ensure `projectName` in config.json matches the directory name.

### MCP Servers Not Connecting

Verify `.mcp.json` exists and Claude Code is restarted after changes.

### Git Remote Not Set

If `--github` wasn't used:
```bash
gh repo create OWNER/REPO --source=. --push
```

## Integration Points

This skill integrates with:

- **version-control:coderabbit-workflow** - CodeRabbit PR management
- **TaskMaster** - Task management and tracking
- **Episodic Memory** - Cross-session context
- **MorphLLM** - Fast code editing
