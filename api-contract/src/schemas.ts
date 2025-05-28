import { z } from "zod";

// --- Enums ---
export const RoleEnum = z.enum(["OWNER", "ADMIN", "MEMBER"]);
export const FrequencyEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);

// --- Base Schemas (including IDs and timestamps for GET operations) ---

// Forward declarations for lazy loading
let TaskListSchemaInternal: z.ZodTypeAny;
let MembershipSchemaInternal: z.ZodTypeAny;
let TaskSchemaInternal: z.ZodTypeAny;
let RecurrenceRuleSchemaInternal: z.ZodTypeAny;
let TaskOccurrenceSchemaInternal: z.ZodTypeAny;
let TaskCompletionSchemaInternal: z.ZodTypeAny;
let TaskAssignmentSchemaInternal: z.ZodTypeAny;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  memberships: z.lazy(() => z.array(MembershipSchemaInternal)).optional(),
  completions: z.lazy(() => z.array(TaskCompletionSchemaInternal)).optional(),
  assignments: z.lazy(() => z.array(TaskAssignmentSchemaInternal)).optional(),
});

export const TaskListSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullish().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  memberships: z.lazy(() => z.array(MembershipSchemaInternal)).optional(),
  tasks: z.lazy(() => z.array(TaskSchemaInternal)).optional(),
});
TaskListSchemaInternal = TaskListSchema;

export const MembershipSchema = z.object({
  id: z.string().uuid(),
  role: RoleEnum, // Default is MEMBER, so for GET it will always be present
  userId: z.string().uuid(),
  taskListId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  user: z.lazy(() => UserSchema).optional(),
  taskList: z.lazy(() => TaskListSchemaInternal).optional(),
});
MembershipSchemaInternal = MembershipSchema;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullish().optional(),
  dueDate: z.coerce.date().nullish().optional(),
  isRecurring: z.boolean(), // Default is false, so for GET it will always be present
  taskListId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  taskList: z.lazy(() => TaskListSchemaInternal).optional(),
  recurrenceRule: z
    .lazy(() => RecurrenceRuleSchemaInternal)
    .nullish()
    .optional(),
  occurrences: z.lazy(() => z.array(TaskOccurrenceSchemaInternal)).optional(),
  assignments: z.lazy(() => z.array(TaskAssignmentSchemaInternal)).optional(),
});
TaskSchemaInternal = TaskSchema;

export const RecurrenceRuleSchema = z.object({
  id: z.string().uuid(),
  frequency: FrequencyEnum,
  interval: z.number().int(),
  daysOfWeek: z.array(z.number().int()),
  daysOfMonth: z.array(z.number().int()),
  monthsOfYear: z.array(z.number().int()),
  ordinalWeekdays: z
    .array(z.object({ weekday: z.number().int(), ordinal: z.number().int() }))
    .nullish()
    .optional(), // Prisma Json?
  taskId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  task: z.lazy(() => TaskSchemaInternal).optional(),
});
RecurrenceRuleSchemaInternal = RecurrenceRuleSchema;

export const TaskOccurrenceSchema = z.object({
  id: z.string().uuid(),
  dueDate: z.coerce.date(),
  taskId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  task: z.lazy(() => TaskSchemaInternal).optional(),
  completions: z.lazy(() => z.array(TaskCompletionSchemaInternal)).optional(),
});
TaskOccurrenceSchemaInternal = TaskOccurrenceSchema;

export const TaskCompletionSchema = z.object({
  id: z.string().uuid(),
  taskOccurrenceId: z.string().uuid(),
  userId: z.string().uuid(),
  completedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  occurrence: z.lazy(() => TaskOccurrenceSchemaInternal).optional(),
  user: z.lazy(() => UserSchema).optional(),
});
TaskCompletionSchemaInternal = TaskCompletionSchema;

export const TaskAssignmentSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  task: z.lazy(() => TaskSchemaInternal).optional(),
  user: z.lazy(() => UserSchema).optional(),
});
TaskAssignmentSchemaInternal = TaskAssignmentSchema;

// --- Input Schemas (for Create/Update operations) ---
// These can omit id, createdAt, updatedAt, and potentially nested relations if handled by IDs

export const UserCreateSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  memberships: true,
  completions: true,
  assignments: true,
});
export const UserUpdateSchema = UserCreateSchema.partial();

export const TaskListCreateSchema = TaskListSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  memberships: true,
  tasks: true,
});
export const TaskListUpdateSchema = TaskListCreateSchema.partial();

export const MembershipCreateSchema = MembershipSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  user: true,
  taskList: true,
}).extend({ role: RoleEnum.optional() }); // Role is optional on create, defaults to MEMBER
export const MembershipUpdateSchema = MembershipCreateSchema.pick({
  role: true,
}).partial(); // Usually only role is updatable

export const TaskCreateSchema = TaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  taskList: true,
  recurrenceRule: true,
  occurrences: true,
  assignments: true,
}).extend({ isRecurring: z.boolean().optional() }); // isRecurring is optional on create
export const TaskUpdateSchema = TaskCreateSchema.partial();

export const RecurrenceRuleCreateSchema = RecurrenceRuleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  task: true,
});
export const RecurrenceRuleUpdateSchema = RecurrenceRuleCreateSchema.partial();

// TaskOccurrence is usually system-generated, not directly created via API in this manner.
// TaskCompletion is usually a specific action, e.g., POST /tasks/{taskId}/complete
// TaskAssignment might be POST /tasks/{taskId}/assignees

// Re-exporting the main schemas (output-oriented by default)
// You can choose to export Input schemas separately if needed by your contract.
