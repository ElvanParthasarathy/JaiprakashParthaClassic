// --- 0. Force Scroll to Top on Refresh ---
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// --- 1. Handle Scroll (OPTIMIZED) ---
// Cache elements once to improve mobile performance
const navbar = document.querySelector(".navbar");
const progressBar = document.querySelector(".scroll-progress");

function handleScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (scrollTop > 10) {
    if (navbar) navbar.classList.add("scrolled");
  } else {
    if (navbar) navbar.classList.remove("scrolled");
  }

  if (progressBar) {
    progressBar.style.width = `${scrollPercent}%`;
  }
}

window.addEventListener("scroll", handleScroll);

// --- 2. Content Loading ---
function loadPage(page) {
  const content = document.getElementById("content");
  
  // 1. UPDATE NAV IMMEDIATELY (Instant Feedback)
  updateActiveNav(page);

  // A. Trigger Exit Animation
  content.style.opacity = "0";
  content.style.transform = "scale(0.99)"; 
  
  // Wait for the fade-out
  setTimeout(() => {
    fetch(`pages/${page}.html`)
      .then(res => {
        if (!res.ok) throw new Error("Page not found");
        return res.text();
      })
      .then(data => {
        // B. Swap Content
        content.innerHTML = data;
        
        // Scroll top instantly
        window.scrollTo(0, 0);
        
        // Prepare for Entry (Reset transform)
        content.style.transition = "none";
        content.style.transform = "scale(0.99)"; 
        
        // Force Reflow
        void content.offsetWidth;
        
        // C. Trigger Entry Animation
        content.style.transition = "opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
        content.style.opacity = "1";
        content.style.transform = "scale(1)";
      })
      .catch(() => {
        if(page !== "home") loadPage("home");
      });
  }, 300); 
}

// --- 3. Active Nav Logic ---
function updateActiveNav(page) {
  const links = document.querySelectorAll(".nav-item");
  links.forEach(link => {
    link.classList.remove("active");
    const attr = link.getAttribute("data-page");
    if (attr === page) {
      link.classList.add("active");
    }
  });
}

function handleRouting() {
  const page = window.location.hash.replace("#", "") || "home";
  loadPage(page);
}

// --- 4. CLICK HANDLER (History Fix) ---
document.querySelectorAll("a[data-page]").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const page = link.getAttribute("data-page");
    
    // Ignore if already on the page
    if (window.location.hash.replace("#", "") === page) return;
    
    // Replace state to prevent "Back Button Trap"
    history.replaceState(null, null, `#${page}`);
    
    handleRouting();
  });
});

window.addEventListener("hashchange", handleRouting);

window.addEventListener("DOMContentLoaded", () => {
  handleRouting();
  window.scrollTo(0, 0); 
  handleScroll();        
});
