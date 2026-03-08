import { sum } from "lodash-es";

export const bodyPart = {
  work: WORK,
  carry: CARRY,
  move: MOVE,
  attack: ATTACK,
  tough: TOUGH,
} as const;

export const bodyPartCost = {
  [WORK]: 100,
  [CARRY]: 50,
  [MOVE]: 50,
  [ATTACK]: 80,
  [TOUGH]: 10,
} as const;

export type BodyPart = keyof typeof bodyPart;

export function getBodyCost(part: BodyPart[]): number {
  return sum(part.map((p) => bodyPartCost[p]));
}
