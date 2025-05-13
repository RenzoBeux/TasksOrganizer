import { initContract } from '@ts-rest/core';
import { z } from 'zod';

// Enums
export enum Frequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

// Zod schemas for DTOs
export const OrdinalWeekdayDtoSchema = z.object({
    weekday: z.number().int().min(0).max(6),
    ordinal: z.number().int().min(1).max(5),
});

export const CreateTaskDtoSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    isRecurring: z.boolean().optional(),
    dueDate: z.string().datetime().optional(),
    frequency: z.nativeEnum(Frequency).optional(),
    interval: z.number().optional(),
    daysOfWeek: z.array(z.number().int()).optional(),
    daysOfMonth: z.array(z.number().int()).optional(),
    monthsOfYear: z.array(z.number().int()).optional(),
    ordinalWeekdays: z.array(OrdinalWeekdayDtoSchema).optional(),
});

export const CreateTaskListDtoSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
});

// Typescript types from zod schemas
export type OrdinalWeekdayDto = z.infer<typeof OrdinalWeekdayDtoSchema>;
export type CreateTaskDto = z.infer<typeof CreateTaskDtoSchema>;
export type CreateTaskListDto = z.infer<typeof CreateTaskListDtoSchema>;

const c = initContract();

export const contract = c.router({
    taskLists: c.router({
        create: {
            method: 'POST',
            path: '/',
            body: CreateTaskListDtoSchema,
            responses: {
                201: z.any(), // Replace with TaskList schema if available
            },
        },
        findAll: {
            method: 'GET',
            path: '/',
            responses: {
                200: z.array(z.any()), // Replace with TaskList schema if available
            },
        },
        findOne: {
            method: 'GET',
            path: '/:id',
            responses: {
                200: z.any(), // Replace with TaskList schema if available
                404: z.undefined(),
            },
        },
        update: {
            method: 'PATCH',
            path: '/:id',
            body: CreateTaskListDtoSchema,
            responses: {
                200: z.any(), // Replace with TaskList schema if available
                404: z.undefined(),
            },
        },
        remove: {
            method: 'DELETE',
            path: '/:id',
            responses: {
                200: z.undefined(),
                404: z.undefined(),
            },
        },
    }),
    tasks: c.router({
        create: {
            method: 'POST',
            path: '/tasklists/:taskListId/tasks',
            body: CreateTaskDtoSchema,
            responses: {
                201: z.any(), // Replace with Task schema if available
            },
        },
        findAll: {
            method: 'GET',
            path: '/tasklists/:taskListId/tasks',
            responses: {
                200: z.array(z.any()), // Replace with Task schema if available
            },
        },
        findOne: {
            method: 'GET',
            path: '/:id',
            responses: {
                200: z.any(), // Replace with Task schema if available
                404: z.undefined(),
            },
        },
        update: {
            method: 'PATCH',
            path: '/:id',
            body: CreateTaskDtoSchema,
            responses: {
                200: z.any(), // Replace with Task schema if available
                404: z.undefined(),
            },
        },
        remove: {
            method: 'DELETE',
            path: '/:id',
            responses: {
                200: z.undefined(),
                404: z.undefined(),
            },
        },
    }),
}); 