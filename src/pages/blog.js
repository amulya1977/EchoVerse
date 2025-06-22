import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/blogDetails.css";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const sidebarRef = useRef();

  useEffect(() => {
    fetch(`http://localhost:5000/api/blog/${id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setBlog(data.blog);
        setComments(data.blog.comments.reverse());
      })
      .catch((err) => console.error("Error fetching blog:", err));
  }, [id]);

  const handleLike = async () => {
    try {
      setIsLiking(true);
      const res = await fetch(`http://localhost:5000/api/blog/${id}/like`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setBlog((prev) => ({ ...prev, likes: data.likes }));
    } catch (error) {
      console.error("Error liking blog:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    const res = await fetch(`http://localhost:5000/api/blog/${id}/comment`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: commentText }),
    });

    const data = await res.json();
    setComments(data.comments.reverse());
    setCommentText("");
  };

  // Close comment sidebar on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        showComments &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setShowComments(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showComments]);

  if (!blog) return <p>Loading...</p>;

  return (
    <div className="blog-details-container">
      {blog.bannerUrl && (
        <img src={blog.bannerUrl} alt="Blog Banner" className="blog-banner" />
      )}
      <h1 className="blog-title">{blog.title}</h1>

      <div className="blog-info-row">
        <div className="blog-info-left">
          <p className="author">@{blog.authorUsername}</p>
          <p className="date">
            Published on{" "}
            {new Date(blog.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="blog-info-right">
          <span className="likes" onClick={handleLike}>
            ♡ {isLiking ? "..." : blog.likes}
          </span>
          <span className="comments-toggle" onClick={() => setShowComments(true)}>
            💬
          </span>
        </div>
      </div>

      <div className="blog-content">
        <p>{blog.content}</p>
      </div>

      {/* Comment Sidebar */}
      <div className={`comment-sidebar ${showComments ? "open" : ""}`} ref={sidebarRef}>
        <h3>Comments</h3>
        <div className="comment-list">
          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map((c, i) => (
              <div key={i} className="comment">
                <p>
                  <strong>@{c.username}</strong> •{" "}
                  {new Date(c.date).toLocaleDateString()}
                </p>
                <p>{c.text}</p>
              </div>
            ))
          )}
        </div>
        <div className="comment-form">
          <textarea
            rows="3"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button onClick={handleCommentSubmit}>Post</button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
