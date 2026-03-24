import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { idpService } from "@/services/idp";
import { profileService } from "@/services/profile";
import { notificationsService } from "@/services/notifications";
import { enrollmentService } from "@/services/enrollment";

type YesNo = "YES" | "NO";

const AREA_FOR_DEVELOPMENT_OPTIONS = [
  "Exemplifying Integrity",
  "Results Orientation",
  "Quality Service Orientation",
  "Teamwork and Developing Partnerships",
  "Policy Interpretation and Implementation",
  "Planning Organizing and Delivery",
  "Strategic and Creative Thinking",
  "Application of Technical Knowledge",
  "Programming and Systems Analysis",
  "Transaction Processing",
  "Accounts Reconciliation",
  "Maintaining Effective Audit Services",
  "Preparation and Interpretation of Financial Statements",
  "Generating Reports and Documentation",
  "Application of Technical Knowledge and Skills",
  "Presentation Skills",
  "Communication Skills",
  "Facilitation Skills",
  "Data Management",
  "Computer Skills",
  "Programming and System Analysis",
];

const POSITION_OPTIONS = [
  "Regional Director",
  "Registration Officer III",
  "Administrative Assistant I",
  "Administrative Aide III",
  "Chief Statistical Specialist",
  "Supervising Statistical Specialist",
  "Senior Statistical Specialist",
  "Statistical Specialist II",
  "Information Systems Analyst II",
  "Statistical Specialist I",
  "Statistical Analyst",
  "Information Officer I",
  "Information Systems Analyst I",
  "Assistant Statistician",
  "Chief Administrative Officer",
  "Registration Officer IV",
  "Accountant III",
  "Statistical Specialist II (Outlet Supervisor)",
  "Administrative Officer IV (Budget Officer)",
  "Administrative Officer IV (HRMO)",
  "Administrative Officer III (Cashier/Disbursing Officer)",
  "Administrative Officer III (Records Officer)",
  "Registration Officer II",
  "Accountant I",
  "Administrative Officer I",
  "Registration Officer I",
  "Administrative Assistant III",
  "Administrative Assistant II",
  "Administrative Aide VI",
  "Contract of Service Worker",
  "Job Order Worker",
];

const FUNCTIONAL_TYPE_OPTIONS = [
  "Administrative",
  "Registration",
  "Statistical",
  "Planning",
];

const READY_IN_OPTIONS = [
  "One (1) year from now",
  "Two (2) years from now",
  "Above Two (2) years from now",
];

const OPERATING_UNIT_OPTIONS = [
  "Office",
  "Service",
  "Unit",
  "Division",
];

const OFFICE_OPTIONS = [
  "Office of the Administrator",
  "Office of the Deputy Administrator",
  "Office of the Assistant Administrator",
  "Corporate Affairs Office",
  "Finance and Administrative Division",
  "Human Resource Management Division",
  "Information Technology Division",
  "Internal Audit Service",
  "Library and Archives Division",
  "Planning and Research Division",
  "Production Division",
  "Statistical Operations and Coordination Division",
  "Field Services Division",
  "Civil Registration Services",
  "Statistical Services",
];

const SERVICE_OPTIONS = [
  "Civil Registration Service",
  "Statistical Service",
  "Administrative Service",
  "Financial Service",
  "Information Technology Service",
  "Planning Service",
  "Human Resource Service",
  "Internal Audit Service",
  "Library and Archives Service",
  "Field Service",
  "Production Service",
];

const UNIT_OPTIONS = [
  "Civil Registry Unit",
  "Survey Unit",
  "Data Processing Unit",
  "Data Collection Unit",
  "Data Analysis Unit",
  "Dissemination Unit",
  "Geographic Information System Unit",
  "Information Technology Unit",
  "Administrative Support Unit",
  "Finance Unit",
  "Human Resource Unit",
  "Planning Unit",
  "Internal Audit Unit",
  "Library Unit",
  "Records Unit",
];

const DIVISION_OPTIONS = [
  "Finance and Administrative Division",
  "Human Resource Management Division",
  "Information Technology Division",
  "Internal Audit Service",
  "Library and Archives Division",
  "Planning and Research Division",
  "Production Division",
  "Statistical Operations and Coordination Division",
  "Field Services Division",
  "Civil Registration Services Division",
  "Statistical Services Division",
];

interface DashboardIDPProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const DashboardIDP = ({ user, onNavigate }: DashboardIDPProps) => {
  const { toast } = useToast();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const userId = useMemo(() => {
    const n = Number((user as any)?.id);
    return Number.isFinite(n) ? n : 0;
  }, [user]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canAccessIdp, setCanAccessIdp] = useState(false);
  const [accessChecking, setAccessChecking] = useState(true);
  const [form, setForm] = useState<any>({
    employee_info: {
      surname: "",
      first_name: "",
      middle_name: "",
      section: "",
      current_position: "",
      unit_service: "",
      salary_grade: "",
      office: "",
      years_current_position: "",
      years_in_psa: "",
      employment_status: "",
    },
    purpose: {
      meet_current_position: false,
      meet_next_higher_position: false,
      increase_current_position: false,
      acquire_new_competencies: false,
    },
    career_development_required: "" as YesNo | "",
    employee_goals_2026_2030: "",
    long_term_training: [{ area: "", activity: "", target_completion_date: "", responsible: "", status: "" }],
    long_term_career_goal: {
      long_term_position: "",
      operating_unit: "",
      office: "",
      service: "",
      unit: "",
      division: "",
      functional_type: "",
      ready_in: "",
    },
    experience_during_this_year: "",
    short_term_goal: {
      next_step_position: "",
      office: "",
      service: "",
      unit: "",
      division: "",
      functional_type: "",
      ready_in: "",
    },
    short_term_training_next_year: [{ area: "", priority_for_idp: "", activity: "", target_completion_date: "", responsible: "", status: "" }],
    experience_during_past_year: "",
    certification: {
      employee_signature: "",
      employee_signature_date: today,
      supervisor_signature: "",
      supervisor_signature_date: "",
    },
  });

  const approvalStatus = (form?._approval?.status as string | undefined) || "";
  const isLocked = approvalStatus === "pending" || approvalStatus === "approved" || approvalStatus === "rejected";

  const approval = (form?._approval as any) || {};
  const approvalSubmittedAt = approval?.submitted_at ? new Date(approval.submitted_at) : null;
  const approvalApprovedAt = approval?.approved_at ? new Date(approval.approved_at) : null;
  const approvalStatusValue = (approval?.status as string | undefined) || "";

  const update = (path: string, value: any) => {
    setForm((prev: any) => {
      const next = { ...prev };
      const parts = path.split(".");
      let cur: any = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        cur[key] = Array.isArray(cur[key]) ? [...cur[key]] : { ...(cur[key] || {}) };
        cur = cur[key];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const updateLongTermRow = (idx: number, key: string, value: string) => {
    setForm((prev: any) => {
      const rows = [...(prev.long_term_training || [])];
      rows[idx] = { ...(rows[idx] || {}), [key]: value };
      return { ...prev, long_term_training: rows };
    });
  };

  const addLongTermRow = () => {
    setForm((prev: any) => ({
      ...prev,
      long_term_training: [...(prev.long_term_training || []), { area: "", activity: "", target_completion_date: "", responsible: "", status: "" }],
    }));
  };

  const updateShortTermRow = (idx: number, key: string, value: string) => {
    setForm((prev: any) => {
      const rows = [...(prev.short_term_training_next_year || [])];
      rows[idx] = { ...(rows[idx] || {}), [key]: value };
      return { ...prev, short_term_training_next_year: rows };
    });
  };

  const addShortTermRow = () => {
    setForm((prev: any) => ({
      ...prev,
      short_term_training_next_year: [
        ...(prev.short_term_training_next_year || []),
        { area: "", priority_for_idp: "", activity: "", target_completion_date: "", responsible: "", status: "" },
      ],
    }));
  };

  useEffect(() => {
    const load = async () => {
      if (!userId || userId <= 0) {
        toast({
          title: "Error",
          description: `Missing user_id (received: ${String((user as any)?.id)})`,
          variant: "destructive",
        });
        return;
      }
      setLoading(true);

      try {
        const [idpResult, profileResult, enrollmentResult] = await Promise.all([
          idpService.get(userId),
          profileService.getProfile(userId.toString()),
          enrollmentService.getMyEnrollments(userId.toString()),
        ]);

        if (idpResult.success && idpResult.idp) {
          setForm((prev: any) => ({ ...prev, ...idpResult.idp }));
          
          // Mark IDP notifications as read when IDP page is opened
          const approvalStatus = idpResult.idp?._approval?.status;
          if (approvalStatus === "approved" || approvalStatus === "rejected") {
            try {
              await notificationsService.markRead(userId.toString());
              console.log('IDP notifications marked as read');
            } catch (error) {
              console.error('Failed to mark IDP notifications as read:', error);
            }
          }
        }

        if (profileResult.success && profileResult.profile) {
          const p = profileResult.profile;
          setForm((prev: any) => ({
            ...prev,
            employee_info: {
              ...prev.employee_info,
              surname: (p.last_name ?? prev.employee_info?.surname ?? "") || "",
              first_name: (p.first_name ?? prev.employee_info?.first_name ?? "") || "",
              middle_name: (p.middle_name ?? prev.employee_info?.middle_name ?? "") || "",
              current_position: (p.present_position ?? prev.employee_info?.current_position ?? "") || "",
              unit_service: (p.service ?? prev.employee_info?.unit_service ?? "") || "",
              office: (p.office ?? prev.employee_info?.office ?? "") || "",
              salary_grade: (p.salary_grade ?? prev.employee_info?.salary_grade ?? "") || "",
            },
          }));
        }

        // Check IDP access based on course progress
        const approval = (idpResult.idp as any)?._approval;
        const alreadySubmitted = approval && (approval.status === "pending" || approval.status === "approved" || approval.status === "rejected");
        
        if (enrollmentResult.success && enrollmentResult.enrollments.length > 0) {
          const highestProgress = Math.max(...enrollmentResult.enrollments.map(e => e.progress_percentage || 0));
          const hasHighProgress = highestProgress >= 80;
          setCanAccessIdp(hasHighProgress || alreadySubmitted);
          console.log('IDP Page - Highest progress:', highestProgress, 'Has high progress:', hasHighProgress, 'Already submitted:', alreadySubmitted);
        } else {
          setCanAccessIdp(alreadySubmitted);
          console.log('IDP Page - No enrollments, alreadySubmitted:', alreadySubmitted);
        }
        setAccessChecking(false);
      } catch (e) {
        toast({
          title: "Error",
          description: e instanceof Error ? e.message : "Failed to load IDP",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  useEffect(() => {
    if (!userId || userId <= 0) return;
    if (approvalStatusValue !== "pending") return;

    const interval = setInterval(async () => {
      const idpResult = await idpService.get(userId);
      if (idpResult.success && idpResult.idp) {
        setForm((prev: any) => {
          const prevStatus = prev?._approval?.status;
          const next = { ...prev, ...idpResult.idp };
          const nextStatus = next?._approval?.status;

          if (prevStatus === "pending" && nextStatus === "approved") {
            toast({
              title: "IDP Approved",
              description: "Your IDP has been approved by Management.",
            });
          }

          if (prevStatus === "pending" && nextStatus === "rejected") {
            toast({
              title: "IDP Rejected",
              description: next?._approval?.rejection_reason || "Your IDP has been rejected by Management.",
              variant: "destructive",
            });
          }

          return next;
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, approvalStatusValue]);

  const handleSave = async () => {
    if (!userId || userId <= 0) {
      toast({
        title: "Error",
        description: `Missing user_id (received: ${String((user as any)?.id)})`,
        variant: "destructive",
      });
      return;
    }

    // Double-check access before saving
    if (!canAccessIdp) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to submit IDP at this time.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    console.log('Submitting IDP with data:', { ...form, user_id: userId }); // Debug log
    const result = await idpService.save({ ...form, user_id: userId });
    console.log('IDP save result:', result); // Debug log

    if (!result.success) {
      setSaving(false);
      toast({
        title: "Error",
        description: result.message || "Failed to save IDP",
        variant: "destructive",
      });
      return;
    }

    // Verify backend actually persisted the submission so Management can see it.
    console.log('Verifying IDP submission...'); // Debug log
    const verify = await idpService.get(userId);
    console.log('IDP verification result:', verify); // Debug log
    setSaving(false);

    const approval = verify.success ? (verify.idp as any)?._approval : null;
    const status = (approval?.status as string | undefined) || "";
    const isSubmitted = status === "pending" || status === "approved" || status === "rejected";

    console.log('Approval status:', status, 'Is submitted:', isSubmitted); // Debug log

    if (!verify.success || !isSubmitted) {
      toast({
        title: "Submission not saved",
        description:
          verify.success
            ? "Your IDP was not stored as a submitted record (pending). Please try again or contact admin."
            : verify.message || "Failed to verify IDP submission.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Submitted",
      description: "Your IDP has been submitted for approval.",
    });
    onNavigate("student-assessments");
  };

  if (loading || accessChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading IDP...</div>
      </div>
    );
  }

  if (!canAccessIdp) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">IDP Access Restricted</h1>
                <p className="text-sm text-muted-foreground mt-1">Individual Development Plan</p>
              </div>
              <Button variant="outline" onClick={() => onNavigate("student-assessments")}>
                Back to Assessments
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-amber-800 mb-4">Course Progress Required</h2>
              <p className="text-amber-700 mb-6">
                You need to complete at least 80% of any course before you can fill out your Individual Development Plan (IDP).
              </p>
              <div className="bg-white rounded-lg p-4 border border-amber-300">
                <p className="text-sm text-amber-800">
                  Please continue with your courses and return here when you're closer to completion.
                </p>
              </div>
              <Button 
                className="mt-6" 
                onClick={() => onNavigate("my-courses")}
              >
                Go to My Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">IDP Form</h1>
              <p className="text-sm text-muted-foreground mt-1">Individual Development Plan</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("student-assessments")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="border border-border bg-background">
          <fieldset disabled={isLocked} className={isLocked ? "opacity-80" : undefined}>
            <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">I. EMPLOYEE INFORMATION</div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-b border-border md:border-r border-border">
              <div className="grid grid-cols-[44px_1fr]">
                <div className="border-r border-border p-2 text-xs font-semibold">1.</div>
                <div className="p-2">
                  <div className="text-xs font-semibold mb-2">NAME</div>
                  <div className="grid grid-cols-[110px_1fr] gap-2">
                    <div className="text-xs font-medium self-center">SURNAME</div>
                    <Input value={form.employee_info?.surname || ""} onChange={(e) => update("employee_info.surname", e.target.value)} />

                    <div className="text-xs font-medium self-center">FIRST NAME</div>
                    <Input value={form.employee_info?.first_name || ""} onChange={(e) => update("employee_info.first_name", e.target.value)} />

                    <div className="text-xs font-medium self-center">MIDDLE NAME</div>
                    <Input value={form.employee_info?.middle_name || ""} onChange={(e) => update("employee_info.middle_name", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-border">
              <div className="grid grid-cols-[44px_1fr] h-full">
                <div className="border-r border-border p-2 text-xs font-semibold">6.</div>
                <div className="p-2">
                  <div className="text-xs font-medium mb-1">Section:</div>
                  <Input value={form.employee_info?.section || ""} onChange={(e) => update("employee_info.section", e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-b border-border md:border-r border-border">
              <div className="grid grid-cols-[44px_1fr]">
                <div className="border-r border-border p-2 text-xs font-semibold">2.</div>
                <div className="p-2">
                  <div className="text-xs font-medium mb-1">CURRENT POSITION:</div>
                  <Input value={form.employee_info?.current_position || ""} onChange={(e) => update("employee_info.current_position", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="border-b border-border">
              <div className="grid grid-cols-[44px_1fr] h-full">
                <div className="border-r border-border p-2 text-xs font-semibold">7.</div>
                <div className="p-2">
                  <div className="text-xs font-medium mb-1">Unit / Service:</div>
                  <Input value={form.employee_info?.unit_service || ""} onChange={(e) => update("employee_info.unit_service", e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-b border-border md:border-r border-border">
              <div className="grid grid-cols-[44px_1fr]">
                <div className="border-r border-border p-2 text-xs font-semibold">3.</div>
                <div className="p-2">
                  <div className="text-xs font-medium mb-1">SALARY GRADE:</div>
                  <Input value={form.employee_info?.salary_grade || ""} onChange={(e) => update("employee_info.salary_grade", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="border-b border-border">
              <div className="grid grid-cols-[44px_1fr] h-full">
                <div className="border-r border-border p-2 text-xs font-semibold">8.</div>
                <div className="p-2">
                  <div className="text-xs font-medium mb-1">Office:</div>
                  <Input value={form.employee_info?.office || ""} onChange={(e) => update("employee_info.office", e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-b border-border md:border-r border-border">
              <div className="grid grid-cols-[44px_1fr]">
                <div className="border-r border-border p-2 text-xs font-semibold">4.</div>
                <div className="p-2">
                  <div className="text-xs font-medium mb-1">Number of Years in the Current Position:</div>
                  <Input value={form.employee_info?.years_current_position || ""} onChange={(e) => update("employee_info.years_current_position", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="border-b border-border">
              <div className="grid grid-cols-[44px_1fr] h-full">
                <div className="border-r border-border p-2 text-xs font-semibold">9.</div>
                <div className="p-2">
                  <div className="text-xs font-medium mb-2">Employment Status:</div>
                  <Select value={form.employee_info?.employment_status || ""} onValueChange={(v) => update("employee_info.employment_status", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGULAR">REGULAR</SelectItem>
                      <SelectItem value="COTERMINOUS">COTERMINOUS</SelectItem>
                      <SelectItem value="CONTRACTUAL">CONTRACTUAL</SelectItem>
                      <SelectItem value="CONTRACT OF SERVICE WORKER (COSW)">CONTRACT OF SERVICE WORKER (COSW)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-b border-border md:border-r border-border">
              <div className="grid grid-cols-[44px_1fr]">
                <div className="border-r border-border p-2 text-xs font-semibold">5.</div>
                <div className="p-2">
                  <div className="text-xs font-medium mb-1">Number of Years in PSA (Include previous years in merged agency, if any):</div>
                  <Input value={form.employee_info?.years_in_psa || ""} onChange={(e) => update("employee_info.years_in_psa", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="border-b border-border">
              <div className="grid grid-cols-[44px_1fr] h-full">
                <div className="border-r border-border p-2 text-xs font-semibold"> </div>
                <div className="p-2 text-xs text-muted-foreground"> </div>
              </div>
            </div>
          </div>

          <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">II. PURPOSE</div>
          <div className="p-3">
            <div className="space-y-2">
              {[
                { key: "meet_current_position", label: "meet the competencies of current position." },
                { key: "meet_next_higher_position", label: "meet the competencies of the next higher position." },
                { key: "increase_current_position", label: "increase level of competency of current position." },
                { key: "acquire_new_competencies", label: "acquire new competencies across different functions/position." },
              ].map((item) => (
                <label key={item.key} className="flex items-start gap-2 text-xs">
                  <input
                    className="mt-[2px]"
                    type="checkbox"
                    checked={!!form.purpose?.[item.key]}
                    onChange={(e) => update(`purpose.${item.key}`, e.target.checked)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">III. CAREER DEVELOPMENT</div>
          <div className="border-b border-border">
            <div className="grid grid-cols-[1fr_180px]">
              <div className="p-3 text-xs">
                <span className="font-medium">Further development is desired or required for</span>
              </div>
              <div className="border-l border-border p-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="radio" name="career_development_required" checked={form.career_development_required === "YES"} onChange={() => update("career_development_required", "YES")} />
                    YES
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input type="radio" name="career_development_required" checked={form.career_development_required === "NO"} onChange={() => update("career_development_required", "NO")} />
                    NO
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-border">
            <div className="border-b border-border bg-secondary/20 px-3 py-2 text-xs font-semibold">EMPLOYEE GOALS (2026 to 2030)</div>
            <div className="px-3 py-2 text-[11px] text-muted-foreground italic">
              My long range goals for the next five (5) years. This is my vision for where I would like to be in the next five (5) years.
            </div>
            <div className="p-3">
              <Textarea value={form.employee_goals_2026_2030 || ""} onChange={(e) => update("employee_goals_2026_2030", e.target.value)} />
            </div>
          </div>

          <div className="border-b border-border">
            <div className="border-b border-border bg-secondary/20 px-3 py-2 text-xs font-semibold">Education/Training/Development for Long Term Goals (Next five years)</div>
            <div className="px-3 py-2 text-[11px] text-muted-foreground italic">Include plan for taking Masters Degree or Higher Degree</div>
            <div className="px-3 pb-3 overflow-x-auto">
              <div className="min-w-[920px]">
                <table className="w-full table-fixed border-collapse border border-border">
                  <colgroup>
                    <col style={{ width: 220 }} />
                    <col style={{ width: 220 }} />
                    <col style={{ width: 160 }} />
                    <col style={{ width: 180 }} />
                    <col style={{ width: 140 }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="border border-border p-2 text-left text-xs font-semibold">Area for Development / Specialization</th>
                      <th className="border border-border p-2 text-left text-xs font-semibold">Development Activity</th>
                      <th className="border border-border p-2 text-left text-xs font-semibold">Target Completion Date</th>
                      <th className="border border-border p-2 text-left text-xs font-semibold">Who is responsible</th>
                      <th className="border border-border p-2 text-left text-xs font-semibold">Completion Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(form.long_term_training || []).map((row: any, idx: number) => (
                      <tr key={idx}>
                        <td className="border border-border p-2 align-top">
                          <Select value={row.area || ""} onValueChange={(v) => updateLongTermRow(idx, "area", v)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {AREA_FOR_DEVELOPMENT_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border border-border p-2 align-top">
                          <Input value={row.activity || ""} onChange={(e) => updateLongTermRow(idx, "activity", e.target.value)} />
                        </td>
                        <td className="border border-border p-2 align-top">
                          <Input type="date" value={row.target_completion_date || ""} onChange={(e) => updateLongTermRow(idx, "target_completion_date", e.target.value)} />
                        </td>
                        <td className="border border-border p-2 align-top">
                          <Input value={row.responsible || ""} onChange={(e) => updateLongTermRow(idx, "responsible", e.target.value)} />
                        </td>
                        <td className="border border-border p-2 align-top">
                          <Input value={row.status || ""} onChange={(e) => updateLongTermRow(idx, "status", e.target.value)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3">
                <Button type="button" variant="outline" onClick={addLongTermRow}>
                  Add Row
                </Button>
              </div>
            </div>
          </div>

          <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">IV. EMPLOYEE LONG TERM CAREER GOAL</div>
          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <div className="text-xs font-medium mb-1">Long-term Position Desired / Planned:</div>
                <Select value={form.long_term_career_goal?.long_term_position || ""} onValueChange={(v) => update("long_term_career_goal.long_term_position", v)} disabled={isLocked}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITION_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs font-medium mb-1">Operating Unit</div>
                <Select value={form.long_term_career_goal?.operating_unit || ""} onValueChange={(v) => update("long_term_career_goal.operating_unit", v)} disabled={isLocked}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATING_UNIT_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs font-medium mb-1">Functional Type</div>
                <Select value={form.long_term_career_goal?.functional_type || ""} onValueChange={(v) => update("long_term_career_goal.functional_type", v)} disabled={isLocked}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNCTIONAL_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs font-medium mb-1">Ready in</div>
                <Select value={form.long_term_career_goal?.ready_in || ""} onValueChange={(v) => update("long_term_career_goal.ready_in", v)} disabled={isLocked}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {READY_IN_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
                            {form.long_term_career_goal?.operating_unit === "Service" && (
                <div>
                  <div className="text-xs font-medium mb-1">Service</div>
                  <Select value={form.long_term_career_goal?.service || ""} onValueChange={(v) => update("long_term_career_goal.service", v)} disabled={isLocked}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.long_term_career_goal?.operating_unit === "Unit" && (
                <div>
                  <div className="text-xs font-medium mb-1">Unit</div>
                  <Select value={form.long_term_career_goal?.unit || ""} onValueChange={(v) => update("long_term_career_goal.unit", v)} disabled={isLocked}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.long_term_career_goal?.operating_unit === "Division" && (
                <div>
                  <div className="text-xs font-medium mb-1">Division</div>
                  <Select value={form.long_term_career_goal?.division || ""} onValueChange={(v) => update("long_term_career_goal.division", v)} disabled={isLocked}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIVISION_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">V. EXPERIENCE DURING THIS YEAR</div>
          <div className="p-3">
            <Textarea value={form.experience_during_this_year || ""} onChange={(e) => update("experience_during_this_year", e.target.value)} />
          </div>

          <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">VI. EMPLOYEE SHORT TERM GOAL</div>
          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <div className="text-xs font-medium mb-1">Next Step Position Desired / Planned:</div>
                <Select value={form.short_term_goal?.next_step_position || ""} onValueChange={(v) => update("short_term_goal.next_step_position", v)} disabled={isLocked}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITION_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs font-medium mb-1">Operating Unit</div>
                <Select value={form.short_term_goal?.operating_unit || ""} onValueChange={(v) => update("short_term_goal.operating_unit", v)} disabled={isLocked}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATING_UNIT_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs font-medium mb-1">Functional Type</div>
                <Select value={form.short_term_goal?.functional_type || ""} onValueChange={(v) => update("short_term_goal.functional_type", v)} disabled={isLocked}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNCTIONAL_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs font-medium mb-1">Ready in</div>
                <Select value={form.short_term_goal?.ready_in || ""} onValueChange={(v) => update("short_term_goal.ready_in", v)} disabled={isLocked}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {READY_IN_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
                            {form.short_term_goal?.operating_unit === "Service" && (
                <div>
                  <div className="text-xs font-medium mb-1">Service</div>
                  <Select value={form.short_term_goal?.service || ""} onValueChange={(v) => update("short_term_goal.service", v)} disabled={isLocked}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.short_term_goal?.operating_unit === "Unit" && (
                <div>
                  <div className="text-xs font-medium mb-1">Unit</div>
                  <Select value={form.short_term_goal?.unit || ""} onValueChange={(v) => update("short_term_goal.unit", v)} disabled={isLocked}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.short_term_goal?.operating_unit === "Division" && (
                <div>
                  <div className="text-xs font-medium mb-1">Division</div>
                  <Select value={form.short_term_goal?.division || ""} onValueChange={(v) => update("short_term_goal.division", v)} disabled={isLocked}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIVISION_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="mt-4 text-xs font-semibold">Short Term Training/Development Goals Next Year</div>
            <div className="mt-2 overflow-x-auto">
              <div className="min-w-[980px] border border-border">
                <div className="grid grid-cols-[220px_140px_220px_160px_180px_140px] bg-secondary/30 text-xs font-semibold">
                  <div className="p-2 border-r border-border">Area for Development / Specialization</div>
                  <div className="p-2 border-r border-border">Priority for IDP</div>
                  <div className="p-2 border-r border-border">Development Activity</div>
                  <div className="p-2 border-r border-border">Target Completion Date</div>
                  <div className="p-2 border-r border-border">Who is responsible</div>
                  <div className="p-2">Completion Status</div>
                </div>
                {(form.short_term_training_next_year || []).map((row: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-[220px_140px_220px_160px_180px_140px]">
                    <div className="p-2 border-t border-r border-border">
                      <Select value={row.area || ""} onValueChange={(v) => updateShortTermRow(idx, "area", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {AREA_FOR_DEVELOPMENT_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-2 border-t border-r border-border">
                      <Input value={row.priority_for_idp || ""} onChange={(e) => updateShortTermRow(idx, "priority_for_idp", e.target.value)} />
                    </div>
                    <div className="p-2 border-t border-r border-border">
                      <Input value={row.activity || ""} onChange={(e) => updateShortTermRow(idx, "activity", e.target.value)} />
                    </div>
                    <div className="p-2 border-t border-r border-border">
                      <Input type="date" value={row.target_completion_date || ""} onChange={(e) => updateShortTermRow(idx, "target_completion_date", e.target.value)} />
                    </div>
                    <div className="p-2 border-t border-r border-border">
                      <Input value={row.responsible || ""} onChange={(e) => updateShortTermRow(idx, "responsible", e.target.value)} />
                    </div>
                    <div className="p-2 border-t border-border">
                      <Input value={row.status || ""} onChange={(e) => updateShortTermRow(idx, "status", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Button type="button" variant="outline" onClick={addShortTermRow}>
                  Add Row
                </Button>
              </div>
            </div>
          </div>

          <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">VII. EXPERIENCE DURING THE PAST YEAR</div>
          <div className="p-3">
            <Textarea value={form.experience_during_past_year || ""} onChange={(e) => update("experience_during_past_year", e.target.value)} />
          </div>

          <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">ELECTRONIC CERTIFICATION</div>
          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium text-blue-900">Employee Submission</div>
                <div className="text-blue-700">
                  {approvalSubmittedAt ? (
                    <>Submitted on {approvalSubmittedAt.toLocaleString()} by {user.firstName} {user.lastName}</>
                  ) : (
                    <>This IDP will be submitted when you click "Save IDP"</>
                  )}
                </div>
              </div>
              
              {approvalStatusValue === "approved" && approvalApprovedAt && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-900">Management Approval</div>
                  <div className="text-green-700">
                    Approved on {approvalApprovedAt.toLocaleString()} by {approval?.approved_by_name || "Management"}
                  </div>
                </div>
              )}
              
              {approvalStatusValue === "rejected" && approvalApprovedAt && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-medium text-red-900">Management Decision</div>
                  <div className="text-red-700">
                    Rejected on {approvalApprovedAt.toLocaleString()} by {approval?.approved_by_name || "Management"}
                    {approval?.rejection_reason && (
                      <div className="mt-1 italic">Reason: {approval.rejection_reason}</div>
                    )}
                  </div>
                </div>
              )}
              
              {approvalStatusValue === "pending" && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-medium text-yellow-900">Pending Approval</div>
                  <div className="text-yellow-700">
                    This IDP is pending review by Management
                  </div>
                </div>
              )}
            </div>
          </div>
          </fieldset>
        </div>

        {approvalStatusValue !== "approved" && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving || approvalStatusValue === "pending"}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : approvalStatusValue === "pending" ? "Awaiting Approval" : "Save IDP"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardIDP;
