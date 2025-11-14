/**
 * AI Mapper – simple static prototype wired for Supabase.
 *
 * You MUST update SUPABASE_URL and SUPABASE_ANON_KEY below
 * with your own project values. The anon key is safe to use
 * on the client – treat this like a typical Supabase SPA.
 */

// TODO: paste your real values here
const SUPABASE_URL = "https://YOUR-PROJECT-ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";

// Initialise Supabase client from CDN global
let supabaseClient = null;
if (window.supabase) {
  const { createClient } = window.supabase;
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error("Supabase CDN failed to load");
}

/**
 * Very simple heuristic "scoring" function – this is just a placeholder
 * so you can validate UX and data flow. Replace with a call to a Netlify
 * serverless function that uses OpenAI once you are ready.
 */
function demoScoreContent(text) {
  const clean = text.trim();
  if (!clean) {
    return {
      seo: 0,
      geo: 0,
      notes: ["Paste some content first to run an analysis."]
    };
  }

  const length = clean.length;
  const headings = (clean.match(/\n#+\s/g) || []).length;
  const questions = (clean.match(/\?/g) || []).length;

  let seo = Math.min(100, Math.round((length / 40) + headings * 4));
  let geo = Math.min(100, Math.round((length / 55) + questions * 6));

  seo = Math.max(20, seo);
  geo = Math.max(20, geo);

  const notes = [];

  if (headings < 2) {
    notes.push("Add clearer section headings so search and AI can parse structure.");
  } else {
    notes.push("Heading structure looks reasonable – review H1 / H2 labels.");
  }

  if (questions < 2) {
    notes.push("Try adding a short Q&A or FAQ style section for GEO.");
  } else {
    notes.push("Nice use of questions – good for featured snippets and AI prompts.");
  }

  if (length < 800) {
    notes.push("Content is on the shorter side – consider expanding key sections.");
  } else {
    notes.push("Length is solid for deeper SEO and GEO coverage.");
  }

  return { seo, geo, notes };
}

function updateResults({ seo, geo, notes }) {
  const seoScore = document.getElementById("seo-score");
  const geoScore = document.getElementById("geo-score");
  const seoLabel = document.getElementById("seo-label");
  const geoLabel = document.getElementById("geo-label");
  const notesList = document.getElementById("notes-list");

  seoScore.textContent = seo ? seo.toString() : "–";
  geoScore.textContent = geo ? geo.toString() : "–";

  const seoQuality =
    seo >= 80 ? "Strong" :
    seo >= 60 ? "Good" :
    seo >= 40 ? "Needs focus" :
    "Weak";

  const geoQuality =
    geo >= 80 ? "AI-ready" :
    geo >= 60 ? "Promising" :
    geo >= 40 ? "Under-leveraged" :
    "Needs work";

  seoLabel.textContent = seoQuality;
  geoLabel.textContent = geoQuality;

  notesList.innerHTML = "";
  (notes || []).forEach(n => {
    const li = document.createElement("li");
    li.textContent = n;
    notesList.appendChild(li);
  });
}

async function saveToSupabase(payload) {
  if (!supabaseClient) {
    alert("Supabase is not initialised – check keys and CDN.");
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("analyses")
      .insert([payload]);

    if (error) {
      console.error("Supabase insert error:", error);
      alert("Supabase insert failed. Check console and RLS policies.");
      return;
    }

    alert("Saved to Supabase (table: analyses).");
  } catch (err) {
    console.error("Supabase error:", err);
    alert("Unexpected Supabase error – see console.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const openAppBtn = document.getElementById("open-app-btn");
  const scrollHowBtn = document.getElementById("scroll-how-btn");
  const analyzeBtn = document.getElementById("analyze-btn");
  const saveBtn = document.getElementById("save-btn");
  const contentInput = document.getElementById("content-input");

  if (openAppBtn) {
    openAppBtn.addEventListener("click", () => {
      document.getElementById("app").scrollIntoView({ behavior: "smooth" });
    });
  }

  if (scrollHowBtn) {
    scrollHowBtn.addEventListener("click", () => {
      document.getElementById("how-it-works").scrollIntoView({ behavior: "smooth" });
    });
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", () => {
      const text = contentInput.value || "";
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = "Analyzing...";

      setTimeout(() => {
        const result = demoScoreContent(text);
        updateResults(result);
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Run demo analysis";

        // enable save if Supabase configured
        if (supabaseClient && text.trim().length > 0) {
          saveBtn.disabled = false;
        }
      }, 400);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const text = contentInput.value || "";
      if (!text.trim()) {
        alert("Add some content first.");
        return;
      }

      const { seo, geo } = demoScoreContent(text);
      const payload = {
        raw_content: text,
        seo_score: seo,
        geo_score: geo,
        created_at: new Date().toISOString()
      };

      await saveToSupabase(payload);
    });
  }
});
