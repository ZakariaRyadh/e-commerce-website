import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { sendContactReceivedEmail, sendContactAdminNotification } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(5),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many messages sent. Please try again later." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all fields correctly." }, { status: 400 });
  }

  await prisma.contactMessage.create({ data: parsed.data });

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  await Promise.all([
    sendContactReceivedEmail({ to: parsed.data.email, name: parsed.data.name }),
    admin
      ? sendContactAdminNotification({
          adminEmail: admin.email,
          name: parsed.data.name,
          email: parsed.data.email,
          message: parsed.data.message,
        })
      : Promise.resolve(),
  ]);

  return NextResponse.json({ ok: true });
}
