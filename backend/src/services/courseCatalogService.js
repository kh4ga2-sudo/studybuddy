// Service-layer note:
// Thin controllers currently call Prisma directly for clarity in a small academic project.
// This service file marks where business rules can grow, such as course recommendations,
// enrollment eligibility, and catalog filtering.

export function normalizeCourseLimit(limit) {
  if (!limit) return undefined;
  return Math.min(Number(limit), 500);
}
