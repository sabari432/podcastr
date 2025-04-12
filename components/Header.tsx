import { cn } from '@/lib/utils';
import Link from 'next/link';

const Header = ({ headerTitle, titleClassName }: { headerTitle?: string; titleClassName?: string }) => {
  return (
    <header className="flex items-center justify-between">
      {headerTitle ? (
        <h1 className={cn('text-24 font-extrabold bg-gradient-to-r from-[#D4D925] to-gray-300 text-transparent bg-clip-text drop-shadow-lg animate-pulse', titleClassName)}>{headerTitle}</h1>
      ) : (
        <div />
      )}
      {/* Updated Link: No authentication check required */}
      <Link href="/podcasters" className="text-16 font-semibold text-orange-1">
       See all
      </Link>
    </header>
  );
};

export default Header;