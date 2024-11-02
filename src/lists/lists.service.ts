import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { List } from "./lists.entity";
import { In, Repository } from "typeorm";
import { createListDto } from "./dto/create-list.dto";
import { User } from "src/users/users.entity";
import { Project } from "src/projects/projects.entity";
import { updateListDto } from "./dto/update-list.dto";
import { ChangePositionListDto } from "./dto/change-position-list.dto";

@Injectable()
export class ListsService {
    constructor(
        @InjectRepository(List)
        private listRepository: Repository<List>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Project)
        private projectRepository: Repository<Project>
    ) { }
    async createList(dto: createListDto, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email } });
        if (user) {
            const project = await this.projectRepository.findOne({
                where: { user: { id: user.id }, id: dto.projectId },
            });
            if (project) {
                const countLists = await this.listRepository.count({
                    where: { project: { id: project.id } }
                });
                dto.position = countLists + 1;
                const list = this.listRepository.create({ ...dto, project });
                await this.listRepository.save(list);
                return list;
            } else {
                throw new HttpException('Проект с таким id не найден либо принадлежит другому пользователю', HttpStatus.NOT_FOUND);
            }
        } else {
            throw new HttpException('Пользователь с таким email не найден', HttpStatus.NOT_FOUND);
        }
    }

    async getAllLists(req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email }, relations: ['projects'] });
        if (user) {
            const projectIds = user.projects.map(project => project.id);
            const lists = await this.listRepository.find({ where: { project: In(projectIds) }, relations: ['project'] });
            return lists;
        } else {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
    }

    async getOneList(id: number, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email }, relations: ['projects'] });
        if (user) {
            const projectIds = user.projects.map(project => project.id);
            const list = await this.listRepository.findOne({ where: { project: In(projectIds), id }, relations: ['project'] });
            if (list) {
                return list;
            }
            else {
                throw new HttpException('Лист задач с таким id не найден либо принадлежит другому пользователю', HttpStatus.NOT_FOUND);
            }
        } else {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

    }
    async updateList(id: number, updateData: updateListDto, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email }, relations: ['projects'] });
        if (user) {
            const projectIds = user.projects.map(project => project.id);
            const list = await this.listRepository.findOne({ where: { project: In(projectIds), id }, relations: ['project'] });
            if (list) {
                this.listRepository.merge(list, updateData);
                await this.listRepository.save(list);
                return list;
            }
            else {
                throw new HttpException('Лист задач с таким id не найден либо принадлежит другому пользователю', HttpStatus.NOT_FOUND);
            }
        } else {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
    }
    async updateListPosition(id: number, updateData: ChangePositionListDto, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email }, relations: ['projects'] });
        if (user) {
            const projectIds = user.projects.map(project => project.id);
            const list = await this.listRepository.findOne({ where: { project: In(projectIds), id }, relations: ['project'] });
            if (list) {
                const countLists = await this.listRepository.count({
                    where: { project: { id: list.project.id } }
                });
                if (updateData.position <= countLists) {
                    if (updateData.position !== list.position) {
                        let lists = await this.listRepository.find({ where: { project: { id: list.project.id } }, order: { position: 'ASC' } });
                        const oldPosition = list.position;
                        const newPosition = updateData.position;
                        if (newPosition < oldPosition) {
                            lists.forEach((listA) => {
                                if (listA.id !== list.id && listA.position >= newPosition && listA.position < oldPosition) {
                                    listA.position++;
                                }
                            });
                        } else {
                            lists.forEach((listA) => {
                                if (listA.id !== list.id && listA.position > oldPosition && listA.position <= newPosition) {
                                    listA.position--;
                                }
                            });
                        }
                        list.position = newPosition;
                        await this.listRepository.save([...lists, list]);
                    }
                    return list;
                } else {
                    throw new HttpException(`Новая позиция не может быть больше общего количества списков на данный момент. Всего списков ${countLists}. Запрашиваемая позиция ${updateData.position}`, HttpStatus.NOT_FOUND);
                }
            }
            else {
                throw new HttpException('Лист задач с таким id не найден либо принадлежит другому пользователю', HttpStatus.NOT_FOUND);
            }
        } else {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
    }
    async removeList(id: number, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email }, relations: ['projects'] });
        if (user) {
            const projectIds = user.projects.map(project => project.id);
            const list = await this.listRepository.findOne({ where: { project: In(projectIds), id }, relations: ['project'] });
            if (list) {
                const deletedPosition = list.position;
                const changes = await this.listRepository.delete(list.id);
                if (changes.affected === 0) {
                    return { message: "Такого списка задач нет или он принадлежит другому пользователю" }
                } else {
                    let lists = await this.listRepository.find({ where: { project: { id: list.project.id } }, order: { position: 'ASC' } });
                    if (lists.length != 0) {
                        lists.forEach((listA) => {
                            if (listA.position >= deletedPosition) {
                                listA.position--;
                            }
                        });
                    }
                    await this.listRepository.save(lists);
                    return { message: "Список задач удалён" }
                }
            }
            else {
                throw new HttpException('Лист задач с таким id не найден либо принадлежит другому пользователю', HttpStatus.NOT_FOUND);
            }
        } else {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
    }
}