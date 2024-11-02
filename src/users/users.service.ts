import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm/repository/Repository";
import { User } from "./users.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { createUserDto } from "./dto/create-user.dto";
import { updateUserDto } from "./dto/update-user.dto";
import { AuthService } from "src/auth/auth.service";
import * as bcrypt from 'bcryptjs';


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @Inject(forwardRef(() => AuthService)) private authService: AuthService
    ) { }

    async createUser(dto: createUserDto) {
        const user = this.userRepository.create(dto);
        await this.userRepository.save(user);
        return user;
    }

    async createUserManualy(dto: createUserDto, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email, is_admin: true } });
        if (user) {
            return await this.authService.registration(dto);
        } else {
            throw new HttpException('Администратор с таким email не найден', HttpStatus.NOT_FOUND);
        }
    }

    async getAllUsers(req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email, is_admin: true } });
        if (user) {
            const users = await this.userRepository.find();
            return users;
        } else {
            throw new HttpException('Администратор с таким email не найден', HttpStatus.NOT_FOUND);
        }
    }

    async getOneUser(id: number, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email, is_admin: true } });
        if (user) {
            const user = await this.userRepository.findOne({ where: { id } });
            return user;
        } else {
            throw new HttpException('Администратор с таким email не найден', HttpStatus.NOT_FOUND);
        }
    }
    async updateUser(id: number, updateUser: updateUserDto, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email, is_admin: true } });
        if (user) {
            const userUpdate = await this.userRepository.findOne({ where: { id } });
            if (userUpdate) {
                const emailCheck = await this.getUserByEmail(updateUser.email);
                if (emailCheck && userUpdate.id!==emailCheck.id) {
                    throw new HttpException('Пользователь с таким email существует', HttpStatus.BAD_REQUEST);
                }
                const hashPassword = await bcrypt.hash(updateUser.password, 5);
                updateUser.password = hashPassword;
                this.userRepository.merge(userUpdate, updateUser);
                await this.userRepository.save(userUpdate);
                return userUpdate;
            }
            else {
                throw new HttpException('Пользователь с таким id не найден', HttpStatus.NOT_FOUND);
            }
        } else {
            throw new HttpException('Администратор с таким email не найден', HttpStatus.NOT_FOUND);
        }
    }
    async removeUser(id: number, req) {
        const email = req.user.email;
        const user = await this.userRepository.findOne({ where: { email, is_admin: true } });
        if (user) {
            const changes = await this.userRepository.delete({
                id
            });
            if (changes.affected === 0) {
                return { message: "Пользователь не удалён" }
            } else {
                return { message: "Пользователь удалён" }
            }
        } else {
            throw new HttpException('Администратор с таким email не найден', HttpStatus.NOT_FOUND);
        }
    }
    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({ where: { email } })
        return user;
    }
}