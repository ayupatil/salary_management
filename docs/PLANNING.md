# Planning & Approach

## Requirements Analysis

### User Persona
**HR Manager** managing 10,000+ employees across multiple countries and job titles.

### Core Requirements

#### 1. Employee Management
- **CRUD Operations**: Add, view, update, delete employees via UI
- **Required Fields**: 
  - Full name
  - Job title
  - Country
  - Salary
- **Additional Considerations**:
  - Soft delete for audit trail
  - Timestamps for tracking
  - Validation for data integrity

#### 2. Salary Insights
- **Country-level metrics**:
  - Minimum salary
  - Maximum salary
  - Average salary
  - Total employee count
- **Job title filtering**: Average salary for specific job title within a country

#### 3. Technical Stack
- **Backend**: Ruby on Rails (API-only)
- **Frontend**: React/Next.js
- **Database**: SQLite (simple, meets requirements)
- **UI Library**: Component library of choice

#### 4. Data Seeding
- 10,000 employees generated from name files
- Performance matters (regular execution)
- Idempotent script

#### 5. Deployment
- Fully functional deployed software
- Video demonstration

## Development Phases

### Phase 1: Backend Foundation (TDD)

1. **Setup**
   - Initialize Rails API application
   - Configure Minitest
   - Setup RuboCop for code quality

2. **Employee Model**
   - Write failing tests for validations
   - Implement model with validations
   - Add soft delete (Paranoia gem)

3. **CRUD API**
   - Write failing tests for endpoints
   - Implement employees controller
   - Add proper error handling

4. **Salary Insights**
   - Write failing tests for insights
   - Create service object for complex logic
   - Implement aggregation queries

5. **Performance Optimization**
   - Add database indexes
   - Optimize seed script with bulk insert

### Phase 2: Backend Improvements

1. **Service Improvements**
   - Consistent API response shape
   - Edge case handling

2. **Pagination & Filtering**
   - Add Kaminari for pagination
   - Implement filters (country, job_title, search)
   - Tests for all scenarios

3. **CORS Configuration**
   - Enable cross-origin requests
   - Configure for dev and production

4. **Seed Script**
   - Make idempotent
   - Add performance timing

### Phase 3: Frontend Development

1. **Setup**
   - Vite + React
   - Shadcn/UI + Tailwind CSS
   - React Router
   - TanStack Query

2. **Employee Management UI**
   - Employee list with table
   - Pagination controls
   - Filters and search
   - Add/Edit/Delete modals
   - Form validation

3. **Insights Dashboard**
   - Country selector
   - Metrics display
   - Job title filter
   - Visual design

4. **Testing**
   - Component tests
   - Form validation tests
   - Integration tests

### Phase 4: Deployment & Documentation

1. **Documentation**
   - README
   - Architecture decisions
   - API documentation
   - AI usage notes

2. **Deployment**
   - Backend to Render
   - Frontend to Vercel
   - Environment configuration
   - Production testing

3. **Video Demo**
   - Record walkthrough
   - Upload and link

## Key Decisions

### Why Test-Driven Development?
- Ensures code correctness
- Documents expected behavior
- Prevents regressions
- Shows disciplined approach

### Why Incremental Commits?
- Shows evolution of solution
- Demonstrates thought process
- Easy to review and understand
- Professional Git workflow

### Why Service Objects?
- Keeps controllers thin
- Encapsulates business logic
- Easy to test in isolation
- Follows Single Responsibility Principle

### Why Soft Delete?
- Audit trail for HR
- Can recover accidentally deleted employees
- Maintains data integrity
- Common pattern in enterprise applications

## Success Criteria

- ✅ All CRUD operations functional
- ✅ Salary insights accurate and fast
- ✅ 10,000 employee seed script performant
- ✅ Comprehensive test coverage
- ✅ Clean, maintainable code
- ✅ Deployed and accessible
- ✅ Clear documentation
- ✅ Video demonstration
