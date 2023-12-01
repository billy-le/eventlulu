import styles from "./CycleNumbers.module.css";

const NUMBERS = Array(10)
  .fill(null)
  .map((_, i) => i);

export function CycleNumbers({
  displayNumbers = "00,000,000.00",
}: {
  displayNumbers: string | undefined;
}) {
  const numbers = displayNumbers.match(/\d/gi);
  return (
    <div className="flex overflow-hidden">
      {displayNumbers.split("").map((text, iText) => {
        if (numbers?.includes(text)) {
          return (
            <div
              key={iText}
              className={`inline-block h-8 flex-col justify-end text-2xl font-bold leading-none`}
            >
              {NUMBERS.map((num, iNum) => (
                <div key={iNum} className={`${styles[`cycle-${num}`]}`}>
                  {num}
                </div>
              ))}
            </div>
          );
        }
        return (
          <div key={iText} className="text-2xl font-bold">
            {text}
          </div>
        );
      })}
    </div>
  );
}
