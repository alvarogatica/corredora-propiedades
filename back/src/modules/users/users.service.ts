import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities';
import { CreateAgentDto, UpdateProfileDto } from './dto';
import { Role } from '../../common/enums';
import {
  isValidPersonName,
  normalizeChileanMobile,
  sanitizePersonName,
} from '../../common/utils';
import { AuditService } from '../audit';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Crea automáticamente el Administrador inicial si aún no existe en PostgreSQL.
   */
  async onModuleInit(): Promise<void> {
    const adminEmail = 'admin@corredora.cl';
    const existingAdmin = await this.usersRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin1234!', 10);
      const admin = this.usersRepository.create({
        firstName: 'Administrador',
        lastName: 'Principal',
        email: adminEmail,
        password: hashedPassword,
        phone: '+56911112222',
        role: Role.ADMIN,
        isActive: true,
      });

      await this.usersRepository.save(admin);
      this.logger.log(
        `👑 Administrador inicial creado -> Email: ${adminEmail} | Pass: Admin1234!`,
      );
    }
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('LOWER(user.email) = LOWER(:email)', { email: email.trim() })
      .getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return user;
  }

  /**
   * Registro público: fuerza el rol CLIENT siempre.
   */
  async createClient(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<Omit<User, 'password'>> {
    const cleanFirst = sanitizePersonName(data.firstName);
    const cleanLast = sanitizePersonName(data.lastName);

    if (!isValidPersonName(cleanFirst) || !isValidPersonName(cleanLast)) {
      throw new BadRequestException(
        'El nombre o apellido contiene palabras no permitidas o tiene un formato inválido.',
      );
    }

    const normalizedPhone = normalizeChileanMobile(data.phone);
    if (!normalizedPhone) {
      throw new BadRequestException(
        'Ingresa un teléfono móvil chileno válido (ej: +56 9 8765 4321).',
      );
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const exists = await this.usersRepository.findOne({
      where: { email: cleanEmail },
      withDeleted: true,
    });
    if (exists) {
      throw new ConflictException('Ya existe una cuenta registrada con este correo.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const client = this.usersRepository.create({
      firstName: cleanFirst,
      lastName: cleanLast,
      email: cleanEmail,
      password: hashedPassword,
      phone: normalizedPhone,
      role: Role.CLIENT, // Forzado estrictamente en backend
      isActive: true,
    });

    const saved = await this.usersRepository.save(client);
    const { password: _, ...result } = saved;
    return result;
  }

  /**
   * Creación de trabajadores/corredores (AGENT): exclusivo del ADMIN.
   */
  async createAgent(
    dto: CreateAgentDto,
    adminId: string,
  ): Promise<Omit<User, 'password'>> {
    const cleanFirst = sanitizePersonName(dto.firstName);
    const cleanLast = sanitizePersonName(dto.lastName);

    if (!isValidPersonName(cleanFirst) || !isValidPersonName(cleanLast)) {
      throw new BadRequestException(
        'El nombre o apellido del corredor no es válido.',
      );
    }

    const normalizedPhone = normalizeChileanMobile(dto.phone);
    if (!normalizedPhone) {
      throw new BadRequestException(
        'Ingresa un teléfono móvil chileno válido (ej: +56 9 8765 4321).',
      );
    }

    const cleanEmail = dto.email.trim().toLowerCase();
    const exists = await this.usersRepository.findOne({
      where: { email: cleanEmail },
      withDeleted: true,
    });
    if (exists) {
      throw new ConflictException('Ya existe un usuario con este correo electrónico.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const agent = this.usersRepository.create({
      firstName: cleanFirst,
      lastName: cleanLast,
      email: cleanEmail,
      password: hashedPassword,
      phone: normalizedPhone,
      role: Role.AGENT,
      isActive: true,
    });

    const saved = await this.usersRepository.save(agent);

    await this.auditService.log({
      userId: adminId,
      action: 'CREATE_AGENT',
      entityType: 'USER',
      entityId: saved.id,
      details: { email: saved.email, fullName: `${cleanFirst} ${cleanLast}` },
    });

    const { password: _, ...result } = saved;
    return result;
  }

   /**
   * Listado público de corredores activos (para /corredores).
   */
  async findPublicAgents(): Promise<Partial<User>[]> {
    return this.usersRepository.find({
      where: { role: Role.AGENT, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
      },
      order: { firstName: 'ASC' },
    });
  }


  /**
   * Listado completo de corredores para el ADMIN (incluye desactivados / Soft Delete).
   */
  async findAllAgentsForAdmin(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: Role.AGENT },
      withDeleted: true,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Listado de clientes registrados para el ADMIN.
   */
  async findAllClientsForAdmin(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: Role.CLIENT },
      withDeleted: true,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualización del perfil propio (CLIENT, AGENT o ADMIN).
   */
  async updateOwnProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);

    if (dto.firstName !== undefined) {
      const cleanFirst = sanitizePersonName(dto.firstName);
      if (!isValidPersonName(cleanFirst)) {
        throw new BadRequestException('El nombre ingresado no es válido.');
      }
      user.firstName = cleanFirst;
    }

    if (dto.lastName !== undefined) {
      const cleanLast = sanitizePersonName(dto.lastName);
      if (!isValidPersonName(cleanLast)) {
        throw new BadRequestException('El apellido ingresado no es válido.');
      }
      user.lastName = cleanLast;
    }

    if (dto.phone !== undefined) {
      const normalizedPhone = normalizeChileanMobile(dto.phone);
      if (!normalizedPhone) {
        throw new BadRequestException(
          'Ingresa un teléfono móvil chileno válido (ej: +56 9 8765 4321).',
        );
      }
      user.phone = normalizedPhone;
    }

    return this.usersRepository.save(user);
  }

  /**
   * Soft Delete de un corredor: pierde acceso al instante, pero su historial permanece.
   */
  async deactivateAgent(agentId: string, adminId: string): Promise<void> {
    const agent = await this.findById(agentId);
    if (agent.role !== Role.AGENT) {
      throw new BadRequestException('Solo se pueden desactivar cuentas de corredores.');
    }

    agent.isActive = false;
    await this.usersRepository.save(agent);
    await this.usersRepository.softRemove(agent);

    await this.auditService.log({
      userId: adminId,
      action: 'DEACTIVATE_AGENT',
      entityType: 'USER',
      entityId: agent.id,
      details: { email: agent.email, fullName: `${agent.firstName} ${agent.lastName}` },
    });
  }

  /**
   * Reactivar un corredor previamente desactivado.
   */
  async reactivateAgent(agentId: string, adminId: string): Promise<void> {
    const agent = await this.findById(agentId);
    if (agent.role !== Role.AGENT) {
      throw new BadRequestException('El usuario seleccionado no es un corredor.');
    }

    await this.usersRepository.restore(agentId);
    agent.isActive = true;
    agent.deletedAt = undefined;
    await this.usersRepository.save(agent);

    await this.auditService.log({
      userId: adminId,
      action: 'REACTIVATE_AGENT',
      entityType: 'USER',
      entityId: agent.id,
      details: { email: agent.email, fullName: `${agent.firstName} ${agent.lastName}` },
    });
  }
}
