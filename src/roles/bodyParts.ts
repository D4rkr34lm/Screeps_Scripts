import { sum } from "lodash-es";

export const bodyPart = {
  work: WORK,
  carry: CARRY,
  move: MOVE,
} as const;

export const bodyPartCost = {
  [WORK]: 100,
  [CARRY]: 50,
  [MOVE]: 50,
} as const;

export type BodyPart = keyof typeof bodyPart;

export function getBodyCost(part: BodyPart[]): number {
  return sum(part.map((p) => bodyPartCost[p]));
}
