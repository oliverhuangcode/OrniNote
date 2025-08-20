import React from "react";
import { LiveblocksProvider, RoomProvider, useOthers, useMyPresence } from "@liveblocks/react";
import Cursor from "../../components/ui/cursor"; // adjust import path
import "../../styles/globals.css"; // or whatever your CSS file is named

// Define the types for your presence data
type CursorPosition = {
  x: number;
  y: number;
};

type Presence = {
  cursor: CursorPosition | null;
};

// Declare module to extend Liveblocks types
declare global {
  interface Liveblocks {
    Presence: Presence;
    Storage: {};
    UserMeta: {};
    RoomEvent: {};
  }
}

const COLORS = [
  "#E57373",
  "#9575CD",
  "#4FC3F7",
  "#81C784",
  "#FFF176",
  "#FF8A65",
  "#F06292",
  "#7986CB",
];

function Example() {
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const others = useOthers();

  return (
    <main
      className="container"
      onPointerMove={(event) => {
        updateMyPresence({
          cursor: {
            x: Math.round(event.clientX),
            y: Math.round(event.clientY),
          },
        });
      }}
      onPointerLeave={() => updateMyPresence({ cursor: null })}
    >
      <div className="text">
        {cursor
          ? `${cursor.x} × ${cursor.y}`
          : "Move your cursor to broadcast its position to other people in the room."}
      </div>
      {others.map(({ connectionId, presence }) => {
        if (!presence.cursor) return null;
        
        return (
          <Cursor
            key={`cursor-${connectionId}`}
            color={COLORS[connectionId % COLORS.length]}
            x={presence.cursor.x}
            y={presence.cursor.y}
          />
        );
      })}
    </main>
  );
}

export default function Page() {
  // For plain React, just use a fixed room ID or generate one dynamically
  const roomId = "my-react-room";

  return (
    // <LiveblocksProvider
    //   authEndpoint="/api/liveblocks-auth" // or replace with your own backend endpoint
    // >
    <LiveblocksProvider publicApiKey={"pk_dev_eH0jmBFlrKAt3C8vX8ZZF53cmXb5W6XoCyGx2A9NGCZV3-v2P-gqUav-vAvszF1x"}>
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null }}
      >
        <Example />
      </RoomProvider>
    </LiveblocksProvider>
  );
}