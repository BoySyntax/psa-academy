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

  // Upload learning material using optimized chunked upload.
  // Uses 5 MB chunks (5x fewer requests) and parallel uploads for files < 25 MB.
  // Falls back to single upload for very small files to minimize overhead.
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

    // Adaptive chunk sizing: 5MB for most files, 10MB for very large files
    const CHUNK_SIZE = file.size > 100 * 1024 * 1024 ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE) || 1;
    const uploadId =
      Math.random().toString(36).slice(2) + Date.now().toString(36);

    // Small files (< 5MB) upload as a single chunk to avoid overhead
    if (file.size <= CHUNK_SIZE) {
      return this._uploadSingleChunk(file, lessonId, courseId, teacherId, materialName, description, onProgress);
    }

    // Parallel uploads for medium files (5-25MB) to speed things up
    const PARALLEL_THRESHOLD = 25 * 1024 * 1024;
    const useParallel = file.size <= PARALLEL_THRESHOLD && totalChunks <= 5;

    try {
      if (useParallel) {
        return this._uploadParallelChunks(file, lessonId, courseId, teacherId, totalChunks, uploadId, materialName, description, onProgress);
      } else {
        return this._uploadSequentialChunks(file, lessonId, courseId, teacherId, totalChunks, uploadId, materialName, description, onProgress);
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  },

  // Helper: single chunk upload for small files
  async _uploadSingleChunk(
    file: File,
    lessonId: number,
    courseId: number,
    teacherId: string,
    materialName?: string,
    description?: string,
    onProgress?: (pct: number) => void
  ) {
    const fd = new FormData();
    fd.append('chunk', file, file.name);
    fd.append('upload_id', Math.random().toString(36).slice(2) + Date.now().toString(36));
    fd.append('chunk_index', '0');
    fd.append('total_chunks', '1');
    fd.append('file_name', file.name);
    fd.append('file_size', String(file.size));
    fd.append('lesson_id', String(lessonId));
    fd.append('course_id', String(courseId));
    fd.append('teacher_id', teacherId);
    if (materialName) fd.append('material_name', materialName);
    if (description) fd.append('description', description);

    onProgress?.(10);
    const response = await fetch(`${API_BASE_URL}/teacher/upload-chunk.php`, {
      method: 'POST',
      body: fd,
    });
    onProgress?.(90);

    if (!response.ok) {
      let errMsg = 'Upload failed';
      try {
        const err = await response.json();
        errMsg = err.message || errMsg;
      } catch { /* ignore */ }
      return { success: false, message: errMsg };
    }

    onProgress?.(100);
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
  },

  // Helper: parallel chunk upload for medium files
  async _uploadParallelChunks(
    file: File,
    lessonId: number,
    courseId: number,
    teacherId: string,
    totalChunks: number,
    uploadId: string,
    materialName?: string,
    description?: string,
    onProgress?: (pct: number) => void
  ) {
    const CHUNK_SIZE = 5 * 1024 * 1024;
    const chunks = [];
    for (let idx = 0; idx < totalChunks; idx++) {
      const start = idx * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      chunks.push({ idx, chunk: file.slice(start, end) });
    }

    let completed = 0;
    const results = new Map<number, boolean>();

    const uploadChunk = async ({ idx, chunk }: { idx: number; chunk: Blob }) => {
      const fd = new FormData();
      fd.append('chunk', chunk, file.name);
      fd.append('upload_id', uploadId);
      fd.append('chunk_index', String(idx));
      fd.append('total_chunks', String(totalChunks));
      fd.append('file_name', file.name);
      fd.append('file_size', String(file.size));
      fd.append('lesson_id', String(lessonId));
      fd.append('course_id', String(courseId));
      fd.append('teacher_id', teacherId);
      if (materialName) fd.append('material_name', materialName);
      if (description) fd.append('description', description);

      const response = await fetch(`${API_BASE_URL}/teacher/upload-chunk.php`, {
        method: 'POST',
        body: fd,
      });

      if (!response.ok) throw new Error(`Chunk ${idx} failed`);
      
      completed++;
      onProgress?.(Math.round((completed / totalChunks) * 100));
      
      // Last chunk returns the final result
      if (idx === totalChunks - 1) {
        try {
          return await response.json();
        } catch {
          return { message: 'Material uploaded successfully' };
        }
      }
      return null;
    };

    // Upload in parallel with concurrency of 3
    const CONCURRENCY = 3;
    for (let i = 0; i < chunks.length; i += CONCURRENCY) {
      const batch = chunks.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map(uploadChunk));
    }

    return { success: true, message: 'Material uploaded successfully' };
  },

  // Helper: sequential chunk upload for large files
  async _uploadSequentialChunks(
    file: File,
    lessonId: number,
    courseId: number,
    teacherId: string,
    totalChunks: number,
    uploadId: string,
    materialName?: string,
    description?: string,
    onProgress?: (pct: number) => void
  ) {
    const CHUNK_SIZE = file.size > 100 * 1024 * 1024 ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    
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
      fd.append('lesson_id', String(lessonId));
      fd.append('course_id', String(courseId));
      fd.append('teacher_id', teacherId);
      if (materialName) fd.append('material_name', materialName);
      if (description) fd.append('description', description);

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

      onProgress?.(Math.round(((idx + 1) / totalChunks) * 100));

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
