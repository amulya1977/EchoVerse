import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
  fetch("http://localhost:5000/api/blogs", {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      const blogList = (data.blogs || []).filter((blog) => !blog.draft); // ✅ Filter out drafts
      setBlogs(blogList);
      setFilteredBlogs(blogList);
    })
    .catch((err) => console.error("Error fetching blogs:", err));

  fetch("http://localhost:5000/api/blogs/trending", {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      const trendingList = (data.blogs || []).filter((blog) => !blog.draft); // ✅ Also only published
      setTrendingBlogs(trendingList);

      const topicsSet = new Set();
      trendingList.forEach((blog) => {
        blog.topics?.forEach((topic) => topicsSet.add(topic));
      });
      setTrendingTopics(Array.from(topicsSet));
    })
    .catch((err) => console.error("Error fetching trending blogs:", err));
}, []);

  const handleLike = async (blogId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/blog/${blogId}/like`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      setBlogs((prevBlogs) =>
        prevBlogs.map((b) => (b._id === blogId ? { ...b, likes: data.likes } : b))
      );
      setFilteredBlogs((prevBlogs) =>
        prevBlogs.map((b) => (b._id === blogId ? { ...b, likes: data.likes } : b))
      );
    } catch (err) {
      console.error("Error liking blog:", err);
    }
  };

  const handleTopicFilter = (topic) => {
    if (topic === selectedTopic) {
      setSelectedTopic(null);
      setFilteredBlogs(blogs);
    } else {
      setSelectedTopic(topic);
      const filtered = blogs.filter((blog) => blog.topics?.includes(topic));
      setFilteredBlogs(filtered);
    }
  };

  const getTrendingScore = (blog) => {
    const now = new Date();
    const ageInDays = (now - new Date(blog.createdAt)) / (1000 * 60 * 60 * 24);
    const likes = blog.likes || 0;
    const views = blog.views || 0;
    const recencyBoost = Math.max(0, 30 - ageInDays);
    return likes * 2 + views * 1.5 + recencyBoost;
  };

  return (
    <div className="home-container">
      <div className="left-section">
        <div className="tabsh">
          <button
            className={`tab-button ${!selectedTopic ? "active-tabs" : ""}`}
            onClick={() => {
              handleTopicFilter(null);
              navigate("/");
            }}
          >
            Home
          </button>
        </div>

        {filteredBlogs
          .slice()
          .sort((a, b) => getTrendingScore(b) - getTrendingScore(a))
          .map((blog, idx) => (
            <div
              key={idx}
              className="blog-card"
              onClick={() => navigate(`/blog/${blog._id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="blog-content">
                <div className="blog-header">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profilepage/${blog.authorUsername}`);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    @{blog.authorUsername}
                  </span>{" "}
                  &nbsp;
                  {new Date(blog.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>

                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-desc">{blog.description}</p>

                <div className="blog-meta">
                  {blog.topics?.map((topic, i) => (
                    <span key={i} className="topic-tag">
                      {topic}
                    </span>
                  ))}
                  <span
                    className="likes"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(blog._id);
                    }}
                  >
                    ♡ {blog.likes || 0}
                  </span>
                </div>
              </div>

              {blog.bannerUrl && (
                <img
                  src={blog.bannerUrl}
                  alt="blog-banner"
                  className="blog-images"
                />
              )}
            </div>
          ))}
      </div>

      <div className="right-section">
        {/* Top Stories from All Interests */}
        <div className="right-box">
          <p className="section-title">Top Stories from All Interests</p>
          <div className="tags">
            {trendingTopics.map((topic, i) => (
              <span
                key={i}
                className={`topic-chip ${selectedTopic === topic ? "selected" : ""}`}
                onClick={() => handleTopicFilter(topic)}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Trending List */}
        <div className="right-box">
          <p className="section-title">Trending ↗</p>
          <ol className="trending-list">
            {trendingBlogs.slice(0, 7).map((blog, i) => (
              <li
                key={i}
                className="trending-item"
                onClick={() => navigate(`/blog/${blog._id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="trend-rank">{String(i + 1).padStart(2, "0")}</div>
                <div className="trend-info">
                  <div className="trend-author">
                    {blog.authorName || blog.authorUsername} @{blog.authorUsername} &nbsp;
                    {new Date(blog.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                  <div className="trend-title">{blog.title}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Home;


