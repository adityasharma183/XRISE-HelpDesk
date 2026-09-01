import { z } from 'zod';

export const createTicketSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  subject: z
    .string({ required_error: 'Subject is required' })
    .trim()
    .min(3, 'Subject must be at least 3 characters long')
    .max(200, 'Subject cannot exceed 200 characters'),
  body: z
    .string({ required_error: 'Description body is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters long')
    .max(5000, 'Description cannot exceed 5000 characters'),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
      errorMap: () => ({ message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT' }),
    })
    .default('MEDIUM'),
});

export const createInternalTicketSchema = z.object({
  name: z
    .string({ required_error: 'Customer name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Customer email is required' })
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  subject: z
    .string({ required_error: 'Subject is required' })
    .trim()
    .min(3, 'Subject must be at least 3 characters long')
    .max(200, 'Subject cannot exceed 200 characters'),
  body: z
    .string({ required_error: 'Description body is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters long')
    .max(5000, 'Description cannot exceed 5000 characters'),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
      errorMap: () => ({ message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT' }),
    })
    .default('MEDIUM'),
  assigneeId: z
    .string()
    .refine(
      (val) => !val || val === 'unassigned' || val === 'round-robin' || /^[0-9a-fA-F]{24}$/.test(val),
      { message: 'Invalid assignee ID format' }
    )
    .optional()
    .nullable(),
});

export const publicStatusCheckSchema = z.object({
  ticketId: z
    .string({ required_error: 'Ticket ID is required' })
    .trim()
    .toUpperCase()
    .min(5, 'Invalid ticket ID format')
    .max(15, 'Invalid ticket ID format'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
});

export const ticketQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignee: z.string().trim().optional(),
});

export const ticketIdParamSchema = z.object({
  ticketId: z
    .string({ required_error: 'Ticket ID parameter is required' })
    .trim()
    .toUpperCase(),
});

export const addReplySchema = z.object({
  body: z
    .string({ required_error: 'Reply body is required' })
    .trim()
    .min(1, 'Reply body cannot be empty')
    .max(5000, 'Reply cannot exceed 5000 characters'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], {
    errorMap: () => ({ message: 'Status must be OPEN, IN_PROGRESS, RESOLVED, or CLOSED' }),
  }),
});

export const reassignTicketSchema = z.object({
  assigneeId: z
    .string({ required_error: 'Assignee ID is required' })
    .refine(
      (val) => val === 'unassigned' || val === 'round-robin' || /^[0-9a-fA-F]{24}$/.test(val),
      { message: 'Invalid assignee user ID format' }
    ),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type CreateInternalTicketInput = z.infer<typeof createInternalTicketSchema>;
export type PublicStatusCheckInput = z.infer<typeof publicStatusCheckSchema>;
export type TicketQueryInput = z.infer<typeof ticketQuerySchema>;
export type AddReplyInput = z.infer<typeof addReplySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ReassignTicketInput = z.infer<typeof reassignTicketSchema>;
