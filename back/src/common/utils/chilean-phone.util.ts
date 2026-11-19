const FAKE_NUMBERS = new Set([
  '00000000',
  '11111111',
  '22222222',
  '33333333',
  '44444444',
  '55555555',
  '66666666',
  '77777777',
  '88888888',
  '99999999',
  '12345678',
  '87654321',
]);

/**
 * Limpia y normaliza un celular chileno al formato estándar +569XXXXXXXX.
 * Acepta entradas como: "+56 9 8765 4321", "56987654321", "987654321", "9 8765 4321".
 * Devuelve null si el formato es inválido o el número es falso.
 */
export function normalizeChileanMobile(rawPhone: string): string | null {
  if (!rawPhone || typeof rawPhone !== 'string') return null;

  // Eliminar espacios, guiones y paréntesis
  const cleaned = rawPhone.replace(/[\s\-().]/g, '');

  // Extraer los 8 dígitos posteriores al 9 inicial
  const match = cleaned.match(/^(?:\+?56)?9(\d{8})$/);
  if (!match) return null;

  const eightDigits = match[1];

  // Bloquear secuencias repetidas o falsas
  if (FAKE_NUMBERS.has(eightDigits)) return null;

  return `+569${eightDigits}`;
}

export function isValidChileanMobile(rawPhone: string): boolean {
  return normalizeChileanMobile(rawPhone) !== null;
}
