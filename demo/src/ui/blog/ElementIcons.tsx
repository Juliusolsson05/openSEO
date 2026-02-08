import React from "react";

type P = { width?: number; height?: number };

export const ParagraphIcon: React.FC<P> = ({ width = 80, height = 80 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height}>
    <rect width="100" height="100" fill="#f3f4f6"/>
    <rect x="10" y="15" width="80" height="12" rx="2" fill="#e5e7eb"/>
    <rect x="10" y="35" width="80" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="10" y="50" width="65" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="10" y="65" width="75" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="10" y="80" width="45" height="8" rx="2" fill="#e5e7eb"/>
  </svg>
);

export const TableIcon: React.FC<P> = ({ width = 80, height = 80 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height}>
    <rect width="100" height="100" fill="#f3f4f6"/>
    <rect x="10" y="10" width="60" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="10" y="25" width="80" height="15" rx="2" fill="#3182ce"/>
    <rect x="33" y="25" width="1" height="15" fill="#ffffff"/>
    <rect x="56" y="25" width="1" height="15" fill="#ffffff"/>
    <rect x="10" y="40" width="80" height="12" fill="#ffffff"/>
    <rect x="10" y="52" width="80" height="12" fill="#f3f4f6"/>
    <rect x="10" y="64" width="80" height="12" fill="#ffffff"/>
    <rect x="10" y="76" width="80" height="12" fill="#f3f4f6"/>
    <rect x="33" y="40" width="1" height="48" fill="#e5e7eb"/>
    <rect x="56" y="40" width="1" height="48" fill="#e5e7eb"/>
    <rect x="15" y="44" width="12" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="38" y="44" width="12" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="61" y="44" width="12" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="15" y="56" width="12" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="38" y="56" width="12" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="61" y="56" width="12" height="4" rx="1" fill="#e5e7eb"/>
  </svg>
);

export const FAQIcon: React.FC<P> = ({ width = 80, height = 80 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height}>
    <rect width="100" height="100" fill="#f3f4f6"/>
    <rect x="10" y="10" width="40" height="12" rx="2" fill="#3182ce"/>
    <text x="16" y="20" fontSize="10" fill="#ffffff" fontWeight="bold">FAQ</text>
    <rect x="10" y="30" width="80" height="15" rx="2" fill="#e5e7eb"/>
    <circle cx="80" cy="37.5" r="6" fill="#3182ce"/>
    <rect x="76" y="36.5" width="8" height="2" fill="#ffffff"/>
    <rect x="15" y="50" width="70" height="6" rx="2" fill="#e5e7eb" opacity="0.7"/>
    <rect x="15" y="60" width="60" height="6" rx="2" fill="#e5e7eb" opacity="0.7"/>
    <rect x="10" y="75" width="80" height="15" rx="2" fill="#e5e7eb"/>
    <circle cx="80" cy="82.5" r="6" fill="#3182ce"/>
    <rect x="76" y="81.5" width="8" height="2" fill="#ffffff"/>
    <rect x="79" y="78.5" width="2" height="8" fill="#ffffff"/>
  </svg>
);

export const ChecklistIcon: React.FC<P> = ({ width = 80, height = 80 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height}>
    <rect width="100" height="100" fill="#f3f4f6"/>
    <rect x="10" y="12" width="80" height="12" rx="2" fill="#e5e7eb"/>
    <rect x="12" y="33" width="8" height="8" rx="1" fill="#d1d5db"/>
    <rect x="25" y="33" width="60" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="12" y="49" width="8" height="8" rx="1" fill="#d1d5db"/>
    <rect x="25" y="49" width="52" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="12" y="65" width="8" height="8" rx="1" fill="#d1d5db"/>
    <rect x="25" y="65" width="56" height="8" rx="2" fill="#e5e7eb"/>
  </svg>
);

export const CaseStudyIcon: React.FC<P> = ({ width = 80, height = 80 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height}>
    <rect width="100" height="100" fill="#ffffff" rx="4"/>
    <rect x="0" y="0" width="100" height="30" fill="#e5e7eb" rx="4"/>
    <rect x="70" y="5" width="20" height="20" fill="#f3f4f6" rx="2"/>
    <rect x="10" y="8" width="50" height="6" fill="#f3f4f6" rx="1"/>
    <rect x="10" y="18" width="40" height="4" fill="#f3f4f6" rx="1"/>
    <rect x="10" y="35" width="25" height="4" fill="#4b5563" rx="1"/>
    <rect x="10" y="42" width="80" height="3" fill="#e5e7eb" rx="1"/>
    <rect x="10" y="50" width="25" height="4" fill="#4b5563" rx="1"/>
    <rect x="10" y="57" width="80" height="3" fill="#e5e7eb" rx="1"/>
    <rect x="10" y="65" width="25" height="4" fill="#4b5563" rx="1"/>
    <circle cx="15" cy="74" r="2" fill="#48bb78"/>
    <rect x="20" y="72" width="70" height="3" fill="#e5e7eb" rx="1"/>
    <circle cx="15" cy="81" r="2" fill="#48bb78"/>
    <rect x="20" y="79" width="60" height="3" fill="#e5e7eb" rx="1"/>
    <rect x="0" y="88" width="100" height="12" fill="#f3f4f6" rx="2"/>
    <rect x="10" y="92" width="30" height="4" fill="#3182ce" rx="1"/>
    <rect x="60" y="92" width="30" height="4" fill="#3182ce" rx="1"/>
  </svg>
);

export const StatisticIcon: React.FC<P> = ({ width = 80, height = 80 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height}>
    <rect width="100" height="100" fill="#f5f5f5" rx="4"/>
    <rect x="20" y="10" width="60" height="8" rx="2" fill="#e5e7eb"/>
    <circle cx="50" cy="50" r="25" fill="none" stroke="#e6e6e6" strokeWidth="6"/>
    <path d="M 50 25 A 25 25 0 1 1 25 50" fill="none" stroke="#00008B" strokeWidth="6" strokeLinecap="round"/>
    <rect x="40" y="45" width="20" height="10" rx="2" fill="#f5f5f5"/>
    <text x="50" y="52" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#000000">75%</text>
    <rect x="15" y="85" width="70" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="25" y="92" width="50" height="4" rx="1" fill="#e5e7eb"/>
  </svg>
);

export const TimelineIcon: React.FC<P> = ({ width = 80, height = 80 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height}>
    <rect width="100" height="100" fill="#f3f4f6"/>
    <line x1="50" y1="10" x2="50" y2="90" stroke="#e5e7eb" strokeWidth="4"/>
    <circle cx="50" cy="25" r="4" fill="#1976D2"/>
    <rect x="10" y="15" width="35" height="20" rx="2" fill="#e5e7eb"/>
    <circle cx="50" cy="50" r="4" fill="#1976D2"/>
    <rect x="55" y="40" width="35" height="20" rx="2" fill="#e5e7eb"/>
    <circle cx="50" cy="75" r="4" fill="#1976D2"/>
    <rect x="10" y="65" width="35" height="20" rx="2" fill="#e5e7eb"/>
  </svg>
);

export const ProsAndConsIcon: React.FC<P> = ({ width = 80, height = 80 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={width} height={height}>
    <rect width="100" height="100" fill="#ffffff" rx="4"/>
    <rect x="20" y="10" width="60" height="6" rx="2" fill="#e5e7eb"/>
    <rect x="10" y="25" width="35" height="5" rx="1" fill="#28a745"/>
    <line x1="10" y1="32" x2="45" y2="32" stroke="#28a745" strokeWidth="2"/>
    <circle cx="15" cy="42" r="3" fill="#28a745"/>
    <rect x="22" y="40" width="30" height="4" rx="1" fill="#e5e7eb"/>
    <circle cx="15" cy="52" r="3" fill="#28a745"/>
    <rect x="22" y="50" width="25" height="4" rx="1" fill="#e5e7eb"/>
    <circle cx="15" cy="62" r="3" fill="#28a745"/>
    <rect x="22" y="60" width="28" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="55" y="25" width="35" height="5" rx="1" fill="#dc3545"/>
    <line x1="55" y1="32" x2="90" y2="32" stroke="#dc3545" strokeWidth="2"/>
    <rect x="55" y="38" width="6" height="6" rx="1" transform="rotate(45 58 41)" fill="#dc3545"/>
    <rect x="67" y="40" width="30" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="55" y="48" width="6" height="6" rx="1" transform="rotate(45 58 51)" fill="#dc3545"/>
    <rect x="67" y="50" width="25" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="55" y="58" width="6" height="6" rx="1" transform="rotate(45 58 61)" fill="#dc3545"/>
    <rect x="67" y="60" width="28" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="20" y="80" width="60" height="4" rx="1" fill="#e5e7eb"/>
    <rect x="30" y="88" width="40" height="4" rx="1" fill="#e5e7eb"/>
  </svg>
);

/** Map element label → icon component */
export const ELEMENT_ICONS: Record<string, React.FC<P>> = {
  Paragraph: ParagraphIcon,
  Table: TableIcon,
  FAQ: FAQIcon,
  Checklist: ChecklistIcon,
  "Case Study": CaseStudyIcon,
  Statistic: StatisticIcon,
  Timeline: TimelineIcon,
  "Pros & Cons": ProsAndConsIcon,
};
