# Automated Review Workflows - Complete Documentation

This directory contains standardized automated review workflows for KellerAI projects.

## 📋 Documentation Files

### **WORKFLOWS-STANDARD.md** ← START HERE
Complete reference documenting:
- Overview of three workflows
- Standardization rules (git, commits, comments, tools)
- Detailed workflow specifications
- Validation script requirements
- Implementation checklist
- Rollout plan

**For**: Understanding what the standard is, why it exists, and what all projects must follow.

### **WORKFLOW-MIGRATION-GUIDE.md**
Step-by-step guide to migrate a project:
- Quick start (5 minutes)
- Copy files and scripts
- Customize for your project
- Test on a PR
- Troubleshooting common issues

**For**: Migrating your project to use standardized workflows.

### **This file (WORKFLOWS-README.md)**
You are here. Quick orientation guide.

## 🚀 Quick Reference

### Three Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **Validate PR** | `validate-pr.yml` | PR open/update | Security & structure checks |
| **CodeRabbit Auto-Fix** | `coderabbit-auto-fix.yml` | PR open/update | Auto-fix formatting/linting |
| **CodeRabbit Feedback** | `coderabbit-feedback.yml` | Comment created | React to CodeRabbit feedback |

### Five Validation Scripts

| Script | Purpose |
|--------|---------|
| `validate-frontmatter.js` | Validates YAML frontmatter in agents/skills/commands |
| `fix-common-issues.js` | Fixes trailing whitespace, line endings, missing newlines |
| `check-file-sizes.js` | Enforces size limits (1 MB default, 500 KB images) |
| `check-blocked-files.js` | Prevents sensitive files (.env, keys, credentials) |
| `verify-agent-consistency.js` | Checks naming and metadata consistency |

### Standard Rules

**Git Configuration**
```yaml
user.name: "KellerAI CI"
user.email: "ci@kellerai.dev"
```

**Commit Format**
```
ci: apply CodeRabbit feedback

- Code formatting (Prettier)
- Linting rules (ESLint)
- [etc...]
```

**Comment Format**
```markdown
## 🤖 CodeRabbit Auto-Fix Report
[standard structure with ✅, 🔍, ⚠️ emoji]
```

## 📊 Current Status

### Standardized Projects
- ✅ **reaper-lint** - Complete
- ✅ **chief-of-staff** - Complete
- 🔄 **thinking-memory** - Partial

### Migration Needed
- 📝 **dev-tools** - Has workflows, needs standardization
- 📝 **docling-preppy** - Has workflows, needs standardization
- 📝 **kellerai-agentos-chatbot** - Has workflows, needs standardization
- 📝 **pipeline-master** - Has workflows, needs standardization
- 📝 **prospect-classify** - Has workflows, needs standardization
- 📝 **Other projects** - Need setup

## 🛠️ Getting Started

### I'm Migrating a Project
→ Read **WORKFLOW-MIGRATION-GUIDE.md**
1. Copy files from reaper-lint
2. Run on test PR
3. Verify workflows run
4. Merge to main

### I'm Understanding the Standard
→ Read **WORKFLOWS-STANDARD.md**
- Comprehensive reference
- All rules and specifications
- Implementation requirements

### I'm Creating a New Project
→ Copy this structure:
```
.github/
├── workflows/
│   ├── validate-pr.yml
│   ├── coderabbit-auto-fix.yml
│   └── coderabbit-feedback.yml
└── scripts/
    ├── validate-frontmatter.js
    ├── fix-common-issues.js
    ├── check-file-sizes.js
    ├── check-blocked-files.js
    └── verify-agent-consistency.js
```

### I'm Checking What's Different in My Project
→ Compare your files with:
- `reaper-lint/.github/workflows/` - Template workflows
- `reaper-lint/.github/scripts/` - Template scripts

## 🎯 Key Principles

### Why Standardization?
1. **Consistency** - Same behavior across all projects
2. **Maintainability** - Changes apply everywhere
3. **Onboarding** - New projects know what to implement
4. **Trust** - Standard processes are well-tested

### What's Required
- ✅ Git identity (KellerAI CI)
- ✅ Commit message format
- ✅ Comment emoji and format
- ✅ Tool versions

### What's Customizable
- 🔧 File patterns for tools
- 🔧 ESLint/Prettier rules (per-project config)
- 🔧 Validation scripts (can be skipped if not needed)
- 🔧 Node version (if different from 18)

## 📞 Common Questions

**Q: Do I need to migrate my project?**
A: If it has automated workflows, yes. See WORKFLOW-MIGRATION-GUIDE.md to get started.

**Q: What if my project structure is different?**
A: Customize the validation scripts. See "Validate Frontmatter" section in WORKFLOW-MIGRATION-GUIDE.md.

**Q: Can I use different tools?**
A: The standard specifies Prettier + ESLint. If your project uses different tools, modify the workflow steps.

**Q: What if I don't have agents/skills/commands?**
A: Comment out or remove the `validate-frontmatter.js` step from `validate-pr.yml`.

**Q: How often are workflows updated?**
A: Quarterly review scheduled. Subscribe to updates in #engineering-workflows.

## 🔗 Related Files

- `.github/workflows-config.json` - Project configuration reference
- `WORKFLOWS-STANDARD.md` - Comprehensive standard documentation
- `WORKFLOW-MIGRATION-GUIDE.md` - Step-by-step migration instructions

## 📈 Metrics

Track standardization adoption:

```
Target: All KellerAI projects standardized
Progress:
  - 2/2 core projects complete (reaper-lint, chief-of-staff)
  - 3/5 beta projects need migration
  - 0/? other projects identified
```

## 🚨 Important

**Never manually edit**:
1. Workflow trigger conditions without consensus
2. Git identity without updating WORKFLOWS-STANDARD.md
3. Commit message format without documented reason

**Always**:
1. Test changes on a test PR first
2. Document any project-specific deviations
3. Keep WORKFLOWS-STANDARD.md in sync

---

**Version**: 1.0
**Last Updated**: November 2024
**Maintainer**: Engineering Workflows
**Questions?** Check WORKFLOWS-STANDARD.md or WORKFLOW-MIGRATION-GUIDE.md
