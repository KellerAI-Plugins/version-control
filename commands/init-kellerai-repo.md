---
description: Initialize a new repository with full KellerAI standards in a single command - TaskMaster, Claude Code config, MCP servers, and standard directory structure
model: claude-sonnet-4-5-20250929
allowed-tools: Task, Bash, Write, Read, Edit, AskUserQuestion
---

# Initialize KellerAI Repository

Single-command repository initialization that sets up a complete KellerAI-standards development environment. Creates all required directories, configuration files, and integrations in one atomic operation.

## Usage

```bash
# Initialize new repo in specified path
/init-kellerai-repo --name my-project --path ~/projects

# Initialize in current directory
/init-kellerai-repo --name my-project

# Initialize with specific project type
/init-kellerai-repo --name my-api --type plugin

# Initialize with GitHub repo creation
/init-kellerai-repo --name my-project --github --org KellerAI-Plugins
```

## Parameters

- `--name NAME`: Project name (required) - used for directory, TaskMaster config, package.json
- `--path PATH`: Parent directory for new repo (optional, default: current directory)
- `--type TYPE`: Project type (optional) - `plugin`, `api`, `library`, `app` (default: `app`)
- `--github`: Create GitHub repository (optional, default: false)
- `--org ORG`: GitHub organization for repo creation (optional, requires `--github`)
- `--private`: Make GitHub repo private (optional, default: public)

## What Gets Created

### Directory Structure

```
project-name/
├── .taskmaster/                    # TaskMaster configuration
│   ├── config.json                 # Claude-code provider, opus/sonnet models
│   ├── tasks/
│   │   └── tasks.json              # Empty task database
│   ├── docs/                       # PRD and documentation
│   ├── reports/                    # Complexity reports
│   └── templates/                  # Task templates
│
├── .claude/                        # Claude Code configuration
│   ├── settings.json               # Tool allowlist and preferences
│   └── commands/                   # Custom slash commands
│
├── .claude-plugin/                 # Plugin metadata (if --type plugin)
│   ├── plugin.json                 # Plugin manifest
│   └── marketplace.json            # Marketplace registration
│
├── agents/                         # Agent definitions
├── commands/                       # Slash commands
├── skills/                         # Skill workflows
├── scripts/                        # Executable automation
├── references/                     # Deep documentation
│
├── .mcp.json                       # MCP server configuration
├── .gitignore                      # Standard ignores
├── .env.template                   # Environment template (no secrets)
├── CLAUDE.md                       # Project context for Claude
└── README.md                       # Project documentation
```

### TaskMaster Configuration

```json
{
  "models": {
    "main": { "provider": "claude-code", "modelId": "opus", "maxTokens": 32000, "temperature": 0.2 },
    "research": { "provider": "claude-code", "modelId": "opus", "maxTokens": 32000, "temperature": 0.1 },
    "fallback": { "provider": "claude-code", "modelId": "sonnet", "maxTokens": 64000, "temperature": 0.2 }
  },
  "global": {
    "logLevel": "info",
    "debug": false,
    "defaultNumTasks": 10,
    "defaultSubtasks": 5,
    "defaultPriority": "medium",
    "projectName": "PROJECT_NAME",
    "responseLanguage": "English",
    "enableCodebaseAnalysis": true,
    "enableProxy": false,
    "defaultTag": "main"
  },
  "claudeCode": {}
}
```

### MCP Server Configuration

Standard MCP servers pre-configured:
- **MorphLLM**: Ultra-fast code editing
- **Mindpilot**: Diagram rendering
- **TaskMaster**: Task management
- **Serena**: Quality assurance
- **ClearThought**: Complex reasoning
- **Episodic Memory**: Cross-session context

### Claude Code Settings

```json
{
  "allowedTools": [
    "Edit",
    "Bash(task-master *)",
    "Bash(git *)",
    "Bash(npm run *)",
    "mcp__task_master_ai__*",
    "mcp__plugin_morphllm_morphllm-mcp__*"
  ]
}
```

### .gitignore

Standard ignores for KellerAI projects:
- `.env`, `.env.local`, `.env.*.local`
- `node_modules/`
- `.DS_Store`
- `*.log`
- `.mcp.json` (contains API keys)
- `.claude/settings.local.json`

## Example Session

```
$ /init-kellerai-repo --name awesome-api --type api --github --org KellerAI-Plugins

Initializing KellerAI repository: awesome-api

[1/8] Creating directory structure...
  ✓ .taskmaster/tasks/
  ✓ .taskmaster/docs/
  ✓ .taskmaster/reports/
  ✓ .taskmaster/templates/
  ✓ .claude/commands/
  ✓ agents/
  ✓ commands/
  ✓ skills/
  ✓ scripts/
  ✓ references/

[2/8] Writing TaskMaster configuration...
  ✓ .taskmaster/config.json (claude-code provider)
  ✓ .taskmaster/tasks/tasks.json (empty database)
  ✓ .taskmaster/CLAUDE.md (integration guide)

[3/8] Writing Claude Code configuration...
  ✓ .claude/settings.json (tool allowlist)

[4/8] Writing MCP configuration...
  ✓ .mcp.json (6 MCP servers configured)

[5/8] Writing project files...
  ✓ .gitignore
  ✓ .env.template
  ✓ CLAUDE.md
  ✓ README.md

[6/8] Initializing git repository...
  ✓ git init
  ✓ Initial commit

[7/8] Creating GitHub repository...
  ✓ gh repo create KellerAI-Plugins/awesome-api --public
  ✓ git remote add origin

[8/8] Pushing to remote...
  ✓ git push -u origin main

=== INITIALIZATION COMPLETE ===

Repository: ~/projects/awesome-api
GitHub: https://github.com/KellerAI-Plugins/awesome-api

Next steps:
1. cd ~/projects/awesome-api
2. Create your PRD: touch .taskmaster/docs/prd.md
3. Generate tasks: task-master parse-prd .taskmaster/docs/prd.md
4. Start development: task-master next
```

## Project Types

### `app` (default)
Standard application with full KellerAI structure.

### `plugin`
Claude Code plugin with additional files:
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- Pre-populated agents/, commands/, skills/ directories

### `api`
Backend API project with:
- `src/` directory structure
- API-specific CLAUDE.md context
- Testing configuration

### `library`
Reusable library with:
- `lib/` directory structure
- Package.json configuration
- Documentation templates

## Integration

Works with existing KellerAI ecosystem:
- **TaskMaster**: Pre-configured with claude-code provider
- **Episodic Memory**: Project context persisted across sessions
- **Agent Mail**: Ready for multi-agent coordination
- **MorphLLM**: Configured for fast code editing

## Troubleshooting

**"Directory already exists"**
- Use different path or name
- Or add `--force` to overwrite (caution: destructive)

**"GitHub authentication failed"**
- Run `gh auth login` first
- Verify with `gh auth status`

**"TaskMaster not found"**
- Install: `npm install -g task-master-ai`
- Verify: `task-master --version`

---

Delegates to `repo-initializer` agent for actual workflow execution.
