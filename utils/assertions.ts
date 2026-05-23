import { expect } from '@playwright/test';

export function expectToBe<T>(label: string, actual: T, expected: T) {
  expect(actual, `Expect ${label} ${formatValue(actual)} to be ${formatValue(expected)}`).toBe(expected);
}

export function expectNotToBe<T>(label: string, actual: T, expected: T) {
  expect(actual, `Expect ${label} ${formatValue(actual)} not to be ${formatValue(expected)}`).not.toBe(expected);
}

export function expectToEqual(label: string, actual: unknown, expected: unknown) {
  expect(actual, `Expect ${label} ${formatValue(actual)} to equal ${formatValue(expected)}`).toEqual(expected);
}

export function expectToContain(label: string, actual: string | unknown[], expected: unknown) {
  expect(actual, `Expect ${label} ${formatValue(actual)} to contain ${formatValue(expected)}`).toContain(expected);
}

export function expectToHaveLength(label: string, actual: unknown[], expected: number) {
  expect(actual, `Expect ${label} length ${actual.length} to be ${expected}`).toHaveLength(expected);
}

export function expectToMatch(label: string, actual: string, expected: RegExp) {
  expect(actual, `Expect ${label} ${formatValue(actual)} to match ${expected.toString()}`).toMatch(expected);
}

export function expectToBeTruthy(label: string, actual: unknown) {
  expect(actual, `Expect ${label} ${formatValue(actual)} to be truthy`).toBeTruthy();
}

export function expectToBeGreaterThan(label: string, actual: number, expected: number) {
  expect(actual, `Expect ${label} ${actual} to be greater than ${expected}`).toBeGreaterThan(expected);
}

export function expectToBeGreaterThanOrEqual(label: string, actual: number, expected: number) {
  expect(actual, `Expect ${label} ${actual} to be greater than or equal to ${expected}`).toBeGreaterThanOrEqual(expected);
}

export function expectToBeInstanceOf(label: string, actual: unknown, expected: Function) {
  expect(actual, `Expect ${label} ${formatValue(actual)} to be instance of ${expected.name}`).toBeInstanceOf(expected);
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (value instanceof RegExp) {
    return value.toString();
  }

  if (typeof value === 'function') {
    return value.name || '[Function]';
  }

  try {
    const formatted = JSON.stringify(value);
    return formatted && formatted.length > 180 ? `${formatted.slice(0, 177)}...` : formatted ?? String(value);
  } catch {
    return String(value);
  }
}
