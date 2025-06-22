import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Publish = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/blog/${id}`, { withCredentials: true })
      .then((res) => {
        const blogData = res.data.blog;
        setBlog(blogData);
        setDescription(blogData.description || "");
        setTopics(blogData.topics?.join(", ") || "");
      })
      .catch(() => alert("Failed to load blog"));
  }, [id]);

  const handleFinalPublish = async () => {
    if (!description.trim() || !topics.trim()) {
      alert("Please fill in both description and topics before publishing.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/blog/${id}`,
        {
          description: description.trim(),
          topics: topics.split(",").map((t) => t.trim()),
          draft: false, // publish
        },
        { withCredentials: true }
      );

      alert("✅ Blog published!");
      navigate("/blogs");
    } catch (err) {
      console.error(err);
      alert("Failed to publish");
    }
  };

  if (!blog) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", padding: "40px", gap: "40px", maxWidth: 1200, margin: "auto" }}>
      <div style={{ flex: 1 }}>
        <h3>Preview</h3>
        {blog.bannerUrl && (
          <img
            src={blog.bannerUrl}
            alt="Banner"
            style={{ width: "100%", borderRadius: "10px", objectFit: "cover" }}
          />
        )}
        <h2 style={{ marginTop: "20px" }}>{blog.title}</h2>
      </div>

      <div style={{ flex: 1 }}>
        <label>Short Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={200}
          style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
        ></textarea>

        <label>Topics (comma-separated)</label>
        <input
          type="text"
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          placeholder="e.g. react, mongodb"
          style={{ width: "100%", padding: "10px", marginBottom: "30px" }}
        />

        <button onClick={handleFinalPublish} style={btnStyle}>Publish</button>
      </div>
    </div>
  );
};

const btnStyle = {
  padding: "12px 25px",
  fontSize: "1em",
  backgroundColor: "black",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

export default Publish;




