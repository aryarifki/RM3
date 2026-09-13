import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Gagal mengambil data analitik");
  }
  
  return res.json();
};

export function useForeignFlowAnalytics(ticker: string, lookbackDays: number = 60) {
  const { data, error, isLoading, isValidating } = useSWR(
    ticker ? `/api/foreign-flow/${ticker}?lookback_days=${lookbackDays}` : null,
    fetcher,
    {
      revalidateOnFocus: false, 
      dedupingInterval: 60000,  
      shouldRetryOnError: false,
      keepPreviousData: true // Pertahankan data lama saat ganti window
    }
  );

  return {
    data,
    isLoading, // True hanya saat pertama kali load (belum ada data sama sekali)
    isFetching: isValidating, // True saat ada proses fetch di background (untuk ganti window)
    isError: error
  };
}
