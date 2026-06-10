"use client";

import { Toaster, toast } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster 
      position="top-center" 
      containerStyle={{
        top: '40px',
      }}
      toastOptions={{
        style: {
          padding: '16px 24px',
          maxWidth: '500px',
          fontSize: '15px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderRadius: '8px',
        },
      }}
    >
      {(t) => (
        <div
          style={{
            opacity: t.visible ? 1 : 0,
            background: '#fff',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '500px',
            transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <div className="flex-shrink-0">
            {t.type === 'error' ? '❌' : t.type === 'success' ? '✅' : t.icon}
          </div>
          
          <div className="flex-1 text-sm font-medium text-slate-800">
            {/* @ts-ignore */}
            {t.message}
          </div>

          {t.type !== 'loading' && (
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-shrink-0 ml-4 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md hover:bg-slate-100 transition-colors"
              title="Dismiss"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      )}
    </Toaster>
  );
}
