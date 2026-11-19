export enum AppointmentStatus {
  PENDING = 'PENDING',       // Solicitada por el cliente (esperando corredor)
  CONFIRMED = 'CONFIRMED',   // Aceptada / asignada a un corredor
  COMPLETED = 'COMPLETED',   // Visita realizada
  CANCELLED = 'CANCELLED',   // Cancelada
}
