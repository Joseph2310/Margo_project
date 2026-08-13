import type { NavigatorScreenParams } from '@react-navigation/native';
import type { VerificationMode } from './auth';

export type MainTabParamList = {
  Home: undefined;
  Retreat: undefined;
  House: undefined;
  Profile: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  BiometricLogin: { mode: 'fingerprint' | 'face' };
  Register: undefined;
  Verification: { mode: VerificationMode; email: string };
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Events: undefined;
  DailyReading: undefined;
  QuestionCategories: undefined;
  QuestionList: { categoryId: string };
  AddQuestion: undefined;
  Reflection: undefined;
  Suggestions: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Chat: { conversationId: string };
  Notifications: undefined;
};
