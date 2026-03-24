import { useEffect, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudentHeaderActions from "@/components/StudentHeaderActions";
import SkillAuditDialog from "@/components/SkillAuditDialog";
import { careerLeverageInventoryService } from "@/services/careerLeverageInventory";
import { skillAuditService } from "@/services/skillAudit";
import { idpService } from "@/services/idp";
import { profileService } from "@/services/profile";
import { enrollmentService } from "@/services/enrollment";

interface StudentAssessmentsProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
};

const StudentAssessments = ({ user, onNavigate, onLogout }: StudentAssessmentsProps) => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const [loading, setLoading] = useState(true);

  const [cliSubmitted, setCliSubmitted] = useState(false);
  const [cliSubmittedAt, setCliSubmittedAt] = useState<string | null>(null);

  const [satnaSubmitted, setSatnaSubmitted] = useState(false);
  const [satnaSubmittedAt, setSatnaSubmittedAt] = useState<string | null>(null);
  const [satnaDialogOpen, setSatnaDialogOpen] = useState(false);
  const [satnaPreloadedData, setSatnaPreloadedData] = useState<any>(null);

  const [idpSubmitted, setIdpSubmitted] = useState(false);
  const [idpStatus, setIdpStatus] = useState<string>("");
  const [idpSubmittedAt, setIdpSubmittedAt] = useState<string | null>(null);
  const [courseProgress, setCourseProgress] = useState<number>(0);
  const [canAccessIdp, setCanAccessIdp] = useState(false);

  const getCliSubmittedAt = (cli: any) => {
    return (cli?._meta?.submitted_at as string | null | undefined) ?? null;
  };

  const getSatnaSubmittedAt = (audit: any) => {
    return (audit?._meta?.submitted_at as string | null | undefined) ?? null;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cliResult, satnaResult, idpResult, profileResult, enrollmentResult] = await Promise.all([
          careerLeverageInventoryService.getStatus(user.id, currentYear),
          skillAuditService.getStatus(user.id, currentYear),
          idpService.get(user.id),
          profileService.getProfile(user.id.toString()),
          enrollmentService.getMyEnrollments(user.id.toString()),
        ]);

        if (cliResult.success) {
          setCliSubmitted(!!cliResult.submitted);
          setCliSubmittedAt(getCliSubmittedAt(cliResult.cli));
        }

        if (satnaResult.success) {
          setSatnaSubmitted(!!satnaResult.submitted);
          setSatnaSubmittedAt(getSatnaSubmittedAt(satnaResult.audit));
        }

        setSatnaPreloadedData({
          audit: satnaResult.success ? satnaResult.audit : null,
          profile: profileResult.success ? profileResult.profile : null,
        });

        const approval = idpResult.success ? (idpResult.idp as any)?._approval : null;
        const status = (approval?.status as string | undefined) || "";
        const submittedAt = (approval?.submitted_at as string | null | undefined) ?? null;
        const alreadySubmitted = status === "pending" || status === "approved" || status === "rejected";

        setIdpStatus(status);
        setIdpSubmittedAt(submittedAt);
        setIdpSubmitted(alreadySubmitted);

        // Calculate course progress and determine IDP access
        if (enrollmentResult.success && enrollmentResult.enrollments.length > 0) {
          const highestProgress = Math.max(...enrollmentResult.enrollments.map((e) => e.progress_percentage || 0));
          setCourseProgress(highestProgress);

          // Allow IDP access when student has 80% or more progress in any course
          // Or if IDP is already submitted (to allow viewing)
          const hasHighProgress = highestProgress >= 80;
          setCanAccessIdp(hasHighProgress || alreadySubmitted);
        } else {
          setCourseProgress(0);
          setCanAccessIdp(alreadySubmitted);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user.id, currentYear]);

  return (
    <div className="min-h-screen bg-background">
      <SkillAuditDialog
        open={satnaDialogOpen}
        userId={user.id}
        preloadedData={satnaPreloadedData}
        readOnly={satnaSubmitted}
        onSubmitted={() => {
          setSatnaDialogOpen(false);
          setSatnaSubmitted(true);
          setSatnaSubmittedAt(getSatnaSubmittedAt(satnaPreloadedData?.audit));
        }}
        onClose={() => setSatnaDialogOpen(false)}
      />

      <div className="bg-sidebar-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Assessments</h1>
          </div>

          <StudentHeaderActions user={user} onNavigate={onNavigate} onLogout={onLogout} />
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading assessments...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-sm font-semibold text-foreground">Career Leverage Inventory (CLI)</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Status: {cliSubmitted ? "Submitted" : "Not submitted"}
              </div>
              {cliSubmitted && (
                <div className="mt-1 text-xs text-muted-foreground">Submitted: {formatDateTime(cliSubmittedAt)}</div>
              )}
              <div className="mt-4">
                <Button className="w-full" variant={cliSubmitted ? "outline" : "default"} onClick={() => onNavigate("career-leverage-inventory")}>
                  {cliSubmitted ? "View" : "Fill Up"}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-sm font-semibold text-foreground">SATNA</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Status: {satnaSubmitted ? "Submitted" : "Not submitted"}
              </div>
              {satnaSubmitted && (
                <div className="mt-1 text-xs text-muted-foreground">Submitted: {formatDateTime(satnaSubmittedAt)}</div>
              )}
              <div className="mt-4">
                <Button className="w-full" variant={satnaSubmitted ? "outline" : "default"} onClick={() => setSatnaDialogOpen(true)}>
                  {satnaSubmitted ? "View" : "Fill Up"}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-sm font-semibold text-foreground">Individual Development Plan (IDP)</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Status: {idpSubmitted ? (idpStatus ? `Submitted (${idpStatus})` : "Submitted") : "Not submitted"}
              </div>
              {idpSubmitted && (
                <div className="mt-1 text-xs text-muted-foreground">Submitted: {formatDateTime(idpSubmittedAt)}</div>
              )}
              {!canAccessIdp && !idpSubmitted && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                  <div className="text-xs text-amber-800">
                    <div className="font-semibold">Course Progress Required</div>
                    <div className="mt-1">Complete 80% of any course to access IDP</div>
                    <div className="mt-1">Current Progress: {courseProgress}%</div>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <Button 
                  className="w-full" 
                  variant={idpSubmitted ? "outline" : "default"} 
                  onClick={() => onNavigate("idp")}
                  disabled={!canAccessIdp && !idpSubmitted}
                >
                  {idpSubmitted ? "View" : canAccessIdp ? "Fill Up" : "Locked"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssessments;
