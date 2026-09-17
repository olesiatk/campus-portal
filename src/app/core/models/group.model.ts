export interface Group {
  id: number;
  streamId: number;
  departmentId: number;
  name: string;
  studentCount: number;
  hasSubgroups: boolean;
}
