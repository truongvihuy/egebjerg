import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicStrategy } from './basic.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { UserGroupsModule } from '../user-groups/user-groups.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    UserGroupsModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: configService.get<string>('jwt.exp') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, BasicStrategy, JwtStrategy],
  exports: [AuthService, JwtModule],
  controllers: [AuthController],
})
export class AuthModule { }