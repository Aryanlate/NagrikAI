import React from 'react';

export default function CivicLogo({ className = "w-9 h-9", showBadge = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        className={className}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="12" fill="#1E40AF" />
        <path
          d="M24 10L36 16V25C36 32.5 30.9 39.4 24 41C17.1 39.4 12 32.5 12 25V16L24 10Z"
          fill="#2563EB"
          stroke="#93C5FD"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M24 18V26M24 26L29 30M24 26L19 30"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="22" r="3" fill="#60A5FA" />
        <circle cx="17" cy="30" r="1.5" fill="#BFDBFE" />
        <circle cx="31" cy="30" r="1.5" fill="#BFDBFE" />
        <circle cx="24" cy="14" r="1.5" fill="#BFDBFE" />
      </svg>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-lg text-slate-900 tracking-tight leading-none">
            Nagrik<span className="text-blue-600">Ai</span>
          </span>
          {showBadge && (
            <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-1.5 py-0.5 rounded tracking-wide uppercase">
              BBMP Official
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-500 font-medium leading-tight">
          Municipal Grievance Redressal
        </span>
      </div>
    </div>
  );
}
