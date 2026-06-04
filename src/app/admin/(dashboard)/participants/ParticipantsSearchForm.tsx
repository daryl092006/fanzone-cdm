'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function ParticipantsSearchForm({ defaultValue }: { defaultValue: string }) {
    const [value, setValue] = useState(defaultValue);
    const router = useRouter();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (value.trim()) {
            router.push(`/admin/participants?q=${encodeURIComponent(value.trim())}`);
        } else {
            router.push('/admin/participants');
        }
    }

    function handleClear() {
        setValue('');
        router.push('/admin/participants');
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Nom, téléphone..."
                className="bg-transparent border-none text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-44"
            />
            {value && (
                <button type="button" onClick={handleClear} className="text-slate-300 hover:text-slate-600 transition-colors">
                    <X size={14} />
                </button>
            )}
        </form>
    );
}
