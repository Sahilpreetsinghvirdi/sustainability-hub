import React from 'react';

export interface TabBarIconProps { focused: boolean; color: string; size: number; iconName: string; iconComponent: React.ComponentType<any> }

export const TabBarIcon: React.FC<TabBarIconProps> = ({ color, size, iconName, iconComponent: Icon }) => <Icon name={iconName} size={size} color={color} />;
