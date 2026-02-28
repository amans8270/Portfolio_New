'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            setIsAdmin(false);
            router.push('/admin/login');
        } else {
            setIsAdmin(true);
        }
    }, [router]);

    const logout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
    };

    return { isAdmin, logout };
}
