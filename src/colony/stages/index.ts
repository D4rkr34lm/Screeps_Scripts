import { buildupStage } from "./buildup";
import { foundingStage } from "./founding";

export const definedColonyStages = {
  founding: foundingStage,
  buildup: buildupStage,
};

export type ColonyStageName = keyof typeof definedColonyStages;

const stagesInOrder: ColonyStageName[] = ["founding", "buildup"];

export function getNextColonyStage(
  currentStage: ColonyStageName,
): ColonyStageName | null {
  const currentIndex = stagesInOrder.indexOf(currentStage);

  if (currentIndex === -1 || currentIndex === stagesInOrder.length - 1) {
    return null;
  }

  return stagesInOrder[currentIndex + 1] ?? null;
}
