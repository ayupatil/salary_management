import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import EditEmployeeModal from '../EditEmployeeModal';
import { employeeService } from '@/services/employeeService';

// Mock the employee service
vi.mock('@/services/employeeService', () => ({
  employeeService: {
    updateEmployee: vi.fn(),
  },
}));

// Helper function to render with providers
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

const mockEmployee = {
  id: 1,
  full_name: 'John Doe',
  job_title: 'Engineer',
  country: 'USA',
  salary: 75000,
};

describe('EditEmployeeModal', () => {
  let mockOnOpenChange;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnOpenChange = vi.fn();
  });

  it('should render modal when open', () => {
    renderWithProviders(
      <EditEmployeeModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/edit employee/i)).toBeInTheDocument();
  });

  it('should pre-populate form with employee data', () => {
    renderWithProviders(
      <EditEmployeeModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/job title/i)).toHaveValue('Engineer');
    expect(screen.getByLabelText(/country/i)).toHaveValue('USA');
    expect(screen.getByLabelText(/salary/i)).toHaveValue(75000);
  });

  it('should show Update button', () => {
    renderWithProviders(
      <EditEmployeeModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
  });

  it('should successfully update employee with valid data', async () => {
    const user = userEvent.setup();
    const updatedEmployee = {
      id: 1,
      full_name: 'John Smith',
      job_title: 'Manager',
      country: 'UK',
      salary: 85000,
    };

    employeeService.updateEmployee.mockResolvedValue(updatedEmployee);

    renderWithProviders(
      <EditEmployeeModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Update form fields
    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'John Smith');
    
    await user.selectOptions(screen.getByLabelText(/job title/i), 'Manager');
    await user.selectOptions(screen.getByLabelText(/country/i), 'UK');
    
    const salaryInput = screen.getByLabelText(/salary/i);
    await user.clear(salaryInput);
    await user.type(salaryInput, '85000');

    // Submit
    const submitButton = screen.getByRole('button', { name: /update/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(employeeService.updateEmployee).toHaveBeenCalledWith(
        {
          id: 1,
          full_name: 'John Smith',
          job_title: 'Manager',
          country: 'UK',
          salary: 85000,
        },
        expect.anything() // React Query passes additional context
      );
    });
  });

  it('should display success toast on successful update', async () => {
    const user = userEvent.setup();
    const updatedEmployee = { ...mockEmployee, full_name: 'John Smith' };

    employeeService.updateEmployee.mockResolvedValue(updatedEmployee);

    renderWithProviders(
      <EditEmployeeModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const submitButton = screen.getByRole('button', { name: /update/i });
    await user.click(submitButton);

    // Wait for API call to complete and toast to appear
    await waitFor(() => {
      expect(employeeService.updateEmployee).toHaveBeenCalled();
    });

    // Toast should be visible
    await waitFor(() => {
      expect(screen.getByText(/employee updated successfully/i)).toBeInTheDocument();
    });
  });

  it('should close modal after successful update', async () => {
    const user = userEvent.setup();
    const updatedEmployee = { ...mockEmployee };

    employeeService.updateEmployee.mockResolvedValue(updatedEmployee);

    renderWithProviders(
      <EditEmployeeModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const submitButton = screen.getByRole('button', { name: /update/i });
    await user.click(submitButton);

    // Wait for API to complete
    await waitFor(() => {
      expect(employeeService.updateEmployee).toHaveBeenCalled();
    });

    // Modal should close
    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should display error toast on API failure', async () => {
    const user = userEvent.setup();
    employeeService.updateEmployee.mockRejectedValue(
      new Error('Failed to update employee')
    );

    renderWithProviders(
      <EditEmployeeModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const submitButton = screen.getByRole('button', { name: /update/i });
    await user.click(submitButton);

    // Wait for API call to fail
    await waitFor(() => {
      expect(employeeService.updateEmployee).toHaveBeenCalled();
    });

    // Error toast should appear
    await waitFor(() => {
      expect(screen.getByText(/failed to update employee/i)).toBeInTheDocument();
    });
  });

  it('should show validation errors for invalid data', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <EditEmployeeModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Clear name to trigger validation error
    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);

    const submitButton = screen.getByRole('button', { name: /update/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });
  });

  it('should close modal when cancel button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <EditEmployeeModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
