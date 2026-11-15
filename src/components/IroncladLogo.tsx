import React from 'react';

interface IroncladLogoProps {
  compact?: boolean;
}

export const IroncladLogo: React.FC<IroncladLogoProps> = ({ compact = false }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Custom SVG Emblem inspired by the Ironclad Mindset Claret Hammer & Sky-Blue Brain Badge */}
      <div className="relative flex-shrink-0 w-11 h-11 rounded-full shadow-lg ring-2 ring-[#1BB1E7]/80 bg-[#F8F9FA] flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Ironclad Mindset Emblem"
        >
          {/* Outer Sky Blue Ring */}
          <circle cx="60" cy="60" r="57" fill="#F8F9FA" stroke="#1BB1E7" strokeWidth="5" />
          {/* Inner Dashed Claret Stitch Ring */}
          <circle
            cx="60"
            cy="60"
            r="49"
            fill="none"
            stroke="#7A263A"
            strokeWidth="2.2"
            strokeDasharray="5 4"
          />
          {/* Left Brain Hemisphere (Sky Blue) */}
          <path
            d="M57 29C47 29 40 34 38 41C32 42 29 48 29 54C29 60 32 64 35 67C34 73 38 79 45 81C49 82 54 82 57 80V29Z"
            fill="#1BB1E7"
          />
          {/* Right Brain Hemisphere (Sky Blue) */}
          <path
            d="M63 29C73 29 80 34 82 41C88 42 91 48 91 54C91 60 88 64 85 67C86 73 82 79 75 81C71 82 66 82 63 80V29Z"
            fill="#1BB1E7"
          />
          {/* Brain Gyri Details */}
          <path
            d="M39 46C44 43 49 44 52 48"
            stroke="#F8F9FA"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M37 59C43 56 49 58 52 62"
            stroke="#F8F9FA"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M68 58C73 55 78 56 82 60"
            stroke="#F8F9FA"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M66 69C71 66 76 67 79 70"
            stroke="#F8F9FA"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Crossed Deep Claret Forge Hammer */}
          <path
            d="M40 82L68 48"
            stroke="#F8F9FA"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <path
            d="M40 82L68 48"
            stroke="#7A263A"
            strokeWidth="9.5"
            strokeLinecap="round"
          />
          <path
            d="M57 26C61 25 66 26 69 29L89 46C91 48 91 52 89 55L84 60C82 62 78 62 75 59L58 45C55 42 55 34 57 26Z"
            fill="#7A263A"
            stroke="#F8F9FA"
            strokeWidth="2.2"
          />
        </svg>
      </div>

      {!compact && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-lg sm:text-xl font-bold tracking-wider text-[#F8F9FA]">
              IRONCLAD
            </span>
            <span className="font-display text-lg sm:text-xl font-bold tracking-wider text-[#1BB1E7]">
              MINDSET
            </span>
          </div>
          <span className="text-[11px] text-[#94A3B8] font-medium tracking-wide mt-0.5">
            Forged in Struggle. Built for Strength.
          </span>
        </div>
      )}
    </div>
  );
};
