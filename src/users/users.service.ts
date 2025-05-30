import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client"; // Assuming Prisma User model
// Make sure this path is correct based on your project structure
import {
  UserCreateSchema,
  UserUpdateSchema,
} from "../../api-contract/src/schemas";
import { z } from "zod";

// Infer types from Zod schemas
type UserCreateDto = z.infer<typeof UserCreateSchema>;
type UserUpdateDto = z.infer<typeof UserUpdateSchema>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Modified to accept firebaseId and DTO. Controller needs to pass firebaseId.
  async create(data: UserCreateDto): Promise<User> {
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException("Email already exists");
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        displayName: data.displayName,
        // any other fields from UserCreateDto
      },
    });
  }

  // Renamed from findOne to me, and added NotFoundException
  async me(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Modified to align with controller: currentUserId for auth, userIdToUpdate, and DTO
  async update(
    currentUserId: string,
    userIdToUpdate: string,
    data: UserUpdateDto
  ): Promise<User> {
    if (currentUserId !== userIdToUpdate) {
      // Add more sophisticated role-based access control if needed (e.g., admin can update any user)
      throw new ForbiddenException(
        "You are not authorized to update this user."
      );
    }

    const userToUpdate = await this.prisma.user.findUnique({
      where: { id: userIdToUpdate },
    });

    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${userIdToUpdate} not found`);
    }

    // Ensure that if email is part of UserUpdateDto, it's handled carefully
    // For example, check for email conflicts if it's being changed.
    // The current ApiUserUpdateDtoSchema (derived from UserUpdateSchema)
    // UserUpdateSchema = UserSchema.pick({ displayName: true }).partial();
    // So, it only allows updating displayName. If email were allowed, add:
    // if (data.email && data.email !== userToUpdate.email) {
    //   const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    //   if (existingUser && existingUser.id !== userIdToUpdate) {
    //     throw new ConflictException('Email already in use by another account.');
    //   }
    // }

    return this.prisma.user.update({
      where: { id: userIdToUpdate },
      data: {
        displayName: data.displayName, // Only displayName is updatable as per current UserUpdateSchema
        // email: data.email, // Add if email updates are allowed and handled
      },
    });
  }
}
