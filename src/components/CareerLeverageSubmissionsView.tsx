import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ClipboardList, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";
import { useToast } from "@/hooks/use-toast";
import { CareerLeverageSubmission } from "@/services/careerLeverageInventory";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  careerLeverageItems,
  careerLeverageResponseOptions,
  careerLeverageScoreGroups,
  computeCareerLeverageScores,
} from "@/data/careerLeverageInventory";

interface CareerLeverageSubmissionsViewProps {
  title: string;
  description: string;
  roleLabel: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
  fetchSubmissions: (year: number) => Promise<{
    success: boolean;
    submissions: CareerLeverageSubmission[];
    count: number;
    message?: string;
  }>;
}

const CareerLeverageSubmissionsView = ({
  title,
  description,
  roleLabel,
  user,
  onNavigate,
  onLogout,
  fetchSubmissions,
}: CareerLeverageSubmissionsViewProps) => {
  const { toast } = useToast();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [year, setYear] = useState<number>(currentYear);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<CareerLeverageSubmission[]>([]);
  const [viewSubmission, setViewSubmission] = useState<CareerLeverageSubmission | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const getInitials = (firstName: string, lastName: string) => `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";

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

  const load = async (selectedYear: number) => {
    setLoading(true);
    const result = await fetchSubmissions(selectedYear);
    if (result.success) {
      setSubmissions(result.submissions);
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to fetch Career Leverage Inventory submissions",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    load(year);
  }, [year]);

  const handleViewClick = (submission: CareerLeverageSubmission) => {
    setViewSubmission(submission);
    setShowViewDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            <HeaderProfileMenu user={user} roleLabel={roleLabel} onNavigate={onNavigate} onLogout={onLogout} />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="text-sm font-medium text-muted-foreground">Year</div>
            <Input className="w-32" type="number" value={year} onChange={(e) => setYear(Number(e.target.value || currentYear))} />
            <Button variant="outline" onClick={() => load(year)}>Refresh</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading Career Leverage Inventory submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No CLI submissions for {year}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const scoreResult = submission.cli?.scores || computeCareerLeverageScores(submission.cli?.answers || {});
              return (
                <motion.div
                  key={`${submission.user_id}-${submission.year}`}
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
                          <p className="font-medium text-foreground">Career Leverage Inventory</p>
                          <p className="text-sm text-muted-foreground">Student ID: {submission.user_id} • Year: {submission.year}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {careerLeverageScoreGroups.map((group) => (
                          <div key={group.key} className="rounded border border-border bg-background/60 p-2">
                            <div className="text-[11px] text-muted-foreground">{group.label}</div>
                            <div className="font-semibold">{scoreResult.totals?.[group.key] ?? 0}</div>
                          </div>
                        ))}
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
            })}
          </div>
        )}
      </div>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Career Leverage Inventory Details</DialogTitle>
          </DialogHeader>
          {viewSubmission && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                {careerLeverageScoreGroups.map((group) => {
                  const scoreResult = viewSubmission.cli?.scores || computeCareerLeverageScores(viewSubmission.cli?.answers || {});
                  return (
                    <div key={group.key} className="rounded-lg border border-border bg-secondary/30 p-4">
                      <div className="text-xs text-muted-foreground">{group.label}</div>
                      <div className="mt-1 text-2xl font-bold">{scoreResult.totals?.[group.key] ?? 0}</div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="border-b border-border px-6 py-4 text-xl font-bold tracking-wide">CAREER LEVERAGE SCORING</div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        {careerLeverageScoreGroups.map((group) => (
                          <th key={group.key} className="border border-border p-3 text-center text-lg font-bold">{group.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 7 }, (_, rowIndex) => (
                        <tr key={rowIndex}>
                          {careerLeverageScoreGroups.map((group) => (
                            <td key={`${group.key}-${rowIndex}`} className="border border-border p-0 text-center bg-sky-100/70 dark:bg-sky-950/30">
                              <div className="py-4 text-2xl font-bold">{group.items[rowIndex]}</div>
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="bg-secondary/40">
                        {careerLeverageScoreGroups.map((group) => {
                          const scoreResult = viewSubmission.cli?.scores || computeCareerLeverageScores(viewSubmission.cli?.answers || {});
                          return (
                            <td key={`${group.key}-total`} className="border border-border p-4 text-center">
                              <div className="text-xs text-muted-foreground">Total</div>
                              <div className="text-2xl font-bold text-foreground">{scoreResult.totals?.[group.key] ?? 0}</div>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse">
                    <thead>
                      <tr className="bg-muted/70">
                        <th className="border border-border p-3 text-center text-sm font-bold w-[55%]">ITEMS</th>
                        {careerLeverageResponseOptions.map((option) => (
                          <th key={option.value} className="border border-border p-2 text-center text-[11px] font-semibold align-middle w-[7.5%]">
                            <div className="leading-tight">{option.label}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {careerLeverageItems.map((item, index) => {
                        const itemNumber = index + 1;
                        const answer = String(viewSubmission.cli?.answers?.[itemNumber] ?? "");
                        return (
                          <tr key={itemNumber} className="align-top">
                            <td className="border border-border p-3 text-sm font-medium leading-snug">{itemNumber}. {item}</td>
                            {careerLeverageResponseOptions.map((option) => {
                              const selected = answer === option.value;
                              return (
                                <td key={`${itemNumber}-${option.value}`} className={`border border-border p-4 text-center text-lg font-bold ${selected ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}>
                                  {selected ? option.short : ""}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareerLeverageSubmissionsView;
