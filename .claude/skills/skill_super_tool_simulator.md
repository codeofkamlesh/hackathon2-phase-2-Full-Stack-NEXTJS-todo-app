# Super Tool Simulator Skill

## Purpose
A guide on how the `main.py` AI logic works, specifically how it parses multiple commands ("add task" and "delete task") in one turn using Cohere's tool calling capability.

## Architecture Overview

### 1. Re-Act Loop Implementation
The backend implements a robust Re-Act (Reasoning + Acting) loop that allows the AI to:
- Analyze user input and determine required actions
- Call appropriate tools in sequence
- Process tool results and generate responses
- Handle multiple operations in a single conversation turn

### 2. Tool Definitions in main.py
The backend exposes these tools to the Cohere AI:

#### add_task
```python
{
    "name": "add_task",
    "description": "Add a new task to the user's task list",
    "parameter_definitions": {
        "title": {"description": "The title of the task", "type": "str", "required": True},
        "description": {"description": "Optional description of the task", "type": "str", "required": False},
        "priority": {"description": "Priority level ('high', 'medium', 'low')", "type": "str", "required": False, "default": "medium"},
        "dueDate": {"description": "Due date for the task (various formats accepted)", "type": "str", "required": False},
        "tags": {"description": "Tags for the task (comma separated if multiple)", "type": "str", "required": False},
        "recurring": {"description": "Recurring pattern ('daily', 'weekly', 'monthly', 'yearly')", "type": "str", "required": False},
        "completed": {"description": "Whether the task is initially completed", "type": "bool", "required": False, "default": False}
    }
}
```

#### list_tasks
```python
{
    "name": "list_tasks",
    "description": "List tasks for the user with optional filtering",
    "parameter_definitions": {
        "status": {"description": "Filter by status ('completed', 'pending', or None for all)", "type": "str", "required": False},
        "limit": {"description": "Maximum number of tasks to return", "type": "int", "required": False, "default": 10}
    }
}
```

#### complete_task, delete_task, update_task
Similar definitions for task manipulation operations.

### 3. Tool Calling Process
1. User sends message to `/api/chat`
2. Message + conversation history sent to Cohere
3. Cohere identifies required tools and parameters
4. Backend executes tools sequentially with user_id injection
5. Tool results returned to Cohere for final response generation

### 4. Testing Scenarios

#### Single Operation Test
```
Input: "Add a task called 'Buy groceries'"
Expected: Calls add_task with title="Buy groceries"
```

#### Multi-Operation Test
```
Input: "Add a task called 'Buy groceries' and complete the task with ID 1"
Expected: Calls add_task AND complete_task in sequence
```

#### Error Handling Test
```
Input: "Add a task without a title"
Expected: Proper error handling and user-friendly response
```

#### Tool Result Chain Test
```
Input: "List my tasks, then add a new one called 'Test task'"
Expected: First calls list_tasks, then adds the new task using the information gathered
```

### 5. System Preamble
The system enforces schema compliance with:
```
"You are a Task Assistant. You operate on 'User', 'Task' (id, title, description, priority, completed, dueDate, userId), 'Conversation', 'Message' tables. DO NOT hallucinate columns. Use tools strictly."
```

### 6. Error Recovery Mechanisms
- Fallback models (command-r-08-2024 → command-light) if primary model fails
- Token conservation with max_tokens=150
- Sanitization of chat history to prevent None/empty message errors
- Robust user_id injection for all tool operations
- Comprehensive exception handling

### 7. Testing Commands
```bash
# Test single tool call
curl -X POST http://localhost:7860/api/chat \
  -H "Content-Type": "application/json" \
  -d '{"message": "Add a task called Test", "user_id": "test-user"}'

# Test multiple tool calls in one message
curl -X POST http://localhost:7860/api/chat \
  -H "Content-Type": "application/json" \
  -d '{"message": "Add task Test1 and list all tasks", "user_id": "test-user"}'
```