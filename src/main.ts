import { first, values } from "lodash-es";
import { useAgentStorage } from "./agents/agentStorage";
import { executeAgent } from "./execution/executeAgent";
import { hasNoValue } from "./uitls";
import { useAgentService } from "./agents/agentService";
import { agentDefinitions } from "./agents/definitions";
import { useTaskService } from "./tasks/taskService";
import { taskDefinitions } from "./tasks/definitions";

export default function loop() {
  const agentStorage = useAgentStorage();

  console.log(`Debug mode is enabled - running tick ${Game.time}`);
  console.log(`Current CPU bucket: ${Game.cpu.bucket}`);

  const myCreeps = Game.creeps;

  for (const creepName in myCreeps) {
    const agent = agentStorage.loadAgent(creepName);

    if (agent !== null) {
      try {
        executeAgent({
          creep: agent.creep,
          room: agent.creep.room,
          agent,
        });
      } catch (error) {
        console.error({
          roomName: agent.creep.room.name,
          creepName: agent.creep.name,
          code: "AGENT_EXECUTION_ERROR",
          message: `An error occurred during agent execution: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }
  }

  const myRoom = first(values(Game.rooms));

  if (hasNoValue(myRoom)) {
    console.error({
      code: "NO_ROOM_FOUND",
      message: "No room found for the player.",
    });
    return;
  }

  const taskService = useTaskService();

  const openTasks = taskService.getOpenTasks();
  const idleAgents = agentStorage.listAgents();

  if (myRoom.energyAvailable < 300) {
    const spawnId = first(myRoom.find(FIND_MY_SPAWNS))?.id;

    if (hasNoValue(spawnId)) {
      console.error({
        roomName: myRoom.name,
        code: "NO_SPAWN_FOUND",
        message: "No spawn found in the room for creating fillSpawner task.",
      });
      return;
    }

    taskService.createTask(taskDefinitions.fillSpawner, {
      spawnId: spawnId,
      totalAmount: 300,
    });
  }

  for (const agent of idleAgents) {
    if (hasNoValue(agent.memory.currentTaskId)) {
      const taskToAssign = first(openTasks);

      if (hasNoValue(taskToAssign)) {
        console.log({
          roomName: myRoom.name,
          agentId: agent.id,
          message: "No open tasks available for assignment.",
        });
        continue;
      }

      try {
        taskService.assignTask(taskToAssign, agent);
        console.log({
          roomName: myRoom.name,
          agentId: agent.id,
          taskId: taskToAssign.id,
          message: `Assigned task ${taskToAssign.id} to agent ${agent.id}.`,
        });
      } catch (error) {
        console.error({
          roomName: myRoom.name,
          agentId: agent.id,
          taskId: taskToAssign.id,
          code: "TASK_ASSIGNMENT_ERROR",
          message: `Failed to assign task ${taskToAssign.id} to agent ${agent.id}: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }
  }

  const existingAgents = agentStorage.listAgents();
  if (existingAgents.length < 5) {
    const agentService = useAgentService();

    agentService.createAgent(agentDefinitions.founder, myRoom);
  }
}
