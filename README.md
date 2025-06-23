# ✨ EchoVerse - MERN Stack Blogging Platform

EchoVerse is a full-featured blogging platform built using the **MERN Stack (MongoDB, Express, React, Node.js)**. It enables users to sign up, write blogs, save drafts, like, comment, and get real-time notifications. The UI is responsive and intuitive with advanced features like trending blog detection, profile management, and comment sidebars.

---

## 🚀 Features

- 🔐 **User Authentication** (Sign up / Login / Logout)
- 🧑 **Profile & Social Media Integration**
- 📝 **Rich Blog Editor** with image uploads
- 💾 **Save Blog as Draft or Publish**
- 📰 **My Blogs Dashboard** (draft & published)
- ❤️ **Like & Unlike** Blogs
- 💬 **Add Comments** (with sliding sidebar UI)
- 🔔 **Real-Time Notifications** (likes & comments)
- 📈 **Trending Algorithm** based on views + likes + recency
- 📱 **Mobile Responsive UI**

---

## 🛠️ Tech Stack

### Frontend (React.js)

- React Router
- CSS3 for custom styling
- Axios for API calls
- Responsive design using Flexbox

### Backend (Node.js + Express.js)

- MongoDB + Mongoose
- express-session + connect-mongo
- multer (for image uploads)
- bcryptjs (for password encryption)
- dotenv (for secure config)
- Cookie-based auth with CORS

---
## 📚 EchoVerse API Reference

### 🔐 Authentication & User Session
- `POST /api/auth/signup` – Register a new user.
- `POST /api/auth/login` – Login user with email & password.
- `POST /api/auth/logout` – Logout the current user.
- `GET /api/me` – Fetch current logged-in user (session-based).

---

### 👤 User Profile
- `PUT /api/profile` – Update user profile (bio, username, socials).
- `GET /api/user/:username` – Get public profile by username.

---

### 📦 Blog Management
- `POST /api/blog/create` – Create a new blog (published/draft).
- `POST /api/blog/draft` – Save a blog as draft.
- `GET /api/blogs` – Fetch all blogs (admin/feed).
- `GET /api/blogs/trending` – Get trending blogs (based on likes/views).
- `GET /api/blog/myblogs` – Get all blogs created by logged-in user.
- `GET /api/blog/:id` – Fetch a specific blog (and increment views).
- `PUT /api/blog/:id` – Publish/Update a blog with description/topics.
- `PUT /api/blog/edit/:id` – Edit title, topics, banner of a blog (with upload).
- `DELETE /api/blog/:id` – Delete a blog owned by the user.

---

### 🖼️ File Upload
- `POST /api/upload` – Upload a blog banner image via `multipart/form-data`.

---

### ❤️ Likes
- `POST /api/blog/:id/like` – Like/Unlike a blog (toggle by user).
- `GET /api/blog/:id/like-status` – Check if current user liked this blog.

---

### 💬 Comments
- `POST /api/blog/:id/comment` – Add a comment to a blog.

---

### 🔔 Notifications
- `GET /api/notifications` – Fetch all likes/comments on user’s blogs (requires login).

---
<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/65ee53ff-7517-4e45-930e-8d2fdbbd8cde" width="250"/><br>
      <b>🏠 Home</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/81d12453-93b8-40b3-916e-938222383566" width="250"/><br>
      <b>📝 Blog Page</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/b7e2e714-4cab-4a63-8b04-31fb37b8a99f" width="250"/><br>
      <b>✏️ Edit Blog</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/d511209f-7642-489d-be28-4787c643184f" width="250"/><br>
      <b>🚀 Publish Page</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/a016e9d5-4f20-4923-9aab-0f7551b08cd0" width="250"/><br>
      <b>🔔 Notifications</b>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/852a24d2-a6ac-446b-b87a-6691399963ce" width="250"/><br>
      <b>📚 Blogs Dashboard</b>
    </td>
  </tr>
</table>






## 📁 Folder Structure

---

## ⚙️ Setup Instructions

### ✅ Prerequisites

- Node.js & npm
- MongoDB (Local or Atlas)
- Git

---

### 📦 Step 1: Clone the Repository

```bash
git clone https://github.com/amulya1977/EchoVerse.git
cd EchoVerse



