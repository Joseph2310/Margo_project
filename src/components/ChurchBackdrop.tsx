import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { colors } from '../theme/tokens';

export function ChurchBackdrop() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 375 812"
      preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="church" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.churchTop} />
          <Stop offset="1" stopColor={colors.churchBottom} />
        </LinearGradient>
      </Defs>
      <Rect width="375" height="812" fill="url(#church)" />
      <Circle
        cx="187"
        cy="284"
        r="190"
        fill={colors.surface}
        fillOpacity="0.26"
        stroke={colors.churchLine}
        strokeWidth="12"
      />
      <Circle
        cx="187"
        cy="284"
        r="132"
        fill={colors.churchGlass}
        fillOpacity="0.36"
        stroke={colors.churchLine}
        strokeWidth="8"
      />
      <G opacity="0.3" stroke={colors.churchDetail} strokeWidth="8">
        <Path d="M187 64v442M14 284h346M66 156l242 256M308 156L66 412" />
      </G>
      <G opacity="0.28" fill={colors.primary}>
        <Path d="M176 148h22v180h-22z" />
        <Path d="M142 194h90v22h-90z" />
      </G>
      <Rect width="375" height="812" fill={colors.surface} fillOpacity="0.35" />
    </Svg>
  );
}
