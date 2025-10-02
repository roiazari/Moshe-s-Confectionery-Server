const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: false },   // אם יש לך מזהה מוצר
  name:      { type: String, required: true },
  price:     { type: Number, required: true },     // בדולרים (נוח לקוד), נשמור גם בסנטים אם תרצה
  quantity:  { type: Number, required: true },
  image:     { type: String }                      // אופציונלי
});

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [OrderItemSchema],
    total: { type: Number, required: true },       // סכום בדולרים
    currency: { type: String, default: "usd" },
    paymentIntentId: { type: String, required: true }, // מזהה מהStripe
    status: { type: String, default: "paid" }      // אפשר: paid, refunded, cancelled
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
