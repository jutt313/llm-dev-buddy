
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
          <button className="flex items-center space-x-3 p-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-primary-foreground font-semibold">
                {user?.email?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-foreground">
                {user?.user_metadata?.full_name || "User"}
              </span>
              <span className="text-xs text-muted-foreground/70">
                {user?.email}
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 rounded-2xl border-border/50 bg-card/95 backdrop-blur-sm" align="end">
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-foreground">
                {user?.user_metadata?.full_name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground/70">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/50" />
          
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() => setActiveDialog(item.id)}
              className="cursor-pointer m-1 rounded-xl hover:bg-primary/10 focus:bg-primary/10"
            >
              <item.icon className="mr-3 h-4 w-4 text-primary" />
              <span className="font-medium">{item.label}</span>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem 
            onClick={handleSignOut} 
            className="cursor-pointer text-red-600 dark:text-red-400 m-1 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="font-medium">Sign out</span>
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
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto rounded-2xl bg-card/95 backdrop-blur-sm border-border/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                {item.label}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-6">
              <p className="text-muted-foreground mb-6">
                {item.description}
              </p>
              <div className="p-12 bg-accent/30 rounded-2xl text-center border border-border/30">
                <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-6 border border-primary/20">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">
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
