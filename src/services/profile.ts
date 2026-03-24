const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";

export interface ProfileResponse {
  success: boolean;
  profile?: {
    id: string;
    username?: string;
    email?: string;
    user_type?: string;
    first_name?: string;
    middle_name?: string | null;
    last_name?: string;
    suffix?: string | null;
    date_of_birth?: string | null;
    sex?: string | null;
    blood_type?: string | null;
    civil_status?: string | null;
    type_of_disability?: string | null;
    religion?: string | null;
    educational_attainment?: string | null;
    cellphone_number?: string | null;
    house_no_and_street?: string | null;
    barangay?: string | null;
    municipality?: string | null;
    province?: string | null;
    region?: string | null;
    type_of_employment?: string | null;
    civil_service_eligibility_level?: string | null;
    salary_grade?: string | null;
    present_position?: string | null;
    office?: string | null;
    service?: string | null;
    division_province?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_relationship?: string | null;
    emergency_contact_address?: string | null;
    emergency_contact_number?: string | null;
    emergency_contact_email?: string | null;
    profile_image_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  profile_image_url?: string;
  message?: string;
}

export const profileService = {
  async getProfile(userId: string): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/profile.php?user_id=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch profile",
      };
    }
  },

  async uploadProfileImage(userId: string, file: File): Promise<ProfileResponse> {
    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("image", file);

      const response = await fetch(`${API_BASE_URL}/student/profile.php`, {
        method: "POST",
        body: formData,
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload profile image",
      };
    }
  },

  async updateProfile(userId: string, data: any): Promise<ProfileResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/profile.php`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, ...data }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update profile",
      };
    }
  },
};
