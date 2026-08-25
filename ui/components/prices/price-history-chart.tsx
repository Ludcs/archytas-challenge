import type { PriceHistoryEntry } from "@/lib/prices/types";
import { formatCurrency, formatDate } from "@/lib/prices/utils";

type PriceHistoryChartProps = {
  history: PriceHistoryEntry[];
};

export function PriceHistoryChart({ history }: PriceHistoryChartProps) {
  if (history.length < 2) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
        Sin cambios de precio registrados todavía.
      </p>
    );
  }

  const width = 720;
  const height = 280;
  const padding = { top: 24, right: 24, bottom: 48, left: 104 };
  const values = history.map((entry) => entry.price);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || Math.max(maximum * 0.05, 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const pointPosition = (entry: PriceHistoryEntry, index: number) => ({
    x: padding.left + (index / (history.length - 1)) * chartWidth,
    y: padding.top + (1 - (entry.price - minimum) / range) * chartHeight,
  });
  const points = history.map(pointPosition);
  const linePoints = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const horizontalGuideValues = [maximum, (maximum + minimum) / 2, minimum];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-labelledby="price-history-title price-history-description"
      >
        <title id="price-history-title">Evolución del precio</title>
        <desc id="price-history-description">
          Evolución del precio entre {formatDate(history[0].recorded_at)} y {formatDate(history[history.length - 1].recorded_at)}.
        </desc>
        {horizontalGuideValues.map((value) => {
          const y = padding.top + (1 - (value - minimum) / range) * chartHeight;

          return (
            <g key={value}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 12}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[12px]"
              >
                {formatCurrency(value)}
              </text>
            </g>
          );
        })}
        <polyline
          fill="none"
          points={linePoints}
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {history.map((entry, index) => {
          const point = points[index];
          return (
            <circle
              key={entry.id}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="2"
            />
          );
        })}
        <text
          x={padding.left}
          y={height - 16}
          className="fill-slate-500 text-[12px]"
        >
          {formatDate(history[0].recorded_at)}
        </text>
        <text
          x={width - padding.right}
          y={height - 16}
          textAnchor="end"
          className="fill-slate-500 text-[12px]"
        >
          {formatDate(history[history.length - 1].recorded_at)}
        </text>
      </svg>
      <ul className="sr-only">
        {history.map((entry) => (
          <li key={entry.id}>
            {formatDate(entry.recorded_at)}: {formatCurrency(entry.price)}
          </li>
        ))}
      </ul>
    </div>
  );
}
