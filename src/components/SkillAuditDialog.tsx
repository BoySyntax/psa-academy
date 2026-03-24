import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { profileService } from "@/services/profile";
import { skillAuditService } from "@/services/skillAudit";

type Proficiency = "NA" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";

interface SkillAuditDialogProps {
  open: boolean;
  userId: number;
  preloadedData?: { audit?: any; profile?: any };
  readOnly?: boolean;
  onSubmitted: () => void;
  onClose: () => void;
}

const softwareItems = [
  { key: "word_processing", label: "Word Processing Software (MS Word, OpenOffice, etc.)" },
  { key: "spreadsheet", label: "Spreadsheet Software (MS Excel, OpenOffice, etc.)" },
  { key: "accounting", label: "Accounting System (FRS, in-house Accounting System, Quickbox, etc.)" },
  { key: "database", label: "Database (MS Access, dBase, Foxbase, SQL, etc.)" },
  { key: "graphics", label: "Graphics and Animation (Adobe Illustrator, Photoshop, Paintshop, etc.)" },
  { key: "statistical_analysis", label: "Statistical Analysis Software" },
  { key: "internet_browsing", label: "Internet Browsing" },
  { key: "email", label: "Email Software" },
];

const trainingChoices = [
  {
    topic: "Management",
    items: [
      "Planning and Time Management",
      "Leadership and Supervisory (SDC Track ___, etc.)",
      "Stress Management",
      "Change Management",
      "Conflict Management and Collaborative Negotiation",
      "Employee Management",
    ],
  },
  {
    topic: "Inter-personal Effectiveness",
    items: ["Personal Management", "Interpersonal Relations", "Moral Transformation", "Working with Teams", "Understanding Ourselves and Others"],
  },
  {
    topic: "Intra-personal Development",
    items: ["Personality Development", "Intra-personal Communication", "Public and Clients Relations", "Spirituality", "Emotional Quotient"],
  },
  {
    topic: "Research",
    items: ["Data Collection", "Technical Writing", "Qualitative Research", "Statistical Report Writing", "Report and Research Presentation", "Quantitative Research"],
  },
  {
    topic: "Statistics",
    items: [
      "Introduction to Statistics and Statistical Inference",
      "Basic Statistical Tools",
      "Statistical Analysis",
      "Regression Analysis",
      "Data Management",
      "Using CS Pro",
      "SPSS and Other Statistical Tools",
      "Sampling Design and Estimation",
      "Data Visualization",
      "A Guide to Google Sheets and MS Excel",
      "Questionnaire Design",
      "Analytics of Big Data",
      "Effective Presentation of Statistical Data",
      "Introduction to Time Series and Forecasting",
    ],
  },
  {
    topic: "Communication",
    items: ["Oral Communication", "Written Communication Skills", "Critical Listening and Informational Listening", "Basic English Grammar Refresher", "Journalism and News Writing", "Technical Report Writing using PSA Data"],
  },
  {
    topic: "Computer Skills",
    items: [
      "Basic Computer Operations",
      "Basic Powerpoint Presentation",
      "Advanced Powerpoint Presentation",
      "Word Processing",
      "Spreadsheet (Excel, etc.)",
      "Advanced Excel (Use of advance tools)",
      "Graphics Design and Animation",
      "Webpage Design and Administration",
      "Basic/Advanced Movie Maker",
      "Computer Programming",
    ],
  },
];

const getAge = (dob?: string | null) => {
  console.log('getAge called with dob:', dob); // Debug log
  if (!dob) return "Not specified";
  const dt = new Date(dob);
  if (Number.isNaN(dt.getTime())) return "Invalid date";
  const today = new Date();
  let age = today.getFullYear() - dt.getFullYear();
  const m = today.getMonth() - dt.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dt.getDate())) age--;
  return age > 0 ? String(age) : "Invalid date";
};

const SkillAuditDialog = ({ open, userId, preloadedData, readOnly = false, onSubmitted, onClose }: SkillAuditDialogProps) => {
  const { toast } = useToast();
  const year = useMemo(() => new Date().getFullYear(), []);

  const hasPreloaded = !!preloadedData;
  const [loading, setLoading] = useState(!hasPreloaded);
  const [submitting, setSubmitting] = useState(false);

  const [personal, setPersonal] = useState({
    name_of_employee: "",
    present_position: "",
    age: "",
    sex: "",
    province_division_unit: "",
    length_of_service_present_position: "",
    highest_educational_attainment: "",
  });

  const [computerLiteracy, setComputerLiteracy] = useState<Record<string, Proficiency | string>>({
    word_processing: "NA",
    spreadsheet: "NA",
    accounting: "NA",
    database: "NA",
    graphics: "NA",
    statistical_analysis: "NA",
    internet_browsing: "NA",
    email: "NA",
    other_software_proficiency: "NA",
  });
  const [otherSoftwareName, setOtherSoftwareName] = useState("");

  const [presentFunctions, setPresentFunctions] = useState("");
  const [competentToPerform, setCompetentToPerform] = useState("");
  const [difficultToPerform, setDifficultToPerform] = useState("");

  const [selectedTrainingTopics, setSelectedTrainingTopics] = useState<string[]>([]);
  const [desiredTrainings, setDesiredTrainings] = useState<Record<string, { selected: boolean; rank: "" | "1" | "2" | "3" }>>({});
  const [otherTrainingSuggestions, setOtherTrainingSuggestions] = useState("");

  useEffect(() => {
    if (!open) return;

    if (hasPreloaded) {
      // Apply preloaded data directly
      if (preloadedData?.profile) {
        const p = preloadedData.profile;
        console.log('Profile data:', p); // Debug log
        const fullName = [p.first_name, p.middle_name, p.last_name, p.suffix].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

        setPersonal((prev) => ({
          ...prev,
          name_of_employee: fullName || prev.name_of_employee,
          present_position: (p.present_position ?? prev.present_position) || "",
          age: getAge(p.date_of_birth) || prev.age,
          sex: (p.sex ?? prev.sex) || "",
          province_division_unit: (p.division_province ?? p.province ?? prev.province_division_unit) || "",
          highest_educational_attainment: (p.educational_attainment ?? prev.highest_educational_attainment) || "",
        }));
      }

      if (preloadedData?.audit) {
        const a = preloadedData.audit;
        setPersonal((prev) => ({ ...prev, ...(a.personal || {}) }));
        setComputerLiteracy((prev) => ({ ...prev, ...(a.computer_literacy || {}) }));
        setOtherSoftwareName(a.computer_literacy?.other_software_name || "");
        setPresentFunctions(a.present_functions || "");
        setCompetentToPerform(a.competent_to_perform || "");
        setDifficultToPerform(a.difficult_to_perform || "");
        setDesiredTrainings((a.desired_trainings as any) || {});
        setSelectedTrainingTopics(Array.isArray(a.desired_training_topics) ? a.desired_training_topics : []);
        setOtherTrainingSuggestions(a.other_training_suggestions || "");
      } else {
        const init: Record<string, { selected: boolean; rank: "" | "1" | "2" | "3" }> = {};
        trainingChoices.forEach((t) =>
          t.items.forEach((it) => {
            const key = `${t.topic}::${it}`;
            init[key] = { selected: false, rank: "" };
          })
        );
        setSelectedTrainingTopics([]);
        setDesiredTrainings(init);
      }

      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const profileResult = await profileService.getProfile(userId.toString());
        if (profileResult.success && profileResult.profile) {
          const p = profileResult.profile;
          const fullName = [p.first_name, p.middle_name, p.last_name, p.suffix].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

          setPersonal((prev) => ({
            ...prev,
            name_of_employee: fullName || prev.name_of_employee,
            present_position: (p.present_position ?? prev.present_position) || "",
            age: getAge(p.date_of_birth) || prev.age,
            sex: (p.sex ?? prev.sex) || "",
            province_division_unit: (p.division_province ?? p.province ?? prev.province_division_unit) || "",
            highest_educational_attainment: (p.educational_attainment ?? prev.highest_educational_attainment) || "",
          }));
        }

        const auditResult = await skillAuditService.getStatus(userId, year);
        if (auditResult.success && auditResult.submitted && auditResult.audit) {
          const a = auditResult.audit;
          setPersonal((prev) => ({ ...prev, ...(a.personal || {}) }));
          setComputerLiteracy((prev) => ({ ...prev, ...(a.computer_literacy || {}) }));
          setOtherSoftwareName(a.computer_literacy?.other_software_name || "");
          setPresentFunctions(a.present_functions || "");
          setCompetentToPerform(a.competent_to_perform || "");
          setDifficultToPerform(a.difficult_to_perform || "");
          setDesiredTrainings((a.desired_trainings as any) || {});
          setSelectedTrainingTopics(Array.isArray(a.desired_training_topics) ? a.desired_training_topics : []);
          setOtherTrainingSuggestions(a.other_training_suggestions || "");
        } else {
          const init: Record<string, { selected: boolean; rank: "" | "1" | "2" | "3" }> = {};
          trainingChoices.forEach((t) =>
            t.items.forEach((it) => {
              const key = `${t.topic}::${it}`;
              init[key] = { selected: false, rank: "" };
            })
          );
          setSelectedTrainingTopics([]);
          setDesiredTrainings(init);
        }
      } catch (e) {
        toast({
          title: "Error",
          description: e instanceof Error ? e.message : "Failed to load Skill Audit",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, userId, year, hasPreloaded, preloadedData]);

  const selectedRanks = useMemo(() => {
    const ranks: Array<"1" | "2" | "3"> = [];
    Object.values(desiredTrainings || {}).forEach((v) => {
      if (v.selected && (v.rank === "1" || v.rank === "2" || v.rank === "3")) ranks.push(v.rank);
    });
    return ranks;
  }, [desiredTrainings]);

  const selectedTrainingCount = useMemo(() => {
    return Object.values(desiredTrainings || {}).filter((v) => v.selected).length;
  }, [desiredTrainings]);

  const selectedTopicCount = useMemo(() => selectedTrainingTopics.length, [selectedTrainingTopics]);

  const isTopicComplete = useMemo(() => {
    const isComplete = (topic: string) => {
      const prefix = `${topic}::`;
      const selected = Object.entries(desiredTrainings || {})
        .filter(([key, v]) => key.startsWith(prefix) && v.selected);

      if (selected.length !== 3) return false;

      const ranks = selected
        .map(([, v]) => v.rank)
        .filter((rank): rank is "1" | "2" | "3" => rank === "1" || rank === "2" || rank === "3");

      return ranks.length === 3 && new Set(ranks).size === 3 && ranks.includes("1") && ranks.includes("2") && ranks.includes("3");
    };

    return isComplete;
  }, [desiredTrainings]);

  const allSelectedTopicsComplete = useMemo(() => {
    if (selectedTrainingTopics.length !== 3) return false;
    return selectedTrainingTopics.every((t) => isTopicComplete(t));
  }, [selectedTrainingTopics, isTopicComplete]);

  const canSubmit =
    personal.name_of_employee.trim() &&
    personal.present_position.trim() &&
    personal.highest_educational_attainment.trim() &&
    presentFunctions.trim() &&
    competentToPerform.trim() &&
    difficultToPerform.trim() &&
    selectedTopicCount === 3 &&
    allSelectedTopicsComplete;

  const updateComputer = (key: string, value: Proficiency | string) => {
    setComputerLiteracy((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateTraining = (key: string, patch: Partial<{ selected: boolean; rank: "" | "1" | "2" | "3" }>) => {
    setDesiredTrainings((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { selected: false, rank: "" }),
        ...patch,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast({
        title: "Incomplete Form",
        description: "Please complete the required fields, choose exactly three (3) main topics, and for each selected topic choose exactly three (3) trainings ranked 1, 2, and 3.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      user_id: userId,
      year,
      personal,
      computer_literacy: {
        ...computerLiteracy,
        other_software_name: otherSoftwareName,
      },
      present_functions: presentFunctions,
      competent_to_perform: competentToPerform,
      difficult_to_perform: difficultToPerform,
      desired_training_topics: selectedTrainingTopics,
      desired_trainings: desiredTrainings,
      other_training_suggestions: otherTrainingSuggestions,
    };

    setSubmitting(true);
    const result = await skillAuditService.submit(payload);
    setSubmitting(false);

    if (result.success) {
      toast({
        title: "Submitted",
        description: `Your Skill Audit for ${year} has been submitted.`,
      });
      onSubmitted();
      return;
    }

    toast({
      title: "Error",
      description: result.message || "Failed to submit Skill Audit",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Skill Audit and Training Needs Assessment</DialogTitle>
          <DialogDescription>
            Yearly form ({year}) {readOnly && <span className="text-muted-foreground">(View only)</span>}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading form...</div>
        ) : (
          <div className="border border-border bg-background">
            <div className="border-b border-border p-3 text-xs text-muted-foreground">
              INSTRUCTION ON FILLING-UP THE FORM - To help the Administrative develop appropriate and effective training programs for our personnel, please answer the following questions completely and accurately. Please be as detailed as possible in providing additional information that may help in the assessment. For further inquiries, please contact our office for assistance.
            </div>
            <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">I. PERSONAL INFORMATION</div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="border-b border-border md:border-r border-border p-3">
                <div className="text-xs font-medium mb-1">Name of Employee</div>
                <Input value={personal.name_of_employee} disabled />
              </div>
              <div className="border-b border-border p-3">
                <div className="text-xs font-medium mb-1">Present Position</div>
                <Input value={personal.present_position} disabled />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4">
              <div className="border-b border-border md:border-r border-border p-3">
                <div className="text-xs font-medium mb-1">Age</div>
                <Input value={personal.age} disabled />
              </div>
              <div className="border-b border-border md:border-r border-border p-3">
                <div className="text-xs font-medium mb-1">Sex</div>
                <Input value={personal.sex} disabled />
              </div>
              <div className="border-b border-border md:border-r border-border p-3 md:col-span-1">
                <div className="text-xs font-medium mb-1">Province/Division/Unit</div>
                <Input value={personal.province_division_unit} disabled />
              </div>
              <div className="border-b border-border p-3">
                <div className="text-xs font-medium mb-1">Length of Service in Present Position</div>
                <Input value={personal.length_of_service_present_position} disabled={readOnly} onChange={(e) => !readOnly && setPersonal((p) => ({ ...p, length_of_service_present_position: e.target.value }))} />
              </div>
            </div>

            <div className="border-b border-border p-3">
              <div className="text-xs font-medium mb-1">Highest Educational Attainment/Degree or Course</div>
              <Input
                value={personal.highest_educational_attainment}
                disabled
              />
            </div>

            <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">II. LEVEL OF COMPUTER LITERACY</div>

            <div className="p-3 overflow-x-auto">
              <div className="min-w-[820px]">
                <div className="grid grid-cols-[1fr_220px] bg-secondary/20 border border-border text-xs font-semibold">
                  <div className="p-2 border-r border-border">Type of Software</div>
                  <div className="p-2">Level of Proficiency (1 lowest / 10 highest; NA if not applicable)</div>
                </div>

                {softwareItems.map(({ key, label }) => (
                  <div key={key} className="grid grid-cols-[1fr_220px] border-b border-border">
                    <div className="p-2 text-xs border-r border-border">{label}</div>
                    <div className="p-2">
                      <Select value={computerLiteracy[key as keyof typeof computerLiteracy] || "NA"} onValueChange={(val) => !readOnly && setComputerLiteracy((prev) => ({ ...prev, [key]: val }))} disabled={readOnly}>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">—</SelectItem>
                          <SelectItem value="NA">NA</SelectItem>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-[1fr_220px] border-b border-border">
                  <div className="p-2 text-xs border-r border-border">Other Software (please specify)</div>
                  <div className="p-2">
                    <div className="flex gap-1">
                      <Input
                        placeholder="Software name"
                        value={otherSoftwareName}
                        onChange={(e) => !readOnly && setOtherSoftwareName(e.target.value)}
                        className="h-7 text-xs"
                        disabled={readOnly}
                      />
                      <Select
                        value={computerLiteracy.other_software_proficiency || "NA"}
                        onValueChange={(val) => !readOnly && setComputerLiteracy((prev) => ({ ...prev, other_software_proficiency: val }))}
                        disabled={readOnly}
                      >
                        <SelectTrigger className="h-7 text-xs w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">—</SelectItem>
                          <SelectItem value="NA">NA</SelectItem>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">III. PRESENT FUNCTIONS</div>

            <div className="p-3">
              <Textarea
                placeholder="Describe your present functions and responsibilities..."
                value={presentFunctions}
                onChange={(e) => !readOnly && setPresentFunctions(e.target.value)}
                disabled={readOnly}
              />
            </div>

            <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">IV. COMPETENT TO PERFORM</div>

            <div className="p-3">
              <Textarea
                placeholder="Describe tasks you are competent to perform..."
                value={competentToPerform}
                onChange={(e) => !readOnly && setCompetentToPerform(e.target.value)}
                disabled={readOnly}
              />
            </div>

            <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">V. DIFFICULT TO PERFORM</div>

            <div className="p-3">
              <Textarea
                placeholder="Describe tasks you find difficult to perform..."
                value={difficultToPerform}
                onChange={(e) => !readOnly && setDifficultToPerform(e.target.value)}
                disabled={readOnly}
              />
            </div>

            <div className="border-b border-border bg-secondary/40 px-3 py-2 text-sm font-semibold">VI. DESIRED TRAININGS (You are given sets of training categorized according to Main Topic. Please pick three top choices trainings and then among each set pick three top choices for each set applicable to your current position by ticking and ranking them accordingly Rank 1,2,3)</div>

            <div className="border-b border-border p-3 space-y-3">
              <div className="text-sm font-semibold">Choose 3 Main Topics</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {trainingChoices.map(({ topic }) => {
                  const checked = selectedTrainingTopics.includes(topic);
                  return (
                    <label key={topic} className="flex items-center gap-3 rounded border border-border p-3 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          if (readOnly) return;
                          const nextChecked = !!value;
                          if (nextChecked && !checked && selectedTrainingTopics.length >= 3) {
                            toast({
                              title: "Only Three Topics Allowed",
                              description: "You can only choose exactly three main topics.",
                              variant: "destructive",
                            });
                            return;
                          }

                          if (!nextChecked) {
                            const topicKeys = trainingChoices
                              .find((choice) => choice.topic === topic)
                              ?.items.map((item) => `${topic}::${item}`) || [];

                            setDesiredTrainings((prev) => {
                              const next = { ...prev };
                              topicKeys.forEach((key) => {
                                next[key] = { selected: false, rank: "" };
                              });
                              return next;
                            });
                          }

                          setSelectedTrainingTopics((prev) => nextChecked ? [...prev, topic] : prev.filter((item) => item !== topic));
                        }}
                        disabled={readOnly}
                      />
                      <span>{topic}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-3 space-y-6">
              {trainingChoices.filter(({ topic }) => selectedTrainingTopics.includes(topic)).map(({ topic, items }) => (
                <div key={topic}>
                  <div className="text-sm font-semibold mb-3">{topic}</div>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const key = `${topic}::${item}`;
                      const current = desiredTrainings[key] || { selected: false, rank: "" };
                      const topicSelectedCount = Object.entries(desiredTrainings || {}).filter(([k, v]) => k.startsWith(`${topic}::`) && v.selected).length;
                      return (
                        <div key={key} className="flex items-center gap-3 text-xs">
                          <Checkbox
                            checked={current.selected}
                            onCheckedChange={(checked) => {
                              if (readOnly) return;
                              const nextChecked = !!checked;
                              if (nextChecked && !current.selected && topicSelectedCount >= 3) {
                                toast({
                                  title: "Only Three Trainings Allowed",
                                  description: "You can only pick exactly three top choice trainings for this topic.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              setDesiredTrainings((prev) => ({ ...prev, [key]: { ...current, selected: nextChecked, rank: nextChecked ? current.rank : "" } }));
                            }}
                            disabled={readOnly}
                          />
                          <span className="flex-1">{item}</span>
                          <Select
                            value={current.rank}
                            onValueChange={(val) => {
                              if (readOnly) return;
                              const nextRank = val as "" | "1" | "2" | "3";
                              if (nextRank !== "") {
                                const prefix = `${topic}::`;
                                const rankTaken = Object.entries(desiredTrainings || {}).some(
                                  ([otherKey, value]) => otherKey !== key && otherKey.startsWith(prefix) && value.selected && value.rank === nextRank
                                );
                                if (rankTaken) {
                                  toast({
                                    title: "Rank Already Used",
                                    description: `Rank ${nextRank} is already assigned to another selected training in this topic.`,
                                    variant: "destructive",
                                  });
                                  return;
                                }
                              }
                              setDesiredTrainings((prev) => ({ ...prev, [key]: { ...current, rank: nextRank } }));
                            }}
                            disabled={readOnly || !current.selected}
                          >
                            <SelectTrigger className="w-20 h-7 text-xs">
                              <SelectValue placeholder="Rank" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">—</SelectItem>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3">
              <div className="text-sm font-semibold mb-2">Other Training Suggestions</div>
              <Textarea
                placeholder="Any other training suggestions or topics not covered above..."
                value={otherTrainingSuggestions}
                onChange={(e) => !readOnly && setOtherTrainingSuggestions(e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {!readOnly && (
            <>
              <Button variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
                {submitting ? "Submitting..." : "Submit SATNA"}
              </Button>
            </>
          )}
          {readOnly && (
            <Button onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SkillAuditDialog;
