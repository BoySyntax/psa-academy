import { motion } from "framer-motion";
import { ArrowRight, User, FileText, Settings, Home } from "lucide-react";

interface DashboardHomeProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const DashboardHome = ({ user, onNavigate }: DashboardHomeProps) => {
  const quickLinks = [
    {
      icon: User,
      title: "My Profile",
      description: "View and edit your personal information",
      page: "profile",
    },
    {
      icon: FileText,
      title: "My Documents",
      description: "Access your registered documents",
      page: "documents",
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Manage your account preferences",
      page: "settings",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Home</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.firstName}! 👋
          </h2>
          <p className="text-muted-foreground">
            Here's what you can do in your dashboard
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <p className="text-sm text-muted-foreground font-medium">User ID</p>
            <p className="text-3xl font-bold text-primary mt-2">#{user.id}</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <p className="text-sm text-muted-foreground font-medium">Status</p>
            <p className="text-3xl font-bold text-primary mt-2">Active</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-secondary/50">
            <p className="text-sm text-muted-foreground font-medium">Account</p>
            <p className="text-3xl font-bold text-primary mt-2">Verified</p>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-foreground mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <motion.button
                key={link.page}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => onNavigate(link.page)}
                className="p-6 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <link.icon className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-semibold text-foreground">{link.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
              </motion.button>
            ))}
          </div>
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

export default DashboardHome;

