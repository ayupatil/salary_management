# Caching Strategy

## Overview

The application uses **React Query** for data fetching and caching. This provides:
- Automatic background refetching
- Cache invalidation on mutations
- Optimistic updates
- Stale-while-revalidate patterns

---

## Cache Configuration

### Global Settings (main.jsx)

```javascript
{
  queries: {
    staleTime: 5 * 60 * 1000,    // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000,      // 10 minutes - cache persists in memory
    refetchOnWindowFocus: false, // Don't refetch when tab regains focus
    retry: 1,                     // Retry failed requests once
  }
}
```

**What this means:**
- Fetched data is considered "fresh" for 5 minutes (no automatic refetch)
- Cache stays in memory for 10 minutes after last use
- Navigating back to the employee list uses cached data if < 5 minutes old
- After 5 minutes, data is "stale" but still shown while refetching in background

---

## Cache Keys

### Employee List
```javascript
['employees', { page, perPage, country, jobTitle, search }]
```

Each unique combination of filters creates a separate cache entry:
- `['employees', { page: 1, perPage: 50 }]`
- `['employees', { page: 1, perPage: 50, country: 'USA' }]`
- `['employees', { page: 2, perPage: 50, country: 'USA' }]`

**Benefits:**
- Instant navigation between cached pages
- No refetch when switching between saved filter combinations
- Independent cache entries for different views

### Insights (Future)
```javascript
['insights', { country?, jobTitle? }]
```

---

## Cache Invalidation

### When Cache is Cleared

**Create Employee:**
```javascript
invalidateAllEmployeeData(queryClient);
// Clears: ['employees'] and ['insights']
```

**Update Employee (Future):**
```javascript
invalidateAllEmployeeData(queryClient);
// OR optimistic update:
updateEmployeeInCache(queryClient, updatedEmployee);
```

**Delete Employee (Future):**
```javascript
invalidateAllEmployeeData(queryClient);
// OR optimistic delete:
removeEmployeeFromCache(queryClient, employeeId);
```

---

## Placeholder Data (Keep Previous Data)

When paginating or changing filters, the old data remains visible with a loading overlay:

```javascript
useQuery({
  queryKey: ['employees', queryParams],
  queryFn: () => employeeService.getEmployees(queryParams),
  placeholderData: keepPreviousData, // Show old data while fetching
});
```

**User Experience:**
- No blank screen when changing pages
- Smooth transitions between views
- Loading indicator overlay on table
- Better perceived performance

---

## Cache Utilities (`utils/cache.js`)

### Available Functions

#### `invalidateEmployees(queryClient)`
Invalidates all employee list caches. Use after:
- Creating an employee
- Updating an employee
- Deleting an employee

#### `invalidateInsights(queryClient)`
Invalidates insights cache. Use after operations affecting salary data.

#### `invalidateAllEmployeeData(queryClient)`
Clears both employees and insights caches. **Recommended for most CRUD operations.**

#### `updateEmployeeInCache(queryClient, updatedEmployee)`
Optimistically updates a single employee across all cached queries. Use for instant UI updates.

#### `removeEmployeeFromCache(queryClient, employeeId)`
Optimistically removes an employee from all cached queries. Use for instant delete feedback.

---

## Performance Characteristics

### With 10,000 Employees

**First Load (No Cache):**
- API request: ~200-500ms
- Render: ~50-100ms
- Total: ~300-600ms

**Subsequent Loads (Cached, < 5 min):**
- API request: 0ms (cached)
- Render: ~50ms
- Total: ~50ms ⚡ **83-90% faster**

**Stale Data (> 5 min):**
- Show cached data immediately: ~50ms
- Background refetch: ~200-500ms
- Update UI when ready
- User sees instant response ⚡

### Pagination Performance

**Without keepPreviousData:**
- Blank screen while fetching new page
- Perceived as "slow" (300-600ms delay)

**With keepPreviousData:**
- Old page shown immediately
- Loading overlay appears
- New data fades in when ready
- Perceived as "instant" ⚡

---

## Memory Usage

### Cache Size Estimation

**Single Page (50 employees):**
- ~5KB per employee × 50 = ~250KB
- Pagination metadata: ~1KB
- **Total per page: ~251KB**

**With 5 Different Filter Combinations:**
- 5 pages × 251KB = ~1.25MB in memory
- Acceptable for modern browsers (typically 2GB+ available)

**Garbage Collection:**
- Unused cache entries removed after 10 minutes
- Keeps memory usage bounded
- Automatic cleanup, no manual intervention needed

---

## Best Practices

### ✅ DO:
- Use `invalidateAllEmployeeData()` after CRUD operations
- Use `placeholderData: keepPreviousData` for paginated lists
- Keep `staleTime` reasonable (5 minutes for most data)
- Increase `gcTime` if users frequently switch between views

### ❌ DON'T:
- Set `staleTime: 0` (defeats caching purpose)
- Set `staleTime: Infinity` (data never refetches)
- Manually invalidate on every filter change (unnecessary)
- Forget to invalidate after mutations

---

## Debugging Cache

### React Query DevTools (Development Only)

Add to `main.jsx`:
```javascript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// In JSX:
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**Features:**
- View all cached queries
- See query states (fresh/stale/fetching)
- Manually trigger refetch/invalidation
- Inspect cache data

---

## Future Optimizations

### 1. Prefetching Next Page
```javascript
// Prefetch page 2 when on page 1
queryClient.prefetchQuery({
  queryKey: ['employees', { page: currentPage + 1, ...otherParams }],
  queryFn: () => employeeService.getEmployees({ page: currentPage + 1, ...otherParams }),
});
```

### 2. Optimistic Updates (Edit/Delete)
Already available in `utils/cache.js`:
- `updateEmployeeInCache()` - instant edit feedback
- `removeEmployeeFromCache()` - instant delete feedback

### 3. Persistent Cache (localStorage)
Use `persistQueryClient` from `@tanstack/react-query-persist-client` to cache across browser sessions.

### 4. Selective Invalidation
Instead of invalidating all employee queries, target specific ones:
```javascript
queryClient.invalidateQueries({ 
  queryKey: ['employees', { country: 'USA' }] 
});
```

---

## Monitoring

### Metrics to Track (Future)
- Cache hit rate
- Average response time (cached vs uncached)
- Memory usage
- Number of active queries
- Background refetch frequency

---

## Summary

✅ **Current Caching Benefits:**
- 5-minute fresh data window (no unnecessary refetches)
- 10-minute memory cache (instant navigation)
- Smooth pagination with placeholder data
- Automatic invalidation on CRUD operations
- Centralized cache management utilities

🚀 **Performance Impact:**
- 83-90% faster for cached data
- Instant page navigation (< 5 min)
- Smooth filter transitions
- Better perceived performance with placeholder data

📦 **Memory Usage:**
- ~250KB per cached page
- Automatic garbage collection after 10 minutes
- Scales well with multiple filter combinations
