import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { motion, AnimatePresence } from 'framer-motion';

type AuthView = 'login' | 'register' | 'forgot-password';

interface AuthContainerProps {
  onLoginSuccess: (accessToken: string) => void;
  projectId: string;
  publicAnonKey: string;
}

export function AuthContainer({ onLoginSuccess, projectId, publicAnonKey }: AuthContainerProps) {
  const [view, setView] = useState<AuthView>('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"
                />
              </svg>
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold">Grand Hotel Resort</h1>
          <p className="text-muted-foreground mt-2">Sistem Reservasi Hotel</p>
        </div>

        <AnimatePresence mode="wait">
          {view === 'login' && (
            <LoginForm
              key="login"
              onSuccess={onLoginSuccess}
              onSwitchToRegister={() => setView('register')}
              onSwitchToForgotPassword={() => setView('forgot-password')}
              projectId={projectId}
              publicAnonKey={publicAnonKey}
            />
          )}
          {view === 'register' && (
            <RegisterForm
              key="register"
              onSuccess={() => setView('login')}
              onSwitchToLogin={() => setView('login')}
              projectId={projectId}
              publicAnonKey={publicAnonKey}
            />
          )}
          {view === 'forgot-password' && (
            <ForgotPasswordForm
              key="forgot-password"
              onBack={() => setView('login')}
              projectId={projectId}
              publicAnonKey={publicAnonKey}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}