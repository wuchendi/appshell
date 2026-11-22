import { useEffect, useState } from "react";

const QUERY = "(max-width: 767px)";

/** Below the `md` breakpoint, where the rail and panel move into a sheet. */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function")
      return;
    const query = window.matchMedia(QUERY);
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return mobile;
}
