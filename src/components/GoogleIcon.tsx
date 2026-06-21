import React from 'react';

interface GoogleIconProps {
  name: string;
  className?: string;
  size?: number;
  fill?: boolean;
  style?: React.CSSProperties;
}

export const GoogleIcon: React.FC<GoogleIconProps> = ({
  name,
  className = '',
  size = 24,
  fill = false,
  style = {}
}) => {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: size ? `${size}px` : undefined,
        fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        width: size ? `${size}px` : undefined,
        height: size ? `${size}px` : undefined,
        ...style
      }}
    >
      {name}
    </span>
  );
};

export default GoogleIcon;
