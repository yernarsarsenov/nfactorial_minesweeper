'use client';

import React from 'react';

const AuthButton: React.FC = () => {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="bg-gray-100 text-gray-400 px-5 py-2 rounded-xl font-bold text-xs cursor-not-allowed border border-gray-200">
        Demo Account
      </div>
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Guest Access Only</p>
    </div>
  );
};

export default AuthButton;
