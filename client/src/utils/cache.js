/**
 * Cache Management Utilities
 * 
 * Centralized cache invalidation logic for React Query.
 * Use these functions after CRUD operations to keep data fresh.
 */

/**
 * Invalidate employee list cache
 * Call this after: Create, Update, Delete operations
 * 
 * @param {QueryClient} queryClient - React Query client instance
 */
export function invalidateEmployees(queryClient) {
  queryClient.invalidateQueries({ 
    queryKey: ['employees'],
    // Refetch active queries immediately
    refetchType: 'active',
  });
}

/**
 * Invalidate insights cache
 * Call this after: Create, Update, Delete operations that affect salary data
 * 
 * @param {QueryClient} queryClient - React Query client instance
 */
export function invalidateInsights(queryClient) {
  queryClient.invalidateQueries({ 
    queryKey: ['insights'],
    refetchType: 'active',
  });
}

/**
 * Invalidate all employee-related caches
 * Use this for major operations that affect multiple data sets
 * 
 * @param {QueryClient} queryClient - React Query client instance
 */
export function invalidateAllEmployeeData(queryClient) {
  invalidateEmployees(queryClient);
  invalidateInsights(queryClient);
}

/**
 * Optimistically update a single employee in the cache
 * Use this for immediate UI updates before server confirmation
 * 
 * @param {QueryClient} queryClient - React Query client instance
 * @param {Object} updatedEmployee - The updated employee data
 */
export function updateEmployeeInCache(queryClient, updatedEmployee) {
  // Update all employee list queries that might contain this employee
  queryClient.setQueriesData(
    { queryKey: ['employees'] },
    (oldData) => {
      if (!oldData?.employees) return oldData;
      
      return {
        ...oldData,
        employees: oldData.employees.map((emp) =>
          emp.id === updatedEmployee.id ? { ...emp, ...updatedEmployee } : emp
        ),
      };
    }
  );
}

/**
 * Remove an employee from cache (optimistic delete)
 * Use this for immediate UI updates before server confirmation
 * 
 * @param {QueryClient} queryClient - React Query client instance
 * @param {number} employeeId - The ID of the employee to remove
 */
export function removeEmployeeFromCache(queryClient, employeeId) {
  queryClient.setQueriesData(
    { queryKey: ['employees'] },
    (oldData) => {
      if (!oldData?.employees) return oldData;
      
      return {
        ...oldData,
        employees: oldData.employees.filter((emp) => emp.id !== employeeId),
        pagination: {
          ...oldData.pagination,
          total_count: oldData.pagination.total_count - 1,
        },
      };
    }
  );
}
