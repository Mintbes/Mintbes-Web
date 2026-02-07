import React from 'react';

export const MintbesLogo = ({ className = "w-10 h-10" }) => (
    <div className={`${className} flex items-center justify-center`}>
        <img
            src="/mintbes_leaf_transparent.png"
            alt="Mintbes Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
                e.target.style.display = 'none';
            }}
        />
    </div>
);

export const HarmonyLogo = ({ className = "w-8 h-8", color = "#00AEE9" }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ color }}
    >
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="10" />
        <path d="M35 30 V 70 M 65 30 V 70 M 20 50 H 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    </svg>
);
