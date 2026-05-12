/**
 * generates a random hexadecimal-number string with the specified length
 * @param length
 */
export function randomHexString(length: number): string{
    let result = '';
    const chars = 'abcdef0123456789';
    let i;
    for (i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}