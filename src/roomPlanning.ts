import { flatten, times } from "lodash-es";
import { TypedId } from "./uitls";

const ROOM_SIZE = 50;

function getPotentialRoomCoordinates() {
  const xs = times(ROOM_SIZE, (i) => i);
  const ys = times(ROOM_SIZE, (i) => i);

  const coordinates = flatten(xs.map((x) => ys.map((y) => ({ x, y }))));
  return coordinates;
}

function planRoom(room: Room) {
  const reachabilityMatrix = new PathFinder.CostMatrix();

  const roomTerrain = room.getTerrain();
  const roomCoordinates = getPotentialRoomCoordinates();

  for (const { x, y } of roomCoordinates) {
    const terrain = roomTerrain.get(x, y);

    if (terrain === TERRAIN_MASK_WALL) {
      reachabilityMatrix.set(x, y, 0);
    } else {
      reachabilityMatrix.set(x, y, 1);
    }
  }

  const viableCoordinates = roomCoordinates.filter(
    ({ x, y }) => reachabilityMatrix.get(x, y) === 1,
  );
}
