import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EmployeeList from '../EmployeeList';
import { employeeService } from '@/services/employeeService';

// Mock the employee service
vi.mock('@/services/employeeService', () => ({
  employeeService: {
    getEmployees: vi.fn(),
  },
}));

// Helper function to render with React Query
const renderWithQuery = (component) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('EmployeeList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state while fetching employees', () => {
    employeeService.getEmployees.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithQuery(<EmployeeList />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render employee table with data', async () => {
    const mockData = {
      employees: [
        {
          id: 1,
          full_name: 'John Doe',
          job_title: 'Engineer',
          country: 'India',
          salary: 75000,
        },
        {
          id: 2,
          full_name: 'Jane Smith',
          job_title: 'Manager',
          country: 'USA',
          salary: 95000,
        },
      ],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_count: 2,
        per_page: 50,
      },
    };

    employeeService.getEmployees.mockResolvedValue(mockData);

    renderWithQuery(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should display all employee columns', async () => {
    const mockData = {
      employees: [
        {
          id: 1,
          full_name: 'John Doe',
          job_title: 'Engineer',
          country: 'India',
          salary: 75000,
        },
      ],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_count: 1,
        per_page: 50,
      },
    };

    employeeService.getEmployees.mockResolvedValue(mockData);

    renderWithQuery(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('Job Title')).toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Engineer')).toBeInTheDocument();
      expect(screen.getByText('India')).toBeInTheDocument();
      expect(screen.getByText('$75,000')).toBeInTheDocument();
    });
  });

  it('should show error message on fetch failure', async () => {
    employeeService.getEmployees.mockRejectedValue(
      new Error('Failed to fetch employees')
    );

    renderWithQuery(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to fetch employees/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no employees', async () => {
    const mockData = {
      employees: [],
      pagination: {
        current_page: 1,
        total_pages: 0,
        total_count: 0,
        per_page: 50,
      },
    };

    employeeService.getEmployees.mockResolvedValue(mockData);

    renderWithQuery(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByText(/no employees found/i)).toBeInTheDocument();
    });
  });

  it('should show pagination metadata', async () => {
    const mockData = {
      employees: [
        {
          id: 1,
          full_name: 'John Doe',
          job_title: 'Engineer',
          country: 'India',
          salary: 75000,
        },
      ],
      pagination: {
        current_page: 1,
        total_pages: 200,
        total_count: 10000,
        per_page: 50,
      },
    };

    employeeService.getEmployees.mockResolvedValue(mockData);

    renderWithQuery(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByText(/showing 1 of 10,000 employees/i)).toBeInTheDocument();
    });
  });
});
