/**
 * Ticket ID Generator
 *
 * Produces unique, human-readable ticket IDs in the format XR-XXXXXX
 * (e.g., XR-9A2K4B). The alphabet deliberately excludes visually ambiguous
 * characters (0/O, 1/I/L) so customers can share IDs over the phone
 * or in emails without confusion.
 */

import { customAlphabet } from 'nanoid';

// Unambiguous uppercase alphanumeric characters — no 0/O, 1/I/L
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const generateSuffix = customAlphabet(alphabet, 6);

/** Generates a new ticket ID like "XR-9A2K4B" */
export function generateTicketId(): string {
  return `XR-${generateSuffix()}`;
}
