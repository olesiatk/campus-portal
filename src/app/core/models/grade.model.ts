export interface Grade {
  id: number;
  studentId: number;
  subjectId: number;
  teacherId: number;
  date: string;
  value: number;
  comment?: string;
}
