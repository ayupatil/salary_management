import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
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
import CreateEmployeeModal from './CreateEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { COUNTRY_OPTIONS, JOB_TITLE_OPTIONS, ITEMS_PER_PAGE } from '@/utils/constants';
import { formatCurrency, formatNumber } from '@/utils/formatters';

function EmployeeList() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Edit modal state
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Delete modal state
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Initialize state from URL params
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page')) || 1
  );
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [jobTitle, setJobTitle] = useState(searchParams.get('jobTitle') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const perPage = ITEMS_PER_PAGE;

  // Sync URL params whenever filters change
  useEffect(() => {
    const params = {};
    if (currentPage > 1) params.page = currentPage;
    if (country) params.country = country;
    if (jobTitle) params.jobTitle = jobTitle;
    if (searchTerm) params.search = searchTerm;
    setSearchParams(params, { replace: true });
  }, [currentPage, country, jobTitle, searchTerm, setSearchParams]);

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

  // Handle edit employee
  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };

  // Handle delete employee
  const handleDeleteEmployee = (employee) => {
    setDeletingEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  // Build query parameters
  const queryParams = {
    page: currentPage,
    perPage,
    ...(country && { country }),
    ...(jobTitle && { jobTitle }),
    ...(searchTerm && { search: searchTerm }),
  };

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ['employees', queryParams],
    queryFn: () => employeeService.getEmployees(queryParams),
    placeholderData: keepPreviousData, // Keep previous page data while fetching new page
  });

  const employees = data?.employees || [];
  const pagination = data?.pagination || {};
  
  // Calculate employee range for current page
  const startCount = ((pagination.current_page || 1) - 1) * (pagination.per_page || 50) + 1;
  const endCount = startCount + employees.length - 1;
  
  // Pagination info display (reusable)
  const paginationInfo = employees.length > 0 ? (
    <div className="text-sm text-gray-600">
      Showing <span className="font-semibold text-gray-900">{formatNumber(startCount)}{employees.length > 0 && ` - ${formatNumber(endCount)}`}</span> of <span className="font-semibold text-gray-900">{formatNumber(pagination.total_count || 0)}</span> employees
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your organization's employee data
          </p>
        </div>
        <CreateEmployeeModal />
      </div>

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

        {/* Active Filters & Reset Button */}
        {(country || jobTitle || searchTerm) && (
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            
            {/* Active Filter Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {searchTerm && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  Search: "{searchTerm}"
                  <button
                    onClick={handleClearSearch}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    aria-label="Clear search"
                  >
                    <Icon icon="carbon:close" width="14" height="14" />
                  </button>
                </span>
              )}
              
              {country && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                  Country: {country}
                  <button
                    onClick={() => setCountry('')}
                    className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    aria-label="Clear country filter"
                  >
                    <Icon icon="carbon:close" width="14" height="14" />
                  </button>
                </span>
              )}
              
              {jobTitle && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  Job Title: {jobTitle}
                  <button
                    onClick={() => setJobTitle('')}
                    className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                    aria-label="Clear job title filter"
                  >
                    <Icon icon="carbon:close" width="14" height="14" />
                  </button>
                </span>
              )}
            </div>

            {/* Reset All Button */}
            <Button variant="outline" onClick={handleResetFilters} className="ml-auto">
              Reset All Filters
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
          {/* Pagination info and top pagination controls */}
          {employees.length > 0 && (
            <div className="flex items-center justify-end gap-4 mt-10">
              {paginationInfo}

              {/* Top Pagination Controls */}
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* Table or Empty State */}
          {employees.length === 0 ? (
            <EmptyState
              title="No employees found"
              description="Try adjusting your filters or search criteria"
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden relative">
              {/* Loading overlay when using placeholder data */}
              {isPlaceholderData && (
                <div className="absolute inset-0 bg-white bg-opacity-60 z-10 flex items-center justify-center">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                    Loading new data...
                  </div>
                </div>
              )}
              
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
                          <div className="flex gap-3 justify-center">
                            <button 
                              onClick={() => handleEditEmployee(employee)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                              aria-label={`Edit ${employee.full_name}`}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteEmployee(employee)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                              aria-label={`Delete ${employee.full_name}`}
                            >
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

          {/* Pagination Controls - Bottom */}
          {employees.length > 0 && (
              <div className="flex items-center justify-end gap-4">
                {paginationInfo}

                {/* Bottom Pagination Controls */}
                <Pagination
                    currentPage={pagination.current_page}
                    totalPages={pagination.total_pages}
                    onPageChange={setCurrentPage}
                />
              </div>
          )}
        </>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
          <EditEmployeeModal
              employee={editingEmployee}
              open={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
          />
      )}

      {/* Delete Confirmation Modal */}
      {deletingEmployee && (
          <DeleteConfirmationModal
              employee={deletingEmployee}
              open={isDeleteModalOpen}
              onOpenChange={setIsDeleteModalOpen}
          />
      )}
    </div>
  );
}

export default EmployeeList;
