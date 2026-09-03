import { describe, it, expect } from 'vitest';
import { submitTicketSchema, checkStatusSchema } from '../src/features/tickets/schemas/ticket.schemas';
import { loginSchema } from '../src/features/auth/schemas/auth.schemas';

describe('Frontend Form Schemas Validation', () => {
  describe('submitTicketSchema', () => {
    it('validates correct submission data', () => {
      const result = submitTicketSchema.safeParse({
        name: 'Sarah Connor',
        email: 'sarah@resistance.org',
        subject: 'Terminator AI assistance needed',
        body: 'Detailed description of the bug or inquiry about system setup.',
        priority: 'HIGH',
      });

      expect(result.success).toBe(true);
    });

    it('rejects short names or invalid emails', () => {
      const result = submitTicketSchema.safeParse({
        name: 'S',
        email: 'invalid-email-address',
        subject: 'Hi',
        body: 'Short',
        priority: 'MEDIUM',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        expect(fieldErrors.name).toBeDefined();
        expect(fieldErrors.email).toBeDefined();
        expect(fieldErrors.subject).toBeDefined();
        expect(fieldErrors.body).toBeDefined();
      }
    });
  });

  describe('checkStatusSchema', () => {
    it('validates ticket ID and email', () => {
      const valid = checkStatusSchema.safeParse({
        ticketId: 'XR-9A2K4B',
        email: 'user@example.com',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects empty ticket ID or invalid email', () => {
      const invalid = checkStatusSchema.safeParse({
        ticketId: '',
        email: 'notanemail',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('validates login credentials', () => {
      const valid = loginSchema.safeParse({
        email: 'agent1@xriseai.com',
        password: 'agent1@123',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects missing password', () => {
      const invalid = loginSchema.safeParse({
        email: 'agent1@xriseai.com',
        password: '',
      });
      expect(invalid.success).toBe(false);
    });
  });
});
