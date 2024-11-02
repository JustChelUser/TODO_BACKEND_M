import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Task } from "./tasks.entity";
import { In, Repository } from "typeorm";
import { createTaskDto } from "./dto/create-task.dto";
import { List } from "src/lists/lists.entity";
import { User } from "src/users/users.entity";
import { updateTaskDto } from "./dto/update-task.dto";
import { changePositionTaskDto } from "./dto/change-position-task.dto";

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
        @InjectRepository(List)
        private listRepository: Repository<List>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }
    async createTask(dto: createTaskDto, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email }, relations: ['projects'] });
        if (user) {
            const list = await this.listRepository.findOne({
                where: { id: dto.listId, project: { id: In(user.projects.map(project => project.id)) } },
                relations: ['project'],
            });
            if (list) {
                const countTasks = await this.taskRepository.count({
                    where: { list: { id: list.id } }
                });
                dto.position = countTasks + 1;
                const task = this.taskRepository.create({ ...dto, list });
                await this.taskRepository.save(task);
                return task;
            }
            else {
                throw new HttpException('Лист задач с таким id не найден либо принадлежит другому пользователю', HttpStatus.NOT_FOUND);
            }
        } else {
            throw new HttpException('Пользователь с таким email не найден', HttpStatus.NOT_FOUND);
        }
    }

    async getAllTasks(req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email }, relations: ['projects'] });
        if (user) {
            const lists = await this.listRepository.find({
                where: { project: { id: In(user.projects.map(project => project.id)) } },
            });
            const listIds = lists.map(list => list.id);
            const tasks = await this.taskRepository.find({ where: { list: In(listIds) }, relations: ['list'] });
            return tasks;
        } else {
            throw new HttpException('Пользователь с таким email не найден', HttpStatus.NOT_FOUND);
        }
    }

    async getOneTask(id: number, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email }, relations: ['projects'] });
        if (user) {
            const lists = await this.listRepository.find({
                where: { project: { id: In(user.projects.map(project => project.id)) } },
            });
            const listIds = lists.map(list => list.id);
            const task = await this.taskRepository.findOne({ where: { list: In(listIds), id }, relations: ['list'] });
            if (task) {
                return task;
            }
            else {
                throw new HttpException('Задача с таким id не найдена либо принадлежит другому пользователю', HttpStatus.NOT_FOUND);
            }
        } else {
            throw new HttpException('Пользователь с таким email не найден', HttpStatus.NOT_FOUND);
        }
    }
    async updateTask(id: number, updateData: updateTaskDto, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email }, relations: ['projects'] });
        if (user) {
            const lists = await this.listRepository.find({
                where: { project: { id: In(user.projects.map(project => project.id)) } },
            });
            const listIds = lists.map(list => list.id);
            const task = await this.taskRepository.findOne({ where: { list: In(listIds), id }, relations: ['list'] });
            if (task) {
                this.taskRepository.merge(task, updateData);
                await this.taskRepository.save(task);
                return task;
            }
            else {
                throw new HttpException('Задача с таким id не найдена либо принадлежит другому пользователю', HttpStatus.NOT_FOUND);
            }
        } else {
            throw new HttpException('Пользователь с таким email не найден', HttpStatus.NOT_FOUND);
        }
    }
    async updateTaskPosition(id: number, updateData: changePositionTaskDto, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email }, relations: ['projects'] });
        if (user) {
            const lists = await this.listRepository.find({
                where: { project: { id: In(user.projects.map(project => project.id)) } },
            });
            const listIds = lists.map(list => list.id);
            const task = await this.taskRepository.findOne({ where: { list: In(listIds), id }, relations: ['list'] });
            if (task) {
                const originalListId = task.list.id;
                const newListId = updateData.listId;
                if (originalListId !== newListId) {
                    const result = listIds.find(element => element === newListId);
                    if (!result) {
                        throw new HttpException('Список задач с таким id не найден либо принадлежит другому пользователю', HttpStatus.NOT_FOUND);
                    }
                }
                const countTasks = await this.taskRepository.count({
                    where: { list: { id: newListId } }
                });
                if (originalListId === newListId) {
                    return this.PositionInSameList(task, updateData, newListId, countTasks);
                }
                else {
                    //если пользователь поменял лист на другой
                    return this.PositionInOtherList(task, updateData, newListId, countTasks);
                }
            }
            else {
                throw new HttpException('Задача с таким id не найдена либо принадлежит другому пользователю', HttpStatus.NOT_FOUND);
            }
        } else {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
    }
    async PositionInSameList(task: Task, updateData: changePositionTaskDto, newListId: number, countTasks: number) {
        if (updateData.position > countTasks) {
            updateData.position = countTasks;
        }
        if (updateData.position !== task.position) {
            let tasks = await this.taskRepository.find({ where: { list: { id: newListId } }, order: { position: 'ASC' } });
            const oldPosition = task.position;
            const newPosition = updateData.position;
            if (newPosition < oldPosition) {
                tasks.forEach((taskA) => {
                    if (taskA.id !== task.id && taskA.position >= newPosition && taskA.position < oldPosition) {
                        taskA.position++;
                    }
                });
            } else {
                tasks.forEach((taskA) => {
                    if (taskA.id !== task.id && taskA.position > oldPosition && taskA.position <= newPosition) {
                        taskA.position--;
                    }
                });
            }
            task.position = newPosition;
            await this.taskRepository.save([...tasks, task]);
        }
        return task;

    }
    async PositionInOtherList(task: Task, updateData: changePositionTaskDto, newListId: number, countTasks: number) {
        if (updateData.position > countTasks) {
            updateData.position = countTasks + 1;
        }
        const deletedPosition = task.position;
        const changes = await this.taskRepository.delete(task.id);
        if (changes.affected === 0) {
            return { message: "Не удалось удалить задачу из изначального списка. Отмена всех изменений" }
        }
        else {
            let tasks = await this.taskRepository.find({ where: { list: { id: task.list.id } }, order: { position: 'ASC' } });
            if (tasks.length !== 0) {
                tasks.forEach((taskA) => {
                    if (taskA.position > deletedPosition) {
                        taskA.position--;
                    }
                });
            }
            await this.taskRepository.save(tasks);
            //добавляем в новый лист и пересчитываем его позиции
            let Newtasks = await this.taskRepository.find({ where: { list: { id: newListId } }, order: { position: 'ASC' } });
            const newPosition = updateData.position;
            Newtasks.forEach((taskA) => {
                if (newPosition <= taskA.position) {
                    taskA.position++;
                }
            });
            task.position = newPosition;
            task.list.id = updateData.listId;
            await this.taskRepository.save([...Newtasks, task]);
            return task;
        }

    }
    async removeTask(id: number, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email }, relations: ['projects'] });
        if (user) {
            const lists = await this.listRepository.find({
                where: { project: { id: In(user.projects.map(project => project.id)) } },
            });
            const listIds = lists.map(list => list.id);
            const task = await this.taskRepository.findOne({ where: { list: In(listIds), id }, relations: ['list'] });
            if (task) {
                const deletedPosition = task.position;
                const changes = await this.taskRepository.delete(task.id);
                if (changes.affected === 0) {
                    return { message: "Такой задачи нет или она принадлежит другому пользователю" }
                } else {
                    let tasks = await this.taskRepository.find({ where: { list: { id: task.list.id } }, order: { position: 'ASC' } });
                    if (tasks.length != 0) {
                        tasks.forEach((taskA) => {
                            if (taskA.position >= deletedPosition) {
                                taskA.position--;
                            }
                        });
                    }
                    await this.taskRepository.save(tasks);
                    return { message: "Задача удалёна" }
                }
            }
            else {
                throw new HttpException('Задача с таким id не найдена либо принадлежит другому пользователю', HttpStatus.NOT_FOUND);
            }
        } else {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
    }
}
