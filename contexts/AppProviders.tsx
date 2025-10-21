import React from 'react';
import { FirebaseConfigProvider } from './FirebaseConfigContext';
import { LanguageProvider } from './LanguageContext';
import { ThemeProvider } from './ThemeContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Combines all context providers in the correct order
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <FirebaseConfigProvider>
      <LanguageProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </LanguageProvider>
    </FirebaseConfigProvider>
  );
}
