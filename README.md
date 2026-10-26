# Employee App Backend Assignment

This is a beginner-friendly starter project created because no original ZIP/build files were supplied. It includes a sample frontend in `dist/` and a backend in `app.js`.

## Requirements

- Node.js LTS
- MongoDB Atlas account
- VS Code

## Setup

1. Open this folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Install packages:

   ```bash
   npm install
   ```

4. Copy `.env.example` and rename the copy to `.env`.
5. In MongoDB Atlas, create a database user and allow your current IP in Network Access.
6. Paste your Atlas connection string into `MONGODB_URI` in `.env`. Replace the example username/password/cluster with your real details. Do not share or upload `.env`.
7. Start the app:

   ```bash
   npm start
   ```

8. Open `http://localhost:3000` in your browser.

## API routes

- `GET /api/employees` — list all employees
- `GET /api/employees/:id` — get one employee by MongoDB ID
- `POST /api/employees` — add employee (requires `name` and `email`)
- `PUT /api/employees/:id` — update employee (requires `name` and `email`)
- `DELETE /api/employees/:id` — delete employee

Sample employee JSON:

```json
{
  "name": "Asha Nair",
  "email": "asha@example.com",
  "department": "IT",
  "position": "Developer",
  "phone": "9876543210"
}
```

## GitHub safety

Do not upload `.env` or `node_modules`. The `.gitignore` file excludes them. Before submitting, check your instructor's exact requirements; this is a starter project and may not match a college-provided frontend or API schema if one exists elsewhere.
