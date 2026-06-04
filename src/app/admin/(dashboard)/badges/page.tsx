import { getBadgeStats, getBadgeList } from '@/app/actions/badge-pool';
import BadgesClientPage from './BadgesClientPage';

export default async function BadgesPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; batch?: string }>;
}) {
    const { status, batch } = await searchParams;
    const statusFilter = status || '';
    const batchFilter = batch || '';

    const [statsData, listData] = await Promise.all([
        getBadgeStats(),
        getBadgeList(statusFilter || undefined, batchFilter || undefined),
    ]);

    const stats = statsData.success ? statsData : { total: 0, libre: 0, assigne: 0, inactif: 0 };
    const badges = listData.success ? listData.badges ?? [] : [];

    return (
        <BadgesClientPage
            stats={stats}
            badges={badges}
            statusFilter={statusFilter}
            batchFilter={batchFilter}
        />
    );
}

