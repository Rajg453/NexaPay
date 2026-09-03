import React from 'react';
import { Slot } from 'expo-router';

export default function AppTabs() {
  // We use Slot here instead of Tabs for the web platform 
  // so that the default Expo Starter web header is completely removed.
  return <Slot />;
}
