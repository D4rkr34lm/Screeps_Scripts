import { first, values } from "lodash-es";
import { defineCreep } from "../../utils/creepDefinition";

interface FarmerMemory {
    mode: "harvesting" | "idle" | "working";
    assignedTaskId: string | null;
}

type TaskType = "fillSpawn" | "upgradeController" | "buildConstructionSite";

interface Task<Type extends TaskType = TaskType, Data = unknown> {
    id: string;

    type: Type;
    requiredCreepCount: number;
    assignedCreepNames: string[];
    status: "pending" | "progressing" | "completed";

    additionalData: Data;
}

type FillSpawnTask = Task<"fillSpawn", { spawnId: Id<StructureSpawn> }>;
type UpgradeControllerTask = Task<
    "upgradeController",
    { controllerId: Id<StructureController> }
>;
type BuildConstructionSiteTask = Task<
    "buildConstructionSite",
    { constructionSiteId: Id<ConstructionSite> }
>;

export interface TaskBoard {
    tasks: { [taskId: string]: Task };
}

function executeTask(creep: Creep, task: Task) {
    switch (task.type) {
        case "fillSpawn":
            return executeFillSpawnTask(creep, task as FillSpawnTask);
        case "upgradeController":
            return executeUpgradeControllerTask(
                creep,
                task as UpgradeControllerTask,
            );
        case "buildConstructionSite":
            return executeBuildConstructionSite(
                creep,
                task as BuildConstructionSiteTask,
            );
        default:
            return console.error("Unknown task type", { taskType: task.type });
    }
}

function executeFillSpawnTask(creep: Creep, task: FillSpawnTask) {
    const spawn = Game.getObjectById(task.additionalData.spawnId);
    if (!spawn) {
        return console.error("Spawn not found for task", {
            taskId: task.id,
            spawnId: task.additionalData.spawnId,
        });
    }

    const transferResult = creep.transfer(spawn, RESOURCE_ENERGY);

    if (transferResult === ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn);
    } else if (transferResult !== OK) {
        console.error("Failed to transfer energy to spawn", {
            creepName: creep.name,
            spawnId: spawn.id,
            transferResult,
        });
    }
}

function executeUpgradeControllerTask(
    creep: Creep,
    task: UpgradeControllerTask,
) {
    const controller = Game.getObjectById(task.additionalData.controllerId);
    if (!controller) {
        console.error("Controller not found for task", {
            taskId: task.id,
            controllerId: task.additionalData.controllerId,
        });
        return;
    }

    const upgradeResult = creep.upgradeController(controller);

    if (upgradeResult === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller);
    } else if (upgradeResult !== OK) {
        console.error("Failed to upgrade controller", {
            creepName: creep.name,
            controllerId: controller.id,
            upgradeResult,
        });
    }
}

function executeBuildConstructionSite(
    creep: Creep,
    task: BuildConstructionSiteTask,
) {
    const constructionSite = Game.getObjectById(
        task.additionalData.constructionSiteId,
    );
    if (!constructionSite) {
        console.error("Construction site not found for task", {
            taskId: task.id,
            constructionSiteId: task.additionalData.constructionSiteId,
        });
        return;
    }

    const buildResult = creep.build(constructionSite);

    if (buildResult === ERR_NOT_IN_RANGE) {
        creep.moveTo(constructionSite);
    } else if (buildResult !== OK) {
        console.error("Failed to build construction site", {
            creepName: creep.name,
            constructionSiteId: constructionSite.id,
            buildResult,
        });
    }
}

export const creep = defineCreep<FarmerMemory>({
    memoryDefaultFactory: () => ({ mode: "harvesting", assignedTaskId: null }),
    behavior: ({ me, myRoom, memory, taskBoard }) => {
        if (memory.mode === "harvesting") {
            const source = first(myRoom.find(FIND_SOURCES));
            if (!source) {
                return console.error("No source found in room", myRoom.name);
            }

            const harvestResult = me.harvest(source);

            if (harvestResult === ERR_NOT_IN_RANGE) {
                me.moveTo(source);
            } else if (harvestResult !== OK) {
                console.error("Failed to harvest", {
                    creepName: me.name,
                    sourceId: source.id,
                    harvestResult,
                });
            }

            if (me.store.getFreeCapacity() === 0) {
                if (memory.assignedTaskId) {
                    memory.mode = "working";
                } else {
                    memory.mode = "idle";
                }
            }
        }

        if (memory.mode === "idle") {
            // Look for a new task to work on
            const availableTasks = values(taskBoard.tasks).filter(
                (task) =>
                    task.status !== "completed" &&
                    task.assignedCreepNames.length < task.requiredCreepCount,
            );

            const taskToAssign = first(availableTasks);

            if (taskToAssign) {
                taskToAssign.assignedCreepNames.push(me.name);
                memory.assignedTaskId = taskToAssign.id;
                memory.mode = "working";
            }
        }

        if (memory.mode === "working") {
            if (!memory.assignedTaskId) {
                console.error("Creep in working mode without assigned task", {
                    creepName: me.name,
                });
                memory.mode = "idle";
                return;
            }

            const task = taskBoard.tasks[memory.assignedTaskId];
            if (!task) {
                console.error("Assigned task not found on task board", {
                    creepName: me.name,
                    taskId: memory.assignedTaskId,
                });
                memory.mode = "idle";
                return;
            }

            if (me.store[RESOURCE_ENERGY] === 0) {
                // If we run out of energy while working, go back to harvesting
                memory.mode = "harvesting";
                return;
            }

            executeTask(me, task);
        }
    },
});
