import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BiometricLoginScreen } from '../screens/auth/BiometricLoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { VerificationScreen } from '../screens/auth/VerificationScreen';
import { ChatScreen } from '../screens/conversations/ChatScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { DailyReadingScreen } from '../screens/home/DailyReadingScreen';
import { NotificationsScreen } from '../screens/more/NotificationsScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { AddQuestionScreen } from '../screens/questions/AddQuestionScreen';
import { QuestionCategoriesScreen } from '../screens/questions/QuestionCategoriesScreen';
import { QuestionListScreen } from '../screens/questions/QuestionListScreen';
import { ReflectionScreen } from '../screens/retreat/ReflectionScreen';
import { SuggestionsScreen } from '../screens/suggestions/SuggestionsScreen';
import type { RootStackParamList } from '../types/navigation';
import { MainTabs } from './MainTabs';
import { useAppSelector } from '../store/hooks';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { hasCompletedSplash, isAuthenticated } = useAppSelector(
    state => state.auth,
  );
  return (
    <NavigationContainer direction="rtl">
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'slide_from_left' }}>
        {!hasCompletedSplash ? (
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ animation: 'fade' }}
          />
        ) : isAuthenticated ? (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Events" component={EventsScreen} />
            <Stack.Screen name="DailyReading" component={DailyReadingScreen} />
            <Stack.Screen
              name="QuestionCategories"
              component={QuestionCategoriesScreen}
            />
            <Stack.Screen name="QuestionList" component={QuestionListScreen} />
            <Stack.Screen name="AddQuestion" component={AddQuestionScreen} />
            <Stack.Screen name="Reflection" component={ReflectionScreen} />
            <Stack.Screen name="Suggestions" component={SuggestionsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
            />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="BiometricLogin"
              component={BiometricLoginScreen}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
