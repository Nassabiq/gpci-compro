import type { Permission } from '@/data/permissions';

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissionIds: number[]; // references permissions
}

export const roles: Role[] = [
  { id: 1, name: 'Admin', description: 'Full access to the system', permissionIds: [1,2,3,4,5,6,7,8] },
  { id: 2, name: 'Editor', description: 'Manage content and users (limited)', permissionIds: [1,2,3,5] },
  { id: 3, name: 'Viewer', description: 'Read-only access', permissionIds: [1,5,7] },
];

export function findRole(id: number) {
  return roles.find(r => r.id === id);
}

export function roleHasPermission(role: Role, permId: number) {
  return role.permissionIds.includes(permId);
}

