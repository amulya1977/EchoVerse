import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/notifications.css";
import Sidebar from "../components/sidebar";
import { useNavigate } from "react-router-dom";

const NotificationsPage = () => {
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/notifications", {
        withCredentials: true,
      })
      .then((res) => {
        setLikes(res.data.likes || []);
        setComments(res.data.comments || []);
      })
      .catch((err) => {
        console.error("Error fetching notifications", err);
      });
  }, []);

  return (
    <div className="page-layout" style={{ display: "flex" }}>
      <Sidebar />

      <div className="notifications-container" style={{ flex: 1, padding: "2rem" }}>
        <h2 className="notif-title">Notifications</h2>

        <section className="notif-section">
          <h3 className="notif-subtitle">Likes</h3>
          {likes.length === 0 ? (
            <p className="no-notifs">No likes yet.</p>
          ) : (
            likes.map((notif, index) => (
              <div
                key={`like-${index}`}
                className="notif-card"
                onClick={() => navigate(`/blog/${notif.blogId}`)}
              >
                <div className="notif-content">
                  <span className="notif-user">@{notif.likerUsername}</span> liked your blog{" "}
                  <strong>{notif.blogTitle}</strong>
                  <div className="notif-date">
                    {new Date(notif.likedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="notif-section">
          <h3 className="notif-subtitle">Comments</h3>
          {comments.length === 0 ? (
            <p className="no-notifs">No comments yet.</p>
          ) : (
            comments.map((notif, index) => (
              <div
                key={`comment-${index}`}
                className="notif-card"
                onClick={() => navigate(`/blog/${notif.blogId}`)}
              >
                <div className="notif-content">
                  <span className="notif-user">@{notif.commenterUsername}</span> commented on{" "}
                  <strong>{notif.blogTitle}</strong>
                  <div className="notif-snippet">"{notif.commentText}"</div>
                  <div className="notif-date">
                    {new Date(notif.commentedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default NotificationsPage;
