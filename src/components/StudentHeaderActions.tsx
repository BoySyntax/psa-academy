import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { profileService } from "@/services/profile";
import { notificationsService, StudentNotification } from "@/services/notifications";
import { getImageUrl } from "@/lib/apiHelper";

interface StudentHeaderActionsProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

const formatDateTime = (value: string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
};

const StudentHeaderActions = ({ user, onNavigate, onLogout }: StudentHeaderActionsProps) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = useMemo(() => {
    const first = user.firstName?.trim()?.[0] || "";
    const last = user.lastName?.trim()?.[0] || "";
    return (first + last).toUpperCase() || "U";
  }, [user.firstName, user.lastName]);

  const loadProfile = async () => {
    const result = await profileService.getProfile(user.id.toString());
    if (result.success && result.profile?.profile_image_url) {
      setProfileImageUrl(getImageUrl(result.profile.profile_image_url) || "");
    }
  };

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    const result = await notificationsService.fetchNotifications(user.id.toString(), false);
    if (result.success) {
      setNotifications(result.notifications);
      setUnreadCount(result.unread_count);
    }
    setLoadingNotifications(false);
  };

  useEffect(() => {
    const run = async () => {
      await loadProfile();
      await loadNotifications();
    };
    run();
  }, [user.id]);

  useEffect(() => {
    const markAllReadIfOpen = async () => {
      if (!notifOpen) return;
      if (unreadCount <= 0) return;
      await notificationsService.markRead(user.id.toString());
      await loadNotifications();
    };
    markAllReadIfOpen();
  }, [notifOpen, unreadCount, user.id]);

  const handleNotificationClick = async (n: StudentNotification) => {
    if (n.student_seen === 0) {
      await notificationsService.markRead(user.id.toString(), n.enrollment_id);
      await loadNotifications();
    }
    // Navigate to appropriate page based on notification type
    if (n.status === "idp_approved" || n.status === "idp_rejected") {
      onNavigate("idp");
    } else {
      onNavigate("my-courses");
    }
    setNotifOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={notifOpen} onOpenChange={setNotifOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            {unreadCount > 0 ? (
              <motion.span
                animate={{ rotate: [0, -20, 20, -18, 18, -12, 12, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
                className="inline-flex"
                style={{ transformOrigin: "50% 10%" }}
              >
                <Bell className="w-7 h-7" />
              </motion.span>
            ) : (
              <Bell className="w-7 h-7" />
            )}
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-96 p-0">
          <div className="p-4 border-b border-border">
            <div className="text-sm font-semibold text-foreground">Notifications</div>
            <div className="text-xs text-muted-foreground">Approvals and rejections from management</div>
          </div>

          <ScrollArea className="h-72">
            <div className="p-2">
              {loadingNotifications ? (
                <div className="p-3 text-sm text-muted-foreground">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.enrollment_id}
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left rounded-md px-3 py-2 hover:bg-accent transition-colors border border-transparent ${
                      n.student_seen === 0 ? "bg-accent/40" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {n.status === "enrolled" ? "Course Approved" : 
                           n.status === "rejected" ? "Course Rejected" :
                           n.status === "idp_approved" ? "IDP Approved" :
                           n.status === "idp_rejected" ? "IDP Rejected" :
                           "Notification"}: {n.course_name || "Individual Development Plan"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">{formatDateTime(n.approved_at)}</div>
                      </div>
                      {n.student_seen === 0 && (
                        <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="p-2 border-t border-border">
            <Button variant="ghost" className="w-full" onClick={() => loadNotifications()}>
              Refresh
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-3 rounded-full border border-border bg-background/50 px-3 py-2 hover:bg-background transition-colors"
            aria-label="My Profile"
          >
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-sm font-semibold text-foreground">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-muted-foreground">Student</div>
            </div>

            <Avatar className="h-10 w-10">
              <AvatarImage src={getImageUrl(profileImageUrl) || undefined} alt="Profile image" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onNavigate("profile")}>My Profile</DropdownMenuItem>
          {onLogout && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive"
              >
                Logout
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default StudentHeaderActions;
