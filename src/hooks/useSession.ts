'use client';

import { useSyncExternalStore } from 'react';
import { getSessionId } from '@/lib/session';

function subscribe() {
  // sessionId never changes after initial creation, so no-op
  return () => {};
}

export function useSession() {
  return useSyncExternalStore(subscribe, getSessionId, () => '');
}
