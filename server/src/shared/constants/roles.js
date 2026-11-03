/**
 * NAKKO Platform - User Role Constants
 */

export const ROLES = Object.freeze({
  CLIENT: 'CLIENT',
  WORKER: 'WORKER',
  ADMIN: 'ADMIN',
  COOPERATIVE_ADMIN: 'COOPERATIVE_ADMIN'
});

export const ROLE_ALIASES = Object.freeze({
  user: ROLES.CLIENT,
  client: ROLES.CLIENT,
  worker: ROLES.WORKER,
  dev: ROLES.ADMIN,
  admin: ROLES.ADMIN,
  coop: ROLES.COOPERATIVE_ADMIN,
  cooperative_admin: ROLES.COOPERATIVE_ADMIN
});

export function normalizeRole(role) {
  if (!role) return ROLES.CLIENT;
  const lower = String(role).trim().toLowerCase();
  return ROLE_ALIASES[lower] || ROLES.CLIENT;
}

