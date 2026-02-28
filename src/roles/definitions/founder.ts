import { first } from "lodash-es";
import { getBodyCost } from "../../bodyParts";
import { defineRole } from "../defineRole";
import { hasValue } from "../../uitls";
import { executeTask } from "../../tasks/executeTask";

const level1Composition = [WORK, CARRY, MOVE];

export const founderRole = defineRole<{
  currentState: "harvesting" | "executing-task" | "upgrading-controller";
}>({
  name: "founder",
  compositionsLevel: [
    {
      cost: getBodyCost(level1Composition),
      parts: level1Composition,
    },
  ],
  behavior: ({ creep, room, memory, task }) => {
    switch (memory.currentState) {
      case "harvesting":
        {
          if (creep.store.getFreeCapacity() === 0) {
            return {
              currentState: "executing-task",
            };
          }

          const source = first(room.find(FIND_SOURCES_ACTIVE));

          if (hasValue(source)) {
            const harvestResult = creep.harvest(source);

            if (harvestResult === ERR_NOT_IN_RANGE) {
              creep.moveTo(source);
            } else if (harvestResult !== OK) {
              console.error({
                roomName: room.name,
                creepName: creep.name,
                code: harvestResult,
                message: "Failed to harvest source",
              });
            }
          } else {
            console.warn({
              roomName: room.name,
              creepName: creep.name,
              code: "NO_ACTIVE_SOURCE",
              message: "No active source found for harvesting",
            });
          }
        }
        break;
      case "executing-task":
        {
          if (creep.store.energy === 0) {
            return {
              currentState: "harvesting",
            };
          }

          if (hasValue(task)) {
            executeTask({ creep, room, task });
          } else {
            return {
              currentState: "upgrading-controller",
            };
          }
        }
        break;

      case "upgrading-controller": {
        if (creep.store.energy === 0) {
          return {
            currentState: "harvesting",
          };
        }

        const controller = room.controller;

        if (!hasValue(controller)) {
          console.warn({
            roomName: room.name,
            creepName: creep.name,
            code: "CONTROLLER_NOT_FOUND",
            message: "No controller found in the room",
          });
          return;
        }

        const upgradeResult = creep.upgradeController(controller);

        if (upgradeResult === ERR_NOT_IN_RANGE) {
          creep.moveTo(controller);
        } else if (upgradeResult !== OK) {
          console.error({
            roomName: room.name,
            creepName: creep.name,
            code: upgradeResult,
            message: "Failed to upgrade controller",
          });
        }

        if (hasValue(task)) {
          return {
            currentState: "executing-task",
          };
        }
      }
    }
  },
});
