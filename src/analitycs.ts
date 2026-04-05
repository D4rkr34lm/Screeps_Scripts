import { first, includes } from "lodash-es";
import {
  RAW_MEMORY_SEGMENT_SIZE,
  SEGMENTS_RESERVED_FOR_ANALYTICS,
} from "./constants";
import { hasNoValue, hasValue } from "./uitls";

interface PerformanceEvent {
  name: "performance";
  shard: string;
  data: {
    bucketSize: number;
    usedCPU: number;
  };
}

type Event = PerformanceEvent;

interface Analytics {
  recordEvent(event: Event): void;
  flushEvents(): AnalyticsMeta;
}

export interface AnalyticsMeta {
  reservedSegments: number[];
  filledSegments: number[];
  currentOutSegment: number | null;
  nextOutSegment: number | null;
}

export function updateAnalyticsMetaWithInboundData(
  meta: AnalyticsMeta,
  readDataSegments: number[],
) {
  const newFilledSegments = meta.filledSegments.filter(
    (segment) => !includes(readDataSegments, segment),
  );

  return {
    ...meta,
    filledSegments: newFilledSegments,
  };
}

let analyticsSingleton: Analytics | null = null;

export function initializeAnalyticsMeta(): AnalyticsMeta {
  const initialCurrentSegment = first(SEGMENTS_RESERVED_FOR_ANALYTICS);
  const initialNextSegment = SEGMENTS_RESERVED_FOR_ANALYTICS.find(
    (index) => index !== initialCurrentSegment,
  );

  if (hasNoValue(initialCurrentSegment) || hasNoValue(initialNextSegment)) {
    console.log(
      "[ERR][ANALYTICS]: Failed to initialize analytics meta due to insufficient reserved segments",
    );
    throw new Error("Failed to initialize analytics meta");
  }

  return {
    reservedSegments: SEGMENTS_RESERVED_FOR_ANALYTICS,
    filledSegments: [],
    currentOutSegment: initialCurrentSegment,
    nextOutSegment: initialNextSegment,
  };
}

const activeAnalytics: Analytics | null = null;

export function instantiateAnalytics(meta: AnalyticsMeta): Analytics {
  if (hasValue(analyticsSingleton)) {
    return analyticsSingleton;
  }

  const SERIALIZATION_VERSION = 1;
  const DIVIDER = ",";

  const currentTick = Game.time;
  const recordedEvents: Event[] = [];

  function recordEvent(event: Event) {
    recordedEvents.push(event);
  }

  function flushEvents(): AnalyticsMeta {
    const eventsWrapped = {
      version: SERIALIZATION_VERSION,
      tick: currentTick,
      events: recordedEvents,
    };
    const serialized = JSON.stringify(eventsWrapped);

    console.log(
      `[INFO][ANALYTICS]: Flushing ${recordedEvents.length} events, total size ${serialized.length} chars`,
    );

    const segmentIndex = meta.currentOutSegment;

    if (hasNoValue(segmentIndex)) {
      console.log(
        "[ERR][ANALYTICS]: All analytics segments are filled, cannot record analytics for this tick",
      );
      return meta;
    }

    const segment = RawMemory.segments[segmentIndex];

    if (hasNoValue(segment)) {
      console.log(
        `[ERR][ANALYTICS]: Segment ${segmentIndex} is not accessible, cannot record analytics for this tick`,
      );
      return meta;
    }

    const outData = segment + DIVIDER + serialized;

    if (outData.length > RAW_MEMORY_SEGMENT_SIZE) {
      console.log(
        `[INFO][ANALYTICS]: Current segment ${segmentIndex} is full, moving to next segment for analytics recording`,
      );

      const nextSegmentIndex = meta.nextOutSegment;

      if (hasNoValue(nextSegmentIndex)) {
        console.log(
          "[ERR][ANALYTICS]: No next segment available for analytics recording, cannot record analytics for this tick",
        );
        return meta;
      }

      const nextSegment = RawMemory.segments[nextSegmentIndex];

      if (hasNoValue(nextSegment)) {
        console.log(
          `[ERR][ANALYTICS]: Next segment ${nextSegmentIndex} is not accessible, cannot record analytics for this tick`,
        );
        return meta;
      }

      RawMemory.segments[nextSegmentIndex] = serialized;

      const newNextSegment =
        meta.reservedSegments.find(
          (segment) =>
            segment !== meta.currentOutSegment &&
            !includes(meta.filledSegments, segment),
        ) ?? null;

      return {
        reservedSegments: meta.reservedSegments,
        filledSegments: [...meta.filledSegments, segmentIndex],
        currentOutSegment: nextSegmentIndex,
        nextOutSegment: newNextSegment,
      };
    } else {
      RawMemory.segments[segmentIndex] = outData;
      return meta;
    }
  }

  const analytics: Analytics = {
    recordEvent,
    flushEvents,
  };
  analyticsSingleton = analytics;

  return analytics;
}

export function useAnalytics(): Analytics {
  if (hasValue(activeAnalytics)) {
    return activeAnalytics;
  } else {
    throw new Error("Analysis was not initialized before use");
  }
}
