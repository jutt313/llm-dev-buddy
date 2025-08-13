import { useState } from "react";
import { 
  User, 
  Settings, 
  Key, 
  FileText, 
  Terminal, 
  CreditCard, 
  LogOut 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LLMCredentialsDialog } from "@/components/llm/LLMCredentialsDialog";
import { PersonalTokensDialog } from "@/components/tokens/PersonalTokensDialog";

const ProfileDropdown = () => {
  const { user, signOut } = useAuth();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    {
      id: "agents",
      label: "Agent Documentation",
      icon: FileText,
      description: "Custom AI agent configurations"
    },
    {
      id: "cli",
      label: "CLI Setup Guide",
      icon: Terminal,
      description: "Set up the command line interface"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "Account and application settings"
    }
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-3 p-3 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <Avatar className="h-9 w-9 ring-2 ring-cyan-400/30">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold">
                {user?.email?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-white">
                {user?.user_metadata?.full_name || "User"}
              </span>
              <span className="text-xs text-slate-400">
                {user?.email}
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 rounded-2xl border-white/10 backdrop-blur-xl bg-slate-900/95" align="end">
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-white">
                {user?.user_metadata?.full_name || "User"}
              </p>
              <p className="text-xs leading-none text-slate-400">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          
          {/* LLM Credentials */}
          <DropdownMenuItem
            onClick={() => setActiveDialog("credentials")}
            className="cursor-pointer m-1 rounded-xl hover:bg-white/10 focus:bg-white/10 text-white"
          >
            <Key className="mr-3 h-4 w-4 text-cyan-400" />
            <span className="font-medium">LLM Credentials</span>
          </DropdownMenuItem>

          {/* Personal Tokens */}
          <DropdownMenuItem
            onClick={() => setActiveDialog("tokens")}
            className="cursor-pointer m-1 rounded-xl hover:bg-white/10 focus:bg-white/10 text-white"
          >
            <CreditCard className="mr-3 h-4 w-4 text-cyan-400" />
            <span className="font-medium">Personal Tokens</span>
          </DropdownMenuItem>
          
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => setActiveDialog(item.id)}
              className="cursor-pointer m-1 rounded-xl hover:bg-white/10 focus:bg-white/10 text-white"
            >
              <item.icon className="mr-3 h-4 w-4 text-cyan-400" />
              <span className="font-medium">{item.label}</span>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem 
            onClick={handleSignOut} 
            className="cursor-pointer text-red-400 m-1 rounded-xl hover:bg-red-500/20 focus:bg-red-500/20"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="font-medium">Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* LLM Credentials Dialog */}
      <LLMCredentialsDialog 
        open={activeDialog === "credentials"} 
        onOpenChange={(open) => !open && setActiveDialog(null)}
      />

      {/* Personal Tokens Dialog */}
      <PersonalTokensDialog 
        open={activeDialog === "tokens"} 
        onOpenChange={(open) => !open && setActiveDialog(null)}
      />

      {/* Other dialogs */}
      {menuItems.map((item) => (
        <Dialog 
          key={item.id} 
          open={activeDialog === item.id} 
          onOpenChange={(open) => !open && setActiveDialog(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto rounded-2xl backdrop-blur-xl bg-slate-900/95 border border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl text-white">
                <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                  <item.icon className="h-5 w-5 text-cyan-400" />
                </div>
                {item.label}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-6">
              <p className="text-slate-400 mb-6">
                {item.description}
              </p>
              <div className="p-12 bg-white/5 rounded-2xl text-center border border-white/10">
                <div className="p-4 bg-cyan-500/20 rounded-2xl w-fit mx-auto mb-6 border border-cyan-500/30">
                  <item.icon className="h-8 w-8 text-cyan-400" />
                </div>
                <p className="text-slate-400 font-medium">
                  {item.label} interface will be implemented here
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
};

export default ProfileDropdown;
