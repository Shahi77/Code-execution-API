### Code Execution API

A backend service that allows users to submit code snippets in various programming languages, execute them on a server, and receive the output or error messages.

- A system where users can:
  - Run code snippets in various programming languages.
  - Get real-time outputs or errors.
  - Implement containerization (Docker) for execution.

## Folder Structure of Application

```
.
├── src
│  ├── controllers
│  │   ├── executeCode.js
|  |   └── codeController.js
│  ├── routes
│  │  ├── executeRoutes.js
│  │  └── version1Routes.js
│  ├── service
│  │  ├── redis.js
│  ├── temp
│  ├── Dockerfile
│  └── index.js
├── .env
├── .gitignore
├── package-lock.json
├── package.json
└── Readme.md
```

## API Reference

Test API Endpoints: [Postman Collection](https://www.postman.com/shahi77/workspace/github/collection/28412567-b22596bf-c4f2-48ad-8969-09abfac7dadc?action=share&creator=28412567)
