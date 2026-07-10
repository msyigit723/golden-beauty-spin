// Regex for Turkish phone number: 05XXXXXXXXX
// Total 11 digits, starts with 05
const phoneRegex = /^05\d{9}$/;

export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  return phoneRegex.test(phone.trim());
}

export function formatPhone(phone: string): string {
  // Removes all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  
  // Format as 05XX XXX XX XX for display
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
}

export function validatePassword(password: string): boolean {
  if (!password) return false;
  return password.trim().length >= 8;
}

export function validateRequired(value: string | undefined | null): boolean {
  if (value === undefined || value === null) return false;
  return value.trim().length > 0;
}
