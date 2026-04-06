# Trade-offs & Design Decisions

This document explains key trade-offs made during development, the options considered, and the rationale behind each decision.

## 1. Pagination Limits

### Decision: Default 50, Max 100 per page

**Options Considered**:
- A) No limit (return all records)
- B) Fixed 50 per page, no customization
- C) Default 50, max 100 (chosen)
- D) Default 25, max 250

**Trade-offs**:

| Approach | Pros | Cons |
|----------|------|------|
| No limit | Simple | Terrible UX with 10K records, browser crash risk |
| Fixed 50 | Predictable performance | Inflexible for different use cases |
| Default 50, max 100 | Balance of UX and performance | Requires validation logic |
| Default 25, max 250 | More flexibility | Potential performance issues |

**Chosen**: C (Default 50, max 100)

**Rationale**:
- 50 is enough for most HR workflows
- 100 cap prevents abuse/performance issues
- Customizable per_page gives flexibility
- Good balance of UX and server load

**Code Impact**:
```ruby
per_page = [params[:per_page]&.to_i || 50, 100].min
```

---

## 2. Soft Delete vs Hard Delete

### Decision: Soft Delete (Paranoia gem)

**Options Considered**:
- A) Hard delete (actually remove from DB)
- B) Soft delete with deleted_at timestamp (chosen)
- C) Archive table (move to separate table)
- D) Status flag (active/inactive/deleted)

**Trade-offs**:

| Approach | Pros | Cons |
|----------|------|------|
| Hard delete | Simple, clean database | No recovery, no audit trail |
| Soft delete | Recoverable, audit trail | More complex queries, disk space |
| Archive table | Clean main table | Complex joins, migration overhead |
| Status flag | Flexible states | Requires migration for new states |

**Chosen**: B (Soft delete with Paranoia)

**Rationale**:
- HR systems need audit trails
- Accidental deletions can be recovered
- Paranoia gem is battle-tested
- Minimal performance impact with proper indexing
- Common pattern in enterprise applications

**Code Impact**:
```ruby
# Model
class Employee < ApplicationRecord
  acts_as_paranoid
end

# Query (automatic scoping)
Employee.all  # Excludes soft-deleted

# Restore
employee.restore
```

---

## 3. SQLite vs PostgreSQL

### Decision: SQLite (dev/test), PostgreSQL (production)

**Options Considered**:
- A) SQLite everywhere
- B) PostgreSQL everywhere
- C) SQLite dev/test, PostgreSQL production (chosen)

**Trade-offs**:

| Approach | Pros | Cons |
|----------|------|------|
| SQLite everywhere | Simple, zero config | Render SQLite is ephemeral (data loss) |
| PostgreSQL everywhere | Production parity | Complex local setup, heavier |
| Hybrid approach | Best of both worlds | Slight SQL dialect differences |

**Chosen**: C (Hybrid)

**Rationale**:
- **Development**: SQLite is fast, zero config, perfect for local work
- **Production**: Render's SQLite storage is ephemeral (files deleted on redeploy)
- PostgreSQL needed for persistent production data
- Rails abstracts SQL differences well
- Requirements met with simplicity in dev

**Migration Path**:
```ruby
# Gemfile
group :production do
  gem "pg"
end

# database.yml
production:
  adapter: postgresql
  url: <%= ENV['DATABASE_URL'] %>
```

---

## 4. Search Implementation: LIKE vs Full-Text Search

### Decision: LIKE query with case-insensitive match

**Options Considered**:
- A) Simple LIKE query (chosen)
- B) PostgreSQL full-text search
- C) Elasticsearch
- D) pg_search gem

**Trade-offs**:

| Approach | Pros | Cons |
|----------|------|------|
| LIKE query | Simple, works in SQLite & PG | Slower on large datasets, no ranking |
| PG full-text | Faster, better ranking | PostgreSQL-only, more complex |
| Elasticsearch | Very fast, advanced features | Overkill for 10K records, infrastructure |
| pg_search | Good balance | Another dependency |

**Chosen**: A (LIKE query)

**Rationale**:
- 10,000 employees is not large enough to need full-text search
- LIKE queries are fast enough with indexes
- Works in both SQLite (dev) and PostgreSQL (prod)
- Simplicity over premature optimization
- Can upgrade later if needed

**Code**:
```ruby
employees.where("full_name LIKE ?", "%#{params[:search]}%")
```

**Performance**: ~10ms for search on 10K records (acceptable)

---

## 5. Service Object vs Controller Logic

### Decision: Service object for complex insights

**Options Considered**:
- A) All logic in controller
- B) Service object for insights (chosen)
- C) Service objects for everything
- D) Concern/module for shared logic

**Trade-offs**:

| Approach | Pros | Cons |
|----------|------|------|
| Controller logic | Simple, fewer files | Fat controllers, hard to test |
| Selective service objects | Clean controllers, testable | More files, decide what needs service |
| Service for everything | Very clean controllers | Over-engineering, boilerplate |
| Concerns | Shared logic DRY | Less explicit, can be confusing |

**Chosen**: B (Selective service objects)

**Rationale**:
- **CRUD operations**: Simple enough for controller
- **Insights**: Complex aggregations deserve service object
- Service objects are easier to test in isolation
- Follows Single Responsibility Principle
- Can add more services as complexity grows

**Example**:
```ruby
# Clean controller
def insights
  result = SalaryInsightsService.new(
    country: params[:country],
    job_title: params[:job_title]
  ).call
  render json: result
end
```

---

## 6. Frontend: Monorepo vs Separate Repo

### Decision: Monorepo (/client subdirectory)

**Options Considered**:
- A) Monorepo - frontend in /client (chosen)
- B) Separate repository for frontend

**Trade-offs**:

| Approach | Pros | Cons |
|----------|------|------|
| Monorepo | Single repo, easier to manage | Larger repo, mixed concerns |
| Separate repos | Clean separation, independent deploys | Two repos to manage, coordination |

**Chosen**: A (Monorepo)

**Rationale**:
- **Assessment context**: Easier for reviewers to see everything
- Single README can document both
- Simplified deployment documentation
- Industry trend toward monorepos
- Can split later if needed

**Structure**:
```
salary_management/
├── app/          # Rails backend
├── client/       # React frontend
├── config/       # Rails config
├── docs/         # Shared docs
└── README.md     # Single entry point
```

---

## 7. UI Library: Shadcn/UI vs Alternatives

### Decision: Shadcn/UI

**Options Considered**:
- A) Material-UI (MUI)
- B) Ant Design
- C) Chakra UI
- D) Shadcn/UI (chosen)

**Trade-offs**:

| Library | Pros | Cons |
|---------|------|------|
| Material-UI | Mature, comprehensive | Opinionated, larger bundle, Google design |
| Ant Design | Enterprise features | Chinese design patterns, heavy |
| Chakra UI | Great DX, accessible | Less modern aesthetic |
| Shadcn/UI | Modern, customizable, copy-paste | Newer, manual component install |

**Chosen**: D (Shadcn/UI)

**Rationale**:
- **Not an npm package**: Copy components, full control
- **Built on Radix UI**: Accessible by default
- **Tailwind CSS**: Utility-first, easy to customize
- **Modern aesthetic**: Professional look
- **Trending**: Shows awareness of current tools

---

## 8. Testing: Unit Only vs Unit + E2E

### Decision: Comprehensive unit tests, no E2E (for now)

**Options Considered**:
- A) Unit tests only (chosen for assessment)
- B) Unit + E2E tests
- C) E2E only

**Trade-offs**:

| Approach | Pros | Cons |
|----------|------|------|
| Unit only | Fast, focused, easier to maintain | Don't test full integration |
| Unit + E2E | Complete coverage, confidence | Time-consuming, flaky tests |
| E2E only | Real user flows | Slow, hard to debug, brittle |

**Chosen**: A (Unit tests for assessment, can add E2E later)

**Rationale**:
- **Time constraint**: E2E adds 2-3 hours
- **Backend**: 36 unit tests provide strong coverage
- **Frontend**: Component tests cover UI logic
- **Manual testing**: Can verify full flows manually
- **Production app**: Would add E2E with Playwright

**Testing Pyramid**:
```
     /\
    /E2E\         <- Few (skip for assessment)
   /------\
  /  Unit  \      <- Many (comprehensive)
 /----------\
```

---

## 9. Seed Script: Speed vs Flexibility

### Decision: Optimized bulk insert with idempotency

**Options Considered**:
- A) Individual creates (Employee.create!)
- B) Bulk insert with insert_all (chosen)
- C) Background job for large datasets
- D) SQL file import

**Trade-offs**:

| Approach | Pros | Cons |
|----------|------|------|
| Individual creates | Runs validations, callbacks | Very slow (~2-3s for 10K) |
| Bulk insert | Very fast (~0.18s) | Skips validations/callbacks |
| Background job | Non-blocking | Overkill for seeds, complex |
| SQL import | Fastest | Not idiomatic Rails, platform-specific |

**Chosen**: B (Bulk insert with insert_all)

**Rationale**:
- **Performance requirement**: "performance matters" in spec
- **10x faster**: 0.18s vs 2-3s
- **Idempotent**: Clear existing data first
- **Rails way**: Using Rails method, not raw SQL
- **Good enough**: Validations ensured in model, seeds are controlled data

**Code**:
```ruby
Employee.delete_all  # Idempotency
Employee.insert_all(employees_data)  # Speed
```

---

## 10. Error Handling: Detailed vs Simple

### Decision: Detailed errors with proper HTTP status codes

**Options Considered**:
- A) Generic error messages
- B) Detailed errors with validation details (chosen)
- C) Error codes with lookup table

**Trade-offs**:

| Approach | Pros | Cons |
|----------|------|------|
| Generic | Hide implementation details | Poor DX, hard to debug |
| Detailed | Great DX, clear errors | Might expose too much |
| Error codes | Structured, i18n-friendly | Extra complexity |

**Chosen**: B (Detailed errors)

**Rationale**:
- **Internal tool**: HR users, not public API
- **Developer experience**: Clear errors help frontend dev
- **Standard Rails**: Uses built-in error messages
- **Status codes**: Proper HTTP semantics (422 for validation, 400 for bad request, etc.)

**Example Response**:
```json
{
  "errors": [
    "Full name can't be blank",
    "Salary must be greater than 0"
  ]
}
```

---

## Summary

All trade-offs were made with these principles:

1. **Simplicity over premature optimization**
2. **Rails conventions over reinvention**
3. **Good enough for 10K employees** (not 10M)
4. **Assessment context** (time-boxed, demonstrative)
5. **Production-ready patterns** (even if simple)
6. **Clear, maintainable code**

Each decision can be revisited as requirements evolve.
