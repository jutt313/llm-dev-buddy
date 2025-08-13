
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TestTube, X, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Provider {
  id: string;
  name: string;
  display_name: string;
}

interface Model {
  id: string;
  name: string;
  display_name: string;
}

interface TestResult {
  success: boolean;
  error: string;
  response: string;
}

interface AddCredentialFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddCredentialForm = ({ onSuccess, onCancel }: AddCredentialFormProps) => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [formData, setFormData] = useState({
    credentialName: '',
    providerId: '',
    modelName: '',
    apiKey: ''
  });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (formData.providerId) {
      fetchModels(formData.providerId);
    } else {
      setModels([]);
      setFormData(prev => ({ ...prev, modelName: '' }));
    }
  }, [formData.providerId]);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('llm_providers')
        .select('*')
        .eq('is_active', true)
        .order('display_name');

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to load providers');
    }
  };

  const fetchModels = async (providerId: string) => {
    try {
      const { data, error } = await supabase
        .from('llm_models')
        .select('*')
        .eq('provider_id', providerId)
        .eq('is_active', true)
        .order('display_name');

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Failed to load models');
    }
  };

  const testCredential = async () => {
    if (!formData.apiKey || !formData.providerId) {
      toast.error('Please fill in all required fields');
      return false;
    }

    setTesting(true);
    setTestResult(null);
    
    try {
      const provider = providers.find(p => p.id === formData.providerId);
      
      const { data, error } = await supabase.functions.invoke('test-llm-credential', {
        body: {
          provider: provider?.name,
          apiKey: formData.apiKey,
          model: formData.modelName
        }
      });

      if (error) throw error;

      setTestResult(data);

      if (data.success) {
        toast.success('API key test successful!');
        return true;
      } else {
        toast.error(`Test failed: ${data.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error testing credential:', error);
      toast.error('Failed to test credential');
      setTestResult({ success: false, error: 'Network error', response: '' });
      return false;
    } finally {
      setTesting(false);
    }
  };

  const saveCredential = async () => {
    if (!user) {
      toast.error('You must be logged in to save credentials');
      return;
    }

    if (!formData.credentialName || !formData.providerId || !formData.apiKey) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_llm_credentials')
        .insert({
          user_id: user.id,
          credential_name: formData.credentialName,
          provider_id: formData.providerId,
          api_key_encrypted: formData.apiKey, // In production, this should be encrypted
          test_status: testResult?.success ? 'passed' : 'pending',
          last_test_at: testResult?.success ? new Date().toISOString() : null,
          is_active: true,
          is_default: false
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      toast.success('Credential saved successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error saving credential:', error);
      toast.error(`Failed to save credential: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCredential();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Add New Credential</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="credentialName" className="text-white">Credential Name</Label>
          <Input
            id="credentialName"
            placeholder="e.g., My OpenAI Key"
            value={formData.credentialName}
            onChange={(e) => setFormData(prev => ({ ...prev, credentialName: e.target.value }))}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="provider" className="text-white">Provider</Label>
          <Select
            value={formData.providerId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, providerId: value }))}
            required
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id} className="text-white">
                  {provider.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model" className="text-white">Model (Optional)</Label>
          <Select
            value={formData.modelName}
            onValueChange={(value) => setFormData(prev => ({ ...prev, modelName: value }))}
            disabled={!formData.providerId}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Select model (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              {models.map((model) => (
                <SelectItem key={model.id} value={model.name} className="text-white">
                  {model.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey" className="text-white">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your API key"
            value={formData.apiKey}
            onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
            required
          />
        </div>
      </div>

      {/* Test Result Display */}
      {testResult && (
        <div className={`p-4 rounded-xl border ${
          testResult.success 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {testResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400" />
            )}
            <span className={`font-medium ${
              testResult.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {testResult.success ? 'Test Successful' : 'Test Failed'}
            </span>
          </div>
          
          {testResult.response && (
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-sm text-slate-300 mb-1">API Response:</p>
              <p className="text-white text-sm font-mono">{testResult.response}</p>
            </div>
          )}
          
          {testResult.error && (
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-sm text-slate-300 mb-1">Error:</p>
              <p className="text-red-400 text-sm">{testResult.error}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={testCredential}
          disabled={testing || !formData.apiKey || !formData.providerId}
          className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
        >
          {testing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <TestTube className="h-4 w-4 mr-2" />
          )}
          Test Connection
        </Button>

        <Button
          type="submit"
          disabled={saving || !formData.credentialName || !formData.providerId || !formData.apiKey}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            'Save Credential'
          )}
        </Button>
      </div>
    </form>
  );
};
