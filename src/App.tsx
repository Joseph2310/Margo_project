import '../global.css';
import { StatusBar } from 'react-native';
import { RootNavigator } from './navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';
import { colors } from './theme/tokens';

export default function App() {
  return (
    <AppProviders>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <RootNavigator />
    </AppProviders>
  );
}
