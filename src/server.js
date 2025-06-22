const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config();
const app = express();

// ============== Middleware ==============
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ============== Session Config ==============
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: "sessions",
  }),
  cookie: {
    httpOnly: true,
    secure: false,        // Set true only with HTTPS
    sameSite: "lax",      // or 'none' with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));


// ============== MongoDB Connection ==============
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ============== Mongoose Schemas ==============
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  username: String,
  bio: String,
  social: {
    youtube: String,
    facebook: String,
    twitter: String,
    instagram: String,
    website: String,
  },
});

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  bannerUrl: String,
  description: String,
  topics: [String],
  authorEmail: String,
  authorUsername: String,
  createdAt: { type: Date, default: Date.now },
  draft: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },          // ✅ Number of likes
  likedBy: [String],    
  views: { type: Number, default: 0 },
                        // ✅ Array of user emails who liked
   comments: [
  {
    user: String,
    username: String,
    text: String,
    date: { type: Date, default: Date.now },
  }
]

  
});



const User = mongoose.model("User", userSchema, "blogusers");
const Blog = mongoose.model("Blog", blogSchema, "blogs");

// ============== File Upload (Multer) ==============
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
app.use("/uploads", express.static(uploadDir));

// ============== Auth Routes ==============
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    req.session.user = { email: user.email, username: user.username };
    res.status(200).json({ message: "Login successful", user: req.session.user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out" });
  });
});

app.get("/api/me", async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ message: "Not logged in" });
    const user = await User.findOne({ email: req.session.user.email }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============== Profile Route ==============
app.put("/api/profile", async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ message: "Not logged in" });
    const updated = await User.findOneAndUpdate(
      { email: req.session.user.email },
      req.body,
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// ============== Fetch Profile by Username ==============
app.get("/api/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("name email bio social username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Fetch profile by username error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ============== Blog Routes ==============

// Upload banner image
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
  res.status(200).json({ url: imageUrl });
});
// Like or Unlike blog
app.post("/api/blog/:id/like", async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ message: "Not logged in" });
    const userEmail = req.session.user.email;
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const alreadyLiked = blog.likedBy.includes(userEmail);

    if (alreadyLiked) {
      blog.likes = Math.max(0, blog.likes - 1); // Prevent negative likes
      blog.likedBy = blog.likedBy.filter(email => email !== userEmail);
    } else {
      blog.likes += 1;
      blog.likedBy.push(userEmail);
    }

    await blog.save();
    res.status(200).json({ message: "Blog updated", likes: blog.likes, likedBy: blog.likedBy });
  } catch (err) {
    console.error("Like blog error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/blog/:id/like-status", async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ message: "Not logged in" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const liked = blog.likedBy.includes(req.session.user.email);
    res.status(200).json({ liked });
  } catch (err) {
    console.error("Get like status error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create blog (draft or published)
app.post("/api/blog/create", async (req, res) => {
  try {
    const { title, content, bannerUrl, draft, description, topics } = req.body;
    if (!req.session.user) return res.status(401).json({ message: "Not logged in" });

    const user = await User.findOne({ email: req.session.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const blog = new Blog({
      title, content, bannerUrl, draft, description, topics,
      authorEmail: user.email,
      authorUsername: user.username,
    });

    await blog.save();
    res.status(201).json({ message: "Blog created", blog });
  } catch (err) {
    console.error("Create blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Save as draft
app.post("/api/blog/draft", async (req, res) => {
  try {
    const { title, content, bannerUrl, publish } = req.body;
    if (!req.session.user) return res.status(401).json({ message: "Not logged in" });

    const user = await User.findOne({ email: req.session.user.email });
    
    const blog = new Blog({
      title,
      content,
      bannerUrl,
      draft: !publish, // 👈 set draft to true if not publishing
      authorEmail: user.email,
      authorUsername: user.username,
    });

    await blog.save();
    res.status(201).json({ message: "Blog saved", blogId: blog._id });
  } catch (err) {
    console.error("Save draft error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Add a comment to a blog post
app.post("/api/blog/:id/comment", async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ message: "Not logged in" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const user = await User.findOne({ email: req.session.user.email });
    const comment = {
      user: user.email,
      username: user.username || user.name,
      text: req.body.text,
    };

    blog.comments.push(comment);
    await blog.save();

    res.status(200).json({ message: "Comment added", comments: blog.comments });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/notifications", isAuthenticated, async (req, res) => {
  try {
    const userEmail = req.session.user.email;
    const myBlogs = await Blog.find({ authorEmail: userEmail });

    const likeNotifs = [];
    const commentNotifs = [];

    for (const blog of myBlogs) {
      // Likes
      for (const likerEmail of blog.likedBy) {
        const liker = await User.findOne({ email: likerEmail });
        if (liker) {
          likeNotifs.push({
            type: "like",
            blogId: blog._id,
            blogTitle: blog.title,
            likerUsername: liker.username || liker.name || "Anonymous",
            likedAt: blog.updatedAt, // fallback timestamp
          });
        }
      }

      // Comments
      for (const comment of blog.comments) {
        commentNotifs.push({
          type: "comment",
          blogId: blog._id,
          blogTitle: blog.title,
          commenterUsername: comment.username,
          commentText: comment.text,
          commentedAt: comment.date,
        });
      }
    }

    res.json({
      likes: likeNotifs,
      comments: commentNotifs,
    });
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ message: "Failed to load notifications" });
  }
});




// Publish blog (final step)
app.put("/api/blog/:id", async (req, res) => {
  try {
    const { description, topics } = req.body;
    const blog = await Blog.findByIdAndUpdate(req.params.id, {
      description, topics, draft: false,
    }, { new: true });

    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog published", blog });
  } catch (err) {
    console.error("Publish blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/blog/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({ blog });
  } catch (err) {
    console.error("Fetch blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }); // 🔥 Removed { draft: false }
    res.json({ blogs });
  } catch (err) {
    console.error("Fetch blogs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/blog/myblogs", async (req, res) => {
  try {
    console.log("Session user:", req.session.user);

    if (!req.session.user) {
      console.log("User not logged in.");
      return res.status(401).json({ message: "Not logged in" });
    }

    const blogs = await Blog.find({
  authorEmail: req.session.user.email
}).sort({ createdAt: -1 });



    console.log("Fetched blogs:", blogs.length);
    res.json({ blogs });
  } catch (err) {
    console.error("🔥 Fetch my blogs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/blog/edit/:id", upload.single("banner"), async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ message: "Not logged in" });

    const { title, description, topics } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.authorEmail !== req.session.user.email)
      return res.status(403).json({ message: "Not authorized to edit this blog" });

    blog.title = title;
    blog.description = description;
    blog.topics = topics.split(",").map((t) => t.trim());

    // If a new banner file is uploaded, update the bannerUrl
    if (req.file) {
      const imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
      blog.bannerUrl = imageUrl;
    }

    await blog.save();
    res.json({ message: "Blog updated", blog });
  } catch (err) {
    console.error("Error editing blog:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Delete blog by ID
app.delete("/api/blog/:id", async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ message: "Not logged in" });

    const blog = await Blog.findOneAndDelete({
      _id: req.params.id,
      authorEmail: req.session.user.email,
    });

    if (!blog) return res.status(404).json({ message: "Blog not found or unauthorized" });
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Delete blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({ message: "Not logged in" });
  }
}


app.get("/api/notifications", isAuthenticated, async (req, res) => {
  try {
    const userEmail = req.session.user.email;

    // Fetch all blogs created by the logged-in user
    const myBlogs = await Blog.find({ authorEmail: userEmail });

    const notifications = [];

    for (const blog of myBlogs) {
      for (const likerEmail of blog.likedBy) {
        const liker = await User.findOne({ email: likerEmail });

        if (liker) {
          notifications.push({
            blogId: blog._id,
            blogTitle: blog.title,
            likerEmail: liker.email,
            likerUsername: liker.username || liker.name || "Anonymous",
            likedAt: blog.updatedAt, // fallback since you're not storing like timestamps
          });
        }
      }
    }

    // Sort notifications by date (most recent first)
    notifications.sort((a, b) => new Date(b.likedAt) - new Date(a.likedAt));

    res.status(200).json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to load notifications" });
  }
});
app.get("/api/blogs/trending", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const blogs = await Blog.find({
      draft: false,
      createdAt: { $gte: sevenDaysAgo }
    });

    const gravity = 1.8;

    const scoredBlogs = blogs.map(blog => {
      const hoursSincePosted = (Date.now() - new Date(blog.createdAt).getTime()) / 3600000;
      const score = (blog.likes + blog.views) / Math.pow(hoursSincePosted + 2, gravity);

      return { ...blog.toObject(), score };
    });

    // Sort by score descending
    scoredBlogs.sort((a, b) => b.score - a.score);

    // Return top 7
    const topBlogs = scoredBlogs.slice(0, 7);

    res.status(200).json({ blogs: topBlogs });
  } catch (err) {
    console.error("Error fetching trending blogs:", err);
    res.status(500).json({ message: "Server error" });
  }
});




// ============== Start Server ==============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

