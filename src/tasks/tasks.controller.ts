import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TasksService } from "./tasks.service";
import { Task } from "./tasks.entity";
import { createTaskDto } from "./dto/create-task.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { updateTaskDto } from "./dto/update-task.dto";
import { changePositionTaskDto } from "./dto/change-position-task.dto";

@ApiTags('Задачи ')
@Controller('tasks')
export class TasksController {

    constructor(private tasksService: TasksService) { }

    @ApiOperation({ summary: 'Создание задачи' })
    @ApiResponse({ status: 200, type: Task })
    @Post()
    @UseGuards(JwtAuthGuard)
    createTask(@Body() taskDto: createTaskDto,@Req() req) {
        return this.tasksService.createTask(taskDto,req);
    }

    @ApiOperation({ summary: 'Получить задачи' })
    @ApiResponse({ status: 200, type: [Task] })
    @Get()
    @UseGuards(JwtAuthGuard)
    getAllTasks(@Req() req) {
        return this.tasksService.getAllTasks(req);
    }

    @ApiOperation({ summary: 'Получить одну задачу' })
    @ApiResponse({ status: 200, type: Task })
    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    getOneTask(@Param('id') id: number,@Req() req) {
        return this.tasksService.getOneTask(id,req);
    }


    @ApiOperation({ summary: 'Обновить задачу' })
    @ApiResponse({ status: 200, type: Task })
    @Put('/:id')
    @UseGuards(JwtAuthGuard)
    updateTask(@Body() taskDto: updateTaskDto, @Param('id') id: number,@Req() req) {
        return this.tasksService.updateTask(id, taskDto,req);
    }

    @ApiOperation({ summary: 'Обновить позицию задачи' })
    @ApiResponse({ status: 200, type: Task })
    @Put('/position/:id')
    @UseGuards(JwtAuthGuard)
    updateTaskPosition(@Body() taskDto: changePositionTaskDto, @Param('id') id: number,@Req() req) {
        return this.tasksService.updateTaskPosition(id, taskDto,req);
    }

    @ApiOperation({ summary: 'Удалить задачу' })
    @ApiResponse({ status: 200 })
    @Delete('/:id')
    @UseGuards(JwtAuthGuard)

    deleteTask(@Param('id') id: number,@Req() req) {
        return this.tasksService.removeTask(id,req);
    }
}
