
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Key, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TokenDisplayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenData: { token: string; tokenData: any } | null;
}

export const TokenDisplayModal = ({ open, onOpenChange, tokenData }: TokenDisplayModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setConfirmed(false);
    }
  }, [open]);

  const copyToClipboard = async () => {
    if (!tokenData?.token) return;
    
    try {
      await navigator.clipboard.writeText(tokenData.token);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Token copied to clipboard",
      });
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy token",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (!confirmed) {
      toast({
        title: "Warning",
        description: "Please confirm you've saved the token before closing",
        variant: "destructive",
      });
      return;
    }
    onOpenChange(false);
  };

  if (!tokenData) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl rounded-2xl backdrop-blur-xl bg-slate-900/95 border border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl text-white">
            <div className="p-2 bg-green-500/20 rounded-xl border border-green-500/30">
              <Key className="h-5 w-5 text-green-400" />
            </div>
            Token Generated Successfully
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Warning */}
          <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
              <div>
                <h3 className="text-amber-400 font-semibold mb-1">Important Security Notice</h3>
                <p className="text-amber-200 text-sm">
                  This token will only be shown once. Save it securely and never share it with anyone.
                  If you lose this token, you'll need to generate a new one.
                </p>
              </div>
            </div>
          </div>

          {/* Token Display */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Your CXI Token:</h3>
            <div className="p-4 bg-black/30 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <p className="text-cyan-400 font-mono text-lg break-all">
                    {tokenData.token}
                  </p>
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className={`transition-colors ${
                    copied 
                      ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                      : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">How to use this token:</h3>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="text-cyan-400 font-medium">CLI Authentication:</h4>
                  <code className="text-slate-300 bg-black/30 px-2 py-1 rounded mt-1 block">
                    cxi auth login --token {tokenData.token}
                  </code>
                </div>
                <div>
                  <h4 className="text-cyan-400 font-medium">API Headers:</h4>
                  <code className="text-slate-300 bg-black/30 px-2 py-1 rounded mt-1 block">
                    Authorization: Bearer {tokenData.token}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Token Details */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Token Details:</h3>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Name:</span>
                  <p className="text-white">{tokenData.tokenData.token_name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Created:</span>
                  <p className="text-white">
                    {new Date(tokenData.tokenData.created_at).toLocaleDateString()}
                  </p>
                </div>
                {tokenData.tokenData.expires_at && (
                  <div>
                    <span className="text-slate-400">Expires:</span>
                    <p className="text-white">
                      {new Date(tokenData.tokenData.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Format:</span>
                  <p className="text-white">CXI_ + 32 characters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="confirmed"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-cyan-500"
              />
              <label htmlFor="confirmed" className="text-white text-sm cursor-pointer">
                I have safely saved this token and understand it won't be shown again
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                disabled={!confirmed}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 disabled:opacity-50"
              >
                I've Saved It Safely
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
