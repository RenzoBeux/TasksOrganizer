import { Controller, Req, UseGuards } from "@nestjs/common";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { contract } from "../../api-contract/src/index";
import { TaskListsService } from "./task-lists.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Role } from "@prisma/client";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";
import { CreateTaskListDto } from "./dto/create-task-list.dto";
import { AddMemberDto } from "./dto/add-member.dto";
import { RemoveMemberDto } from "./dto/remove-member.dto";

@ApiTags("task-lists")
@ApiBearerAuth("firebase-auth")
@UseGuards(JwtAuthGuard)
@Controller()
export class TaskListsController {
  constructor(private readonly taskListsService: TaskListsService) {}

  @ApiOperation({ summary: "Get all occurrences for a task list" })
  @ApiResponse({
    status: 200,
    description: "Return all occurrences for the task list.",
  })
  @ApiParam({ name: "taskListId", type: String, description: "Task list ID" })
  @TsRestHandler(contract.tasklists.getOccurrencesByTaskList)
  async getOccurrencesByTaskList(@Req() req: any) {
    return tsRestHandler(
      contract.tasklists.getOccurrencesByTaskList,
      async ({ params }) => {
        const userId = req.user.id;
        const occurrences =
          await this.taskListsService.getOccurrencesByTaskList(
            userId,
            params.taskListId
          );
        return { status: 200, body: occurrences };
      }
    );
  }

  @ApiOperation({ summary: "Get all tasks in a task list" })
  @ApiResponse({
    status: 200,
    description: "Return all tasks in the task list.",
  })
  @ApiParam({ name: "id", type: String, description: "Task list ID" })
  @TsRestHandler(contract.tasks.findAllTasks)
  async findAllTasks(@Req() req: any) {
    return tsRestHandler(contract.tasks.findAllTasks, async ({ params }) => {
      const userId = req.user.id;
      const tasks = await this.taskListsService.findAllTasks(userId, params.id);
      return { status: 200, body: tasks };
    });
  }

  @ApiOperation({ summary: "Create a new task list" })
  @ApiResponse({
    status: 201,
    description: "The task list has been successfully created.",
  })
  @ApiBody({ type: CreateTaskListDto })
  @TsRestHandler(contract.tasklists.create)
  async create(@Req() req: any) {
    return tsRestHandler(contract.tasklists.create, async ({ body }) => {
      const userId = req.user.id;
      const taskList = await this.taskListsService.create(
        userId,
        body as CreateTaskListDto
      );
      return { status: 201, body: taskList };
    });
  }

  @ApiOperation({ summary: "Get all task lists for the current user" })
  @ApiResponse({ status: 200, description: "Return all task lists." })
  @TsRestHandler(contract.tasklists.findAll)
  async findAll(@Req() req: any) {
    return tsRestHandler(contract.tasklists.findAll, async () => {
      const userId = req.user.id;
      const lists = await this.taskListsService.findAll(userId);
      return { status: 200, body: lists };
    });
  }

  @ApiOperation({ summary: "Get a task list by id" })
  @ApiResponse({ status: 200, description: "Return the task list." })
  @ApiResponse({ status: 404, description: "Task list not found." })
  @ApiParam({ name: "id", type: String, description: "Task list ID" })
  @TsRestHandler(contract.tasklists.findOne)
  async findOne(@Req() req: any) {
    return tsRestHandler(contract.tasklists.findOne, async ({ params }) => {
      const userId = req.user.id;
      try {
        const list = await this.taskListsService.findOne(userId, params.id);
        return { status: 200, body: list };
      } catch (e) {
        if (
          typeof e === "object" &&
          e !== null &&
          "status" in e &&
          (e as any).status === 404
        ) {
          return { status: 404, body: undefined };
        }
        throw e;
      }
    });
  }

  @ApiOperation({ summary: "Update a task list" })
  @ApiResponse({
    status: 200,
    description: "The task list has been successfully updated.",
  })
  @ApiResponse({ status: 404, description: "Task list not found." })
  @ApiParam({ name: "id", type: String, description: "Task list ID" })
  @ApiBody({ type: CreateTaskListDto })
  @TsRestHandler(contract.tasklists.update)
  async update(@Req() req: any) {
    return tsRestHandler(
      contract.tasklists.update,
      async ({ params, body }) => {
        const userId = req.user.id;
        try {
          const updated = await this.taskListsService.update(
            userId,
            params.id,
            body as CreateTaskListDto
          );
          return { status: 200, body: updated };
        } catch (e) {
          if (
            typeof e === "object" &&
            e !== null &&
            "status" in e &&
            (e as any).status === 404
          ) {
            return { status: 404, body: undefined };
          }
          throw e;
        }
      }
    );
  }

  @ApiOperation({ summary: "Delete a task list" })
  @ApiResponse({
    status: 200,
    description: "The task list has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Task list not found." })
  @ApiParam({ name: "id", type: String, description: "Task list ID" })
  @TsRestHandler(contract.tasklists.remove)
  async remove(@Req() req: any) {
    return tsRestHandler(contract.tasklists.remove, async ({ params }) => {
      const userId = req.user.id;
      try {
        await this.taskListsService.remove(userId, params.id);
        return { status: 200, body: undefined };
      } catch (e) {
        if (
          typeof e === "object" &&
          e !== null &&
          "status" in e &&
          (e as any).status === 404
        ) {
          return { status: 404, body: undefined };
        }
        throw e;
      }
    });
  }

  @ApiOperation({ summary: "Add a member to a task list" })
  @ApiResponse({ status: 201, description: "Member added." })
  @ApiParam({ name: "id", type: String, description: "Task list ID" })
  @ApiBody({ type: AddMemberDto })
  @TsRestHandler(contract.tasklists.addMember)
  async addMember(@Req() req: any) {
    return tsRestHandler(
      contract.tasklists.addMember,
      async ({ params, body }) => {
        const userId = req.user.id;
        const membership = await this.taskListsService.addMember(
          userId,
          params.taskListId,
          body.userId!,
          body.role as any
        );
        return { status: 201, body: membership };
      }
    );
  }

  @ApiOperation({ summary: "Remove a member from a task list" })
  @ApiResponse({ status: 200, description: "Member removed." })
  @ApiParam({ name: "id", type: String, description: "Task list ID" })
  @ApiBody({ type: RemoveMemberDto })
  @TsRestHandler(contract.tasklists.removeMember)
  async removeMember(@Req() req: any) {
    return tsRestHandler(
      contract.tasklists.removeMember,
      async ({ params }) => {
        const userId = req.user.id;
        await this.taskListsService.removeMember(
          userId,
          params.taskListId,
          params.membershipId
        );
        return { status: 200, body: undefined };
      }
    );
  }
}
