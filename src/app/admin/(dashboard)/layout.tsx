import Link from 'next/link';
import Image from 'next/image';
import {
    LayoutDashboard,
    Users,
    History,
    Download,
    QrCode,
    LogOut,
    ShieldCheck,
    Tag,
    UserPlus,
    Trophy,
    Shield
} from 'lucide-react';
import { getCurrentUser, logout } from '@/app/actions/auth';
import AdminNavLink from './AdminNavLink';
import AdminSearchBar from './AdminSearchBar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();
    const userEmail = user?.email ?? 'admin@fanzone.tg';
    const userInitial = userEmail.charAt(0).toUpperCase();

    const navLinks = [
        { href: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', exact: true },
        { href: '/admin/inscription', icon: <UserPlus size={18} />, label: 'Inscrire', exact: false },
        { href: '/admin/participants', icon: <Users size={18} />, label: 'Participants', exact: false },
        { href: '/admin/teams', icon: <Shield size={18} />, label: 'Équipes', exact: false },
        { href: '/admin/pronostics', icon: <Trophy size={18} />, label: 'Matchs & Pronostics', exact: false },
        { href: '/admin/presences', icon: <History size={18} />, label: 'Présences', exact: false },
        { href: '/admin/badges', icon: <Tag size={18} />, label: 'Badges QR', exact: false },
        { href: '/admin/exports', icon: <Download size={18} />, label: 'Exports', exact: false },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0A0A14] text-white hidden lg:flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                        <Image src="/logo-adn.png" alt="ADN" width={32} height={32} className="object-contain" />
                        <div>
                            <p className="font-archivo text-sm italic uppercase tracking-tighter">Admin Panel</p>
                            <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest">Ici c&apos;est le Mondial</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Image src="/logo-escen.png" alt="ESCEN" width={64} height={24} className="object-contain" />
                        <span className="text-white/20 text-xs">|</span>
                        <Image src="/logo-mairie.png" alt="Mairie" width={64} height={24} className="object-contain" />
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-1">
                    {navLinks.map((link) => (
                        <AdminNavLink key={link.href} href={link.href} icon={link.icon} label={link.label} exact={link.exact} />
                    ))}
                </nav>

                {/* Lien scanner terrain */}
                <div className="px-6 pb-2">
                    <Link
                        href="/scan"
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-bold text-xs uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all"
                    >
                        <QrCode size={18} /> Scanner terrain
                    </Link>
                </div>

                {/* User + Logout */}
                <div className="p-6 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-archivo font-bold text-sm flex-shrink-0">
                            {userInitial}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Connecté</p>
                            <p className="text-xs text-white/70 truncate">{userEmail}</p>
                        </div>
                    </div>

                    <form action={logout}>
                        <button
                            type="submit"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 font-bold text-xs uppercase tracking-widest transition-all"
                        >
                            <LogOut size={18} /> Se déconnecter
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
                    <AdminSearchBar />

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Connecté · Admin</span>
                        </div>
                        <div className="w-10 h-10 bg-[#0A0A14] rounded-full flex items-center justify-center text-yellow-400 font-archivo italic font-bold">
                            {userInitial}
                        </div>
                    </div>
                </header>

                {/* Page Area */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
