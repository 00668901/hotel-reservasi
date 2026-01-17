import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSupabaseClient } from '../../utils/supabase/client';

interface ForgotPasswordFormProps {
  onBack: () => void;
  projectId: string;
  publicAnonKey: string;
}

export function ForgotPasswordForm({ onBack, projectId, publicAnonKey }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError('Gagal mengirim email reset password. Pastikan email Anda terdaftar.');
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Email Terkirim!</h3>
              <p className="text-muted-foreground">
                Kami telah mengirim link reset password ke <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Silakan cek inbox email Anda dan klik link untuk reset password.
              </p>
            </div>
            <Button onClick={onBack} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Login
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-fit -ml-2"
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <CardTitle className="text-2xl text-center">Lupa Password?</CardTitle>
          <CardDescription className="text-center">
            Masukkan email Anda dan kami akan mengirim link untuk reset password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Link reset password akan dikirim ke email Anda. Link ini berlaku selama 1 jam.
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim Email...
                </>
              ) : (
                'Kirim Link Reset Password'
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </motion.div>
  );
}