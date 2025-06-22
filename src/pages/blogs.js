import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/blogsdashboard.css";

const BlogsDashboard = () => {
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [draftBlogs, setDraftBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState("published");
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserAndBlogs = async () => {
      try {
        const userRes = await axios.get("http://localhost:5000/api/me", {
          withCredentials: true,
        });
        const email = userRes.data.user.email;
        setUserEmail(email);

        const blogRes = await fetch("http://localhost:5000/api/blogs", {
          credentials: "include",
        });
        const blogData = await blogRes.json();

        const userBlogs = blogData.blogs.filter(
          (blog) => blog.authorEmail === email
        );

        const published = userBlogs.filter((blog) => blog.draft === false);
        const drafts = userBlogs.filter((blog) => blog.draft === true);

        setPublishedBlogs(published);
        setDraftBlogs(drafts);
      } catch (err) {
        console.error("Failed to load user or blogs", err);
      }
    };

    fetchUserAndBlogs();
  }, []);

  const handleTabClick = (tab) => setActiveTab(tab);

  const filteredBlogs = (activeTab === "published" ? publishedBlogs : draftBlogs).filter(
    (blog) => blog.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="blogs-main">
        <h2>Manage Blogs</h2>

        <div className="search-and-tabs">
          <input
            type="text"
            placeholder="🔍 Search Blogs"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="tabs">
            <button
              className={activeTab === "published" ? "active-tab" : ""}
              onClick={() => handleTabClick("published")}
            >
              Published Blogs
            </button>
            <button
              className={activeTab === "drafts" ? "active-tab" : ""}
              onClick={() => handleTabClick("drafts")}
            >
              Drafts
            </button>
          </div>
        </div>

        {filteredBlogs.length === 0 ? (
          <p className="no-blogs">No {activeTab} blogs found.</p>
        ) : (
          filteredBlogs.map((blog) => (
            <div key={blog._id} className="blog-card">
              {blog.bannerUrl && (
                <img
                  src={blog.bannerUrl}
                  alt="banner"
                  className="blog-banners"
                />
              )}
              <div className="blog-details">
                <h3>{blog.title}</h3>
                <p className="date">
                  {blog.draft ? "Draft saved on" : "Published on"}{" "}
                  {new Date(blog.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    weekday: "short",
                  })}
                </p>
                <div className="actions">
                  <Link to={`/editblog/${blog._id}`} className="blog-action edit">
                    Edit
                  </Link>
                  {blog.draft && (
                    <button
                      className="blog-action publish"
                      onClick={async () => {
                        try {
                          const res = await axios.put(
                            `http://localhost:5000/api/blog/${blog._id}`,
                            {
                              ...blog,
                              draft: false,
                            },
                            { withCredentials: true }
                          );

                          // Move blog from drafts to published
                          setDraftBlogs((prev) => prev.filter((b) => b._id !== blog._id));
                          setPublishedBlogs((prev) => [res.data.blog, ...prev]);
                        } catch (err) {
                          console.error("Error publishing blog:", err);
                        }
                      }}
                    >
                      Publish
                    </button>
                  )}
                  <button
                    className="blog-action delete"
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this blog?")) {
                        try {
                          await axios.delete(`http://localhost:5000/api/blog/${blog._id}`, {
                            withCredentials: true,
                          });

                          if (activeTab === "published") {
                            setPublishedBlogs((prev) => prev.filter((b) => b._id !== blog._id));
                          } else {
                            setDraftBlogs((prev) => prev.filter((b) => b._id !== blog._id));
                          }
                        } catch (err) {
                          console.error("Error deleting blog:", err);
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="stats">
                <span>{blog.likes} Likes</span>
                <span>0 Comments</span>
                <span>{blog.views || 0} Reads</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BlogsDashboard;







