import { z } from 'zod';

export const submitTicketSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  subject: z
    .string({ required_error: 'Subject is required' })
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject cannot exceed 200 characters'),
  body: z
    .string({ required_error: 'Description body is required' })
    .trim()
    .min(10, 'Please describe your issue in at least 10 characters')
    .max(5000, 'Description is too long'),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
      errorMap: () => ({ message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT' }),
    })
    .default('MEDIUM'),
});

export const checkStatusSchema = z.object({
  ticketId: z
    .string({ required_error: 'Ticket ID is required' })
    .trim()
    .toUpperCase()
    .min(5, 'Ticket ID is required (e.g., XR-9A2K4B)')
    .max(15, 'Invalid ticket ID format'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter the email associated with this ticket')
    .trim()
    .toLowerCase(),
});

export const addReplySchema = z.object({
  body: z
    .string({ required_error: 'Reply body is required' })
    .trim()
    .min(1, 'Reply cannot be empty')
    .max(5000, 'Reply is too long'),
});

export const replySchema = addReplySchema;

export const reassignSchema = z.object({
  assigneeId: z.string().min(1, 'Please select an assignee'),
});

export type SubmitTicketFormData = z.infer<typeof submitTicketSchema>;
export type CheckStatusFormData = z.infer<typeof checkStatusSchema>;
export type AddReplyFormData = z.infer<typeof addReplySchema>;
export type ReplyFormData = z.infer<typeof replySchema>;
export type ReassignFormData = z.infer<typeof reassignSchema>;
