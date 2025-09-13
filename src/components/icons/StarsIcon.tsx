

import React from 'react';

export const StarsIcon: React.FC = () => (
  <svg width="100%" height="100%" className="absolute inset-0">
    <defs>
      <pattern id="small-stars" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle fill="rgba(203, 213, 225, 0.4)" cx="5" cy="5" r="0.5"></circle>
      </pattern>
      <pattern id="medium-stars" width="50" height="50" patternUnits="userSpaceOnUse">
        <circle fill="rgba(226, 232, 240, 0.6)" cx="15" cy="25" r="1"></circle>
        <circle fill="rgba(203, 213, 225, 0.5)" cx="40" cy="10" r="0.8"></circle>
      </pattern>
      <pattern id="large-stars" width="100" height="100" patternUnits="userSpaceOnUse">
        <circle fill="rgba(255, 255, 255, 0.8)" cx="50" cy="50" r="1.5"></circle>
        <circle fill="rgba(226, 232, 240, 0.7)" cx="80" cy="20" r="1.2"></circle>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#small-stars)"></rect>
    <rect width="100%" height="100%" fill="url(#medium-stars)"></rect>
    <rect width="100%" height="100%" fill="url(#large-stars)"></rect>
  </svg>
);