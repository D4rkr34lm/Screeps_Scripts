import { times } from "lodash-es";

export const ACCEPTABLE_HITS_LOSS = 1000;

/** Maximum size of a raw memory segment is 100kb */
export const RAW_MEMORY_SEGMENT_SIZE = 100 * 1000;
export const INBOUND_MEMORY_SEGMENT = 0;
export const SEGMENTS_RESERVED_FOR_ANALYTICS = times(10, (i) => i + 1);
