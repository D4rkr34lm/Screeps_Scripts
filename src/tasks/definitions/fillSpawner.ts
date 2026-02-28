import { hasValue } from "../../uitls";
import { defineTask } from "../defineTask";

export const fillSpawnerTaskDefinition = defineTask<
  {
    spawnId: Id<StructureSpawn>;
    totalAmount: number;
  },
  { amount: number }
>({
  name: "fill-spawner",
  createStartState: () => ({ amount: 0 }),
  isFinished: ({ constraints, state }) => {
    return state.amount >= constraints.totalAmount;
  },
  execute: ({ creep, room, constraints, state }) => {
    const spawn = Game.getObjectById(constraints.spawnId);

    if (hasValue(spawn)) {
      const energyInCarry = creep.store.energy;
      const energyNeeded = constraints.totalAmount - state.amount;
      const energyToTransfer = Math.min(energyInCarry, energyNeeded);

      const transferResult = creep.transfer(
        spawn,
        RESOURCE_ENERGY,
        energyToTransfer,
      );

      if (transferResult === ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn);
      } else if (transferResult !== OK) {
        console.error({
          roomName: room.name,
          creepName: creep.name,
          code: transferResult,
          message: "Failed to transfer energy to spawn",
        });
      } else {
        return {
          amount: state.amount + energyToTransfer,
        };
      }
    } else {
      console.warn({
        roomName: room.name,
        creepName: creep.name,
        code: "SPAWN_NOT_FOUND",
        message: `Spawn with ID ${constraints.spawnId} not found`,
      });
    }
  },
});
