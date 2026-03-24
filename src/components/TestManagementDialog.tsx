import { useState, useEffect } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  moduleTestsService,
  ModuleTest,
  TestType,
  QuestionType,
  TestQuestion,
  CreateQuestionData,
} from "@/services/moduleTests";

interface TestManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: number;
  moduleName: string;
  testType: TestType;
  existingTest?: ModuleTest;
  onTestUpdated: () => void;
}

interface QuestionForm {
  question_text: string;
  question_type: QuestionType;
  points: number;
  answers: {
    answer_text: string;
    is_correct: boolean;
  }[];
}

const TestManagementDialog = ({
  isOpen,
  onClose,
  moduleId,
  moduleName,
  testType,
  existingTest,
  onTestUpdated,
}: TestManagementDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testId, setTestId] = useState<number | null>(existingTest?.id || null);
  const [testTitle, setTestTitle] = useState(
    existingTest?.test_title || (testType === "pre_test" ? "Pre-Test" : "Post-Test")
  );
  const [description, setDescription] = useState(existingTest?.description || "");
  const [passingScore, setPassingScore] = useState(existingTest?.passing_score || 70);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>(
    existingTest?.time_limit_minutes || undefined
  );
  const [isPublished, setIsPublished] = useState(existingTest?.is_published || false);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState<QuestionForm>({
    question_text: "",
    question_type: "multiple_choice",
    points: 1,
    answers: [
      { answer_text: "", is_correct: false },
      { answer_text: "", is_correct: false },
    ],
  });

  useEffect(() => {
    if (isOpen) {
      if (existingTest) {
        setTestId(existingTest.id);
        setTestTitle(existingTest.test_title);
        setDescription(existingTest.description || "");
        setPassingScore(existingTest.passing_score);
        setTimeLimitMinutes(existingTest.time_limit_minutes || undefined);
        setIsPublished(existingTest.is_published);
        loadTestQuestions(existingTest.id);
      } else {
        // Reset for new test
        setTestId(null);
        setTestTitle(testType === "pre_test" ? "Pre-Test" : "Post-Test");
        setDescription("");
        setPassingScore(70);
        setTimeLimitMinutes(undefined);
        setIsPublished(false);
        setQuestions([]);
      }
    }
  }, [isOpen, existingTest, testType]);

  const loadTestQuestions = async (id: number) => {
    const result = await moduleTestsService.getTestQuestions(id);
    if (result.success) {
      setQuestions(result.questions);
    }
  };

  const handleCreateOrUpdateTest = async () => {
    setLoading(true);
    
    if (testId) {
      const result = await moduleTestsService.updateTest({
        id: testId,
        test_title: testTitle,
        description,
        passing_score: passingScore,
        time_limit_minutes: timeLimitMinutes,
        is_published: isPublished,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Test updated successfully",
        });
        onTestUpdated();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } else {
      const result = await moduleTestsService.createTest({
        module_id: moduleId,
        test_type: testType,
        test_title: testTitle,
        description,
        passing_score: passingScore,
        time_limit_minutes: timeLimitMinutes,
        is_published: isPublished,
      });

      if (result.success) {
        setTestId(result.test_id!);
        toast({
          title: "Success",
          description: "Test created successfully",
        });
        onTestUpdated();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    }
    
    setLoading(false);
  };

  const handleAddQuestion = async () => {
    if (!testId) {
      toast({
        title: "Error",
        description: "Please save the test first before adding questions",
        variant: "destructive",
      });
      return;
    }

    if (!newQuestion.question_text.trim()) {
      toast({
        title: "Error",
        description: "Question text is required",
        variant: "destructive",
      });
      return;
    }

    const hasCorrectAnswer = newQuestion.answers.some((a) => a.is_correct);
    if (newQuestion.question_type !== "short_answer" && !hasCorrectAnswer) {
      toast({
        title: "Error",
        description: "Please mark at least one answer as correct",
        variant: "destructive",
      });
      return;
    }

    const result = await moduleTestsService.createQuestion({
      test_id: testId,
      question_text: newQuestion.question_text,
      question_type: newQuestion.question_type,
      points: newQuestion.points,
      order_index: questions.length + 1,
      answers: newQuestion.answers.filter((a) => a.answer_text.trim()),
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Question added successfully",
      });
      loadTestQuestions(testId);
      setNewQuestion({
        question_text: "",
        question_type: "multiple_choice",
        points: 1,
        answers: [
          { answer_text: "", is_correct: false },
          { answer_text: "", is_correct: false },
        ],
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    const result = await moduleTestsService.deleteQuestion(questionId);
    if (result.success) {
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
      if (testId) loadTestQuestions(testId);
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const addAnswerOption = () => {
    setNewQuestion({
      ...newQuestion,
      answers: [...newQuestion.answers, { answer_text: "", is_correct: false }],
    });
  };

  const removeAnswerOption = (index: number) => {
    setNewQuestion({
      ...newQuestion,
      answers: newQuestion.answers.filter((_, i) => i !== index),
    });
  };

  const updateAnswer = (index: number, field: "answer_text" | "is_correct", value: string | boolean) => {
    const updatedAnswers = [...newQuestion.answers];
    updatedAnswers[index] = { ...updatedAnswers[index], [field]: value };
    setNewQuestion({ ...newQuestion, answers: updatedAnswers });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {testType === "pre_test" ? "Pre-Test" : "Post-Test"} for {moduleName}
          </DialogTitle>
          <DialogDescription>
            Create and manage test questions for this module
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Test Settings */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold">Test Settings</h3>
            <div>
              <label className="text-sm font-medium">Test Title</label>
              <Input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g., Module 1 Pre-Test"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this test"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Passing Score (%)</label>
                <Input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Time Limit (minutes, optional)</label>
                <Input
                  type="number"
                  value={timeLimitMinutes || ""}
                  onChange={(e) => setTimeLimitMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                  placeholder="No limit"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <label htmlFor="is_published" className="text-sm font-medium">
                Publish test (students can take it)
              </label>
            </div>
            <Button onClick={handleCreateOrUpdateTest} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {testId ? "Update Test Settings" : "Create Test"}
            </Button>
          </div>

          {/* Existing Questions */}
          {testId && questions.length > 0 && (
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold">Questions ({questions.length})</h3>
              {questions.map((question, index) => (
                <div key={question.id} className="p-4 border rounded-lg bg-secondary/20">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>Q{index + 1}</Badge>
                        <Badge variant="outline">{question.question_type}</Badge>
                        <Badge variant="outline">{question.points} pts</Badge>
                      </div>
                      <p className="font-medium">{question.question_text}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  {question.answers && question.answers.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {question.answers.map((answer) => (
                        <div
                          key={answer.id}
                          className={`text-sm p-2 rounded border border-border ${
                            answer.is_correct
                              ? "bg-green-500/10 text-green-600"
                              : "bg-background text-foreground"
                          }`}
                        >
                          {answer.is_correct && "✓ "}
                          {answer.answer_text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Question */}
          {testId && (
            <div className="space-y-4">
              <h3 className="font-semibold">Add New Question</h3>
              <div>
                <label className="text-sm font-medium">Question Text</label>
                <Textarea
                  value={newQuestion.question_text}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, question_text: e.target.value })
                  }
                  placeholder="Enter your question..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Points</label>
                <Input
                  type="number"
                  value={newQuestion.points}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })
                  }
                  min="1"
                />
              </div>

              <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Answer Options</label>
                    <Button size="sm" variant="outline" onClick={addAnswerOption}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newQuestion.answers.map((answer, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={answer.answer_text}
                          onChange={(e) => updateAnswer(index, "answer_text", e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={answer.is_correct}
                            onChange={(e) => updateAnswer(index, "is_correct", e.target.checked)}
                            id={`correct-${index}`}
                          />
                          <label htmlFor={`correct-${index}`} className="text-sm">
                            Correct
                          </label>
                        </div>
                        {newQuestion.answers.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAnswerOption(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              <Button onClick={handleAddQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestManagementDialog;
