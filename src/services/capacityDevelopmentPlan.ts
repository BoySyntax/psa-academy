import { courseService, Course } from "@/services/courses";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";

export interface CapacityDevelopmentPlanItem {
  id: number;
  plan_year: number;
  course_id: number;
  proposed_training_schedule?: string | null;
  target_participants?: string | null;
  estimated_participants?: number | null;
  status_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  course: {
    id: number;
    course_code: string;
    course_name: string;
    category?: string | null;
    subcategory?: string | null;
    description?: string | null;
    max_students?: number | null;
  };
  competencies: {
    core?: string;
    leadership?: string;
    technical?: string;
  };
}

export interface CapacityDevelopmentPlanPayload {
  plan_year: number;
  course_id: number;
  proposed_training_schedule?: string;
  target_participants?: string;
  estimated_participants?: number | null;
  status_notes?: string;
  created_by?: number;
}

const parseCompetencies = (raw?: string | null) => {
  const empty = { core: "", leadership: "", technical: "" };
  if (!raw) return empty;
  const match = raw.match(/^Core:\s*(.*?)\s*\|\s*Leadership:\s*(.*?)\s*\|\s*Technical:\s*(.*)$/);
  if (!match) {
    return { ...empty, technical: raw };
  }
  return {
    core: (match[1] || "").trim(),
    leadership: (match[2] || "").trim(),
    technical: (match[3] || "").trim(),
  };
};

export const capacityDevelopmentPlanService = {
  async getByYear(planYear: number) {
    const response = await fetch(`${API_BASE_URL}/admin/capacity-development-plans.php?plan_year=${planYear}`);
    const result = await response.json();
    return {
      success: response.ok && Boolean(result.success),
      items: (result.items || []) as CapacityDevelopmentPlanItem[],
      message: result.message as string | undefined,
    };
  },

  async create(payload: CapacityDevelopmentPlanPayload) {
    const response = await fetch(`${API_BASE_URL}/admin/capacity-development-plans.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    return {
      success: response.ok && Boolean(result.success),
      message: result.message as string | undefined,
      id: result.id as number | undefined,
    };
  },

  async update(id: number, payload: Partial<CapacityDevelopmentPlanPayload>) {
    const response = await fetch(`${API_BASE_URL}/admin/capacity-development-plans.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    const result = await response.json();
    return {
      success: response.ok && Boolean(result.success),
      message: result.message as string | undefined,
    };
  },

  async remove(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/capacity-development-plans.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await response.json();
    return {
      success: response.ok && Boolean(result.success),
      message: result.message as string | undefined,
    };
  },

  async getEligibleCourses() {
    const result = await courseService.getAllCourses();
    if (!result.success) {
      return {
        success: false,
        message: result.message,
        courses: [] as Array<Course & { competencies: ReturnType<typeof parseCompetencies> }>,
      };
    }

    return {
      success: true,
      courses: (result.courses || []).map((course) => ({
        ...course,
        competencies: parseCompetencies(course.subcategory),
      })),
    };
  },
};
