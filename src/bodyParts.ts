import { sum } from "lodash-es";

export const bodyPart = {
  work: WORK,
  carry: CARRY,
  move: MOVE,
} as const;

export const bodyPartCost = {
  [bodyPart.work]: 100,
  [bodyPart.carry]: 50,
  [bodyPart.move]: 50,
} as const;

export type BodyPart = keyof typeof bodyPart;

export function getBodyCost(part: BodyPart[]): number {
  return sum(part.map((p) => bodyPartCost[p]));
}
