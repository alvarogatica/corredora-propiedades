import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateAgentDto, UpdateProfileDto } from './dto';
import { Role } from '../../common/enums';
import { Roles, CurrentUser } from '../../common/decorators';
import type { AuthenticatedUser } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Ruta pública para listar corredores activos en /corredores.
   */
  @Get('agents/public')
  getPublicAgents() {
    return this.usersService.findPublicAgents();
  }

  /**
   * Obtener el perfil del usuario autenticado (CLIENT, AGENT o ADMIN).
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findById(user.id);
  }

  /**
   * Actualizar el perfil propio (CLIENT, AGENT o ADMIN).
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateOwnProfile(user.id, dto);
  }

  /**
   * Crear un nuevo trabajador/corredor (Exclusivo ADMIN).
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Post('agents')
  createAgent(
    @Body() dto: CreateAgentDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.usersService.createAgent(dto, admin.id);
  }

  /**
   * Listar todos los corredores incluyendo desactivados (Exclusivo ADMIN).
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('agents')
  getAllAgentsForAdmin() {
    return this.usersService.findAllAgentsForAdmin();
  }

  /**
   * Listar todos los clientes registrados (Exclusivo ADMIN).
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('clients')
  getAllClientsForAdmin() {
    return this.usersService.findAllClientsForAdmin();
  }

  /**
   * Desactivar corredor mediante Soft Delete (Exclusivo ADMIN).
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('agents/:id')
  deactivateAgent(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.usersService.deactivateAgent(id, admin.id);
  }

  /**
   * Reactivar corredor previamente desactivado (Exclusivo ADMIN).
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('agents/:id/reactivate')
  reactivateAgent(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.usersService.reactivateAgent(id, admin.id);
  }
}
