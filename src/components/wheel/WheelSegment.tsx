import React from 'react';
import { CampaignSegment } from './SpinWheel';

interface WheelSegmentProps {
  segment: CampaignSegment;
  index: number;
  totalSegments: number;
  radius: number;
  centerX: number;
  centerY: number;
}

export function WheelSegment({
  segment,
  index,
  totalSegments,
  radius,
  centerX,
  centerY
}: WheelSegmentProps) {
  const degrees = 360 / totalSegments;
  // Offset by -90 deg so that 0 deg starts at the top
  const startAngle = index * degrees - 90;
  const endAngle = startAngle + degrees;

  // Convert to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  // Calculate arc points
  const startX = centerX + radius * Math.cos(startRad);
  const startY = centerY + radius * Math.sin(startRad);
  const endX = centerX + radius * Math.cos(endRad);
  const endY = centerY + radius * Math.sin(endRad);

  const largeArcFlag = degrees > 180 ? 1 : 0;

  const pathData = [
    `M ${centerX} ${centerY}`,
    `L ${startX} ${startY}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
    'Z'
  ].join(' ');

  // Position text radially
  const textAngle = startAngle + degrees / 2;
  const textRad = (textAngle * Math.PI) / 180;
  
  // Adjust distance from center
  const textRadius = radius * 0.65;
  const textX = centerX + textRadius * Math.cos(textRad);
  const textY = centerY + textRadius * Math.sin(textRad);

  return (
    <g>
      <path
        d={pathData}
        fill={segment.color}
        stroke="var(--color-luxury-gold)"
        strokeWidth="1.5"
      />
      <text
        x={textX}
        y={textY}
        fill={segment.textColor}
        fontSize="14"
        fontWeight="600"
        className="font-sans font-semibold tracking-wide"
        textAnchor="middle"
        alignmentBaseline="middle"
        transform={`rotate(${textAngle}, ${textX}, ${textY})`}
      >
        {segment.title}
      </text>

      {segment.imageUrl && (
        <image
          href={segment.imageUrl}
          x={textX - 16}
          y={textY + 10}
          width="32"
          height="32"
          transform={`rotate(${textAngle}, ${textX}, ${textY})`}
        />
      )}
    </g>
  );
}
