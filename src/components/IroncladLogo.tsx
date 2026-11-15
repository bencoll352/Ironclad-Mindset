import React from 'react';

interface IroncladLogoProps {
  compact?: boolean;
}

export const IroncladLogo: React.FC<IroncladLogoProps> = ({ compact = false }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex-shrink-0 w-10 h-10 rounded-full border border-[#CBD5E1] bg-white flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Ironclad Mindset emblem"
        >
          <circle cx="60" cy="60" r="57" fill="#FFFFFF" stroke="#1BB1E7" strokeWidth="5" />
          <circle
            cx="60"
            cy="60"
            r="49"
            fill="none"
            stroke="#7A263A"
            strokeWidth="2.2"
            strokeDasharray="5 4"
          />
          <path
            d="M57 29C47 29 40 34 38 41C32 42 29 48 29 54C29 60 32 64 35 67C34 73 38 79 45 81C49 82 54 82 57 80V29Z"
            fill="#1BB1E7"
          />
          <path
            d="M63 29C73 29 80 34 82 41C88 42 91 48 91 54C91 60 88 64 85 67C86 73 82 79 75 81C71 82 66 82 63 80V29Z"
            fill="#1BB1E7"
          />
          <path
            d="M39 46C44 43 49 44 52 48"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M37 59C43 56 49 58 52 62"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M68 58C73 55 78 56 82 60"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M66 69C71 66 76 67 79 70"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M40 82L68 48"
            stroke="#FFFFFF"
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
            stroke="#FFFFFF"
            strokeWidth="2.2"
          />
        </svg>
      </div>

      {!compact && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-lg sm:text-xl font-bold tracking-wide text-[#7A263A]">
              Ironclad
            </span>
            <span className="font-display text-lg sm:text-xl font-bold tracking-wide text-[#121518]">
              Mindset
            </span>
          </div>
          <span className="text-xs text-[#475569] hidden sm:inline">
            Forged in struggle. Built for strength.
          </span>
        </div>
      )}
    </div>
  );
};
