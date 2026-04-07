import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

function EmployeeList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [country, setCountry] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const perPage = 50;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [country, jobTitle, searchTerm]);

  // Handle search on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchTerm(searchInput);
    }
  };

  // Handle search on blur
  const handleSearchBlur = () => {
    setSearchTerm(searchInput);
  };

  // Handle clear search (clears text and removes name filter from query)
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
  };

  // Handle reset all filters
  const handleResetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setCountry('');
    setJobTitle('');
  };

  // Build query parameters
  const queryParams = {
    page: currentPage,
    perPage,
    ...(country && { country }),
    ...(jobTitle && { jobTitle }),
    ...(searchTerm && { search: searchTerm }),
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['employees', queryParams],
    queryFn: () => employeeService.getEmployees(queryParams),
  });

  const employees = data?.employees || [];
  const pagination = data?.pagination || {};

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onBlur={handleSearchBlur}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Country Filter */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
            </select>
          </div>

          {/* Job Title Filter */}
          <div>
            <label htmlFor="job-title" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <select
              id="job-title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Job Titles</option>
              <option value="Engineer">Engineer</option>
              <option value="Manager">Manager</option>
              <option value="Designer">Designer</option>
              <option value="QA">QA</option>
              <option value="HR">HR</option>
            </select>
          </div>
        </div>

        {/* Reset Filters Button */}
        {(country || jobTitle || searchTerm) && (
          <div className="mt-4">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <div className="text-center text-gray-500">Loading employees...</div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Error: {error?.message || 'Failed to fetch employees'}
          </AlertDescription>
        </Alert>
      )}

      {/* Content - show when not loading and not error */}
      {!isLoading && !isError && (
        <>
          {/* Pagination info */}
          {employees.length > 0 && (
            <div className="flex items-center justify-end mr-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{employees.length}</span> of <span className="font-semibold text-gray-900">{formatNumber(pagination.total_count || 0)}</span> employees
              </div>
            </div>
          )}

          {/* Table or Empty State */}
          {employees.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No employees found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your filters or search criteria
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-200">
                      <TableHead className="font-bold text-gray-900">Full Name</TableHead>
                      <TableHead className="font-bold text-gray-900">Job Title</TableHead>
                      <TableHead className="font-bold text-gray-900">Country</TableHead>
                      <TableHead className="font-bold text-gray-900 text-right">Salary</TableHead>
                      <TableHead className="font-bold text-gray-900 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-bold text-gray-900">{employee.full_name}</TableCell>
                        <TableCell className="text-gray-700">{employee.job_title}</TableCell>
                        <TableCell className="text-gray-700">{employee.country}</TableCell>
                        <TableCell className="text-gray-700 font-semibold text-right">{formatCurrency(employee.salary)}</TableCell>
                        <TableCell>
                          {/* Action buttons will be added later */}
                          <div className="flex gap-3 justify-center">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors">
                              Delete
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {employees.length > 0 && (
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={pagination.current_page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="text-sm text-gray-700">
                Page <span className="font-semibold">{pagination.current_page}</span> of{' '}
                <span className="font-semibold">{pagination.total_pages}</span>
              </div>

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={pagination.current_page === pagination.total_pages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EmployeeList;
