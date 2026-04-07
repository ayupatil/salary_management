import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import { employeeService } from '@/services/employeeService';

// Mock the employee service
vi.mock('@/services/employeeService', () => ({
  employeeService: {
    deleteEmployee: vi.fn(),
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

describe('DeleteConfirmationModal', () => {
  let mockOnOpenChange;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnOpenChange = vi.fn();
  });

  it('should render modal when open', () => {
    renderWithProviders(
      <DeleteConfirmationModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /delete employee/i })).toBeInTheDocument();
  });

  it('should display employee information', () => {
    renderWithProviders(
      <DeleteConfirmationModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(screen.getByText('USA')).toBeInTheDocument();
  });

  it('should show confirmation message', () => {
    renderWithProviders(
      <DeleteConfirmationModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByText(/are you sure you want to delete this employee/i)).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
  });

  it('should have Cancel and Delete buttons', () => {
    renderWithProviders(
      <DeleteConfirmationModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete employee/i })).toBeInTheDocument();
  });

  it('should close modal when cancel button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <DeleteConfirmationModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should successfully delete employee when confirmed', async () => {
    const user = userEvent.setup();
    employeeService.deleteEmployee.mockResolvedValue({ id: 1 });

    renderWithProviders(
      <DeleteConfirmationModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete employee/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(employeeService.deleteEmployee).toHaveBeenCalledWith(
        1,
        expect.anything() // React Query passes additional context
      );
    });
  });

  it('should display success toast on successful delete', async () => {
    const user = userEvent.setup();
    employeeService.deleteEmployee.mockResolvedValue({ id: 1 });

    renderWithProviders(
      <DeleteConfirmationModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete employee/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/employee deleted successfully/i)).toBeInTheDocument();
    });
  });

  it('should close modal after successful delete', async () => {
    const user = userEvent.setup();
    employeeService.deleteEmployee.mockResolvedValue({ id: 1 });

    renderWithProviders(
      <DeleteConfirmationModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete employee/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should display error toast on API failure', async () => {
    const user = userEvent.setup();
    employeeService.deleteEmployee.mockRejectedValue(
      new Error('Failed to delete employee')
    );

    renderWithProviders(
      <DeleteConfirmationModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete employee/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to delete employee/i)).toBeInTheDocument();
    });
  });

  it('should show loading state while deleting', async () => {
    const user = userEvent.setup();
    employeeService.deleteEmployee.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders(
      <DeleteConfirmationModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete employee/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /deleting/i })).toBeInTheDocument();
    });
  });

  it('should disable buttons while deleting', async () => {
    const user = userEvent.setup();
    employeeService.deleteEmployee.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders(
      <DeleteConfirmationModal
        employee={mockEmployee}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete employee/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
    });
  });
});
