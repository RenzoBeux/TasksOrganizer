import { z } from 'zod';

export const TaskListSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const TaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  taskListId: z.string().uuid(),
  // Omitting recurrenceRule, occurrences, assignments for simplicity in the contract
});

export const MembershipSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']).optional(), // Assuming Role enum might be defined elsewhere or simplified
  userId: z.string().uuid(),
  taskListId: z.string().uuid(),
});

export const UserSchema = z.object({
  // Define User properties needed for creation/update via API contract
  // For example, if users are created/managed externally or only referenced by ID:
  // id: z.string().uuid(), 
  // email: z.string().email(), // If allowing email updates through this contract
  // displayName: z.string().optional(), // If allowing display name updates
  // For now, keeping it minimal as per the original intent of *CreateInput schemas
  // If user creation is part of the contract, add fields like email, displayName, etc.
});

// If you have enums like Role or Frequency that are part of the contract,
// define them here as Zod enums:
export const RoleEnum = z.enum(['OWNER', 'ADMIN', 'MEMBER']);
export const FrequencyEnum = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);
