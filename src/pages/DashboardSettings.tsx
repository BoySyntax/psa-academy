import { motion } from "framer-motion";
import { ArrowLeft, Bell, Eye, Settings, Shield } from "lucide-react";
import { useState } from "react";

interface DashboardSettingsProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const DashboardSettings = ({ onNavigate }: DashboardSettingsProps) => {
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(true);

  const settings = [
    {
      icon: Bell,
      title: "Email Notifications",
      description: "Receive updates about your account activity",
      enabled: notifications,
      onChange: setNotifications,
    },
    {
      icon: Eye,
      title: "Profile Visibility",
      description: "Control who can view your public profile",
      enabled: privacy,
      onChange: setPrivacy,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Preferences and privacy</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </motion.button>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">Settings</h2>
          <p className="text-muted-foreground">Customize your experience</p>
        </motion.div>

        {/* Settings Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Preferences Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Preferences</h3>
            <div className="space-y-3">
              {settings.map((setting, index) => (
                <motion.div
                  key={setting.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="p-4 rounded-lg border border-border bg-secondary/50 hover:bg-secondary/75 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0 mt-1">
                        <setting.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{setting.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setting.onChange(!setting.enabled)}
                      className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors flex-shrink-0 ${
                        setting.enabled ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <motion.span
                        animate={{ x: setting.enabled ? 20 : 2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="inline-block h-5 w-5 transform rounded-full bg-white"
                      />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Security Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Security</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full p-4 rounded-lg border border-border bg-secondary/50 hover:bg-secondary/75 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Change Password</h4>
                  <p className="text-sm text-muted-foreground mt-1">Update your password regularly for better security</p>
                </div>
              </div>
            </motion.button>
          </motion.div>

          {/* Advanced Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Advanced</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg border border-border bg-secondary/50 hover:bg-secondary/75 transition-colors text-left"
              >
                <h4 className="font-medium text-foreground">Download Data</h4>
                <p className="text-sm text-muted-foreground mt-1">Export your personal data</p>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors text-left"
              >
                <h4 className="font-medium text-red-600">Delete Account</h4>
                <p className="text-sm text-red-600/75 mt-1">Permanently delete your account</p>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-secondary/30 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-muted-foreground">
          © 2026 PSA Academy. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default DashboardSettings;
