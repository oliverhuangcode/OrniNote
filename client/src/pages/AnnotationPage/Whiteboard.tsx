"use client";

import {
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";

export default function App() {
  return (
    <LiveblocksProvider publicApiKey="pk_dev_eH0jmBFlrKAt3C8vX8ZZF53cmXb5W6XoCyGx2A9NGCZV3-v2P-gqUav-vAvszF1x">
      <RoomProvider
        id="my-room"
        initialPresence={{}}
        initialStorage={{
          title: "Untitled",
          names: new LiveList(["Steven", "Guillaume"]),
          shapes: new LiveMap([
            ["g9shu0", new LiveObject({ type: "rectangle", color: "red" })],
            ["djs3g5", new LiveObject({ type: "circle", color: "yellow" })],
          ]),
        }}
      >
        {/* 👇 children required */}
        <div>
          <h1>Hello from inside RoomProvider</h1>
          {/* put your <Room /> or other components here */}
        </div>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
