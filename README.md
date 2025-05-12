# Task Organizer API

A collaborative task management application built with NestJS, TypeScript, Prisma, and PostgreSQL.

## Features

- User authentication and authorization
- Task list management
- Task creation and assignment
- Recurring tasks with flexible scheduling
- Task completion tracking
- Role-based access control

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL (v12 or later)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd task-organizer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/task_organizer?schema=public"
PORT=3000
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Generate Prisma client:
```bash
npm run prisma:generate
```

7. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

## API Documentation

Once the server is running, you can access the Swagger API documentation at:
`http://localhost:3000/api`

## Available Scripts

- `npm run start:dev` - Start the development server
- `npm run build` - Build the application
- `npm run start:prod` - Start the production server
- `npm run test` - Run tests
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:generate` - Generate Prisma client

## Project Structure

```
src/
├── auth/           # Authentication module
├── prisma/         # Prisma service and module
├── task-lists/     # Task list management
├── tasks/          # Task management
├── users/          # User management
├── app.module.ts   # Main application module
└── main.ts         # Application entry point
```

## License

MIT 