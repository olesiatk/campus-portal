import { Component, Input, OnChanges } from '@angular/core';

export interface WeekScheduleEvent {
  id: number;
  /** 1 = Monday ... 6 = Saturday */
  dayOfWeek: number;
  /** "HH:mm" */
  startTime: string;
  /** "HH:mm" */
  endTime: string;
  title: string;
  subtitle?: string;
  /** Any stable id (e.g. subjectId) used to pick a consistent block color. */
  colorSeed: number;
}

interface PositionedEvent extends WeekScheduleEvent {
  top: number;
  height: number;
  /** Percent offset/width, for events that share the same day and start time (e.g. one teacher, two groups). */
  left: number;
  width: number;
}

interface DayColumn {
  value: number;
  label: string;
}

const DAYS: DayColumn[] = [
  { value: 1, label: 'Пн' },
  { value: 2, label: 'Вт' },
  { value: 3, label: 'Ср' },
  { value: 4, label: 'Чт' },
  { value: 5, label: 'Пт' },
  { value: 6, label: 'Сб' },
];

const START_HOUR = 8;
const END_HOUR = 17;
const PX_PER_MINUTE = 1.4;
const MIN_EVENT_HEIGHT = 30;

const PALETTE = [
  { bg: '#fdf1cf', fg: '#7a5b00' },
  { bg: '#fbe2e4', fg: '#8c2f34' },
  { bg: '#e3e8f5', fg: '#2c3a5e' },
  { bg: '#e1f3e5', fg: '#215732' },
  { bg: '#e8e1f7', fg: '#4a2f8c' },
];

@Component({
  selector: 'app-week-schedule-grid',
  standalone: false,
  templateUrl: './week-schedule-grid.component.html',
  styleUrl: './week-schedule-grid.component.scss',
})
export class WeekScheduleGridComponent implements OnChanges {
  @Input() events: WeekScheduleEvent[] = [];

  readonly days = DAYS;
  readonly hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  readonly bodyHeight = (END_HOUR - START_HOUR) * 60 * PX_PER_MINUTE;
  readonly todayDayOfWeek = new Date().getDay();

  eventsByDay: Record<number, PositionedEvent[]> = {};

  ngOnChanges(): void {
    const byDay: Record<number, PositionedEvent[]> = {};
    for (const day of this.days) {
      byDay[day.value] = this.layoutDay(this.events.filter((e) => e.dayOfWeek === day.value));
    }
    this.eventsByDay = byDay;
  }

  /** Positions events on the day's time axis, placing same-slot events (e.g. one teacher, two groups) side by side. */
  private layoutDay(entries: WeekScheduleEvent[]): PositionedEvent[] {
    const bySlot = new Map<string, WeekScheduleEvent[]>();
    for (const e of entries) {
      const slot = bySlot.get(e.startTime) ?? [];
      slot.push(e);
      bySlot.set(e.startTime, slot);
    }
    const positioned: PositionedEvent[] = [];
    for (const slot of bySlot.values()) {
      const width = 100 / slot.length;
      slot.forEach((e, i) => {
        positioned.push({
          ...e,
          top: (this.toMinutes(e.startTime) - START_HOUR * 60) * PX_PER_MINUTE,
          height: Math.max(
            MIN_EVENT_HEIGHT,
            (this.toMinutes(e.endTime) - this.toMinutes(e.startTime)) * PX_PER_MINUTE - 4
          ),
          left: i * width,
          width,
        });
      });
    }
    return positioned;
  }

  get hasEvents(): boolean {
    return this.events.length > 0;
  }

  hourTop(hour: number): number {
    return (hour - START_HOUR) * 60 * PX_PER_MINUTE;
  }

  color(seed: number): { bg: string; fg: string } {
    // Multiplicative hash so sequential ids (e.g. 1, 6, 11, 16...) still spread across the palette.
    const hashed = Math.imul(seed, 2654435761) >>> 0;
    return PALETTE[hashed % PALETTE.length];
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}
