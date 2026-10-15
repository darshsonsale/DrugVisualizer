/**
 * Drug Path Visualiser - useContent Hook
 * Custom React hook for fetching and managing drug educational content.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DrugEducationalContent, FoodCondition } from '../api/types';
import { ContentService } from '../services/contentService';

export interface UseContentResult {
  data: DrugEducationalContent | null;
  loading: boolean;
  error: string | null;
  isMockData: boolean;
  refetch: () => Promise<void>;
}

export function useContent(drugId: string, condition?: FoodCondition): UseContentResult {
  const [data, setData] = useState<DrugEducationalContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchContent = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await ContentService.getDrugContent(drugId, condition, {
        signal: controller.signal
      });

      setData(result.data);
      setIsMockData(result.isMockData);
      setLoading(false);
    } catch (err: unknown) {
      if (
        (err instanceof DOMException && err.name === 'AbortError') ||
        controller.signal.aborted
      ) {
        return;
      }
      const message = err instanceof Error ? err.message : 'Failed to load educational content';
      setError(message);
      setLoading(false);
    }
  }, [drugId, condition]);

  useEffect(() => {
    fetchContent();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchContent]);

  return {
    data,
    loading,
    error,
    isMockData,
    refetch: fetchContent
  };
}
