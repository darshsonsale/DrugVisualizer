import { useState, useEffect, useCallback, useRef } from 'react';
import { UserProgress } from '../api/types';
import { ProgressService } from '../services/progressService';
import { ApiError } from '../api/client';

export interface UseProgressOptions {
  autoFetch?: boolean;
  preferMock?: boolean;
}

export interface UseProgressResult {
  data: UserProgress | null;
  loading: boolean;
  error: string | null;
  markNodeCompleted: (nodeId: string) => Promise<void>;
  recordQuizScore: (score: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useProgress(
  drugId: string = 'drug-ibuprofen-001',
  options: UseProgressOptions = {}
): UseProgressResult {
  const { autoFetch = true, preferMock = false } = options;

  const [data, setData] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProgress = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await ProgressService.getProgress(drugId, {
        preferMock,
        signal: controller.signal,
      });
      setData(result.data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const message =
        err instanceof ApiError
          ? `${err.message} (HTTP ${err.status})`
          : err instanceof Error
          ? err.message
          : 'Failed to load user progress';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [drugId, preferMock]);

  useEffect(() => {
    if (autoFetch) {
      fetchProgress();
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, fetchProgress]);

  const markNodeCompleted = useCallback(
    async (nodeId: string) => {
      if (!data) return;
      if (data.completed_nodes.includes(nodeId)) return;

      const updatedNodes = [...data.completed_nodes, nodeId];
      try {
        const result = await ProgressService.saveProgress(
          drugId,
          { completed_nodes: updatedNodes },
          { preferMock }
        );
        setData(result.data);
      } catch (err) {
        console.error('[useProgress] Save node progress error:', err);
      }
    },
    [data, drugId, preferMock]
  );

  const recordQuizScore = useCallback(
    async (score: number) => {
      try {
        const result = await ProgressService.saveProgress(
          drugId,
          { quiz_score: score, quiz_completed: true },
          { preferMock }
        );
        setData(result.data);
      } catch (err) {
        console.error('[useProgress] Save quiz progress error:', err);
      }
    },
    [drugId, preferMock]
  );

  return {
    data,
    loading,
    error,
    markNodeCompleted,
    recordQuizScore,
    refetch: fetchProgress,
  };
}

export default useProgress;
