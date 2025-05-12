import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { FirebaseService } from './firebase.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
        private firebaseService: FirebaseService,
    ) { }

    async validateUser(token: string) {
        const decodedToken = await this.firebaseService.verifyToken(token);
        const firebaseUser = await this.firebaseService.getUser(decodedToken.uid);

        let user = await this.prisma.user.findUnique({
            where: { email: firebaseUser.email },
        });

        if (!user) {
            user = await this.usersService.create({
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
            });
        }

        return user;
    }
} 