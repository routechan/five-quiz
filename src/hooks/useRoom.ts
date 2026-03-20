'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

const POLL_INTERVAL = 10000; // 10秒ごとのフォールバックポーリング
const DEBOUNCE_MS = 1000; // fetchRoom のデバウンス間隔

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
  const roomCodeRef = useRef(roomCode);
  roomCodeRef.current = roomCode;
  const realtimeConnectedRef = useRef(false);
  const subscribedRoomIdRef = useRef<string | null>(null);

  // デバウンス用タイマー
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingRef = useRef(false);

  const fetchRoom = useCallback(async () => {
    // 同時実行ガード: 前のfetchが完了するまでスキップ
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const data = await api.getRoom(roomCodeRef.current);
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
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const fetchRoomRef = useRef(fetchRoom);
  fetchRoomRef.current = fetchRoom;

  // リアルタイムイベント用のデバウンス付き fetchRoom
  const debouncedFetchRoom = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchRoomRef.current();
    }, DEBOUNCE_MS);
  }, []);

  // 初回データ取得
  useEffect(() => {
    fetchRoomRef.current();
  }, [roomCode]);

  // Supabase Realtime 購読
  // room_code ベースで rooms テーブルを即座に監視開始し、
  // room.id 取得後に players/answers の購読を追加
  useEffect(() => {
    const roomId = state.room?.id ?? null;

    // room.id が同じなら再購読しない（不要なチャンネル再作成を防止）
    if (roomId && subscribedRoomIdRef.current === roomId) return;

    const channelName = roomId
      ? `room:${roomCode}:${roomId}`
      : `room:${roomCode}`;

    // 前のチャンネルをクリーンアップ
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel = supabase.channel(channelName);

    // rooms テーブルの変更（room_code でフィルター）
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `room_code=eq.${roomCode}`,
      },
      () => {
        debouncedFetchRoom();
      }
    );

    // room.id が取得できたら players/answers も購読
    if (roomId) {
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
          debouncedFetchRoom();
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
          debouncedFetchRoom();
        }
      );
    }

    channel.subscribe((status) => {
      realtimeConnectedRef.current = status === 'SUBSCRIBED';
    });
    channelRef.current = channel;
    subscribedRoomIdRef.current = roomId;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      subscribedRoomIdRef.current = null;
      realtimeConnectedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [roomCode, state.room?.id, debouncedFetchRoom]);

  // フォールバックポーリング（リアルタイム未接続時のみ実行）
  useEffect(() => {
    const interval = setInterval(() => {
      if (!realtimeConnectedRef.current) {
        fetchRoomRef.current();
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [roomCode]);

  return {
    ...state,
    refetch: fetchRoom,
  };
}
