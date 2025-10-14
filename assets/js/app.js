import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ---------------------------
   Supabase Initialization
---------------------------- */
const SUPABASE_URL = "https://vzgjporfwwajxrcimekz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Z2pwb3Jmd3dhanhyY2ltZWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NTkzMjgsImV4cCI6MjA3NTAzNTMyOH0.VkZDlu_mHX6gueoyd6N8HgHV5t34x0weErkpVYk3YU8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------------------------
   Load Clients
---------------------------- */
async function loadClients() {
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("priority", { ascending: true });

  if (error) {
    console.error("Clients error:", error);
    return;
  }

  const container = document.getElementById("clients-container");
  if (!container) return;
  container.innerHTML = "";

  clients.forEach((client) => {
    const div = document.createElement("div");
    div.classList.add("col-6", "col-md-3", "mb-4", "text-center");
    div.innerHTML = `
      <a href="${client.website || "#"}" target="_blank">
        <img src="${client.image_url}" alt="${client.name}" 
             style="max-height:80px; object-fit:contain;" 
             class="img-fluid">
      </a>`;
    container.appendChild(div);
  });
}

/* ---------------------------
   Load Blogs
---------------------------- */
async function loadBlogs() {
  const { data: blogs, error } = await supabase
    .from("blogs")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching blogs:", error.message);
    return;
  }

  const blogContainer = document.getElementById("blog-container");
  if (!blogContainer) return;
  blogContainer.innerHTML = "";

  blogs.forEach((blog) => {
    const post = document.createElement("div");
    post.classList.add("col-lg-4", "col-md-6", "mb-4");

    post.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${blog.image_url || "https://via.placeholder.com/400"}" 
            class="card-img-top" alt="${blog.title}">
        <div class="card-body">
          <h5 class="card-title">${blog.title}</h5>
          <p class="text-muted"><em>${new Date(
            blog.date
          ).toLocaleDateString()}</em></p>
          <p class="card-text">${(blog.description || "").substring(
            0,
            100
          )}...</p>
          <button class="btn btn-primary btn-sm read-more">Read More</button>
        </div>
      </div>
    `;

    post
      .querySelector(".read-more")
      .addEventListener("click", () => openModal(blog));
    blogContainer.appendChild(post);
  });
}

/* ---------------------------
   Blog Modal
---------------------------- */
function openModal(blog) {
  document.getElementById("modalTitle").innerText = blog.title;
  document.getElementById("modalDate").innerText = new Date(
    blog.date
  ).toLocaleDateString();
  document.getElementById("modalImage").src =
    blog.image_url || "https://via.placeholder.com/600x300";
  document.getElementById("modalContent").innerText =
    blog.full_content || "No content available";
  document.getElementById("modalAuthor").innerText = blog.author || "Unknown";

  document.getElementById("blogModal").style.display = "block";
}

document.getElementById("closeModal")?.addEventListener("click", () => {
  document.getElementById("blogModal").style.display = "none";
});

/* ---------------------------
   Free Quote Form Submission
---------------------------- */
document.getElementById("free-quote")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const website = document.getElementById("website").value;

  const { data, error } = await supabase
    .from("collaborator_info")
    .insert([{ email, website }]);

  const output = document.getElementById("output");
  output.textContent = error
    ? "❌ " + error.message
    : "✅ Submitted Successfully!";

  if (!error) e.target.reset();
});

/* ---------------------------
   Run on Page Load
---------------------------- */
loadClients();
loadBlogs();
