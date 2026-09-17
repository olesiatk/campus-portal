/**
 * One-off deterministic generator for the pet-project mock database.
 * Not part of the Angular app - run with `npm run seed` to (re)produce
 * src/app/core/mock-data/seed/*.json
 */
const fs = require('fs');
const path = require('path');

// ---------- deterministic PRNG (mulberry32) ----------
const SEED = 20260917;
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const randChoice = (arr) => arr[randInt(0, arr.length - 1)];
function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}

// ---------- id counters ----------
let nextUserId = 1;
let nextSubjectId = 1;
let nextGradeId = 1;
let nextScheduleId = 1;
let nextPendingId = 1;

// ---------- name pools ----------
const MALE_FIRST = [
  'Олександр', 'Максим', 'Дмитро', 'Андрій', 'Артем', 'Богдан', 'Владислав',
  'Данило', 'Євген', 'Ігор', 'Кирило', 'Микола', 'Олег', 'Павло', 'Роман',
  'Сергій', 'Тарас', 'Юрій', 'Віталій', 'Назар', 'Іван', 'Степан', 'Остап',
  'Ярослав', 'Микита', 'Руслан', 'Захар', 'Тимур', 'Марко', 'Валентин',
];
const FEMALE_FIRST = [
  'Анна', 'Марія', 'Оксана', 'Юлія', 'Катерина', 'Софія', 'Дарина',
  'Вікторія', 'Наталія', 'Тетяна', 'Ольга', 'Ірина', 'Христина', 'Аліна',
  'Валентина', 'Людмила', 'Марина', 'Олена', 'Світлана', 'Яна', 'Вероніка',
  'Діана', 'Лілія', 'Інна', 'Галина', 'Зоряна', 'Уляна', 'Богдана',
  'Мирослава', 'Соломія',
];
// unisex-ending Ukrainian surnames (don't inflect by gender) - keeps generation simple/correct
const SURNAMES = [
  'Шевченко', 'Бондаренко', 'Ткаченко', 'Кравченко', 'Мельник', 'Гончаренко',
  'Клименко', 'Савченко', 'Литвиненко', 'Руденко', 'Пономаренко',
  'Захарченко', 'Кириленко', 'Гриценко', 'Дяченко', 'Сидоренко',
  'Іванченко', 'Марченко', 'Панченко', 'Тимошенко', 'Гаврилюк',
  'Мельничук', 'Даниленко', 'Захарчук', 'Романюк', 'Костюк', 'Бойко',
  'Ткачук', 'Поліщук', 'Швачко', 'Онищенко', 'Григоренко', 'Василенко',
  'Науменко', 'Остапенко', 'Приходько', 'Демченко', 'Коваленко',
];
const usedEmails = new Set();
function makeEmail(firstName, lastName, domain) {
  const translit = {
    а: 'a', б: 'b', в: 'v', г: 'h', д: 'd', е: 'e', є: 'ie', ж: 'zh',
    з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm',
    н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ю: 'iu', я: 'ia',
    ь: '', "'": '',
  };
  const tr = (s) =>
    s
      .toLowerCase()
      .split('')
      .map((ch) => (translit[ch] !== undefined ? translit[ch] : ch))
      .join('');
  let base = `${tr(firstName)}.${tr(lastName)}`;
  let email = `${base}@${domain}`;
  let suffix = 1;
  while (usedEmails.has(email)) {
    email = `${base}${suffix}@${domain}`;
    suffix++;
  }
  usedEmails.add(email);
  return email;
}
function makePhone() {
  const ops = ['067', '068', '096', '097', '098', '063', '050', '099'];
  return `+380 ${randChoice(ops)} ${randInt(100, 999)} ${randInt(10, 99)}${randInt(10, 99)}`.replace(
    /(\d{2})(\d{2})$/,
    '$1-$2'
  );
}
function makePerson() {
  const isMale = rand() < 0.5;
  const firstName = isMale ? randChoice(MALE_FIRST) : randChoice(FEMALE_FIRST);
  const lastName = randChoice(SURNAMES);
  return { firstName, lastName };
}

// ---------- departments ----------
const departments = [
  { id: 1, code: 'ПМ', name: 'Кафедра прикладної математики' },
  { id: 2, code: 'ІТ', name: 'Кафедра інформаційних технологій' },
  { id: 3, code: 'СА', name: 'Кафедра системного аналізу' },
];

// ---------- streams (5 per department, course years 1..5) ----------
const streams = [];
let streamId = 1;
for (const dept of departments) {
  for (let course = 1; course <= 5; course++) {
    streams.push({
      id: streamId++,
      departmentId: dept.id,
      courseYear: course,
      name: `${course} курс`,
    });
  }
}

// ---------- groups (1 per stream) ----------
const groups = [];
let groupId = 1;
let groupNumCounter = {}; // per department, sequential group number
for (const stream of streams) {
  const dept = departments.find((d) => d.id === stream.departmentId);
  groupNumCounter[dept.id] = (groupNumCounter[dept.id] || 0) + 1;
  const studentCount = randInt(20, 40);
  groups.push({
    id: groupId,
    streamId: stream.id,
    departmentId: dept.id,
    name: `${dept.code}-${stream.courseYear}${groupNumCounter[dept.id]}`,
    studentCount,
    hasSubgroups: studentCount > 30,
  });
  groupId++;
}

// ---------- teachers (5 per department) & deans (2 per department) ----------
const users = [];
const teachersByDept = {};
const deansByDept = {};
for (const dept of departments) {
  teachersByDept[dept.id] = [];
  for (let i = 0; i < 5; i++) {
    const { firstName, lastName } = makePerson();
    const teacher = {
      id: nextUserId++,
      role: 'teacher',
      firstName,
      lastName,
      email: makeEmail(firstName, lastName, 'pim.edu.ua'),
      password: 'Passw0rd1',
      phone: makePhone(),
      departmentId: dept.id,
    };
    users.push(teacher);
    teachersByDept[dept.id].push(teacher);
  }
  deansByDept[dept.id] = [];
  for (let i = 0; i < 2; i++) {
    const { firstName, lastName } = makePerson();
    const dean = {
      id: nextUserId++,
      role: 'dean',
      firstName,
      lastName,
      email: makeEmail(firstName, lastName, 'pim.edu.ua'),
      password: 'Passw0rd1',
      phone: makePhone(),
      departmentId: dept.id,
    };
    users.push(dean);
    deansByDept[dept.id].push(dean);
  }
}

// ---------- subjects (8-10 per stream, teacher from same department) ----------
const SHARED_SUBJECTS = [
  'Вища математика', 'Іноземна мова', 'Філософія', 'Фізичне виховання',
  'Історія України', 'Лінійна алгебра', 'Дискретна математика',
  'Основи економіки',
];
const DEPT_SUBJECTS = {
  1: [
    'Диференціальні рівняння', 'Функціональний аналіз', 'Чисельні методи',
    'Теорія ймовірностей та математична статистика', 'Математична фізика',
    'Комплексний аналіз', 'Варіаційне обчислення', 'Теорія графів',
    'Топологія', 'Математична логіка',
  ],
  2: [
    "Об'єктно-орієнтоване програмування", 'Бази даних',
    'Алгоритми та структури даних', 'Веб-технології',
    'Комп\'ютерні мережі', 'Операційні системи', 'Архітектура комп\'ютерів',
    'Розробка мобільних застосунків', 'Хмарні технології',
    'Захист інформації',
  ],
  3: [
    'Системний аналіз', 'Теорія прийняття рішень', 'Моделювання систем',
    'Дослідження операцій', 'Штучний інтелект', 'Теорія управління',
    'Імітаційне моделювання', 'Аналіз даних', 'Оптимізаційні методи',
    'Експертні системи',
  ],
};

const subjects = [];
// round-robin teacher assignment counter per department, shuffled start each department
const teacherRoundRobin = {};
for (const dept of departments) {
  teacherRoundRobin[dept.id] = { order: shuffle(teachersByDept[dept.id]), idx: 0 };
}
function nextTeacherFor(deptId) {
  const rr = teacherRoundRobin[deptId];
  const teacher = rr.order[rr.idx % rr.order.length];
  rr.idx++;
  return teacher;
}

const subjectsByStream = {}; // streamId -> Subject[]
for (const stream of streams) {
  const pool = shuffle([...SHARED_SUBJECTS, ...DEPT_SUBJECTS[stream.departmentId]]);
  const count = randInt(8, 10);
  const names = pool.slice(0, count);
  const streamSubjects = names.map((name) => ({
    id: nextSubjectId++,
    name,
    departmentId: stream.departmentId,
    streamId: stream.id,
    teacherId: nextTeacherFor(stream.departmentId).id,
  }));
  subjects.push(...streamSubjects);
  subjectsByStream[stream.id] = streamSubjects;
}

// ---------- students ----------
const studentsByGroup = {}; // groupId -> User[]
for (const group of groups) {
  const stream = streams.find((s) => s.id === group.streamId);
  const list = [];
  for (let i = 0; i < group.studentCount; i++) {
    const { firstName, lastName } = makePerson();
    const student = {
      id: nextUserId++,
      role: 'student',
      firstName,
      lastName,
      email: makeEmail(firstName, lastName, 'students.pim.edu.ua'),
      password: 'Passw0rd1',
      phone: makePhone(),
      departmentId: group.departmentId,
      streamId: group.streamId,
      groupId: group.id,
      subgroup: group.hasSubgroups ? (i % 2 === 0 ? 1 : 2) : null,
      electiveSubjectIds: [],
    };
    users.push(student);
    list.push(student);
  }
  studentsByGroup[group.id] = list;
}

// ---------- elective subjects (1-2 per student, same courseYear, different department) ----------
for (const group of groups) {
  const stream = streams.find((s) => s.id === group.streamId);
  const otherDeptStreams = streams.filter(
    (s) => s.courseYear === stream.courseYear && s.departmentId !== stream.departmentId
  );
  for (const student of studentsByGroup[group.id]) {
    const electiveCount = randInt(1, 2);
    const chosenStreams = sample(otherDeptStreams, Math.min(electiveCount, otherDeptStreams.length));
    const electiveIds = [];
    for (const es of chosenStreams) {
      const candidate = randChoice(subjectsByStream[es.id]);
      electiveIds.push(candidate.id);
    }
    student.electiveSubjectIds = electiveIds;
  }
}

// ---------- admin ----------
const admin = {
  id: nextUserId++,
  role: 'admin',
  firstName: 'Адмін',
  lastName: 'Системи',
  email: 'pm-admin@test.com',
  password: '12345admin',
  phone: '+380 44 000 00 00',
};
users.push(admin);

// ---------- grades ----------
const grades = [];
const COMMENTS = [
  'Гарна робота', 'Потрібно підготуватись краще', 'Активна участь на занятті',
  'Відмінне виконання завдання', 'Незначні помилки', 'Слід повторити матеріал',
  '',
];
function randomDateInSemester() {
  // academic semester: 2025-09-01 .. 2025-12-20
  const start = new Date('2025-09-01').getTime();
  const end = new Date('2025-12-20').getTime();
  const t = start + rand() * (end - start);
  return new Date(t).toISOString().slice(0, 10);
}
const allSubjectsById = new Map(subjects.map((s) => [s.id, s]));
for (const student of users.filter((u) => u.role === 'student')) {
  const homeSubjects = subjectsByStream[student.streamId] || [];
  const subjectIds = [
    ...homeSubjects.map((s) => s.id),
    ...(student.electiveSubjectIds || []),
  ];
  for (const subjectId of subjectIds) {
    const subject = allSubjectsById.get(subjectId);
    const entries = randInt(3, 5);
    for (let i = 0; i < entries; i++) {
      grades.push({
        id: nextGradeId++,
        studentId: student.id,
        subjectId,
        teacherId: subject.teacherId,
        date: randomDateInSemester(),
        value: randInt(60, 100),
        comment: randChoice(COMMENTS),
      });
    }
  }
}

// ---------- weekly schedule (one canonical timetable per group) ----------
const SLOT_TIMES = [
  ['08:30', '09:50'],
  ['10:00', '11:20'],
  ['11:30', '12:50'],
  ['13:20', '14:40'],
  ['14:50', '16:10'],
];
const scheduleEntries = [];
for (const group of groups) {
  const streamSubjects = subjectsByStream[group.streamId];
  // each subject appears twice a week -> build a cycling list, shuffled for variety
  const doubled = shuffle([...streamSubjects, ...streamSubjects]);
  const totalSlotsAvailable = 5 * SLOT_TIMES.length; // 5 days
  const lessonsToPlace = Math.min(doubled.length, totalSlotsAvailable);
  let placed = 0;
  for (let day = 1; day <= 5 && placed < lessonsToPlace; day++) {
    for (let slot = 1; slot <= SLOT_TIMES.length && placed < lessonsToPlace; slot++) {
      const subject = doubled[placed];
      scheduleEntries.push({
        id: nextScheduleId++,
        groupId: group.id,
        dayOfWeek: day,
        slot,
        startTime: SLOT_TIMES[slot - 1][0],
        endTime: SLOT_TIMES[slot - 1][1],
        subjectId: subject.id,
        teacherId: subject.teacherId,
        room: `Ауд. ${randInt(1, 4)}${randInt(10, 30)}`,
      });
      placed++;
    }
  }
}

// ---------- pending requests (demo seed) ----------
const pendingRequests = [];
{
  // new student wanting to join an existing group
  const someGroup = groups[randInt(0, groups.length - 1)];
  const { firstName, lastName } = makePerson();
  pendingRequests.push({
    id: nextPendingId++,
    role: 'student',
    departmentId: someGroup.departmentId,
    streamId: someGroup.streamId,
    groupId: someGroup.id,
    firstName,
    lastName,
    email: makeEmail(firstName, lastName, 'students.pim.edu.ua'),
    status: 'pending',
    requestedAt: new Date('2025-09-10').toISOString(),
  });

  // existing teacher claiming their account
  const dept = randChoice(departments);
  const teacher = randChoice(teachersByDept[dept.id]);
  pendingRequests.push({
    id: nextPendingId++,
    role: 'teacher',
    departmentId: dept.id,
    email: teacher.email,
    targetUserId: teacher.id,
    status: 'pending',
    requestedAt: new Date('2025-09-12').toISOString(),
  });
}

// ---------- write output ----------
const outDir = path.join(__dirname, '..', 'src', 'app', 'core', 'mock-data', 'seed');
fs.mkdirSync(outDir, { recursive: true });
function write(name, data) {
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(data, null, 2) + '\n', 'utf-8');
}
write('departments', departments);
write('streams', streams);
write('groups', groups);
write('users', users);
write('subjects', subjects);
write('grades', grades);
write('schedule', scheduleEntries);
write('pending-requests', pendingRequests);

console.log('Seed data generated:');
console.log('  departments       ', departments.length);
console.log('  streams           ', streams.length);
console.log('  groups            ', groups.length);
console.log('  users (total)     ', users.length);
console.log('    - teachers      ', users.filter((u) => u.role === 'teacher').length);
console.log('    - deans         ', users.filter((u) => u.role === 'dean').length);
console.log('    - students      ', users.filter((u) => u.role === 'student').length);
console.log('    - admin         ', users.filter((u) => u.role === 'admin').length);
console.log('  subjects          ', subjects.length);
console.log('  grades            ', grades.length);
console.log('  scheduleEntries   ', scheduleEntries.length);
console.log('  pendingRequests   ', pendingRequests.length);
