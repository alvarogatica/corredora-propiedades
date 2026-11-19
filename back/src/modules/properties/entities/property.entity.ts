import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import {
  PropertyCurrency,
  PropertyOperation,
  PropertyStatus,
  PropertyType,
} from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { PropertyImage } from './property-image.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  code: string;

  @Column({ length: 160 })
  title: string;

  @Column({ unique: true, length: 190 })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: PropertyOperation })
  operation: PropertyOperation;

  @Column({ type: 'enum', enum: PropertyType })
  type: PropertyType;

  @Column({
    type: 'enum',
    enum: PropertyCurrency,
    default: PropertyCurrency.CLP,
  })
  currency: PropertyCurrency;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.AVAILABLE })
  status: PropertyStatus;

  @Column({ length: 100 })
  region: string;

  @Column({ length: 100 })
  commune: string;

  @Column({ length: 200 })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: 'int', default: 0 })
  bedrooms: number;

  @Column({ type: 'int', default: 0 })
  bathrooms: number;

  @Column({ type: 'int', default: 0 })
  parkingSpaces: number;

  @Column({ name: 'built_area', type: 'decimal', precision: 10, scale: 2, nullable: true })
  builtArea?: number;

  @Column({ name: 'total_area', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalArea?: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.assignedProperties, { nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent?: User;

  @Column({ name: 'agent_id', nullable: true })
  agentId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => PropertyImage, (image) => image.property, { cascade: true })
  images: PropertyImage[];

  @OneToMany(() => Appointment, (appointment) => appointment.property)
  appointments: Appointment[];
}
