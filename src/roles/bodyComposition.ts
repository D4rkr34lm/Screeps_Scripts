import { flatten, times } from "lodash-es";
import { BodyPart, getBodyCost } from "./bodyParts";
import { err, ok, Result } from "neverthrow";

const MAX_BODY_PARTS = 50;

export interface BodyComposition {
  baseParts: BodyPart[];
  extraParts: BodyPart[];
}

function getScaledBodyParts(
  composition: BodyComposition,
  factor: number,
): Result<BodyPart[], "factor-too-low"> {
  if (factor < 1) {
    return err("factor-too-low");
  }

  return ok([
    ...composition.baseParts,
    ...flatten(times(factor - 1, () => composition.extraParts)),
  ]);
}

function getMaximalCompositionFactor(
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

  if (scaledBodyPartsResult.isOk()) {
    return ok(scaledBodyPartsResult.value);
  } else {
    return err("minimum-energy-not-met");
  }
}
