import * as React from "react";
import logger from "@/lib/logger";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const initialMobile = window.innerWidth < MOBILE_BREAKPOINT;
    logger.debug("Initial mobile detection", { isMobile: initialMobile });
    setIsMobile(initialMobile);

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      const newMobile = window.innerWidth < MOBILE_BREAKPOINT;
      logger.debug("Media query change detected", { isMobile: newMobile });
      setIsMobile(newMobile);
    };
    mql.addEventListener("change", onChange);

    const handleResize = () => {
      const newMobile = window.innerWidth < MOBILE_BREAKPOINT;
      logger.debug("Window resize detected", { isMobile: newMobile });
      setIsMobile(newMobile);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      mql.removeEventListener("change", onChange);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return !!isMobile;
}
