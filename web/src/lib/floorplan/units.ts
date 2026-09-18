import type { Units } from "./types";

export const IN_PER_FT = 12;
export const IN_PER_M = 39.37007874015748;

export function inchesToDisplay(inches: number, units: Units): number {
  return units === "m" ? inches / IN_PER_M : inches / IN_PER_FT;
}

export function displayToInches(value: number, units: Units): number {
  return units === "m" ? value * IN_PER_M : value * IN_PER_FT;
}

export function formatInches(inches: number, units: Units): string {
  if (units === "m") {
    const m = inches / IN_PER_M;
    const digits = m >= 10 ? 1 : 2;
    return `${m.toFixed(digits)} m`;
  }
  const total = Math.round(inches);
  const ft = Math.trunc(total / 12);
  const inch = Math.abs(total % 12);
  return `${ft}'-${inch}"`;
}

export function formatArea(sqIn: number, units: Units): string {
  if (units === "m") {
    const sqm = sqIn / (IN_PER_M * IN_PER_M);
    return `${sqm.toFixed(0)} m²`;
  }
  const sqft = sqIn / 144;
  return `${Math.round(sqft).toLocaleString()} sq ft`;
}

export function snapInches(value: number, units: Units, enabled: boolean): number {
  if (!enabled) return value;
  const step = units === "m" ? IN_PER_M * 0.25 : 6;
  return Math.round(value / step) * step;
}

export function gridMinorIn(units: Units): number {
  return units === "m" ? IN_PER_M * 0.5 : 12;
}

export function gridMajorIn(units: Units): number {
  return units === "m" ? IN_PER_M * 2 : 60;
}
