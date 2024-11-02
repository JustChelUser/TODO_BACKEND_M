import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UsersService } from "./users.service";
import { User } from "./users.entity";
import { createUserDto } from "./dto/create-user.dto";
import { updateUserDto } from "./dto/update-user.dto";

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {

    constructor(private userService: UsersService) { }

    @ApiOperation({ summary: 'Создание пользователя' })
    @ApiResponse({ status: 200, type: User })
    @Post()
    @UseGuards(JwtAuthGuard)
    createProject(@Body() userDto: createUserDto,@Req() req) {
        return this.userService.createUserManualy(userDto,req);
    }

    @ApiOperation({ summary: 'Получить всех польователей' })
    @ApiResponse({ status: 200, type: [User] })
    @Get()
    @UseGuards(JwtAuthGuard)
    getAllProjects(@Req() req) {
        return this.userService.getAllUsers(req);
    }

    @ApiOperation({ summary: 'Получить одного пользователя' })
    @ApiResponse({ status: 200, type: User })
    @Get('/:value')
    @UseGuards(JwtAuthGuard)
    getOneProject(@Param('value') id: number,@Req() req) {
        return this.userService.getOneUser(id,req);
    }

    @ApiOperation({ summary: 'Обновить пользователя' })
    @ApiResponse({ status: 200, type: User })
    @Put('/:id')
    @UseGuards(JwtAuthGuard)
    updateProject(@Body() updateUser: updateUserDto, @Param('id') id: number,@Req() req) {
        return this.userService.updateUser(id,updateUser,req);
    }

    @ApiOperation({ summary: 'Удалить пользователя' })
    @ApiResponse({ status: 200 })
    @Delete('/:id')
    @UseGuards(JwtAuthGuard)
    deleteProject(@Param('id') id: number,@Req() req) {
        return this.userService.removeUser(id,req);
    }
}
