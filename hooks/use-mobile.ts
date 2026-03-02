import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Primary: matchMedia change event (fires exactly at threshold)
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    mql.addEventListener("change", onMediaChange)

    // Fallback: resize event catches cases matchMedia misses
    // (rapid resizing, DevTools toggle, browser zoom, etc.)
    window.addEventListener("resize", update)

    // Initial value
    update()

    return () => {
      mql.removeEventListener("change", onMediaChange)
      window.removeEventListener("resize", update)
    }
  }, [])

  return !!isMobile
}
