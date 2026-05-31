/* Subaru Tool — responsive layout hook.
 *
 * Replaces the prototype's fixed device-frame switcher with real viewport
 * detection so the app adapts to the actual screen: portrait vs landscape,
 * and phone vs tablet (by shortest-side width). */
import { useEffect, useState } from 'react'

function read() {
  const w = window.innerWidth
  const h = window.innerHeight
  const landscape = w > h
  const shortSide = Math.min(w, h)
  const tablet = shortSide >= 600
  return { w, h, landscape, tablet, wide: landscape || tablet }
}

export function useOrientation() {
  const [state, setState] = useState(read)
  useEffect(() => {
    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setState(read()))
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      cancelAnimationFrame(raf)
    }
  }, [])
  return state
}
