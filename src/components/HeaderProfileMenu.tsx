import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { profileService } from "@/services/profile";

interface HeaderProfileMenuProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  roleLabel: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

const HeaderProfileMenu = ({ user, roleLabel, onNavigate, onLogout }: HeaderProfileMenuProps) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

  const initials = useMemo(() => {
    const first = user.firstName?.trim()?.[0] || "";
    const last = user.lastName?.trim()?.[0] || "";
    return (first + last).toUpperCase() || "U";
  }, [user.firstName, user.lastName]);

  useEffect(() => {
    const run = async () => {
      const result = await profileService.getProfile(user.id.toString());
      if (result.success && result.profile?.profile_image_url) {
        setProfileImageUrl(result.profile.profile_image_url);
      }
    };
    run();
  }, [user.id]);

  return (
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
            <div className="text-xs text-muted-foreground">{roleLabel}</div>
          </div>

          <Avatar className="h-10 w-10">
            <AvatarImage src={profileImageUrl || undefined} alt="Profile image" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onNavigate("profile")}>My Profile</DropdownMenuItem>
        {onLogout && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
              Logout
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderProfileMenu;
