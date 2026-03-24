const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/charming_api';

export interface Enrollment {
  id: number;
  course_id: number;
  student_id: number;
  enrollment_date: string;
  completion_date?: string;
  status: 'pending' | 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'rejected';
  progress_percentage: number;
  course?: {
    id: number;
    course_code: string;
    course_name: string;
    description?: string;
    category?: string;
    thumbnail_url?: string;
    duration_hours?: number;
    teacher?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    } | null;
  };
}

export interface CourseModule {
  id: number;
  course_id: number;
  module_name: string;
  description?: string;
  order_index: number;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: number;
  module_id: number;
  lesson_title: string;
  lesson_content?: string;
  lesson_type: 'video' | 'document' | 'quiz' | 'assignment' | 'reading';
  duration_minutes?: number;
  order_index: number;
  is_published: boolean;
  progress?: LessonProgress;
}

export interface LessonProgress {
  id: number;
  student_id: number;
  lesson_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  time_spent_minutes: number;
  started_at?: string;
  completed_at?: string;
  last_accessed: string;
}

export const enrollmentService = {
  // Get all courses student is enrolled in
  async getMyEnrollments(studentId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/enrollments.php?student_id=${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          enrollments: result.enrollments || [],
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch enrollments',
          enrollments: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch enrollments',
        enrollments: [],
      };
    }
  },

  // Get available courses to enroll
  async getAvailableCourses(studentId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/available-courses.php?student_id=${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          courses: result.courses || [],
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch available courses',
          courses: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch available courses',
        courses: [],
      };
    }
  },

  // Enroll in a course
  async enrollInCourse(studentId: string, courseId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/enroll.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_id: studentId, course_id: courseId }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Enrolled successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to enroll',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to enroll',
      };
    }
  },

  // Get course content with modules and lessons
  async getCourseContent(courseId: number, studentId: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/student/course-content.php?course_id=${courseId}&student_id=${studentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          course: result.course,
          modules: result.modules || [],
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch course content',
          modules: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch course content',
        modules: [],
      };
    }
  },

  // Update lesson progress
  async updateLessonProgress(
    studentId: string,
    lessonId: number,
    status: 'not_started' | 'in_progress' | 'completed',
    progressPercentage: number
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/lesson-progress.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          lesson_id: lessonId,
          status,
          progress_percentage: progressPercentage,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Progress updated',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to update progress',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update progress',
      };
    }
  },

  // Get lesson details
  async getLessonDetails(lessonId: number, studentId: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/student/lesson.php?lesson_id=${lessonId}&student_id=${studentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          lesson: result.lesson,
          materials: result.materials || [],
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch lesson',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch lesson',
      };
    }
  },
};
