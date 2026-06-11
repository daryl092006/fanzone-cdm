import {
    LayoutDashboard,
    Users,
    History,
    Download,
    Tag,
    UserPlus,
    Trophy,
    Shield
} from 'lucide-react';
import { getCurrentUser, logout } from '@/app/actions/auth';
import AdminDashboardLayoutClient from './AdminDashboardLayoutClient';

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
        <AdminDashboardLayoutClient
            userEmail={userEmail}
            userInitial={userInitial}
            navLinks={navLinks}
            logoutAction={logout}
        >
            {children}
        </AdminDashboardLayoutClient>
    );
}
