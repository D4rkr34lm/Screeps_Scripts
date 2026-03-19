import { times } from "lodash-es";
import { Resolver } from "../../resolver";
import { createTask, Task } from "../../tasks/createTask";
import { Colony } from "../colony";
import { definedTasks } from "../../tasks/definitions";
import { TaskPriority } from "../../tasks/priority";
import { hasValue } from "../../uitls";
import { ColonyStage } from "../colonyStage";
import { getHarvestPositionForResource } from "../../resources";

export const buildupStage: ColonyStage<"buildup"> = {
  name: "buildup",
  isComplete: () => false,
  planNewTasks: (colony: Colony) => {
    const room = Resolver.getRoom(colony.room);

    const newTasks: Task[] = [];

    if (room.energyAvailable < room.energyCapacityAvailable) {
      const fillSpawnTasks = colony.tasks.filter(
        (task) => task.type === "fill-spawn",
      );

      const newFillTasks = times(2 - fillSpawnTasks.length, () =>
        createTask(
          definedTasks["fill-spawn"],
          {
            targetRoom: colony.room,
          },
          TaskPriority.HIGH,
        ),
      );

      newTasks.push(...newFillTasks);
    }

    const roomController = room.controller;
    if (hasValue(roomController)) {
      const upgradeControllerTasks = colony.tasks.filter(
        (task) => task.type === "upgrade-controller",
      );

      const newUpgradeTasks = times(2 - upgradeControllerTasks.length, () =>
        createTask(
          definedTasks["upgrade-controller"],
          {
            target: roomController.id,
            targetLevel: 2,
          },
          TaskPriority.MEDIUM,
        ),
      );

      newTasks.push(...newUpgradeTasks);
    }

    if (room.find(FIND_CONSTRUCTION_SITES).length > 0) {
      const buildTasks = colony.tasks.filter(
        (task) => task.type === "build-structure",
      );

      const newBuildTasks = times(2 - buildTasks.length, () =>
        createTask(
          definedTasks["build-structure"],
          {
            room: colony.room,
          },
          TaskPriority.MEDIUM,
        ),
      );

      newTasks.push(...newBuildTasks);
    }

    const developedLocalSources = colony.resources.filter(
      (resource) => resource.state === "containerized",
    );

    const sourceHarvestingTasks = colony.tasks.filter(
      (task) => task.type === "harvest-resource",
    );

    const newSourceHarvestingTasks = developedLocalSources
      .filter((resource) => {
        const alreadyPlanned = sourceHarvestingTasks.some(
          (task) => task.parameters.resourceId === resource.sourceId,
        );

        return !alreadyPlanned;
      })
      .map((resource) =>
        createTask(
          definedTasks["harvest-resource"],
          {
            resourceId: resource.sourceId,
            outputContainerId: resource.containerId,
            harvestingPosition: getHarvestPositionForResource(resource),
          },
          TaskPriority.HIGH,
        ),
      );

    newTasks.push(...newSourceHarvestingTasks);

    return newTasks;
  },
  planNewCreeps: (colony: Colony) => {
    const founders = colony.creeps.filter((creepRef) => {
      const creep = Resolver.getCreep(creepRef);
      return hasValue(creep) && creep.memory.role === "founder";
    });

    const founderIntents = colony.spawnIntents.filter(
      (intent) => intent.role === "founder",
    );

    const heavyWorkers = colony.creeps.filter((creepRef) => {
      const creep = Resolver.getCreep(creepRef);
      return hasValue(creep) && creep.memory.role === "heavy-worker";
    });

    const heavyWorkerIntents = colony.spawnIntents.filter(
      (intent) => intent.role === "heavy-worker",
    );

    const totalFounders = founders.length + founderIntents.length;
    const totalHeavyWorkers = heavyWorkers.length + heavyWorkerIntents.length;

    const requiredHeavyWorkers = colony.resources.filter(
      (resource) => resource.state === "containerized",
    ).length;

    return [
      ...times(8 - totalFounders, () => ({
        role: "founder" as const,
        targetLevel: 1,
      })),
      ...times(requiredHeavyWorkers - totalHeavyWorkers, () => ({
        role: "heavy-worker" as const,
        targetLevel: 1,
      })),
    ];
  },
};
