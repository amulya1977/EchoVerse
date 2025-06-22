import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Editor = () => {
  const [bannerUrl, setBannerUrl] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/me", { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => console.log("Not logged in"));
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      setBannerUrl(response.data.url);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (isPublish) => {
    if (!title || !content) return alert("Fill all fields");

    try {
      const res = await axios.post("http://localhost:5000/api/blog/draft", {
        title,
        content,
        bannerUrl,
        publish: isPublish
      }, { withCredentials: true });

      const blogId = res.data.blogId;
      if (isPublish) {
        navigate(`/publish/${blogId}`);
      } else {
        alert("Draft saved!");
      }
    } catch (err) {
      console.error("Error saving:", err);
      alert("Error saving draft");
    }
  };

  // ✅ Register Navbar button triggers
  useEffect(() => {
    const handleSaveDraft = () => handleSave(false);
    const handlePublish = () => handleSave(true);

    document.addEventListener("saveDraftBlog", handleSaveDraft);
    document.addEventListener("publishBlog", handlePublish);

    return () => {
      document.removeEventListener("saveDraftBlog", handleSaveDraft);
      document.removeEventListener("publishBlog", handlePublish);
    };
  }, [title, content, bannerUrl]);

  if (!user) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Please log in to create a blog.</div>;
  }

  return (
    <>
      {/* Editor UI */}
      <div style={{ maxWidth: 800, margin: "auto", padding: "20px" }}>
        <div style={{ border: "2px dashed gray", padding: "30px", textAlign: "center", marginBottom: "20px" }}>
          {bannerUrl ? (
            <img src={bannerUrl} alt="Banner" style={{ maxWidth: "100%", height: "auto" }} />
          ) : (
            <>
              <p>Upload Blog Banner</p>
              <input type="file" onChange={handleImageUpload} disabled={uploading} />
            </>
          )}
        </div>

        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", fontSize: "2em", margin: "20px 0", padding: "10px" }}
        />

        <textarea
          placeholder="Let's write an awesome story!"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          style={{ width: "100%", padding: "15px", fontSize: "1.1em" }}
        ></textarea>
      </div>
    </>
  );
};

export default Editor;

