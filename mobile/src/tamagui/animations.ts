// mobile/src/tamagui/animations.ts
import { createAnimations } from '@tamagui/animations-react-native';

export const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  spring: {
    type: 'spring',
    damping: 15,
    stiffness: 150,
  },
  smooth: {
    type: 'timing',
    duration: 300,
    easing: 'easeOut',
  },
  faster: {
    type: 'timing',
    duration: 150,
    easing: 'easeOut',
  },
  slow: {
    type: 'timing',
    duration: 500,
    easing: 'easeOut',
  },
  fade: {
    type: 'timing',
    duration: 200,
    easing: 'easeIn',
  },
  slideUp: {
    type: 'spring',
    damping: 20,
    stiffness: 200,
  },
  slideDown: {
    type: 'spring',
    damping: 25,
    stiffness: 200,
  },
  scale: {
    type: 'spring',
    damping: 15,
    stiffness: 200,
  },
  press: {
    type: 'spring',
    damping: 10,
    stiffness: 300,
  },
});