import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/profilepage.css";
import {
  FaYoutube,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLink,
} from "react-icons/fa";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({});
  const [userBlogs, setUserBlogs] = useState([]);
  const navigate = useNavigate();
  const { username } = useParams();

  useEffect(() => {
    const fetchProfileAndBlogs = async () => {
      try {
        // Get logged-in user's info
        const meRes = await axios.get("http://localhost:5000/api/me", {
          withCredentials: true,
        });
        const { username: myUsername, email: myEmail } = meRes.data.user;

        // Fetch profile info of the user in the URL
        const profileRes = await axios.get(
          `http://localhost:5000/api/user/${username || myUsername}`
        );
        setProfileData(profileRes.data);

        // Fetch all blogs
        const blogsRes = await axios.get("http://localhost:5000/api/blogs", {
          withCredentials: true,
        });

        // Filter: if viewing own profile → use email; otherwise → use username
    const filteredBlogs = blogsRes.data.blogs
  .filter((blog) => !blog.draft) // filter out drafts
  .filter((blog) =>
    username === myUsername || !username
      ? blog.authorEmail === myEmail
      : blog.authorUsername === username
  );



        setUserBlogs(filteredBlogs);
      } catch (err) {
        console.error("Error fetching profile or blogs", err);
      }
    };

    fetchProfileAndBlogs();
  }, [username]);

  const handleLike = async (blogId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/blog/${blogId}/like`,
        {},
        { withCredentials: true }
      );
      const updatedLikes = res.data.likes;
      setUserBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog._id === blogId ? { ...blog, likes: updatedLikes } : blog
        )
      );
    } catch (err) {
      console.error("Error liking blog:", err);
    }
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-main-content">
        <div className="blogs-list-section">
          <h3 className="section-heading">Blogs Published</h3>
          {userBlogs.length > 0 ? (
            userBlogs.map((blog) => (
              <div
                key={blog._id}
                className="blog-item-card"
                onClick={() => navigate(`/blog/${blog._id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="blog-item-content">
                  <div className="blog-item-text">
                    <div className="blog-item-header">
                      <span className="blog-item-author">
                        {profileData.name} @{profileData.username}
                      </span>
                      <span className="blog-item-date">
                        {new Date(blog.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <h4 className="blog-item-title">{blog.title}</h4>
                    <p className="blog-item-description">{blog.description}</p>
                    <div className="blog-item-footer">
                      <div className="blog-item-topics">
                        {blog.topics?.map((topic, i) => (
                          <span key={i} className="blog-topic-tag">
                            {topic}
                          </span>
                        ))}
                      </div>
                      <div className="blog-item-stats">
                        <span
                          className="blog-item-likes"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(blog._id);
                          }}
                        >
                          ♡ {blog.likes || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {blog.bannerUrl && (
                    <img
                      src={blog.bannerUrl}
                      alt="Blog Banner"
                      className="blog-item-banner-image"
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-blogs-message">No blogs published yet.</p>
          )}
        </div>

        <div className="profile-sidebar-card">
          <div className="profile-sidebar-header">
            <div className="profile-sidebar-avatar emoji-avatar">😎</div>
          </div>
          <div className="profile-sidebar-body">
            <div className="profile-sidebar-username">@{profileData.username}</div>
            <div className="profile-sidebar-name">{profileData.name}</div>
            <div className="profile-sidebar-stats">
              {userBlogs.length} Blogs -{" "}
              {userBlogs.reduce((sum, blog) => sum + (blog.reads || 0), 0)} Reads
            </div>
            <p className="profile-sidebar-bio">{profileData.bio}</p>

            <div className="profile-sidebar-social-links">
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="youtube"
              >
                <FaYoutube className="social-icon-react" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="instagram"
              >
                <FaInstagram className="social-icon-react" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="facebook"
              >
                <FaFacebook className="social-icon-react" />
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="twitter"
              >
                <FaTwitter className="social-icon-react" />
              </a>
              <a
                href="https://www.example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="website"
              >
                <FaLink className="social-icon-react" />
              </a>
            </div>

            <div className="profile-sidebar-joined-date">
              Joined on{" "}
              {profileData.createdAt
                ? new Date(profileData.createdAt).toLocaleDateString("en-GB")
                : "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

