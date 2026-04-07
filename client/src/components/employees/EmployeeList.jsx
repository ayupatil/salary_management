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
import { TextField } from '@/components/ui/text-field';
import { Dropdown } from '@/components/ui/dropdown';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { COUNTRY_OPTIONS, JOB_TITLE_OPTIONS, ITEMS_PER_PAGE } from '@/utils/constants';
import { formatCurrency, formatNumber } from '@/utils/formatters';

function EmployeeList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [country, setCountry] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const perPage = ITEMS_PER_PAGE;

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

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <TextField
            id="search"
            label="Search"
            placeholder="Search by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={handleSearchBlur}
            clearable
            onClear={handleClearSearch}
          />

          {/* Country Filter */}
          <Dropdown
            id="country"
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            options={COUNTRY_OPTIONS}
          />

          {/* Job Title Filter */}
          <Dropdown
            id="job-title"
            label="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            options={JOB_TITLE_OPTIONS}
          />
        </div>

        {/* Reset Filters Button */}
        {(country || jobTitle || searchTerm) && (
          <div className="mt-4">
            <Button variant="secondary" onClick={handleResetFilters}>
              Reset Filters
            </Button>
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
            <EmptyState
              title="No employees found"
              description="Try adjusting your filters or search criteria"
            />
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
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}

export default EmployeeList;
