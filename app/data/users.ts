export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: number;
  name: string;
  email: string;
  roleIds: number[];
  status: UserStatus;
  createdAt: string; // ISO date
  // Demo only: store plaintext password for local mock auth
  password?: string;
}

export const users: User[] = [
  { id: 101, name: 'Alice Johnson', email: 'alice@example.com', roleIds: [1], status: 'active', createdAt: '2024-09-01T10:00:00Z' },
  { id: 102, name: 'Bob Smith', email: 'bob@example.com', roleIds: [2], status: 'active', createdAt: '2024-09-10T12:30:00Z' },
  { id: 103, name: 'Charlie Davis', email: 'charlie@example.com', roleIds: [3], status: 'pending', createdAt: '2024-10-02T08:15:00Z' },
  { id: 104, name: 'Diana King', email: 'diana@example.com', roleIds: [2,3], status: 'inactive', createdAt: '2024-10-05T14:45:00Z' },
];

export function findUser(id: number) {
  return users.find(u => u.id === id);
}
