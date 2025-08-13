
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface TokenGenerationFormProps {
  onSuccess: (result: { token: string; tokenData: any }) => void;
  onCancel: () => void;
}

const PERMISSION_OPTIONS = {
  llm: [
    { value: 'use-custom', label: 'Use Custom LLM Credentials' },
    { value: 'use-default', label: 'Use Default/System LLMs' },
    { value: 'manage', label: 'Manage LLM Credentials' },
  ],
  agent: [
    { value: 'create', label: 'Create New AI Agents' },
    { value: 'use-custom', label: 'Use Your Custom Agents' },
    { value: 'use-default', label: 'Use Default/Public Agents' },
    { value: 'manage', label: 'Manage Agent Configurations' },
  ],
  project: [
    { value: 'read', label: 'View Projects & Data' },
    { value: 'write', label: 'Create/Modify Projects' },
    { value: 'delete', label: 'Delete Projects' },
  ],
  cli: [
    { value: 'execute', label: 'Execute CLI Commands' },
    { value: 'deploy', label: 'Deploy via CLI' },
    { value: 'sync', label: 'Sync Data via CLI' },
  ],
};

export const TokenGenerationForm = ({ onSuccess, onCancel }: TokenGenerationFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    tokenName: '',
    expiration: '90', // days
    permissions: {
      llm: [] as string[],
      agent: [] as string[],
      project: [] as string[],
      cli: [] as string[],
    }
  });
  const [loading, setLoading] = useState(false);

  const handlePermissionChange = (category: keyof typeof formData.permissions, permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: checked 
          ? [...prev.permissions[category], permission]
          : prev.permissions[category].filter(p => p !== permission)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tokenName.trim()) {
      toast({
        title: "Error",
        description: "Token name is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.tokenName.length > 50) {
      toast({
        title: "Error",
        description: "Token name must be less than 50 characters",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one permission is selected
    const hasPermissions = Object.values(formData.permissions).some(perms => perms.length > 0);
    if (!hasPermissions) {
      toast({
        title: "Error",
        description: "Please select at least one permission",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Calculate expiration date
      let expiresAt = null;
      if (formData.expiration !== 'never') {
        const days = parseInt(formData.expiration);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);
        expiresAt = expirationDate.toISOString();
      }

      const { data, error } = await supabase.functions.invoke('generate-personal-token', {
        body: {
          tokenName: formData.tokenName.trim(),
          permissions: formData.permissions,
          expiresAt
        }
      });

      if (error) {
        console.error('Token generation error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to generate token",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Token generated successfully",
      });

      onSuccess(data);
    } catch (error) {
      console.error('Token generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate token",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Generate New Token</h3>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-slate-400 hover:text-white"
        >
          Cancel
        </Button>
      </div>

      {/* Token Name */}
      <div className="space-y-2">
        <Label htmlFor="tokenName" className="text-white">Token Name</Label>
        <Input
          id="tokenName"
          value={formData.tokenName}
          onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
          placeholder="e.g., My CLI Access Token"
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          maxLength={50}
        />
        <p className="text-xs text-slate-500">{formData.tokenName.length}/50 characters</p>
      </div>

      {/* Expiration */}
      <div className="space-y-2">
        <Label className="text-white">Expiration</Label>
        <Select value={formData.expiration} onValueChange={(value) => setFormData(prev => ({ ...prev, expiration: value }))}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/10">
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="365">1 year</SelectItem>
            <SelectItem value="never">Never expires</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Permissions */}
      <div className="space-y-4">
        <Label className="text-white">Permissions</Label>
        
        {Object.entries(PERMISSION_OPTIONS).map(([category, options]) => (
          <div key={category} className="space-y-3">
            <h4 className="text-cyan-400 font-medium capitalize">{category} Permissions</h4>
            <div className="grid grid-cols-1 gap-3 pl-4">
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${category}-${option.value}`}
                    checked={formData.permissions[category as keyof typeof formData.permissions].includes(option.value)}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(category as keyof typeof formData.permissions, option.value, checked as boolean)
                    }
                    className="border-white/20 data-[state=checked]:bg-cyan-500"
                  />
                  <Label 
                    htmlFor={`${category}-${option.value}`}
                    className="text-sm text-slate-300 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
        >
          {loading ? 'Generating...' : 'Generate Token'}
        </Button>
      </div>
    </form>
  );
};
