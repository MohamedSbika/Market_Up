import type { Metadata } from 'next';
import { TraceUpSearchPage } from './SearchPage';

export const metadata: Metadata = {
  title: 'TraceUP — Profils médias des entreprises tunisiennes',
};

export default function TraceUpPage() {
  return <TraceUpSearchPage />;
}
