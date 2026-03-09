import { first } from "lodash-es";
import { hasNoValue, hasValue } from "../uitls";

function getBestSourceToMine(creep: Creep) {
  const sources = creep.room.find(FIND_SOURCES);
  const sourcesByFeasibility = sources.sort(
    (a, b) =>
      a.pos.getRangeTo(creep) * (a.energy / 3000) -
      b.pos.getRangeTo(creep) * (b.energy / 3000),
  );
  const targetSource = first(sourcesByFeasibility);

  if (hasNoValue(targetSource)) {
    throw new Error("No sources found in the room");
  }

  return targetSource;
}

function getBestContainerToWithdraw(creep: Creep) {
  const containersWithEnergy = creep.room
    .find(FIND_STRUCTURES, {
      filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
    })
    .filter((container) => container.store[RESOURCE_ENERGY] > 0)
    .sort((a, b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);

  const originContainer = first(containersWithEnergy);

  return originContainer;
}

export function getEnergy(creep: Creep) {
  const originContainer = getBestContainerToWithdraw(creep);

  if (hasValue(originContainer)) {
    const creepMemory = creep.memory as {
      harvesting?: boolean;
      originContainer?: Id<StructureContainer>;
    };

    if (
      hasNoValue(creepMemory.harvesting) ||
      !creepMemory.harvesting ||
      hasNoValue(creepMemory.originContainer)
    ) {
      creepMemory.harvesting = true;
      creepMemory.originContainer = originContainer.id;
    }

    const container = Game.getObjectById(creepMemory.originContainer);

    if (hasNoValue(container)) {
      console.log(
        `[ERR][getEnergy]: Invalid container ID ${creepMemory.originContainer}`,
      );
      return;
    }

    if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(container, {
        visualizePathStyle: { stroke: "#ffaa00" },
      });
    }
  } else {
    const creepMemory = creep.memory as {
      harvesting?: boolean;
      sourceToMine?: Id<Source>;
    };

    if (
      hasNoValue(creepMemory.harvesting) ||
      !creepMemory.harvesting ||
      hasNoValue(creepMemory.sourceToMine)
    ) {
      creepMemory.harvesting = true;
      creepMemory.sourceToMine = getBestSourceToMine(creep).id;
    }

    const source = Game.getObjectById(creepMemory.sourceToMine);

    if (hasNoValue(source)) {
      console.log(
        `[ERR][getEnergy]: Invalid source ID ${creepMemory.sourceToMine}`,
      );
      return;
    }

    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  }
}
