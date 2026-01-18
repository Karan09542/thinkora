import { useEffect, useRef } from "react";

type AnyFn = (...arg: any[]) => void;
function useThrottle<T extends AnyFn>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  const isCalled = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function Throttled(...args: Parameters<T>) {
    if (isCalled.current) return;
    fn(...args);
    isCalled.current = true;
    timeoutRef.current = setTimeout(() => {
      isCalled.current = false;
    }, limit);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      isCalled.current = false;
    };
  }, []);

  return Throttled;
}

export default useThrottle;
