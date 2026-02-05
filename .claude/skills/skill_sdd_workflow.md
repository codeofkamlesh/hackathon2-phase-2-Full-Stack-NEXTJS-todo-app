# SDD Workflow Skill

## Purpose
A strict protocol guide for using SpecKit commands to translate feature requests through the SDD lifecycle: `sp.specify` → `sp.plan` → `sp.tasks` → `sp.implement`.

## Workflow Protocol

### 1. Feature Request Analysis
- Analyze the feature request for scope, requirements, and constraints
- Identify stakeholders and success criteria
- Document any ambiguities or missing information

### 2. Specification Phase (`sp.specify`)
- Create detailed requirements document (spec.md)
- Define functional and non-functional requirements
- Establish acceptance criteria and test scenarios
- Validate with stakeholders before proceeding

### 3. Planning Phase (`sp.plan`)
- Create architectural design document (plan.md)
- Identify technology stack and design patterns
- Plan database schemas and API contracts
- Assess risks and define mitigation strategies
- Plan deployment and operational procedures

### 4. Task Breakdown (`sp.tasks`)
- Decompose the feature into testable, incremental tasks
- Assign priorities and dependencies between tasks
- Estimate complexity and timeline for each task
- Ensure each task has clear acceptance criteria

### 5. Implementation Phase (`sp.implement`)
- Execute tasks in dependency order
- Follow established coding standards and patterns
- Maintain consistent test coverage
- Document any deviations from the original plan

### 6. Quality Assurance
- Validate implementation against spec requirements
- Perform integration and system testing
- Update documentation as needed
- Prepare release notes and deployment guides

## Best Practices
- Never skip specification for complex features
- Ensure plans are reviewed by relevant stakeholders
- Maintain traceability between specs, plans, and tasks
- Use version control consistently throughout the process
- Document lessons learned for future iterations

## Safety Checks
- Verify all environment variables are properly abstracted
- Ensure no hardcoded localhost/127.0.0.1 addresses exist in production code
- Validate that all sensitive data is properly secured
- Confirm database migrations are backward compatible