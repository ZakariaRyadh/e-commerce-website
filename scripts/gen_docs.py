"""
LUMA — From Zero To Master.
A complete, ordered walkthrough of how the LUMA e-commerce platform was built:
the idea, the stack, the database, auth + OTP password reset, the storefront,
the admin dashboard, real bugs found and fixed, deployment, payment for later,
and a full Django migration plan. Every section points at real files in the
repo so you can open the source while you read.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, PageBreak,
                                 Table, TableStyle, HRFlowable, XPreformatted, ListFlowable, ListItem)
import os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BLUE = HexColor('#1B4FD8')
DARK = HexColor('#111111')
GREY = HexColor('#555555')
BORDER = HexColor('#E5E5E5')
CODE_BG = HexColor('#0F172A')
CODE_FG = HexColor('#5EEAD4')
AMBER_BG = HexColor('#FEF3C7')
AMBER_TX = HexColor('#92400E')
GREEN_BG = HexColor('#F0FDF4')
GREEN_TX = HexColor('#166534')

W, H = A4
M = 0.7 * inch

styles = getSampleStyleSheet()
title = ParagraphStyle('title', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=26, textColor=DARK, alignment=TA_CENTER, spaceAfter=6)
subtitle = ParagraphStyle('subtitle', parent=styles['BodyText'], fontName='Helvetica', fontSize=12, textColor=GREY, alignment=TA_CENTER, spaceAfter=4)
h1 = ParagraphStyle('h1', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=19, textColor=BLUE, spaceBefore=4, spaceAfter=10)
h2 = ParagraphStyle('h2', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=13.5, textColor=DARK, spaceBefore=12, spaceAfter=6)
h3 = ParagraphStyle('h3', parent=styles['Heading3'], fontName='Helvetica-Bold', fontSize=11, textColor=DARK, spaceBefore=8, spaceAfter=4)
body = ParagraphStyle('body', parent=styles['BodyText'], fontName='Helvetica', fontSize=9.7, textColor=DARK, leading=14, spaceAfter=4)
small = ParagraphStyle('small', parent=body, fontSize=9, textColor=GREY, leading=12.5)
bullet = ParagraphStyle('bullet', parent=body, fontSize=9.7, textColor=DARK, leading=13.5, leftIndent=4)
code = ParagraphStyle('code', parent=body, fontName='Courier', fontSize=7.8, textColor=CODE_FG, leading=11)
note = ParagraphStyle('note', parent=body, fontSize=9.3, textColor=AMBER_TX, leading=12.5)
ok = ParagraphStyle('ok', parent=body, fontSize=9.3, textColor=GREEN_TX, leading=12.5)
toc_item = ParagraphStyle('toc', parent=body, fontSize=10.2, textColor=DARK, leading=15.5)


def esc(t):
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def rule():
    return HRFlowable(width='100%', thickness=1.5, color=BLUE, spaceBefore=2, spaceAfter=10, lineCap='round')


def codebox(text):
    return XPreformatted(esc(text), code)


def box(label, text, style, bg, border):
    t = Table([[Paragraph(f"<b>{esc(label)}</b><br/>{esc(text)}", style)]], colWidths=[W - 2 * M])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg),
        ('BOX', (0, 0), (-1, -1), 0.75, border),
        ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    return t


def notebox(label, text):
    return box(label, text, note, AMBER_BG, HexColor('#FCD34D'))


def okbox(label, text):
    return box(label, text, ok, GREEN_BG, HexColor('#86EFAC'))


def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(i, bullet), leftIndent=14) for i in items],
        bulletType='bullet', start='•', leftIndent=10
    )


def kv_table(rows, col_widths=None):
    data = [[Paragraph(f"<b>{esc(k)}</b>", body), Paragraph(v, body)] for k, v in rows]
    t = Table(data, colWidths=col_widths or [1.6 * inch, W - 2 * M - 1.6 * inch])
    t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 0), (0, -1), HexColor('#FAFAFA')),
    ]))
    return t


story = []

# ============================================================ COVER
story.append(Spacer(1, 1.5 * inch))
story.append(Paragraph("LUMA", ParagraphStyle('logo', parent=title, fontSize=46)))
story.append(Paragraph("From Zero To Master", title))
story.append(Paragraph("A complete walkthrough of how this e-commerce platform was built", subtitle))
story.append(Spacer(1, 0.35 * inch))
story.append(rule())
story.append(Paragraph(
    "Idea, stack, database, auth + OTP, storefront, admin dashboard, real bugs found and fixed, "
    "deployment, payment integration for later, and a full Django migration plan. Every section "
    "points at real files in the repo so you can open the source while you read.", small))
story.append(PageBreak())

# ============================================================ TOC
story.append(Paragraph("Table of contents", h1))
toc_entries = [
    "0. Quickstart: run it locally",
    "1. What LUMA is",
    "2. Tech stack at a glance",
    "3. Repository layout",
    "4. Database: build the schema step by step",
    "5. Backend: build the API step by step",
    "6. Authentication, roles &amp; the OTP password reset flow",
    "7. Frontend: storefront, built screen by screen",
    "8. Admin dashboard, built section by section",
    "9. Transactional email system",
    "10. Real bugs that were found and fixed",
    "11. Deployment: how to ship this for free",
    "12. Payment integration — Stripe setup guide (for later)",
    "13. Migrating the backend to Django",
    "14. Admin access credentials",
    "15. Glossary",
    "16. Resources for further learning",
    "Appendix A — Full database schema",
    "Appendix B — Key backend source files",
    "Appendix C — Key frontend source files",
]
for e in toc_entries:
    story.append(Paragraph(e, toc_item))
story.append(PageBreak())

# ============================================================ 0. QUICKSTART
story.append(Paragraph("0. Quickstart: run it locally", h1))
story.append(Paragraph("Everything below is explained in depth later in this doc — this section is just the commands, in order.", body))
story.append(Paragraph("0.1 Clone and install", h3))
story.append(codebox(
    "git clone git@github.com:ZakariaRyadh/e-commerce-website.git\n"
    "cd e-commerce-website\n"
    "npm install"
))
story.append(Paragraph("0.2 Environment variables", h3))
story.append(codebox(
    "# .env\n"
    "DATABASE_URL=\"postgres://...@db.prisma.io:5432/postgres?sslmode=require\"\n"
    "NEXTAUTH_SECRET=\"<random 32-byte base64 string>\"\n"
    "NEXTAUTH_URL=\"http://localhost:3000\"\n"
    "RESEND_API_KEY=  # optional — leave empty to log emails to console instead of sending"
))
story.append(Paragraph(
    "DATABASE_URL points at a free Prisma Postgres database (created with <font face=\"Courier\">npx "
    "create-db</font>, or any Postgres connection string). NEXTAUTH_SECRET can be generated with "
    "<font face=\"Courier\">openssl rand -base64 32</font>.", body))
story.append(Paragraph("0.3 Push the schema and seed sample data", h3))
story.append(codebox(
    "npx prisma db push\n"
    "npm run seed"
))
story.append(Paragraph(
    "The seed script creates 7 categories, 8 sample products with real per-variant stock, and one "
    "admin account (see Section 14 for the credentials).", body))
story.append(Paragraph("0.4 Run the dev server", h3))
story.append(codebox("npm run dev   # http://localhost:3000 (or next free port)"))
story.append(Paragraph("0.5 First run, end to end", h3))
story.append(bullets([
    "Open the homepage → browse Collections/Shop → add an item to the cart",
    "Sign up with any email/password → check out → a real Order row is created and the matching "
    "ProductVariant's stock is decremented in the same database transaction",
    "Log in as the seeded admin (Section 14) → visit /admin → manage products, stock, images, "
    "orders, customers, categories, and the contact-message inbox",
]))

# ============================================================ 1. WHAT LUMA IS
story.append(Paragraph("1. What LUMA is", h1))
story.append(Paragraph(
    "LUMA is a generic, fully-functional e-commerce template — a real storefront and a real admin "
    "dashboard, built so an actual product catalog can be dropped in later without touching the "
    "underlying architecture. It is a single Next.js application: the same codebase serves the React "
    "frontend and the backend API routes, talking to one PostgreSQL database through Prisma.", body))
story.append(Paragraph(
    "Unlike a typical template, nothing here is mock data sitting in a JSON file. Every number on every "
    "page — stock levels, order totals, customer counts, revenue charts — is a live query against the "
    "database, verified by actually creating accounts, placing orders, and watching the numbers change.", body))
story.append(okbox("Status", "Core platform complete and tested end-to-end. Payment processing is the "
                              "one piece intentionally left for later (Section 12)."))

# ============================================================ 2. TECH STACK
story.append(Paragraph("2. Tech stack at a glance", h1))
story.append(kv_table([
    ("Framework", "Next.js 16 (App Router, Turbopack) — pages and API routes in one codebase"),
    ("Database", "PostgreSQL, hosted on Prisma Postgres (managed, free tier, region eu-central-1)"),
    ("ORM", "Prisma 7, with the @prisma/adapter-pg driver adapter"),
    ("Auth", "NextAuth v5, Credentials provider, JWT sessions"),
    ("Styling", "Tailwind CSS v4"),
    ("Client state", "Zustand — cart, wishlist, and UI overlay stores, persisted to localStorage"),
    ("Email", "Resend — transactional email API, with a console-log fallback if unconfigured"),
    ("Icons", "lucide-react"),
    ("Validation", "Zod, on every API route that accepts a request body"),
]))
story.append(Paragraph("Why one Next.js app instead of a separate backend?", h3))
story.append(Paragraph(
    "One codebase is faster to build and deploy, and is genuinely production-capable for a new store "
    "— comfortably handling tens of thousands of orders a month without any architecture change. "
    "Every API route is written as a clean, RESTful endpoint on purpose, so if the project ever needs "
    "to split into a separate backend (see Section 13, Django), the migration is mechanical translation, "
    "not a rewrite.", body))

# ============================================================ 3. REPO LAYOUT
story.append(Paragraph("3. Repository layout", h1))
story.append(codebox(
    "ecommerce-site/\n"
    "├── prisma/\n"
    "│   ├── schema.prisma        # the entire database schema\n"
    "│   └── seed.ts              # sample categories/products/variants/admin user\n"
    "├── public/uploads/products/ # admin-uploaded product images land here\n"
    "├── scripts/gen_docs.py      # generates this PDF\n"
    "└── src/\n"
    "    ├── app/\n"
    "    │   ├── (shop)/          # storefront: home, products, collections, cart-adjacent pages\n"
    "    │   ├── admin/           # role-gated admin dashboard\n"
    "    │   ├── api/             # every backend endpoint\n"
    "    │   ├── login/, signup/, forgot-password/, reset-password/\n"
    "    │   └── middleware.ts    # server-side /admin/* role gate\n"
    "    ├── components/          # Header, CartDrawer, ProductCard, admin managers, etc.\n"
    "    ├── lib/\n"
    "    │   ├── auth.ts, auth.config.ts   # NextAuth setup (split for Edge-runtime middleware)\n"
    "    │   ├── prisma.ts        # Prisma client singleton\n"
    "    │   ├── data.ts          # every read query the storefront uses\n"
    "    │   ├── email.ts         # Resend wrapper with safe fallback\n"
    "    │   ├── rateLimit.ts     # in-memory IP rate limiter\n"
    "    │   └── store.ts         # Zustand: cart, wishlist, UI state\n"
    "    └── types/next-auth.d.ts # extends the session type with id/role\n"
))

# ============================================================ 4. DATABASE
story.append(Paragraph("4. Database: build the schema step by step", h1))
story.append(Paragraph(
    "The schema started simple (Product with a flat stock number, a string array of sizes/colors) and "
    "was deliberately evolved twice as real requirements showed up — this section walks through why, "
    "not just what the final shape is.", body))
story.append(Paragraph("Step 1 — Core catalog", h3))
story.append(codebox(
    "model Category {\n"
    "  id       String    @id @default(cuid())\n"
    "  name     String    @unique\n"
    "  slug     String    @unique\n"
    "  products Product[]\n"
    "}\n\n"
    "model Product {\n"
    "  id             String   @id @default(cuid())\n"
    "  name           String\n"
    "  slug           String   @unique\n"
    "  description    String\n"
    "  price          Decimal  @db.Decimal(10, 2)\n"
    "  compareAtPrice Decimal? @db.Decimal(10, 2)\n"
    "  badge          String?\n"
    "  categoryId     String\n"
    "  category       Category @relation(fields: [categoryId], references: [id])\n"
    "  images         ProductImage[]\n"
    "}"
))
story.append(Paragraph(
    "Decimal, not Float, for money. Floating point can't represent $19.99 exactly, and repeated "
    "arithmetic on floats drifts — Prisma's Decimal(10,2) stores money as fixed-point, the same way a "
    "real ledger would.", body))
story.append(Paragraph("Step 2 — Why stock moved out of Product and into its own table", h3))
story.append(Paragraph(
    "The first version had <font face=\"Courier\">stock Int</font> directly on Product, plus "
    "<font face=\"Courier\">colors String[]</font> and <font face=\"Courier\">sizes String[]</font>. "
    "That breaks the moment a product has more than one size — a shirt with 4 in stock doesn't mean "
    "4 of every size; it might be 0 Small and 4 Medium. The fix was a dedicated variant table:", body))
story.append(codebox(
    "model ProductVariant {\n"
    "  id        String  @id @default(cuid())\n"
    "  productId String\n"
    "  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)\n"
    "  size      String\n"
    "  color     String\n"
    "  stock     Int     @default(0)\n\n"
    "  @@unique([productId, size, color])\n"
    "}"
))
story.append(Paragraph(
    "Every size/color combination is now its own row with its own stock count. The unique constraint "
    "on (productId, size, color) means the database itself refuses a duplicate combo — that's not a "
    "rule enforced only in application code, it can never be violated even by a bug.", body))
story.append(Paragraph("Step 3 — Orders, decoupled from live product data", h3))
story.append(codebox(
    "model Order {\n"
    "  id              String      @id @default(cuid())\n"
    "  userId          String\n"
    "  user            User        @relation(fields: [userId], references: [id])\n"
    "  status          OrderStatus @default(PENDING)\n"
    "  subtotal        Decimal     @db.Decimal(10, 2)\n"
    "  shipping        Decimal     @db.Decimal(10, 2)\n"
    "  tax             Decimal     @db.Decimal(10, 2)\n"
    "  total           Decimal     @db.Decimal(10, 2)\n"
    "  promoCode       String?\n"
    "  shippingAddress String\n"
    "  items           OrderItem[]\n"
    "}\n\n"
    "model OrderItem {\n"
    "  id        String  @id @default(cuid())\n"
    "  orderId   String\n"
    "  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)\n"
    "  productId String\n"
    "  product   Product @relation(fields: [productId], references: [id])\n"
    "  name      String  // snapshot — survives a future product rename\n"
    "  price     Decimal @db.Decimal(10, 2) // snapshot — survives a future price change\n"
    "  qty       Int\n"
    "  size      String?\n"
    "  color     String?\n"
    "}"
))
story.append(Paragraph(
    "OrderItem.name and .price are deliberately copied at order time, not looked up live through the "
    "relation. If the admin renames a product or changes its price next week, a customer's receipt "
    "from last month must still show what they actually paid for what they actually bought — a "
    "snapshot, not a live join, is what makes order history historically accurate.", body))
story.append(Paragraph("Step 4 — Reviews, with a real uniqueness rule", h3))
story.append(codebox(
    "model Review {\n"
    "  id        String   @id @default(cuid())\n"
    "  rating    Int\n"
    "  title     String\n"
    "  text      String\n"
    "  photoUrl  String?\n"
    "  userId    String\n"
    "  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n"
    "  productId String\n"
    "  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)\n\n"
    "  @@unique([userId, productId])\n"
    "}"
))
story.append(Paragraph(
    "One review per customer per product — enforced the same way as the variant uniqueness above, at "
    "the database level, so the API can rely on a constraint violation rather than a separate existence "
    "check racing against a concurrent request.", body))
story.append(Paragraph("Step 5 — Push it, and keep pushing as the schema grows", h3))
story.append(codebox("npx prisma db push   # syncs schema.prisma straight to the live database\nnpx prisma generate # regenerates the typed client used everywhere in the app"))
story.append(Paragraph(
    "<font face=\"Courier\">db push</font> was used instead of a migrations folder throughout this "
    "project (appropriate for a fast-moving early-stage schema); switch to "
    "<font face=\"Courier\">prisma migrate dev</font> once the schema stabilizes and multiple "
    "environments need to stay in sync via versioned migration files instead of direct push.", body))

# ============================================================ 5. BACKEND
story.append(Paragraph("5. Backend: build the API step by step", h1))
story.append(Paragraph("Step 1 — One Prisma client, shared everywhere", h3))
story.append(codebox(
    "// src/lib/prisma.ts\n"
    "import { PrismaClient } from \"@/generated/prisma/client\";\n"
    "import { PrismaPg } from \"@prisma/adapter-pg\";\n\n"
    "const globalForPrisma = global as unknown as { prisma: PrismaClient };\n"
    "const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });\n\n"
    "export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });\n"
    "if (process.env.NODE_ENV !== \"production\") globalForPrisma.prisma = prisma;"
))
story.append(Paragraph(
    "Stashing the client on the global object in development is the standard Next.js hot-reload fix: "
    "without it, every file save would create a brand-new PrismaClient (and a brand-new connection "
    "pool) without closing the old one, exhausting the database's connection limit within minutes of "
    "active development.", body))
story.append(Paragraph("Step 2 — Every read query lives in one file", h3))
story.append(Paragraph(
    "<font face=\"Courier\">src/lib/data.ts</font> exports every function the storefront uses to read "
    "data: getProducts, getProductBySlug, getCategoryPreviews, getNewArrivals, getBestSellers, "
    "getHomeStats, and so on. Centralizing them means a Decimal-to-number conversion bug (real one — "
    "see Section 10) only has to be fixed in one place, and every page that needs \"products with their "
    "real stock status\" shares the same aggregation logic instead of six near-duplicate queries.", body))
story.append(Paragraph("Step 3 — The order-placement transaction", h3))
story.append(Paragraph(
    "This is the most important endpoint in the backend — it has to do three things atomically: verify "
    "every cart line still has enough stock, decrement that stock, and create the order. If any one "
    "step fails, none of them should apply.", body))
story.append(codebox(
    "const order = await prisma.$transaction(async (tx) => {\n"
    "  for (const item of items) {\n"
    "    const variant = await tx.productVariant.findFirst({\n"
    "      where: { productId: item.productId, size: item.size, color: item.color },\n"
    "    });\n"
    "    if (!variant || variant.stock < item.qty) {\n"
    "      throw new Error(`INSUFFICIENT_STOCK:${item.name}`);\n"
    "    }\n"
    "  }\n"
    "  for (const item of items) {\n"
    "    await tx.productVariant.updateMany({\n"
    "      where: { productId: item.productId, size: item.size, color: item.color },\n"
    "      data: { stock: { decrement: item.qty } },\n"
    "    });\n"
    "  }\n"
    "  return tx.order.create({ data: { /* ... */ }, include: { items: true } });\n"
    "});"
))
story.append(Paragraph(
    "Throwing inside a Prisma $transaction callback rolls back every write made so far in that "
    "callback automatically — if item 3 of 5 is out of stock, items 1 and 2 never actually get "
    "decremented either, even though their stock checks passed.", body))
story.append(Paragraph("Step 4 — Admin endpoints reuse the same shape, plus a role check", h3))
story.append(codebox(
    "async function requireAdmin() {\n"
    "  const session = await auth();\n"
    "  return session?.user?.role === \"ADMIN\";\n"
    "}\n\n"
    "export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {\n"
    "  if (!(await requireAdmin())) return NextResponse.json({ error: \"Unauthorized\" }, { status: 401 });\n"
    "  // ...\n"
    "}"
))
story.append(Paragraph(
    "Every route under /api/admin/ repeats this same guard at the top. It is intentionally not "
    "abstracted into a shared middleware wrapper for these routes — each handler stays a plain, "
    "readable async function, and the repetition is small enough (one line) that the clarity of "
    "\"this exact line runs first, every time\" outweighs the DRY savings of a wrapper.", body))

# ============================================================ 6. AUTH
story.append(Paragraph("6. Authentication, roles &amp; the OTP password reset flow", h1))
story.append(Paragraph("Step 1 — Two NextAuth config files, not one", h3))
story.append(Paragraph(
    "Next.js middleware runs on the Edge runtime, which cannot load Prisma (Prisma needs real Node.js "
    "APIs). But the admin-route gate has to run in middleware to block unauthenticated requests before "
    "they ever reach a page. The fix is splitting the NextAuth config in two:", body))
story.append(codebox(
    "// src/lib/auth.config.ts — Edge-safe, no providers, used by middleware\n"
    "export const authConfig: NextAuthConfig = {\n"
    "  session: { strategy: \"jwt\" },\n"
    "  pages: { signIn: \"/login\" },\n"
    "  providers: [],\n"
    "  callbacks: { jwt: ..., session: ... },\n"
    "};\n\n"
    "// src/lib/auth.ts — full config with the Credentials provider, used by API routes\n"
    "export const { handlers, signIn, signOut, auth } = NextAuth({\n"
    "  ...authConfig,\n"
    "  providers: [Credentials({ authorize: async (creds) => { /* bcrypt check against Prisma */ } })],\n"
    "});"
))
story.append(Paragraph(
    "middleware.ts imports only auth.config.ts (no Prisma in its import chain → runs fine on Edge). "
    "Every actual login still goes through auth.ts's full Credentials provider, which does the real "
    "database lookup and password check — middleware only ever reads the already-issued JWT's role "
    "claim, it never touches the database itself.", body))
story.append(Paragraph("Step 2 — The route gate itself", h3))
story.append(codebox(
    "export default auth((req) => {\n"
    "  const isAdminRoute = req.nextUrl.pathname.startsWith(\"/admin\");\n"
    "  if (isAdminRoute && req.auth?.user?.role !== \"ADMIN\") {\n"
    "    return NextResponse.redirect(new URL(\"/login\", req.nextUrl.origin));\n"
    "  }\n"
    "});\n\n"
    "export const config = { matcher: [\"/admin/:path*\"] };"
))
story.append(Paragraph(
    "Verified live, not just by reading the code: a customer session visiting /admin gets a real "
    "307 redirect to /login, before the admin page's own server component ever runs.", body))
story.append(Paragraph("Step 3 — OTP password reset, not a magic link", h3))
story.append(Paragraph(
    "A 6-digit code emailed to the user, rather than a clickable reset link, was the deliberate choice "
    "here — it works identically whether the user opens their email on the same device or a different "
    "one, with no link-expiry-in-a-different-browser-session confusion.", body))
story.append(codebox(
    "model PasswordResetOtp {\n"
    "  id        String    @id @default(cuid())\n"
    "  userId    String\n"
    "  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n"
    "  codeHash  String\n"
    "  expiresAt DateTime\n"
    "  usedAt    DateTime?\n"
    "  createdAt DateTime  @default(now())\n"
    "}"
))
story.append(Paragraph(
    "POST /api/auth/forgot-password generates a random 6-digit code, hashes it with bcrypt (exactly "
    "like a password — never store a verification code in plaintext), sets a 10-minute expiry, and "
    "always returns the same success response whether or not the email exists:", body))
story.append(codebox(
    "const user = await prisma.user.findUnique({ where: { email } });\n"
    "// Always respond with success to avoid leaking which emails are registered.\n"
    "if (user) {\n"
    "  const code = generateCode();\n"
    "  const codeHash = await bcrypt.hash(code, 10);\n"
    "  await prisma.passwordResetOtp.create({\n"
    "    data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },\n"
    "  });\n"
    "  await sendPasswordResetOtpEmail({ to: user.email, code });\n"
    "}\n"
    "return NextResponse.json({ ok: true }); // same response either way"
))
story.append(Paragraph(
    "POST /api/auth/reset-password checks the submitted code with bcrypt.compare against every "
    "unexpired, unused OTP for that user (not just the latest one — a user might request a code twice "
    "and use the first email that arrives), then updates the password and marks that OTP used inside a "
    "transaction, so a code can never be replayed.", body))
story.append(okbox("Tested live", "Wrong code → 400 rejected. Correct code → 200, password changed. "
                                   "Old password immediately stopped working. New password worked on "
                                   "the very next login attempt."))
story.append(Paragraph("Step 4 — Rate limiting the endpoints that don't require a session", h3))
story.append(Paragraph(
    "Signup, contact, forgot-password, and reset-password are all reachable without being logged in, "
    "which makes them the obvious targets for brute-forcing or spam. Each is wrapped in a simple "
    "in-memory, per-IP, fixed-window limiter:", body))
story.append(codebox(
    "export function rateLimit(key: string, limit: number, windowMs: number) {\n"
    "  const now = Date.now();\n"
    "  const bucket = buckets.get(key);\n"
    "  if (!bucket || now > bucket.resetAt) {\n"
    "    buckets.set(key, { count: 1, resetAt: now + windowMs });\n"
    "    return { allowed: true };\n"
    "  }\n"
    "  if (bucket.count >= limit) return { allowed: false };\n"
    "  bucket.count += 1;\n"
    "  return { allowed: true };\n"
    "}"
))
story.append(notebox("Scaling note", "This in-memory limiter resets on server restart and doesn't share "
                                      "state across multiple server instances. Fine for a single-server "
                                      "deployment; swap for a shared store (e.g. Upstash Redis) once "
                                      "running serverless/multi-instance."))

# ============================================================ 7. FRONTEND
story.append(Paragraph("7. Frontend: storefront, built screen by screen", h1))
story.append(Paragraph("Home", h3))
story.append(Paragraph(
    "Hero banner, featured products, a \"shop by category\" grid, value props, and a contact form. The "
    "category tiles use a real product photo from that exact category (queried via "
    "getCategoryPreviews, which joins Category → its first Product → that product's first image) "
    "rather than a random unrelated stock photo — an earlier version used "
    "picsum.photos/seed/cat{i} for each tile, which showed a laptop photo on an \"Accessories\" tile "
    "and a shipping-crane photo on \"Bags\" (see Section 10).", body))
story.append(Paragraph("Collections", h3))
story.append(Paragraph(
    "Originally, the header had both a \"Shop\" link and a \"Collections\" link pointing at the exact "
    "same /products page — a genuine duplicate with no functional difference (see Section 10). "
    "Collections is now a real curated hub: New Arrivals (sorted by createdAt), Best Sellers (ranked by "
    "actual units sold via OrderItem aggregation, falling back to highest-rated if no sales exist yet), "
    "On Sale (products with a compareAtPrice set), and the category grid.", body))
story.append(Paragraph("Product listing &amp; detail", h3))
story.append(Paragraph(
    "Listing has category/price/rating filters and sort, all client-side over a server-fetched product "
    "list, plus full-text search and a mobile filter drawer. The detail page's size/color picker reads "
    "real variant stock: selecting a sold-out size/color combo dims it and disables Add to Cart, and "
    "switching to a size automatically falls back to the first in-stock color for that size rather than "
    "silently leaving an invalid combo selected.", body))
story.append(codebox(
    "function selectSize(size: string) {\n"
    "  setSelSize(size);\n"
    "  const stillValid = product.variants.find((v) => v.size === size && v.color === selColor);\n"
    "  if (!stillValid || stillValid.stock === 0) {\n"
    "    const fallback = product.variants.find((v) => v.size === size && v.stock > 0)\n"
    "                   ?? product.variants.find((v) => v.size === size);\n"
    "    if (fallback) setSelColor(fallback.color);\n"
    "  }\n"
    "}"
))
story.append(Paragraph("Cart, search, checkout", h3))
story.append(Paragraph(
    "The cart is a Zustand store persisted to localStorage, so it survives a page refresh without a "
    "server round-trip. Search is a global overlay with debounced autocomplete against "
    "/api/products/search, recent-search history, and suggested tags. Checkout is three steps "
    "(shipping → payment-UI → review) and the final \"Place Order\" button is what actually calls "
    "POST /api/orders — the transaction described in Section 5.", body))
story.append(Paragraph("Account &amp; reviews", h3))
story.append(Paragraph(
    "Real order history, an order-tracking timeline driven by the order's actual status field, and a "
    "saved wishlist. The product detail page's Reviews tab lets a logged-in customer submit one review "
    "per product (blocked server-side by the unique constraint from Section 4) — earlier, the "
    "\"Specifications\" tab next to it showed identical hardcoded text (\"100% Premium Cotton\", "
    "\"Machine wash 30°C\"...) on every single product regardless of what it actually was; that's now "
    "four real fields (material/fit/care/origin) set per-product by the admin, with rows hidden "
    "entirely if left blank rather than showing a fake claim (Section 10).", body))

# ============================================================ 8. ADMIN
story.append(Paragraph("8. Admin dashboard, built section by section", h1))
story.append(kv_table([
    ("Dashboard", "Real revenue/order/customer counts and a 6-month revenue chart, computed live from Order rows — not hardcoded sample numbers"),
    ("Products", "Add/edit/delete, a per-variant stock manager (add/remove size+color rows with their own stock), and a real image-upload manager"),
    ("Categories", "Add/rename/delete — delete is blocked while the category still has products, so a click can't silently orphan a product"),
    ("Orders", "Search/filter, inline status dropdown that writes straight to the database and is immediately reflected in the customer's own order-tracking view"),
    ("Customers", "Paginated, searchable, a \"has orders\" filter, suspend/reactivate, promote to admin, and delete (blocked if the account has order history, to protect that history's integrity)"),
    ("Messages", "The contact form's inbox — mark read/resolved, reply by email (mailto link), delete"),
    ("Analytics", "Revenue/order/customer breakdowns and a monthly chart, same real-data principle as the dashboard"),
]))
story.append(notebox("Security note", "Suspending a user blocks new logins immediately, but an "
                                       "already-issued JWT session stays valid until it naturally "
                                       "expires/refreshes — sessions here are stateless by design "
                                       "(Section 6). For instant revocation, switch to database-backed "
                                       "sessions, where suspending a user can also delete their active "
                                       "session rows."))
story.append(Paragraph("The stock manager, specifically", h3))
story.append(Paragraph(
    "Rather than editing one stock number, the admin product table's \"Stock\" button opens a row-based "
    "editor: every existing size/color combo with its own stock field, an \"add combo\" button, and one "
    "Save that replaces the product's entire variant set in a single transaction (delete all, recreate "
    "from the submitted rows) — the same delete-and-recreate-children pattern used for nested data "
    "throughout this project, chosen for the same reason: it's always correct, with no diff logic to "
    "get subtly wrong.", body))

# ============================================================ 9. EMAIL
story.append(Paragraph("9. Transactional email system", h1))
story.append(Paragraph(
    "Email is wired through Resend, with a deliberate safe fallback: if RESEND_API_KEY isn't set, the "
    "send function logs to the console instead of throwing. This means every feature that depends on "
    "email — order confirmations, contact-form replies, OTP codes — already works correctly today; "
    "turning on real delivery later is a one-line env var change, not a code change.", body))
story.append(codebox(
    "async function send(opts: { to: string; subject: string; html: string }) {\n"
    "  const client = getClient(); // null if no RESEND_API_KEY\n"
    "  if (!client) {\n"
    "    console.log(`[email skipped — no RESEND_API_KEY] to=${opts.to} subject=\"${opts.subject}\"`);\n"
    "    return { sent: false };\n"
    "  }\n"
    "  await client.emails.send({ from: FROM, ...opts });\n"
    "  return { sent: true };\n"
    "}"
))
story.append(Paragraph("Four emails are wired today:", h3))
story.append(bullets([
    "Order confirmation — sent to the customer right after a successful checkout",
    "Contact form received — auto-reply to whoever submitted the form",
    "Contact form admin alert — notifies the admin's email in addition to the dashboard inbox",
    "Password reset OTP — the 6-digit code from Section 6",
]))

# ============================================================ 10. BUGS
story.append(Paragraph("10. Real bugs that were found and fixed", h1))
story.append(Paragraph("These are worth documenting in detail because the lessons generalize.", body))

story.append(Paragraph("10.1 Decimal values crashed every Server → Client Component boundary", h3))
story.append(Paragraph(
    "Symptom: the homepage, listing page, and product cards all 500'd with \"Only plain objects can be "
    "passed to Client Components from Server Components. Decimal objects are not supported.\"", body))
story.append(Paragraph(
    "Root cause: Prisma returns price and compareAtPrice as its own Decimal class, not a plain "
    "JavaScript number — and every product list was fetched in a Server Component, then handed "
    "straight to client components like ProductCard. React's serialization boundary between server and "
    "client components only allows plain JSON-shaped values across; a Decimal instance isn't one.", body))
story.append(Paragraph(
    "Fix: a single serializeProduct() helper in src/lib/data.ts, applied to every product query before "
    "it leaves the data layer:", body))
story.append(codebox(
    "function serializeProduct<T extends { price: unknown; compareAtPrice: unknown }>(p: T) {\n"
    "  return {\n"
    "    ...p,\n"
    "    price: Number(p.price),\n"
    "    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,\n"
    "  };\n"
    "}"
))
story.append(Paragraph(
    "General lesson: anything a database driver hands back that isn't a plain string/number/boolean/"
    "array/object (Decimal, Date in some contexts, BigInt) needs an explicit conversion at the data "
    "boundary, before it ever reaches a client component — convert once, in the data layer, not "
    "wherever the crash happens to surface.", body))

story.append(Paragraph("10.2 Admin login worked in development, 500'd in production", h3))
story.append(Paragraph(
    "Symptom: NextAuth login worked perfectly under npm run dev, then failed with "
    "UntrustedHost: Host must be trusted the moment the exact same code ran under npm run build "
    "&amp; npm run start.", body))
story.append(Paragraph(
    "Root cause: NextAuth v5 only auto-trusts the request host when NODE_ENV isn't \"production\". "
    "Development mode silently skips this check; a production build enforces it, and nothing in the "
    "default config explicitly told it localhost (or the real deploy domain) was trusted.", body))
story.append(codebox("export const authConfig: NextAuthConfig = {\n  trustHost: true,\n  // ...\n};"))
story.append(Paragraph(
    "General lesson: \"works in dev\" is not the same claim as \"works in production\" for anything "
    "that branches on NODE_ENV — and auth/security libraries branch on it more than most. Always run a "
    "real production build at least once before trusting a feature is actually done.", body))

story.append(Paragraph("10.3 Category tiles showed unrelated random stock photos", h3))
story.append(Paragraph(
    "Symptom (user-reported): the homepage's \"Shop by category\" tile for \"Accessories\" showed a "
    "photo of a laptop and phone on a desk; \"Bags\" showed a shipping crane on a dock.", body))
story.append(Paragraph(
    "Root cause: the tile images were generated as <font face=\"Courier\">picsum.photos/seed/cat{i}"
    "</font> — a deterministic-but-meaningless seed with no relationship to the category's actual "
    "content, purely a visual placeholder left over from initial scaffolding.", body))
story.append(Paragraph(
    "Fix: a getCategoryPreviews() query that joins each category to one of its real products and that "
    "product's first real image, plus the real product count, and links the tile to a pre-filtered "
    "listing page instead of the generic /products page:", body))
story.append(codebox(
    "const categories = await prisma.category.findMany({\n"
    "  include: {\n"
    "    products: { include: { images: { take: 1 } }, take: 1 },\n"
    "    _count: { select: { products: true } },\n"
    "  },\n"
    "});"
))
story.append(Paragraph(
    "General lesson: a placeholder that's visually present but semantically random (a real photo, just "
    "the wrong one) is easy to miss in your own testing because it \"looks fine\" — it takes a fresh "
    "pair of eyes, or deliberately asking \"does this image actually relate to this content,\" to catch.", body))

story.append(Paragraph("10.4 \"Shop\" and \"Collections\" were the exact same page", h3))
story.append(Paragraph(
    "Symptom (user-reported): both header nav links led to /products with no difference at all — a "
    "leftover from initial scaffolding where Collections hadn't been built yet and was wired to the "
    "same route as a placeholder.", body))
story.append(Paragraph(
    "Fix: a genuinely separate Collections page (Section 7) backed by real distinct queries — New "
    "Arrivals, Best Sellers, On Sale, category grid — rather than either removing the link or building "
    "a second copy of the same listing.", body))
story.append(Paragraph(
    "General lesson: a duplicate nav item is a cheap, easy-to-miss UX smell — two links that go to the "
    "exact same place either need to actually differ, or one of them shouldn't exist.", body))

story.append(Paragraph("10.5 The hero section's stats were entirely fake", h3))
story.append(Paragraph(
    "Symptom: the homepage hero showed \"12k+ Happy customers\" and \"98% Satisfaction rate\" — static "
    "numbers from the original design mockup that had never been connected to anything real.", body))
story.append(Paragraph(
    "First fix attempt: replace the hardcoded numbers with real ones — an actual customer COUNT query "
    "and a real satisfaction rate computed from the percentage of reviews rated 4★ or higher. This "
    "surfaced a second problem immediately: on a brand-new store with zero customers and zero reviews, "
    "the honest real numbers are \"0\" and an undefined percentage — which look broken, not honest.", body))
story.append(Paragraph(
    "Final fix: swap the data-dependent stats entirely for policy-based claims that are true on day one "
    "regardless of traffic — \"Free Shipping over $100\", \"24/7 Customer support\", \"30-Day Easy "
    "returns\". The Best Seller badge over the hero image keeps the real-data principle, but with an "
    "honest fallback: it shows actual units-sold ranking once any order exists, and a \"Top Rated\" "
    "label (by review score) before that — never a fabricated number.", body))
story.append(Paragraph(
    "General lesson: \"replace fake data with real data\" and \"the real data looks bad when it's zero\" "
    "are two different problems — sometimes the right fix isn't making a number honest, it's removing "
    "the number and showing something that doesn't need traffic to be true.", body))

story.append(Paragraph("10.6 The Specifications tab was identical on every product", h3))
story.append(Paragraph(
    "Symptom: every single product's detail page showed the exact same Material/Fit/Care/Origin block "
    "(\"100% Premium Cotton\", \"Regular / Relaxed\", \"Machine wash 30°C\", \"Certified facility, "
    "Portugal\") regardless of whether the product was a hat, a tote bag, or a sweater.", body))
story.append(Paragraph(
    "Fix: four real optional fields (material, fit, care, origin) added to Product, exposed in the "
    "admin add/edit form, and rendered dynamically — any field left blank is simply omitted from the "
    "list instead of falling back to a fake claim:", body))
story.append(codebox(
    "{[{ label: \"Material\", value: product.material },\n"
    "   { label: \"Fit\", value: product.fit },\n"
    "   { label: \"Care\", value: product.care },\n"
    "   { label: \"Origin\", value: product.origin }]\n"
    "  .filter((row) => row.value)\n"
    "  .map((row) => <SpecRow key={row.label} {...row} />)}"
))
story.append(Paragraph(
    "General lesson: a hardcoded block that happens to render real-looking text is the easiest kind of "
    "fake data to miss, because nothing about it looks broken in isolation — it only becomes obviously "
    "wrong once you compare two different products side by side.", body))

# ============================================================ 11. DEPLOYMENT
story.append(Paragraph("11. Deployment: how to ship this for free", h1))
story.append(Paragraph(
    "This project has been run locally throughout development. The stack was chosen so that going live "
    "costs nothing — here is the exact path to do it.", body))
story.append(Paragraph("11.1 Database — already done", h3))
story.append(Paragraph(
    "The Prisma Postgres database created with <font face=\"Courier\">npx create-db</font> is already "
    "a real managed cloud database (not local) — there is nothing to migrate. Just claim it (a one-time "
    "step at create-db.prisma.io/claim with the project ID from when it was created) so it doesn't "
    "auto-expire.", body))
story.append(Paragraph("11.2 Hosting — Vercel (recommended)", h3))
story.append(bullets([
    "Vercel is built by the same team as Next.js and has zero-config support for the App Router, "
    "Server Components, and Route Handlers used throughout this project",
    "Connect the GitHub repo at vercel.com/new → it auto-detects Next.js, no build config needed",
    "Add the same environment variables from Section 0.2 (DATABASE_URL, NEXTAUTH_SECRET, "
    "NEXTAUTH_URL — set to the real https://yourdomain.vercel.app, RESEND_API_KEY) in the "
    "Vercel project's Settings → Environment Variables",
    "Every push to main triggers an automatic build and deploy; pull requests get their own preview "
    "deployment URL automatically",
]))
story.append(notebox("Image uploads on Vercel", "The admin's product-image upload currently writes to "
                                                  "/public/uploads on local disk (see "
                                                  "src/app/api/admin/products/[id]/images/route.ts). "
                                                  "Vercel's filesystem is read-only/ephemeral at "
                                                  "runtime — uploads would silently disappear on the "
                                                  "next deploy. Before deploying there, swap the upload "
                                                  "target to a cloud storage bucket (Vercel Blob, "
                                                  "Cloudinary, or S3) — same API shape, different write "
                                                  "destination inside that one route file."))
story.append(Paragraph("11.3 Keeping a free-tier database warm (if needed)", h3))
story.append(Paragraph(
    "Some free-tier Postgres providers spin down an idle database and add a slow \"cold start\" to the "
    "first query after inactivity. If that becomes noticeable, a scheduled GitHub Actions workflow that "
    "pings a lightweight, unauthenticated health-check route every 5–10 minutes is the standard free "
    "fix — the same pattern used for Render's free web services in other projects.", body))

# ============================================================ 12. PAYMENT
story.append(Paragraph("12. Payment integration — Stripe setup guide (for later)", h1))
story.append(notebox("Status: NOT implemented", "Checkout currently captures a shipping address and "
                                                 "card-shaped form inputs, but no card is validated or "
                                                 "charged, and no payment provider is connected. This "
                                                 "is the guide for wiring up real payments when ready."))
story.append(Paragraph("Why Stripe", h3))
story.append(Paragraph(
    "Official SDKs for Next.js, built-in test mode with fake card numbers, and it handles PCI "
    "compliance for you — raw card numbers never have to touch your own server.", body))
story.append(Paragraph("Implementation plan", h3))
story.append(bullets([
    "1. Create a Stripe account, grab test keys (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY)",
    "2. npm install stripe @stripe/stripe-js @stripe/react-stripe-js",
    "3. Replace the checkout \"Payment\" step's plain inputs with Stripe Elements (CardElement) — this "
    "is what keeps raw card numbers off your server",
    "4. Add POST /api/checkout/create-payment-intent — server creates a Stripe PaymentIntent for the "
    "cart total, returns its client_secret",
    "5. Browser confirms payment with stripe.confirmCardPayment(client_secret, ...)",
    "6. Add a webhook endpoint, POST /api/webhooks/stripe, listening for payment_intent.succeeded — "
    "this is the moment to actually run the order-creation transaction from Section 5, not on the "
    "client-side confirmation alone (webhooks are the trustworthy source of truth)",
    "7. Add STRIPE_WEBHOOK_SECRET and verify the signature with stripe.webhooks.constructEvent to "
    "reject forged requests",
    "8. Test with Stripe's test card 4242 4242 4242 4242 (any future expiry/CVC) before going live",
    "9. Only switch test keys to live keys after a full test-mode checkout has been verified end-to-end",
]))
story.append(Paragraph(
    "Refunds/cancellations (also deferred): once Stripe is wired, a refund is a "
    "stripe.refunds.create() call from an admin action, plus setting the order status to CANCELLED.", body))

# ============================================================ 13. DJANGO
story.append(Paragraph("13. Migrating the backend to Django", h1))
story.append(Paragraph(
    "This section exists because the project deliberately started as a single Next.js full-stack app "
    "(Section 2) instead of a separate Django backend, on the understanding that the migration path "
    "would be documented here if the project ever needs Python on the backend.", body))
story.append(Paragraph("When to actually do this", h3))
story.append(bullets([
    "Heavy background/async jobs are needed (batch emails at scale, image processing, ML)",
    "Multiple frontends need to share one backend (web + a future native mobile app)",
    "The team is splitting into dedicated frontend/backend developers with a Python preference",
    "Scale genuinely requires independently scaling the API tier from the frontend tier",
]))
story.append(Paragraph("What moves directly", h3))
story.append(kv_table([
    ("/api/signup, /api/auth/*", "A custom Django auth app (or django-allauth). Re-implement the "
                                  "PasswordResetOtp table and bcrypt check the same way — Django's own "
                                  "password hashers can do the same job"),
    ("/api/products/*, /api/orders, /api/contact, /api/reviews", "Django REST Framework ViewSets — "
                                                                    "one-to-one with the existing route logic, including the order-transaction pattern"),
    ("/api/admin/*", "DRF views guarded by a permission class checking request.user.role == 'ADMIN', "
                       "mirroring the current middleware check exactly"),
]))
story.append(Paragraph("The database itself doesn't move", h3))
story.append(Paragraph(
    "Django can point at the exact same Postgres database — the work is translating "
    "prisma/schema.prisma into Django models with matching table/column names, or using "
    "manage.py inspectdb to reverse-engineer a first draft automatically:", body))
story.append(codebox(
    "python manage.py inspectdb > models_draft.py\n"
    "# Then: add db_table Meta options to match Prisma's exact existing table names,\n"
    "# fix relation/related_name fields, add verbose_name where useful."
))
story.append(Paragraph(
    "Mapping notes: Prisma's <font face=\"Courier\">@id @default(cuid())</font> string fields become "
    "Django CharField primary keys (matching cuid() means existing rows keep their IDs — zero "
    "downtime). Prisma enums (Role, OrderStatus, UserStatus, ContactStatus) map directly to Django "
    "TextChoices. The ProductVariant unique constraint becomes a Meta.unique_together.", body))
story.append(Paragraph("The frontend doesn't move either", h3))
story.append(Paragraph(
    "As long as the new Django API returns the same JSON shapes at the same URL paths, the existing "
    "fetch() calls just need their base URL repointed (or proxied through Next.js rewrites during a "
    "gradual cutover) — the UI never needs to know the backend changed underneath it.", body))
story.append(Paragraph("Suggested order", h3))
story.append(bullets([
    "1. Stand up Django + DRF pointed at a copy of the production database",
    "2. Recreate models via inspectdb, verify they match Prisma's schema field-for-field",
    "3. Port one route family at a time, starting with read-only product endpoints (lowest risk)",
    "4. Run both backends side-by-side temporarily, route traffic gradually",
    "5. Port auth last — session/JWT handling differs the most between NextAuth and Django",
    "6. Decommission the Next.js API routes once Django handles all traffic and is verified stable",
]))

# ============================================================ 14. CREDENTIALS
story.append(Paragraph("14. Admin access credentials", h1))
story.append(notebox("Change before going live", "These are seed/development credentials, created by "
                                                   "prisma/seed.ts. Rotate the password, or create a "
                                                   "real admin and demote/delete this one, before "
                                                   "exposing the site publicly."))
story.append(kv_table([
    ("Admin URL", "/admin (redirects to /login if the visitor isn't authenticated as an admin)"),
    ("Admin email", "admin@luma.test"),
    ("Admin password", "admin1234"),
]))
story.append(Paragraph(
    "To use a real account instead: sign up normally as that user on the storefront, then in "
    "/admin/customers use the \"promote to admin\" action on that account.", body))

# ============================================================ 15. GLOSSARY
story.append(Paragraph("15. Glossary", h1))
story.append(bullets([
    "<b>JWT (JSON Web Token)</b> — a signed, self-contained token proving who a request is from, "
    "without the server keeping session state in memory. LUMA uses one JWT per session, set via "
    "NextAuth, read on every request including in middleware.",
    "<b>Server Component / Client Component</b> — Next.js's split: Server Components render on the "
    "server and can talk to the database directly; Client Components run in the browser and can use "
    "state/effects. Only plain-JSON-shaped data can cross from server to client (Section 10.1).",
    "<b>Prisma Decimal</b> — Prisma's arbitrary-precision number type for money fields, distinct from "
    "a plain JavaScript number; must be explicitly converted before crossing a server/client boundary.",
    "<b>Migration / db push</b> — db push syncs a schema file straight to a live database with no "
    "history; migrate dev additionally writes a versioned migration file, useful once multiple "
    "environments need to apply the exact same sequence of changes.",
    "<b>Optimistic update</b> — updating local UI state immediately on a user action, before the "
    "network call that persists it has resolved.",
    "<b>Webhook</b> — an HTTP callback a third-party service (e.g. Stripe) makes to your server when "
    "something happens on their end, used as the trustworthy source of truth instead of a client-side "
    "confirmation alone (Section 12).",
    "<b>Edge runtime</b> — the lightweight JavaScript runtime Next.js middleware executes in; it lacks "
    "full Node.js APIs, which is why Prisma can't run there directly (Section 6).",
]))

# ============================================================ 16. RESOURCES
story.append(Paragraph("16. Resources for further learning", h1))
story.append(Paragraph("Backend / database", h3))
story.append(bullets([
    "Next.js docs — App Router, Route Handlers, Server Components (nextjs.org/docs)",
    "Prisma docs — schema reference, the Decimal type, transactions ($transaction)",
    "NextAuth.js (Auth.js) docs — Credentials provider, JWT callbacks, middleware integration",
    "Zod docs — the validation library used on every API route's request body",
]))
story.append(Paragraph("Frontend", h3))
story.append(bullets([
    "React docs (react.dev) — Server vs Client Components is explained from first principles here",
    "Tailwind CSS docs",
    "Zustand docs — short enough to read in one sitting; everything in src/lib/store.ts comes from here",
]))
story.append(Paragraph("Payment / deployment", h3))
story.append(bullets([
    "Stripe docs — Payment Intents, Elements, and webhook signature verification specifically",
    "Vercel docs — environment variables, and the filesystem-is-ephemeral note relevant to Section 11",
    "Django REST Framework docs — for Section 13, if/when the backend migrates",
]))

story.append(PageBreak())

# ============================================================ APPENDIX A
story.append(Paragraph("Appendix A — Full database schema", h1))
story.append(Paragraph("prisma/schema.prisma, in full, exactly as it lives in the repo.", body))
try:
    with open("prisma/schema.prisma", "r") as f:
        story.append(codebox(f.read()))
except Exception as e:
    story.append(Paragraph(f"(schema.prisma not found at generation time: {esc(str(e))})", small))

story.append(PageBreak())

# ============================================================ APPENDIX B
story.append(Paragraph("Appendix B — Key backend source files", h1))

backend_files = [
    ("src/lib/auth.ts", "Full NextAuth configuration with the Credentials provider."),
    ("src/lib/auth.config.ts", "The Edge-safe subset used by middleware (Section 6)."),
    ("src/middleware.ts", "The /admin/* server-side role gate."),
    ("src/app/api/orders/route.ts", "Order placement: the stock-check-and-decrement transaction."),
    ("src/app/api/auth/forgot-password/route.ts", "OTP generation step of the password reset flow."),
    ("src/app/api/auth/reset-password/route.ts", "OTP verification + password update step."),
    ("src/lib/email.ts", "The Resend wrapper with its console-log fallback."),
    ("src/lib/rateLimit.ts", "The in-memory IP rate limiter."),
]
for path, desc in backend_files:
    story.append(Paragraph(path, h3))
    story.append(Paragraph(desc, small))
    try:
        with open(path, "r") as f:
            story.append(codebox(f.read()))
    except Exception as e:
        story.append(Paragraph(f"(not found: {esc(str(e))})", small))
    story.append(Spacer(1, 10))

story.append(PageBreak())

# ============================================================ APPENDIX C
story.append(Paragraph("Appendix C — Key frontend source files", h1))

frontend_files = [
    ("src/lib/store.ts", "Cart, wishlist, and UI-overlay Zustand stores."),
    ("src/lib/data.ts", "Every read query the storefront uses, including the Decimal-serialization fix."),
    ("src/components/ProductDetail.tsx", "Product page: variant stock logic, write-a-review form."),
]
for path, desc in frontend_files:
    story.append(Paragraph(path, h3))
    story.append(Paragraph(desc, small))
    try:
        with open(path, "r") as f:
            story.append(codebox(f.read()))
    except Exception as e:
        story.append(Paragraph(f"(not found: {esc(str(e))})", small))
    story.append(Spacer(1, 10))

# ============================================================ BUILD
doc = SimpleDocTemplate(
    "LUMA_Documentation.pdf", pagesize=A4,
    leftMargin=M, rightMargin=M, topMargin=M, bottomMargin=M,
    title="LUMA — From Zero To Master",
)
doc.build(story)
print("Generated LUMA_Documentation.pdf")
