import { AccessToken, RoomServiceClient, SipServiceClient } from 'https://esm.sh/livekit-server-sdk@2.0.0'

export async function createCallSession(userId: string) {
  let url = Deno.env.get('LIVEKIT_API_URL') || '';
  if (url.startsWith('wss://')) {
    url = url.replace('wss://', 'https://');
  } else if (url.startsWith('ws://')) {
    url = url.replace('ws://', 'http://');
  }
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

export async function initiateOutboundSipCall(roomName: string, phone: string) {
  const url = Deno.env.get('LIVEKIT_API_URL') || '';
  const apiKey = Deno.env.get('LIVEKIT_API_KEY') || '';
  const apiSecret = Deno.env.get('LIVEKIT_API_SECRET') || '';
  const sipTrunkId = Deno.env.get('LIVEKIT_SIP_TRUNK_ID') || '';

  if (!url || !apiKey || !apiSecret || !sipTrunkId) {
    console.warn("[LiveKit Telephony] Credentials or LIVEKIT_SIP_TRUNK_ID missing. Operating in Sandbox simulation mode.");
    return { success: true, sandbox: true };
  }

  try {
    const sipClient = new SipServiceClient(url, apiKey, apiSecret);
    const participant = await sipClient.createSipParticipant(
      sipTrunkId,
      phone,
      roomName,
      {
        participantIdentity: `lead_${phone.replace('+', '')}`,
        participantName: 'Lead Recipient',
      }
    );

    console.log(`[LiveKit Outbound SIP] Successfully dialed ${phone} in room ${roomName}. ID: ${participant.sipCallId}`);
    return { success: true, sandbox: false, call_sid: participant.sipCallId };
  } catch (err) {
    console.error("[LiveKit Outbound SIP Error] Failed to place SIP call:", err);
    throw err;
  }
}
