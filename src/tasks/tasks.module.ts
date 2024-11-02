import { TypeOrmModule } from "@nestjs/typeorm";
import {TasksService } from "./tasks.service";
import { forwardRef, Module } from "@nestjs/common";
import { User } from "src/users/users.entity";
import { Project } from "src/projects/projects.entity";
import { Task } from "./tasks.entity";
import { List } from "src/lists/lists.entity";
import { TasksController } from "./tasks.controller";
import { AuthModule } from "src/auth/auth.module";

@Module({
    controllers: [TasksController],
    providers: [TasksService],
    imports: [TypeOrmModule.forFeature([Project,User,List,Task]),
    forwardRef(() => AuthModule)],
    exports: [
        TasksService,
    ]
})
export class TasksModule { }