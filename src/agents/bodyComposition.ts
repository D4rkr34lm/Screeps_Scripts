import { flatten, times } from "lodash-es";
import { BodyPart, getBodyCost } from "../bodyParts";

const MAX_BODY_PARTS = 50;

export interface BodyComposition {
  baseParts: BodyPart[];
  extraParts: BodyPart[];
}

export function getScaledBodyParts(
  composition: BodyComposition,
  factor: number,
): BodyPart[] {
  if (factor < 1) {
    throw new Error(
      `Failed to scale BodyComposition. Factor must be at least 1. Received: ${factor}`,
    );
  }

  return [
    ...composition.baseParts,
    ...flatten(times(factor - 1, () => composition.extraParts)),
  ];
}

export function getMaximalCompositionFactor(
  composition: BodyComposition,
  energyAvailable: number,
): number {
  const baseCost = getBodyCost(composition.baseParts);
  const extraCost = getBodyCost(composition.extraParts);

  if (baseCost > energyAvailable) {
    return 0;
  } else {
    const remainingEnergy = energyAvailable - baseCost;
    const extraPartsAffordable = Math.floor(remainingEnergy / extraCost);
    const maxBySpawnBodyPartLimit =
      Math.floor(
        (MAX_BODY_PARTS - composition.baseParts.length) /
          composition.extraParts.length,
      ) + 1;
    return Math.min(extraPartsAffordable + 1, maxBySpawnBodyPartLimit);
  }
}
