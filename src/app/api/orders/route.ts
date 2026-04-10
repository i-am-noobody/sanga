import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";
import { getUser } from "../../lib/getUser";
import { sendEmail } from "../../lib/email";

// ✅ GET orders: admin can fetch all; customers can fetch by email (and optional phone)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const phone = url.searchParams.get("phone");

    if (email) {
      const where: any = { customerEmail: email };
      if (phone) where.customerPhone = phone;

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(orders);
    }

    const user = await getUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

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
export async function POST(req: Request) {
  try {
    console.log('Order creation request received');

    const body = await req.json();
    console.log('Request body:', body);

    const { customerName, customerEmail, customerPhone, pickupTime, items } = body;

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

    // ✅ Validate items and calculate total
    console.log('Validating items:', items);
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      console.log('Processing item:', item);
      if (!item.menuItemId || !item.quantity || item.quantity <= 0) {
        console.log('Invalid item data:', item);
        return NextResponse.json(
          { error: "Invalid item data" },
          { status: 400 }
        );
      }

      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });

      if (!menuItem) {
        console.log('Menu item not found:', item.menuItemId);
        return NextResponse.json(
          { error: `Menu item ${item.menuItemId} not found` },
          { status: 400 }
        );
      }

      if (item.name && item.name !== menuItem.name) {
        console.log('Menu item name mismatch:', item.name, 'vs', menuItem.name);
        return NextResponse.json(
          { error: `Menu item name does not match for item ${item.menuItemId}` },
          { status: 400 }
        );
      }

      if (item.price && Number(item.price) !== menuItem.price) {
        console.log('Menu item price mismatch:', item.price, 'vs', menuItem.price);
        return NextResponse.json(
          { error: `Menu item price does not match for item ${item.menuItemId}` },
          { status: 400 }
        );
      }

      const itemPrice = menuItem.price * item.quantity;
      totalPrice += itemPrice;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
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

    const order = await prisma.order.create({
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
          include: {
            menuItem: true,
          },
        },
      },
    });

    console.log('Order created successfully:', order.id);

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const orderLink = `${baseUrl}/orders/${order.id}`;

    try {
      await sendEmail(
        customerEmail,
        `Your Sanga order #${order.id} is confirmed`,
        `<p>Thank you for your order, ${customerName}.</p>
         <p>Your order number is <strong>#${order.id}</strong> and its current status is <strong>${order.status}</strong>.</p>
         <p>Click the link below to view your order details and track its status:</p>
         <p><a href="${orderLink}" style="color:#FBBF24;">View order #${order.id}</a></p>`
      );
    } catch (emailError) {
      console.error("ORDER CONFIRMATION EMAIL ERROR:", emailError);
    }

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