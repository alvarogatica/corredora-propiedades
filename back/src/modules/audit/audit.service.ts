import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities';

export interface CreateAuditLogParams {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async log(params: CreateAuditLogParams): Promise<void> {
    const entry = this.auditRepository.create(params);
    await this.auditRepository.save(entry);
  }

  async findAll(limit = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({
      relations: { user: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
