import { ApiProperty } from "@nestjs/swagger";
import { List } from "src/lists/lists.entity";
import { User } from "src/users/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Table } from "typeorm";

@Entity()
export class Project {
  @ApiProperty({example:'1',description:'Уникальный идентификатор'})
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({example:'Моё хобби',description:'Название проекта'})
  @Column()
  name: string;

  @ApiProperty({example:'делаю что-то',description:'Описание проекта'})
  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.projects, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  user: User

  @OneToMany(() => List, (list) => list.project)
  lists: List[]

  @ApiProperty({example:'2024-08-13 20:50:13.886756',description:'Дата создания'})
  @CreateDateColumn()
  createdDate: Date
}







