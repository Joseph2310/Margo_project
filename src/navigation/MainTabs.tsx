import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBar } from '../components/navigation/BottomTabBar';
import { HouseScreen } from '../screens/conversations/HouseScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { MoreScreen } from '../screens/more/MoreScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { RetreatScreen } from '../screens/retreat/RetreatScreen';
import type { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();
const renderTabBar = (props: Parameters<typeof BottomTabBar>[0]) => (
  <BottomTabBar {...props} />
);

export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, animation: 'shift' }}
      tabBar={renderTabBar}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Retreat" component={RetreatScreen} />
      <Tab.Screen name="House" component={HouseScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
