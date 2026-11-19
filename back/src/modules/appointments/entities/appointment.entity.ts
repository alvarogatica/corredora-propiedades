import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AppointmentStatus } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

@Entity('appointments')
@Index(['propertyId', 'scheduledDate', 'timeSlot'], {
  unique: true,
  where: `"status" != 'CANCELLED'`,
})
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'scheduled_date', type: 'date' })
  scheduledDate: string;

  @Column({ name: 'time_slot', length: 20 })
  timeSlot: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  clientNotes?: string;

  @Column({ type: 'text', nullable: true })
  agentNotes?: string;

  @ManyToOne(() => Property, (property) => property.appointments)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'property_id' })
  propertyId: string;

  @ManyToOne(() => User, (user) => user.clientAppointments)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => User, (user) => user.agentAppointments, { nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent?: User;

  @Column({ name: 'agent_id', nullable: true })
  agentId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
