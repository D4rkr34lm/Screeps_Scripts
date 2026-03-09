import { flatMap } from "lodash-es";
import { getPositionsInRange } from "./position";
import { Resolver } from "./resolver";
import { hasNoValue, hasValue, TypedId } from "./uitls";

interface Position {
  roomId: TypedId<Room>;
  x: number;
  y: number;
}

interface SourceResource {
  type: "source";
  id: TypedId<Source>;
}

export type MinableResource = SourceResource;

interface UndevelopedResource {
  type: "undeveloped";
  resource: MinableResource;
}

interface DevelopingResource {
  type: "developing";
  resource: MinableResource;
  outputPosition: Position;
}

interface DevelopedResource {
  type: "developed";
  resource: MinableResource;
  outputContainer: TypedId<StructureContainer>;
}

export type ManagedResource =
  | UndevelopedResource
  | DevelopingResource
  | DevelopedResource;

export function developResource(
  resource: UndevelopedResource,
): DevelopingResource {
  const target = Resolver.getSource(resource.resource.id);

  const targetPosition = target.pos;

  const surroundingPositions = getPositionsInRange(targetPosition, 1);

  const constructionSitePosition = surroundingPositions.find((pos) => {
    const terrain = pos.lookFor(LOOK_TERRAIN)[0];
    const structures = pos.lookFor(LOOK_STRUCTURES);

    return terrain !== "wall" && structures.length === 0;
  });

  if (hasNoValue(constructionSitePosition)) {
    throw new Error(
      `No valid construction site position found for resource ${resource.resource.id}`,
    );
  }

  const constructionSiteResult =
    constructionSitePosition.createConstructionSite(STRUCTURE_CONTAINER);

  if (constructionSiteResult !== OK) {
    throw new Error(
      `Failed to create construction site for resource ${resource.resource.id}: ${constructionSiteResult}`,
    );
  }

  return {
    type: "developing",
    resource: resource.resource,
    outputPosition: {
      x: constructionSitePosition.x,
      y: constructionSitePosition.y,
      roomId: constructionSitePosition.roomName as TypedId<Room>,
    },
  };
}

export function syncResourceDevelopmentState(
  resource: ManagedResource,
): ManagedResource {
  if (resource.type === "developing") {
    const targetPosition = new RoomPosition(
      resource.outputPosition.x,
      resource.outputPosition.y,
      resource.outputPosition.roomId,
    );

    const constructionSide = targetPosition
      .lookFor(LOOK_CONSTRUCTION_SITES)
      .find((structure) => structure.structureType === STRUCTURE_CONTAINER);

    const container = targetPosition
      .lookFor(LOOK_STRUCTURES)
      .find((structure) => structure.structureType === STRUCTURE_CONTAINER);

    if (hasValue(container)) {
      return {
        type: "developed",
        resource: resource.resource,
        outputContainer: container.id as string as TypedId<StructureContainer>,
      };
    } else if (hasNoValue(constructionSide)) {
      return developResource({
        type: "undeveloped",
        resource: resource.resource,
      });
    } else {
      return resource;
    }
  } else if (resource.type === "developed") {
    const container = Game.getObjectById(
      resource.outputContainer as string as Id<StructureContainer>,
    );

    if (hasNoValue(container)) {
      return developResource({
        type: "undeveloped",
        resource: resource.resource,
      });
    } else {
      return resource;
    }
  } else {
    return resource;
  }
}

export function initializeResource(resource: MinableResource): ManagedResource {
  const target = Resolver.getSource(resource.id);

  const targetPosition = target.pos;

  const surroundingPositions = getPositionsInRange(targetPosition, 1);

  const existingContainer = flatMap(surroundingPositions, (pos) =>
    pos.lookFor(LOOK_STRUCTURES),
  ).find((structure) => structure.structureType === STRUCTURE_CONTAINER);

  const existingConstructionSite = flatMap(surroundingPositions, (pos) =>
    pos.lookFor(LOOK_CONSTRUCTION_SITES),
  ).find((structure) => structure.structureType === STRUCTURE_CONTAINER);

  if (hasValue(existingContainer)) {
    return {
      type: "developed",
      resource,
      outputContainer:
        existingContainer.id as string as TypedId<StructureContainer>,
    };
  } else if (hasValue(existingConstructionSite)) {
    return {
      type: "developing",
      resource,
      outputPosition: {
        x: existingConstructionSite.pos.x,
        y: existingConstructionSite.pos.y,
        roomId: existingConstructionSite.pos.roomName as TypedId<Room>,
      },
    };
  } else {
    return {
      type: "undeveloped",
      resource,
    };
  }
}
