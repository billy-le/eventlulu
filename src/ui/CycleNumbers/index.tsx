import { useEffect, useRef } from "react";
import styles from "./CycleNumbers.module.css";

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const NUMBERS = Array(10)
  .fill(null)
  .map((_, i) => i);

export function CycleNumbers({
  displayNumbers = "$00,000,000.00",
  isLoading,
  isError,
}: {
  displayNumbers: string | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  const divsRef = useRef<Record<number, HTMLDivElement[]>>({});
  const isMounted = useRef(false);
  const numbers = displayNumbers.match(/\d/gi);

  useEffect(() => {
    if (isMounted.current) {
      const entries = Object.entries(divsRef.current);

      for (const [, divs] of entries) {
        const randInt = randomIntFromInterval(750, 3000);
        for (let i = 0; i < divs.length; i++) {
          const div = divs[i]!;
          const animations = div.getAnimations();
          const animate = div.animate(
            [
              { transform: `translateY(24px)` },
              { transform: "translateY(-240px)" },
            ],
            {
              duration: randInt,
              delay: (i * randInt) / 100,
              easing: "linear",
              iterations: Infinity,
              fill: "forwards",
            }
          );
        }
      }
    }

    isMounted.current = true;
  }, [isLoading]);

  return (
    <div className="flex h-6 overflow-hidden text-2xl font-bold leading-none">
      {displayNumbers.split("").map((text, iText) => {
        if (numbers?.includes(text)) {
          return (
            <div key={iText} className={`flex-col`}>
              {NUMBERS.map((num, iNum) => (
                <div
                  ref={(el) => {
                    if (el) {
                      divsRef.current[iText];
                      if (!divsRef.current[iText]) {
                        divsRef.current[iText] = [];
                      }

                      if (!divsRef.current[iText]!.includes(el)) {
                        divsRef.current[iText]!.push(el);
                      }
                    }
                  }}
                  data-stop-value={!isLoading && +text === num}
                  key={iNum}
                >
                  {num}
                </div>
              ))}
            </div>
          );
        }
        return <div key={iText}>{text}</div>;
      })}
    </div>
  );
}
