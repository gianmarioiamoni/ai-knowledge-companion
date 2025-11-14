import { z } from 'zod';

// Contact form categories
export const contactCategories = [
  'general',
  'support',
  'bug',
  'feature',
  'billing',
  'other',
] as const;

export type ContactCategory = typeof contactCategories[number];

// Contact form schema for authenticated users (email not required)
export const contactSchemaAuthenticated = z.object({
  name: z.string().min(2, { message: 'contact.form.nameRequired' }),
  subject: z.string().min(3, { message: 'contact.form.subjectRequired' }),
  category: z.enum(contactCategories, { message: 'contact.form.categoryRequired' }),
  message: z.string().min(10, { message: 'contact.form.messageMinLength' }),
});

// Contact form schema for guest users (email required)
export const contactSchemaGuest = contactSchemaAuthenticated.extend({
  email: z.string().email({ message: 'contact.form.emailInvalid' }),
});

// API request schema (always includes email)
export const contactRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  category: z.enum(contactCategories),
  message: z.string().min(10),
  isAuthenticated: z.boolean(),
});

// Type exports
export type ContactFormDataAuthenticated = z.infer<typeof contactSchemaAuthenticated>;
export type ContactFormDataGuest = z.infer<typeof contactSchemaGuest>;
export type ContactRequestData = z.infer<typeof contactRequestSchema>;

