import { Controller, UseGuards, Req, NotFoundException } from "@nestjs/common";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { contract } from "../../api-contract/src/index";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";

@ApiTags("users")
@ApiBearerAuth("firebase-auth")
@UseGuards(JwtAuthGuard)
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //   @ApiOperation({ summary: "Create a new user" })
  //   @ApiResponse({
  //     status: 201,
  //     description: "The user has been successfully created.",
  //   })
  //   @TsRestHandler(contract.users.create)
  //   async create(@Req() req: any) {
  //     return tsRestHandler(contract.users.create, async ({ body }) => {
  //       // Assuming UsersService.create handles the creation logic.
  //       // If the creator's ID is needed: const creatorId = req.user.id;
  //       const user = await this.usersService.create(body);
  //       return { status: 201, body: user };
  //     });
  //   }

  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "Return current user profile." })
  @TsRestHandler(contract.users.me)
  async me(@Req() req: any) {
    return tsRestHandler(contract.users.me, async () => {
      const userId = req.user.id;
      const user = await this.usersService.me(userId);
      return { status: 200, body: user };
    });
  }

  @ApiOperation({ summary: "Update a user" })
  @ApiResponse({
    status: 200,
    description: "The user has been successfully updated.",
  })
  @ApiResponse({ status: 404, description: "User not found." })
  @ApiParam({ name: "id", type: String, description: "User ID to update" })
  @TsRestHandler(contract.users.update)
  async update(@Req() req: any) {
    return tsRestHandler(contract.users.update, async ({ params, body }) => {
      const currentUserId = req.user.id;
      try {
        // The service should handle authorization (e.g., user can only update themselves or admin can update others)
        const user = await this.usersService.update(
          currentUserId,
          params.id,
          body
        );
        return { status: 200, body: user };
      } catch (e) {
        if (
          e instanceof NotFoundException ||
          (typeof e === "object" &&
            e !== null &&
            "status" in e &&
            (e as any).status === 404)
        ) {
          return { status: 404, body: undefined };
        }
        throw e; // Re-throw other errors
      }
    });
  }
}
