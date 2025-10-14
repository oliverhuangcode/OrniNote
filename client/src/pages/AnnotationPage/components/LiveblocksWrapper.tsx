import { useParams } from "react-router-dom";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { LiveList } from "@liveblocks/client";
import { useAuth } from "../../../contexts/authContext";
import Annotation from "../Annotation";

export function LiveblocksWrapper() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const roomId = projectId ? `annotation-${projectId}` : "annotation-default";

  if (!user) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-900">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <LiveblocksProvider
      authEndpoint={async (room) => {
        const token = localStorage.getItem("auth_token");

        console.log("Token from localStorage:", token);
        console.log("Room:", room);

        if (!token) {
          throw new Error(
            "No authentication token found. Please log in again."
          );
        }

        const response = await fetch("/api/liveblocks/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ room }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Auth failed:", errorText);
          throw new Error("Failed to authenticate with Liveblocks");
        }

        return await response.json();
      }}
    >
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
          userInfo: {
            name: user.username,
            email: user.email,
          },
        }}
        initialStorage={{
          annotationIds: new LiveList<string>([]),
        }}
      >
        <Annotation />
      </RoomProvider>
    </LiveblocksProvider>
  );
}