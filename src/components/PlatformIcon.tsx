import React from 'react';
import { Facebook, Instagram, Youtube, Twitter, Linkedin, Music, Globe } from 'lucide-react';

interface PlatformIconProps {
  platformId: string;
  size?: number;
  showBackground?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'gradient';
  animated?: boolean;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  platformId,
  size = 24,
  showBackground = true,
  className = "",
  variant = 'default',
  animated = false
}) => {
  const iconProps = {
    size,
    className: `drop-shadow-sm transition-all duration-200 ${animated ? 'hover:scale-110' : ''} ${className}`
  };

  const getIcon = () => {
    switch (platformId) {
      case 'facebook':
        return <Facebook {...iconProps} />;
      case 'instagram':
        return <Instagram {...iconProps} />;
      case 'youtube':
        return <Youtube {...iconProps} />;
      case 'twitter':
        return <Twitter {...iconProps} />;
      case 'linkedin':
        return <Linkedin {...iconProps} />;
      case 'tiktok':
        return <Music {...iconProps} />;
      default:
        return <Globe {...iconProps} />;
    }
  };

  const getBackground = () => {
    switch (platformId) {
      case 'facebook':
        return variant === 'gradient' 
          ? 'bg-gradient-to-br from-blue-500 to-blue-700' 
          : 'bg-blue-600';
      case 'instagram':
        return 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400';
      case 'youtube':
        return variant === 'gradient' 
          ? 'bg-gradient-to-br from-red-500 to-red-700' 
          : 'bg-red-600';
      case 'twitter':
        return variant === 'gradient' 
          ? 'bg-gradient-to-br from-sky-400 to-sky-600' 
          : 'bg-sky-500';
      case 'linkedin':
        return variant === 'gradient' 
          ? 'bg-gradient-to-br from-blue-600 to-blue-800' 
          : 'bg-blue-700';
      case 'tiktok':
        return variant === 'gradient' 
          ? 'bg-gradient-to-br from-gray-700 to-black' 
          : 'bg-black';
      default:
        return variant === 'gradient' 
          ? 'bg-gradient-to-br from-gray-400 to-gray-600' 
          : 'bg-gray-500';
    }
  };

  const getHoverEffect = () => {
    if (!animated) return '';
    
    switch (platformId) {
      case 'facebook':
        return 'hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-1';
      case 'instagram':
        return 'hover:shadow-lg hover:shadow-pink-200 hover:-translate-y-1';
      case 'youtube':
        return 'hover:shadow-lg hover:shadow-red-200 hover:-translate-y-1';
      case 'twitter':
        return 'hover:shadow-lg hover:shadow-sky-200 hover:-translate-y-1';
      case 'linkedin':
        return 'hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-1';
      case 'tiktok':
        return 'hover:shadow-lg hover:shadow-gray-200 hover:-translate-y-1';
      default:
        return 'hover:shadow-lg hover:shadow-gray-200 hover:-translate-y-1';
    }
  };

  if (!showBackground) {
    return getIcon();
  }

  const backgroundClasses = variant === 'minimal' 
    ? 'p-1.5 rounded-md' 
    : 'p-2 rounded-lg shadow-md';

  return (
    <div className={`${getBackground()} ${backgroundClasses} ${getHoverEffect()} transition-all duration-200`}>
      {React.cloneElement(getIcon(), { className: "text-white" })}
    </div>
  );
}; 