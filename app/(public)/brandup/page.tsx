import type { Metadata } from 'next';
import { BrandUpSearchPage } from './SearchPage';

export const metadata: Metadata = {
  title: 'BrandUP — Profils institutionnels des entreprises tunisiennes',
  description: 'Découvrez les profils institutionnels des entreprises tunisiennes B2B et B2C sur BrandUP.',
};

export default function BrandUpPage() {
  return <BrandUpSearchPage />;
}
