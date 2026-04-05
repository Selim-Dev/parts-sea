import { Metadata } from 'next';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'الصفحة غير موجودة',
};

export default function NotFound() {
  return (
    <main className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold'>الصفحة غير موجودة</h1>
        <p className='mt-2 text-gray-600'>عذراً، الصفحة التي تبحث عنها غير موجودة</p>
        <a
          href='/'
          className='mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
        >
          العودة للرئيسية
        </a>
      </div>
    </main>
  );
}
