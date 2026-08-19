// mobile/src/store/providers.tsx
import React from 'react';
import { TamaguiProvider } from 'tamagui';
import config from '../../../tamagui.config';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      {children}
    </TamaguiProvider>
  );
}
