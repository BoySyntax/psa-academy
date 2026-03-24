import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Home, Settings, FileText, Bell } from "lucide-react";
import authBg from "@/assets/auth-bg.jpg";

interface DashboardProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [selectedMenu, setSelectedMenu] = useState("home");

  const handleLogout = () => {
    onLogout();
  };

  const menuItems = [
    { id: "home", icon: Home, label: "Home", description: "View dashboard overview" },
    { id: "profile", icon: User, label: "Profile", description: "Edit your personal details" },
    { id: "documents", icon: FileText, label: "Documents", description: "View your records" },
    { id: "settings", icon: Settings, label: "Settings", description: "Manage preferences" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={authBg}
          alt="Abstract art"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/30" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-light leading-relaxed text-foreground/90 max-w-md"
          >
            Welcome back
            <br />
            <span className="text-primary font-semibold">
              {user.firstName} {user.lastName}
            </span>
          </motion.p>
        </div>
      </div>

      {/* Right - Dashboard Content */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                ●&nbsp; PSA Academy
              </h1>
              <p className="text-sm text-muted-foreground">Dashboard</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Bell className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>

          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Welcome,</p>
                <p className="font-semibold text-foreground text-lg">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="font-bold text-primary">#{user.id}</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="p-3 rounded-lg bg-secondary border border-border">
              <p className="text-xs text-muted-foreground font-medium">Status</p>
              <p className="text-sm font-bold text-primary mt-1">Active</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary border border-border">
              <p className="text-xs text-muted-foreground font-medium">Account</p>
              <p className="text-sm font-bold text-primary mt-1">Verified</p>
            </div>
          </motion.div>

          {/* Menu Items */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Menu
            </p>
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={() => setSelectedMenu(item.id)}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    selectedMenu === item.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className={`text-xs ${
                        selectedMenu === item.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMenu}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-lg bg-secondary border border-border min-h-[120px]"
            >
              {selectedMenu === "home" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Dashboard Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    All your information is securely stored and accessible from here. Manage your profile, view documents, and update your preferences.
                  </p>
                </div>
              )}
              {selectedMenu === "profile" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Profile Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your personal information, contact details, and employment information from your account settings.
                  </p>
                </div>
              )}
              {selectedMenu === "documents" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">My Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    View and download your registered documents and records. All documents are securely stored.
                  </p>
                </div>
              )}
              {selectedMenu === "settings" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage notification preferences, security settings, and other account options.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 py-3 px-4 font-medium text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            © 2026 PSA Academy. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
