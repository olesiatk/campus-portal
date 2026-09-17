import { Role } from './role.model';

export type PendingRequestStatus = 'pending' | 'approved' | 'rejected';

export interface PendingRequest {
  id: number;
  role: Role;
  departmentId: number;
  streamId?: number;
  groupId?: number;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  targetUserId?: number;
  status: PendingRequestStatus;
  requestedAt: string;
}
