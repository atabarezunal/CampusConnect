import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from './useAuth';

export function useServiceData(loader, deps = []) {
  const { accessToken } = useAuth();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loader(accessToken);
      setData(Array.isArray(result) ? result : result ? [result] : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, loader, ...deps]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function run() {
        if (!active) return;
        await load();
      }

      run();
      return () => {
        active = false;
      };
    }, [load])
  );

  return { data, setData, error, isLoading, refetch: load };
}
