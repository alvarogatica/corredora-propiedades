export enum PropertyOperation {
  SALE = 'SALE', // Venta
  RENT = 'RENT', // Arriendo
}

export enum PropertyType {
  HOUSE = 'HOUSE',           // Casa
  APARTMENT = 'APARTMENT',   // Departamento
  LAND = 'LAND',             // Terreno / Parcela
  LOT = 'LOT',               // Lote
  COMMERCIAL = 'COMMERCIAL', // Local comercial / Oficina
}

export enum PropertyCurrency {
  CLP = 'CLP',
  UF = 'UF',
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE', // Disponible
  RESERVED = 'RESERVED',   // Reservada
  SOLD = 'SOLD',           // Vendida
  RENTED = 'RENTED',       // Arrendada
}
