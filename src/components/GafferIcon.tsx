import React from 'react';

interface GafferIconProps {
  className?: string;
  variant?: 'monochrome' | 'badge';
  isSpeaking?: boolean;
}

/**
 * Custom icon for "The Gaffer":
 * Warm human coach silhouette with comms headset and real-time voice pulse.
 */
export const GafferIcon: React.FC<GafferIconProps> = ({
  className = 'w-5 h-5',
  variant = 'monochrome',
  isSpeaking = false,
}) => {
  if (variant === 'badge') {
    return (
      <div className="relative inline-flex items-center justify-center flex-shrink-0">
        {isSpeaking && (
          <span
            aria-hidden="true"
            className="absolute -inset-1 rounded-2xl border-2 border-[#1BB1E7] animate-ping opacity-60"
          />
        )}
        <svg
          viewBox="0 0 64 64"
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Claret shield-rounded badge */}
          <rect width="64" height="64" rx="16" fill="#7A263A" />
          <rect
            x="2.5"
            y="2.5"
            width="59"
            height="59"
            rx="13.5"
            stroke="#1BB1E7"
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />

          {/* Headset top headband */}
          <path
            d="M18 30C18 20.6 24.3 14 32 14C39.7 14 46 20.6 46 30"
            stroke="#1BB1E7"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Left & right earcups */}
          <rect x="14.5" y="26.5" width="5.5" height="11" rx="2.75" fill="#1BB1E7" />
          <rect x="44" y="26.5" width="5.5" height="11" rx="2.75" fill="#1BB1E7" />

          {/* Warm human coach silhouette (head + shoulders) */}
          <circle cx="32" cy="27.5" r="8.2" fill="#FFFFFF" />
          <path
            d="M17.5 52C17.5 43.7 23.8 38.5 32 38.5C40.2 38.5 46.5 43.7 46.5 52"
            fill="#FFFFFF"
          />

          {/* Headset mic boom */}
          <path
            d="M45.5 36C45.5 40.5 41.2 42.5 35.5 42.5"
            stroke="#1BB1E7"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="34.5" cy="42.5" r="2.2" fill="#1BB1E7" />

          {/* Voice pulse arcs */}
          <path
            d="M50 22.5C52.4 25 53.6 28.2 53.6 31.5C53.6 34.8 52.4 38 50 40.5"
            stroke="#1BB1E7"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <path
            d="M54 19C57.3 22.4 59 26.8 59 31.5C59 36.2 57.3 40.6 54 44"
            stroke="#1BB1E7"
            strokeOpacity="0.65"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Headset arch */}
      <path
        d="M5.5 11.5C5.5 7.4 8.4 4.5 12 4.5C15.6 4.5 18.5 7.4 18.5 11.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      {/* Earcups */}
      <rect x="4" y="10" width="2.4" height="4.6" rx="1.2" fill="currentColor" />
      <rect x="17.6" y="10" width="2.4" height="4.6" rx="1.2" fill="currentColor" />
      {/* Human head */}
      <circle cx="12" cy="10.2" r="3.1" fill="currentColor" />
      {/* Shoulders */}
      <path
        d="M6.2 20.2C6.2 16.9 8.7 15 12 15C15.3 15 17.8 16.9 17.8 20.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Mic boom */}
      <path
        d="M18.4 14.2C18.4 16 16.8 16.8 14.3 16.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Voice pulse */}
      <path
        d="M21 8.5C22.1 9.8 22.6 11.4 22.6 13C22.6 14.6 22.1 16.2 21 17.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
};
