import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Clock, FileText, User } from "lucide-react";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost/charming_api";

type ImpactListStatus = "due" | "not_yet_due" | "completed";

interface ImpactEvaluationItem {
  evaluation_id: number;
  user_id: number;
  course_id: number;
  trainee_name: string;
  office_service_division?: string | null;
  training_program: string;
  training_objectives?: string | null;
  completion_date?: string | null;
  due_date?: string | null;
  course: {
    course_code: string;
    course_name: string;
  };
  student: {
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    email: string;
  };
  level3: {
    q1?: string | null;
    q2?: string | null;
    q3?: string | null;
    evaluated_by?: string | null;
    evaluated_by_date?: string | null;
    received_by?: string | null;
    received_by_date?: string | null;
  };
}

interface FetchImpactEvaluationsResponse {
  success: boolean;
  items: ImpactEvaluationItem[];
  count: number;
  message?: string;
}

interface SaveImpactEvaluationResponse {
  success: boolean;
  message?: string;
}

interface ImpactEvaluationsProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const ImpactEvaluations = ({ user, onNavigate, onLogout }: ImpactEvaluationsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ImpactListStatus>("due");

  const [dueItems, setDueItems] = useState<ImpactEvaluationItem[]>([]);
  const [notYetDueItems, setNotYetDueItems] = useState<ImpactEvaluationItem[]>([]);
  const [completedItems, setCompletedItems] = useState<ImpactEvaluationItem[]>([]);

  const [selected, setSelected] = useState<ImpactEvaluationItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [level3q1, setLevel3q1] = useState("");
  const [level3q2, setLevel3q2] = useState("");
  const [level3q3, setLevel3q3] = useState("");
  const [evaluatedBy, setEvaluatedBy] = useState("");
  const [evaluatedByDate, setEvaluatedByDate] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [receivedByDate, setReceivedByDate] = useState("");
  const [trainingObjectives, setTrainingObjectives] = useState("");

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const fetchList = async (status: ImpactListStatus): Promise<ImpactEvaluationItem[]> => {
    const response = await fetch(`${API_BASE_URL}/management/impact-evaluations.php?status=${status}`);
    const data: FetchImpactEvaluationsResponse = await response.json();
    if (!data.success) throw new Error(data.message || "Failed to fetch impact evaluations");
    return data.items || [];
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [due, notYet, completed] = await Promise.all([
        fetchList("due"),
        fetchList("not_yet_due"),
        fetchList("completed"),
      ]);
      setDueItems(due);
      setNotYetDueItems(notYet);
      setCompletedItems(completed);
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to load impact evaluations",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLevel3q1(String(selected.level3?.q1 || ""));
    setLevel3q2(String(selected.level3?.q2 || ""));
    setLevel3q3(String(selected.level3?.q3 || ""));
    setEvaluatedBy(String(selected.level3?.evaluated_by || ""));
    setEvaluatedByDate(String(selected.level3?.evaluated_by_date || ""));
    setReceivedBy(String(selected.level3?.received_by || ""));
    setReceivedByDate(String(selected.level3?.received_by_date || ""));
    setTrainingObjectives(String(selected.training_objectives || ""));
  }, [selected]);

  const canSave = useMemo(() => {
    return level3q1.trim() && level3q2.trim() && level3q3.trim();
  }, [level3q1, level3q2, level3q3]);

  const handleSave = async () => {
    if (!selected) return;
    if (!canSave) {
      toast({
        title: "Incomplete",
        description: "Please complete all Level 3 answers before saving.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/management/impact-evaluations.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selected.user_id,
          course_id: selected.course_id,
          training_objectives: trainingObjectives,
          level3_q1: level3q1,
          level3_q2: level3q2,
          level3_q3: level3q3,
          evaluated_by: evaluatedBy,
          evaluated_by_date: evaluatedByDate,
          received_by: receivedBy,
          received_by_date: receivedByDate,
        }),
      });
      const data: SaveImpactEvaluationResponse = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to save Level 3 evaluation");
      }

      toast({ title: "Saved", description: data.message || "Level 3 evaluation saved" });
      setSelected(null);
      await fetchAll();
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to save Level 3 evaluation",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const itemsForTab = (tab: ImpactListStatus) => {
    if (tab === "due") return dueItems;
    if (tab === "not_yet_due") return notYetDueItems;
    return completedItems;
  };

  const TabEmpty = ({ label }: { label: string }) => (
    <div className="text-center py-12">
      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">No {label}</p>
    </div>
  );

  const StatusBadge = ({ status }: { status: ImpactListStatus }) => {
    const base = "inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full border";
    if (status === "completed") {
      return (
        <span className={`${base} bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-800 dark:text-green-200`}>
          <CheckCircle className="w-3 h-3" /> Completed
        </span>
      );
    }
    if (status === "not_yet_due") {
      return (
        <span className={`${base} bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-900 text-slate-700 dark:text-slate-200`}>
          <Clock className="w-3 h-3" /> Not yet due
        </span>
      );
    }
    return (
      <span className={`${base} bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200`}>
        <Calendar className="w-3 h-3" /> Due
      </span>
    );
  };

  const ItemCard = ({ item, status }: { item: ImpactEvaluationItem; status: ImpactListStatus }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground mb-1 truncate">{item.trainee_name}</h4>
              <div className="text-sm text-muted-foreground truncate">{item.student.email}</div>
              {item.office_service_division && (
                <div className="text-xs text-muted-foreground mt-1 truncate">{item.office_service_division}</div>
              )}
            </div>
            <StatusBadge status={status} />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-border bg-background/60 p-3">
              <div className="text-xs text-muted-foreground">Training Title</div>
              <div className="font-medium text-foreground mt-1">{item.course.course_name}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.course.course_code}</div>
            </div>
            <div className="rounded-md border border-border bg-background/60 p-3">
              <div className="text-xs text-muted-foreground">Completion / Conduct Date</div>
              <div className="font-medium text-foreground mt-1">{formatDate(item.completion_date)}</div>
              <div className="text-xs text-muted-foreground mt-1">Due: {formatDate(item.due_date)}</div>
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col gap-2 lg:w-40">
          <Button
            onClick={() => setSelected(item)}
            variant={status === "completed" ? "outline" : "default"}
            size="sm"
            className="flex-1 lg:flex-none"
          >
            {status === "completed" ? "View" : "Fill Level 3"}
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
              <h1 className="text-2xl font-bold text-foreground">Impact Evaluation (Level 3)</h1>
              <p className="text-sm text-muted-foreground mt-1">Due 3 months after course completion</p>
            </div>
            <HeaderProfileMenu user={user} roleLabel="Management" onNavigate={onNavigate} onLogout={onLogout} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ImpactListStatus)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="due" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due ({dueItems.length})
            </TabsTrigger>
            <TabsTrigger value="not_yet_due" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Not Yet Due ({notYetDueItems.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed ({completedItems.length})
            </TabsTrigger>
          </TabsList>

          {(["due", "not_yet_due", "completed"] as ImpactListStatus[]).map((tab) => {
            const items = itemsForTab(tab);
            const emptyLabel = tab === "due" ? "due evaluations" : tab === "not_yet_due" ? "upcoming evaluations" : "completed evaluations";
            return (
              <TabsContent key={tab} value={tab}>
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Loading impact evaluations...</div>
                ) : items.length === 0 ? (
                  <TabEmpty label={emptyLabel} />
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <ItemCard key={`${tab}-${item.evaluation_id}`} item={item} status={tab} />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>HRD-L&D Impact Evaluation Form</DialogTitle>
            <DialogDescription>
              {selected ? `${selected.trainee_name} • ${selected.course.course_name}` : ""}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              <div className="border border-border rounded-md overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_220px_1fr]">
                  <div className="p-3 text-sm font-medium bg-secondary border-r border-border">Name of Trainee</div>
                  <div className="p-3 text-sm bg-background md:border-r border-border">{selected.trainee_name}</div>
                  <div className="p-3 text-sm font-medium bg-secondary border-t border-border md:border-t-0 md:border-r border-border">Office/Service/Division</div>
                  <div className="p-3 text-sm bg-background border-t border-border md:border-t-0">{selected.office_service_division || "—"}</div>
                </div>

                <div className="border-t border-border grid grid-cols-1 md:grid-cols-[220px_1fr]">
                  <div className="p-3 text-sm font-medium bg-secondary border-r border-border">Training Title</div>
                  <div className="p-3 text-sm bg-background">{selected.course.course_name}</div>
                </div>

                <div className="border-t border-border grid grid-cols-1 md:grid-cols-[220px_1fr]">
                  <div className="p-3 text-sm font-medium bg-secondary border-r border-border">Date Conducted</div>
                  <div className="p-3 text-sm bg-background">{formatDate(selected.completion_date)}</div>
                </div>

                <div className="border-t border-border grid grid-cols-1 md:grid-cols-[220px_1fr]">
                  <div className="p-3 text-sm font-medium bg-secondary border-r border-border">Training Objectives</div>
                  <div className="p-3 text-sm bg-background">
                    <Textarea value={trainingObjectives} onChange={(e) => setTrainingObjectives(e.target.value)} rows={4} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Evaluated by (Management)</label>
                  <Input className="mt-1" value={evaluatedBy} onChange={(e) => setEvaluatedBy(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input className="mt-1" type="date" value={evaluatedByDate} onChange={(e) => setEvaluatedByDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Received by</label>
                  <Input className="mt-1" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input className="mt-1" type="date" value={receivedByDate} onChange={(e) => setReceivedByDate(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">1. Has the participant been able to use or show any improvement in the application of knowledge/skills gained from the training program mentioned above? How?</div>
                  <Textarea className="mt-2" value={level3q1} onChange={(e) => setLevel3q1(e.target.value)} rows={6} />
                </div>
                <div>
                  <div className="text-sm font-medium">2. What improvement/s or any other learning intervention/s should the participant take to improve his/her productivity in the workplace?</div>
                  <Textarea className="mt-2" value={level3q2} onChange={(e) => setLevel3q2(e.target.value)} rows={6} />
                </div>
              </div>

              <div>
                <div className="text-sm font-medium">3. Can you please suggest other Training Needs in support to enhancement of competency of the personnel in your Office/Unit/Division</div>
                <Textarea className="mt-2" value={level3q3} onChange={(e) => setLevel3q3(e.target.value)} rows={4} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)} disabled={saving}>
              Close
            </Button>
            <Button onClick={handleSave} disabled={saving || !selected || !canSave}>
              {saving ? "Saving..." : "Save Level 3"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImpactEvaluations;
