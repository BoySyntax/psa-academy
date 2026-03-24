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

  // Upload learning material using chunked upload to bypass ngrok's 40s request timeout.
  // Files are split into 1 MB pieces; each piece is a separate HTTP POST that completes
  // in a few seconds regardless of file size.
  async uploadMaterial(
    lessonId: number,
    courseId: number,
    teacherId: string,
    file: File,
    materialName?: string,
    description?: string,
    onProgress?: (pct: number) => void
  ) {
    const MAX_BYTES = 500 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return { success: false, message: 'File is too large. Maximum allowed size is 500MB.' };
    }

    const CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB — well within ngrok's 40 s timeout
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE) || 1;
    const uploadId =
      Math.random().toString(36).slice(2) + Date.now().toString(36);

    try {
      for (let idx = 0; idx < totalChunks; idx++) {
        const start = idx * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const fd = new FormData();
        fd.append('chunk', chunk, file.name);
        fd.append('upload_id', uploadId);
        fd.append('chunk_index', String(idx));
        fd.append('total_chunks', String(totalChunks));
        fd.append('file_name', file.name);
        fd.append('file_size', String(file.size));
        // Send metadata on every chunk so the backend has it when assembling
        fd.append('lesson_id', String(lessonId));
        fd.append('course_id', String(courseId));
        fd.append('teacher_id', teacherId);
        if (materialName) fd.append('material_name', materialName);
        if (description)  fd.append('description', description);

        const response = await fetch(`${API_BASE_URL}/teacher/upload-chunk.php`, {
          method: 'POST',
          body: fd,
        });

        if (!response.ok) {
          let errMsg = 'Chunk upload failed';
          try {
            const err = await response.json();
            errMsg = err.message || errMsg;
          } catch { /* ignore */ }
          return { success: false, message: errMsg };
        }

        // Report progress after each successful chunk
        onProgress?.(Math.round(((idx + 1) / totalChunks) * 100));

        // Last chunk response contains the final material info
        if (idx === totalChunks - 1) {
          try {
            const result = await response.json();
            return {
              success: true,
              message: result.message || 'Material uploaded successfully',
              material: result.material,
            };
          } catch {
            return { success: true, message: 'Material uploaded successfully' };
          }
        }
      }
      return { success: true, message: 'Material uploaded successfully' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
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
