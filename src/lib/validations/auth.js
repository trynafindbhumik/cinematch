'use client';

import { z } from 'zod';

export const SignupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
});

export const VerifySchema = z
  .object({
    otp: z
      .string()
      .transform((val) => val.toLowerCase())
      .refine((val) => /^[a-z0-9]{6}$/.test(val), 'OTP must be 6 alphanumeric characters')
      .optional(),
    token: z.string().optional(),
    verification_id: z.string().optional(),
  })
  .refine((data) => data.otp || data.token, 'Either OTP or token is required');

export const ResendSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ResetPasswordSchema = z.object({
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
  token: z.string().min(1, 'Invalid reset token'),
});

export function validateSchema(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return {
      success: false,
      errors,
      errorMessage: errors[0]?.message || 'Validation failed',
    };
  }

  return {
    success: true,
    data: result.data,
    errors: [],
    errorMessage: null,
  };
}
