'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Share links (including ones from released mobile builds) point at
// "/?words=...". The builder moved to /create, so forward those links there
// with the query string intact.
export default function LegacyShareRedirect() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('words') || params.has('run')) {
      router.replace(`/create${window.location.search}`);
    }
  }, [router]);

  return null;
}
