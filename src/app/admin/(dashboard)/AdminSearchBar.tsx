'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function AdminSearchBar() {
    const [value, setValue] = useState('');
    const router = useRouter();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (value.trim()) {
            router.push(`/admin/participants?q=${encodeURIComponent(value.trim())}`);
            setValue('');
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 w-96"
        >
            <Search size={16} className="text-slate-400" />
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Rechercher un participant (Nom, N° Badge...)"
                className="bg-transparent border-none text-sm w-full focus:outline-none placeholder:text-slate-400"
            />
        </form>
    );
}
