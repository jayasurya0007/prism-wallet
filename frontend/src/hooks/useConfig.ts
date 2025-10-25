'use client'

import { useMemo } from 'react';
import { getAppConfig, getLitConfig, getEnvioConfig, getSupportedChainIds } from '@/lib/config';

export function useAppConfig() {
  return useMemo(() => getAppConfig(), []);
}

export function useLitConfig() {
  return useMemo(() => getLitConfig(), []);
}

export function useEnvioConfig() {
  return useMemo(() => getEnvioConfig(), []);
}

export function useSupportedChains() {
  return useMemo(() => getSupportedChainIds(), []);
}