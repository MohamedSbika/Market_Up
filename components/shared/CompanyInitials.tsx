/**
 * CompanyInitials — shows the company logo or a colored initials avatar.
 * Used everywhere a company logo might be missing.
 */
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CompanyInitialsProps {
  name: string;
  logo?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm:  { container: 'w-8 h-8',   text: 'text-xs',  img: 32  },
  md:  { container: 'w-10 h-10', text: 'text-sm',  img: 40  },
  lg:  { container: 'w-14 h-14', text: 'text-lg',  img: 56  },
  xl:  { container: 'w-20 h-20', text: 'text-2xl', img: 80  },
};

/** Deterministic background color from company name */
function getColor(name: string): string {
  const colors = [
    '#0078D4', '#106EBE', '#8764B8', '#107C10',
    '#C5A059', '#D13438', '#616161', '#005A9E',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function CompanyInitials({
  name,
  logo,
  size = 'md',
  className,
}: CompanyInitialsProps) {
  const { container, text, img } = sizeMap[size];
  const bgColor = getColor(name);
  const initials = getInitials(name);

  if (logo) {
    return (
      <div className={cn('relative rounded overflow-hidden flex-shrink-0', container, className)}>
        <Image
          src={logo}
          alt={`${name} logo`}
          width={img}
          height={img}
          className="object-contain w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded flex items-center justify-center flex-shrink-0 font-semibold text-white',
        container,
        text,
        className
      )}
      style={{ backgroundColor: bgColor }}
      aria-label={`${name} initials`}
    >
      {initials}
    </div>
  );
}
