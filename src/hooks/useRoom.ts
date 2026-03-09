'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import type { Room, Player, Answer } from '@/types';

interface RoomState {
  room: Room | null;
  players: Player[];
  answers: Answer[];
  currentQuiz: { id: string; question: string; answer?: string } | null;
  loading: boolean;
  error: string | null;
}

export function useRoom(roomCode: string) {
  const [state, setState] = useState<RoomState>({
    room: null,
    players: [],
    answers: [],
    currentQuiz: null,
    loading: true,
    error: null,
  });
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchRoom = useCallback(async () => {
    try {
      const data = await api.getRoom(roomCode);
      setState({
        room: data.room,
        players: data.players,
        answers: data.answers,
        currentQuiz: data.currentQuiz || null,
        loading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'ルーム情報の取得に失敗しました',
      }));
    }
  }, [roomCode]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // Supabase Realtime 購読
  useEffect(() => {
    if (!state.room?.id) return;

    const roomId = state.room.id;
    const channel = supabase.channel(`room:${roomCode}`);

    // rooms テーブルの変更
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      () => {
        fetchRoom();
      }
    );

    // players テーブルの変更
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`,
      },
      () => {
        fetchRoom();
      }
    );

    // answers テーブルの変更
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'answers',
        filter: `room_id=eq.${roomId}`,
      },
      () => {
        fetchRoom();
      }
    );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [state.room?.id, roomCode, fetchRoom]);

  return {
    ...state,
    refetch: fetchRoom,
  };
}
