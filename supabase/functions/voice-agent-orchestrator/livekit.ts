import { AccessToken, RoomServiceClient } from 'https://esm.sh/livekit-server-sdk@2.0.0'

export async function createCallSession(userId: string) {
  const url = Deno.env.get('LIVEKIT_API_URL') || '';
  const apiKey = Deno.env.get('LIVEKIT_API_KEY') || '';
  const apiSecret = Deno.env.get('LIVEKIT_API_SECRET') || '';

  const roomName = `call_${userId}_${Date.now()}`;

  if (url && apiKey && apiSecret) {
    try {
      const livekitClient = new RoomServiceClient(url, apiKey, apiSecret);
      await livekitClient.createRoom({
        name: roomName,
        emptyTimeout: 300,        // Auto-delete after 5 min of silence
        maxParticipants: 2,       // Agent + lead
      });
    } catch (err) {
      console.error("LiveKit: Failed to explicitly create room, relying on auto-create:", err);
    }
  }

  // Generate Agent join token
  const at = new AccessToken(apiKey, apiSecret, {
    identity: `agent_${userId}`,
    name: 'Priya AI Agent',
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();
  return { roomName, token };
}
