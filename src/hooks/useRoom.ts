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

const POLL_INTERVAL = 30000; // フォールバックポーリング: 30秒（Realtime未接続時のみ）
const DEBOUNCE_MS = 300; // ステータス変更時のデバウンス間隔
const DEBOUNCE_MS_SOFT = 2000; // ステータス同一時（回答追加等）のデバウンス間隔

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
  const stateRef = useRef(state);
  stateRef.current = state;
  const realtimeConnectedRef = useRef(false);
  const lastVisibleRef = useRef(0);

  // デバウンス用タイマー
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingRef = useRef(false);

  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setState((prev) => {
        // 初回読み込み中（room が null）のみエラー表示。
        // 既にデータがある場合は裏でリトライし、エラー画面にはしない。
        if (prev.room) return prev;
        return { ...prev, loading: false, error: 'ルーム情報の取得に失敗しました' };
      });
      // 失敗後 3 秒で自動リトライ（復帰直後のネットワーク不安定対策）
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        fetchingRef.current = false;
        fetchRoomRef.current();
      }, 3000);
      return;
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const fetchRoomRef = useRef(fetchRoom);
  fetchRoomRef.current = fetchRoom;

  // リアルタイムイベント用のデバウンス付き fetchRoom（delay 指定可能）
  const debouncedFetchRoom = useCallback((delay: number = DEBOUNCE_MS) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchRoomRef.current();
    }, delay);
  }, []);

  // 初回データ取得
  useEffect(() => {
    fetchRoomRef.current();
  }, [roomCode]);

  // Realtime チャンネルを作成・購読するヘルパー
  const setupChannel = useCallback(() => {
    if (channelRef.current) {
      // 古いチャンネルを適切に破棄（リーク防止）
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase.channel(`room:${roomCodeRef.current}`);

    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `room_code=eq.${roomCodeRef.current}`,
      },
      (payload) => {
        const newStatus = (payload.new as Record<string, unknown>)?.status;
        const currentStatus = stateRef.current.room?.status;
        // ステータスが変わった場合は即座に取得（画面遷移に関わる）
        // ステータス同一（回答追加等の updated_at だけ変更）は長めのデバウンスで集約
        if (newStatus && newStatus !== currentStatus) {
          debouncedFetchRoom(DEBOUNCE_MS);
        } else {
          debouncedFetchRoom(DEBOUNCE_MS_SOFT);
        }
      }
    );

    channel.subscribe((status) => {
      realtimeConnectedRef.current = status === 'SUBSCRIBED';
      // エラー/タイムアウト時はフォールバックポーリングに任せる
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        realtimeConnectedRef.current = false;
      }
    });
    channelRef.current = channel;
  }, [debouncedFetchRoom]);

  // Supabase Realtime 購読（rooms テーブルのみ監視 — コネクション節約）
  // players/answers の変更は rooms.status の遷移で検知する。
  // 待機中の入退室はポーリングで補完。
  useEffect(() => {
    setupChannel();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      realtimeConnectedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [roomCode, setupChannel]);

  // ブラウザ復帰時（バックグラウンド→フォアグラウンド）に再接続＋再取得
  // デバウンス付き: 2秒以内の連続復帰は無視（スマホのロック/アンロック連打対策）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastVisibleRef.current < 2000) return;
      lastVisibleRef.current = now;
      // Realtime チャンネルを張り直す（stale 接続対策）
      setupChannel();
      // 最新データを即取得
      fetchRoomRef.current();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setupChannel]);

  // フォールバックポーリング（Realtime未検知の変更を補完）
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
