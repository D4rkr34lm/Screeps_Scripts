import { flatten, times } from "lodash-es";
import { BodyPart } from "./bodyParts";

// const MAX_BODY_PARTS = 50;

export interface BodyComposition {
  baseParts: BodyPart[];
  extraParts: BodyPart[];
  sortParts?: (parts: BodyPart[]) => BodyPart[];
}

export function getScaledBodyParts(
  composition: BodyComposition,
  factor: number,
): BodyPart[] {
  return [
    ...composition.baseParts,
    ...flatten(times(factor - 1, () => composition.extraParts)),
  ];
}

/*
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

export function getMaximalScaledBodyParts(
  composition: BodyComposition,
  energyAvailable: number,
): Result<BodyPart[], "minimum-energy-not-met"> {
  const factor = getMaximalCompositionFactor(composition, energyAvailable);
  const scaledBodyPartsResult = getScaledBodyParts(composition, factor);

  const sortedBodyParts = scaledBodyPartsResult.isOk()
    ? composition.sortParts
      ? composition.sortParts(scaledBodyPartsResult.value)
      : scaledBodyPartsResult.value
    : [];

  if (scaledBodyPartsResult.isOk()) {
    return ok(sortedBodyParts);
  } else {
    return err("minimum-energy-not-met");
  }
}
*/
