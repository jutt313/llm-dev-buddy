
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CredentialCardProps {
  credential: {
    id: string;
    credential_name: string;
    provider: {
      display_name: string;
    };
    test_status: string | null;
    is_active: boolean;
    is_default: boolean;
    last_used_at: string | null;
    created_at: string;
  };
  onClick: () => void;
  isExpanded: boolean;
}

export const CredentialCard = ({ credential, onClick, isExpanded }: CredentialCardProps) => {
  const getStatusIcon = () => {
    switch (credential.test_status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusColor = () => {
    switch (credential.test_status) {
      case 'passed':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'failed':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  const getStatusText = () => {
    switch (credential.test_status) {
      case 'passed':
        return 'Verified';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      onClick={onClick}
      className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-cyan-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-slate-400" />
            )}
            <div>
              <h3 className="font-semibold text-white">{credential.credential_name}</h3>
              <p className="text-sm text-slate-400">{credential.provider.display_name}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {credential.is_default && (
            <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Default
            </Badge>
          )}
          
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">
              {credential.last_used_at ? `Last used ${formatDate(credential.last_used_at)}` : 'Never used'}
            </p>
            <p className="text-xs text-slate-500">
              Added {formatDate(credential.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
