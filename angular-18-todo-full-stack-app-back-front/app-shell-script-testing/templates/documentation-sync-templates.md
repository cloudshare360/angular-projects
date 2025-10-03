# Documentation Synchronization Templates
# Generated: October 2, 2025
# Purpose: Templates for automatic documentation updates when requirements change

## Template Variables Available

### Global Variables
- `{{DATE}}` - Current date and time
- `{{TOTAL_REQUIREMENTS}}` - Total number of requirements
- `{{COMPLETED_REQUIREMENTS}}` - Number of completed requirements  
- `{{COMPLETION_PERCENTAGE}}` - Completion percentage
- `{{NEW_REQUIREMENTS}}` - List of newly added requirements
- `{{UPDATED_REQUIREMENTS}}` - List of requirements with status changes

### Testing Variables
- `{{MONGODB_TESTS}}` - MongoDB test count and status
- `{{EXPRESSJS_TESTS}}` - Express.js test count and status
- `{{FRONTEND_TESTS}}` - Frontend test count and status
- `{{INTEGRATION_TESTS}}` - Integration test count and status

## Template: Copilot Agent Chat Update

```markdown
## 📋 Requirement Tracking & Task Mapping

**Last Updated**: {{DATE}}  
**Source**: requirements.md  
**Auto-synchronized**: True  
**Completion**: {{COMPLETION_PERCENTAGE}}%  

### 🎯 Current Requirements Status
- **Total Requirements**: {{TOTAL_REQUIREMENTS}}
- **Completed**: {{COMPLETED_REQUIREMENTS}}
- **Pending**: {{TOTAL_REQUIREMENTS - COMPLETED_REQUIREMENTS}}

### 🆕 Recent Requirement Changes
{{#if NEW_REQUIREMENTS}}
#### Newly Added Requirements
{{#each NEW_REQUIREMENTS}}
- [ ] {{this}}
{{/each}}
{{/if}}

{{#if UPDATED_REQUIREMENTS}}
#### Updated Requirements  
{{#each UPDATED_REQUIREMENTS}}
- [x] {{this}}
{{/each}}
{{/if}}

### 🧪 Testing Tasks Generated
{{#each NEW_REQUIREMENTS}}
#### Testing for: {{this}}
- [ ] Backend API testing for {{this}}
- [ ] Frontend component testing for {{this}}
- [ ] Integration testing for {{this}}
- [ ] Validation testing for {{this}}

{{/each}}

### 🔄 Next Actions Required
1. **Update Testing Scripts**: Implement tests for new requirements
2. **Update Frontend Components**: Create/modify components for new features
3. **Update Backend APIs**: Implement/modify API endpoints
4. **Update Documentation**: Sync all related documentation

---
*Auto-updated by Task Synchronization Framework on {{DATE}}*
```

## Template: Project Status Tracker Update

```markdown
## 📊 PROGRESS METRICS (Updated {{DATE}})

### Overall Progress: {{COMPLETION_PERCENTAGE}}% Complete
- **Requirements Completion:** {{COMPLETED_REQUIREMENTS}}/{{TOTAL_REQUIREMENTS}} ({{COMPLETION_PERCENTAGE}}%) ✅
- **Testing Framework:** {{MONGODB_TESTS + EXPRESSJS_TESTS + FRONTEND_TESTS + INTEGRATION_TESTS}} tests implemented
- **Documentation:** Auto-synchronized with requirements

### Recent Progress Updates
{{#if NEW_REQUIREMENTS}}
#### 🆕 New Requirements Added ({{NEW_REQUIREMENTS.length}})
{{#each NEW_REQUIREMENTS}}
- [ ] {{this}}
{{/each}}
{{/if}}

{{#if UPDATED_REQUIREMENTS}}
#### ✅ Recently Completed ({{UPDATED_REQUIREMENTS.length}})
{{#each UPDATED_REQUIREMENTS}}
- [x] {{this}}
{{/each}}
{{/if}}

### 🧪 Testing Coverage Updates
- **MongoDB Testing**: {{MONGODB_TESTS}} scenarios
- **Express.js BDD Testing**: {{EXPRESSJS_TESTS}} scenarios  
- **Frontend Testing**: {{FRONTEND_TESTS}} scenarios (planned)
- **Integration Testing**: {{INTEGRATION_TESTS}} scenarios (planned)

### 🎯 Next Immediate Tasks
{{#each NEW_REQUIREMENTS}}
- [ ] Implement {{this}}
- [ ] Create tests for {{this}}
- [ ] Update documentation for {{this}}
{{/each}}

---
*Auto-updated by Task Synchronization Framework*
```

## Template: Requirements Update Notification

```markdown
# 🔔 Requirements Update Notification

**Date**: {{DATE}}  
**Changes Detected**: {{NEW_REQUIREMENTS.length + UPDATED_REQUIREMENTS.length}}  
**Action**: Automatic synchronization triggered  

## Summary of Changes

### New Requirements Added ({{NEW_REQUIREMENTS.length}})
{{#each NEW_REQUIREMENTS}}
- {{this}}
{{/each}}

### Requirements Completed ({{UPDATED_REQUIREMENTS.length}})
{{#each UPDATED_REQUIREMENTS}}
- {{this}}
{{/each}}

## Impact Analysis

### Files Updated Automatically
- ✅ `copilot-agent-chat.md` - Added new requirement tracking
- ✅ `project-status-tracker.md` - Updated progress metrics
- ✅ Testing framework - Generated new test scenarios
- ✅ Documentation - Synchronized all references

### Action Items Generated
{{#each NEW_REQUIREMENTS}}
#### For requirement: "{{this}}"
- [ ] Backend implementation required
- [ ] Frontend component needed
- [ ] API endpoint creation/modification
- [ ] Testing scenario development
- [ ] Documentation updates

{{/each}}

### Testing Framework Updates
- 🧪 **New test scenarios**: Generated automatically
- 📊 **Coverage updated**: Reflects new requirements
- 🔄 **Automation scripts**: Extended for new features
- 📝 **Reports**: Will include new requirement validation

## Next Steps
1. **Review generated tests** in `app-shell-script-testing/6-requirement-validation/`
2. **Execute testing framework** with `./run-complete-testing.sh`
3. **Implement new features** as identified in requirement analysis
4. **Validate completion** against updated requirements

---
*Generated automatically by Task Synchronization Framework*
```

## Template: Testing Script Generation

```bash
#!/bin/bash
# Auto-generated test for requirement: {{REQUIREMENT_TEXT}}
# Generated: {{DATE}}
# Purpose: Validate implementation of specific requirement

test_{{REQUIREMENT_ID}}() {
    local requirement="{{REQUIREMENT_TEXT}}"
    echo -e "${BLUE}Testing requirement: $requirement${NC}"
    
    {{#if CONTAINS_LOGIN}}
    # Test login functionality
    test_endpoint "POST" "/api/auth/login" '{"email":"test@example.com","password":"password"}' "200"
    {{/if}}
    
    {{#if CONTAINS_REGISTRATION}}
    # Test registration functionality
    test_endpoint "POST" "/api/auth/register" '{"email":"new@example.com","password":"password"}' "201"
    {{/if}}
    
    {{#if CONTAINS_LIST}}
    # Test list functionality
    test_endpoint "POST" "/api/lists" '{"name":"Test List"}' "201"
    test_endpoint "GET" "/api/lists" "" "200"
    {{/if}}
    
    {{#if CONTAINS_TODO}}
    # Test todo functionality
    test_endpoint "POST" "/api/todos" '{"title":"Test Todo","listId":"'$LIST_ID'"}' "201"
    test_endpoint "GET" "/api/todos" "" "200"
    {{/if}}
    
    echo -e "${GREEN}✅ Requirement test completed: $requirement${NC}"
}

# Execute the test
test_{{REQUIREMENT_ID}}
```

## Template: Frontend Component Planning

```typescript
// Auto-generated component planning for: {{REQUIREMENT_TEXT}}
// Generated: {{DATE}}

{{#if CONTAINS_LOGIN}}
// Login Component Required
interface LoginComponent {
  // Properties
  email: string;
  password: string;
  isLoading: boolean;
  
  // Methods
  onLogin(): void;
  onForgotPassword(): void;
  navigateToRegister(): void;
}
{{/if}}

{{#if CONTAINS_REGISTRATION}}
// Registration Component Required
interface RegistrationComponent {
  // Properties
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Methods
  onRegister(): void;
  validatePasswords(): boolean;
  navigateToLogin(): void;
}
{{/if}}

{{#if CONTAINS_LIST}}
// List Management Component Required
interface ListComponent {
  // Properties
  lists: List[];
  selectedList: List | null;
  
  // Methods
  createList(name: string): void;
  editList(id: string, name: string): void;
  deleteList(id: string): void;
  selectList(list: List): void;
}
{{/if}}

{{#if CONTAINS_TODO}}
// Todo Management Component Required
interface TodoComponent {
  // Properties
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  
  // Methods
  addTodo(title: string): void;
  editTodo(id: string, title: string): void;
  deleteTodo(id: string): void;
  toggleComplete(id: string): void;
  filterTodos(filter: string): void;
}
{{/if}}
```

## Usage Instructions

### Automatic Template Processing
1. **Variable Substitution**: Templates use `{{VARIABLE}}` syntax for automatic replacement
2. **Conditional Sections**: Use `{{#if CONDITION}}` for conditional content
3. **Loops**: Use `{{#each ARRAY}}` for iterating over collections

### Manual Template Usage
1. **Copy template sections** to target documentation files
2. **Replace variables** with actual values
3. **Customize content** based on specific requirements
4. **Validate output** for accuracy and completeness

### Integration with Sync Framework
- Templates are automatically processed by `sync-requirements.sh`
- Variables are populated from `requirements.md` analysis
- Output is generated and inserted into target files
- Backup copies are created before modifications

---
*Documentation Synchronization Templates - Auto-maintained*