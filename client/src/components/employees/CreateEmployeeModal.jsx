import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import EmployeeForm from './EmployeeForm';

function CreateEmployeeModal() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const mutation = useMutation({
    mutationFn: employeeService.createEmployee,
    onSuccess: () => {
      // Show success toast
      addToast('Employee created successfully!', 'success');
      
      // Invalidate and refetch employees list
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      // Close modal immediately
      setOpen(false);
    },
    onError: (error) => {
      // Show error toast
      addToast(error.message || 'Failed to create employee', 'error');
    },
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset mutation state when modal closes
      mutation.reset();
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalTrigger asChild>
        <Button variant="primary">Add Employee</Button>
      </ModalTrigger>
      <ModalContent className="sm:max-w-[500px]">
        <ModalHeader>
          <ModalTitle>Create Employee</ModalTitle>
          <ModalDescription>
            Add a new employee to the system. All fields are required.
          </ModalDescription>
        </ModalHeader>

        <EmployeeForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={mutation.isPending}
          submitButtonText="Create"
        />
      </ModalContent>
    </Modal>
  );
}

export default CreateEmployeeModal;
