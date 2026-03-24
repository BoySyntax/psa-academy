import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import BackendUrlDialog from "./BackendUrlDialog";

const BackendUrlButton = () => {
  const [showDialog, setShowDialog] = useState(false);

  const handleSave = () => {
    window.location.reload();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        Backend URL
      </Button>
      <BackendUrlDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSave={handleSave}
      />
    </>
  );
};

export default BackendUrlButton;
