'use client';

import { useCallback, useState } from 'react';

import { useFetch } from '@/lib/api';
import api from '@/lib/api/axios';

const PROFILE_URL = '/v1/profile/me';

export function useProfile() {
  const { data, error, loading, refetch } = useFetch(PROFILE_URL);

  return {
    data,
    error,
    loading,
    mutate: refetch,
    silentRefetch: refetch,
  };
}

export function useUpdateProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url, payload, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const isFormData = payload instanceof FormData;
      const res = await api({
        method: 'PUT',
        url,
        data: payload,
        ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
        ...options,
      });
      setData(res.data);
      setLoading(false);
      options.onSuccess?.(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      options.onError?.(err);
      throw err;
    }
  }, []);

  return [data, loading, error, trigger];
}

export function useDeleteProfilePicture() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.delete(url);
      setData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return [data, loading, error, trigger];
}

export function useInitiateEmailChange() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(url, payload);
      setData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return [data, loading, error, trigger];
}

export function useResendEmailChangeOtp() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(url, payload);
      setData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return [data, loading, error, trigger];
}

export function useVerifyEmail() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(url, payload);
      setData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return [data, loading, error, trigger];
}

export function useChangePassword() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(url, payload);
      setData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return [data, loading, error, trigger];
}

export function useDeleteAccount() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = useCallback(async (url, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.delete(url, { data: payload });
      setData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, []);

  return [data, loading, error, trigger];
}
