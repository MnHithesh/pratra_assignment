/** Only follow app-internal return URLs, never something like //evil.com. */
export function safeReturnUrl(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}
