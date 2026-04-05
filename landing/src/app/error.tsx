'use client';

import * as React from 'react';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold text-red-600'>حدث خطأ</h1>
        <p className='mt-2 text-gray-600'>عذراً، حدث خطأ غير متوقع</p>
        <button
          onClick={reset}
          className='mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
        >
          حاول مرة أخرى
        </button>
      </div>
    </main>
  );
}
