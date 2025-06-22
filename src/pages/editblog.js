import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/editblog.css"; // make sure this file exists

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [bannerFile, setBannerFile] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/blog/${id}`, { withCredentials: true })
      .then((res) => {
        const blog = res.data.blog;
        setTitle(blog.title || "");
        setDescription(blog.description || "");
        setTopics(blog.topics?.join(", ") || "");
        setBannerPreview(blog.bannerUrl || "");
      })
      .catch(() => alert("Failed to load blog"));
  }, [id]);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    if (!title.trim() || !description.trim() || !topics.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("topics", topics.split(",").map((t) => t.trim()));
    if (bannerFile) {
      formData.append("banner", bannerFile);
    }

    try {
      await axios.put(`http://localhost:5000/api/blog/edit/${id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Blog updated!");
      navigate("/blogs");
    } catch (err) {
      console.error(err);
      alert("Failed to update blog");
    }
  };

  return (
    <div className="edit-blog-container">
      <div className="edit-blog-preview">
        <h3>Preview</h3>
        {bannerPreview && (
          <img
            src={bannerPreview}
            alt="Banner"
            style={{
              width: "100%",
              borderRadius: "10px",
              objectFit: "cover",
              marginBottom: "20px",
            }}
          />
        )}
        <h2 style={{ marginTop: "20px" }}>{title}</h2>
      </div>

      <div className="edit-blog-form">
        <label>Blog Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Blog Title"
        />

        <label>Banner Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
        />

        <label>Short Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={200}
        />

        <label>Topics (comma-separated)</label>
        <input
          type="text"
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          placeholder="e.g. react, mongodb"
        />

        <button onClick={handleUpdate} className="update-blog-btn">
          Update Blog
        </button>
      </div>
    </div>
  );
};

export default EditBlog;



