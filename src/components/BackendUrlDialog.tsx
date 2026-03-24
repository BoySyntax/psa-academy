import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Settings } from "lucide-react";

interface BackendUrlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
}

const BackendUrlDialog = ({ isOpen, onClose, onSave }: BackendUrlDialogProps) => {
  const [backendUrl, setBackendUrl] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // Try to get saved URL from localStorage
    const saved = localStorage.getItem('psa_backend_url');
    if (saved) {
      setBackendUrl(saved);
    }
  }, []);

  const handleTest = async () => {
    if (!backendUrl) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const testUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
      const response = await fetch(`${testUrl}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'test', password: 'test' }),
      });
      
      if (response.status === 400 || response.status === 401) {
        setTestResult("✅ Backend is reachable (got expected auth error)");
      } else {
        setTestResult(`Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      setTestResult(`❌ Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (backendUrl) {
      localStorage.setItem('psa_backend_url', backendUrl);
      onSave(backendUrl);
      onClose();
    }
  };

  const handleClear = () => {
    localStorage.removeItem('psa_backend_url');
    setBackendUrl('');
    onSave('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Backend Configuration
          </DialogTitle>
          <DialogDescription>
            This app needs to connect to your backend server.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Since you're using Cloudflare Pages, your backend must be accessible from the internet.
              <br /><br />
              Options:
              <br />• Use ngrok: <code>https://xxxx.ngrok-free.app</code>
              <br />• Use Cloudflare Tunnel
              <br />• Use a hosted backend
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="backend-url">Backend URL</Label>
            <Input
              id="backend-url"
              placeholder="https://xxxx-xx-xx-xx-xx.ngrok-free.app"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Include the full URL with https://
            </p>
          </div>

          {testResult && (
            <div className={`p-3 rounded text-sm ${testResult.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult}
            </div>
          )}

          <div className="flex gap-2 flex-col">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleTest} 
                disabled={!backendUrl || isTesting}
                className="flex-1"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button onClick={handleSave} disabled={!backendUrl}>
                Save & Continue
              </Button>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleClear}
              size="sm"
            >
              Clear Backend URL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackendUrlDialog;
