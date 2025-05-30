import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  UserSchema,
  TaskListSchema,
  MembershipSchema,
  TaskSchema,
  RecurrenceRuleSchema,
  TaskOccurrenceSchema,
  TaskCompletionSchema,
  TaskAssignmentSchema,
  RoleEnum,
  FrequencyEnum,
  // Aliased Create/Update Schemas from schemas.ts
  UserCreateSchema as ApiUserCreateDtoSchema,
  UserUpdateSchema as ApiUserUpdateDtoSchema,
  TaskListCreateSchema as ApiTaskListCreateDtoSchema,
  TaskListUpdateSchema as ApiTaskListUpdateDtoSchema,
  MembershipCreateSchema as ApiMembershipCreateDtoSchema,
  MembershipUpdateSchema as ApiMembershipUpdateDtoSchema,
  TaskCreateSchema as ApiTaskCreateDtoSchema,
  TaskUpdateSchema as ApiTaskUpdateDtoSchema,
  RecurrenceRuleCreateSchema as ApiRecurrenceRuleCreateDtoSchema,
  RecurrenceRuleUpdateSchema as ApiRecurrenceRuleUpdateDtoSchema,
} from "./schemas";

const c = initContract();

// API Specific DTOs - derived from the main schemas
// These are now mostly for cases where path params might mean we omit fields from the body
// or for more complex nested creates not directly mapped by base create schemas.

// For creating a task, taskListId is from the path, so we omit it from the body.
// We also allow recurrenceRule to be an object for creation.
// const ApiTaskCreatePayloadSchema = ApiTaskCreateDtoSchema.omit({
//   taskListId: true,
// }).extend({
//   recurrenceRule: ApiRecurrenceRuleCreateDtoSchema.omit({
//     taskId: true,
//   }).optional(),
// });

// // For updating a task, similar logic, but all fields are optional.
// const ApiTaskUpdatePayloadSchema = ApiTaskCreatePayloadSchema.partial();

// New DTOs for direct task operations (taskListId in body for create)
const ApiTaskDirectCreateDtoSchema = ApiTaskCreateDtoSchema.extend({
  recurrenceRule: ApiRecurrenceRuleCreateDtoSchema.omit({
    taskId: true, // taskId is implicit to the main task being created/updated
  }).optional(),
});
const ApiTaskDirectUpdateDtoSchema = ApiTaskDirectCreateDtoSchema.partial();

// For adding a member, taskListId is from path, role is optional (defaults in backend)
const ApiMembershipAddDtoSchema = ApiMembershipCreateDtoSchema.pick({
  userId: true,
  role: true,
});

export const contract = c.router({
  users: c.router({
    create: {
      method: "POST",
      path: "/users",
      body: ApiUserCreateDtoSchema,
      responses: {
        201: UserSchema,
      },
    },
    me: {
      method: "GET",
      path: "/users/me",
      responses: {
        200: UserSchema,
      },
    },
    update: {
      method: "PATCH",
      path: "/users/:id",
      pathParams: c.type<{ id: string }>(),
      body: ApiUserUpdateDtoSchema,
      responses: {
        200: UserSchema,
        404: z.undefined(),
      },
    },
  }),
  tasklists: c.router({
    create: {
      method: "POST",
      path: "/tasklists",
      body: ApiTaskListCreateDtoSchema,
      responses: {
        201: TaskListSchema,
      },
    },
    findAll: {
      method: "GET",
      path: "/tasklists",
      responses: {
        200: z.array(TaskListSchema),
      },
    },
    findOne: {
      method: "GET",
      path: "/tasklists/:id",
      pathParams: c.type<{ id: string }>(),
      responses: {
        200: TaskListSchema,
        404: z.undefined(),
      },
    },
    update: {
      method: "PATCH",
      path: "/tasklists/:id",
      pathParams: c.type<{ id: string }>(),
      body: ApiTaskListUpdateDtoSchema,
      responses: {
        200: TaskListSchema,
        404: z.undefined(),
      },
    },
    remove: {
      method: "DELETE",
      path: "/tasklists/:id",
      pathParams: c.type<{ id: string }>(),
      responses: {
        200: z.undefined(),
        404: z.undefined(),
      },
    },
    // Memberships
    addMember: {
      method: "POST",
      path: "/tasklists/:taskListId/members",
      pathParams: c.type<{ taskListId: string }>(),
      body: ApiMembershipAddDtoSchema,
      responses: {
        201: MembershipSchema,
      },
    },
    getMembers: {
      method: "GET",
      path: "/tasklists/:taskListId/members",
      pathParams: c.type<{ taskListId: string }>(),
      responses: {
        200: z.array(MembershipSchema),
      },
    },
    removeMember: {
      method: "DELETE",
      path: "/tasklists/:taskListId/members/:membershipId",
      pathParams: c.type<{ taskListId: string; membershipId: string }>(),
      responses: {
        200: z.undefined(),
        404: z.undefined(),
      },
    },
    updateMember: {
      method: "PATCH",
      path: "/tasklists/:taskListId/members/:membershipId",
      pathParams: c.type<{ taskListId: string; membershipId: string }>(),
      body: ApiMembershipUpdateDtoSchema,
      responses: {
        200: MembershipSchema,
        404: z.undefined(),
      },
    },
    getOccurrencesByTaskList: {
      method: "GET",
      path: "/tasklists/:taskListId/occurrences",
      pathParams: c.type<{ taskListId: string }>(),
      responses: {
        200: z.array(TaskOccurrenceSchema),
      },
    },
  }),
  tasks: c.router({
    create: {
      method: "POST",
      path: "/tasks", // Changed path
      // pathParams: c.type<{ taskListId: string }>(), // Removed taskListId from path
      body: ApiTaskDirectCreateDtoSchema, // Use new DTO that expects taskListId in body
      responses: {
        201: TaskSchema,
      },
    },
    // findAll removed: listing tasks in a tasklist is now under tasklists router
    findAllTasks: {
      method: "GET",
      path: "/tasklists/:id/tasks",
      pathParams: c.type<{ id: string }>(),
      responses: {
        200: z.array(TaskSchema),
      },
    },
    findOne: {
      method: "GET",
      path: "/tasks/:taskId", // Changed path
      pathParams: c.type<{ taskId: string }>(), // Removed taskListId from pathParams
      responses: {
        200: TaskSchema,
        404: z.undefined(),
      },
    },
    update: {
      method: "PATCH",
      path: "/tasks/:taskId", // Changed path
      pathParams: c.type<{ taskId: string }>(), // Removed taskListId from pathParams
      body: ApiTaskDirectUpdateDtoSchema, // Use new DTO
      responses: {
        200: TaskSchema,
        404: z.undefined(),
      },
    },
    remove: {
      method: "DELETE",
      path: "/tasks/:taskId", // Changed path
      pathParams: c.type<{ taskId: string }>(), // Removed taskListId from pathParams
      responses: {
        200: z.undefined(),
        404: z.undefined(),
      },
    },
    completeTaskOccurrence: {
      method: "PATCH",
      path: "/occurrences/:occurrenceId/complete",
      pathParams: c.type<{ occurrenceId: string }>(),
      body: z.object({ completed: z.boolean() }),
      responses: {
        200: TaskOccurrenceSchema,
        404: z.undefined(),
      },
    },
  }),
});

export { RoleEnum, FrequencyEnum };
export * from "./schemas";
