import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Project } from "./projects.entity";
import { Repository } from "typeorm";
import { createProjectDto } from "./dto/create-project.dto";
import { User } from "src/users/users.entity";

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
        @InjectRepository(User)
        private userRepository: Repository<User>

    ) { }
    async createProject(dto: createProjectDto, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email } });
        if (user) {
            const project = this.projectRepository.create({ ...dto, user });
            await this.projectRepository.save(project);
            return project;
        } else {
            throw new HttpException('Пользователь с таким email не найден', HttpStatus.NOT_FOUND);
        }
    }

    async getAllProjects(req) {
        const email = req.user.email;
        const user = await this.userRepository.findOneBy({ email });
        if (user) {
            const projects = await this.projectRepository.find({
                where: { user: { id: user.id }, },relations: ['lists','lists.tasks'],
            });
            return projects;
        } else {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
    }

    async getOneProject(id: number, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOneBy({ email });
        if (user) {
            const project = await this.projectRepository.findOne({
                where: { user: { id: user.id }, id },
            });
            if (project) {
                return project;
            }
            else {
                throw new HttpException('Проект с таким id не найден либо принадлежит другому пользователю', HttpStatus.NOT_FOUND);
            }

        } else {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
    }
    async updateProject(id: number, updateData: createProjectDto, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOneBy({ email });
        if (user) {
            const project = await this.projectRepository.findOne({
                where: { user: { id: user.id }, id },
            });
            if (project) {
                this.projectRepository.merge(project, updateData);
                await this.projectRepository.save(project);
                return project;
            }
            else {
                throw new HttpException('Проект с таким id не найден либо принадлежит другому пользователю', HttpStatus.NOT_FOUND);
            }

        } else {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
    }
    async removeProject(id: number, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOneBy({ email });
        if (user) {
            const changes = await this.projectRepository.delete({
                user: { id: user.id }, id
            });
            if (changes.affected === 0) {
                return { message: "Такого проекта нет или он принадлежит другому пользователю" }
            } else {
                return { message: "Проект удалён" }
            }
        } else {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

    }
}