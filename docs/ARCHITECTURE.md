# Architecture & Design Decisions

## System Architecture

### High-Level Overview

```
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  React Frontend │◄───────►│   Rails API      │
│  (Vite + React) │  HTTP   │   (API-only)     │
│                 │  JSON   │                  │
└─────────────────┘         └────────┬─────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │                 │
                            │  SQLite / PG    │
                            │   Database      │
                            │                 │
                            └─────────────────┘
```

## Backend Architecture

### Framework: Rails 8.0.2 API-Only

**Why Rails?**
- Rapid development with conventions
- Excellent ORM (ActiveRecord)
- Built-in testing framework (Minitest)
- Mature ecosystem
- Matches job requirements

**Why API-only mode?**
- Clear separation of concerns
- Frontend flexibility
- Smaller footprint
- RESTful design
- Can support multiple clients

### Database: SQLite → PostgreSQL

**Development/Test: SQLite**
- Zero configuration
- Fast for development
- Sufficient for requirements
- Easy to reset and seed

**Production: PostgreSQL**
- Render's SQLite storage is ephemeral
- Better concurrency
- Production-ready
- Industry standard

**Schema Design**:
```ruby
create_table "employees" do |t|
  t.string "full_name"      # Employee's full name
  t.string "job_title"      # Engineer, Manager, etc.
  t.string "country"        # India, USA, UK, etc.
  t.integer "salary"        # Annual salary in base currency
  t.datetime "created_at"   # Record creation timestamp
  t.datetime "updated_at"   # Last update timestamp
  t.datetime "deleted_at"   # Soft delete timestamp (null = active)
  
  # Indexes for performance
  t.index ["country"]
  t.index ["job_title"]
  t.index ["country", "job_title"]
  t.index ["deleted_at"]
end
```

**Why these fields?**
- `full_name`: Required, simpler than first/last name split
- `job_title`: Required for insights grouping
- `country`: Required for regional analysis
- `salary`: Integer for simplicity (avoid float precision issues)
- `deleted_at`: Soft delete for audit trail

**Why these indexes?**
- `country`: Fast filtering and insights queries
- `job_title`: Fast job title filtering
- `country, job_title`: Composite index for combined filters
- `deleted_at`: Paranoia gem requirement

### Key Gems & Libraries

#### Paranoia (Soft Delete)
**Why?**
- HR systems need audit trails
- Recover accidentally deleted employees
- Maintain referential integrity
- Industry standard for enterprise apps

**How it works?**
- Adds `deleted_at` timestamp
- Scopes queries to exclude soft-deleted records
- Can restore deleted records

#### Kaminari (Pagination)
**Why?**
- Handles 10,000+ records efficiently
- Simple, clean API
- Flexible configuration
- Popular and well-maintained

**Configuration**:
- Default: 50 per page
- Max: 100 per page (prevents abuse)
- Returns metadata (total count, pages, current page)

#### Rack-CORS
**Why?**
- Frontend on different domain/port
- Required for browser security
- Configurable per environment

**Configuration**:
- Dev: `localhost:5173` (Vite default)
- Prod: Vercel/Netlify domains

### Design Patterns

#### Service Objects
**Pattern**: Extract complex business logic into dedicated service classes

**Example**: `SalaryInsightsService`
```ruby
class SalaryInsightsService
  def initialize(country:, job_title: nil)
    @country = country
    @job_title = job_title
  end
  
  def call
    # Complex aggregation logic
  end
end
```

**Why?**
- Keeps controllers thin (Single Responsibility)
- Easy to test in isolation
- Reusable across controllers/jobs
- Clear intent and naming

#### RESTful API Design
**Convention**: Standard HTTP methods and status codes

```
GET    /employees       → index   (200 OK)
GET    /employees/:id   → show    (200 OK, 404 Not Found)
POST   /employees       → create  (201 Created, 422 Unprocessable)
PATCH  /employees/:id   → update  (200 OK, 422 Unprocessable)
DELETE /employees/:id   → destroy (204 No Content)
GET    /employees/insights → custom action (200 OK, 400 Bad Request)
```

**Why?**
- Industry standard
- Predictable for API consumers
- Self-documenting
- Works well with HTTP caching

## Frontend Architecture

### Framework: React 18 + Vite

**Why React?**
- Component-based architecture
- Large ecosystem
- Excellent tooling
- Industry standard
- Matches requirements

**Why Vite over Create React App?**
- Faster dev server (HMR)
- Smaller bundle size
- Modern build tool
- CRA is deprecated
- Better developer experience

### UI Library: Shadcn/UI

**Why Shadcn/UI?**
- Copy-paste components (not npm package)
- Full customization control
- Built on Radix UI (accessible)
- Tailwind CSS (utility-first)
- Modern, beautiful defaults

**Alternatives considered**:
- Material-UI: Too opinionated, heavier
- Ant Design: Enterprise-heavy, larger bundle
- Chakra UI: Good but Shadcn more modern

### State Management Strategy

#### Server State: TanStack Query
**Why?**
- Purpose-built for server data
- Automatic caching
- Background refetching
- Optimistic updates
- Loading/error states built-in

**What it handles**:
- Fetching employees
- Creating/updating/deleting
- Fetching insights
- Cache invalidation

#### Client State: React useState/useReducer
**Why?**
- App is simple, no complex client state
- Form state handled by React Hook Form
- No need for Redux/Zustand

**What it handles**:
- Modal open/close
- Filter values
- UI toggles

### Routing: React Router v6

**Routes**:
```
/               → Redirect to /employees
/employees      → Employee management page
/insights       → Salary insights page
```

**Why?**
- Standard routing library
- Declarative API
- Code splitting support
- Nested routes if needed

### Form Handling: React Hook Form + Zod

**Why React Hook Form?**
- Minimal re-renders
- Built-in validation
- Easy integration with UI libraries

**Why Zod?**
- Type-safe validation
- Composable schemas
- Great error messages
- Works seamlessly with React Hook Form

**Example validation**:
```javascript
const employeeSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  job_title: z.string().min(1, "Job title is required"),
  country: z.string().min(1, "Country is required"),
  salary: z.number().positive("Salary must be positive"),
})
```

## API Client Design

### Axios Instance
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CORS with credentials
})
```

**Why Axios over Fetch?**
- Automatic JSON parsing
- Interceptors for errors
- Request/response transformation
- Better error handling
- More features out of the box

## Performance Considerations

### Seed Script Optimization
**Challenge**: Seed 10,000 employees quickly, multiple times

**Solution**:
```ruby
Employee.insert_all(employees_data)  # Bulk insert
```

**Performance**:
- Before: ~2-3 seconds (individual inserts)
- After: ~0.18 seconds (bulk insert)
- **~10x faster**

### Database Indexing
**Challenge**: Fast queries on 10,000+ records

**Solution**: Strategic indexes
```ruby
add_index :employees, :country
add_index :employees, :job_title
add_index :employees, [:country, :job_title]
```

**Impact**: Sub-millisecond queries for insights

### Pagination
**Challenge**: Don't load 10,000 records in browser

**Solution**:
- Default 50 per page
- Max 100 per page
- Return metadata for UI

## Security Considerations

### CORS Configuration
- Whitelist specific origins
- Don't use wildcard `*` in production
- Credentials support for cookies/auth

### Input Validation
- Backend: ActiveRecord validations
- Frontend: Zod schemas
- Defense in depth

### Soft Delete
- Deleted records still queryable by admins
- Prevents accidental data loss
- Audit trail for compliance

## Testing Strategy

### Backend: Minitest (TDD)
**Coverage**:
- Model validations
- Controller actions
- Service objects
- Edge cases

**Style**: Red-Green-Refactor
1. Write failing test
2. Make it pass
3. Refactor

### Frontend: Vitest + React Testing Library
**Coverage**:
- Component rendering
- User interactions
- Form validation
- API integration (mocked)

**Philosophy**: Test user behavior, not implementation

## Deployment Architecture

```
┌──────────────┐         ┌───────────────┐
│   Vercel     │         │    Render     │
│   (Frontend) │────────►│   (Backend)   │
│              │  HTTPS  │               │
└──────────────┘         └───────┬───────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   PostgreSQL    │
                        │   (Render DB)   │
                        └─────────────────┘
```

**Why Render for Backend?**
- Free tier available
- PostgreSQL included
- Auto-deploy from Git
- Easy environment config

**Why Vercel for Frontend?**
- Optimized for React/Vite
- Edge network (fast globally)
- Auto-deploy from Git
- Environment variables support

## Future Enhancements

If this were a real product:
1. **Authentication**: User login, role-based access
2. **Authorization**: HR vs Manager vs Employee roles
3. **Audit Log**: Track all changes
4. **Export**: CSV/Excel export of data
5. **Charts**: Visual salary distribution graphs
6. **Advanced Search**: Elasticsearch for complex queries
7. **Bulk Operations**: Upload CSV, bulk edit
8. **Real-time**: WebSockets for live updates
9. **Mobile App**: React Native
10. **API Versioning**: `/api/v1/employees`
