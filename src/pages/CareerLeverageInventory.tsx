import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { careerLeverageInventoryService } from "@/services/careerLeverageInventory";
import {
  careerLeverageItems,
  careerLeverageResponseOptions,
  InventoryValue,
} from "@/data/careerLeverageInventory";

interface CareerLeverageInventoryProps {
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const CareerLeverageInventory = ({ user, onNavigate }: CareerLeverageInventoryProps) => {
  const { toast } = useToast();
  const year = useMemo(() => new Date().getFullYear(), []);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, InventoryValue>>({});

  const completedCount = useMemo(() => {
    return careerLeverageItems.reduce((count, _item, index) => {
      return answers[index + 1] ? count + 1 : count;
    }, 0);
  }, [answers]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await careerLeverageInventoryService.getStatus(user.id, year);
      if (result.success) {
        setIsSubmitted(!!result.submitted);
        if (result.submitted && result.cli?.answers) {
          setAnswers(result.cli.answers);
          setSubmittedAt(result.cli?._meta?.submitted_at || null);
        }
      }
      setLoading(false);
    };
    load();
  }, [user.id, year]);

  const formatSubmittedAt = (dt?: string | null) => {
    if (!dt) return "";
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return String(dt);
    return d.toLocaleString();
  };

  const handleSubmit = async () => {
    if (completedCount !== careerLeverageItems.length) {
      toast({
        title: "Incomplete Form",
        description: `Please answer all ${careerLeverageItems.length} questions before submitting.`,
        variant: "destructive",
      });
      return;
    }

    const payload = {
      user_id: user.id,
      year,
      answers,
    };

    setSubmitting(true);
    const result = await careerLeverageInventoryService.submit(payload);
    setSubmitting(false);

    if (result.success) {
      setIsSubmitted(true);
      toast({
        title: "Submitted",
        description: `Your Career Leverage Inventory for ${year} has been submitted.`,
      });
      if (result.cli?.answers) {
        setAnswers(result.cli.answers);
      }
      return;
    }

    toast({
      title: "Error",
      description: result.message || "Failed to submit Career Leverage Inventory",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <ClipboardList className="w-6 h-6" />
                Career Leverage Inventory
              </h1>
              <p className="text-muted-foreground">
                Formal 35-item inventory for {user.firstName} {user.lastName} • {year}
              </p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("student-assessments")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card p-6"
        >
          <div className="space-y-2">
            <div className="text-lg font-semibold text-foreground">CAREER LEVERAGE INVENTORY</div>
            {isSubmitted ? (
              <p className="text-sm text-muted-foreground">
                Submitted: {formatSubmittedAt(submittedAt) || "—"}
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Read each item carefully and select the response that best describes your present career preference.
                </p>
                <p className="text-sm text-muted-foreground">
                  Completed: {completedCount} / {careerLeverageItems.length}
                </p>
              </>
            )}
          </div>
        </motion.div>

        {!isSubmitted && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
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
                      return (
                        <tr key={itemNumber} className="align-top">
                          <td className="border border-border p-3 text-sm font-medium leading-snug">
                            {itemNumber}. {item}
                          </td>
                          {careerLeverageResponseOptions.map((option) => {
                            const selected = answers[itemNumber] === option.value;
                            return (
                              <td key={`${itemNumber}-${option.value}`} className="border border-border p-0 text-center">
                                <button
                                  type="button"
                                  onClick={() => setAnswers((prev) => ({ ...prev, [itemNumber]: option.value }))}
                                  className={`w-full min-h-[64px] text-lg font-bold transition-colors ${selected ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-accent"}`}
                                  aria-label={`Item ${itemNumber} ${option.label}`}
                                  disabled={loading}
                                >
                                  {option.short}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <div className="flex justify-end gap-3 pb-8">
              <Button onClick={handleSubmit} disabled={loading || submitting || completedCount !== careerLeverageItems.length}>
                {loading ? "Loading..." : submitting ? "Submitting..." : "Submit CLI"}
              </Button>
            </div>
          </>
        )}

        {isSubmitted && (
          <div className="pb-8" />
        )}
      </div>
    </div>
  );
};

export default CareerLeverageInventory;
