/**
 * Utility functions for Ahammed Fertilizer Application
 */

type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];

/**
 * Combines and normalizes CSS class names.
 * Lightweight alternative without requiring external clsx/tailwind-merge dependencies.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const process = (val: ClassValue) => {
    if (!val) return;

    if (typeof val === 'string' || typeof val === 'number') {
      classes.push(String(val));
    } else if (Array.isArray(val)) {
      val.forEach(process);
    } else if (typeof val === 'object') {
      for (const [key, value] of Object.entries(val)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  };

  inputs.forEach(process);

  // Return deduped, cleaned string
  return classes
    .join(' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Sanitizes and formats phone numbers for WhatsApp API links.
 * E.g. formats Indian 10-digit mobile numbers with international code +91.
 */
export function formatWhatsAppUrl(phone: string, message: string): string {
  // Strip non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Add 91 country code for 10-digit Indian numbers if missing
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encodedMessage}`;
}

/**
 * Formats a phone number for tel: links
 */
export function formatPhoneUrl(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return `tel:${cleaned}`;
}

/**
 * Formats a physical location / address into a Google Maps search URL
 */
export function formatDirectionsUrl(address: string): string {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

/**
 * Converts a string into a URL-friendly slug.
 * Handles English, digits, hyphens, and maintains Bengali Unicode characters gracefully.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\u0980-\u09FF-]+/g, '') // Remove non-word characters except Bengali script and hyphens
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Truncates text to a specified length and appends ellipsis
 */
export function truncate(text: string, length: number): string {
  if (!text || text.length <= length) return text;
  return `${text.slice(0, length).trim()}...`;
}

/**
 * Generates an informative prefilled WhatsApp inquiry message for a specific product
 */
export function getWhatsAppProductMessage(productName: string, lang: 'en' | 'bn' = 'en'): string {
  if (lang === 'bn') {
    return `নমস্কার, আমি আহম্মেদ ফার্টিলাইজারের ওয়েবসাইট থেকে "${productName}" পণ্যটি সম্পর্কে জানতে আগ্রহী। এই পণ্যের বর্তমান মূল্য, স্টক ও ব্যবহারের সঠিক নিয়ম জানাবেন কি?`;
  }

  return `Hello, I saw "${productName}" on the Ahammed Fertilizer website. Could you please share the current availability, pricing, and recommended application dosage?`;
}
