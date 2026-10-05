export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = body.code || body.secret;
    const uid = body.uid || 'default-user';

    const MASTER_SECRET = process.env.SECRET_VIP_CODE || 'Alpha@091904';

    if (code && code.trim() === MASTER_SECRET) {
      return new Response(
        JSON.stringify({
          success: true,
          unlocked: true,
          isVIP: true,
          subscriptionPlan: 'vip',
          subscriptionExpiry: 'unlimited',
          message: 'Haven VIP Active Unlocked - Unlimited VIP by Dr. Ajak Alrofaai Aling',
          uid,
          activatedAt: Date.now(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid secret VIP code',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Secret check failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
