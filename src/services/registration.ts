import { RegistrationFormData } from "@/types/registration";

// Get API base URL from multiple sources (called fresh each time)
const getApiBaseUrl = (): string => {
  // First try localStorage (user configured)
  const stored = localStorage.getItem('psa_backend_url');
  if (stored) return stored;
  
  // Then try environment variable
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl !== 'http://localhost/charming_api') return envUrl;
  
  // Default to localhost for development
  return 'http://localhost/charming_api';
};

// Don't cache - get fresh each time
const getApiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  console.log('getApiUrl - baseUrl:', baseUrl);
  console.log('getApiUrl - path:', path);
  
  // Remove trailing slash from base and ensure path starts with /
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${cleanBase}${cleanPath}`;
  
  console.log('getApiUrl - fullUrl:', fullUrl);
  return fullUrl;
};

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
      const response = await fetch(getApiUrl('/register.php'), {
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

      console.log('Attempting login to:', getApiUrl('/login.php'));
    console.log('API_BASE_URL:', getApiUrl('/'));

    try {
      const response = await fetch(getApiUrl('/login.php'), {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ username, password }),
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', Object.fromEntries(response.headers.entries()));

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
