import { flatMap } from "lodash-es";
import { getPositionsInRange } from "./position";
import { hasNoValue, hasValue } from "./uitls";

interface ClaimedLocalSource {
  type: "source";
  kind: "local";
  sourceId: Id<Source>;
}

interface ContainerizedSource extends ClaimedLocalSource {
  state: "containerized";
  containerId: Id<StructureContainer>;
}

interface LinkedSource extends ClaimedLocalSource {
  state: "linked";
  linkId: Id<StructureLink>;
}

interface DevelopingSource extends ClaimedLocalSource {
  state: "developing";
}

interface UndevelopedSource extends ClaimedLocalSource {
  state: "undeveloped";
}

type StateFullClaimedLocalSource =
  | ContainerizedSource
  | LinkedSource
  | DevelopingSource
  | UndevelopedSource;

export type ClaimedResource = StateFullClaimedLocalSource;

export function syncLocalSource(
  resource: Id<Source>,
): StateFullClaimedLocalSource {
  const target = Game.getObjectById(resource);

  if (hasNoValue(target)) {
    throw new Error(`Could not find resource with id ${resource}`);
  }

  const targetPosition = target.pos;

  const surroundingPositions = getPositionsInRange(targetPosition, 2);

  const existingOutput = flatMap(surroundingPositions, (pos) =>
    pos.lookFor(LOOK_STRUCTURES),
  ).find(
    (structure) =>
      structure.structureType === STRUCTURE_CONTAINER ||
      structure.structureType === STRUCTURE_LINK,
  );

  const existingConstructionSite = flatMap(surroundingPositions, (pos) =>
    pos.lookFor(LOOK_CONSTRUCTION_SITES),
  ).find(
    (structure) =>
      structure.structureType === STRUCTURE_CONTAINER ||
      structure.structureType === STRUCTURE_LINK,
  );

  if (
    hasValue(existingOutput) &&
    existingOutput.structureType === STRUCTURE_CONTAINER
  ) {
    return {
      type: "source",
      kind: "local",
      sourceId: resource,
      state: "containerized",
      containerId: existingOutput.id as Id<StructureContainer>,
    };
  } else if (
    hasValue(existingOutput) &&
    existingOutput.structureType === STRUCTURE_LINK
  ) {
    return {
      type: "source",
      kind: "local",
      sourceId: resource,
      state: "linked",
      linkId: existingOutput.id as Id<StructureLink>,
    };
  } else if (hasValue(existingConstructionSite)) {
    return {
      type: "source",
      kind: "local",
      sourceId: resource,
      state: "developing",
    };
  } else {
    return {
      type: "source",
      kind: "local",
      sourceId: resource,
      state: "undeveloped",
    };
  }
}

export function getHarvestPositionForResource(
  resource: ClaimedResource,
): RoomPosition {
  const target = Game.getObjectById(resource.sourceId);

  if (hasNoValue(target)) {
    throw new Error(`Could not find resource with id ${resource.sourceId}`);
  }

  if (resource.state === "containerized" || resource.state === "linked") {
    const outputStructure = Game.getObjectById(
      resource.state === "containerized"
        ? resource.containerId
        : resource.linkId,
    );

    if (hasNoValue(outputStructure)) {
      throw new Error(
        `Could not find output structure for resource with id ${resource.sourceId}`,
      );
    }

    const potentialPositionForHarvesting = getPositionsInRange(target.pos, 1);
    const potentialPositionForOutput = getPositionsInRange(
      outputStructure.pos,
      1,
    );

    const harvestingPosition = potentialPositionForHarvesting.find((position) =>
      potentialPositionForOutput.some((outputPosition) =>
        outputPosition.isEqualTo(position),
      ),
    );

    if (hasNoValue(harvestingPosition)) {
      throw new Error(
        `Could not find harvesting position for resource with id ${resource.sourceId}`,
      );
    }

    return harvestingPosition;
  } else {
    const potentialPositionsForHarvesting = getPositionsInRange(target.pos, 1);

    const harvestingPosition = potentialPositionsForHarvesting.find(
      (position) => position.lookFor(LOOK_TERRAIN)[0] !== "wall",
    );

    if (hasNoValue(harvestingPosition)) {
      throw new Error(
        `Could not find harvesting position for resource with id ${resource.sourceId}`,
      );
    }

    return harvestingPosition;
  }
}
