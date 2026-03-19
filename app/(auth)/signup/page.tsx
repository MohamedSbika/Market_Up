import { Suspense } from 'react';
import SignUpForm from './SignUpForm';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-lg"><div className="ms-card p-8 animate-pulse space-y-4"><div className="h-8 bg-[#E0E0E0] rounded w-1/3" /><div className="h-10 bg-[#E0E0E0] rounded" /><div className="h-10 bg-[#E0E0E0] rounded" /><div className="h-10 bg-[#E0E0E0] rounded" /></div></div>}>
      <SignUpForm />
    </Suspense>
  );
}
