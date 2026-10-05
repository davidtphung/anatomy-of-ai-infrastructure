export function formatNumber(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatMw(value: number): string {
  return `${formatNumber(value, value >= 10 ? 0 : 1)} MW`;
}

export function formatCompact(value: number, digits = 1): string {
  if (Math.abs(value) >= 1_000_000) return `${formatNumber(value / 1_000_000, digits)}M`;
  if (Math.abs(value) >= 10_000) return `${formatNumber(value / 1_000, digits)}k`;
  return formatNumber(value, digits);
}

export function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${formatNumber(value / 1_000_000, 1)}M`;
  if (value >= 10_000) return `$${formatNumber(value / 1_000, 0)}k`;
  return `$${formatNumber(value, 0)}`;
}
