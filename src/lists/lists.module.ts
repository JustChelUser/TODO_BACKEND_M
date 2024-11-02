import { TypeOrmModule } from "@nestjs/typeorm";
import { ListsService } from "./lists.service";
import { forwardRef, Module } from "@nestjs/common";
import { User } from "src/users/users.entity";
import { Project } from "src/projects/projects.entity";
import { List } from "./lists.entity";
import { ListsController } from "./lists.controller";
import { AuthModule } from "src/auth/auth.module";

@Module({
    controllers: [ListsController],
    providers: [ListsService],
    imports: [TypeOrmModule.forFeature([Project,User,List]),
    forwardRef(() => AuthModule)],
    exports: [
        ListsService,
    ]
})
export class ListsModule { }