export interface Permission {
  id: number;
  key: string; // machine name, e.g., 'user.create'
  name: string; // human label
  description?: string;
}

export const permissions: Permission[] = [
  { id: 1, key: 'user.view', name: 'View Users', description: 'Can view users list and details' },
  { id: 2, key: 'user.create', name: 'Create Users', description: 'Can create new users' },
  { id: 3, key: 'user.update', name: 'Update Users', description: 'Can edit existing users' },
  { id: 4, key: 'user.delete', name: 'Delete Users', description: 'Can delete users' },
  { id: 5, key: 'role.view', name: 'View Roles', description: 'Can view roles and assignments' },
  { id: 6, key: 'role.manage', name: 'Manage Roles', description: 'Can create, edit and delete roles' },
  { id: 7, key: 'permission.view', name: 'View Permissions' },
  { id: 8, key: 'permission.manage', name: 'Manage Permissions' },
];

export function findPermission(id: number) {
  return permissions.find(p => p.id === id);
}

