import { Role } from './role.model';

export interface User {
  id: number;
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  departmentId?: number;
  streamId?: number;
  groupId?: number;
  subgroup?: 1 | 2 | null;
  electiveSubjectIds?: number[];
}
