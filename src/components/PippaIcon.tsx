import React from 'react';

interface PippaIconProps {
  className?: string;
  variant?: 'monochrome' | 'badge';
  isSpeaking?: boolean;
}

/**
 * Custom icon for "Pippa":
 * Warm British female coach silhouette with sleek comms headset and real-time voice pulse.
 */
export const PippaIcon: React.FC<PippaIconProps> = ({
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
            className="absolute -inset-1 rounded-2xl border-2 border-[#1BB1E7] animate-ping opacity-65"
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
            d="M17.5 29.5C17.5 19.8 24 13.5 32 13.5C40 13.5 46.5 19.8 46.5 29.5"
            stroke="#1BB1E7"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Earcups */}
          <rect x="14" y="26" width="5.2" height="10.5" rx="2.6" fill="#1BB1E7" />
          <rect x="44.8" y="26" width="5.2" height="10.5" rx="2.6" fill="#1BB1E7" />

          {/* Warm female coach silhouette (soft bob hair + face + shoulders) */}
          <path
            d="M22.5 28.5C22.5 21.8 26.6 17.8 32 17.8C37.4 17.8 41.5 21.8 41.5 28.5V35.5C41.5 36.8 40.2 37.6 38.8 37.3L37 36.8H27L25.2 37.3C23.8 37.6 22.5 36.8 22.5 35.5V28.5Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
          <circle cx="32" cy="27.2" r="6.8" fill="#FFFFFF" />
          <path
            d="M18.5 52C18.5 44.3 24.4 39.2 32 39.2C39.6 39.2 45.5 44.3 45.5 52"
            fill="#FFFFFF"
          />

          {/* Headset mic boom */}
          <path
            d="M46 35.2C46 39.8 41.5 41.8 35.8 41.8"
            stroke="#1BB1E7"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="34.8" cy="41.8" r="2.2" fill="#1BB1E7" />

          {/* Voice pulse arcs */}
          <path
            d="M50.5 22.5C52.9 25 54.1 28.2 54.1 31.5C54.1 34.8 52.9 38 50.5 40.5"
            stroke="#1BB1E7"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <path
            d="M54.5 19C57.8 22.4 59.5 26.8 59.5 31.5C59.5 36.2 57.8 40.6 54.5 44"
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
        d="M5.5 11.2C5.5 7.2 8.4 4.3 12 4.3C15.6 4.3 18.5 7.2 18.5 11.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      {/* Earcups */}
      <rect x="4" y="9.8" width="2.3" height="4.4" rx="1.15" fill="currentColor" />
      <rect x="17.7" y="9.8" width="2.3" height="4.4" rx="1.15" fill="currentColor" />
      {/* Female silhouette hair + head */}
      <path
        d="M8.5 10.6C8.5 8.1 10 6.7 12 6.7C14 6.7 15.5 8.1 15.5 10.6V13.4C15.5 14 14.8 14.4 14.1 14.1L13.5 13.8H10.5L9.9 14.1C9.2 14.4 8.5 14 8.5 13.4V10.6Z"
        fill="currentColor"
      />
      {/* Shoulders */}
      <path
        d="M6.4 20.2C6.4 17 8.8 15.1 12 15.1C15.2 15.1 17.6 17 17.6 20.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Mic boom */}
      <path
        d="M18.4 14C18.4 15.8 16.8 16.6 14.3 16.6"
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
