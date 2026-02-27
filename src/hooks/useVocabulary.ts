import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { Word } from '../types';

export const useVocabulary = () => {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('words')
        .select('*')
        .order('id', { ascending: true });

      if (supabaseError) throw supabaseError;

      if (data && data.length > 0) {
        const formattedData: Word[] = data.map((item) => ({
          id: item.id,
          word: item.word,
          meaning: item.meaning,
          imageUrl: item.image_url || item.imageUrl,
        }));
        setAllWords(formattedData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('데이터 로딩 중 에러 발생:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  return { allWords, isLoading, error, refresh: fetchWords };
};
