'use client';

import { useState, useEffect } from 'react';
import { getSessionId } from '@/lib/session';

export function useSession() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  return sessionId;
}
