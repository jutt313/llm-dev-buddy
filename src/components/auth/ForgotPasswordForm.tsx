
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

export const ForgotPasswordForm = ({ onBackToSignIn }: ForgotPasswordFormProps) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    
    const { error } = await resetPassword(email);
    
    if (error) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to send reset email');
    } else {
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    }
    
    setLoading(false);
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
          <Mail className="h-8 w-8 text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Check Your Email</h2>
          <p className="text-slate-400">
            We've sent a password reset link to <span className="text-cyan-400">{email}</span>
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-slate-400 text-sm">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          
          <Button
            onClick={onBackToSignIn}
            variant="outline"
            className="w-full border-white/10 text-slate-300 hover:bg-white/5 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Reset Password</h2>
        <p className="text-slate-400 mt-1">Enter your email to receive a reset link</p>
      </div>

      <div>
        <Label htmlFor="email" className="text-slate-300">Email Address</Label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:border-cyan-400 focus:ring-cyan-400/20"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl py-3 font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200"
        disabled={loading}
      >
        {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
      </Button>

      <Button
        type="button"
        onClick={onBackToSignIn}
        variant="ghost"
        className="w-full text-slate-400 hover:text-slate-300 hover:bg-white/5 rounded-xl"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Sign In
      </Button>
    </form>
  );
};
