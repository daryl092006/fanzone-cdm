'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    Menu, 
    X, 
    QrCode, 
    LogOut, 
    ShieldCheck,
    LayoutDashboard,
    UserPlus,
    Users,
    Shield,
    Trophy,
    History,
    Tag,
    Download,
    BarChart2,
    Phone
} from 'lucide-react';
import AdminNavLink from './AdminNavLink';
import AdminSearchBar from './AdminSearchBar';
import { logout } from '@/app/actions/auth';

interface AdminDashboardLayoutClientProps {
    userEmail: string;
    userInitial: string;
    children: React.ReactNode;
}

export default function AdminDashboardLayoutClient({
    userEmail,
    userInitial,
    children,
}: AdminDashboardLayoutClientProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navLinks = [
        { href: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', exact: true },
        { href: '/admin/inscription', icon: <UserPlus size={18} />, label: 'Inscrire', exact: false },
        { href: '/admin/participants', icon: <Users size={18} />, label: 'Participants', exact: false },
        { href: '/admin/teams', icon: <Shield size={18} />, label: 'Équipes', exact: false },
        { href: '/admin/pronostics', icon: <Trophy size={18} />, label: 'Matchs & Pronostics', exact: false },
        { href: '/admin/classements', icon: <BarChart2 size={18} />, label: 'Classements Groupes', exact: false },
        { href: '/admin/presences', icon: <History size={18} />, label: 'Présences', exact: false },
        { href: '/admin/exports', icon: <Download size={18} />, label: 'Exports', exact: false },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-x-hidden">
            
            {/* Backdrop for mobile sidebar */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-[#0A0A14]/40 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-[#0A0A14] text-white flex flex-col fixed h-full z-40 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-white/5 space-y-4">
                    <div className="flex justify-between items-center lg:block">
                        <div className="flex items-center gap-3">
                            <div className="bg-white rounded-lg px-2 py-1"><Image src="/logo-mairie.png" alt="Mairie" width={64} height={24} className="object-contain" /></div>
                            <div>
                                <p className="font-archivo text-sm italic uppercase tracking-tighter">Admin Panel</p>
                                <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest">Ici c&apos;est le Mondial</p>
                            </div>
                        </div>
                        {/* Close button for mobile */}
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 text-white/50 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-white rounded-lg px-2 py-1"><Image src="/logo-escen.png" alt="ESCEN" width={64} height={24} className="object-contain" /></div>
                        <span className="text-white/20 text-xs">|</span>
                        <div className="bg-white rounded-lg px-2 py-1"><Image src="/logo-adn.png" alt="ADN" width={32} height={32} className="object-contain" /></div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => (
                        <div key={link.href} onClick={() => setSidebarOpen(false)}>
                            <AdminNavLink href={link.href} icon={link.icon} label={link.label} exact={link.exact} />
                        </div>
                    ))}
                </nav>

                {/* Lien scanner terrain */}
                <div className="px-6 pb-2">
                    <Link
                        href="/scan"
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-bold text-xs uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all"
                    >
                        <Phone size={18} /> Présences Téléphone
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
            <main className="flex-1 lg:ml-64 min-h-screen flex flex-col w-full max-w-full">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 gap-4">
                    <div className="flex items-center gap-3">
                        {/* Hamburger menu for mobile layout */}
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
                        >
                            <Menu size={22} />
                        </button>
                        <AdminSearchBar />
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Connecté · Admin</span>
                        </div>
                        <div className="w-10 h-10 bg-[#0A0A14] rounded-full flex items-center justify-center text-yellow-400 font-archivo italic font-bold">
                            {userInitial}
                        </div>
                    </div>
                </header>

                {/* Page Area */}
                <div className="p-4 sm:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
