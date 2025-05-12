import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseStrategy } from './strategies/firebase.strategy';
import { FirebaseService } from './firebase.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        UsersModule,
        PassportModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, FirebaseStrategy, FirebaseService],
    exports: [AuthService],
})
export class AuthModule { } 