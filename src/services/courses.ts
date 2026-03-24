const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/charming_api';

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  duration_hours?: number;
  max_students?: number;
  status: CourseStatus;
  thumbnail_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  teacher_count?: number;
  student_count?: number;
  teachers?: Teacher[];
}

export interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface CreateCourseData {
  course_code: string;
  course_name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  duration_hours?: number;
  max_students?: number;
  status?: CourseStatus;
  thumbnail_url?: string;
}

export interface AssignTeacherData {
  course_id: string;
  teacher_id: string;
}

export const courseService = {
  async getAllCourses() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses.php`, {
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
          message: result.message || 'Failed to fetch courses',
          courses: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch courses',
        courses: [],
      };
    }
  },

  async getCourseById(courseId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses.php?id=${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          course: result.course,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch course',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch course',
      };
    }
  },

  async createCourse(data: CreateCourseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Course created successfully',
          course: result.course,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to create course',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create course',
      };
    }
  },

  async updateCourse(courseId: string, data: Partial<CreateCourseData>) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: courseId, ...data }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Course updated successfully',
          course: result.course,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to update course',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update course',
      };
    }
  },

  async deleteCourse(courseId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: courseId }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Course deleted successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to delete course',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete course',
      };
    }
  },

  async assignTeacher(data: AssignTeacherData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/course-teachers.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Teacher assigned successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to assign teacher',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to assign teacher',
      };
    }
  },

  async removeTeacher(courseId: string, teacherId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/course-teachers.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course_id: courseId, teacher_id: teacherId }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Teacher removed successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to remove teacher',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove teacher',
      };
    }
  },

  async getCourseTeachers(courseId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/course-teachers.php?course_id=${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          teachers: result.teachers || [],
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch teachers',
          teachers: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch teachers',
        teachers: [],
      };
    }
  },
};
