import { foundingStage } from "./founding";

export const definedColonyStages = {
  founding: foundingStage,
};

export type ColonyStageName = keyof typeof definedColonyStages;
