import type { Metadata } from 'next';
import { LinkUpSearchPage } from './SearchPage';

export const metadata: Metadata = {
  title: 'LinkUP — Cartes de contact des entreprises tunisiennes',
};

export default function LinkUpPage() {
  return <LinkUpSearchPage />;
}
