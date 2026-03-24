import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  moduleTestsService,
  ModuleTest,
  TestQuestion,
  StudentAnswer,
} from "@/services/moduleTests";

interface StudentTestTakingProps {
  moduleId: number;
  moduleName: string;
  studentId: number;
  testType: "pre_test" | "post_test";
  onTestCompleted?: () => void;
  onClose?: () => void;
}

const StudentTestTaking = ({
  moduleId,
  moduleName,
  studentId,
  testType,
  onTestCompleted,
  onClose,
}: StudentTestTakingProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<ModuleTest | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: StudentAnswer }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    passed: boolean;
    earned_points: number;
    total_points: number;
  } | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    loadTest();
  }, [moduleId, studentId, testType]);

  const loadTest = async () => {
    setLoading(true);
    const testsResult = await moduleTestsService.getModuleTestsForStudent(moduleId, studentId);
    
    if (testsResult.success) {
      const moduleTest = testsResult.tests.find((t: any) => t.test_type === testType);
      
      if (moduleTest) {
        const testResult = await moduleTestsService.getTestForStudent(moduleTest.id, studentId);
        
        if (testResult.success) {
          setTest(testResult.test);

          if (testResult.test?.completed_attempt) {
            const ca = testResult.test.completed_attempt;
            setSubmitted(true);
            setResults({
              score: Number(ca.score || 0),
              passed: !!Number(ca.passed),
              earned_points: 0,
              total_points: 0,
            });
          }
          
          if (testResult.test.active_attempt_id) {
            setAttemptId(testResult.test.active_attempt_id);
            setStartTime(new Date(testResult.test.started_at));
          }
        }
      }
    }
    
    setLoading(false);
  };

  const handleStartTest = async () => {
    if (!test) return;
    
    const result = await moduleTestsService.startTestAttempt(test.id, studentId);
    
    if (result.success) {
      setAttemptId(result.attempt_id!);
      setStartTime(new Date());
      toast({
        title: "Test Started",
        description: "Good luck!",
      });
    } else if ((result as any).already_completed && (result as any).attempt_id) {
      const attemptId = Number((result as any).attempt_id);
      const attemptResult = await moduleTestsService.getAttemptResults(attemptId);
      if (attemptResult.success) {
        setSubmitted(true);
        setResults({
          score: Number(attemptResult.attempt.score || 0),
          passed: !!Number(attemptResult.attempt.passed),
          earned_points: 0,
          total_points: 0,
        });
      }
      toast({
        title: "Already Completed",
        description: "You can only take this test once. Showing your saved result.",
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleAnswerChange = (questionId: number, selectedAnswerId?: number, answerText?: string) => {
    setAnswers({
      ...answers,
      [questionId]: {
        question_id: questionId,
        selected_answer_id: selectedAnswerId,
        answer_text: answerText,
      },
    });
  };

  const handleSubmitTest = async () => {
    if (!attemptId || !test) return;

    const answerArray = Object.values(answers);
    
    if (answerArray.length < (test.questions?.length || 0)) {
      toast({
        title: "Incomplete Test",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await moduleTestsService.submitTestAnswers(attemptId, answerArray);
    
    if (result.success) {
      setSubmitted(true);
      setResults({
        score: result.score!,
        passed: result.passed!,
        earned_points: result.earned_points!,
        total_points: result.total_points!,
      });
      
      toast({
        title: result.passed ? "Test Passed!" : "Test Completed",
        description: `You scored ${result.score}%`,
        variant: result.passed ? "default" : "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading test...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No {testType === "pre_test" ? "pre-test" : "post-test"} available for this module.
        </p>
        {onClose && (
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        )}
      </div>
    );
  }

  if (submitted && results) {
    const handleContinue = () => {
      if (onTestCompleted) onTestCompleted();
      if (onClose) onClose();
    };

    return (
      <div className="p-8">
        <div className="text-center mb-8">
          {results.passed ? (
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          )}
          <h2 className="text-2xl font-bold mb-2">
            {results.passed ? "Congratulations!" : "Test Completed"}
          </h2>
          <p className="text-muted-foreground mb-4">
            You scored {results.score.toFixed(1)}%
            {results.total_points > 0 ? ` (${results.earned_points}/${results.total_points} points)` : ''}
          </p>
          <Badge variant={results.passed ? "default" : "destructive"} className="text-lg px-4 py-2">
            {results.passed ? "PASSED" : "FAILED"}
          </Badge>
          <p className="text-sm text-muted-foreground mt-4">
            Passing score: {test.passing_score}%
          </p>
        </div>
        
        {onClose && (
          <div className="text-center">
            <Button onClick={handleContinue}>Continue</Button>
          </div>
        )}
      </div>
    );
  }

  if (!attemptId) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{test.test_title}</h2>
          {test.description && (
            <p className="text-muted-foreground mb-4">{test.description}</p>
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {test.questions?.length || 0} Questions
              </Badge>
              <Badge variant="outline">
                Passing Score: {test.passing_score}%
              </Badge>
              {test.time_limit_minutes && (
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {test.time_limit_minutes} minutes
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="bg-secondary/30 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Answer all questions to the best of your ability</li>
            <li>You can change your answers before submitting</li>
            <li>Make sure to submit your test when finished</li>
            {test.time_limit_minutes && (
              <li>You have {test.time_limit_minutes} minutes to complete this test</li>
            )}
          </ul>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleStartTest} size="lg">
            Start Test
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="lg">
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions?.[currentQuestionIndex];
  const totalQuestions = test.questions?.length || 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionNavigate = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const isQuestionAnswered = (questionId: number) => {
    return !!answers[questionId]?.selected_answer_id;
  };

  const answeredCount = Object.values(answers).filter((a) => !!a?.selected_answer_id).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="flex h-full bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-secondary/30 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{test.test_title}</h2>
              <p className="text-sm text-muted-foreground">
                {moduleName} - {testType === "pre_test" ? "Pre-Test" : "Post-Test"}
              </p>
            </div>
            {startTime && test.time_limit_minutes && (
              <Badge variant="outline" className="text-base">
                <Clock className="w-4 h-4 mr-2" />
                Time Remaining
              </Badge>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>
                {answeredCount} of {totalQuestions} answered
              </span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {currentQuestion && (
            <div className="max-w-3xl">
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="text-base px-3 py-1">Question {currentQuestionIndex + 1}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {isQuestionAnswered(currentQuestion.id) ? "Answered" : "Not yet answered"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Points out of {currentQuestion.points}
                </p>
              </div>

              {/* Question Text */}
              <div className="bg-card border border-border p-6 mb-6 rounded">
                <p className="text-lg font-medium text-foreground">
                  {currentQuestion.question_text}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Select one:</p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.answers?.map((answer: any, idx: number) => (
                  (() => {
                    const isSelected = answers[currentQuestion.id]?.selected_answer_id === answer.id;
                    return (
                  <label
                    key={answer.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors bg-background hover:bg-accent/40 ${
                      isSelected ? "border-primary bg-primary/10" : "border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={answer.id}
                      checked={isSelected}
                      onChange={() => handleAnswerChange(currentQuestion.id, answer.id)}
                      className="w-5 h-5 mt-0.5 accent-primary"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-foreground mr-2">
                        {String.fromCharCode(97 + idx)}.
                      </span>
                      <span className="text-foreground">{answer.answer_text}</span>
                    </div>
                  </label>
                    );
                  })()
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="border-t bg-background px-6 py-4">
          <div className="flex justify-between items-center max-w-3xl">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {isLastQuestion ? (
              <Button onClick={handleSubmitTest} disabled={loading}>
                Finish attempt ...
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Navigation Sidebar */}
      <div className="w-80 border-l bg-secondary/10 p-6">
        <h3 className="font-semibold mb-4">Quiz navigation</h3>
        
        <div className="grid grid-cols-5 gap-2 mb-6">
          {test.questions?.map((question: TestQuestion, index: number) => (
            <button
              key={question.id}
              onClick={() => handleQuestionNavigate(index)}
              className={`w-10 h-10 rounded border-2 font-medium transition-colors ${
                currentQuestionIndex === index
                  ? 'bg-primary text-primary-foreground border-primary'
                  : isQuestionAnswered(question.id)
                  ? 'bg-green-500/15 border-green-500/40 text-green-700 dark:text-green-400'
                  : 'bg-background border-border text-foreground hover:bg-accent'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <Button
          onClick={handleSubmitTest}
          disabled={loading}
          className="w-full"
          variant="default"
        >
          Finish attempt ...
        </Button>

        <div className="mt-4 text-sm text-muted-foreground">
          {answeredCount} of {totalQuestions} questions answered
        </div>
      </div>
    </div>
  );
};

export default StudentTestTaking;
