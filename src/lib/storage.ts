import { Assignment, Course, Event, ScheduleEvent, StudyGroup, Message, User } from '@/types';

const STORAGE_KEYS = {
  ASSIGNMENTS: 'classmate_assignments',
  COURSES: 'classmate_courses',
  EVENTS: 'classmate_events',
  SCHEDULE: 'classmate_schedule',
  STUDY_GROUPS: 'classmate_study_groups',
  MESSAGES: 'classmate_messages',
  USER: 'classmate_user',
} as const;

// Generic storage functions
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Assignment storage
export const getAssignments = (): Assignment[] => 
  getFromStorage(STORAGE_KEYS.ASSIGNMENTS, []);

export const saveAssignments = (assignments: Assignment[]): void =>
  saveToStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);

// Course storage
export const getCourses = (): Course[] =>
  getFromStorage(STORAGE_KEYS.COURSES, []);

export const saveCourses = (courses: Course[]): void =>
  saveToStorage(STORAGE_KEYS.COURSES, courses);

// Event storage
export const getEvents = (): Event[] =>
  getFromStorage(STORAGE_KEYS.EVENTS, []);

export const saveEvents = (events: Event[]): void =>
  saveToStorage(STORAGE_KEYS.EVENTS, events);

// Schedule storage
export const getSchedule = (): ScheduleEvent[] =>
  getFromStorage(STORAGE_KEYS.SCHEDULE, []);

export const saveSchedule = (schedule: ScheduleEvent[]): void =>
  saveToStorage(STORAGE_KEYS.SCHEDULE, schedule);

// Study group storage
export const getStudyGroups = (): StudyGroup[] =>
  getFromStorage(STORAGE_KEYS.STUDY_GROUPS, []);

export const saveStudyGroups = (groups: StudyGroup[]): void =>
  saveToStorage(STORAGE_KEYS.STUDY_GROUPS, groups);

// Message storage
export const getMessages = (): Message[] =>
  getFromStorage(STORAGE_KEYS.MESSAGES, []);

export const saveMessages = (messages: Message[]): void =>
  saveToStorage(STORAGE_KEYS.MESSAGES, messages);

// User storage
export const getUser = (): User | null =>
  getFromStorage(STORAGE_KEYS.USER, null);

export const saveUser = (user: User): void =>
  saveToStorage(STORAGE_KEYS.USER, user);

// Initialize with sample data if empty
export const initializeSampleData = () => {
  if (getAssignments().length === 0) {
    const sampleAssignments: Assignment[] = [
      {
        id: '1',
        title: 'Math 101 - Problem Set 4',
        course: 'Calculus I',
        dueDate: '2024-03-15',
        priority: 'high',
        completed: false,
        description: 'Complete problems 1-20 from chapter 5',
        timeLeft: '2 days'
      },
      {
        id: '2',
        title: 'History Essay - Renaissance Art',
        course: 'Art History',
        dueDate: '2024-03-18',
        priority: 'medium',
        completed: false,
        description: 'Write a 5-page essay on Renaissance art influences',
        timeLeft: '5 days'
      }
    ];
    saveAssignments(sampleAssignments);
  }

  if (getCourses().length === 0) {
    const sampleCourses: Course[] = [
      {
        id: '1',
        name: 'Calculus I',
        code: 'MATH 101',
        grade: 'A-',
        percentage: 92,
        credits: 4,
        trend: 'up'
      },
      {
        id: '2',
        name: 'Physics II',
        code: 'PHYS 201',
        grade: 'B+',
        percentage: 87,
        credits: 4,
        trend: 'up'
      }
    ];
    saveCourses(sampleCourses);
  }

  if (getUser() === null) {
    const sampleUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@university.edu',
      initials: 'JD',
      gpa: '3.7'
    };
    saveUser(sampleUser);
  }
};