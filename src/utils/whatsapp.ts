/**
 * Formats a phone number for WhatsApp links.
 * Handles 8-digit Mauritanian phone numbers (like 42481202) by prepending country code 222.
 */
export function formatWhatsAppUrl(phoneNumber: string, message: string): string {
  const digits = (phoneNumber || '').replace(/[^0-9]/g, '');
  
  let internationalNumber = digits;
  if (digits.length === 8) {
    // Mauritanian national 8-digit number (e.g., 42481202, 32111295)
    internationalNumber = `222${digits}`;
  }

  const encodedMessage = encodeURIComponent(message);

  if (internationalNumber) {
    return `https://wa.me/${internationalNumber}?text=${encodedMessage}`;
  }

  return `https://api.whatsapp.com/send?text=${encodedMessage}`;
}

export function displayPhoneNumber(phoneNumber: string): string {
  const digits = (phoneNumber || '').replace(/[^0-9]/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)}`;
  }
  return phoneNumber;
}
