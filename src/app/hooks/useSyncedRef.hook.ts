import { useEffect, useRef } from "react";

function useSyncedRef<T>(value: T): React.RefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

export default useSyncedRef;
