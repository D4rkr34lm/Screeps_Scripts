import { TaskBoard } from "../phases/founding/farmer";

interface BehaviorContext<Memory> {
    taskBoard: TaskBoard;
    memory: Memory;
    myRoom: Room;
    me: Creep;
}

interface CreepDefinition<Memory = unknown> {
    getMemoryDefault: () => Memory;
    runBehavior: (context: BehaviorContext<Memory>) => void;
}

export function defineCreep<Memory>({
    memoryDefaultFactory,
    behavior,
}: {
    memoryDefaultFactory: () => Memory;
    behavior: (context: BehaviorContext<Memory>) => void;
}): CreepDefinition<Memory> {
    return {
        getMemoryDefault: memoryDefaultFactory,
        runBehavior: behavior,
    };
}
