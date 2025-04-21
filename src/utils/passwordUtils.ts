/**
 * Simple password hashing function for React Native
 * Note: In a production environment, use a proper crypto library
 */
export function hashPassword(password: string): string {
  // This is a simple hashing approach - in production, use a proper crypto library
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to positive hex string
  return Math.abs(hash).toString(16) + password.length;
} 