
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

const ProfileDropdown = () => {
  const { user, signOut } = useAuth();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    {
      id: "credentials",
      label: "LLM Credentials",
      icon: Key,
      description: "Manage your API keys and credentials"
    },
    {
      id: "tokens",
      label: "Personal Tokens",
      icon: CreditCard,
      description: "Generate and manage CLI access tokens"
    },
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
          <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {user?.email?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {user?.user_metadata?.full_name || "User"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email}
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.user_metadata?.full_name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => setActiveDialog(item.id)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog for each menu item */}
      {menuItems.map((item) => (
        <Dialog 
          key={item.id} 
          open={activeDialog === item.id} 
          onOpenChange={(open) => !open && setActiveDialog(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <item.icon className="h-5 w-5" />
                {item.label}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {item.description}
              </p>
              <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">
                <item.icon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">
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
