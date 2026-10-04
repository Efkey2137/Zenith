import Svg, { Circle, Path } from "react-native-svg";
import { View } from "react-native";
import { colors } from "./ui";

/** Abstract binding ornament; deliberately contains no invented story imagery. */
export function BranchMark({
  size = 88,
  color = colors.brass,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessible={false}>
      <Circle
        cx="50"
        cy="50"
        r="43"
        stroke={color}
        strokeWidth="0.65"
        fill="none"
        opacity="0.45"
      />
      <Path
        d="M48 80 Q54 53 48 20 M50 62 Q31 55 27 38 M51 54 Q68 48 74 29 M50 40 Q38 36 35 25 M51 68 Q67 63 74 49 M31 49 L20 45 M68 42 L79 39 M54 72 L64 78"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="48" cy="18" r="2" fill={color} />
    </Svg>
  );
}
export function BookCover() {
  return (
    <View
      accessible={false}
      style={{
        width: 76,
        height: 112,
        borderRadius: 5,
        borderLeftWidth: 5,
        borderLeftColor: "#364B3C",
        backgroundColor: "#243B2D",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#47604C",
      }}
    >
      <BranchMark size={57} />
    </View>
  );
}
