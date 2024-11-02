import { TypeOrmModule } from "@nestjs/typeorm";
import { Project } from "./projects.entity";
import { ProjectsService } from "./projects.service";
import { forwardRef, Module } from "@nestjs/common";
import { User } from "src/users/users.entity";
import { List } from "src/lists/lists.entity";
import { ProjectsController } from "./projects.controller";
import { AuthModule } from "src/auth/auth.module";

@Module({
    controllers: [ProjectsController],
    providers: [ProjectsService],
    imports: [
        TypeOrmModule.forFeature([Project, User, List]),
    forwardRef(() => AuthModule)],
    exports: [
        ProjectsService,
    ]
})
export class ProjectsModule { }