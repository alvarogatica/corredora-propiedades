const BLOCKED_WORDS = [
  'weon',
  'hueon',
  'weona',
  'hueona',
  'ctm',
  'conchetumadre',
  'conchatumadre',
  'culiao',
  'culiada',
  'qlo',
  'maricon',
  'maraca',
  'puta',
  'puto',
  'mierda',
  'pico',
  'chucha',
  'aweonao',
  'perkin',
  'bastardo',
  'imbecil',
  'idiota',
  'estupido',
];

const ABSURD_NAMES = new Set([
  'asdf',
  'qwerty',
  'test',
  'prueba',
  'usuario',
  'cliente',
  'admin',
  'administrador',
  'anonimo',
  'nadie',
  'xxx',
  'nombre',
  'apellido',
]);

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

/**
 * Elimina espacios al inicio/final y reemplaza múltiples espacios seguidos
 * por un único espacio en blanco ("Juan    Carlos" -> "Juan Carlos").
 */
export function sanitizePersonName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ');
}

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/);

  return words.some((word) => BLOCKED_WORDS.includes(word));
}

export function isValidPersonName(name: string): boolean {
  const cleaned = sanitizePersonName(name);

  if (cleaned.length < 2 || cleaned.length > 80) return false;
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(cleaned)) return false;

  // Cada parte del nombre/apellido debe tener al menos 2 letras (evita "J   P")
  const parts = cleaned.split(' ');
  if (parts.some((part) => part.replace(/['-]/g, '').length < 2)) return false;

  const normalized = normalizeText(cleaned);

  if (ABSURD_NAMES.has(normalized)) return false;
  if (/(.)\1{3,}/.test(normalized)) return false;

  return !containsProfanity(cleaned);
}
