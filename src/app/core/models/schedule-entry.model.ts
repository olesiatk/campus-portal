export interface ScheduleEntry {
  id: number;
  groupId: number;
  dayOfWeek: number;
  slot: number;
  startTime: string;
  endTime: string;
  subjectId: number;
  teacherId: number;
  room: string;
}
