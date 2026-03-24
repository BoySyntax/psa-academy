import { useState, useEffect } from "react";
import { FileQuestion, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import TestManagementDialog from "./TestManagementDialog";
import { ModuleTest, moduleTestsService, TestType } from "@/services/moduleTests";

interface CourseTestsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  firstModuleId: number | null;
  onTestUpdated: () => void;
}

const CourseTestsDialog = ({
  isOpen,
  onClose,
  courseId,
  firstModuleId,
  onTestUpdated,
}: CourseTestsDialogProps) => {
  const { toast } = useToast();
  const [preTest, setPreTest] = useState<ModuleTest | undefined>(undefined);
  const [postTest, setPostTest] = useState<ModuleTest | undefined>(undefined);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testType, setTestType] = useState<TestType>("pre_test");
  const [existingTest, setExistingTest] = useState<ModuleTest | undefined>(undefined);

  useEffect(() => {
    if (isOpen && firstModuleId) {
      loadTests();
    }
  }, [isOpen, firstModuleId]);

  const loadTests = async () => {
    if (!firstModuleId) return;
    const result = await moduleTestsService.getModuleTests(firstModuleId);
    if (result.success) {
      const tests = result.tests as ModuleTest[];
      setPreTest(tests.find((t) => t.test_type === "pre_test"));
      setPostTest(tests.find((t) => t.test_type === "post_test"));
    }
  };

  const openTestManager = (type: TestType, existing?: ModuleTest) => {
    setTestType(type);
    setExistingTest(existing);
    setTestDialogOpen(true);
  };

  const handleTestUpdated = async () => {
    await loadTests();
    onTestUpdated();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Course Tests</DialogTitle>
            <DialogDescription>
              Create or manage the Pre-Test and Post-Test for this course.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="pre-test" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pre-test">Pre-Test</TabsTrigger>
              <TabsTrigger value="post-test">Post-Test</TabsTrigger>
            </TabsList>

            <TabsContent value="pre-test" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                The Pre-Test is typically taken at the start of the course.
              </div>
              <Button
                onClick={() => openTestManager("pre_test", preTest)}
                className="w-full"
                variant="outline"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                {preTest ? "Manage Pre-Test" : "Create Pre-Test"}
              </Button>
            </TabsContent>

            <TabsContent value="post-test" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                The Post-Test is typically taken at the end of the course.
              </div>
              <Button
                onClick={() => openTestManager("post_test", postTest)}
                className="w-full"
                variant="outline"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                {postTest ? "Manage Post-Test" : "Create Post-Test"}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {firstModuleId && (
        <TestManagementDialog
          isOpen={testDialogOpen}
          onClose={() => setTestDialogOpen(false)}
          moduleId={firstModuleId}
          moduleName="Course Test"
          testType={testType}
          existingTest={existingTest}
          onTestUpdated={handleTestUpdated}
        />
      )}
    </>
  );
};

export default CourseTestsDialog;
