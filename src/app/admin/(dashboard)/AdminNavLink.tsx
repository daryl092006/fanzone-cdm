'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    exact: boolean;
}

export default function AdminNavLink({ href, icon, label, exact }: AdminNavLinkProps) {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : pathname.startsWith(href);

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${isActive
                ? 'bg-yellow-400 text-black'
                : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
        >
            {icon} {label}
        </Link>
    );
}
