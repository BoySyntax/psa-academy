import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, User, Mail, Phone, MapPin, Edit2, Camera, Briefcase, HeartHandshake, GraduationCap, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { profileService } from "@/services/profile";
import { getImageUrl } from "@/lib/apiHelper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DashboardProfileProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const DashboardProfile = ({ user, onNavigate, onLogout }: DashboardProfileProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initials = useMemo(() => {
    const first = (profile?.first_name ?? user.firstName)?.trim()?.[0] || "";
    const last = (profile?.last_name ?? user.lastName)?.trim()?.[0] || "";
    return (first + last).toUpperCase() || "U";
  }, [profile?.first_name, profile?.last_name, user.firstName, user.lastName]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await profileService.getProfile(user.id.toString());
      if (result.success && result.profile) {
        setProfile(result.profile);
        setProfileImageUrl(getImageUrl(result.profile.profile_image_url) || "");
      }
      setLoading(false);
    };
    load();
  }, [user.id]);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPG, PNG, GIF, or WEBP image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const result = await profileService.uploadProfileImage(user.id.toString(), file);
      if (result.success && result.profile_image_url) {
        setProfileImageUrl(getImageUrl(result.profile_image_url) || "");
        toast({
          title: "Success",
          description: "Profile picture updated.",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: result.message || "Failed to upload profile image.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Upload Error",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const profileSections = [
    {
      label: "Personal Information",
      items: [
        {
          icon: User,
          label: "Name",
          value: `${profile?.first_name || user.firstName} ${profile?.last_name || user.lastName}`,
        },
        { icon: User, label: "ID", value: `#${user.id}` },
        { icon: Calendar, label: "Date of Birth", value: profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : "—" },
        { icon: User, label: "Sex", value: profile?.sex || "—" },
        { icon: User, label: "Civil Status", value: profile?.civil_status || "—" },
        { icon: GraduationCap, label: "Educational Attainment", value: profile?.educational_attainment || "—" },
        { icon: User, label: "Blood Type", value: profile?.blood_type || "—" },
        { icon: User, label: "Type of Disability", value: profile?.type_of_disability || "—" },
        { icon: User, label: "Religion", value: profile?.religion || "—" },
      ],
    },
    {
      label: "Contact Details",
      items: [
        { icon: Mail, label: "Email", value: profile?.email || "—" },
        { icon: Phone, label: "Phone", value: profile?.cellphone_number || "—" },
        {
          icon: MapPin,
          label: "Address",
          value:
            profile?.house_no_and_street && profile?.municipality
              ? `${profile.house_no_and_street}, ${profile.barangay || ""} ${profile.municipality}, ${profile.province || ""} ${profile.region || ""}`.trim()
              : "—",
        },
      ],
    },
    {
      label: "Employment Details",
      items: [
        { icon: Briefcase, label: "Type of Employment", value: profile?.type_of_employment || "—" },
        { icon: Briefcase, label: "Civil Service Eligibility", value: profile?.civil_service_eligibility_level || "—" },
        { icon: Briefcase, label: "Salary Grade", value: profile?.salary_grade || "—" },
        { icon: Briefcase, label: "Present Position", value: profile?.present_position || "—" },
        { icon: Briefcase, label: "Office", value: profile?.office || "—" },
        { icon: Briefcase, label: "Service", value: profile?.service || "—" },
        { icon: Briefcase, label: "Division/Province", value: profile?.division_province || "—" },
      ],
    },
    {
      label: "Emergency Contact",
      items: [
        { icon: HeartHandshake, label: "Name", value: profile?.emergency_contact_name || "—" },
        { icon: HeartHandshake, label: "Relationship", value: profile?.emergency_contact_relationship || "—" },
        { icon: MapPin, label: "Address", value: profile?.emergency_contact_address || "—" },
        { icon: Phone, label: "Contact Number", value: profile?.emergency_contact_number || "—" },
        { icon: Mail, label: "Contact Email", value: profile?.emergency_contact_email || "—" },
      ],
    },
  ];

  const [openSections, setOpenSections] = useState<string[]>([profileSections[0]?.label].filter(Boolean) as string[]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back Button - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">My Profile</h2>
          <p className="text-muted-foreground">View and manage your account information</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-10 p-6 rounded-lg border border-border bg-secondary/30"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <Avatar className="h-40 w-40">
              <AvatarImage src={getImageUrl(profileImageUrl) || undefined} alt="Profile image" />
              <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="text-xl font-semibold text-foreground">
                {profile?.first_name || user.firstName} {profile?.last_name || user.lastName}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {profile?.user_type ? String(profile.user_type).charAt(0).toUpperCase() + String(profile.user_type).slice(1) : "—"}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button type="button" onClick={handlePickImage} disabled={uploading}>
                  <Camera className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Change Photo"}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">JPG, PNG, GIF, WEBP (max 5MB)</div>
            </div>
          </div>
        </motion.div>

        {/* Profile Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {loading && (
            <div className="p-4 rounded-lg border border-border bg-secondary/50 text-sm text-muted-foreground">
              Loading profile...
            </div>
          )}

          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={(v) => setOpenSections(v as string[])}
            className="w-full space-y-3"
          >
            {profileSections.map((section, sectionIndex) => (
              <AccordionItem
                key={section.label}
                value={section.label}
                className="border border-border rounded-lg bg-secondary/30"
              >
                <AccordionTrigger className="px-4 py-3 text-lg font-semibold hover:no-underline">
                  {section.label}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + sectionIndex * 0.03 + itemIndex * 0.02 }}
                        className="p-3 rounded-lg border border-border bg-secondary/50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <item.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                            <p className="font-medium text-foreground mt-1 break-words">{item.value}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Edit Button */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
            onClick={() => onNavigate("edit-profile")}
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-secondary/30 mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-muted-foreground">
          © 2026 PSA Academy. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default DashboardProfile;

