import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { teacherRatingService, TeacherRatingRecord } from "@/services/teacherRating";

interface TeacherRatingDialogProps {
  open: boolean;
  userId: number;
  courseId: number;
  courseName: string;
  teacherId: number;
  teacherName: string;
  onSubmitted: (rating: TeacherRatingRecord) => void;
  onClose: () => void;
}

const TeacherRatingDialog = ({
  open,
  userId,
  courseId,
  courseName,
  teacherId,
  teacherName,
  onSubmitted,
  onClose,
}: TeacherRatingDialogProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      const result = await teacherRatingService.getStatus(userId, courseId, teacherId);
      if (result.success && result.rating) {
        setRating(result.rating.rating);
        setComment(result.rating.comment || "");
        setAlreadySubmitted(true);
      } else {
        setRating(0);
        setComment("");
        setAlreadySubmitted(false);
      }
      setLoading(false);
    };

    load();
  }, [open, userId, courseId, teacherId]);

  const handleSubmit = async () => {
    if (!rating) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const result = await teacherRatingService.submit({
      user_id: userId,
      course_id: courseId,
      teacher_id: teacherId,
      rating,
      comment,
    });
    setSubmitting(false);

    if (!result.success) {
      toast({
        title: "Submission failed",
        description: result.message || "Failed to save teacher rating.",
        variant: "destructive",
      });
      return;
    }

    const refreshed = await teacherRatingService.getStatus(userId, courseId, teacherId);
    if (refreshed.success && refreshed.rating) {
      onSubmitted(refreshed.rating);
    }

    toast({
      title: "Rating saved",
      description: "Your teacher rating has been submitted successfully.",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Rate Teacher</DialogTitle>
          <DialogDescription>
            Share your feedback for `{teacherName}` in `{courseName}`.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading rating...</div>
        ) : (
          <div className="space-y-5">
            {alreadySubmitted && (
              <div className="rounded border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
                You already submitted a rating for this teacher in this course.
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-foreground mb-1">Teacher</div>
              <div className="text-sm text-muted-foreground">{teacherName}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-foreground mb-2">Star Rating</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => !alreadySubmitted && setRating(star)}
                    className="p-1"
                    disabled={alreadySubmitted}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-foreground mb-2">Comment</div>
              <Textarea
                placeholder="Share feedback about the teacher's delivery, clarity, and support."
                value={comment}
                onChange={(e) => !alreadySubmitted && setComment(e.target.value)}
                disabled={alreadySubmitted}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || submitting || !rating || alreadySubmitted}>
            {submitting ? "Saving..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherRatingDialog;
