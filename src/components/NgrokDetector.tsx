import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { setNgrokUrl, getCurrentNgrokUrl } from "@/utils/ngrok-helper";

interface NgrokDetectorProps {
  children: React.ReactNode;
}

const NgrokDetector = ({ children }: NgrokDetectorProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [ngrokUrl, setNgrokUrlState] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we're on a new device without proper ngrok setup
    const checkNgrokSetup = () => {
      const currentUrl = getCurrentNgrokUrl();
      const url = new URL(window.location.href);
      
      // If no ngrok URL is configured and we're not on localhost
      if (!currentUrl && !url.hostname.includes('localhost')) {
        setShowDialog(true);
      }
    };

    checkNgrokSetup();
  }, [navigate]);

  const handleSaveNgrokUrl = () => {
    if (ngrokUrl.trim()) {
      // Ensure URL has protocol
      let normalizedUrl = ngrokUrl.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }
      
      setNgrokUrl(normalizedUrl);
      setShowDialog(false);
      // Refresh to apply changes
      window.location.reload();
    }
  };

  const handleAutoDetect = () => {
    // Try to auto-detect from current URL if it's ngrok
    const url = new URL(window.location.href);
    if (url.hostname.includes('.ngrok-')) {
      const detectedUrl = `${url.protocol}//${url.hostname}`;
      setNgrokUrlState(detectedUrl);
    }
  };

  if (!showDialog) {
    return <>{children}</>;
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Ngrok Setup Required
          </DialogTitle>
          <DialogDescription>
            This app needs to connect to a backend running through ngrok. Please provide the ngrok URL.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              If you're seeing a ngrok warning page, the URL should look like:
              <br />
              <code className="text-xs bg-gray-100 px-1 rounded">
                https://xxxx-xx-xx-xx-xx.ngrok-free.app
              </code>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="ngrok-url">Ngrok URL</Label>
            <div className="flex gap-2">
              <Input
                id="ngrok-url"
                placeholder="https://xxxx.ngrok-free.app"
                value={ngrokUrl}
                onChange={(e) => setNgrokUrlState(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoDetect}
                title="Auto-detect from current URL"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNgrokUrl}>
              Save & Reload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NgrokDetector;
