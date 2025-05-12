import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { FirebaseService } from '../firebase.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
    constructor(
        private firebaseService: FirebaseService,
        private prisma: PrismaService,
    ) {
        super();
    }

    async validate(req: any): Promise<any> {
        const token = this.extractTokenFromHeader(req);
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const decodedToken = await this.firebaseService.verifyToken(token);
            const firebaseUser = await this.firebaseService.getUser(decodedToken.uid);

            // Find or create user in our database
            let user = await this.prisma.user.findUnique({
                where: { email: firebaseUser.email },
            });

            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        id: firebaseUser.uid,
                        email: firebaseUser.email!,
                        displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
                    },
                });
            }

            return user;
        } catch (error) {
            throw new UnauthorizedException();
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
} 