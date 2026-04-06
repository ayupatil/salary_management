import { useState } from 'react';
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
  const perPage = 50;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['employees', { page: currentPage, perPage }],
    queryFn: () => employeeService.getEmployees({ page: currentPage, perPage }),
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <div className="text-center text-gray-500">Loading employees...</div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error: {error?.message || 'Failed to fetch employees'}
        </AlertDescription>
      </Alert>
    );
  }

  const employees = data?.employees || [];
  const pagination = data?.pagination || {};

  // Empty state
  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No employees found</p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your filters or add a new employee
        </p>
      </div>
    );
  }

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
    <div className="space-y-2">
      {/* Pagination info */}
      <div className="flex items-center justify-end mr-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{employees.length}</span> of <span className="font-semibold text-gray-900">{formatNumber(pagination.total_count || 0)}</span> employees
        </div>
      </div>

      {/* Table */}
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

      {/* Pagination Controls */}
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
    </div>
  );
}

export default EmployeeList;
