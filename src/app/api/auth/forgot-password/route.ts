import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { sendPasswordResetOtpEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Always respond with success to avoid leaking which emails are registered.
  if (user) {
    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    await prisma.passwordResetOtp.create({
      data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });
    await sendPasswordResetOtpEmail({ to: user.email, code });
  }

  return NextResponse.json({ ok: true });
}
