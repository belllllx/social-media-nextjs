import { RefObject, useEffect, useState } from "react";

export function useScroll(scrollRef: RefObject<HTMLDivElement | null>) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    const onScroll = () => {
      setShowButton(el.scrollTop > 200);
    }

    el.addEventListener("scroll", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll)
    }
  }, []);

  return showButton;
}
