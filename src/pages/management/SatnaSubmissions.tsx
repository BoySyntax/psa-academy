import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ClipboardList, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";
import { useToast } from "@/hooks/use-toast";
import { managementService, SatnaSubmission } from "@/services/management";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SatnaSubmissionsProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const SatnaSubmissions = ({ user, onNavigate, onLogout }: SatnaSubmissionsProps) => {
  const { toast } = useToast();
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const [year, setYear] = useState<number>(currentYear);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<SatnaSubmission[]>([]);

  const [viewSubmission, setViewSubmission] = useState<SatnaSubmission | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchSubmissions = async (y: number) => {
    setLoading(true);
    const res = await managementService.fetchSatna(y);
    if (res.success) {
      setSubmissions(res.audits);
    } else {
      toast({
        title: "Error",
        description: res.message || "Failed to fetch SATNA submissions",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions(year);
  }, [year]);

  const handleViewClick = (sub: SatnaSubmission) => {
    setViewSubmission(sub);
    setShowViewDialog(true);
  };

  const renderDesiredTrainings = (audit: any) => {
    if (!audit?.desired_trainings) return <span className="text-sm text-muted-foreground">—</span>;

    const grouped: Record<string, { label: string; rank: string }[]> = {};
    Object.entries(audit.desired_trainings).forEach(([key, val]: [string, any]) => {
      if (val?.selected && val?.rank && val.rank !== "") {
        const [topic, item] = key.split("::");
        if (!grouped[topic]) grouped[topic] = [];
        grouped[topic].push({ label: item, rank: val.rank });
      }
    });

    if (Object.keys(grouped).length === 0) return <span className="text-sm text-muted-foreground">—</span>;

    return (
      <div className="space-y-4">
        {Object.entries(grouped).map(([topic, items]) => (
          <div key={topic}>
            <div className="text-sm font-semibold mb-2">{topic}</div>
            <ul className="space-y-1 text-sm">
              {items
                .sort((a, b) => (a.rank === "" ? 1 : b.rank === "" ? -1 : Number(a.rank) - Number(b.rank)))
                .map(({ label, rank }) => (
                  <li key={label} className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">Rank {rank}</span>
                    <span>{label}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const renderComputerLiteracy = (audit: any) => {
    const literacy = audit?.computer_literacy || {};
    const rows = [
      { label: "Word Processing Software (MS Word, OpenOffice, etc.)", key: "word_processing" },
      { label: "Spreadsheet Software (MS Excel, OpenOffice, etc.)", key: "spreadsheet" },
      { label: "Accounting System (FRS, in-house Accounting System, Quickbox, etc.)", key: "accounting" },
      { label: "Database (MS Access, dBase, Foxbase, SQL, etc.)", key: "database" },
      { label: "Graphics and Animation (Adobe Illustrator, Photoshop, Paintshop, etc.)", key: "graphics" },
      { label: "Statistical Analysis Software", key: "statistical_analysis" },
      { label: "Internet Browsing", key: "internet_browsing" },
      { label: "Email Software", key: "email" },
      { label: "Other Software", key: "other_software_proficiency" },
    ];

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse border border-border">
          <thead>
            <tr className="bg-secondary">
              <th className="border border-border p-2 text-left">Type of Software</th>
              <th className="border border-border p-2 text-left">Level of Proficiency (1 lowest / 10 highest; NA if not applicable)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rawValue = literacy[row.key];
              const prof = typeof rawValue === "object" && rawValue !== null
                ? rawValue.proficiency || "NA"
                : rawValue || "NA";
              const otherLabel = row.key === "other_software_proficiency" ? literacy?.other_software_name || "" : "";
              return (
                <tr key={row.key}>
                  <td className="border border-border p-2">
                    {row.label}
                    {row.key === "other_software_proficiency" && otherLabel && (
                      <div className="mt-1 font-normal">{otherLabel}</div>
                    )}
                  </td>
                  <td className="border border-border p-2">{prof}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const SubmissionCard = ({ submission }: { submission: SatnaSubmission }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex items-start gap-4 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={submission.student.profile_image_url || undefined} />
            <AvatarFallback>{getInitials(submission.student.first_name, submission.student.last_name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground mb-1">
              {submission.student.first_name} {submission.student.middle_name || ""} {submission.student.last_name}
            </h4>

            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span className="truncate">{submission.student.email}</span>
              </div>
              {submission.student.cellphone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>{submission.student.cellphone_number}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">SATNA</p>
              <p className="text-sm text-muted-foreground">Student ID: {submission.user_id} • Year: {submission.year}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Submitted: {formatDate(submission.submitted_at)}</span>
          </div>
        </div>

        <div className="flex lg:flex-col gap-2 lg:w-32">
          <Button onClick={() => handleViewClick(submission)} variant="outline" size="sm" className="flex-1 lg:flex-none">
            View
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">SATNA Submissions</h1>
              <p className="text-sm text-muted-foreground mt-1">View student Skill Audit and Training Needs Assessment submissions</p>
            </div>

            <HeaderProfileMenu user={user} roleLabel="Management" onNavigate={onNavigate} onLogout={onLogout} />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="text-sm font-medium text-muted-foreground">Year</div>
            <Input
              className="w-32"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value || currentYear))}
            />
            <Button variant="outline" onClick={() => fetchSubmissions(year)}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading SATNA submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No submissions for {year}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => (
              <SubmissionCard key={`${s.user_id}-${s.year}`} submission={s} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>SATNA Details</DialogTitle>
            <DialogDescription>
              {viewSubmission
                ? `${viewSubmission.student.first_name} ${viewSubmission.student.last_name} • Year: ${viewSubmission.year}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                <User className="w-4 h-4" />
                Personal Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Name:</span> {viewSubmission?.audit?.personal?.name_of_employee || "—"}</div>
                <div><span className="font-medium">Position:</span> {viewSubmission?.audit?.personal?.present_position || "—"}</div>
                <div><span className="font-medium">Age:</span> {viewSubmission?.audit?.personal?.age || "—"}</div>
                <div><span className="font-medium">Sex:</span> {viewSubmission?.audit?.personal?.sex || "—"}</div>
                <div><span className="font-medium">Province/Division/Unit:</span> {viewSubmission?.audit?.personal?.province_division_unit || "—"}</div>
                <div><span className="font-medium">Length of Service:</span> {viewSubmission?.audit?.personal?.length_of_service_present_position || "—"}</div>
                <div className="md:col-span-2"><span className="font-medium">Highest Educational Attainment:</span> {viewSubmission?.audit?.personal?.highest_educational_attainment || "—"}</div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">II. Level of Computer Literacy</div>
              {renderComputerLiteracy(viewSubmission?.audit)}
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">III. Present Functions</div>
              <div className="text-sm whitespace-pre-wrap">{viewSubmission?.audit?.present_functions || "—"}</div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">IV. Competent to Perform</div>
              <div className="text-sm whitespace-pre-wrap">{viewSubmission?.audit?.competent_to_perform || "—"}</div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">V. Difficult to Perform</div>
              <div className="text-sm whitespace-pre-wrap">{viewSubmission?.audit?.difficult_to_perform || "—"}</div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">VI. DESIRED TRAININGS (You are given sets of training categorized according to Main Topic. Please pick three top choices trainings and then among each set pick three top choices for each set applicable to your current position by ticking and ranking them accordingly Rank 1,2,3)</div>
              {renderDesiredTrainings(viewSubmission?.audit)}
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-semibold mb-2">Other Training Suggestions</div>
              <div className="text-sm whitespace-pre-wrap">{viewSubmission?.audit?.other_training_suggestions || "—"}</div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SatnaSubmissions;
