import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { Role, Frequency } from "@prisma/client";
import {
  addDays,
  addMonths,
  addYears,
  setHours,
  setMinutes,
  setSeconds,
} from "date-fns";

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    taskListId: string,
    createTaskDto: CreateTaskDto
  ) {
    // Check if user has access to the task list
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_taskListId: {
          userId,
          taskListId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException("You do not have access to this task list");
    }

    const task = await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        dueDate: createTaskDto.dueDate,
        isRecurring: createTaskDto.isRecurring || false,
        taskListId,
        recurrenceRule: createTaskDto.isRecurring
          ? {
              create: {
                frequency: createTaskDto.frequency || Frequency.DAILY,
                interval: createTaskDto.interval || 1,
                daysOfWeek: createTaskDto.daysOfWeek || [],
                daysOfMonth: createTaskDto.daysOfMonth || [],
                monthsOfYear: createTaskDto.monthsOfYear || [],
                ordinalWeekdays: JSON.stringify(
                  createTaskDto.ordinalWeekdays || []
                ),
              },
            }
          : undefined,
      },
      include: {
        recurrenceRule: true,
      },
    });

    if (task.isRecurring) {
      await this.generateOccurrences(task.id);
    }

    return task;
  }

  async findAll(userId: string, taskListId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_taskListId: {
          userId,
          taskListId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException("You do not have access to this task list");
    }

    return this.prisma.task.findMany({
      where: {
        taskListId,
      },
      include: {
        recurrenceRule: true,
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        recurrenceRule: true,
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_taskListId: {
          userId,
          taskListId: task.taskListId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException("You do not have access to this task");
    }

    return task;
  }

  async update(userId: string, id: string, updateTaskDto: CreateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        recurrenceRule: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_taskListId: {
          userId,
          taskListId: task.taskListId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException("You do not have access to this task");
    }

    if (membership.role !== Role.OWNER && membership.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You do not have permission to update this task"
      );
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        title: updateTaskDto.title,
        description: updateTaskDto.description,
        dueDate: updateTaskDto.dueDate,
        isRecurring: updateTaskDto.isRecurring,
        recurrenceRule: updateTaskDto.isRecurring
          ? {
              upsert: {
                create: {
                  frequency: updateTaskDto.frequency || Frequency.DAILY,
                  interval: updateTaskDto.interval || 1,
                  daysOfWeek: updateTaskDto.daysOfWeek || [],
                  daysOfMonth: updateTaskDto.daysOfMonth || [],
                  monthsOfYear: updateTaskDto.monthsOfYear || [],
                  ordinalWeekdays: JSON.stringify(
                    updateTaskDto.ordinalWeekdays || []
                  ),
                },
                update: {
                  frequency: updateTaskDto.frequency || Frequency.DAILY,
                  interval: updateTaskDto.interval || 1,
                  daysOfWeek: updateTaskDto.daysOfWeek || [],
                  daysOfMonth: updateTaskDto.daysOfMonth || [],
                  monthsOfYear: updateTaskDto.monthsOfYear || [],
                  ordinalWeekdays: JSON.stringify(
                    updateTaskDto.ordinalWeekdays || []
                  ),
                },
              },
            }
          : {
              delete: true,
            },
      },
      include: {
        recurrenceRule: true,
      },
    });

    if (updatedTask.isRecurring) {
      await this.generateOccurrences(updatedTask.id);
    }

    return updatedTask;
  }

  async remove(userId: string, id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_taskListId: {
          userId,
          taskListId: task.taskListId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException("You do not have access to this task");
    }

    if (membership.role !== Role.OWNER && membership.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You do not have permission to delete this task"
      );
    }

    await this.prisma.task.delete({
      where: { id },
    });
  }

  private async generateOccurrences(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        recurrenceRule: true,
      },
    });

    if (!task || !task.recurrenceRule) {
      return;
    }

    const now = new Date();
    const endDate = addDays(now, 30); // Generate occurrences for the next 30 days
    let currentDate = now;

    while (currentDate <= endDate) {
      let shouldCreateOccurrence = false;

      switch (task.recurrenceRule.frequency) {
        case Frequency.DAILY:
          if (currentDate.getDate() % task.recurrenceRule.interval === 0) {
            shouldCreateOccurrence = true;
          }
          currentDate = addDays(currentDate, 1);
          break;

        case Frequency.WEEKLY:
          if (
            task.recurrenceRule.daysOfWeek.includes(currentDate.getDay()) &&
            Math.floor(currentDate.getDate() / 7) %
              task.recurrenceRule.interval ===
              0
          ) {
            shouldCreateOccurrence = true;
          }
          currentDate = addDays(currentDate, 1);
          break;

        case Frequency.MONTHLY:
          if (
            task.recurrenceRule.daysOfMonth.includes(currentDate.getDate()) &&
            currentDate.getMonth() % task.recurrenceRule.interval === 0
          ) {
            shouldCreateOccurrence = true;
          }
          currentDate = addDays(currentDate, 1);
          break;

        case Frequency.YEARLY:
          if (
            task.recurrenceRule.monthsOfYear.includes(
              currentDate.getMonth() + 1
            ) &&
            currentDate.getFullYear() % task.recurrenceRule.interval === 0
          ) {
            shouldCreateOccurrence = true;
          }
          currentDate = addDays(currentDate, 1);
          break;
      }

      if (shouldCreateOccurrence) {
        const dueDate = setSeconds(setMinutes(setHours(currentDate, 0), 0), 0);
        await this.prisma.taskOccurrence.create({
          data: {
            taskId,
            dueDate,
          },
        });
      }
    }
  }

  async completeTaskOccurrence(
    userId: string,
    occurrenceId: string,
    completed: boolean
  ) {
    // 1. Find the occurrence and verify user access
    const occurrence = await this.prisma.taskOccurrence.findUnique({
      where: { id: occurrenceId },
      include: { task: true },
    });

    if (!occurrence) {
      throw new NotFoundException(
        `Occurrence with ID ${occurrenceId} not found`
      );
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_taskListId: {
          userId,
          taskListId: occurrence.task.taskListId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        "You do not have access to this task occurrence"
      );
    }

    // 2. Handle completion/uncompletion
    if (completed) {
      // Create TaskCompletion if it doesn't exist for this user and occurrence
      await this.prisma.taskCompletion.upsert({
        where: {
          taskOccurrenceId_userId: {
            taskOccurrenceId: occurrenceId,
            userId: userId,
          },
        },
        update: {}, // No fields to update if it already exists
        create: {
          taskOccurrenceId: occurrenceId,
          userId: userId,
          // completedAt will be set by @default(now())
        },
      });
    } else {
      // Delete TaskCompletion for this user and occurrence if it exists
      await this.prisma.taskCompletion.deleteMany({
        where: {
          taskOccurrenceId: occurrenceId,
          userId: userId,
        },
      });
    }

    // 3. Return the updated TaskOccurrence with its completions (including user info)
    return this.prisma.taskOccurrence.findUnique({
      where: { id: occurrenceId },
      include: {
        completions: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
              },
            },
          },
        },
        task: true, // Also include the parent task
      },
    });
  }
}
