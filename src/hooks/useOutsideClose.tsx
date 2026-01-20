import React, { useEffect } from "react";

type UseOutsideCloseProps = {
  ref: React.RefObject<HTMLElement | null>;
  callback: () => void;
};
const useOutsideClose = ({ ref, callback }: UseOutsideCloseProps) => {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        ref &&
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        Number(ref.current.offsetLeft) >= 0
      ) {
        callback();
      }
    }
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [ref, callback]);
};

export default useOutsideClose;
