import { RegistrationFormData } from "@/types/registration";

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

export const registrationService = {
  async registerUser(data: RegistrationFormData) {
    try {
      const response = await fetch(`${API_BASE_URL}/register.php`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
      });

      const { data: result, rawText } = await parseJsonResponse(response);

      if (response.ok && result) {
        return {
          success: true,
          message: result.message || 'Registration successful!',
          user: result,
        };
      } else {
        return {
          success: false,
          message: result?.message || rawText || 'Registration failed',
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
    // Validate inputs
    if (!username || !password) {
      return {
        success: false,
        message: 'Username and password are required',
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ username, password }),
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const { data: result, rawText } = await parseJsonResponse(response);

      if (response.ok && result) {
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
        // More specific error messages
        let errorMessage = result?.message || rawText || 'Login failed';
        
        if (response.status === 400) {
          errorMessage = 'Invalid username or password';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later';
        } else if (response.status === 0 || !navigator.onLine) {
          errorMessage = 'Network error. Check your connection';
        }

        return {
          success: false,
          message: errorMessage,
        };
      }
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Login timeout. Please try again';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Check your connection and ngrok URL';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        message: errorMessage,
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
