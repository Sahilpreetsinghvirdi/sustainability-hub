// mobile/src/components/TabBarIcon.tsx
import React from 'react';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';

type IconComponent = typeof Ionicons | typeof MaterialIcons | typeof Entypo;

export interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
  iconName: string;
  iconComponent: IconComponent;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({
  focused,
  color,
  size,
  iconName,
  iconComponent: Icon,
}) => <Icon name={iconName} size={size} color={color} weight={focused ? '600' : '400'} />;