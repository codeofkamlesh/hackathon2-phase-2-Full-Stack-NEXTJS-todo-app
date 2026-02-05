# SDD-RI Ecosystem for Todo App

## Overview
This directory contains the Reusable Intelligence (RI) layer for the AI-powered Todo App, designed to act as an autonomous development team using SpecKit workflows.

## Directory Structure
```
.claude/
├── agents/                    # Agent personas (Roles, System Prompts, Goals)
│   ├── Agent_01_Chief_Architect.md
│   ├── Agent_02_Backend_Engineer.md
│   ├── Agent_03_Frontend_Wizard.md
│   ├── Agent_04_AI_Specialist.md
│   └── Agent_05_QA_Sentinel.md
└── skills/                    # Reusable tools/scripts (The Toolkit)
    ├── skill_sdd_workflow.md
    ├── skill_deployment_auditor.md
    ├── skill_super_tool_simulator.md
    ├── skill_db_integrity.md
    └── skill_ui_component_gen.md
```

## Agent Roles & Responsibilities

### 1. Chief Architect (Agent_01)
- Manages specification and planning lifecycle
- Ensures all features follow the SDD workflow
- Validates compliance with project constitution

### 2. Backend Engineer (Agent_02)
- Maintains FastAPI backend and database operations
- Implements and maintains AI tool integrations
- Ensures API stability and reliability

### 3. Frontend Wizard (Agent_03)
- Develops Next.js UI components with Tailwind
- Maintains ChatWidget and user experience
- Ensures responsive design and accessibility

### 4. AI Specialist (Agent_04)
- Optimizes AI system preamble and tool calling
- Prevents hallucinations and improves accuracy
- Refines conversational flow and error handling

### 5. QA Sentinel (Agent_05)
- Performs automated quality assurance
- Verifies deployments and database integrity
- Monitors application health and performance

## Skills Overview

### Process Skills
- **SDD Workflow**: Strict protocol for feature implementation lifecycle
- **Deployment Auditor**: Ensures proper deployment configuration and eliminates localhost issues
- **Super Tool Simulator**: Understanding of AI tool calling mechanics for testing

### Technical Skills
- **Database Integrity**: SQLModel queries for data validation and consistency
- **UI Component Generation**: Template for creating components following design standards

## Integration with SpecKit
All agents and skills are designed to work seamlessly with the SpecKit lifecycle:
1. `sp.specify` → Chief Architect manages requirements gathering
2. `sp.plan` → Chief Architect creates architectural plans
3. `sp.tasks` → All agents collaborate on task breakdown
4. `sp.implement` → Specialized agents execute implementation tasks

## Key Features
- Autonomous development team simulation
- Comprehensive test coverage for all components
- Deployment verification and monitoring
- AI-powered task management with validation
- Full-stack integration testing

## Usage
To activate the autonomous development team, instantiate the appropriate agent based on the task at hand, utilizing the shared skills as needed for specific technical operations.