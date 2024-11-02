import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users/users.entity";
import { Project } from "./projects/projects.entity";
import { List } from "./lists/lists.entity";
import { AuthModule } from './auth/auth.module';
import { UsersModule } from "./users/users.module";
import { ListsModule } from "./lists/lists.module";
import { TasksModule } from "./tasks/tasks.module";
import { ProjectsModule } from "./projects/projects.module";
import { Task } from "./tasks/tasks.entity";


@Module({
    controllers: [],
    providers: [],
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.env`
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: Number(process.env.POSTGRES_PORT),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DB,
          entities: [User,Project,List,Task],
          synchronize: true,
          autoLoadEntities:true
        }),
        UsersModule,
        ProjectsModule,
        ListsModule,
        TasksModule,
        AuthModule,
      ],
})
export class AppModule { }