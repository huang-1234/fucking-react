import { expect } from "vitest";

export const testEmpty = (node: any) => {
  expect(node).toBeDefined();
  return node;
};