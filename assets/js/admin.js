// =========================
// admin.js
// =========================

import { config } from "./config.js";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// ---------------------------------------------
// Utilities
// ---------------------------------------------
function showAlert(message, type = "success") {
  const existing = document.querySelector(".alert-custom");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.className = `alert alert-${type} alert-custom`;
  div.innerHTML = message;
  document.body.appendChild(div);

  setTimeout(() => div.remove(), 3000);
}

function handleError(error, context = "") {
  console.error(`${context} Error:`, error);
  showAlert(`⚠️ ${context || "Error"}: ${error.message}`, "danger");
}

// ---------------------------------------------
// Authentication
// ---------------------------------------------
async function checkAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    showDashboard();
  } else {
    document.getElementById("loginScreen").style.display = "flex";
  }
}

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("loginError");

  errorDiv.style.display = "none";
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) throw error;
    showDashboard();
  } catch (err) {
    errorDiv.textContent = "Invalid credentials. Please try again.";
    errorDiv.style.display = "block";
  }
});

window.logout = async function () {
  await supabase.auth.signOut();
  location.reload();
};

// ---------------------------------------------
// Dashboard Display
// ---------------------------------------------
function showDashboard() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("adminDashboard").style.display = "block";
  loadAllData();
}

function loadAllData() {
  loadBlogs();
  loadClients();
  loadQuotes();
}

// ---------------------------------------------
// BLOG MANAGEMENT
// ---------------------------------------------
async function loadBlogs() {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;
    renderBlogs(data);
  } catch (err) {
    handleError(err, "Load Blogs");
  }
}

function renderBlogs(data) {
  const tbody = document.getElementById("blogsTableBody");
  if (!tbody) return;

  if (!data.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center">No blogs found</td></tr>';
    return;
  }

  tbody.innerHTML = data
    .map(
      (blog) => `
    <tr>
      <td><img src="${blog.image_url}" class="preview-image" alt="${
        blog.title
      }"></td>
      <td>${blog.title}</td>
      <td>${blog.author || "N/A"}</td>
      <td>${new Date(blog.date).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editBlog(${
          blog.id
        })"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteBlog(${
          blog.id
        })"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `
    )
    .join("");
}

// Add/Edit Blog
window.showAddBlogForm = function () {
  const formContainer = document.getElementById("blogFormContainer");
  formContainer.style.display = "block";
  document.getElementById("blogFormTitle").textContent = "Add New Blog Post";
  document.getElementById("blogForm").reset();
  document.getElementById("blogId").value = "";
  document.getElementById("blogDate").valueAsDate = new Date();
};

window.cancelBlogForm = function () {
  document.getElementById("blogFormContainer").style.display = "none";
  document.getElementById("blogForm").reset();
};

document.getElementById("blogForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const blogData = {
    title: document.getElementById("blogTitle").value,
    description: document.getElementById("blogDescription").value,
    full_content: document.getElementById("blogContent").value,
    author: document.getElementById("blogAuthor").value,
    date: document.getElementById("blogDate").value,
    image_url: document.getElementById("blogImage").value,
  };

  const blogId = document.getElementById("blogId").value;
  try {
    if (blogId) {
      await supabase.from("blogs").update(blogData).eq("id", blogId);
      showAlert("✅ Blog updated successfully!");
    } else {
      await supabase.from("blogs").insert([blogData]);
      showAlert("✅ Blog added successfully!");
    }
    window.cancelBlogForm();
    loadBlogs();
  } catch (err) {
    handleError(err, "Save Blog");
  }
});

window.editBlog = async function (id) {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return handleError(error, "Edit Blog");

  const b = data;
  document.getElementById("blogId").value = b.id;
  document.getElementById("blogTitle").value = b.title;
  document.getElementById("blogDescription").value = b.description;
  document.getElementById("blogContent").value = b.full_content;
  document.getElementById("blogAuthor").value = b.author;
  document.getElementById("blogDate").value = b.date;
  document.getElementById("blogImage").value = b.image_url;

  document.getElementById("blogFormTitle").textContent = "Edit Blog Post";
  document.getElementById("blogFormContainer").style.display = "block";
};

window.deleteBlog = async function (id) {
  if (!confirm("Are you sure you want to delete this blog post?")) return;
  await supabase.from("blogs").delete().eq("id", id);
  showAlert("🗑️ Blog deleted successfully!");
  loadBlogs();
};

// ---------------------------------------------
// CLIENT MANAGEMENT
// ---------------------------------------------
async function loadClients() {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("priority", { ascending: true });

    if (error) throw error;
    renderClients(data);
  } catch (err) {
    handleError(err, "Load Clients");
  }
}

function renderClients(data) {
  const tbody = document.getElementById("clientsTableBody");
  if (!tbody) return;

  if (!data.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center">No clients found</td></tr>';
    return;
  }

  tbody.innerHTML = data
    .map(
      (c) => `
    <tr>
      <td><img src="${c.image_url}" class="preview-image" alt="${c.name}"></td>
      <td>${c.name}</td>
      <td>${
        c.website ? `<a href="${c.website}" target="_blank">Visit</a>` : "N/A"
      }</td>
      <td>${c.priority}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editClient(${
          c.id
        })"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteClient(${
          c.id
        })"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `
    )
    .join("");
}

window.showAddClientForm = function () {
  const formContainer = document.getElementById("clientFormContainer");
  formContainer.style.display = "block";
  document.getElementById("clientFormTitle").textContent = "Add New Client";
  document.getElementById("clientForm").reset();
  document.getElementById("clientId").value = "";
};

window.cancelClientForm = function () {
  document.getElementById("clientFormContainer").style.display = "none";
  document.getElementById("clientForm").reset();
};

document.getElementById("clientForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const clientData = {
    name: document.getElementById("clientName").value,
    image_url: document.getElementById("clientImage").value,
    website: document.getElementById("clientWebsite").value || null,
    priority: parseInt(document.getElementById("clientPriority").value),
  };

  const clientId = document.getElementById("clientId").value;
  try {
    if (clientId) {
      await supabase.from("clients").update(clientData).eq("id", clientId);
      showAlert("✅ Client updated successfully!");
    } else {
      await supabase.from("clients").insert([clientData]);
      showAlert("✅ Client added successfully!");
    }
    window.cancelClientForm();
    loadClients();
  } catch (err) {
    handleError(err, "Save Client");
  }
});

window.editClient = async function (id) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return handleError(error, "Edit Client");

  const c = data;
  document.getElementById("clientId").value = c.id;
  document.getElementById("clientName").value = c.name;
  document.getElementById("clientImage").value = c.image_url;
  document.getElementById("clientWebsite").value = c.website || "";
  document.getElementById("clientPriority").value = c.priority;

  document.getElementById("clientFormTitle").textContent = "Edit Client";
  document.getElementById("clientFormContainer").style.display = "block";
};

window.deleteClient = async function (id) {
  if (!confirm("Are you sure you want to delete this client?")) return;
  await supabase.from("clients").delete().eq("id", id);
  showAlert("🗑️ Client deleted successfully!");
  loadClients();
};

// ---------------------------------------------
// QUOTE REQUESTS
// ---------------------------------------------
async function loadQuotes() {
  try {
    const { data, error } = await supabase
      .from("collaborator_info")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    renderQuotes(data);
  } catch (err) {
    handleError(err, "Load Quotes");
  }
}

function renderQuotes(data) {
  const tbody = document.getElementById("quotesTableBody");
  if (!tbody) return;

  if (!data.length) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center">No quotes found</td></tr>';
    return;
  }

  tbody.innerHTML = data
    .map(
      (q) => `
    <tr>
      <td>${q.email || "N/A"}</td>
      <td>${q.website || "N/A"}</td>
      <td>${new Date(q.created_at).toLocaleString()}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteQuote(${
        q.id
      })"><i class="fas fa-trash"></i></button></td>
    </tr>
  `
    )
    .join("");
}

window.deleteQuote = async function (id) {
  if (!confirm("Delete this quote request?")) return;
  await supabase.from("collaborator_info").delete().eq("id", id);
  showAlert("🗑️ Quote deleted successfully!");
  loadQuotes();
};
// ... all your existing code ...

window.deleteQuote = async function (id) {
  if (!confirm("Delete this quote request?")) return;
  await supabase.from("collaborator_info").delete().eq("id", id);
  showAlert("🗑️ Quote deleted successfully!");
  loadQuotes();
};

// ---------------------------------------------
// Supabase Storage Upload Functions
// ---------------------------------------------

// Upload blog image to Supabase Storage
window.uploadBlogImage = async function () {
  const fileInput = document.getElementById("blogImageFile");
  const file = fileInput.files[0];

  if (!file) {
    showAlert("⚠️ Please select an image file first", "warning");
    return;
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    showAlert("⚠️ Please select a valid image file", "warning");
    return;
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showAlert("⚠️ File size must be less than 5MB", "warning");
    return;
  }

  // Show loading state
  const uploadBtn = event.target;
  const originalText = uploadBtn.innerHTML;
  uploadBtn.disabled = true;
  uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `blog_${timestamp}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("blog-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("blog-images").getPublicUrl(filePath);

    // Set the URL in the input field
    document.getElementById("blogImage").value = publicUrl;

    // Show preview
    const previewDiv = document.getElementById("blogImagePreview");
    previewDiv.innerHTML = `
      <div class="alert alert-success d-flex align-items-center">
        <img src="${publicUrl}" class="preview-image me-3" alt="Preview" />
        <div>
          <strong>✅ Uploaded successfully!</strong><br>
          <small class="text-muted">${fileName}</small>
        </div>
      </div>
    `;

    showAlert("✅ Blog image uploaded successfully!", "success");

    // Clear file input
    fileInput.value = "";
  } catch (error) {
    console.error("Upload error:", error);
    showAlert(`❌ Upload failed: ${error.message}`, "danger");
  } finally {
    // Restore button
    uploadBtn.disabled = false;
    uploadBtn.innerHTML = originalText;
  }
};

// Upload client logo to Supabase Storage
window.uploadClientImage = async function () {
  const fileInput = document.getElementById("clientImageFile");
  const file = fileInput.files[0];

  if (!file) {
    showAlert("⚠️ Please select an image file first", "warning");
    return;
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    showAlert("⚠️ Please select a valid image file", "warning");
    return;
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showAlert("⚠️ File size must be less than 5MB", "warning");
    return;
  }

  // Show loading state
  const uploadBtn = event.target;
  const originalText = uploadBtn.innerHTML;
  uploadBtn.disabled = true;
  uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `client_${timestamp}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("client-logos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("client-logos").getPublicUrl(filePath);

    // Set the URL in the input field
    document.getElementById("clientImage").value = publicUrl;

    // Show preview
    const previewDiv = document.getElementById("clientImagePreview");
    previewDiv.innerHTML = `
      <div class="alert alert-success d-flex align-items-center">
        <img src="${publicUrl}" class="preview-image me-3" alt="Preview" />
        <div>
          <strong>✅ Uploaded successfully!</strong><br>
          <small class="text-muted">${fileName}</small>
        </div>
      </div>
    `;

    showAlert("✅ Client logo uploaded successfully!", "success");

    // Clear file input
    fileInput.value = "";
  } catch (error) {
    console.error("Upload error:", error);
    showAlert(`❌ Upload failed: ${error.message}`, "danger");
  } finally {
    // Restore button
    uploadBtn.disabled = false;
    uploadBtn.innerHTML = originalText;
  }
};

// Optional: Function to delete old images when updating
async function deleteOldImage(imageUrl, bucketName) {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split(`${bucketName}/`);
    if (urlParts.length < 2) return;

    const filePath = urlParts[1].split("?")[0]; // Remove query params if any

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
    }
  } catch (error) {
    console.error("Delete error:", error);
  }
}

document.addEventListener("DOMContentLoaded", checkAuth);
