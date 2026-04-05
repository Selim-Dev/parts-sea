/**
 * Return a personalized shop greeting.
 * - If shopName is provided and non-empty → "أهلاً، {shopName}"
 * - If shopName is missing but username is provided → "أهلاً، {username}"
 * - If both are empty/undefined → "أهلاً"
 */
export function getShopGreeting(
  shopName?: string | null,
  username?: string
): string {
  if (shopName && shopName.trim().length > 0) {
    return `أهلاً، ${shopName}`;
  }
  if (username && username.trim().length > 0) {
    return `أهلاً، ${username}`;
  }
  return 'أهلاً';
}
