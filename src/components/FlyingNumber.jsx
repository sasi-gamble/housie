import { useEffect, useRef } from 'react';

/**
 * Renders a temporary floating number that flies from a grid tile
 * to the current number card using the Web Animations API.
 * GPU-accelerated (transform + opacity only).
 */
export default function FlyingNumber({ number, fromRect, toRect, onComplete }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top + fromRect.height / 2;
    const endX = toRect.left + toRect.width / 2;
    const endY = toRect.top + toRect.height / 2;
    const dx = endX - startX;
    const dy = endY - startY;

    // Arc midpoint — lifts above the straight line for a parabolic feel
    const arcOffsetY = Math.min(-40, dy * 0.3);

    const anim = el.animate(
      [
        {
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1,
          offset: 0,
        },
        {
          transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.4 + arcOffsetY}px)) scale(2)`,
          opacity: 1,
          offset: 0.55,
        },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(2.8)`,
          opacity: 0,
          offset: 1,
        },
      ],
      {
        duration: 480,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      }
    );

    anim.onfinish = () => onComplete();
    return () => anim.cancel();
  }, [fromRect, toRect, onComplete]);

  return (
    <div
      ref={ref}
      className="flying-number"
      style={{
        left: fromRect.left + fromRect.width / 2,
        top: fromRect.top + fromRect.height / 2,
      }}
    >
      {number}
    </div>
  );
}
