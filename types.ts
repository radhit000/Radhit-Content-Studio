import React from 'react';

export interface ProcessedImage {
  id: string;
  original: string; // Store the first image or a collage as preview
  result: string | null;
  prompt: string;
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  link?: string;
  linkText?: string;
}

export interface FeatureItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  systemPrompt: string;
  placeholder: string;
  quickPrompts?: string[];
  allowMultiUpload?: boolean; // New: Support for Join/Composite features
  description?: string; // New: Short explanation of the tool
  exampleImage?: string; // New: URL to an example result
}

export interface FeatureCategory {
  title: string;
  items: FeatureItem[];
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '2x3' | '3x4' | '4x6' | '4R' | '5R' | '10R';

// --- AUTH TYPES ---

export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  uid?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: number;
  customApiKey?: string; // Optional: User's own API Key
}

// --- SETTINGS TYPES ---

export interface AppSettings {
  appName: string;
  appTagline: string;
  themeColor: string; // Hex Code
  defaultApiKey: string; // System-wide fallback key set by Admin
  enableSecurity: boolean; // "Compile"/Protect mode (disable right click/F12)
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}