const express = require("express");
const Stripe = require("stripe");
const requireAuth = require("../middleware/auth");
const Order = require("../models/Order");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/checkout/create-intent
 * יוצר PaymentIntent ומחזיר clientSecret לקליינט
 * חשוב: בחיים האמיתיים מחשבים סכום בצד שרת לפי רשימת מוצרים מהDB (כדי למנוע מניפולציה)
 */
router.post("/checkout/create-intent", requireAuth, async (req, res) => {
  try {
    const { items, currency = "usd" } = req.body;

    // חישוב אמיתי צריך להיות לפי מחירים מהשרת.
    // כאן לצורך הדגמה נשתמש במחירים שמגיעים מהלקוח (אם כבר יש לך קטלוג בשרת – החלף לזה).
    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const amountInCents = Math.round(total * 100);

    const intent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      automatic_payment_methods: { enabled: true }
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("create-intent error:", err.message);
    res.status(500).json({ message: "Stripe error" });
  }
});

/**
 * POST /api/orders
 * נשמרת הזמנה לאחר תשלום מוצלח (client confirms & then calls this)
 */
router.post("/orders", requireAuth, async (req, res) => {
  try {
    const { paymentIntentId, items, total, currency = "usd" } = req.body;

    // אימות בסיסי: נוודא שה־PI באמת succeeded (לא חובה בשלב ראשון, אבל רצוי)
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const order = await Order.create({
      user: req.userId,
      items,
      total,
      currency,
      paymentIntentId,
      status: "paid"
    });

    res.status(201).json({ message: "Order saved", orderId: order._id });
  } catch (err) {
    console.error("save order error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/orders/my
 * היסטוריית רכישות של המשתמש
 */
router.get("/orders/my", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
