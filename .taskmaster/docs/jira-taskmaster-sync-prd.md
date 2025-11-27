# PRD: Jira-TaskMaster Bidirectional Sync

## Executive Summary

A bidirectional synchronization system between Jira (enterprise PM tool) and TaskMaster (AI-native task management) that enables PMs to work in Jira while developers leverage TaskMaster's AI capabilities, maintaining perfect consistency across both systems.

---

## Problem Statement

### Current Pain Points

1. **Dual Entry Hell**: PMs track work in Jira; developers track in TaskMaster. Neither sees the other's updates.
2. **Status Drift**: Task marked "done" in TaskMaster remains "In Progress" in Jira for days.
3. **Lost Context**: Rich subtask details in TaskMaster never surface in Jira; PM reports lack granularity.
4. **Manual Reconciliation**: Weekly sync meetings to reconcile status across systems.

### Business Impact

- 2-4 hours/week per developer on manual status updates
- PM dashboards perpetually stale (24-48 hour lag)
- Sprint retrospectives based on incomplete data
- Audit trail gaps for compliance reporting

---

## Solution Overview

### Architecture: Source-of-Truth Model

```
                    ┌─────────────────────────────────────────┐
                    │              SYNC ENGINE                │
                    │  (Bidirectional, Conflict-Aware)        │
                    └─────────────────────────────────────────┘
                              ▲                    ▲
                              │                    │
                    ┌─────────┴────────┐  ┌───────┴─────────┐
                    │      JIRA        │  │   TASKMASTER    │
                    │  (PM Interface)  │  │ (Dev Interface) │
                    │                  │  │                 │
                    │  Epic → Task     │  │  Task → Subtask │
                    │  Story → Task    │  │  AI-Generated   │
                    │  Subtask → Sub   │  │  Expansions     │
                    └──────────────────┘  └─────────────────┘
```

### Sync Direction Rules

| Field | Jira → TM | TM → Jira | Conflict Resolution |
|-------|-----------|-----------|---------------------|
| Title/Summary | Initial | Updates | Last-write-wins |
| Description | Initial | Never | Jira authoritative |
| Status | Always | Always | Status mapping table |
| Priority | Always | Never | Jira authoritative |
| Subtasks | Never | Always | TM authoritative |
| Time Estimates | Always | Updates | Average on conflict |
| Comments | Always | Always | Append-only merge |
| Custom Fields | Configurable | Configurable | Config-defined |

---

## TDD Specifications

### Test Suite 1: Connection & Authentication

```yaml
test_suite: connection_authentication
tests:
  - id: CONN-001
    name: Valid Jira API token authentication
    given: Valid JIRA_API_TOKEN, JIRA_EMAIL, JIRA_URL in environment
    when: sync_engine.connect()
    then:
      - Returns connection object
      - connection.authenticated == true
      - connection.user matches JIRA_EMAIL
    acceptance: Must pass before any sync operations

  - id: CONN-002
    name: Invalid token rejection
    given: Invalid JIRA_API_TOKEN
    when: sync_engine.connect()
    then:
      - Raises AuthenticationError
      - Error message contains "401" or "Unauthorized"
      - No partial connection state
    acceptance: Security requirement - fail fast on bad auth

  - id: CONN-003
    name: Project access verification
    given: Valid auth, JIRA_PROJECT_KEY="PLUG"
    when: sync_engine.verify_project_access("PLUG")
    then:
      - Returns project metadata
      - project.key == "PLUG"
      - project.issue_types contains ["Epic", "Story", "Task", "Sub-task"]
    acceptance: Must verify project exists and is accessible

  - id: CONN-004
    name: Custom field discovery
    given: Valid auth and project access
    when: sync_engine.discover_custom_fields("PLUG")
    then:
      - Returns list of custom fields
      - Each field has: id, name, type, options (if select)
      - Maps field names to IDs for later use
    acceptance: Required for field mapping configuration
```

### Test Suite 2: Jira → TaskMaster Sync

```yaml
test_suite: jira_to_taskmaster
tests:
  - id: J2T-001
    name: Epic imports as parent task
    given:
      - Jira Epic "PLUG-100" with title "Auth System"
      - Epic has 3 child Stories
    when: sync_engine.import_epic("PLUG-100")
    then:
      - TaskMaster task created with id pattern "jira-PLUG-100"
      - task.title == "Auth System"
      - task.metadata.jira_key == "PLUG-100"
      - task.metadata.jira_type == "Epic"
      - 3 subtasks created for child Stories
    acceptance: Epic hierarchy preserved in TaskMaster

  - id: J2T-002
    name: Story imports with all standard fields
    given:
      - Jira Story "PLUG-101"
      - Fields: summary, description, status="In Progress", priority="High"
      - Assignee: developer@company.com
    when: sync_engine.import_issue("PLUG-101")
    then:
      - TaskMaster task created
      - task.title == Story.summary
      - task.description == Story.description
      - task.status == "in-progress" (mapped from Jira)
      - task.priority == "high" (mapped from Jira)
      - task.metadata.assignee == "developer@company.com"
    acceptance: All mappable fields transferred

  - id: J2T-003
    name: Custom fields import correctly
    given:
      - Jira Story with custom fields:
        - Readiness = "Complete"
        - Origin = "KellerAI Native"
        - Quality Rating = 85
    when: sync_engine.import_issue_with_custom_fields("PLUG-102")
    then:
      - task.metadata.readiness == "Complete"
      - task.metadata.origin == "KellerAI Native"
      - task.metadata.quality_rating == 85
    acceptance: Custom field mapping works per configuration

  - id: J2T-004
    name: Status mapping translates correctly
    given:
      - Jira statuses: "To Do", "In Progress", "In Review", "Done"
      - Status mapping config defined
    when: sync_engine.map_status("In Review", direction="jira_to_tm")
    then:
      - Returns "in-progress" (TaskMaster equivalent)
      - Logs mapping for audit trail
    acceptance: |
      Mapping table:
        "To Do" → "pending"
        "In Progress" → "in-progress"
        "In Review" → "in-progress"
        "Done" → "done"
        "Blocked" → "blocked"

  - id: J2T-005
    name: Incremental sync only fetches changes
    given:
      - Last sync timestamp: 2024-01-15T10:00:00Z
      - 5 issues updated since last sync
      - 95 issues unchanged
    when: sync_engine.incremental_sync(since="2024-01-15T10:00:00Z")
    then:
      - Only 5 issues fetched from Jira API
      - API calls use JQL: updated >= "2024-01-15 10:00"
      - Unchanged tasks not modified
    acceptance: Performance - avoid full sync overhead
```

### Test Suite 3: TaskMaster → Jira Sync

```yaml
test_suite: taskmaster_to_jira
tests:
  - id: T2J-001
    name: Status change propagates to Jira
    given:
      - TaskMaster task "jira-PLUG-101" with status "in-progress"
      - Linked to Jira Story "PLUG-101" with status "In Progress"
    when:
      - task-master set-status --id=jira-PLUG-101 --status=done
      - sync_engine.push_changes()
    then:
      - Jira PLUG-101 transitions to "Done"
      - Transition uses correct workflow transition ID
      - Jira updated_at reflects change
    acceptance: Status sync within 60 seconds of change

  - id: T2J-002
    name: Subtask creation syncs to Jira
    given:
      - TaskMaster task "jira-PLUG-101" linked to Jira "PLUG-101"
      - No subtasks exist
    when:
      - task-master expand --id=jira-PLUG-101 --research
      - Creates 5 subtasks via AI expansion
      - sync_engine.push_changes()
    then:
      - 5 Jira Sub-tasks created under PLUG-101
      - Each subtask has title from TaskMaster
      - Each subtask linked back to TaskMaster via custom field
    acceptance: AI-generated subtasks visible to PM

  - id: T2J-003
    name: Implementation notes sync as comments
    given:
      - TaskMaster task "jira-PLUG-101"
      - update-subtask called with implementation notes
    when:
      - task-master update-subtask --id=jira-PLUG-101.1 --prompt="Implemented JWT validation using jose library"
      - sync_engine.push_changes()
    then:
      - Jira comment added to PLUG-101
      - Comment prefixed with "[TaskMaster] Subtask 1:"
      - Comment contains implementation notes
    acceptance: Dev context surfaces in PM view

  - id: T2J-004
    name: Bulk status update on task completion
    given:
      - TaskMaster task with 5 subtasks
      - 4 subtasks marked done, 1 remaining
    when:
      - task-master set-status --id=jira-PLUG-101.5 --status=done
      - All subtasks now done
      - sync_engine.push_changes()
    then:
      - Parent task auto-transitions to "done"
      - Jira Epic/Story transitions to "Done"
      - Summary comment added listing all completed subtasks
    acceptance: Roll-up logic works correctly

  - id: T2J-005
    name: Conflict detection on concurrent edits
    given:
      - TaskMaster task updated at T1
      - Same Jira issue updated at T2 (T2 > T1)
      - Sync runs at T3
    when: sync_engine.detect_conflicts("jira-PLUG-101")
    then:
      - Returns conflict object
      - conflict.type == "concurrent_modification"
      - conflict.local_timestamp == T1
      - conflict.remote_timestamp == T2
      - conflict.fields == ["status"] (or whatever changed)
    acceptance: No silent overwrites
```

### Test Suite 4: Bidirectional Sync

```yaml
test_suite: bidirectional_sync
tests:
  - id: BI-001
    name: Full sync reconciles both directions
    given:
      - 10 tasks in TaskMaster (5 with Jira links)
      - 15 issues in Jira project
      - 3 have diverged states
    when: sync_engine.full_sync(project="PLUG")
    then:
      - All 15 Jira issues represented in TaskMaster
      - 5 existing links preserved (not duplicated)
      - 3 conflicts reported for manual resolution
      - Sync report generated with change summary
    acceptance: Idempotent - running twice produces same result

  - id: BI-002
    name: Webhook-triggered real-time sync
    given:
      - Jira webhook configured for issue updates
      - TaskMaster file watcher on tasks.json
    when:
      - Jira issue PLUG-101 status changed via UI
      - Webhook fires to sync endpoint
    then:
      - TaskMaster task updated within 5 seconds
      - No polling required
      - Webhook payload logged for debugging
    acceptance: Near real-time sync for active development

  - id: BI-003
    name: Dry run mode previews changes
    given:
      - Pending changes in both directions
      - dry_run=true flag set
    when: sync_engine.sync(dry_run=true)
    then:
      - Returns change preview without applying
      - Preview shows: additions, updates, deletions
      - No API writes to Jira
      - No file writes to TaskMaster
    acceptance: Safe preview before destructive operations

  - id: BI-004
    name: Selective field sync respects config
    given:
      - Config: sync_fields = ["status", "priority"]
      - Task has changes to: status, priority, description
    when: sync_engine.push_changes()
    then:
      - Only status and priority synced to Jira
      - Description change ignored (per config)
      - Audit log shows "description excluded by config"
    acceptance: Fine-grained control over sync scope
```

### Test Suite 5: Error Handling & Recovery

```yaml
test_suite: error_handling
tests:
  - id: ERR-001
    name: Network failure with retry
    given:
      - Valid sync operation pending
      - Network fails on first attempt
    when: sync_engine.push_changes()
    then:
      - Retries 3 times with exponential backoff
      - Backoff: 1s, 2s, 4s
      - If all fail, raises SyncError with details
      - Pending changes preserved for next attempt
    acceptance: Transient failures don't lose data

  - id: ERR-002
    name: Jira workflow transition blocked
    given:
      - Task status changed to "done"
      - Jira workflow requires "In Review" before "Done"
    when: sync_engine.transition_issue("PLUG-101", "Done")
    then:
      - Detects blocked transition
      - Returns WorkflowBlockedError
      - Error includes: available_transitions, required_fields
      - Suggests intermediate transition path
    acceptance: Helpful error messages for workflow issues

  - id: ERR-003
    name: Rate limit handling
    given:
      - Bulk sync of 500 issues
      - Jira rate limit: 100 requests/minute
    when: sync_engine.bulk_sync(issues=500)
    then:
      - Respects rate limits automatically
      - Uses exponential backoff on 429 responses
      - Completes all 500 within reasonable time
      - Progress reported during long operation
    acceptance: Never gets IP banned from Jira

  - id: ERR-004
    name: Partial sync failure recovery
    given:
      - Syncing 10 issues
      - Issue 5 fails due to validation error
    when: sync_engine.batch_sync(issues=[1..10])
    then:
      - Issues 1-4 successfully synced
      - Issue 5 logged with error details
      - Issues 6-10 continue processing
      - Final report shows 9 success, 1 failure
    acceptance: One bad issue doesn't block others
```

### Test Suite 6: CLI Integration

```yaml
test_suite: cli_integration
tests:
  - id: CLI-001
    name: jira-sync command basic operation
    given: Valid environment configuration
    when: task-master jira-sync --project PLUG
    then:
      - Connects to Jira
      - Performs bidirectional sync
      - Outputs summary table of changes
      - Exit code 0 on success
    acceptance: Primary command works end-to-end

  - id: CLI-002
    name: jira-import creates tasks from Jira
    given:
      - Jira Epic PLUG-100 with 5 Stories
      - Empty TaskMaster tasks.json
    when: task-master jira-import --epic PLUG-100
    then:
      - Creates parent task for Epic
      - Creates 5 child tasks for Stories
      - Links all tasks to Jira keys
      - Outputs created task IDs
    acceptance: Bootstrap TaskMaster from existing Jira

  - id: CLI-003
    name: jira-push exports to Jira
    given:
      - TaskMaster tasks without Jira links
      - Target Jira project "PLUG"
    when: task-master jira-push --to-project PLUG --tasks 1,2,3
    then:
      - Creates Jira issues for each task
      - Links tasks to new Jira keys
      - Subtasks become Jira Sub-tasks
      - Returns mapping of task_id → jira_key
    acceptance: Export local work to PM system

  - id: CLI-004
    name: jira-status shows sync health
    given: Existing sync configuration
    when: task-master jira-status
    then:
      - Shows last sync timestamp
      - Shows pending local changes count
      - Shows pending remote changes count
      - Shows conflict count if any
      - Color-coded status indicators
    acceptance: Quick health check for developers
```

---

## Data Model

### TaskMaster Task with Jira Metadata

```json
{
  "id": "jira-PLUG-101",
  "title": "Implement user authentication",
  "description": "JWT-based auth with refresh tokens",
  "status": "in-progress",
  "priority": "high",
  "dependencies": ["jira-PLUG-100"],
  "metadata": {
    "jira": {
      "key": "PLUG-101",
      "type": "Story",
      "project": "PLUG",
      "epic_key": "PLUG-100",
      "status": "In Progress",
      "assignee": "developer@company.com",
      "last_synced": "2024-01-15T14:30:00Z",
      "local_version": 5,
      "remote_version": 4,
      "custom_fields": {
        "readiness": "In-Development",
        "origin": "KellerAI Native",
        "quality_rating": 75
      }
    }
  },
  "subtasks": [
    {
      "id": "jira-PLUG-101.1",
      "title": "Set up JWT middleware",
      "status": "done",
      "metadata": {
        "jira": {
          "key": "PLUG-102",
          "type": "Sub-task",
          "parent_key": "PLUG-101"
        }
      }
    }
  ]
}
```

### Sync Configuration Schema

```yaml
# .taskmaster/jira-sync.yaml
jira:
  url: https://company.atlassian.net
  project_key: PLUG

authentication:
  method: api_token  # or oauth2
  env_vars:
    email: JIRA_EMAIL
    token: JIRA_API_TOKEN

sync:
  direction: bidirectional  # or jira_to_tm, tm_to_jira
  interval_minutes: 5

  # What triggers sync
  triggers:
    - on_task_status_change
    - on_subtask_create
    - on_manual_command
    - on_webhook  # if configured

  # Field mapping
  fields:
    status:
      sync: bidirectional
      mapping:
        jira_to_tm:
          "To Do": pending
          "In Progress": in-progress
          "In Review": in-progress
          "Done": done
          "Blocked": blocked
        tm_to_jira:
          pending: "To Do"
          in-progress: "In Progress"
          done: "Done"
          blocked: "Blocked"
          deferred: "On Hold"

    priority:
      sync: jira_to_tm
      mapping:
        "Highest": critical
        "High": high
        "Medium": medium
        "Low": low
        "Lowest": low

    description:
      sync: jira_to_tm  # Jira is authoritative

    subtasks:
      sync: tm_to_jira  # TaskMaster AI generates, push to Jira

  custom_fields:
    - jira_field: "customfield_10001"  # Readiness
      tm_field: metadata.readiness
      sync: bidirectional

    - jira_field: "customfield_10002"  # Origin
      tm_field: metadata.origin
      sync: jira_to_tm

    - jira_field: "customfield_10003"  # Quality Rating
      tm_field: metadata.quality_rating
      sync: tm_to_jira

conflict_resolution:
  strategy: last_write_wins  # or prompt_user, jira_wins, tm_wins
  audit_conflicts: true
  conflict_report_path: .taskmaster/reports/sync-conflicts.json

rate_limiting:
  max_requests_per_minute: 60
  batch_size: 50
  retry_attempts: 3
  retry_backoff_seconds: [1, 2, 4]
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Jira REST API client with authentication
- [ ] Connection testing and project discovery
- [ ] Basic field mapping infrastructure
- [ ] CLI scaffolding (`jira-sync`, `jira-status`)

**Exit Criteria:** All Test Suite 1 (CONN-*) tests pass

### Phase 2: Import Flow (Week 3-4)
- [ ] Epic/Story/Task import from Jira
- [ ] Status mapping implementation
- [ ] Custom field support
- [ ] Incremental sync (JQL-based)

**Exit Criteria:** All Test Suite 2 (J2T-*) tests pass

### Phase 3: Export Flow (Week 5-6)
- [ ] Status change push to Jira
- [ ] Subtask creation sync
- [ ] Comment/notes sync
- [ ] Workflow transition handling

**Exit Criteria:** All Test Suite 3 (T2J-*) tests pass

### Phase 4: Bidirectional & Polish (Week 7-8)
- [ ] Full bidirectional sync
- [ ] Conflict detection and resolution
- [ ] Dry run mode
- [ ] Webhook support (optional)

**Exit Criteria:** All Test Suite 4 (BI-*) tests pass

### Phase 5: Production Hardening (Week 9-10)
- [ ] Error handling and recovery
- [ ] Rate limiting
- [ ] Partial failure handling
- [ ] CLI polish and help text

**Exit Criteria:** All Test Suite 5 (ERR-*) and 6 (CLI-*) tests pass

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Sync Latency | < 60 seconds | Time from change to sync |
| Data Accuracy | 99.9% | Fields match post-sync |
| Conflict Rate | < 1% | Conflicts / total syncs |
| Developer Time Saved | 2+ hours/week | Survey + time tracking |
| PM Dashboard Freshness | < 5 min lag | Jira updated_at vs actual |

---

## Dependencies

### Required
- Jira Cloud instance with REST API access
- TaskMaster 0.17+ with JSON task storage
- Node.js 18+ or Python 3.10+

### Optional
- Jira webhook endpoint (for real-time sync)
- Agent Mail integration (for sync notifications)
- Episodic Memory (for learning common patterns)

---

## Security Considerations

1. **API Token Storage**: Use environment variables, never commit tokens
2. **Audit Trail**: Log all sync operations for compliance
3. **Least Privilege**: Request only required Jira scopes
4. **Data Filtering**: Option to exclude sensitive fields from sync
5. **Rate Limiting**: Prevent accidental DoS of Jira instance

---

## Open Questions

1. **Webhook vs Polling**: Should we prioritize webhook support or polling is sufficient?
2. **Subtask Depth**: Jira only supports one level of subtasks - how to handle TaskMaster's unlimited nesting?
3. **Bulk Operations**: What's the maximum batch size before we need pagination?
4. **Offline Support**: Should we queue changes when Jira is unreachable?

---

*PRD Version: 1.0*
*Author: Claude Code*
*Last Updated: 2024-01-15*
