import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/toast';
import EmployeeList from '../EmployeeList';
import { employeeService } from '@/services/employeeService';

// Mock the employee service
vi.mock('@/services/employeeService', () => ({
  employeeService: {
    getEmployees: vi.fn(),
  },
}));

// Helper function to render with React Query, Router, and Toast
const renderWithProviders = (component) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {component}
        </ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>
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

    renderWithProviders(<EmployeeList />);

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

    renderWithProviders(<EmployeeList />);

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

    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: 'Full Name' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Job Title' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Country' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Salary' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();
      
      expect(screen.getByRole('cell', { name: 'John Doe' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'Engineer' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'India' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: '$75,000' })).toBeInTheDocument();
    });
  });

  it('should show error message on fetch failure', async () => {
    employeeService.getEmployees.mockRejectedValue(
      new Error('Failed to fetch employees')
    );

    renderWithProviders(<EmployeeList />);

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

    renderWithProviders(<EmployeeList />);

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

    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      // Check for the pagination text (appears twice - top and bottom)
      const showingTexts = screen.getAllByText(/showing/i);
      expect(showingTexts).toHaveLength(2); // Top and bottom pagination info
      const totalCounts = screen.getAllByText('10,000');
      expect(totalCounts.length).toBeGreaterThan(0); // Total count appears multiple times
      const employeesText = screen.getAllByText(/employees/i);
      expect(employeesText.length).toBeGreaterThan(0);
    });
  });

  it('should render pagination controls with Previous and Next buttons', async () => {
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
        current_page: 2,
        total_pages: 5,
        total_count: 250,
        per_page: 50,
      },
    };

    employeeService.getEmployees.mockResolvedValue(mockData);

    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      const previousButtons = screen.getAllByRole('button', { name: /previous/i });
      const nextButtons = screen.getAllByRole('button', { name: /next/i });
      expect(previousButtons).toHaveLength(2); // Top and bottom pagination
      expect(nextButtons).toHaveLength(2); // Top and bottom pagination
      const pageTexts = screen.getAllByText(/page/i);
      expect(pageTexts).toHaveLength(2); // Top and bottom pagination controls show "Page X of Y"
      // Check that page numbers are displayed (will appear twice - once in each pagination control)
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    });
  });

  it('should disable Previous button on first page', async () => {
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
        total_pages: 5,
        total_count: 250,
        per_page: 50,
      },
    };

    employeeService.getEmployees.mockResolvedValue(mockData);

    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      const previousButtons = screen.getAllByRole('button', { name: /previous/i });
      const nextButtons = screen.getAllByRole('button', { name: /next/i });
      // Both Previous buttons (top and bottom) should be disabled on first page
      previousButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
      // Both Next buttons should be enabled
      nextButtons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  it('should disable Next button on last page', async () => {
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
        current_page: 5,
        total_pages: 5,
        total_count: 250,
        per_page: 50,
      },
    };

    employeeService.getEmployees.mockResolvedValue(mockData);

    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      const nextButtons = screen.getAllByRole('button', { name: /next/i });
      const previousButtons = screen.getAllByRole('button', { name: /previous/i });
      // Both Next buttons (top and bottom) should be disabled on last page
      nextButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
      // Both Previous buttons should be enabled
      previousButtons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  it('should fetch next page when Next button is clicked', async () => {
    const user = userEvent.setup();
    const mockDataPage1 = {
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
        total_pages: 2,
        total_count: 100,
        per_page: 50,
      },
    };

    const mockDataPage2 = {
      employees: [
        {
          id: 2,
          full_name: 'Jane Smith',
          job_title: 'Manager',
          country: 'USA',
          salary: 95000,
        },
      ],
      pagination: {
        current_page: 2,
        total_pages: 2,
        total_count: 100,
        per_page: 50,
      },
    };

    employeeService.getEmployees.mockResolvedValueOnce(mockDataPage1);

    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    employeeService.getEmployees.mockResolvedValueOnce(mockDataPage2);

    const nextButtons = screen.getAllByRole('button', { name: /next/i });
    await user.click(nextButtons[0]); // Click the first Next button (top pagination)

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(employeeService.getEmployees).toHaveBeenCalledWith({ page: 2, perPage: 50 });
    });
  });

  it('should render country filter dropdown', async () => {
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

    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    });
  });

  it('should render job title filter dropdown', async () => {
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

    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    });
  });

  it('should render search input', async () => {
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

    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
    });
  });

  it('should filter by country when country is selected', async () => {
    const user = userEvent.setup();
    const mockDataInitial = {
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

    const mockDataFiltered = {
      employees: [
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
        total_count: 1,
        per_page: 50,
      },
    };

    employeeService.getEmployees.mockResolvedValueOnce(mockDataInitial);

    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    employeeService.getEmployees.mockResolvedValueOnce(mockDataFiltered);

    const countrySelect = screen.getByLabelText(/country/i);
    await user.selectOptions(countrySelect, 'USA');

    await waitFor(() => {
      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        expect.objectContaining({ country: 'USA' })
      );
    });
  });

  it('should filter by job title when job title is selected', async () => {
    const user = userEvent.setup();
    const mockDataInitial = {
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

    employeeService.getEmployees.mockResolvedValueOnce(mockDataInitial);

    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const jobTitleSelect = screen.getByLabelText(/job title/i);
    await user.selectOptions(jobTitleSelect, 'Manager');

    await waitFor(() => {
      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        expect.objectContaining({ jobTitle: 'Manager' })
      );
    });
  });

  it('should search by name when typing in search input', async () => {
    const user = userEvent.setup();
    const mockDataInitial = {
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

    employeeService.getEmployees.mockResolvedValueOnce(mockDataInitial);

    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by name/i);
    await user.type(searchInput, 'Jane');
    
    // Trigger search by pressing Enter
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Jane' })
      );
    });
  });

  it('should reset to page 1 when filters change', async () => {
    const user = userEvent.setup();
    const mockDataPage2 = {
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
        current_page: 2,
        total_pages: 5,
        total_count: 250,
        per_page: 50,
      },
    };

    employeeService.getEmployees.mockResolvedValueOnce(mockDataPage2);

    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const countrySelect = screen.getByRole('combobox', { name: /country/i });
    await user.selectOptions(countrySelect, 'USA');

    await waitFor(() => {
      expect(employeeService.getEmployees).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, country: 'USA' })
      );
    });
  });
});
