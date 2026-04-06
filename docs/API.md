# API Documentation

Base URL: `http://localhost:3000` (development)

## Authentication

Currently, no authentication is required. In a production system, all endpoints would require authentication and authorization.

## Response Format

All responses are in JSON format.

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "errors": ["Error message 1", "Error message 2"]
}
```

or

```json
{
  "error": "Error message"
}
```

## Endpoints

### 1. List Employees

**GET** `/employees`

Retrieve a paginated list of employees with optional filtering.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `per_page` | integer | No | 50 | Items per page (max 100) |
| `country` | string | No | - | Filter by country |
| `job_title` | string | No | - | Filter by job title |
| `search` | string | No | - | Search by name (partial match) |

#### Example Request

```bash
# Get first page
curl "http://localhost:3000/employees"

# Get second page with 20 items
curl "http://localhost:3000/employees?page=2&per_page=20"

# Filter by country
curl "http://localhost:3000/employees?country=India"

# Filter by country and job title
curl "http://localhost:3000/employees?country=India&job_title=Engineer"

# Search by name
curl "http://localhost:3000/employees?search=John"

# Combine filters
curl "http://localhost:3000/employees?country=India&search=John&page=1&per_page=25"
```

#### Example Response

```json
{
  "employees": [
    {
      "id": 1,
      "full_name": "John Doe",
      "job_title": "Engineer",
      "country": "India",
      "salary": 75000,
      "created_at": "2024-04-05T10:30:00.000Z",
      "updated_at": "2024-04-05T10:30:00.000Z"
    },
    {
      "id": 2,
      "full_name": "Jane Smith",
      "job_title": "Manager",
      "country": "USA",
      "salary": 95000,
      "created_at": "2024-04-05T10:31:00.000Z",
      "updated_at": "2024-04-05T10:31:00.000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 200,
    "total_count": 10000,
    "per_page": 50
  }
}
```

#### Status Codes
- `200 OK` - Success

---

### 2. Get Single Employee

**GET** `/employees/:id`

Retrieve a single employee by ID.

#### Example Request

```bash
curl "http://localhost:3000/employees/1"
```

#### Example Response

```json
{
  "id": 1,
  "full_name": "John Doe",
  "job_title": "Engineer",
  "country": "India",
  "salary": 75000,
  "created_at": "2024-04-05T10:30:00.000Z",
  "updated_at": "2024-04-05T10:30:00.000Z"
}
```

#### Status Codes
- `200 OK` - Success
- `404 Not Found` - Employee not found

---

### 3. Create Employee

**POST** `/employees`

Create a new employee.

#### Request Body

```json
{
  "employee": {
    "full_name": "John Doe",
    "job_title": "Engineer",
    "country": "India",
    "salary": 75000
  }
}
```

#### Field Validations

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `full_name` | string | Yes | Min 2 characters |
| `job_title` | string | Yes | Present |
| `country` | string | Yes | Present |
| `salary` | integer | Yes | Greater than 0 |

#### Example Request

```bash
curl -X POST "http://localhost:3000/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "employee": {
      "full_name": "John Doe",
      "job_title": "Engineer",
      "country": "India",
      "salary": 75000
    }
  }'
```

#### Example Success Response

```json
{
  "id": 10001,
  "full_name": "John Doe",
  "job_title": "Engineer",
  "country": "India",
  "salary": 75000,
  "created_at": "2024-04-06T14:22:00.000Z",
  "updated_at": "2024-04-06T14:22:00.000Z"
}
```

#### Example Error Response

```json
{
  "errors": [
    "Full name is too short (minimum is 2 characters)",
    "Salary must be greater than 0"
  ]
}
```

#### Status Codes
- `201 Created` - Employee created successfully
- `422 Unprocessable Entity` - Validation errors

---

### 4. Update Employee

**PATCH** `/employees/:id`

Update an existing employee.

#### Request Body

```json
{
  "employee": {
    "full_name": "John Updated",
    "salary": 85000
  }
}
```

Note: Only include fields you want to update.

#### Example Request

```bash
curl -X PATCH "http://localhost:3000/employees/1" \
  -H "Content-Type: application/json" \
  -d '{
    "employee": {
      "salary": 85000
    }
  }'
```

#### Example Success Response

```json
{
  "id": 1,
  "full_name": "John Doe",
  "job_title": "Engineer",
  "country": "India",
  "salary": 85000,
  "created_at": "2024-04-05T10:30:00.000Z",
  "updated_at": "2024-04-06T14:25:00.000Z"
}
```

#### Example Error Response

```json
{
  "errors": [
    "Salary must be greater than 0"
  ]
}
```

#### Status Codes
- `200 OK` - Employee updated successfully
- `404 Not Found` - Employee not found
- `422 Unprocessable Entity` - Validation errors

---

### 5. Delete Employee

**DELETE** `/employees/:id`

Soft delete an employee (sets `deleted_at` timestamp).

#### Example Request

```bash
curl -X DELETE "http://localhost:3000/employees/1"
```

#### Example Response

No response body (status `204`)

#### Status Codes
- `204 No Content` - Employee deleted successfully
- `404 Not Found` - Employee not found

---

### 6. Get Salary Insights

**GET** `/employees/insights`

Get salary insights for a specific country, optionally filtered by job title.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country` | string | **Yes** | Country to get insights for |
| `job_title` | string | No | Filter insights by job title |

#### Example Request

```bash
# Country insights
curl "http://localhost:3000/employees/insights?country=India"

# Country + Job title insights
curl "http://localhost:3000/employees/insights?country=India&job_title=Engineer"
```

#### Example Response (Country Only)

```json
{
  "min_salary": 40000,
  "max_salary": 200000,
  "avg_salary": 95234.5,
  "total_employees": 2034
}
```

#### Example Response (Country + Job Title)

```json
{
  "min_salary": 50000,
  "max_salary": 150000,
  "avg_salary": 87500.0,
  "total_employees": 512
}
```

#### Example Error Response (Missing Country)

```json
{
  "error": "Country is required"
}
```

#### Status Codes
- `200 OK` - Success
- `400 Bad Request` - Missing required parameter (country)

---

## Available Values

### Countries
- India
- USA
- UK
- Germany
- France

### Job Titles
- Engineer
- Manager
- Designer
- QA
- HR

---

## Notes

1. **Soft Delete**: Deleted employees are not included in any queries. They have a `deleted_at` timestamp set.

2. **Pagination**: 
   - Default is 50 items per page
   - Maximum is 100 items per page
   - Requesting more than 100 will be capped at 100

3. **Search**: 
   - Case-insensitive partial match on `full_name`
   - Uses SQL LIKE query

4. **Filtering**:
   - Filters can be combined
   - All filters are exact match (except search)

5. **CORS**:
   - Enabled for `localhost:5173` (Vite dev server)
   - Enabled for `localhost:3000` (alternative dev server)
   - Will be enabled for production frontend domain

6. **Performance**:
   - Database indexed on `country`, `job_title`, and combination
   - Insights queries are optimized with aggregations
   - Search may be slower on very large result sets

---

## Testing with cURL

### Full CRUD Example

```bash
# 1. Create
EMPLOYEE_ID=$(curl -s -X POST "http://localhost:3000/employees" \
  -H "Content-Type: application/json" \
  -d '{"employee":{"full_name":"Test User","job_title":"Engineer","country":"India","salary":50000}}' \
  | jq -r '.id')

echo "Created employee with ID: $EMPLOYEE_ID"

# 2. Read
curl "http://localhost:3000/employees/$EMPLOYEE_ID" | jq

# 3. Update
curl -X PATCH "http://localhost:3000/employees/$EMPLOYEE_ID" \
  -H "Content-Type: application/json" \
  -d '{"employee":{"salary":60000}}' | jq

# 4. List (verify update)
curl "http://localhost:3000/employees?search=Test" | jq

# 5. Delete
curl -X DELETE "http://localhost:3000/employees/$EMPLOYEE_ID"

# 6. Verify deletion
curl "http://localhost:3000/employees/$EMPLOYEE_ID"  # Should return 404
```

---

## Postman Collection

A Postman collection is available in `/docs/postman_collection.json` (TBD) for easy API testing.
