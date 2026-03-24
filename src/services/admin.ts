import { UserType } from "@/constants/userTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/charming_api';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

const parseJsonResponse = async (response: Response) => {
  const rawText = await response.text();

  try {
    return {
      data: rawText ? JSON.parse(rawText) : null,
      rawText,
    };
  } catch {
    return {
      data: null,
      rawText,
    };
  }
};

export interface User {
  id: string;
  username: string;
  email: string;
  user_type: UserType;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth: string;
  sex: string;
  blood_type?: string;
  civil_status: string;
  type_of_disability?: string;
  religion?: string;
  educational_attainment: string;
  house_no_and_street: string;
  barangay: string;
  municipality: string;
  province: string;
  region: string;
  cellphone_number: string;
  profile_image_url?: string;
  type_of_employment?: string;
  civil_service_eligibility_level?: string;
  salary_grade?: string;
  present_position?: string;
  office?: string;
  service?: string;
  division_province?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_address?: string;
  emergency_contact_number?: string;
  emergency_contact_email?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  user_type: UserType;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth: string;
  sex: string;
  blood_type?: string;
  civil_status: string;
  type_of_disability?: string;
  religion?: string;
  educational_attainment: string;
  house_no_and_street: string;
  barangay: string;
  municipality: string;
  province: string;
  region: string;
  cellphone_number: string;
  type_of_employment?: string;
  civil_service_eligibility_level?: string;
  salary_grade?: string;
  present_position?: string;
  office?: string;
  service?: string;
  division_province?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_address?: string;
  emergency_contact_number?: string;
  emergency_contact_email?: string;
}

export interface AdminStudentSummary {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  cellphone_number?: string;
  profile_image_url?: string;
}

export interface AdminCliSubmission {
  user_id: number;
  year: number;
  submitted_at?: string;
  updated_at?: string;
  student: AdminStudentSummary;
  cli: any;
}

export interface AdminSatnaSubmission {
  user_id: number;
  year: number;
  submitted_at?: string;
  updated_at?: string;
  student: AdminStudentSummary;
  audit: any;
}

export interface AdminIdpSubmission {
  user_id: number;
  status: "pending" | "approved" | "rejected";
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  management_message?: string;
  student: AdminStudentSummary;
  approver?: {
    first_name: string;
    last_name: string;
  } | null;
  idp: any;
}

export const adminService = {
  async getAllUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users.php`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
      });

      const { data: result, rawText } = await parseJsonResponse(response);

      if (response.ok && result) {
        return {
          success: true,
          users: result.users || [],
        };
      } else {
        return {
          success: false,
          message: result?.message || rawText || 'Failed to fetch users',
          users: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch users',
        users: [],
      };
    }
  },

  async getUserById(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users.php?id=${userId}`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
      });

      const { data: result, rawText } = await parseJsonResponse(response);

      if (response.ok && result) {
        return {
          success: true,
          user: result.user,
        };
      } else {
        return {
          success: false,
          message: result?.message || rawText || 'Failed to fetch user',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user',
      };
    }
  },

  async createUser(data: CreateUserData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users.php`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
      });

      const { data: result, rawText } = await parseJsonResponse(response);

      if (response.ok) {
        return {
          success: true,
          message: result?.message || 'User created successfully',
          user: result?.user,
        };
      } else {
        return {
          success: false,
          message: result?.message || rawText || 'Failed to create user',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create user',
      };
    }
  },

  async updateUser(userId: string, data: Partial<CreateUserData>) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users.php`, {
        method: 'PUT',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ id: userId, ...data }),
      });

      const { data: result, rawText } = await parseJsonResponse(response);

      if (response.ok && result) {
        return {
          success: true,
          message: result.message || 'User updated successfully',
          user: result.user,
        };
      } else {
        return {
          success: false,
          message: result?.message || rawText || 'Failed to update user',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user',
      };
    }
  },

  async deleteUser(userId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users.php`, {
        method: 'DELETE',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ id: userId }),
      });

      const { data: result, rawText } = await parseJsonResponse(response);

      if (response.ok && result) {
        return {
          success: true,
          message: result.message || 'User deleted successfully',
        };
      } else {
        return {
          success: false,
          message: result?.message || rawText || 'Failed to delete user',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete user',
      };
    }
  },

  async getUsersByType(userType: UserType) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users.php?user_type=${userType}`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
      });

      const { data: result, rawText } = await parseJsonResponse(response);

      if (response.ok && result) {
        return {
          success: true,
          users: result.users || [],
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch users',
          users: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch users',
        users: [],
      };
    }
  },

  async fetchCareerLeverageInventory(year: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/career-leverage-inventory.php?year=${year}`, {
        headers: DEFAULT_HEADERS,
      });
      const { data, rawText } = await parseJsonResponse(response);
      return (data || {
        success: false,
        submissions: [],
        count: 0,
        message: rawText || 'Failed to fetch CLI results',
      }) as { success: boolean; submissions: AdminCliSubmission[]; count: number; message?: string };
    } catch (error) {
      return {
        success: false,
        submissions: [],
        count: 0,
        message: error instanceof Error ? error.message : 'Failed to fetch CLI results',
      };
    }
  },

  async fetchSkillAudits(year: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/skill-audits.php?year=${year}`, {
        headers: DEFAULT_HEADERS,
      });
      const { data, rawText } = await parseJsonResponse(response);
      return (data || {
        success: false,
        audits: [],
        count: 0,
        message: rawText || 'Failed to fetch SATNA submissions',
      }) as { success: boolean; audits: AdminSatnaSubmission[]; count: number; message?: string };
    } catch (error) {
      return {
        success: false,
        audits: [],
        count: 0,
        message: error instanceof Error ? error.message : 'Failed to fetch SATNA submissions',
      };
    }
  },

  async fetchIdps(status: string = 'all') {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/idps.php?status=${status}`, {
        headers: DEFAULT_HEADERS,
      });
      const { data, rawText } = await parseJsonResponse(response);
      return (data || {
        success: false,
        idps: [],
        count: 0,
        message: rawText || 'Failed to fetch IDPs',
      }) as { success: boolean; idps: AdminIdpSubmission[]; count: number; message?: string };
    } catch (error) {
      return {
        success: false,
        idps: [],
        count: 0,
        message: error instanceof Error ? error.message : 'Failed to fetch IDPs',
      };
    }
  },
};
