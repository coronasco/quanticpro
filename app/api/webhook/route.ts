import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      console.log("Webhook: Checkout completed", { userId, session });

      if (userId) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          isPremium: true,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          updatedAt: new Date().toISOString()
        });
        console.log("Webhook: User updated to premium", userId);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      console.log("Webhook: Subscription deleted", { userId, subscription });

      if (userId) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          isPremium: false,
          stripeSubscriptionId: null,
          updatedAt: new Date().toISOString()
        });
        console.log("Webhook: User updated to non-premium", userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
} 