import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '@/components/ui/text-field';
import { Dropdown } from '@/components/ui/dropdown';
import { Button } from '@/components/ui/button';
import { COUNTRY_OPTIONS, JOB_TITLE_OPTIONS } from '@/utils/constants';
import { employeeSchema } from '@/utils/employee-validation';

function EmployeeForm({
  defaultValues = {
    full_name: '',
    job_title: '',
    country: '',
    salary: '',
  },
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText = 'Submit',
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  // Filter out "All..." options for forms (not needed in create/edit)
  const jobTitleOptions = JOB_TITLE_OPTIONS.filter((opt) => opt.value !== '');
  const countryOptions = COUNTRY_OPTIONS.filter((opt) => opt.value !== '');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name */}
      <TextField
        id="full_name"
        label="Full Name"
        placeholder="e.g., John Doe"
        error={errors.full_name?.message}
        required
        {...register('full_name')}
      />

      {/* Job Title */}
      <Dropdown
        id="job_title"
        label="Job Title"
        options={jobTitleOptions}
        error={errors.job_title?.message}
        required
        {...register('job_title')}
      />

      {/* Country */}
      <Dropdown
        id="country"
        label="Country"
        options={countryOptions}
        error={errors.country?.message}
        required
        {...register('country')}
      />

      {/* Salary */}
      <TextField
        id="salary"
        label="Salary"
        type="number"
        placeholder="e.g., 75000"
        error={errors.salary?.message}
        required
        {...register('salary')}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
}

export default EmployeeForm;
