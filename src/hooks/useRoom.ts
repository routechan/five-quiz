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

const POLL_INTERVAL_WAITING = 5000; // 待機中: 5秒（入退室検知）
const POLL_INTERVAL_PLAYING = 3000; // ゲーム中: 3秒（回答状態反映）
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

  // Supabase Realtime 購読（rooms テーブルのみ監視 — コネクション節約）
  // players/answers の変更は rooms.status の遷移で検知する。
  // 待機中の入退室はポーリングで補完。
  useEffect(() => {
    // 前のチャンネルをクリーンアップ
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel = supabase.channel(`room:${roomCode}`);

    // rooms テーブルの変更のみ監視（コネクション1本で済む）
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

    channel.subscribe((status) => {
      realtimeConnectedRef.current = status === 'SUBSCRIBED';
    });
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      realtimeConnectedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [roomCode, debouncedFetchRoom]);

  // ポーリング（rooms のみ Realtime 監視のため、players/answers の変更を補完）
  const pollInterval = state.room?.status === 'waiting' ? POLL_INTERVAL_WAITING : POLL_INTERVAL_PLAYING;
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRoomRef.current();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [roomCode, pollInterval]);

  return {
    ...state,
    refetch: fetchRoom,
  };
}
