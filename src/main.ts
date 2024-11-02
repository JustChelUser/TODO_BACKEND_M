import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import "reflect-metadata";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "./pipes/validation.pipe";



async function start() {
    const PORT = process.env.PORT || 5000; 
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
    .setTitle('Пример backend части to-do листа')
    .setDescription('Документация REST API')
    .setVersion('1.0.0')
    .addTag('to-do list')
    .build()
    const Document = SwaggerModule.createDocument(app,config);
    SwaggerModule.setup('/api/docs',app,Document);
    app.useGlobalPipes(new ValidationPipe)
    await app.listen(PORT,()=>console.log(`Servert started on port ${PORT}`));
}
start();