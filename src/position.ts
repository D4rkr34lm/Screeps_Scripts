export function getPositionsInRange(
  position: RoomPosition,
  range: number,
): RoomPosition[] {
  const positions: RoomPosition[] = [];

  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      const newX = position.x + dx;
      const newY = position.y + dy;

      if (newX > 0 && newX < 49 && newY > 0 && newY < 49) {
        positions.push(new RoomPosition(newX, newY, position.roomName));
      }
    }
  }

  return positions;
}
