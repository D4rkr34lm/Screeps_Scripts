import { times } from "lodash-es";
import { Resolver } from "../../resolver";
import { createTask, Task } from "../../tasks/createTask";
import { Colony } from "../colony";
import { definedTasks } from "../../tasks/definitions";
import { TaskPriority } from "../../tasks/priority";
import { hasValue } from "../../uitls";
import { ColonyStage } from "../colonyStage";

export const foundingStage: ColonyStage<"founding"> = {
  name: "founding",
  isComplete: (colony: Colony) => {
    const sourceDevelopmentCompleted = colony.resources.every(
      (resource) =>
        resource.type === "source" &&
        resource.kind === "local" &&
        resource.state === "containerized",
    );

    const room = Resolver.getRoom(colony.room);
    const controller = room.controller;

    const controllerUpgradingCompleted =
      hasValue(controller) && controller.level >= 2;

    const extensionConstructionCompleted =
      room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
      }).length === 5;

    return (
      sourceDevelopmentCompleted &&
      controllerUpgradingCompleted &&
      extensionConstructionCompleted
    );
  },
  planNewTasks: (colony: Colony) => {
    const room = Resolver.getRoom(colony.room);

    const newTasks: Task[] = [];

    if (room.energyAvailable < room.energyCapacityAvailable) {
      const fillSpawnTasks = colony.tasks.filter(
        (task) => task.type === "fill-spawn",
      );

      const newFillTasks = times(3 - fillSpawnTasks.length, () =>
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

      const newUpgradeTasks = times(
        (roomController.level < 2 ? 5 : 1) - upgradeControllerTasks.length,
        () =>
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

    if (
      room.find(FIND_CONSTRUCTION_SITES).length > 0 &&
      hasValue(roomController) &&
      roomController.level >= 2
    ) {
      const buildTasks = colony.tasks.filter(
        (task) => task.type === "build-structure",
      );

      const newBuildTasks = times(5 - buildTasks.length, () =>
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

    const totalFounders = founders.length + founderIntents.length;

    return times(8 - totalFounders, () => ({
      role: "founder",
      targetLevel: 1,
    }));
  },
};
