import { z } from 'zod';

// Employee validation schema
export const employeeSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Full name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .transform((val) => val.trim()),
  job_title: z.string().min(1, 'Job title is required'),
  country: z.string().min(1, 'Country is required'),
  salary: z
    .string()
    .min(1, 'Salary is required')
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), { message: 'Salary must be a number' })
    .refine((val) => val > 0, { message: 'Salary must be greater than 0' })
    .refine((val) => val <= 10000000, {
      message: 'Salary must be less than $10,000,000',
    }),
});
