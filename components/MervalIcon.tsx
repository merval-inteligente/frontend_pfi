import React from 'react';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

interface MervalIconProps {
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export const MervalIcon: React.FC<MervalIconProps> = ({ 
  size = 200, 
  backgroundColor = '#8CD279', 
  textColor = '#ffffff' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {/* Background circle */}
      <Circle
        cx="100"
        cy="100"
        r="90"
        fill={backgroundColor}
        stroke="none"
      />
      
      {/* Letter M */}
      <SvgText
        x="100"
        y="130"
        fontSize="120"
        fontWeight="bold"
        textAnchor="middle"
        fill={textColor}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        M
      </SvgText>
    </Svg>
  );
};

export default MervalIcon;
