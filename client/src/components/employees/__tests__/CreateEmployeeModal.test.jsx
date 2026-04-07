import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import CreateEmployeeModal from '../CreateEmployeeModal';
import { employeeService } from '@/services/employeeService';

// Mock the employee service
vi.mock('@/services/employeeService', () => ({
  employeeService: {
    createEmployee: vi.fn(),
  },
}));

// Helper function to render with React Query and Toast
const renderWithProviders = (component) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {component}
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('CreateEmployeeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render trigger button', () => {
    renderWithProviders(<CreateEmployeeModal />);
    expect(screen.getByRole('button', { name: /add employee/i })).toBeInTheDocument();
  });

  it('should open dialog when trigger button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEmployeeModal />);

    const triggerButton = screen.getByRole('button', { name: /add employee/i });
    await user.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/create employee/i)).toBeInTheDocument();
    });
  });

  it('should render all form fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEmployeeModal />);

    await user.click(screen.getByRole('button', { name: /add employee/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
    });
  });

  it('should show validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEmployeeModal />);

    await user.click(screen.getByRole('button', { name: /add employee/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/job title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/country is required/i)).toBeInTheDocument();
      expect(screen.getByText(/salary is required/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for name less than 2 characters', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEmployeeModal />);

    await user.click(screen.getByRole('button', { name: /add employee/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/full name/i);
    await user.type(nameInput, 'A');

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for salary less than or equal to 0', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEmployeeModal />);

    await user.click(screen.getByRole('button', { name: /add employee/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const salaryInput = screen.getByLabelText(/salary/i);
    await user.type(salaryInput, '0');

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be greater than 0/i)).toBeInTheDocument();
    });
  });

  it('should successfully create employee with valid data', async () => {
    const user = userEvent.setup();
    const mockEmployee = {
      id: 1,
      full_name: 'John Doe',
      job_title: 'Engineer',
      country: 'USA',
      salary: 75000,
    };

    employeeService.createEmployee.mockResolvedValue(mockEmployee);

    renderWithProviders(<CreateEmployeeModal />);

    await user.click(screen.getByRole('button', { name: /add employee/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Fill form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.selectOptions(screen.getByLabelText(/job title/i), 'Engineer');
    await user.selectOptions(screen.getByLabelText(/country/i), 'USA');
    await user.type(screen.getByLabelText(/salary/i), '75000');

    // Submit
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(employeeService.createEmployee).toHaveBeenCalledWith(
        {
          full_name: 'John Doe',
          job_title: 'Engineer',
          country: 'USA',
          salary: 75000,
        },
        expect.anything() // React Query passes additional context
      );
    });
  });

  it('should close dialog after successful submission', async () => {
    const user = userEvent.setup();
    const mockEmployee = {
      id: 1,
      full_name: 'John Doe',
      job_title: 'Engineer',
      country: 'USA',
      salary: 75000,
    };

    employeeService.createEmployee.mockResolvedValue(mockEmployee);

    renderWithProviders(<CreateEmployeeModal />);

    await user.click(screen.getByRole('button', { name: /add employee/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Fill and submit form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.selectOptions(screen.getByLabelText(/job title/i), 'Engineer');
    await user.selectOptions(screen.getByLabelText(/country/i), 'USA');
    await user.type(screen.getByLabelText(/salary/i), '75000');

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Success toast should appear
    await waitFor(() => {
      expect(screen.getByText(/employee created successfully/i)).toBeInTheDocument();
    });

    // Dialog should close immediately
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should display error toast on API failure', async () => {
    const user = userEvent.setup();
    employeeService.createEmployee.mockRejectedValue(
      new Error('Failed to create employee')
    );

    renderWithProviders(<CreateEmployeeModal />);

    await user.click(screen.getByRole('button', { name: /add employee/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Fill and submit form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.selectOptions(screen.getByLabelText(/job title/i), 'Engineer');
    await user.selectOptions(screen.getByLabelText(/country/i), 'USA');
    await user.type(screen.getByLabelText(/salary/i), '75000');

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Error toast should appear
    await waitFor(() => {
      expect(screen.getByText(/failed to create employee/i)).toBeInTheDocument();
    });
  });

  it('should reset form when dialog is closed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateEmployeeModal />);

    await user.click(screen.getByRole('button', { name: /add employee/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Fill form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/salary/i), '75000');

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Reopen dialog
    await user.click(screen.getByRole('button', { name: /add employee/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toHaveValue('');
      expect(screen.getByLabelText(/salary/i)).toHaveValue(null);
    });
  });
});