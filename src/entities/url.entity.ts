import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('links')
export class UrlEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  originalUrl: string;

  @Column({ type: 'text' })
  generatedId: string;
}
