# Salary Management System

A full-stack salary management tool designed for HR managers to efficiently manage employee data and gain salary insights across a 10,000+ employee organization.

## 🚀 Features

### Employee Management
- Add, view, update, and delete employees
- Search employees by name
- Filter by country and job title
- Pagination for large datasets (10,000+ employees)
- Soft delete with audit trail

### Salary Insights
- Minimum, maximum, and average salary by country
- Employee count by country
- Filter insights by job title within a country
- Real-time metrics calculation

## 🛠 Tech Stack

### Backend
- **Framework**: Ruby on Rails 8.0.2 (API-only)
- **Database**: SQLite (Development/Test), PostgreSQL (Production)
- **Key Gems**:
  - Paranoia (soft deletes)
  - Kaminari (pagination)
  - Rack-CORS (cross-origin support)

### Frontend
- **Framework**: React 18 with Vite
- **UI Library**: Shadcn/UI + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios

### Testing
- **Backend**: Minitest with 36 tests, 97 assertions
- **Frontend**: Vitest + React Testing Library
- **Approach**: Test-Driven Development (TDD)

## 📋 Prerequisites

- Ruby 3.3.x
- Rails 8.0.2
- Node.js 24.x
- npm 11.x
- SQLite3

## 🔧 Setup Instructions

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd salary_management
   ```

2. **Install dependencies**
   ```bash
   bundle install
   ```

3. **Setup database**
   ```bash
   rails db:create
   rails db:migrate
   rails db:seed  # Seeds 10,000 employees
   ```

4. **Run tests**
   ```bash
   bundle exec rails test
   ```

5. **Start the server**
   ```bash
   rails server
   ```
   Backend runs on `http://localhost:3000`

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

4. **Run tests**
   ```bash
   npm test
   ```

## 🧪 Running Tests

### Backend Tests
```bash
bundle exec rails test                    # Run all tests
bundle exec rails test test/models        # Run model tests only
bundle exec rails test test/controllers   # Run controller tests only
bundle exec rubocop                       # Check code style
```

### Frontend Tests
```bash
cd client
npm test              # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 📡 API Endpoints

### Employees
- `GET /employees` - List employees (paginated, filterable)
  - Query params: `page`, `per_page`, `country`, `job_title`, `search`
- `GET /employees/:id` - Get single employee
- `POST /employees` - Create employee
- `PATCH /employees/:id` - Update employee
- `DELETE /employees/:id` - Soft delete employee

### Insights
- `GET /employees/insights` - Get salary insights
  - Required: `country`
  - Optional: `job_title`

See [API Documentation](docs/API.md) for detailed request/response examples.

## 📚 Documentation

- [Planning & Approach](docs/PLANNING.md)
- [Architecture Decisions](docs/ARCHITECTURE.md)
- [AI Usage](docs/AI_USAGE.md)
- [Trade-offs](docs/TRADEOFFS.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🚀 Live Demo

- **Frontend**: [TBD - Vercel URL]
- **Backend API**: [TBD - Render URL]
- **Video Demo**: [TBD]

## 🏗 Project Structure

```
salary_management/
├── app/
│   ├── controllers/      # API controllers
│   ├── models/           # ActiveRecord models
│   └── services/         # Business logic services
├── client/               # React frontend (TBD)
├── config/               # Rails configuration
├── db/
│   ├── content/          # Seed data (first/last names)
│   ├── migrate/          # Database migrations
│   └── seeds.rb          # Seed script
├── docs/                 # Project documentation
├── test/                 # Minitest tests
└── README.md
```

## 👨‍💻 Development Approach

This project was built using:
- **Test-Driven Development (TDD)**: All features written with failing tests first
- **Incremental commits**: Clear, focused commit history showing evolution
- **AI-assisted development**: Leveraging AI tools while maintaining code quality
- **Production-quality code**: Comprehensive tests, clean code, proper error handling

## 📈 Performance

- **Seed script**: Seeds 10,000 employees in ~0.18 seconds
- **Database queries**: Optimized with indexes on `country` and `job_title`
- **Pagination**: Default 50 per page, max 100 to prevent performance issues

## 📄 License

This project is part of a technical assessment.

---

**Built using Ruby on Rails and React**
