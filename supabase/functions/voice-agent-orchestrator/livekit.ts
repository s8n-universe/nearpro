import { AccessToken, RoomServiceClient } from 'https://esm.sh/livekit-server-sdk@2.0.0'

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

  // Normalize url to start with https:// for REST requests
  let restUrl = url;
  if (restUrl.startsWith('wss://')) {
    restUrl = restUrl.replace('wss://', 'https://');
  } else if (restUrl.startsWith('ws://')) {
    restUrl = restUrl.replace('ws://', 'http://');
  }
  restUrl = restUrl.replace(/\/$/, '');

  try {
    // Generate admin API access token for REST request
    const at = new AccessToken(apiKey, apiSecret, {
      identity: `sip_dialer_${Date.now()}`,
      name: 'SIP Dialer Service',
    });
    at.addGrant({
      roomJoin: false,
      admin: true
    });
    const apiToken = await at.toJwt();

    const response = await fetch(`${restUrl}/twirp/livekit.SIP/CreateSIPParticipant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sipTrunkId: sipTrunkId,
        sipCallTo: phone,
        roomName: roomName,
        participantIdentity: `lead_${phone.replace('+', '')}`,
        participantName: 'Lead Recipient'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`LiveKit REST API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    console.log(`[LiveKit Outbound SIP] Successfully dialed ${phone} in room ${roomName}. ID: ${data.sipCallId || 'N/A'}`);
    return { success: true, sandbox: false, call_sid: data.sipCallId || null };
  } catch (err) {
    console.error("[LiveKit Outbound SIP Error] Failed to place SIP call via REST:", err);
    throw err;
  }
}
