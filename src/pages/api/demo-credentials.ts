import type { NextApiRequest, NextApiResponse } from 'next';

type DemoCredentialsResponse =
  | { email: string; password: string }
  | { error: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<DemoCredentialsResponse>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  const email = process.env.DEMO_RECRUITER_EMAIL;
  const password = process.env.DEMO_RECRUITER_PASSWORD;
  if (!email || !password) {
    return res.status(503).json({ error: 'Demo credentials are not configured' });
  }

  return res.status(200).json({ email, password });
}
