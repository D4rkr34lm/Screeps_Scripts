import { every, has, isArray, isNumber, isObject } from "lodash-es";
import { INBOUND_MEMORY_SEGMENT } from "./constants";
import { hasNoValue } from "./uitls";

interface InboundMemory {
  readAnalyticsSegments?: number[];
}

function validateInboundMemory(memory: unknown): memory is InboundMemory {
  if (
    isObject(memory) &&
    has(memory, "readAnalyticsSegments") &&
    isArray(memory.readAnalyticsSegments) &&
    every(memory.readAnalyticsSegments, isNumber)
  ) {
    return true;
  } else {
    return false;
  }
}

export function getInboundMemory(): InboundMemory {
  const inboundMemorySegment = RawMemory.segments[INBOUND_MEMORY_SEGMENT];

  if (hasNoValue(inboundMemorySegment)) {
    console.log(
      "[ERR][INBOUND_MEMORY]: Failed to read inbound memory segment.",
    );
    return {};
  }

  const parsedInboundMemory = JSON.parse(inboundMemorySegment);
  if (!validateInboundMemory(parsedInboundMemory)) {
    console.log(
      "[ERR][INBOUND_MEMORY]: Inbound memory segment has invalid format.",
    );
    return {};
  } else {
    return parsedInboundMemory;
  }
}
