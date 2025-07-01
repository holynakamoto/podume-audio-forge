// Zapier webhook signature validation
export async function validateZapierSignature(req: Request, rawBody: string): Promise<boolean> {
  const signature = req.headers.get('x-zapier-webhook-signature');
  const secret = Deno.env.get('ZAPIER_WEBHOOK_SECRET');
  if (!signature || !secret) return false;

  // Compute HMAC SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  const sigBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(rawBody)
  );
  const computedSignature = Array.from(new Uint8Array(sigBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  return signature === computedSignature;
}

// API key authentication for direct calls
export function validateApiKey(req: Request): boolean {
  const apiKey = req.headers.get('x-api-key');
  const expected = Deno.env.get('API_KEY');
  return !!apiKey && !!expected && apiKey === expected;
} 