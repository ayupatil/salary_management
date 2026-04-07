import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { invalidateAllEmployeeData } from '@/utils/cache';
import EmployeeForm from './EmployeeForm';

function EditEmployeeModal({ employee, open, onOpenChange }) {
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const mutation = useMutation({
    mutationFn: employeeService.updateEmployee,
    onSuccess: () => {
      // Show success toast
      addToast('Employee updated successfully!', 'success');
      
      // Invalidate all employee-related caches
      invalidateAllEmployeeData(queryClient);
      
      // Close modal without confirmation
      setIsDirty(false);
      onOpenChange(false);
    },
    onError: (error) => {
      // Show error toast
      addToast(error.message || 'Failed to update employee', 'error');
    },
  });

  const handleSubmit = (data) => {
    mutation.mutate({ id: employee.id, ...data });
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowConfirmation(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmation(false);
    setIsDirty(false);
    onOpenChange(false);
  };

  const handleCancelClose = () => {
    setShowConfirmation(false);
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen && isDirty) {
      // Show confirmation if trying to close with unsaved changes
      setShowConfirmation(true);
    } else {
      onOpenChange(newOpen);
    }
  };

  useEffect(() => {
    if (!open) {
      // Reset mutation state when modal closes
      mutation.reset();
      setIsDirty(false);
    }
  }, [open, mutation]);

  return (
    <>
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent 
          className="sm:max-w-[500px]"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            if (isDirty) {
              e.preventDefault();
              setShowConfirmation(true);
            }
          }}
        >
          <ModalHeader>
            <ModalTitle>Edit Employee</ModalTitle>
            <ModalDescription>
              Update employee information. All fields are required.
            </ModalDescription>
          </ModalHeader>

          <EmployeeForm
            defaultValues={{
              full_name: employee.full_name,
              job_title: employee.job_title,
              country: employee.country,
              salary: String(employee.salary), // Convert to string for validation
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={mutation.isPending}
            submitButtonText="Update"
            onFormChange={(dirty) => setIsDirty(dirty)}
          />
        </ModalContent>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal open={showConfirmation} onOpenChange={setShowConfirmation}>
        <ModalContent className="sm:max-w-[400px]">
          <ModalHeader>
            <ModalTitle>Discard Changes?</ModalTitle>
            <ModalDescription>
              You have unsaved changes. Are you sure you want to close this form? All changes will be lost.
            </ModalDescription>
          </ModalHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleCancelClose}>
              Keep Editing
            </Button>
            <Button variant="danger" onClick={handleConfirmClose}>
              Discard Changes
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}

export default EditEmployeeModal;
