import { RegistrationFormData } from "@/types/registration";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/charming_api';

export const registrationService = {
  async registerUser(data: RegistrationFormData) {
    try {
      const response = await fetch(`${API_BASE_URL}/register.php`, {
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
          message: result.message || 'Registration successful!',
          user: result,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Registration failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  },

  async loginUser(username: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        const rawUser = result.user || {};
        const normalizedId = Number(rawUser.id ?? rawUser.user_id);
        const normalizedUser = {
          ...rawUser,
          id: Number.isFinite(normalizedId) ? normalizedId : 0,
        };

        return {
          success: true,
          message: result.message || 'Login successful!',
          user: normalizedUser,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Login failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      };
    }
  },

  async logoutUser() {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  },

  async getCurrentUser() {
    return {
      success: false,
      message: 'Not implemented',
    };
  },

  async getUserProfile(userId: number) {
    return {
      success: false,
      message: 'Not implemented',
    };
  },
};
