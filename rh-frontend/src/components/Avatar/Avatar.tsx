import React from 'react';
import './Avatar.css';

interface AvatarProps {
  name?: string;
}

export function Avatar({ name }: AvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="avatar-container" title={name}>
      {initial}
    </div>
  );
}