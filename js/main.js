document.addEventListener("DOMContentLoaded", async () => {
  setupMobileMenu();
  setupSearch();
  setupNewsletter();

  const apiNews = await loadNewsFromAPI();

  if (apiNews.length > 0) {
    newsData = apiNews;
  }


  renderFeaturedNews();
  renderLatestNews();
  renderNewsGrid();
  renderCategoryPage();
  renderSearchPage();
  renderArticlePage();
});

function setupMobileMenu() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function setupSearch() {
  const open = document.getElementById("searchOpen");
  const close = document.getElementById("searchClose");
  const overlay = document.getElementById("searchOverlay");
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");

  if (!overlay) return;

  open?.addEventListener("click", () => {
    overlay.classList.add("show");
    setTimeout(() => input?.focus(), 100);
  });

  close?.addEventListener("click", () => overlay.classList.remove("show"));

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("show");
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.classList.remove("show");
  });
}

function setupNewsletter() {
  const form = document.getElementById("newsletterForm");
  const message = document.getElementById("newsletterMessage");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    message.textContent = "நன்றி! செய்திமடல் பதிவுசெய்யப்பட்டது.";
    form.reset();
  });
}

function renderLatestNews() {
  const list = document.getElementById("latestList");
  if (!list) return;

  list.innerHTML = newsData.slice(0, 5).map(news => `
    <div class="latest-item">
      <a href="article.html?id=${news.id}">
        <span>${news.category} · ${news.time}</span>
        <h3>${news.title}</h3>
      </a>
    </div>
  `).join("");
}

function renderFeaturedNews() {
  const image = document.getElementById("featuredImage");
  const category = document.getElementById("featuredCategory");
  const title = document.getElementById("featuredTitle");
  const description = document.getElementById("featuredDescription");
  const meta = document.getElementById("featuredMeta");

  if (!image || !title) return;

  const article = newsData[0];

  if (!article) return;

  category.textContent = article.category || "செய்திகள்";

  title.textContent = article.title || "";

  title.href = `article.html?id=${article.id}`;

  description.textContent = article.description || "";

  meta.textContent = article.time || "TSP News";

  if (article.image) {
    image.innerHTML = `
      <img src="${article.image}" alt="${article.title}">
    `;

    image.classList.remove("image-placeholder");
  } else {
    image.innerHTML = `
      <span>செய்தி படம்</span>
    `;
  }
}

function renderNewsGrid(items = newsData) {
  const grid = document.getElementById("newsGrid");
  if (!grid) return;

  grid.innerHTML = items.map(createNewsCard).join("");
}

function createNewsCard(news) {
  return `
    <article class="news-card">
      <a href="article.html?id=${news.id}">
        <div class="card-image">
         ${
            news.image
              ? `<img src="${news.image}" alt="${news.title}">`
              : "செய்தி படம்"
          }
</div>
        <div class="card-content">
          <span class="category-tag">${news.category}</span>
          <h3>${news.title}</h3>
          <p>${news.description}</p>
          <div class="card-meta">${news.time}</div>
        </div>
      </a>
    </article>
  `;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function renderCategoryPage() {
  const grid = document.getElementById("categoryGrid");
  if (!grid) return;

  const category = getQueryParam("category") || "மயிலாடுதுறை";

  const title = document.getElementById("categoryTitle");
  const name = document.getElementById("categoryName");

  if (title) title.textContent = category + " செய்திகள்";
  if (name) name.textContent = category;

  try {
    const response = await fetch("http://127.0.0.1:8000/api/news/");

    if (!response.ok) {
      throw new Error("API error");
    }

    const data = await response.json();

    const results = data.filter(news => {
      const categoryName = news.category_name || "";

      return (
        categoryName.includes(category) ||
        category.includes(categoryName)
      );
    });

    if (results.length === 0) {
      grid.innerHTML = "<p>இந்தப் பிரிவில் செய்திகள் இல்லை.</p>";
      return;
    }

    grid.innerHTML = results.map(news => `
      <article class="news-card">
        <a href="article.html?id=${news.id}">

          <div class="card-image">
            ${
              news.image
                ? `<img src="${news.image}" alt="${news.title}">`
                : `<span>செய்தி படம்</span>`
            }
          </div>

          <div class="card-content">

            <span class="category-tag">
              ${news.category_name || ""}
            </span>

            <h3>
              ${news.title || ""}
            </h3>

            <p>
              ${news.short_description || ""}
            </p>

            <div class="card-meta">
              ${
                news.created_at
                  ? new Date(news.created_at).toLocaleString("ta-IN")
                  : ""
              }
            </div>

          </div>

        </a>
      </article>
    `).join("");

  } catch (error) {

    console.error("Category error:", error);

    grid.innerHTML = `
      <p>செய்திகளைப் பெற முடியவில்லை.</p>
    `;
  }
}

async function renderSearchPage() {
  const grid = document.getElementById("searchGrid");
  if (!grid) return;

  const q = (getQueryParam("q") || "").trim();

  const input = document.getElementById("pageSearchInput");
  const title = document.getElementById("searchTitle");
  const form = document.getElementById("pageSearchForm");

  if (input) {
    input.value = q;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/api/news/");

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    console.log("Search API News:", data);

    if (!q) {
      title.textContent = "சமீபத்திய செய்திகள்";
      grid.innerHTML = data.map(news => createAPINewsCard(news)).join("");
      return;
    }

    title.textContent = `"${q}" என்பதற்கான தேடல் முடிவுகள்`;

    const results = data.filter(news => {
      const text = `
        ${news.title || ""}
        ${news.short_description || ""}
        ${news.content || ""}
        ${news.category_name || ""}
        ${news.location_name || ""}
      `.toLowerCase();

      return text.includes(q.toLowerCase());
    });

    if (results.length) {
      grid.innerHTML = results
        .map(news => createAPINewsCard(news))
        .join("");
    } else {
      grid.innerHTML = `
        <p>
          <strong>${q}</strong> என்பதற்கான செய்திகள் எதுவும் கிடைக்கவில்லை.
        </p>
      `;
    }

  } catch (error) {

    console.error("Search API error:", error);

    grid.innerHTML = `
      <p>செய்திகளைப் பெற முடியவில்லை.</p>
    `;
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const value = input.value.trim();

    if (value) {
      window.location.href =
        `search.html?q=${encodeURIComponent(value)}`;
    }
  });
}

function createAPINewsCard(news) {
  return `
    <article class="news-card">

      <a href="article.html?id=${news.id}">

        <div class="card-image">
          ${
            news.image
              ? `<img src="${news.image}" alt="${news.title}">`
              : `<span>செய்தி படம்</span>`
          }
        </div>

        <div class="card-content">

          <span class="category-tag">
            ${news.category_name || ""}
          </span>

          <h3>
            ${news.title || ""}
          </h3>

          <p>
            ${news.short_description || ""}
          </p>

          <div class="card-meta">
            ${
              news.created_at
                ? new Date(news.created_at).toLocaleString("ta-IN")
                : ""
            }
          </div>

        </div>

      </a>

    </article>
  `;
}