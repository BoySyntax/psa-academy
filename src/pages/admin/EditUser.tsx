import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, UserCog } from "lucide-react";
import { adminService, User } from "@/services/admin";
import { USER_TYPE_OPTIONS, UserType } from "@/constants/userTypes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditUserProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userId: string;
}

const EditUser = ({ onNavigate, userId }: EditUserProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>("student");

  const roleLabel = useMemo(() => {
    return USER_TYPE_OPTIONS.find((x) => x.value === userType)?.label ?? userType;
  }, [userType]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const res = await adminService.getUserById(userId);
      if (res.success && res.user) {
        setTargetUser(res.user);
        setUserType(res.user.user_type);
      } else {
        toast({
          title: "Error",
          description: res.message || "Failed to load user",
          variant: "destructive",
        });
      }
      setLoading(false);
    };

    run();
  }, [toast, userId]);

  const handleSave = async () => {
    if (!targetUser) return;

    setSaving(true);
    const res = await adminService.updateUser(targetUser.id, {
      user_type: userType,
    });
    setSaving(false);

    if (res.success) {
      toast({
        title: "Saved",
        description: "User role updated successfully",
      });
      onNavigate("users");
    } else {
      toast({
        title: "Error",
        description: res.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <UserCog className="w-6 h-6" />
                Edit User
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Update the user role
              </p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("users")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="rounded-lg border border-border bg-card p-6">
          {loading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : !targetUser ? (
            <div className="text-muted-foreground">User not found.</div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {targetUser.first_name} {targetUser.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {targetUser.username} · {targetUser.email}
                  </div>
                </div>
                <Badge className="capitalize">{roleLabel}</Badge>
              </div>

              <div className="max-w-sm">
                <label className="text-sm font-medium">Role</label>
                <Select value={userType} onValueChange={(v) => setUserType(v as UserType)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditUser;
