const Order = require("../models/orderModel");

const PAYMENT_METHODS = ["COD", "CARD", "UPI", "NET_BANKING", "WALLET"];

function resolvePaymentStatus(paymentMethod) {
  return paymentMethod === "COD" ? "Pending" : "Paid";
}

function sanitizePaymentDetails(paymentMethod, details = {}) {
  const safe = {};

  if (paymentMethod === "CARD" && details.cardNumber) {
    const digits = String(details.cardNumber).replace(/\D/g, "");
    safe.cardLast4 = digits.slice(-4);
    safe.cardBrand = details.cardBrand || "";
  }

  if (paymentMethod === "UPI" && details.upiId) {
    safe.upiId = String(details.upiId).trim();
  }

  if (paymentMethod === "NET_BANKING" && details.bankName) {
    safe.bankName = String(details.bankName).trim();
  }

  if (paymentMethod === "WALLET" && details.walletName) {
    safe.walletName = String(details.walletName).trim();
  }

  return safe;
}

const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      subtotal,
      discount,
      shippingFee,
      totalAmount,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const requiredShipping = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "state",
      "pinCode",
    ];

    for (const field of requiredShipping) {
      if (!shippingAddress?.[field]?.trim?.()) {
        return res.status(400).json({ message: `Shipping ${field} is required` });
      }
    }

    const user = req.user;
    const customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim();

    const order = await Order.create({
      userId: user._id,
      customerName,
      customerEmail: shippingAddress.email.trim(),
      items: items.map((item) => ({
        productId: item.productId || item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        imageUrl: item.imageUrl || "",
      })),
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      shippingFee: Number(shippingFee) || 0,
      totalAmount: Number(totalAmount) || 0,
      shippingAddress: {
        firstName: shippingAddress.firstName.trim(),
        lastName: shippingAddress.lastName.trim(),
        email: shippingAddress.email.trim(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pinCode: shippingAddress.pinCode.trim(),
      },
      paymentMethod,
      paymentStatus: resolvePaymentStatus(paymentMethod),
      orderStatus: "Processing",
      paymentDetails: sanitizePaymentDetails(paymentMethod, paymentDetails),
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
};
