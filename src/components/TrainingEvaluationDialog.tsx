import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Lock, Unlock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { evaluationService } from "@/services/evaluation";

type YesNo = "YES" | "NO";

interface TrainingEvaluationDialogProps {
  open: boolean;
  userId: number;
  courseId: number;
  traineeName: string;
  trainorTeacherName: string;
  trainingProgram: string;
  venue: string;
  dateOfConduct?: string;
  onSubmitted: () => void;
  onClose: () => void;
}

const TrainingEvaluationDialog = ({
  open,
  userId,
  courseId,
  traineeName,
  trainorTeacherName,
  trainingProgram,
  venue,
  dateOfConduct: dateOfConductProp,
  onSubmitted,
  onClose,
}: TrainingEvaluationDialogProps) => {
  const { toast } = useToast();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const ratingQuestions = useMemo(
    () => [
      "The training program helped me develop my skills and enhanced my knowledge in my current work/assignment.",
      "My expectations in the training program were met.",
      "The information is accurate and very interesting.",
      "The program followed a logical build-up of learning. There was a smooth transition of topics.",
      "Objectives/purpose of the training program were achieved.",
      "The training program addressed the current needs/concerns of the office/service/division/unit.",
      "Usefulness of the power point presentation/handouts/training materials.",
      "Duration of the training program",
      "Training materials such as laptops, internet connection, and others.",
      "Preparation/Coordination",
    ],
    []
  );

  const yesNoQuestions = useMemo(
    () => [
      "Was the training program worth attending/taking?",
      "Was the online training using Zoom conducive for learning?",
      "Would you recommend this training program to other PSA employees?",
    ],
    []
  );

  const [dateOfConduct] = useState(dateOfConductProp?.slice(0, 10) || today);
  const [officeServiceDivision] = useState(trainorTeacherName || "");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [yesno, setYesno] = useState<Record<string, YesNo>>({});
  const [comments1, setComments1] = useState("");
  const [comments2, setComments2] = useState("");
  const [comments3, setComments3] = useState("");

  const [level2q1, setLevel2q1] = useState("");
  const [level2q2, setLevel2q2] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const allRatingsComplete = ratingQuestions.every((_, idx) => !!ratings[`q${idx + 1}`]);
  const allYesNoComplete = yesNoQuestions.every((_, idx) => !!yesno[`y${idx + 1}`]);
  const allCommentsComplete = comments1.trim() && comments2.trim() && comments3.trim();

  const level1Complete = allRatingsComplete && allYesNoComplete && allCommentsComplete;
  const level2Complete = level2q1.trim() && level2q2.trim();
  const canSubmit =
    traineeName.trim() &&
    trainingProgram.trim() &&
    venue.trim() &&
    dateOfConduct.trim() &&
    level1Complete &&
    level2Complete;

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast({
        title: "Incomplete Form",
        description: "Please complete all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const result = await evaluationService.submit({
      user_id: userId,
      course_id: courseId,
      trainee_name: traineeName,
      office_service_division: officeServiceDivision,
      training_program: trainingProgram,
      topic: "",
      date_of_conduct: dateOfConduct,
      venue,
      training_objectives: "",
      ratings,
      yesno,
      comments_1: comments1,
      comments_2: comments2,
      comments_3: comments3,

      level2_q1: level2q1,
      level2_q2: level2q2,

      level3_q1: "",
      level3_q2: "",
      level3_q3: "",

      evaluated_by: "",
      evaluated_by_date: "",
      received_by: "",
      received_by_date: "",
    });
    setSubmitting(false);

    if (result.success) {
      toast({
        title: "Submitted",
        description: "Thank you. Your evaluation has been submitted.",
      });
      onSubmitted();
      return;
    }

    toast({
      title: "Error",
      description: result.message || "Failed to submit evaluation",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>HRD-L&D Evaluation Form</DialogTitle>
          <DialogDescription>For Workshop/Training Program</DialogDescription>
        </DialogHeader>

        <div className="border border-border rounded-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_180px_1fr]">
            <div className="p-3 text-sm font-medium bg-secondary border-r border-border">Name of Trainee</div>
            <div className="p-3 text-sm bg-background md:border-r border-border">{traineeName}</div>
            <div className="p-3 text-sm font-medium bg-secondary border-t border-border md:border-t-0 md:border-r border-border">
              Name of Trainor/Teacher
            </div>
            <div className="p-3 text-sm bg-background border-t border-border md:border-t-0">{officeServiceDivision || "-"}</div>
          </div>

          <div className="border-t border-border">
            <div className="grid grid-cols-[180px_1fr]">
              <div className="p-3 text-sm font-medium bg-secondary border-r border-border">Training Program</div>
              <div className="p-3 text-sm bg-background">{trainingProgram}</div>
            </div>
          </div>

          <div className="border-t border-border">
            <div className="grid grid-cols-[180px_1fr]">
              <div className="p-3 text-sm font-medium bg-secondary border-r border-border">Date of Conduct</div>
              <div className="p-3 text-sm bg-background">{dateOfConduct}</div>
            </div>
          </div>

          <div className="border-t border-border">
            <div className="grid grid-cols-[180px_1fr]">
              <div className="p-3 text-sm font-medium bg-secondary border-r border-border">Venue</div>
              <div className="p-3 text-sm bg-background">{venue}</div>
            </div>
          </div>
        </div>

        <Accordion type="multiple" defaultValue={["level1"]} className="mt-6">
          {/* Level I */}
          <AccordionItem value="level1" className="border border-border rounded-lg mb-4">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-3">
                {level1Complete ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Unlock className="w-5 h-5 text-blue-600" />
                )}
                <span className="text-base font-semibold">Level I - Training Evaluation</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                <div className="text-sm font-semibold mt-2">Instruction:</div>
                <div className="text-xs mb-4">
                  <p className="mb-2">
                    Please rate the training program with respect to the following attributes in relation to the 5-point scale indicated below. 
                    Select the rating that corresponds to your assessment. The highest possible rating for any item is <strong>5</strong> and the lowest is <strong>1</strong>.
                  </p>
                  <p>
                    The results of your responses will serve as our guide to continuously improve our training programs and services.
                  </p>
                </div>
                
                <div className="text-sm font-semibold mt-4">I.</div>
                <div className="text-xs text-muted-foreground mb-2">
                  <strong>5</strong>-Outstanding; <strong>4</strong>-Very Satisfactory; <strong>3</strong>-Satisfactory; <strong>2</strong>-Needs Improvement; <strong>1</strong>-Poor
                </div>
                <div className="text-sm font-medium mb-2">Areas of Evaluation</div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[40px_1fr_repeat(5,52px)] bg-secondary/50 text-xs font-medium">
                    <div className="p-2 border-r border-border">#</div>
                    <div className="p-2 border-r border-border">Statement</div>
                    <div className="p-2 border-r border-border text-center">5</div>
                    <div className="p-2 border-r border-border text-center">4</div>
                    <div className="p-2 border-r border-border text-center">3</div>
                    <div className="p-2 border-r border-border text-center">2</div>
                    <div className="p-2 text-center">1</div>
                  </div>

                  {ratingQuestions.map((q, idx) => {
                    const key = `q${idx + 1}`;
                    return (
                      <div key={key} className="grid grid-cols-[40px_1fr_repeat(5,52px)] text-sm">
                        <div className="p-2 border-t border-r border-border text-xs text-muted-foreground">{idx + 1}</div>
                        <div className="p-2 border-t border-r border-border text-xs">{q}</div>
                        {[5, 4, 3, 2, 1].map((score, sIdx) => (
                          <div
                            key={score}
                            className={`p-2 border-t border-border ${sIdx < 4 ? "border-r" : ""} border-border flex items-center justify-center`}
                          >
                            <input
                              type="radio"
                              name={key}
                              checked={ratings[key] === score}
                              onChange={() => setRatings((prev) => ({ ...prev, [key]: score }))}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                <div className="text-sm font-semibold mt-6">II. Please select your response for each item below.</div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[40px_1fr_90px_90px] bg-secondary/50 text-xs font-medium">
                    <div className="p-2 border-r border-border">#</div>
                    <div className="p-2 border-r border-border">Question</div>
                    <div className="p-2 border-r border-border text-center">YES</div>
                    <div className="p-2 text-center">NO</div>
                  </div>

                  {yesNoQuestions.map((q, idx) => {
                    const key = `y${idx + 1}`;
                    return (
                      <div key={key} className="grid grid-cols-[40px_1fr_90px_90px]">
                        <div className="p-2 border-t border-r border-border text-xs text-muted-foreground">{idx + 1}</div>
                        <div className="p-2 border-t border-r border-border text-xs">{q}</div>
                        <div className="p-2 border-t border-r border-border flex justify-center">
                          <input
                            type="radio"
                            name={key}
                            checked={yesno[key] === "YES"}
                            onChange={() => setYesno((prev) => ({ ...prev, [key]: "YES" }))}
                          />
                        </div>
                        <div className="p-2 border-t border-border flex justify-center">
                          <input
                            type="radio"
                            name={key}
                            checked={yesno[key] === "NO"}
                            onChange={() => setYesno((prev) => ({ ...prev, [key]: "NO" }))}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-sm font-semibold mt-6">III.</div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-medium">1. What are the things that you appreciate most about this new mode of conducting training?</div>
                    <Textarea className="mt-2" value={comments1} onChange={(e) => setComments1(e.target.value)} />
                  </div>
                  <div>
                    <div className="text-xs font-medium">2. What are the things that should be improved in this training program?</div>
                    <Textarea className="mt-2" value={comments2} onChange={(e) => setComments2(e.target.value)} />
                  </div>
                  <div>
                    <div className="text-xs font-medium">3. Other comments/suggestions/reactions/recommendations regarding the training program.</div>
                    <Textarea className="mt-2" value={comments3} onChange={(e) => setComments3(e.target.value)} />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Level II */}
          <AccordionItem value="level2" className="border border-border rounded-lg mb-4">
            <AccordionTrigger className="px-4 hover:no-underline" disabled={!level1Complete}>
              <div className="flex items-center gap-3">
                {!level1Complete ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : level2Complete ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Unlock className="w-5 h-5 text-blue-600" />
                )}
                <span className="text-base font-semibold">Level II - Action Plan After Training</span>
                {!level1Complete && <span className="text-xs text-muted-foreground ml-2">(Complete Level I first)</span>}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                <div className="text-sm font-semibold mt-2">Action Plan After Training</div>
                <div className="space-y-4 mt-3">
                  <div>
                    <div className="text-xs font-medium">
                      1. What significant learning/s did you gain from the training that you can apply to your current or future role in PSA and how?
                    </div>
                    <Textarea className="mt-2" value={level2q1} onChange={(e) => setLevel2q1(e.target.value)} disabled={!level1Complete} />
                  </div>
                  <div>
                    <div className="text-xs font-medium">
                      2. Among those learning/s, what are the things that you need to improve and how?
                    </div>
                    <Textarea className="mt-2" value={level2q2} onChange={(e) => setLevel2q2(e.target.value)} disabled={!level1Complete} />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

                  </Accordion>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit} disabled={submitting || !canSubmit}>
            {submitting ? "Submitting..." : "Submit Evaluation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingEvaluationDialog;
