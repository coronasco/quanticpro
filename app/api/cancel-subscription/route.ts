import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // Get user's subscription ID from Firestore
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const subscriptionId = userDoc.data().stripeSubscriptionId;

    if (subscriptionId) {
      // Cancel the subscription in Stripe
      await stripe.subscriptions.cancel(subscriptionId);
    }

    // Update user's premium status in Firestore
    await updateDoc(userRef, {
      isPremium: false,
      stripeSubscriptionId: null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
} 