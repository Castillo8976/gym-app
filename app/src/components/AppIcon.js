import Svg, { Path } from 'react-native-svg';

const PATHS = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  train: 'M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12',
  ranks: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  league: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 21h8M10 17h4',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-7 8-7s8 3 8 7',
};

export default function AppIcon({ name, color, size = 22, strokeWidth = 1.8 }) {
  return (
    <Svg
      accessibilityElementsHidden
      aria-hidden
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <Path
        d={PATHS[name]}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
