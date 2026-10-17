# AI Usage Documentation

## 1. Overview

I used AI as a development assistant while building the Maintenance Work Order Management application. I made the key decisions regarding the project’s purpose, technology stack, features, business requirements, and intended application behaviour.

AI helped me implement my ideas, understand technical concepts, troubleshoot errors, and improve development efficiency. I reviewed AI suggestions and used them as assistance during development rather than treating them as automatically correct.

## 2. AI Tools Used

I used ChatGPT and GitHub Copilot as AI-assisted development tools. GitHub Copilot was used in Visual Studio Code as a coding assistant to inspect project files, explain errors, suggest and apply code changes, and verify builds. AI assistance included:

- Understanding implementation approaches.
- Generating and refining code examples.
- Explaining React, Spring Boot, REST APIs, and database integration.
- Troubleshooting errors and interpreting error messages.
- Improving the use of frontend components.
- Reviewing possible solutions to technical problems.

## 3. Tasks AI Assisted With

AI assisted with selected implementation and debugging tasks, including:

- Writing and refining React components.
- Using Ant Design components in the frontend.
- Implementing frontend interactions for work orders, assets, technicians, and maintenance history.
- Developing and connecting Spring Boot REST API endpoints.
- Assisting with database operations and PostgreSQL integration.
- Investigating API communication, CORS, and Spring Security configuration issues.
- Translating my specified business requirements into potential validation and workflow logic.

I determined the intended features and requirements. AI provided implementation assistance based on those decisions.

## 4. Significant AI-Generated Code That I Modified

AI-generated code and suggestions were treated as starting points and adapted to fit the application's requirements and existing structure.

Examples of areas where I reviewed or modified suggested code include:

- React components and page layouts to fit the application's workflow.
- Ant Design component usage and imports.
- Work order forms, tables, status displays, and user interactions.
- API calls and data handling between the frontend and backend.
- Backend controller, service, and database integration logic.
- Validation and status-transition logic based on my specified business rules.

The final implementation needed to fit the existing project structure, naming conventions, API contracts, and intended behaviour. I reviewed suggestions in that context rather than using every generated code snippet unchanged.

## 5. Bugs and Issues Identified in AI-Generated Output

AI-generated suggestions can contain errors or may not fully account for an application's configuration. During development, I encountered and investigated issues including:

- API requests returning HTTP 403 responses.
- Missing CORS response headers when the frontend communicated with the backend.
- Spring Security configuration interfering with access to API endpoints.
- Potential differences between frontend validation and backend enforcement of business rules.
- UI library deprecation warnings that required attention to component usage.

These issues highlighted the need to test AI-assisted code in the actual application. In particular, frontend restrictions alone do not guarantee that business rules are enforced by the backend. Some issues required further investigation, and I did not assume that an AI-proposed fix was successful without verification.

## 6. Important Technical Decisions Made by Me

I made the important project-level decisions, including:

### Technology selection

I selected React with Vite for the frontend, Ant Design for the UI component library, Java with Spring Boot for the backend, and Neon PostgreSQL for database storage.

### Application scope

I determined that the application should support a maintenance workflow involving work orders, assets, technicians, and asset maintenance history, with a dashboard for viewing relevant information.

### User interface approach

I chose Ant Design to reuse established UI components, maintain a consistent interface, and reduce the time required to build common elements from scratch.

### Business requirements

I specified the intended business rules for the maintenance workflow, including:

- Work order numbers should be unique.
- Critical work orders must have an assigned technician.
- Completed work orders must not return to the open state.
- Cancelled work orders must not move into the in-progress state.
- Newly created work orders must not have a scheduled date in the past.
- Out-of-service assets must not receive new work orders unless the maintenance type explicitly qualifies as an emergency.

These are the requirements I intended the application to follow. Their actual enforcement depends on the implemented and tested code.

### Architecture and integration

I chose a frontend-backend structure in which React communicates with Spring Boot through REST APIs, while PostgreSQL stores application data. AI assisted with implementation and troubleshooting within this architecture.

### Deployment platform

I used Render to deploy the application. The React frontend is deployed as a Render Static Site, and the Spring Boot REST API is deployed as a Render web service using the project Dockerfile. The frontend is configured to call the deployed backend API. Render is the hosting and deployment platform; it is not an AI tool.

## 7. Review and Verification

I used AI to accelerate development, but AI-generated code still required review, integration, and testing. I considered whether suggested solutions matched my requirements and the existing application structure.

Where a technical issue remained unresolved, I treated it as an issue requiring further investigation rather than claiming it had been fixed.

## 8. Summary

AI supported coding, technical explanations, implementation refinement, and debugging. I retained responsibility for the project's goals, technology choices, feature requirements, business rules, and important technical decisions.

**The application reflects my project planning and decisions, with AI used as a supporting tool to help implement and troubleshoot those decisions.**