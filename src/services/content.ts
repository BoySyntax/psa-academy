const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/charming_api';

export type LessonType = 'video' | 'document' | 'quiz' | 'assignment' | 'reading' | 'pre_test' | 'post_test';
export type MaterialType = 'pdf' | 'video' | 'image' | 'document' | 'link' | 'other';
export type LessonProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface CourseModule {
  id: number;
  course_id: number;
  module_name: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  lesson_count?: number;
}

export interface Lesson {
  id: number;
  module_id: number;
  lesson_title: string;
  lesson_content?: string;
  lesson_type: LessonType;
  duration_minutes?: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  materials?: LearningMaterial[];
}

export interface LearningMaterial {
  id: number;
  lesson_id?: number;
  course_id?: number;
  material_name: string;
  material_type: MaterialType;
  file_url: string;
  file_size?: number;
  description?: string;
  uploaded_by?: number;
  created_at: string;
}

export interface CreateModuleData {
  course_id: number;
  module_name: string;
  description?: string;
  order_index: number;
}

export interface CreateLessonData {
  module_id: number;
  lesson_title: string;
  lesson_content?: string;
  lesson_type: LessonType;
  duration_minutes?: number;
  order_index: number;
  is_published?: boolean;
}

export interface CreateMaterialData {
  lesson_id?: number;
  course_id?: number;
  material_name: string;
  material_type: MaterialType;
  file_url: string;
  file_size?: number;
  description?: string;
}

export const contentService = {
  // Module Management
  async getCourseModules(courseId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/modules.php?course_id=${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          modules: result.modules || [],
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch modules',
          modules: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch modules',
        modules: [],
      };
    }
  },

  async createModule(data: CreateModuleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/modules.php`, {
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
          message: result.message || 'Module created successfully',
          module: result.module,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to create module',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create module',
      };
    }
  },

  async updateModule(moduleId: number, data: Partial<CreateModuleData>) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/modules.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: moduleId, ...data }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Module updated successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to update module',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update module',
      };
    }
  },

  async deleteModule(moduleId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/modules.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: moduleId }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Module deleted successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to delete module',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete module',
      };
    }
  },

  // Lesson Management
  async getModuleLessons(moduleId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/lessons.php?module_id=${moduleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          lessons: result.lessons || [],
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch lessons',
          lessons: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch lessons',
        lessons: [],
      };
    }
  },

  async getLessonById(lessonId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/lessons.php?id=${lessonId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          lesson: result.lesson,
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

  async createLesson(data: CreateLessonData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/lessons.php`, {
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
          message: result.message || 'Lesson created successfully',
          lesson: result.lesson,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to create lesson',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create lesson',
      };
    }
  },

  async updateLesson(lessonId: number, data: Partial<CreateLessonData>) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/lessons.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: lessonId, ...data }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Lesson updated successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to update lesson',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update lesson',
      };
    }
  },

  async deleteLesson(lessonId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/lessons.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: lessonId }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Lesson deleted successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to delete lesson',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete lesson',
      };
    }
  },

  // Learning Materials Management
  async getLessonMaterials(lessonId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/materials.php?lesson_id=${lessonId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          materials: result.materials || [],
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch materials',
          materials: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch materials',
        materials: [],
      };
    }
  },

  async createMaterial(data: CreateMaterialData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/materials.php`, {
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
          message: result.message || 'Material uploaded successfully',
          material: result.material,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to upload material',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload material',
      };
    }
  },

  async deleteMaterial(materialId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/materials.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: materialId }),
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

  // File Upload
  async uploadFile(file: File, courseId: number) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('course_id', courseId.toString());

      const response = await fetch(`${API_BASE_URL}/admin/upload.php`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'File uploaded successfully',
          file_url: result.file_url,
          file_size: result.file_size,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to upload file',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload file',
      };
    }
  },
};
