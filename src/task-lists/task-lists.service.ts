import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskListDto } from "./dto/create-task-list.dto";
import { Role } from "@prisma/client";

@Injectable()
export class TaskListsService {
  constructor(private prisma: PrismaService) {}

  async getOccurrencesByTaskList(userId: string, taskListId: string) {
    // Check if the user is a member of the task list
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
    // Return all occurrences for the task list
    return this.prisma.taskOccurrence.findMany({
      where: {
        task: { taskListId },
      },
    });
  }

  async create(userId: string, createTaskListDto: CreateTaskListDto) {
    const taskList = await this.prisma.taskList.create({
      data: {
        name: createTaskListDto.name,
        description: createTaskListDto.description,
        memberships: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
      },
      include: {
        memberships: {
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

    return taskList;
  }

  // Returns all tasks in a task list if the user has access
  async findAllTasks(userId: string, taskListId: string) {
    // Check if the user is a member of the task list
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
    // Return all tasks for the task list
    return this.prisma.task.findMany({
      where: { taskListId },
    });
  }

  async findAll(userId: string) {
    return this.prisma.taskList.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
      include: {
        memberships: {
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
    const taskList = await this.prisma.taskList.findUnique({
      where: { id },
      include: {
        memberships: {
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

    if (!taskList) {
      throw new NotFoundException(`Task list with ID ${id} not found`);
    }

    const membership = taskList.memberships.find((m) => m.userId === userId);
    if (!membership) {
      throw new ForbiddenException("You do not have access to this task list");
    }

    return taskList;
  }

  async update(
    userId: string,
    id: string,
    updateTaskListDto: CreateTaskListDto
  ) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_taskListId: {
          userId,
          taskListId: id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException("You do not have access to this task list");
    }

    if (membership.role !== Role.OWNER && membership.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You do not have permission to update this task list"
      );
    }

    return this.prisma.taskList.update({
      where: { id },
      data: {
        name: updateTaskListDto.name,
        description: updateTaskListDto.description,
      },
      include: {
        memberships: {
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

  async remove(userId: string, id: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_taskListId: {
          userId,
          taskListId: id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException("You do not have access to this task list");
    }

    if (membership.role !== Role.OWNER) {
      throw new ForbiddenException("Only the owner can delete a task list");
    }
    // Delete the task list and all associated tasks, memberships
    const taskList = await this.prisma.taskList.findUnique({
      where: { id },
      include: {
        tasks: true,
        memberships: true,
      },
    });

    if (!taskList) {
      throw new NotFoundException(`Task list with ID ${id} not found`);
    }
    // Delete all tasks associated with the task list
    await this.prisma.task.deleteMany({
      where: { taskListId: id },
    });
    // Delete all memberships associated with the task list
    await this.prisma.membership.deleteMany({
      where: { taskListId: id },
    });
    // Finally, delete the task list itself
    return this.prisma.taskList.delete({
      where: { id },
    });
  }

  async addMember(
    requestingUserId: string,
    taskListId: string,
    userId: string,
    role: Role
  ) {
    // Check if the requesting user is OWNER or ADMIN
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_taskListId: {
          userId: requestingUserId,
          taskListId,
        },
      },
    });
    if (!membership) {
      throw new ForbiddenException("You do not have access to this task list");
    }
    if (membership.role !== Role.OWNER && membership.role !== Role.ADMIN) {
      throw new ForbiddenException("You do not have permission to add members");
    }
    // Add the new member
    return await this.prisma.membership.create({
      data: {
        userId,
        taskListId,
        role,
      },
    });
  }

  async removeMember(
    requestingUserId: string,
    taskListId: string,
    userId: string
  ) {
    // Check if the requesting user is OWNER or ADMIN
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_taskListId: {
          userId: requestingUserId,
          taskListId,
        },
      },
    });
    if (!membership) {
      throw new ForbiddenException("You do not have access to this task list");
    }
    if (membership.role !== Role.OWNER && membership.role !== Role.ADMIN) {
      throw new ForbiddenException(
        "You do not have permission to remove members"
      );
    }
    // Prevent removing the owner
    const targetMembership = await this.prisma.membership.findUnique({
      where: {
        userId_taskListId: {
          userId,
          taskListId,
        },
      },
    });
    if (!targetMembership) {
      throw new NotFoundException("Membership not found");
    }
    if (targetMembership.role === Role.OWNER) {
      throw new ForbiddenException("Cannot remove the owner of the task list");
    }
    await this.prisma.membership.delete({
      where: {
        userId_taskListId: {
          userId,
          taskListId,
        },
      },
    });
    // Return updated memberships
    return this.prisma.membership.findMany({
      where: { taskListId },
      include: {
        user: { select: { id: true, email: true, displayName: true } },
      },
    });
  }
}
