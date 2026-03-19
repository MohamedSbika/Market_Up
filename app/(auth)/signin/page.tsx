import { Suspense } from 'react';
import SignInForm from './SignInForm';

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md"><div className="ms-card p-8 animate-pulse"><div className="h-8 bg-[#E0E0E0] rounded w-1/3 mb-6" /><div className="h-10 bg-[#E0E0E0] rounded mb-3" /><div className="h-10 bg-[#E0E0E0] rounded mb-4" /><div className="h-10 bg-[#E0E0E0] rounded" /></div></div>}>
      <SignInForm />
    </Suspense>
  );
}
