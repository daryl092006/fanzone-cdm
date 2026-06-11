import { getCurrentUser } from '@/app/actions/auth';
import AdminDashboardLayoutClient from './AdminDashboardLayoutClient';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();
    const userEmail = user?.email ?? 'admin@fanzone.tg';
    const userInitial = userEmail.charAt(0).toUpperCase();

    return (
        <AdminDashboardLayoutClient
            userEmail={userEmail}
            userInitial={userInitial}
        >
            {children}
        </AdminDashboardLayoutClient>
    );
}
