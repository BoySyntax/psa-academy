export type UserType = 'student' | 'teacher' | 'admin' | 'management';

export const USER_TYPES: Record<UserType, { label: string; value: UserType }> = {
  student: { label: 'Student', value: 'student' },
  teacher: { label: 'Teacher', value: 'teacher' },
  admin: { label: 'Admin', value: 'admin' },
  management: { label: 'Management', value: 'management' },
};

export const USER_TYPE_OPTIONS = Object.values(USER_TYPES);
