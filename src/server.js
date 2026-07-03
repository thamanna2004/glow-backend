const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

// DB connection
const connectDB = require("./config/db");
const seedSkinCategories = require("./seed/seedSkinCategories");
const seedProducts = require("./seed/seedProducts");

connectDB().then(async () => {
  await seedSkinCategories();
  await seedProducts();
});

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");

// NEW: Category + SubCategory routes
const categoryRoutes = require("./routes/categoryRoutes");
const subCategoryRoutes = require("./routes/subCategoryRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Middleware
const { protect } = require("./middleware/authMiddleware");

const app = express();


// =========================
// GLOBAL MIDDLEWARE
// =========================

app.use(
    cors({
        origin: (origin, callback) => {
            const allowed = [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174",
            ];
            const isLocalDev =
                !origin ||
                allowed.includes(origin) ||
                /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

            if (isLocalDev) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cookieParser());


// =========================
// STATIC FILES
// =========================

// only needed for local uploads
// Cloudinary images will still work

app.use(
    "/uploads",
    express.static("uploads")
);


// =========================
// ROUTES
// =========================


// Authentication
app.use(
    "/api/auth",
    authRoutes
);


// Products
app.use(
    "/api/products",
    productRoutes
);


// Users
app.use(
    "/api/users",
    userRoutes
);


// Admin
app.use(
    "/api/admin",
    adminRoutes
);

// Orders
app.use(
    "/api/orders",
    orderRoutes
);


// NEW: Categories
app.use(
    "/api/categories",
    categoryRoutes
);


// NEW: SubCategories
app.use(
    "/api/subcategories",
    subCategoryRoutes
);

app.use(
    "/api/ai",
    aiRoutes
);


// =========================
// TEST PROTECTED ROUTE
// =========================

app.get(
    "/api/profile",
    protect,
    (req, res) => {

        res.json({
            message: "Profile accessed",
            user: req.user
        });

    }
);


// =========================
// HOME ROUTE
// =========================

app.get(
    "/",
    (req, res) => {

        res.send(
            "Glow Skin API Running"
        );

    }
);


// =========================
// ERROR HANDLER
// =========================

app.use(
    (err, req, res, next) => {

        console.log("SERVER ERROR:");
        console.log(err.message);

        res.status(500).json({
            message: err.message
        });

    }
);


// =========================
// SERVER START
// =========================

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);