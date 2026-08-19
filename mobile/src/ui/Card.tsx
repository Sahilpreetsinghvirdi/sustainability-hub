// mobile/src/ui/Card.tsx
import React from 'react';
import { Stack, styled } from 'tamagui';

export const Card = styled(Stack, {
  backgroundColor: '#1E293B',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#334155',
  padding: 16,

  variants: {
    variant: {
      default: {},
      elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
      outlined: {
        borderWidth: 2,
        borderColor: '#475569',
        backgroundColor: 'transparent',
      },
      filled: {
        backgroundColor: '#0F172A',
        borderWidth: 0,
      },
    },
  } as any,
});
