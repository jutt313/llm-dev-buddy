
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Key, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TokenGenerationForm } from "./TokenGenerationForm";
import { TokenDisplayModal } from "./TokenDisplayModal";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";

// Use the Supabase type and extend it
type PersonalToken = Database['public']['Tables']['personal_tokens']['Row'] & {
  permissions: {
    llm: string[];
    agent: string[];
    project: string[];
    cli: string[];
  };
};

interface PersonalTokensDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PersonalTokensDialog = ({ open, onOpenChange }: PersonalTokensDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tokens, setTokens] = useState<PersonalToken[]>([]);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<{ token: string; tokenData: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedToken, setExpandedToken] = useState<string | null>(null);

  const fetchTokens = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('personal_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tokens:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tokens",
          variant: "destructive",
        });
        return;
      }
      
      // Cast the permissions to the expected type
      const typedTokens = (data || []).map(token => ({
        ...token,
        permissions: token.permissions as {
          llm: string[];
          agent: string[];
          project: string[];
          cli: string[];
        }
      }));
      
      setTokens(typedTokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tokens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      fetchTokens();
    }
  }, [open, user]);

  const handleTokenGenerated = (result: { token: string; tokenData: any }) => {
    setGeneratedToken(result);
    setShowGenerateForm(false);
    fetchTokens();
  };

  const handleRevokeToken = async (tokenId: string) => {
    try {
      const { error } = await supabase
        .from('personal_tokens')
        .update({ is_active: false })
        .eq('id', tokenId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error revoking token:', error);
        toast({
          title: "Error",
          description: "Failed to revoke token",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Token revoked successfully",
      });
      
      fetchTokens();
    } catch (error) {
      console.error('Error revoking token:', error);
      toast({
        title: "Error",
        description: "Failed to revoke token",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Token prefix copied to clipboard",
    });
  };

  const getStatusColor = (token: PersonalToken) => {
    if (!token.is_active) return "text-red-400";
    if (token.expires_at && new Date(token.expires_at) < new Date()) return "text-red-400";
    if (!token.last_used_at) return "text-yellow-400";
    return "text-green-400";
  };

  const getStatusText = (token: PersonalToken) => {
    if (!token.is_active) return "Revoked";
    if (token.expires_at && new Date(token.expires_at) < new Date()) return "Expired";
    if (!token.last_used_at) return "Unused";
    return "Active";
  };

  const formatPermissions = (permissions: PersonalToken['permissions']) => {
    const perms = [];
    if (permissions.llm?.length > 0) perms.push(`LLM (${permissions.llm.length})`);
    if (permissions.agent?.length > 0) perms.push(`Agent (${permissions.agent.length})`);
    if (permissions.project?.length > 0) perms.push(`Project (${permissions.project.length})`);
    if (permissions.cli?.length > 0) perms.push(`CLI (${permissions.cli.length})`);
    return perms.join(', ') || 'No permissions';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto rounded-2xl backdrop-blur-xl bg-slate-900/95 border border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl text-white">
              <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                <Key className="h-5 w-5 text-cyan-400" />
              </div>
              Personal Tokens
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <p className="text-slate-400">
                Generate and manage CXI_ tokens for CLI and API access
              </p>
              <Button
                onClick={() => setShowGenerateForm(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 rounded-xl font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate New Token
              </Button>
            </div>

            {/* Generate Form */}
            {showGenerateForm && (
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <TokenGenerationForm
                  onSuccess={handleTokenGenerated}
                  onCancel={() => setShowGenerateForm(false)}
                />
              </div>
            )}

            {/* Tokens List */}
            <div className="space-y-4">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                  <p className="text-slate-400 mt-4">Loading tokens...</p>
                </div>
              ) : tokens.length === 0 ? (
                <div className="p-12 bg-white/5 rounded-2xl text-center border border-white/10">
                  <div className="p-4 bg-cyan-500/20 rounded-2xl w-fit mx-auto mb-6 border border-cyan-500/30">
                    <Key className="h-8 w-8 text-cyan-400" />
                  </div>
                  <p className="text-slate-400 font-medium">
                    No tokens created yet. Generate your first CXI_ token to get started.
                  </p>
                </div>
              ) : (
                tokens.map((token) => (
                  <div key={token.id} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">{token.token_name}</h3>
                          <span className={`text-sm font-medium ${getStatusColor(token)}`}>
                            {getStatusText(token)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="font-mono">{token.token_prefix.substring(0, 12)}...</span>
                          <span>{formatPermissions(token.permissions)}</span>
                          <span>
                            {token.last_used_at 
                              ? `Last used: ${new Date(token.last_used_at).toLocaleDateString()}`
                              : 'Never used'
                            }
                          </span>
                          {token.expires_at && (
                            <span>
                              Expires: {new Date(token.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(token.token_prefix)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedToken(expandedToken === token.id ? null : token.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {expandedToken === token.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        {token.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeToken(token.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {expandedToken === token.id && (
                      <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/5">
                        <h4 className="text-white font-medium mb-3">Permissions:</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(token.permissions).map(([category, perms]) => (
                            <div key={category}>
                              <h5 className="text-cyan-400 font-medium capitalize mb-1">{category}:</h5>
                              {Array.isArray(perms) && perms.length > 0 ? (
                                <ul className="text-sm text-slate-300 space-y-1">
                                  {perms.map((perm) => (
                                    <li key={perm}>• {perm}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-slate-500">No permissions</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Token Display Modal */}
      <TokenDisplayModal 
        open={!!generatedToken}
        onOpenChange={(open) => !open && setGeneratedToken(null)}
        tokenData={generatedToken}
      />
    </>
  );
};
