
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AddCredentialForm } from "./AddCredentialForm";
import { CredentialCard } from "./CredentialCard";
import { CredentialDetailCard } from "./CredentialDetailCard";

interface LLMCredential {
  id: string;
  credential_name: string;
  provider_id: string;
  is_active: boolean;
  is_default: boolean;
  test_status: string | null;
  last_used_at: string | null;
  created_at: string;
  provider: {
    id: string;
    name: string;
    display_name: string;
    icon_url: string | null;
  };
}

interface LLMCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LLMCredentialsDialog = ({ open, onOpenChange }: LLMCredentialsDialogProps) => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<LLMCredential[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredentials = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_llm_credentials')
        .select(`
          id,
          credential_name,
          provider_id,
          is_active,
          is_default,
          test_status,
          last_used_at,
          created_at,
          provider:llm_providers(
            id,
            name,
            display_name,
            icon_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      fetchCredentials();
    }
  }, [open, user]);

  const handleCredentialAdded = () => {
    setShowAddForm(false);
    fetchCredentials();
  };

  const handleCredentialClick = (credentialId: string) => {
    setSelectedCredential(selectedCredential === credentialId ? null : credentialId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto rounded-2xl backdrop-blur-xl bg-slate-900/95 border border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl text-white">
            <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
              <Key className="h-5 w-5 text-cyan-400" />
            </div>
            LLM Credentials
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Add New Credential Button */}
          <div className="flex justify-between items-center">
            <p className="text-slate-400">
              Manage your API keys and credentials for various LLM providers
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 rounded-xl font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Credential
            </Button>
          </div>

          {/* Add Credential Form */}
          {showAddForm && (
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <AddCredentialForm
                onSuccess={handleCredentialAdded}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}

          {/* Credentials List */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="text-slate-400 mt-4">Loading credentials...</p>
              </div>
            ) : credentials.length === 0 ? (
              <div className="p-12 bg-white/5 rounded-2xl text-center border border-white/10">
                <div className="p-4 bg-cyan-500/20 rounded-2xl w-fit mx-auto mb-6 border border-cyan-500/30">
                  <Key className="h-8 w-8 text-cyan-400" />
                </div>
                <p className="text-slate-400 font-medium">
                  No credentials added yet. Add your first LLM API key to get started.
                </p>
              </div>
            ) : (
              credentials.map((credential) => (
                <div key={credential.id} className="space-y-4">
                  <CredentialCard
                    credential={credential}
                    onClick={() => handleCredentialClick(credential.id)}
                    isExpanded={selectedCredential === credential.id}
                  />
                  {selectedCredential === credential.id && (
                    <CredentialDetailCard credential={credential} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
