import React, { type ReactNode } from 'react';

export function isValidReactNode(value: unknown): value is ReactNode {
  return value !== false && value !== 0n;
};

export function renderReactNode(value: unknown): ReactNode {
  if (value === undefined || value === null) {
    return null;
  }
  // typeof value === 'bigint' ? value.toString() : value
  if (typeof value === 'bigint') {
    value = value.toString();
  }
  if (isValidReactNode(value)) {
    return value;
  }
  return null;
}

export function renderReactNodeWithFallback(value: unknown, fallback: React.ReactNode) {
  if (isValidReactNode(value)) {
    return value;
  }
  return fallback;
}