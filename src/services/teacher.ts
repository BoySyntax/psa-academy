const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/charming_api';

export interface TeacherCourse {
  id: number;
  course_code: string;
  course_name: string;
  description?: string;
  category?: string;
  duration_hours?: number;
  max_students?: number;
  status: string;
  thumbnail_url?: string;
  enrolled_count?: number;
  completed_count?: number;
}

export interface LearningMaterial {
  id: number;
  lesson_id: number;
  course_id?: number;
  material_name: string;
  material_type: 'pdf' | 'video' | 'image' | 'document' | 'link' | 'other';
  file_url: string;
  file_size?: number;
  description?: string;
  uploaded_by?: number;
  created_at?: string;
}

export const teacherService = {
  // Get courses assigned to teacher
  async getMyCourses(teacherId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/my-courses.php?teacher_id=${teacherId}`, {
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

  // Upload learning material
  async uploadMaterial(
    lessonId: number,
    courseId: number,
    teacherId: string,
    file: File,
    materialName?: string,
    description?: string
  ) {
    try {
      // Client-side guardrail to avoid PHP/Apache rejecting large uploads
      const maxBytes = 500 * 1024 * 1024;
      if (file.size > maxBytes) {
        return {
          success: false,
          message: 'File is too large. Maximum allowed size is 500MB.',
        };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('lesson_id', lessonId.toString());
      formData.append('course_id', courseId.toString());
      formData.append('teacher_id', teacherId);
      if (materialName) formData.append('material_name', materialName);
      if (description) formData.append('description', description);

      const response = await fetch(`${API_BASE_URL}/teacher/upload-material.php`, {
        method: 'POST',
        body: formData,
      });

      // Backend may return HTML on errors (e.g. PHP warnings). Avoid JSON parse crash.
      let result: any = null;
      let rawText: string | null = null;
      try {
        result = await response.json();
      } catch {
        try {
          rawText = await response.text();
        } catch {
          rawText = null;
        }
      }

      if (response.ok) {
        return {
          success: true,
          message: (result && result.message) || 'Material uploaded successfully',
          material: result?.material,
        };
      } else {
        return {
          success: false,
          message:
            (result && result.message) ||
            (rawText ? rawText.slice(0, 300) : null) ||
            'Failed to upload material',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload material',
      };
    }
  },

  // Delete learning material
  async deleteMaterial(materialId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/upload-material.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ material_id: materialId }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Material deleted successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to delete material',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete material',
      };
    }
  },

  // Get course content with ability to edit
  async getCourseContent(courseId: number, teacherId: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/teacher/course-content.php?course_id=${courseId}&teacher_id=${teacherId}`,
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

  // Get enrolled students for a course
  async getEnrolledStudents(courseId: number) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/teacher/enrolled-students.php?course_id=${courseId}`,
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
          students: result.students || [],
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch students',
          students: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch students',
        students: [],
      };
    }
  },
};
