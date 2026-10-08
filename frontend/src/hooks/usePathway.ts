/**
 * Drug Path Visualiser - usePathway Hook
 * Custom React hook for fetching and managing physiological pathway data.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { FoodCondition, PathwayGraphResponse } from '../api/types';
import { PathwayService } from '../services/pathwayService';
import { ApiError } from '../api/client';

export interface UsePathwayOptions {
  autoFetch?: boolean;
  preferMock?: boolean;
}

export interface UsePathwayResult {
  data: PathwayGraphResponse | null;
  loading: boolean;
  error: string | null;
  condition: FoodCondition;
  isMockData: boolean;
  source: 'api' | 'mock-fixture' | null;
  setCondition: (condition: FoodCondition) => void;
  refetch: () => Promise<void>;
}

export function usePathway(
  drugId: string,
  initialCondition: FoodCondition = 'BEFORE_FOOD',
  options: UsePathwayOptions = {}
): UsePathwayResult {
  const { autoFetch = true, preferMock = false } = options;

  const [condition, setConditionState] = useState<FoodCondition>(initialCondition);
  const [data, setData] = useState<PathwayGraphResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const [source, setSource] = useState<'api' | 'mock-fixture' | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPathwayData = useCallback(
    async (targetCondition: FoodCondition) => {
      // Cancel previous pending fetch if still in flight
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const result = await PathwayService.getPathway(drugId, targetCondition, {
          preferMock,
          signal: controller.signal,
        });

        setData(result.data);
        setIsMockData(result.isMockData);
        setSource(result.source);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return; // Fetch aborted due to new request, ignore
        }

        const errorMessage =
          err instanceof ApiError
            ? `${err.message} (HTTP ${err.status})`
            : err instanceof Error
            ? err.message
            : 'Unknown error occurred while fetching pathway';

        setError(errorMessage);
        setData(null);
        setIsMockData(false);
        setSource(null);
      } finally {
        setLoading(false);
      }
    },
    [drugId, preferMock]
  );

  const setCondition = useCallback(
    (newCondition: FoodCondition) => {
      setConditionState(newCondition);
      fetchPathwayData(newCondition);
    },
    [fetchPathwayData]
  );

  const refetch = useCallback(async () => {
    await fetchPathwayData(condition);
  }, [fetchPathwayData, condition]);

  useEffect(() => {
    if (autoFetch && drugId) {
      fetchPathwayData(condition);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [drugId, autoFetch, fetchPathwayData, condition]);

  return {
    data,
    loading,
    error,
    condition,
    isMockData,
    source,
    setCondition,
    refetch,
  };
}
