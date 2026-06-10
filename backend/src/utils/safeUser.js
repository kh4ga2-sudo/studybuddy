export function safeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}
