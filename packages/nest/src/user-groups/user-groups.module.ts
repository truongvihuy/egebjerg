import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGroupsController } from './user-groups.controller';
import { UserGroupsService } from './user-groups.service';
import { CounterModule } from '../counter/counter.module';
import { UsersModule } from '../users/users.module';
import { UserGroupsSchema } from './user-groups.schema';

@Module({
  imports: [
    UsersModule,
    CounterModule,
    MongooseModule.forFeature([{ name: 'UserGroups', schema: UserGroupsSchema }])
  ],
  controllers: [UserGroupsController],
  providers: [UserGroupsService],
  exports: [UserGroupsService],
})
export class UserGroupsModule { }