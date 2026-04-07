import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { invalidateAllEmployeeData } from '@/utils/cache';

function DeleteConfirmationModal({ employee, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const mutation = useMutation({
    mutationFn: employeeService.deleteEmployee,
    onSuccess: () => {
      // Show success toast
      addToast('Employee deleted successfully!', 'success');
      
      // Invalidate all employee-related caches
      invalidateAllEmployeeData(queryClient);
      
      // Close modal
      onOpenChange(false);
    },
    onError: (error) => {
      // Show error toast
      addToast(error.message || 'Failed to delete employee', 'error');
    },
  });

  const handleDelete = () => {
    mutation.mutate(employee.id);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[425px]">
        <ModalHeader>
          <ModalTitle>Delete Employee</ModalTitle>
          <ModalDescription>
            Are you sure you want to delete this employee? This action cannot be undone.
          </ModalDescription>
        </ModalHeader>

        <div className="py-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Name:</span>
              <span className="text-sm font-bold text-gray-900">{employee.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Job Title:</span>
              <span className="text-sm text-gray-900">{employee.job_title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Country:</span>
              <span className="text-sm text-gray-900">{employee.country}</span>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Deleting...' : 'Delete Employee'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default DeleteConfirmationModal;
