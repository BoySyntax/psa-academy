import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Pencil, Plus, Save, Trash2 } from "lucide-react";
import HeaderProfileMenu from "@/components/HeaderProfileMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  capacityDevelopmentPlanService,
  CapacityDevelopmentPlanItem,
} from "@/services/capacityDevelopmentPlan";

interface CapacityDevelopmentPlanProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface EligibleCourse {
  id: string;
  course_code: string;
  course_name: string;
  max_students?: number;
  category?: string;
  competencies: {
    core?: string;
    leadership?: string;
    technical?: string;
  };
}

const currentYear = new Date().getFullYear();

const CapacityDevelopmentPlan = ({ user, onNavigate, onLogout }: CapacityDevelopmentPlanProps) => {
  const { toast } = useToast();
  const [planYear, setPlanYear] = useState(String(currentYear));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<CapacityDevelopmentPlanItem[]>([]);
  const [eligibleCourses, setEligibleCourses] = useState<EligibleCourse[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CapacityDevelopmentPlanItem | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [proposedTrainingSchedule, setProposedTrainingSchedule] = useState("");
  const [targetParticipants, setTargetParticipants] = useState("");
  const [estimatedParticipants, setEstimatedParticipants] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  const yearNumber = useMemo(() => {
    const parsed = Number(planYear);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : currentYear;
  }, [planYear]);

  const loadData = async () => {
    setLoading(true);
    const [plansResult, coursesResult] = await Promise.all([
      capacityDevelopmentPlanService.getByYear(yearNumber),
      capacityDevelopmentPlanService.getEligibleCourses(),
    ]);

    if (plansResult.success) {
      setItems(plansResult.items);
    } else {
      toast({
        title: "Error",
        description: plansResult.message || "Failed to load CDP entries",
        variant: "destructive",
      });
    }

    if (coursesResult.success) {
      setEligibleCourses(coursesResult.courses as EligibleCourse[]);
    } else {
      toast({
        title: "Error",
        description: coursesResult.message || "Failed to load courses",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [yearNumber]);

  const resetForm = () => {
    setEditingItem(null);
    setSelectedCourseId("");
    setProposedTrainingSchedule("");
    setTargetParticipants("");
    setEstimatedParticipants("");
    setStatusNotes("");
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (item: CapacityDevelopmentPlanItem) => {
    setEditingItem(item);
    setSelectedCourseId(String(item.course_id));
    setProposedTrainingSchedule(item.proposed_training_schedule || "");
    setTargetParticipants(item.target_participants || "");
    setEstimatedParticipants(item.estimated_participants ? String(item.estimated_participants) : "");
    setStatusNotes(item.status_notes || "");
    setDialogOpen(true);
  };

  const coursesNotYetAdded = eligibleCourses.filter((course) => {
    if (editingItem && Number(course.id) === editingItem.course_id) return true;
    return !items.some((item) => item.course_id === Number(course.id));
  });

  const handleSave = async () => {
    if (!selectedCourseId) {
      toast({
        title: "Validation Error",
        description: "Please select a course",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const payload = {
      plan_year: yearNumber,
      course_id: Number(selectedCourseId),
      proposed_training_schedule: proposedTrainingSchedule,
      target_participants: targetParticipants,
      estimated_participants: estimatedParticipants ? Number(estimatedParticipants) : null,
      status_notes: statusNotes,
      created_by: user.id,
    };

    const result = editingItem
      ? await capacityDevelopmentPlanService.update(editingItem.id, payload)
      : await capacityDevelopmentPlanService.create(payload);

    if (result.success) {
      toast({
        title: "Success",
        description: result.message || "CDP entry saved successfully",
      });
      setDialogOpen(false);
      resetForm();
      await loadData();
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to save CDP entry",
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  const handleDelete = async (item: CapacityDevelopmentPlanItem) => {
    const result = await capacityDevelopmentPlanService.remove(item.id);
    if (result.success) {
      toast({
        title: "Deleted",
        description: result.message || "CDP entry deleted successfully",
      });
      await loadData();
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to delete CDP entry",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <ClipboardList className="w-6 h-6" />
                Capacity Development Plan
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Build the yearly CDP from existing courses and competency mappings</p>
            </div>
            <HeaderProfileMenu
              user={user}
              roleLabel="Admin"
              onNavigate={onNavigate}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan_year">Plan Year</Label>
              <Input
                id="plan_year"
                type="number"
                min="2000"
                value={planYear}
                onChange={(e) => setPlanYear(e.target.value)}
                className="w-[160px]"
              />
            </div>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add CDP Entry
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h2 className="text-lg font-semibold text-foreground">Capacity Development Plan {yearNumber}</h2>
            </div>

            {loading ? (
              <div className="p-10 text-sm text-muted-foreground">Loading CDP entries...</div>
            ) : items.length === 0 ? (
              <div className="p-10 text-sm text-muted-foreground">No CDP entries yet for {yearNumber}. Add one using the button above.</div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full border-collapse text-xs" style={{tableLayout: 'fixed'}}>
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border px-2 py-2 text-left font-semibold" style={{width: '3%'}}>NO.</th>
                      <th className="border border-border px-2 py-2 text-left font-semibold" style={{width: '16%'}}>COMPETENCY</th>
                      <th className="border border-border px-2 py-2 text-left font-semibold" style={{width: '16%'}}>COURSE TITLE<br/><span className="text-[9px] font-normal">(Type of L&D)</span></th>
                      <th className="border border-border px-2 py-2 text-left font-semibold" style={{width: '11%'}}>PROPOSED TRAINING SCHEDULE</th>
                      <th className="border border-border px-2 py-2 text-left font-semibold" style={{width: '15%'}}>TARGET PARTICIPANTS</th>
                      <th className="border border-border px-2 py-2 text-center font-semibold" style={{width: '7%'}}>ESTIMATED PARTICIPANTS</th>
                      <th className="border border-border px-2 py-2 text-left font-semibold" style={{width: '16%'}}>STATUS</th>
                      <th className="border border-border px-2 py-2 text-center font-semibold" style={{width: '6%'}}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="border border-border px-2 py-2 align-top text-center">{index + 1}</td>
                        <td className="border border-border px-2 py-2 align-top">
                          <div className="space-y-1">
                            {item.competencies.core && (
                              <div className="break-words">
                                <span className="font-semibold text-red-600">Core:</span> {item.competencies.core}
                              </div>
                            )}
                            {item.competencies.leadership && (
                              <div className="break-words">
                                <span className="font-semibold text-amber-600">Leadership:</span> {item.competencies.leadership}
                              </div>
                            )}
                            {item.competencies.technical && (
                              <div className="break-words">
                                <span className="font-semibold text-violet-600">Technical:</span> {item.competencies.technical}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="border border-border px-2 py-2 align-top">
                          <div className="font-medium break-words">{item.course.course_name}</div>
                          <div className="text-[9px] text-muted-foreground mt-1 break-words">({item.course.course_code})</div>
                        </td>
                        <td className="border border-border px-2 py-2 align-top break-words">{item.proposed_training_schedule || "—"}</td>
                        <td className="border border-border px-2 py-2 align-top break-words">{item.target_participants || "—"}</td>
                        <td className="border border-border px-2 py-2 align-top text-center">{item.estimated_participants ?? item.course.max_students ?? "—"}</td>
                        <td className="border border-border px-2 py-2 align-top break-words">{item.status_notes || "—"}</td>
                        <td className="border border-border px-2 py-2 align-top">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(item)}
                              aria-label="Edit"
                              title="Edit"
                              className="h-6 w-6"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDelete(item)}
                              aria-label="Delete"
                              title="Delete"
                              className="h-6 w-6"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit CDP Entry" : "Add CDP Entry"}</DialogTitle>
            <DialogDescription>Link a course to the yearly Capacity Development Plan and provide planning details.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Course</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {coursesNotYetAdded.map((course) => (
                    <SelectItem key={course.id} value={String(course.id)}>
                      {course.course_code} - {course.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Proposed Training Schedule</Label>
              <Input value={proposedTrainingSchedule} onChange={(e) => setProposedTrainingSchedule(e.target.value)} placeholder="e.g., 15-17 July 2025" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Target Participants</Label>
              <Textarea value={targetParticipants} onChange={(e) => setTargetParticipants(e.target.value)} rows={3} placeholder="e.g., Resource Persons, RSSO X Management Officials" />
            </div>

            <div className="space-y-2">
              <Label>Estimated Participants</Label>
              <Input type="number" min="0" value={estimatedParticipants} onChange={(e) => setEstimatedParticipants(e.target.value)} placeholder="e.g., 40" />
            </div>

            <div className="space-y-2">
              <Label>Plan Year</Label>
              <Input type="number" min="2000" value={planYear} onChange={(e) => setPlanYear(e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Status</Label>
              <Textarea value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} rows={3} placeholder="e.g., OCD cannot find available dates with regard to the Resource Persons' availability" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CapacityDevelopmentPlan;
