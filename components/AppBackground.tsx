import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';

const STARS = [
  [42, 58, 1.3],
  [96, 34, 0.9],
  [140, 78, 1.1],
  [300, 46, 1.2],
  [338, 96, 0.8],
  [356, 172, 1.1],
  [30, 168, 1],
  [24, 320, 0.9],
  [368, 340, 1.2],
  [62, 476, 1],
  [332, 520, 0.8],
  [44, 640, 1.1],
  [346, 700, 1],
  [88, 760, 0.9],
  [286, 800, 1.2],
] as const;

export default function AppBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <LinearGradient id="authBgGrad" x1="0" y1="0" x2="0.7" y2="1">
            <Stop offset="0" stopColor="#100A24" />
            <Stop offset="0.5" stopColor="#080611" />
            <Stop offset="1" stopColor="#0C0719" />
          </LinearGradient>
          <LinearGradient id="authRingGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#8B5CF6" stopOpacity="0.65" />
            <Stop offset="1" stopColor="#22D3EE" stopOpacity="0.12" />
          </LinearGradient>
        </Defs>

        <Rect width="390" height="844" fill="url(#authBgGrad)" />

        <G fill="none" stroke="url(#authRingGrad)" strokeWidth="1">
          <Circle cx="195" cy="188" r="110" strokeOpacity="0.55" />
          <Circle cx="195" cy="188" r="148" strokeOpacity="0.4" />
          <Circle cx="195" cy="188" r="190" strokeOpacity="0.26" />
          <Circle cx="195" cy="188" r="238" strokeOpacity="0.16" />
          <Circle cx="195" cy="188" r="292" strokeOpacity="0.1" />
          <Circle cx="195" cy="188" r="350" strokeOpacity="0.06" />
        </G>

        <G fill="none" stroke="#22D3EE" strokeWidth="0.9">
          <Path d="M0 96 H52 L74 118 H128" strokeOpacity="0.2" />
          <Path d="M0 132 H34 L54 152 H96" strokeOpacity="0.12" />
          <Path d="M390 76 H330 L306 100 H268" strokeOpacity="0.18" />
          <Path d="M390 118 H346 L326 138 H292" strokeOpacity="0.1" />
          <Path d="M0 690 H48 L70 668 H120" strokeOpacity="0.16" />
          <Path d="M390 736 H332 L312 716 H262" strokeOpacity="0.14" />
          <Path d="M14 790 H76 L98 768 H146" strokeOpacity="0.1" />
        </G>

        <G fill="none" stroke="#8B5CF6" strokeWidth="0.9">
          <Path d="M0 244 H40 L64 220 H108" strokeOpacity="0.16" />
          <Path d="M390 268 H348 L326 290 H282" strokeOpacity="0.14" />
          <Path d="M390 596 H352 L330 618 H286" strokeOpacity="0.12" />
          <Path d="M0 620 H30 L52 598 H94" strokeOpacity="0.1" />
          <Path d="M390 804 H340 L318 782 H270" strokeOpacity="0.1" />
        </G>

        <G fill="none" stroke="#22D3EE" strokeOpacity="0.12" strokeWidth="1">
          <Polygon points="330,20 358,36 358,68 330,84 302,68 302,36" />
          <Polygon points="62,712 90,728 90,760 62,776 34,760 34,728" />
          <Polygon points="334,346 356,359 356,385 334,398 312,385 312,359" />
        </G>

        <G fill="none" stroke="#8B5CF6" strokeOpacity="0.14" strokeWidth="0.9">
          <Line x1="18" y1="408" x2="52" y2="408" />
          <Line x1="52" y1="408" x2="66" y2="422" />
          <Line x1="338" y1="452" x2="372" y2="452" />
          <Line x1="338" y1="452" x2="324" y2="466" />
          <Line x1="92" y1="548" x2="126" y2="548" />
          <Line x1="264" y1="660" x2="298" y2="660" />
        </G>

        <G fill="#E9D5FF">
          {STARS.map(([x, y, r], index) => (
            <Circle key={index} cx={x} cy={y} r={r} opacity={0.55} />
          ))}
        </G>
      </Svg>
    </View>
  );
}
