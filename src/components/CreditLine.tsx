import React from 'react';

interface CreditLineProps {
  className?: string;
}

export const CreditLine: React.FC<CreditLineProps> = ({ className = '' }) => {
  return (
    <div
      className={`text-slate-500 text-[13px] leading-relaxed text-center px-2 py-2 select-none ${className}`}
      style={{ fontSize: '13px' }}
    >
      Clip: <span className="italic font-medium">Zootopia</span> (2016), Walt Disney Studios Motion Pictures / Walt Disney Animation Studios · via YouTube · For educational use only
    </div>
  );
};
