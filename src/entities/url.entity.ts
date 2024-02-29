import { Entity, Column, BaseEntity, ObjectIdColumn } from "typeorm";

@Entity('links')
export class UrlEntity extends BaseEntity {
  @ObjectIdColumn()
  _id: string;
  @Column({ type: 'text' })
  originalUrl: string;

  @Column({ type: 'text' })
  generatedId: string;
}
