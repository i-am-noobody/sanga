import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "../../lib/getUser";
import { sendEmail } from "../../lib/email";

const ORDER_CREATE_RATE_LIMIT_WINDOW_MS = 60_000;
const ORDER_CREATE_RATE_LIMIT_MAX_REQUESTS = 5;
const IDEMPOTENCY_RECORD_TTL_MS = 24 * 60 * 60 * 1000;
const FALLBACK_IDEMPOTENCY_WINDOW_MS = 30_000;
const ORDER_CREATE_ACTION = "create-order";

type IncomingOrderItem = {
  menuItemId: number;
  quantity: number;
  name?: string;
  price?: number | string;
};

type IncomingOrderPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  pickupTime: string;
  items: IncomingOrderItem[];
};

type GuardrailRateLimitDelegate = {
  upsert: (args: {
    where: {
      identifier_action_windowStart: {
        identifier: string;
        action: string;
        windowStart: Date;
      };
    };
    create: {
      identifier: string;
      action: string;
      windowStart: Date;
      count: number;
      expiresAt: Date;
    };
    update: {
      count: {
        increment: number;
      };
      updatedAt: Date;
      expiresAt: Date;
    };
    select: {
      count: true;
    };
  }) => Promise<{ count: number }>;
  deleteMany: (args: {
    where: {
      expiresAt: {
        lt: Date;
      };
    };
  }) => Promise<{ count: number }>;
};

type GuardrailOrderIdempotencyRecord = {
  id: number;
  key: string;
  requestHash: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  orderId: number | null;
};

type GuardrailOrderIdempotencyDelegate = {
  create: (args: {
    data: {
      key: string;
      requestHash: string;
      status: "PENDING";
      expiresAt: Date;
    };
    select: {
      id: true;
    };
  }) => Promise<{ id: number }>;
  findUnique: (args: {
    where: {
      key: string;
    };
  }) => Promise<GuardrailOrderIdempotencyRecord | null>;
  update: (args: {
    where: {
      key?: string;
      id?: number;
    };
    data: {
      status?: "PENDING" | "COMPLETED" | "FAILED";
      orderId?: number | null;
      expiresAt?: Date;
    };
    select?: {
      id: true;
    };
  }) => Promise<{ id: number }>;
  deleteMany: (args: {
    where: {
      expiresAt: {
        lt: Date;
      };
    };
  }) => Promise<{ count: number }>;
};

type GuardrailPrismaClient = {
  rateLimitBucket: GuardrailRateLimitDelegate;
  orderIdempotencyKey: GuardrailOrderIdempotencyDelegate;
};

const guardrailPrisma = prisma as unknown as GuardrailPrismaClient;

function normalizeOrderPayload(payload: IncomingOrderPayload) {
  return {
    customerName: payload.customerName.trim(),
    customerEmail: payload.customerEmail.trim().toLowerCase(),
    customerPhone: (payload.customerPhone ?? "").trim(),
    pickupTime: new Date(payload.pickupTime).toISOString(),
    items: payload.items
      .map((item) => ({
        menuItemId: Number(item.menuItemId),
        quantity: Number(item.quantity),
      }))
      .sort((a, b) => a.menuItemId - b.menuItemId),
  };
}

function getOrderRequestHash(payload: IncomingOrderPayload): string {
  return createHash("sha256")
    .update(JSON.stringify(normalizeOrderPayload(payload)))
    .digest("hex");
}

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [first] = forwardedFor.split(",");
    const ip = first?.trim();
    if (ip) return ip;
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

function getIdempotencyKey(
  req: NextRequest,
  identifier: string,
  requestHash: string
): { key: string } | { error: string } {
  const headerKey = req.headers.get("x-idempotency-key")?.trim();

  if (headerKey) {
    if (!/^[a-zA-Z0-9:_-]{8,128}$/.test(headerKey)) {
      return {
        error:
          "Invalid X-Idempotency-Key format. Use 8-128 characters [a-zA-Z0-9:_-]",
      };
    }

    return { key: headerKey };
  }

  const coarseWindow = Math.floor(Date.now() / FALLBACK_IDEMPOTENCY_WINDOW_MS);
  return { key: `fallback:${identifier}:${coarseWindow}:${requestHash}` };
}

async function enforceOrderRateLimit(identifier: string): Promise<{
  allowed: boolean;
  retryAfterSeconds: number;
}> {
  const now = Date.now();
  const windowStartMs =
    Math.floor(now / ORDER_CREATE_RATE_LIMIT_WINDOW_MS) *
    ORDER_CREATE_RATE_LIMIT_WINDOW_MS;
  const windowStart = new Date(windowStartMs);
  const expiresAt = new Date(windowStartMs + ORDER_CREATE_RATE_LIMIT_WINDOW_MS * 3);

  const bucket = await guardrailPrisma.rateLimitBucket.upsert({
    where: {
      identifier_action_windowStart: {
        identifier,
        action: ORDER_CREATE_ACTION,
        windowStart,
      },
    },
    create: {
      identifier,
      action: ORDER_CREATE_ACTION,
      windowStart,
      count: 1,
      expiresAt,
    },
    update: {
      count: {
        increment: 1,
      },
      updatedAt: new Date(),
      expiresAt,
    },
    select: {
      count: true,
    },
  });

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowStartMs + ORDER_CREATE_RATE_LIMIT_WINDOW_MS - now) / 1000)
  );

  return {
    allowed: bucket.count <= ORDER_CREATE_RATE_LIMIT_MAX_REQUESTS,
    retryAfterSeconds,
  };
}

function scheduleGuardrailCleanup() {
  if (Math.random() > 0.05) return;

  const now = new Date();

  void guardrailPrisma.rateLimitBucket
    .deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    })
    .catch((error: unknown) => {
      console.warn("Rate-limit cleanup failed", error);
    });

  void guardrailPrisma.orderIdempotencyKey
    .deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    })
    .catch((error: unknown) => {
      console.warn("Idempotency cleanup failed", error);
    });
}

const orderItemInclude = {
  menuItem: {
    select: {
      id: true,
      name: true,
      price: true,
    },
  },
} as const;

function isRecoverableOrderReadError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021" || error.code === "P2022") {
      return true;
    }
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    (message.includes("order") || message.includes("orderitem") || message.includes("menuitem")) &&
    (message.includes("does not exist") ||
      message.includes("unknown column") ||
      message.includes("column") && message.includes("does not exist") ||
      message.includes("relation") && message.includes("does not exist") ||
      message.includes("p2021") ||
      message.includes("p2022"))
  );
}

async function findOrdersResilient(where?: { customerEmail: string; customerPhone?: string }) {
  try {
    return await prisma.order.findMany({
      where,
      include: {
        items: {
          include: orderItemInclude,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    if (!isRecoverableOrderReadError(error)) {
      throw error;
    }

    return [];
  }
}

// ✅ GET orders: admin can fetch all; customers can fetch by email (and optional phone)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const phone = url.searchParams.get("phone");

    if (email) {
      const where: { customerEmail: string; customerPhone?: string } = {
        customerEmail: email,
      };
      if (phone) where.customerPhone = phone;

      const orders = await findOrdersResilient(where);

      return NextResponse.json(orders);
    }

    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orders = await findOrdersResilient();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// ✅ CREATE order (public)
export async function POST(req: NextRequest) {
  try {
    console.log('Order creation request received');

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    console.log('Request body:', body);

    const { customerName, customerEmail, customerPhone, pickupTime, items } =
      body as IncomingOrderPayload;

    // ✅ Validation
    if (!customerName || !customerEmail || !pickupTime || !items || !Array.isArray(items) || items.length === 0) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { error: "Name, email, pickup time, and at least one item are required" },
        { status: 400 }
      );
    }

    if (typeof customerEmail !== "string" || !customerEmail.includes("@")) {
      console.log('Validation failed: invalid email format');
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = customerEmail.trim().toLowerCase();
    const clientIp = getClientIp(req);
    const rateLimitIdentifier = `${clientIp}|${normalizedEmail}`;

    const pickupDate = new Date(pickupTime);
    if (Number.isNaN(pickupDate.getTime())) {
      console.log('Validation failed: invalid pickup time format');
      return NextResponse.json(
        { error: "Pickup time must be a valid date/time" },
        { status: 400 }
      );
    }

    if (pickupDate.getTime() < Date.now() - 5 * 60 * 1000) {
      console.log('Validation failed: pickup time in past');
      return NextResponse.json(
        { error: "Pickup time must be in the future" },
        { status: 400 }
      );
    }

    const payloadForHash: IncomingOrderPayload = {
      customerName,
      customerEmail,
      customerPhone,
      pickupTime,
      items,
    };

    const requestHash = getOrderRequestHash(payloadForHash);
    const idempotencyResult = getIdempotencyKey(
      req,
      rateLimitIdentifier,
      requestHash
    );

    if ("error" in idempotencyResult) {
      return NextResponse.json({ error: idempotencyResult.error }, { status: 400 });
    }

    const idempotencyKey = idempotencyResult.key;
    const idempotencyExpiry = new Date(Date.now() + IDEMPOTENCY_RECORD_TTL_MS);

    let idempotencyRecord: { id: number };

    try {
      idempotencyRecord = await guardrailPrisma.orderIdempotencyKey.create({
        data: {
          key: idempotencyKey,
          requestHash,
          status: "PENDING",
          expiresAt: idempotencyExpiry,
        },
        select: {
          id: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existing = await guardrailPrisma.orderIdempotencyKey.findUnique({
          where: {
            key: idempotencyKey,
          },
        });

        if (!existing) {
          return NextResponse.json(
            { error: "Failed to process idempotency key" },
            { status: 409 }
          );
        }

        if (existing.requestHash !== requestHash) {
          return NextResponse.json(
            { error: "This idempotency key was already used with different order data" },
            { status: 409 }
          );
        }

        if (existing.status === "COMPLETED" && existing.orderId) {
          const existingOrder = await prisma.order.findUnique({
            where: {
              id: existing.orderId,
            },
            include: {
              items: {
                include: orderItemInclude,
              },
            },
          });

          if (existingOrder) {
            return NextResponse.json(existingOrder, {
              status: 200,
              headers: {
                "X-Idempotent-Replay": "true",
              },
            });
          }
        }

        if (existing.status === "PENDING") {
          return NextResponse.json(
            { error: "An identical order request is already being processed" },
            { status: 409 }
          );
        }

        const recovered = await guardrailPrisma.orderIdempotencyKey.update({
          where: {
            key: idempotencyKey,
          },
          data: {
            status: "PENDING",
            orderId: null,
            expiresAt: idempotencyExpiry,
          },
          select: {
            id: true,
          },
        });

        idempotencyRecord = recovered;
      } else {
        throw error;
      }
    }

    const rateLimitResult = await enforceOrderRateLimit(rateLimitIdentifier);

    if (!rateLimitResult.allowed) {
      await guardrailPrisma.orderIdempotencyKey
        .update({
          where: {
            id: idempotencyRecord.id,
          },
          data: {
            status: "FAILED",
            expiresAt: idempotencyExpiry,
          },
        })
        .catch(() => {
          // Best-effort status update only.
        });

      return NextResponse.json(
        {
          error: "Too many order attempts. Please wait a moment and try again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfterSeconds),
          },
        }
      );
    }

    // ✅ Validate items and calculate total
    console.log('Validating items:', items);
    let totalPrice = 0;
    const orderItems: Array<{
      menuItemId: number;
      quantity: number;
      price: number;
    }> = [];

    for (const item of items) {
      console.log('Processing item:', item);
      const menuItemId = Number(item.menuItemId);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(menuItemId) ||
        menuItemId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        console.log('Invalid item data:', item);
        return NextResponse.json(
          { error: "Invalid item data" },
          { status: 400 }
        );
      }

      const menuItem = await prisma.menuItem.findUnique({
        where: { id: menuItemId },
      });

      if (!menuItem) {
        console.log('Menu item not found:', menuItemId);
        return NextResponse.json(
          { error: `Menu item ${menuItemId} not found` },
          { status: 400 }
        );
      }

      if (item.name && item.name !== menuItem.name) {
        console.log('Menu item name mismatch:', item.name, 'vs', menuItem.name);
        return NextResponse.json(
          { error: `Menu item name does not match for item ${menuItemId}` },
          { status: 400 }
        );
      }

      if (item.price && Number(item.price) !== menuItem.price) {
        console.log('Menu item price mismatch:', item.price, 'vs', menuItem.price);
        return NextResponse.json(
          { error: `Menu item price does not match for item ${menuItemId}` },
          { status: 400 }
        );
      }

      const itemPrice = menuItem.price * quantity;
      totalPrice += itemPrice;

      orderItems.push({
        menuItemId,
        quantity,
        price: itemPrice,
      });
    }

    console.log('Order items validated, total price:', totalPrice);

    // ✅ Create order with items
    console.log('Creating order with data:', {
      customerName,
      customerEmail,
      customerPhone,
      pickupTime: pickupDate,
      totalPrice,
      status: 'RECEIVED',
      orderItems: orderItems,
    });

    let order;

    try {
      order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
          data: {
            customerName,
            customerEmail,
            customerPhone,
            pickupTime: pickupDate,
            totalPrice,
            status: 'RECEIVED',
            items: {
              create: orderItems,
            },
          },
          include: {
            items: {
              include: orderItemInclude,
            },
          },
        });

        const guardrailTx = tx as unknown as {
          orderIdempotencyKey: GuardrailOrderIdempotencyDelegate;
        };

        await guardrailTx.orderIdempotencyKey.update({
          where: {
            id: idempotencyRecord.id,
          },
          data: {
            status: "COMPLETED",
            orderId: createdOrder.id,
            expiresAt: idempotencyExpiry,
          },
        });

        return createdOrder;
      });
    } catch (transactionError) {
      await guardrailPrisma.orderIdempotencyKey
        .update({
          where: {
            id: idempotencyRecord.id,
          },
          data: {
            status: "FAILED",
            expiresAt: idempotencyExpiry,
          },
        })
        .catch(() => {
          // Best-effort status update only.
        });

      throw transactionError;
    }

    console.log('Order created successfully:', order.id);

    // Derive a sensible base URL from the incoming request when possible so
    // emails contain a link the recipient can open (not localhost).
    function deriveBaseUrl(req: NextRequest) {
      const forwardedProto = req.headers.get("x-forwarded-proto");
      const proto = forwardedProto ?? (req.headers.get("referer")?.split(":")[0]) ?? "https";
      const host =
        req.headers.get("x-forwarded-host") || req.headers.get("host") || new URL(req.url).host;
      return process.env.NEXT_PUBLIC_URL || `${proto}://${host}`;
    }

    try {
      const emailHtml = `<p>Thank you for your order, ${customerName}.</p>
         <p>Your order number is <strong>#${order.id}</strong> and its current status is <strong>${order.status}</strong>.</p>
         <p>We will keep you updated as your order moves forward.</p>`;

      await sendEmail(customerEmail, `Your Sanga order #${order.id} is confirmed`, emailHtml);
    } catch (emailError) {
      console.error("ORDER CONFIRMATION EMAIL ERROR:", emailError);
    }

    scheduleGuardrailCleanup();

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");

    const message =
      error instanceof Error ? error.message : "Server error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}