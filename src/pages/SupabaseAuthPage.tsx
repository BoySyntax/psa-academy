import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import authBg from "@/assets/auth-bg.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authService } from "@/services/auth-service";
import { USER_TYPE_OPTIONS } from "@/constants/userTypes";

interface AuthPageProps {
  onLoginSuccess?: (user: { id: string; email: string }) => void;
}

const SupabaseAuthPage = ({ onLoginSuccess }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [hasViewedTerms, setHasViewedTerms] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const TERMS_AND_PRIVACY_TEXT = `PSA Academy Terms of Service and Privacy Policy

I. About PSA Academy

PSA Academy is a professional learning platform designed to provide high-quality training and development programs. By using our services, you agree to these terms.

II. User Responsibilities

Users must:
- Provide accurate information during registration
- Maintain the confidentiality of their account credentials
- Use the platform for legitimate educational purposes
- Respect intellectual property rights

III. Privacy and Data Protection

We are committed to protecting your privacy:
- Personal information is collected only with consent
- Data is used solely for service improvement
- We implement appropriate security measures
- Users can request data deletion

IV. Service Terms

- Access is provided on an "as is" basis
- We reserve the right to modify services
- Users must comply with applicable laws
- Prohibited activities include unauthorized access attempts

V. Limitations of Liability

PSA Academy is not liable for:
- Indirect or consequential damages
- Service interruptions
- Third-party content
- User-generated content

VI. Contact and Support

For questions about these terms, contact our support team through the platform.

Last updated: March 2026`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields",
      });
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match",
      });
      return;
    }

    if (!isLogin && !agreeToTerms) {
      setMessage({
        type: "error",
        text: "Please agree to the Terms and Privacy Policy",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const result = await authService.signIn(email, password);
        
        if (result.success && result.user) {
          setMessage({
            type: "success",
            text: result.message,
          });
          
          if (onLoginSuccess) {
            onLoginSuccess({
              id: result.user.id,
              email: result.user.email,
            });
          }
        } else {
          setMessage({
            type: "error",
            text: result.message,
          });
        }
      } else {
        // Register
        const result = await authService.signUp(email, password, {
          username,
          role: userType,
        });
        
        if (result.success) {
          setMessage({
            type: "success",
            text: result.message,
          });
          
          // Switch to login mode after successful registration
          setTimeout(() => {
            setIsLogin(true);
            setUsername("");
            setUserType("");
            setAgreeToTerms(false);
          }, 2000);
        } else {
          setMessage({
            type: "error",
            text: result.message,
          });
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left Panel - Image */}
          <div className="relative hidden md:block">
            <img
              src={authBg}
              alt="PSA Academy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <h1 className="text-4xl font-bold mb-4">Welcome to PSA Academy</h1>
                <p className="text-lg opacity-90">
                  Your gateway to professional excellence and continuous learning
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="p-8 lg:p-12">
            <div className="max-w-sm mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-gray-600">
                  {isLogin
                    ? "Sign in to continue your learning journey"
                    : "Join our community of learners"}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-lg mb-6 ${
                      message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Username Field (Registration Only) */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Choose a username"
                    />
                  </div>
                )}

                {/* User Type (Registration Only) */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      I am a
                    </label>
                    <select
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select user type</option>
                      {USER_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Registration Only) */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                )}

                {/* Terms and Conditions (Registration Only) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setShowTerms(true);
                            setHasViewedTerms(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          Terms and Privacy Policy
                        </button>
                      </label>
                    </div>
                    {hasViewedTerms && !agreeToTerms && (
                      <p className="text-xs text-red-600">
                        Please agree to the terms to continue
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle Login/Register */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setMessage(null);
                      setPassword("");
                      setConfirmPassword("");
                      setAgreeToTerms(false);
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms of Service and Privacy Policy</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {TERMS_AND_PRIVACY_TEXT}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupabaseAuthPage;
