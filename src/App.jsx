import React, { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════
// 🖼️ HERO BACKGROUND IMAGE
// Leave as "" for a clean gradient (used in preview).
// AT DEPLOY TIME: drop your photo (e.g. hero.jpg) into the project's
// /public folder, then set this to "/hero.jpg". Done — it goes live
// for everyone. No backend, no storage. It ships with the app.
// ══════════════════════════════════════════════════════════════
const HERO_IMAGE = "/hero.jpg"; // your photo, ships with the app

// ══════════════════════════════════════════════════════════════
// 🔧 AFFILIATE CONFIG — Roam by My Mama Monde
// Paste your Amazon tracking tag below. One place to update.
// ══════════════════════════════════════════════════════════════
const AFFILIATE = {
  amazon: {
    CA: { domain: "amazon.ca",     tag: "mymamamonde-20" },
    US: { domain: "amazon.com",    tag: "mymamamonde-20" },
    UK: { domain: "amazon.co.uk",  tag: "PASTE-UK-TAG-HERE" },
    AU: { domain: "amazon.com.au", tag: "PASTE-AU-TAG-HERE" },
    EU: { domain: "amazon.de",     tag: "PASTE-EU-TAG-HERE" },
  },
};

const HERO_PRODUCTS = [
  { keywords: ["carrier", "baby carrier", "cobblestone", "sling"], label: "Baby carrier", emoji: "👶", asins: { CA: "B07DKQQ6M8", US: "B07DKQQ6M8" } },
  { keywords: ["blackout", "portable blind", "travel blind"], label: "Blackout blind", emoji: "🌙", asins: { CA: "B07GV2KRTF", US: "B07GV2KRTF" } },
  { keywords: ["UV swimsuit", "sun suit", "rash guard"], label: "UV swimsuit", emoji: "🩱", asins: { CA: "B08H5KZXMG", US: "B08H5KZXMG" } },
];

const COUNTRY_PATTERNS = [
  { country: "CA", re: /\b(Canada|Toronto|Vancouver|Montreal|Calgary|Ottawa|Edmonton|Quebec|Winnipeg|Hamilton|Victoria|Halifax|Regina|Saskatoon|Kelowna|YYZ|YVR|YUL|YYC|ON|BC|QC|AB|MB|SK|NS|NB|NL|PE|YT|NT|NU)\b/i },
  { country: "US", re: /\b(USA|United States|New York|Los Angeles|Chicago|Houston|Boston|Seattle|Miami|Dallas|Denver|Atlanta|San Francisco|Las Vegas|Orlando|NYC|SF|LA|Washington|Philadelphia|Minneapolis|Nashville|Portland|San Diego|Austin|JFK|LAX|ORD|MIA|BOS|SEA|DEN|ATL|SFO|DFW|LAS|MCO|AL|AK|AZ|AR|CO|CT|FL|GA|HI|ID|IL|IN|IA|KS|KY|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/i },
  { country: "UK", re: /\b(UK|United Kingdom|England|Scotland|Wales|Northern Ireland|London|Manchester|Birmingham|Glasgow|Edinburgh|Liverpool|Bristol|Leeds|Sheffield|Cardiff|Belfast|LHR|LGW|MAN|EDI|GLA)\b/i },
  { country: "AU", re: /\b(Australia|Sydney|Melbourne|Brisbane|Perth|Adelaide|Canberra|Darwin|Hobart|Gold Coast|SYD|MEL|BNE|PER|ADL|CBR|NSW|VIC|QLD|WA|SA|ACT|NT|TAS)\b/i },
];

const CURRENCIES = {
  CA: { symbol: "CA$", code: "CAD", flag: "🍁" },
  US: { symbol: "$", code: "USD", flag: "🇺🇸" },
  UK: { symbol: "£", code: "GBP", flag: "🇬🇧" },
  AU: { symbol: "A$", code: "AUD", flag: "🇦🇺" },
  EU: { symbol: "€", code: "EUR", flag: "🌍" },
};

function detectCountry(origin) { if (!origin) return "CA"; for (const { country, re } of COUNTRY_PATTERNS) if (re.test(origin)) return country; return "EU"; }
function buildAmazonSearchLink(query, country) { const cfg = AFFILIATE.amazon[country] || AFFILIATE.amazon.US; return `https://www.${cfg.domain}/s?k=${encodeURIComponent(query)}&tag=${cfg.tag}`; }
function buildProductLink(itemText, country) { const lower = (itemText || "").toLowerCase(); const match = HERO_PRODUCTS.find((p) => p.keywords.some((k) => lower.includes(k.toLowerCase()))); if (match) { const cfg = AFFILIATE.amazon[country] || AFFILIATE.amazon.US; const asin = match.asins[country] || match.asins.US; if (asin && !asin.startsWith("PASTE")) return `https://www.${cfg.domain}/dp/${asin}?tag=${cfg.tag}`; } return buildAmazonSearchLink(itemText, country); }

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() { if (this.state.err) return <div style={{ fontFamily: "system-ui", padding: 24, color: "#5D6B63", background: "#F8F6F3", minHeight: "100vh" }}><h2 style={{ color: "#9BA89E" }}>Something went wrong</h2><pre style={{ whiteSpace: "pre-wrap", fontSize: 12, background: "#E8E3DE", padding: 14, borderRadius: 10 }}>{String(this.state.err.stack || this.state.err)}</pre></div>; return this.props.children; }
}

const C = {
  sage: "#0E9488", blue: "#2B7A99", cream: "#FFFBF7", mauve: "#E07A5F",
  taupe: "#E8DFD6", ink: "#143C3A", muted: "#5E8C86", line: "#DDD0C6",
  white: "#FFFFFF", coral: "#E85A47",
};
const FONT = "'Nunito', 'Segoe UI', system-ui, -apple-system, sans-serif";
const AGE_OPTIONS = [{ v: 0, l: "Under 1" }, ...Array.from({ length: 17 }, (_, i) => ({ v: i + 1, l: `${i + 1} yr${i ? "s" : ""}` }))];

function Counter({ label, value, set, min = 0, max = 99 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => set(Math.max(min, value - 1))} style={counterBtn(value <= min)}>−</button>
        <span style={{ minWidth: 24, textAlign: "center", fontSize: 18, fontWeight: 800, color: C.sage }}>{value}</span>
        <button onClick={() => set(Math.min(max, value + 1))} style={counterBtn(value >= max)}>+</button>
      </div>
    </div>
  );
}
function counterBtn(dis) { return { width: 36, height: 36, borderRadius: 12, border: "none", background: dis ? C.taupe : C.sage, color: dis ? C.muted : C.white, fontSize: 22, fontWeight: 800, cursor: dis ? "default" : "pointer", fontFamily: FONT }; }
function Chips({ options, value, set }) { return <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{options.map((o) => <button key={o} onClick={() => set(o)} style={{ padding: "9px 15px", borderRadius: 999, border: `1.5px solid ${value === o ? C.sage : C.line}`, background: value === o ? C.sage : C.white, color: value === o ? C.white : C.ink, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>{o}</button>)}</div>; }
function Field({ label, hint, children }) { return <div style={{ marginBottom: 22 }}><label style={{ display: "block", fontSize: 13, fontWeight: 800, color: C.ink, letterSpacing: 0.2, marginBottom: hint ? 4 : 8, textTransform: "uppercase" }}>{label}</label>{hint && <p style={{ margin: "0 0 10px", fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>{hint}</p>}{children}</div>; }

export default function App() { return <ErrorBoundary><TravelApp /></ErrorBoundary>; }

function TravelApp() {
  const [screen, setScreen] = useState("form");
  const [detail, setDetail] = useState(null);
  const [results, setResults] = useState([]);
  const [usedFallback, setUsedFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState("");

  const [origin, setOrigin] = useState("");
  const [country, setCountry] = useState("CA");
  const [explore, setExplore] = useState(false);
  const [destination, setDestination] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [ages, setAges] = useState([2]);
  const [days, setDays] = useState(7);
  const [budget, setBudget] = useState("Moderate");
  const [flight, setFlight] = useState("Flexible");
  const [transport, setTransport] = useState("Rental car");
  const [style, setStyle] = useState("Mix");
  const [maxStops, setMaxStops] = useState(3);
  const [namedStops, setNamedStops] = useState(["", "", ""]);
  const [tripMonths, setTripMonths] = useState("");

  useEffect(() => { try { if (typeof document !== "undefined" && !document.getElementById("nunito-font")) { const l = document.createElement("link"); l.id = "nunito-font"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap"; document.head.appendChild(l); } } catch (_) {} }, []);
  useEffect(() => { setCountry(detectCountry(origin)); }, [origin]);
  useEffect(() => { setAges((prev) => { const next = [...prev]; while (next.length < children) next.push(2); next.length = children; return next; }); }, [children]);
  useEffect(() => { setNamedStops((prev) => { const next = [...prev]; while (next.length < maxStops) next.push(""); next.length = maxStops; return next; }); }, [maxStops]);

  const currency = CURRENCIES[country] || CURRENCIES.EU;

  const ANGLES = [
    { badge: "Smooth & easy", note: "the most relaxed version — short transfers, gentle days, tried-and-tested family-friendly spots" },
    { badge: "A bit adventurous", note: "more ground covered with one or two standout experiences, still manageable with young children" },
    { badge: "Slow & immersive", note: "fewer moves, longer stays, deep neighbourhood feel — excellent rhythm for babies and toddlers" },
  ];

  function buildPrompt(angle) {
    const dest = explore || !destination.trim() ? "a destination you choose for this family (be specific)" : destination.trim();
    const ageStr = ages.length ? ages.map((a) => (a === 0 ? "<1yr" : `${a}yr`)).join(", ") : "n/a";
    const nStops = style === "Relaxing" ? 1 : maxStops;
    const named = style !== "Relaxing" ? namedStops.filter((s) => s.trim()) : [];
    const stopsLine = named.length
      ? `Must include these specific stops in a logical travel order: ${named.join(", ")}. Add ${Math.max(0, nStops - named.length)} more stops of your choice.`
      : style === "Relaxing" ? "One destination." : `Choose ${nStops} stops that flow well.`;
    const seasonLine = tripMonths ? `Travelling in: ${tripMonths}. Tailor recommendations for weather, activities, and crowds during this season.` : "Flexible on dates.";

    return `You are Roam — a family travel planner built by a mom who travels with kids. You plan from a parent's real perspective: ease comes first, great family moments second, a touch of adventure third. Be warm, specific, practical, and real.

Return ONLY one JSON object. No markdown, no code fences. Start with { and end with }.

Family: ${origin.trim() || "home"} → ${dest}. ${adults} adult(s), ${children} child(ren) aged ${ageStr}. ${days} days. ${budget} budget. Getting there: ${flight}. At destination: ${transport}. Style: ${style}. Stops: ${stopsLine}. ${seasonLine}

Make THIS itinerary: ${angle.note}

Return this JSON (fill every field):
{
  "id": 1,
  "badge": "${angle.badge}",
  "title": "string — evocative trip name",
  "tagline": "string — one sentence capturing the vibe",
  "estimatedCost": "${currency.symbol}X,XXX–X,XXX",
  "flightInfo": "string — specific airlines, airports, flight time or drive time",
  "stops": [
    {
      "name": "string — city or region",
      "days": 2,
      "accommodation": {
        "type": "hotel or apartment",
        "suggestion": "string — specific hotel name or description with what makes it family-friendly",
        "reasons": ["reason 1: specific amenity or proximity", "reason 2: what parents actually care about", "reason 3: the detail that makes it work"]
      },
      "highlights": ["specific family activity", "specific family activity", "specific family activity"],
      "parkingNotes": "string",
      "carRentalNote": "string — mention company + exact child seat type for the youngest"
    }
  ],
  "packingList": [
    { "emoji": "🎒", "item": "specific product", "reason": "why for THIS trip" }
  ],
  "whyThisTrip": "2 sentences from a parent's perspective",
  "napConsideration": "specific guidance given the ages",
  "familyTips": ["tip 1", "tip 2", "tip 3"]
}

Rules:
- WRITE TIGHT. Every string short and scannable — phrases, not paragraphs. Lead with the concrete detail (real names, numbers, specifics), cut all filler, fluff, and marketing adjectives. A parent should grasp each line in one glance. Dense with info, light on words.
- tagline: max ~12 words. whyThisTrip: max 2 short sentences. reasons/highlights/tips: each one short phrase (~6–10 words), not a sentence with sub-clauses.
- Costs in ${currency.code}
- 3 accommodation reasons per stop — parent-relevant, specific (e.g. "breakfast included", "pool + shallow end", "5-min walk to beach")
- 3 highlights per stop — name real places, no vague "explore the town"
- Max 5 packing items
- 3 family tips
- Under-2: plan 1–2 nap breaks daily
- 2–4: keep afternoons low-key
- Cobblestone cities: recommend carrier over stroller
- Beach + under-5: UV-protective swimsuit
- 1–2 night stops → hotel; 3+ nights → apartment
- Specific rental company + child seat type for youngest
- Output ONLY the JSON object`;
  }

  function extractObject(raw) { let t = String(raw).replace(/```json/gi, "").replace(/```/g, "").trim(); const s = t.indexOf("{"), e = t.lastIndexOf("}"); if (s !== -1 && e !== -1 && e > s) t = t.slice(s, e + 1); return JSON.parse(t); }

  async function callModel(prompt) {
    const tried = [];
    // 0) Your own backend (works on the deployed Vercel site — real AI)
    try {
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      if (r.ok) {
        const d = await r.json();
        if (d && d.text) return extractObject(d.text);
        throw new Error((d && d.error) || "empty backend response");
      }
      throw new Error("backend HTTP " + r.status);
    } catch (e) { tried.push("backend: " + (e && e.message || e)); }
    // 1) Claude.ai preview native bridge
    if (typeof window !== "undefined" && window.claude && typeof window.claude.complete === "function") {
      try { const out = await window.claude.complete(prompt); const text = typeof out === "string" ? out : (out && out.completion) || ""; if (!text) throw new Error("empty"); return extractObject(text); } catch (e) { tried.push("native: " + (e && e.message || e)); }
    } else { tried.push("native: unavailable"); }
    // 2) Claude.ai preview direct fetch
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }) });
      const raw = await res.text(); if (!res.ok) throw new Error(`HTTP ${res.status}`); const data = JSON.parse(raw); if (data.error) throw new Error(data.error.message); const text = Array.isArray(data.content) ? data.content.map((b) => b.type === "text" ? b.text : "").join("") : ""; if (!text) throw new Error("no text"); return extractObject(text);
    } catch (e) { tried.push("fetch: " + (e && e.message || e)); }
    throw new Error(tried.join(" | "));
  }

  function localPlan(angle, idx) {
    const youngest = ages.length ? Math.min(...ages) : 5;
    const named = style !== "Relaxing" ? namedStops.filter((s) => s.trim()) : [];
    const DESTS = { Relaxing: ["the Algarve, Portugal", "Lake Garda, Italy", "Mallorca, Spain"], Exploratory: ["the Netherlands", "Bavaria, Germany", "Andalusia, Spain"], Mix: ["Tuscany, Italy", "Provence, France", "Catalonia, Spain"] };
    const dest = explore || !destination.trim() ? (DESTS[style] || DESTS.Mix)[idx % 3] : destination.trim();
    const beach = /algarve|mallorca|coast|riviera|sea|beach|garda|lake|catalonia|andalusia|sicily|sardinia/i.test(dest);
    const cobble = /italy|tuscany|rome|florence|portugal|lisbon|spain|france|prague|provence|bavaria|venice|amsterdam/i.test(dest);
    const nStops = style === "Relaxing" ? 1 : style === "Mix" ? Math.min(2, maxStops) : Math.max(1, Math.min(maxStops, [2, maxStops, 1][idx] || 2));
    const base = Math.max(1, Math.floor(days / nStops));
    const nights = Array.from({ length: nStops }, (_, i) => base + (i === 0 ? days - base * nStops : 0));
    const seat = youngest < 1 ? "rear-facing infant seat" : youngest <= 3 ? "toddler car seat" : youngest <= 7 ? "high-back booster" : "booster seat";
    const sym = currency.symbol;
    const costRange = budget === "Luxury" ? `${sym}8,000–14,000` : budget === "Budget" ? `${sym}2,000–3,500` : `${sym}4,000–6,500`;

    const stops = nights.map((nt, i) => {
      const apt = nt >= 3;
      const sName = named[i] ? named[i] : nStops === 1 ? dest : i === 0 ? dest.replace(/,.*/, "") : beach ? "the coast" : "the countryside";
      return {
        name: sName, days: nt,
        accommodation: {
          type: apt ? "apartment" : "hotel",
          suggestion: apt ? `Airbnb or holiday rental near the centre — look for one with a cot, washing machine, proper kitchen` : `Family-friendly hotel with on-site dining or nearby options — ask for a cot when booking`,
          reasons: apt ? ["kitchen means easy snacks without eating out three times a day", "laundry keeps luggage light for a longer stay", "more space for the kids to wind down before bed"] : ["no packing/unpacking every night — great for short stays", "flexibility when everyone's exhausted", "usually has family-friendly staff and services"],
        },
        highlights: [
          youngest >= 5 ? "A hands-on museum or open-air historical site the older kids will love" : "A gentle morning stroll to the local market or café",
          beach ? "Easy beach morning before heat — pack shade shelter and snacks" : "Afternoon at the neighbourhood park or piazza",
          "A relaxed family dinner at a local restaurant — ask for early seating",
        ],
        parkingNotes: apt ? "Look for accommodation with dedicated parking — old town streets narrow quickly." : "Ask the hotel about on-site or partner parking.",
        carRentalNote: i === 0 && transport === "Rental car" ? `Book Europcar or Hertz — pre-reserve a ${seat} by email.` : "",
      };
    });

    const pack = [];
    if (youngest < 2 && cobble) pack.push({ emoji: "👶", item: "Soft-structured baby carrier", reason: "Cobblestone streets make strollers painful — a carrier is smoother and faster." });
    if (beach && youngest < 5) pack.push({ emoji: "🩱", item: "UV-protective swimsuit", reason: "Under-5 skin burns fast — UPF swimwear beats constant sunscreen reapplication." });
    if (youngest < 3) pack.push({ emoji: "🌙", item: "Portable blackout blind", reason: "Keeps any room dark for naps and early bedtimes — genuinely changes the trip." });
    pack.push({ emoji: "🧥", item: "Packable waterproofs for everyone", reason: "Weather turns quickly — don't let a shower cancel your day." });
    pack.push({ emoji: "🧴", item: "First-aid kit + children's paracetamol", reason: "The things you miss at 10pm when you need them." });

    const napNote = youngest < 2 ? "Protect one proper sleep window daily and stay near your base at midday." : youngest <= 4 ? "Toddlers still need a rest window after lunch — build it in." : "One slow afternoon mid-trip prevents the classic holiday meltdown.";

    return {
      id: idx + 1, badge: angle.badge,
      title: `${dest.replace(/,.*$/, "")} — ${angle.badge.toLowerCase()}`,
      tagline: `${days} days · ${adults} adult${adults > 1 ? "s" : ""}, ${children} kid${children > 1 ? "s" : ""} · ${budget.toLowerCase()} budget`,
      estimatedCost: costRange,
      flightInfo: flight === "Road trip" ? `Road trip — proper break every 90 mins.` : `Aim for nap-time or early morning departures.`,
      stops, packingList: pack.slice(0, 5),
      whyThisTrip: `Designed around your family's rhythm — ${angle.note}.`,
      napConsideration: napNote,
      familyTips: ["Pre-book child seats by email.", "Tackle big sights mornings. Protect the post-lunch window.", "Base near a park or piazza."],
    };
  }

  async function generate() {
    setUsedFallback(false);
    setFallbackReason("");
    setScreen("loading");
    const settled = await Promise.allSettled(ANGLES.map((a) => callModel(buildPrompt(a))));
    const out = ANGLES.map((a, i) => { const s = settled[i]; if (s.status === "fulfilled" && s.value && typeof s.value === "object") return { ...s.value, id: i + 1, badge: s.value.badge || a.badge, _ai: true }; return { ...localPlan(a, i), _ai: false }; });
    const anyFallback = out.some((o) => !o._ai);
    setUsedFallback(anyFallback);
    if (anyFallback) {
      const firstReject = settled.find((s) => s.status === "rejected");
      setFallbackReason(firstReject ? String((firstReject.reason && firstReject.reason.message) || firstReject.reason) : "unknown");
    }
    setResults(out);
    setScreen("results");
  }

  return (
    <div style={{ minHeight: "100vh", background: C.taupe, fontFamily: FONT, color: C.ink }}>
      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input::placeholder { color: #B8A8B8; }
        select { appearance: none; -webkit-appearance: none; }
        a { color: inherit; text-decoration: none; }
        @keyframes floaty { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-14px) rotate(4deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes pulse { 0%{opacity:.35} 50%{opacity:1} 100%{opacity:.35} }
        @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.cream, position: "relative", overflow: "hidden" }}>
        {screen === "form" && <FormScreen origin={origin} setOrigin={setOrigin} explore={explore} setExplore={setExplore} destination={destination} setDestination={setDestination} adults={adults} setAdults={setAdults} children={children} setChildren={setChildren} ages={ages} setAges={setAges} days={days} setDays={setDays} budget={budget} setBudget={setBudget} flight={flight} setFlight={setFlight} transport={transport} setTransport={setTransport} style={style} setStyle={setStyle} maxStops={maxStops} setMaxStops={setMaxStops} namedStops={namedStops} setNamedStops={setNamedStops} tripMonths={tripMonths} setTripMonths={setTripMonths} currency={currency} generate={generate} />}
        {screen === "loading" && <LoadingScreen />}
        {screen === "results" && <ResultsScreen results={results} usedFallback={usedFallback} fallbackReason={fallbackReason} onOpen={setDetail} onRestart={() => { setScreen("form"); setResults([]); }} />}
        {detail && <DetailSheet trip={detail} country={country} onClose={() => setDetail(null)} />}
      </div>
    </div>
  );
}

function FormScreen(p) {
  const [originError, setOriginError] = useState(false);
  function go() { if (!p.origin.trim()) { setOriginError(true); return; } setOriginError(false); p.generate(); }
  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <div style={{ 
        background: HERO_IMAGE
          ? `linear-gradient(180deg, rgba(26,77,92,0.45) 0%, rgba(26,56,56,0.65) 100%), url('${HERO_IMAGE}') center/cover no-repeat`
          : "linear-gradient(160deg, #0d5c6b 0%, #1ba89f 45%, #2ec8c0 100%)",
        padding: "56px 22px 48px",
        color: C.cream,
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Content */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <svg viewBox="0 0 320 120" style={{ width: 280, height: "auto", display: "block", filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.25))" }} preserveAspectRatio="xMidYMid meet">
              <defs>
                <style>{`
                  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
                  .roam-text { 
                    font-family: 'Playfair Display', serif; 
                    font-size: 85px; 
                    font-weight: 700; 
                    fill: ${C.white}; 
                    letter-spacing: -1px;
                    -webkit-font-smoothing: antialiased;
                    text-rendering: geometricPrecision;
                  }
                `}</style>
              </defs>
              
              <path 
                d="M 15 65 Q 80 35, 160 45 T 305 65" 
                stroke={C.white} 
                strokeWidth="1.2" 
                fill="none" 
                opacity="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              <circle cx="25" cy="63" r="3" fill={C.white} opacity="0.9" />
              <circle cx="95" cy="42" r="3" fill={C.white} opacity="0.9" />
              <circle cx="160" cy="47" r="3" fill={C.white} opacity="0.9" />
              <circle cx="230" cy="60" r="3" fill={C.white} opacity="0.9" />
              <circle cx="300" cy="67" r="3" fill={C.white} opacity="0.9" />
              
              <text x="160" y="95" textAnchor="middle" className="roam-text">ROAM</text>
            </svg>
          </div>
          
          <p style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 800, color: C.white, letterSpacing: 0.6, textTransform: "uppercase", textShadow: "0 2px 4px rgba(0,0,0,0.25)" }}>Family trips that actually work</p>
          <p style={{ margin: "0 0 12px", fontSize: 15, color: "rgba(255,255,255,.95)", lineHeight: 1.6, textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>Tell us your story, and we'll shape three ways to travel together.</p>
          <p style={{ margin: "0", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.88)", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>By My Mama Monde</p>
        </div>
      </div>

      <div style={{ padding: "28px 22px 140px" }}>
        <Field label="Travelling from" hint={p.origin.trim() ? `${p.currency.flag}  Showing ${p.currency.code} prices` : "City and country"}>
          <input value={p.origin} onChange={(e) => { p.setOrigin(e.target.value); setOriginError(false); }} placeholder="e.g. Toronto, Canada" style={{ ...iS, borderColor: originError ? C.mauve : C.line }} />
          {originError && <p style={{ color: C.mauve, fontSize: 12.5, fontWeight: 700, margin: "6px 0 0" }}>Add where you're travelling from.</p>}
        </Field>

        <Field label="Where to?">
          <input value={p.explore ? "" : p.destination} onChange={(e) => p.setDestination(e.target.value)} onFocus={() => p.explore && p.setExplore(false)} disabled={p.explore} placeholder={p.explore ? "We'll choose for you ✨" : "e.g. Italy, or the Algarve"} style={{ ...iS, marginBottom: 10, background: p.explore ? C.taupe : C.white, color: p.explore ? C.muted : C.ink }} />
          <button onClick={() => p.setExplore(!p.explore)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 14, border: `1.5px solid ${p.explore ? C.sage : C.line}`, background: p.explore ? "rgba(155, 168, 158, .08)" : C.white, cursor: "pointer", fontFamily: FONT }}>
            <span><span style={{ display: "block", fontSize: 15, fontWeight: 800, color: C.ink }}>🧭 Explore Mode</span><span style={{ display: "block", fontSize: 12.5, color: C.muted, marginTop: 2 }}>{p.explore ? "We'll pick the destination" : "Let us pick the destination"}</span></span>
            <span style={trk(p.explore)}><span style={knb(p.explore)} /></span>
          </button>
        </Field>

        <div style={crd}>
          <Counter label="Adults" value={p.adults} set={p.setAdults} min={1} max={8} />
          <div style={{ height: 1, background: C.line }} />
          <Counter label="Children" value={p.children} set={p.setChildren} min={0} max={8} />
        </div>

        {p.children > 0 && (
          <Field label="Children's ages">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {p.ages.map((a, i) => (
                <div key={i} style={{ flex: "1 1 calc(50% - 5px)", minWidth: 130 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4, display: "block" }}>Child {i + 1}</span>
                  <select value={a} onChange={(e) => { const n = [...p.ages]; n[i] = Number(e.target.value); p.setAges(n); }} style={sS}>
                    {AGE_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </Field>
        )}

        <div style={crd}><Counter label="Trip length (days)" value={p.days} set={p.setDays} min={2} max={30} /></div>
        <Field label="When are you travelling?" hint="Optional — helps us suggest weather-appropriate activities">
          <select value={p.tripMonths} onChange={(e) => p.setTripMonths(e.target.value)} style={sS}>
            <option value="">Flexible on dates</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
        </Field>
        <Field label="Budget"><Chips options={["Budget", "Moderate", "Luxury"]} value={p.budget} set={p.setBudget} /></Field>
        <Field label="Getting there"><Chips options={["Direct flights only", "Road trip", "Flexible"]} value={p.flight} set={p.setFlight} /></Field>
        <Field label="Getting around"><Chips options={["Rental car", "Personal vehicle", "Public & hired", "Hired transfers"]} value={p.transport} set={p.setTransport} /></Field>
        <Field label="Vacation style"><Chips options={["Exploratory", "Relaxing", "Mix"]} value={p.style} set={p.setStyle} /></Field>

        {(p.style === "Exploratory" || p.style === "Mix") && (
          <>
            <div style={{ ...crd, marginBottom: 14 }}><Counter label="Max stops" value={p.maxStops} set={p.setMaxStops} min={1} max={6} /></div>
            <Field label="Stops you want to hit" hint="Name some, all, or none — we'll fill in the rest.">
              {Array.from({ length: p.maxStops }, (_, i) => (
                <input key={i} value={p.namedStops[i] || ""} onChange={(e) => { const n = [...p.namedStops]; n[i] = e.target.value; p.setNamedStops(n); }} placeholder={`Stop ${i + 1} (optional)`} style={{ ...iS, marginBottom: 8 }} />
              ))}
            </Field>
          </>
        )}
      </div>

      <div style={{ position: "sticky", bottom: 0, padding: "14px 22px 20px", background: `linear-gradient(to top, ${C.cream} 75%, transparent)` }}>
        <button onClick={go} style={cta}>Plan our trips →</button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  const msgs = ["Reading your family's story…", "Finding routes that flow…", "Planning around nap times…", "Matching car seats to ages…", "Weighing hotel vs apartment…", "Curating packing lists…", "Adding finishing touches…"];
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % msgs.length), 1700); return () => clearInterval(t); }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, textAlign: "center" }}>
      <div style={{ fontSize: 64, animation: "floaty 2.2s ease-in-out infinite" }}>✈️</div>
      <h2 style={{ margin: "26px 0 6px", fontSize: 21, fontWeight: 900, color: C.sage }}>Building your itineraries</h2>
      <p style={{ margin: 0, fontSize: 15, color: C.sage, fontWeight: 800, minHeight: 24 }}>{msgs[i]}</p>
      <div style={{ display: "flex", gap: 6, marginTop: 24 }}>{[0, 1, 2].map((d) => <span key={d} style={{ width: 9, height: 9, borderRadius: 9, background: C.sage, animation: `pulse 1.2s ${d * 0.2}s infinite` }} />)}</div>
    </div>
  );
}

function ResultsScreen({ results, usedFallback, fallbackReason, onOpen, onRestart }) {
  return (
    <div style={{ animation: "fadeUp .4s ease", padding: "26px 22px 40px" }}>
      <button onClick={onRestart} style={bkl}>← Start over</button>
      <h1 style={{ margin: "10px 0 4px", fontSize: 25, fontWeight: 900, color: C.ink, letterSpacing: -0.4 }}>Three trips, your way</h1>
      <p style={{ margin: "0 0 18px", fontSize: 14.5, color: C.muted, lineHeight: 1.5 }}>Tap any trip to see the full plan, packing list, and family tips.</p>
      {usedFallback && (
        <div style={{ background: "rgba(155, 168, 158, .08)", color: C.sage, padding: "11px 14px", borderRadius: 12, fontSize: 12.5, fontWeight: 700, lineHeight: 1.5, marginBottom: 18 }}>
          Built with our offline planner — open claude.ai in a desktop browser for AI-powered itineraries.
          {fallbackReason && (
            <span style={{ display: "block", marginTop: 8, fontSize: 11, fontWeight: 600, fontFamily: "ui-monospace, Menlo, monospace", opacity: 0.85, wordBreak: "break-word" }}>
              diagnostic: {fallbackReason}
            </span>
          )}
        </div>
      )}
      {results.map((t, idx) => (
        <button key={t.id ?? idx} onClick={() => onOpen(t)} style={tCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <span style={{ ...bdg, background: [C.sage, C.blue, C.mauve][idx % 3], color: C.white }}>{t.badge}</span>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: C.sage, whiteSpace: "nowrap" }}>{t.estimatedCost}</span>
          </div>
          <h3 style={{ margin: "12px 0 4px", fontSize: 19, fontWeight: 900, color: C.ink, textAlign: "left", lineHeight: 1.2 }}>{t.title}</h3>
          <p style={{ margin: 0, fontSize: 14, color: C.ink, textAlign: "left", lineHeight: 1.5 }}>{t.tagline}</p>
          {Array.isArray(t.stops) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
              {t.stops.map((s, i) => <span key={i} style={sPill}>📍 {s.name}</span>)}
            </div>
          )}
          <span style={{ display: "block", marginTop: 14, fontSize: 13.5, fontWeight: 800, color: C.sage, textAlign: "right" }}>See the full plan →</span>
        </button>
      ))}
    </div>
  );
}

function DetailSheet({ trip, country, onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0; }, []);
  
  function copyToClipboard() {
    const text = `${trip.title}\n\n${trip.tagline}\n\nEstimated cost: ${trip.estimatedCost}\n\n${trip.flightInfo}\n\nStops:\n${trip.stops.map((s) => `${s.name} (${s.days} nights)\n${s.accommodation.suggestion}`).join("\n\n")}\n\nFamily tips:\n${trip.familyTips.map((t) => `• ${t}`).join("\n")}\n\nPacking list:\n${trip.packingList.map((p) => `${p.emoji} ${p.item}`).join("\n")}\n\nPlanned with Roam by My Mama Monde`;
    navigator.clipboard.writeText(text);
    alert("Itinerary copied! Paste it anywhere.");
  }

  return (
    <div style={{ position: "fixed", inset: 0, maxWidth: 480, margin: "0 auto", background: C.cream, zIndex: 50, animation: "slideUp .32s cubic-bezier(.2,.8,.2,1)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.sage, color: C.white, padding: "18px 22px 22px", borderBottomLeftRadius: 22, borderBottomRightRadius: 22, flexShrink: 0 }}>
        <button onClick={onClose} style={{ ...bkl, color: "rgba(255,255,255,.8)", marginBottom: 8 }}>← All trips</button>
        <span style={{ ...bdg, background: "rgba(255,255,255,.2)" }}>{trip.badge}</span>
        <h2 style={{ margin: "12px 0 4px", fontSize: 23, fontWeight: 900, lineHeight: 1.18 }}>{trip.title}</h2>
        <p style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(255,255,255,.85)", lineHeight: 1.5 }}>{trip.tagline}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ display: "inline-block", background: "rgba(255,255,255,.15)", color: C.white, padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 800 }}>💰 {trip.estimatedCost}</span>
          <button onClick={copyToClipboard} style={{ display: "inline-block", background: "rgba(255,255,255,.15)", color: C.white, border: "none", padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: FONT }}>📋 Copy</button>
        </div>
      </div>

      <div ref={ref} style={{ overflowY: "auto", flex: 1, padding: "22px 22px 60px", WebkitOverflowScrolling: "touch" }}>
        {trip.flightInfo && <Sec icon="✈️" title="Getting there"><p style={bT}>{trip.flightInfo}</p></Sec>}
        {trip.whyThisTrip && (
          <div style={{ background: "rgba(168, 200, 232, .08)", borderRadius: 16, padding: "16px 18px", marginBottom: 22 }}>
            <strong style={{ fontSize: 12, color: C.blue, textTransform: "uppercase", letterSpacing: 0.5 }}>Why this trip</strong>
            <p style={{ ...bT, margin: "6px 0 0" }}>{trip.whyThisTrip}</p>
          </div>
        )}

        {Array.isArray(trip.stops) && trip.stops.length > 0 && (
          <Sec icon="🗺️" title="Your route">
            {trip.stops.map((s, i) => {
              const acc = s.accommodation;
              const isObj = acc && typeof acc === "object" && !Array.isArray(acc);
              return (
                <div key={i} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: C.ink }}>{i + 1}. {s.name}</h4>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: C.muted }}>{s.days} {s.days === 1 ? "night" : "nights"}</span>
                  </div>

                  {isObj ? (
                    <div style={{ background: "rgba(212, 197, 212, .08)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>{acc.type === "apartment" ? "🏠" : "🏨"}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: C.ink, textTransform: "capitalize" }}>{acc.type}</span>
                      </div>
                      {acc.suggestion && <p style={{ ...bT, fontSize: 13.5, fontWeight: 700, margin: "0 0 10px" }}>{acc.suggestion}</p>}
                      {Array.isArray(acc.reasons) && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {acc.reasons.map((r, j) => (
                            <div key={j} style={{ display: "flex", gap: 7, fontSize: 12.5, color: C.ink, lineHeight: 1.45 }}>
                              <span style={{ color: C.sage, fontWeight: 900, flexShrink: 0 }}>✓</span>{r}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {Array.isArray(s.highlights) && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 6 }}>
                      {s.highlights.map((h, j) => (
                        <div key={j} style={{ display: "flex", gap: 8, fontSize: 13.5, color: C.ink, lineHeight: 1.45 }}>
                          <span style={{ color: C.mauve, flexShrink: 0 }}>•</span>{h}
                        </div>
                      ))}
                    </div>
                  )}
                  {s.parkingNotes && <p style={nL}>🅿️ {s.parkingNotes}</p>}
                  {s.carRentalNote && <p style={nL}>🚗 {s.carRentalNote}</p>}
                </div>
              );
            })}
          </Sec>
        )}

        {trip.napConsideration && (
          <div style={{ background: "rgba(155, 168, 158, .08)", borderRadius: 16, padding: "16px 18px", marginBottom: 22 }}>
            <strong style={{ fontSize: 12, color: C.sage, textTransform: "uppercase", letterSpacing: 0.5 }}>😴 Nap & rhythm</strong>
            <p style={{ ...bT, margin: "6px 0 0" }}>{trip.napConsideration}</p>
          </div>
        )}

        {Array.isArray(trip.packingList) && trip.packingList.length > 0 && (
          <Sec icon="🎒" title="Packing list">
            <p style={{ fontSize: 12, color: C.muted, margin: "-4px 0 10px", fontWeight: 600 }}>Tap to shop →</p>
            {trip.packingList.map((it, i) => {
              const href = buildProductLink(it.item || "", country);
              return (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 12, alignItems: "flex-start", background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", marginBottom: 10, cursor: "pointer" }}>
                  <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{it.emoji || "🛍️"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: C.ink }}>{it.item}</div>
                    {it.reason && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3, lineHeight: 1.45 }}>{it.reason}</div>}
                  </div>
                  <span style={{ fontSize: 18, color: C.sage, flexShrink: 0, alignSelf: "center" }}>→</span>
                </a>
              );
            })}
          </Sec>
        )}

        {Array.isArray(trip.familyTips) && trip.familyTips.length > 0 && (
          <Sec icon="💡" title="Family tips">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {trip.familyTips.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 14, color: C.ink, lineHeight: 1.5 }}>
                  <span style={{ color: C.sage, fontWeight: 900, flexShrink: 0 }}>✓</span>{t}
                </div>
              ))}
            </div>
          </Sec>
        )}

        <button onClick={onClose} style={{ ...cta, background: C.sage, marginTop: 8 }}>← Back to all trips</button>
      </div>
    </div>
  );
}

function Sec({ icon, title, children }) { return <div style={{ marginBottom: 24 }}><h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 12px", fontSize: 16, fontWeight: 900, color: C.ink }}><span>{icon}</span>{title}</h3>{children}</div>; }

const iS = { width: "100%", padding: "13px 16px", borderRadius: 14, border: `1.5px solid ${C.line}`, background: C.white, fontSize: 15.5, fontWeight: 600, color: C.ink, fontFamily: FONT, outline: "none", display: "block" };
const sS = { ...iS, padding: "11px 12px", fontSize: 14.5, cursor: "pointer" };
const crd = { background: C.white, borderRadius: 16, padding: "4px 18px", border: `1px solid ${C.line}`, marginBottom: 22 };
const cta = { width: "100%", padding: "16px", borderRadius: 16, border: "none", background: C.sage, color: C.white, fontSize: 17, fontWeight: 900, cursor: "pointer", fontFamily: FONT, boxShadow: "0 8px 16px rgba(155, 168, 158, .24)" };
const bkl = { background: "none", border: "none", color: C.sage, fontSize: 14, fontWeight: 800, cursor: "pointer", padding: 0, fontFamily: FONT };
const tCard = { display: "block", width: "100%", textAlign: "left", background: C.white, border: `1px solid ${C.line}`, borderRadius: 20, padding: 18, marginBottom: 16, cursor: "pointer", fontFamily: FONT, boxShadow: "0 2px 8px rgba(61, 74, 66, .06)" };
const bdg = { display: "inline-block", padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: 0.3 };
const sPill = { background: "rgba(155, 168, 158, .12)", color: C.ink, padding: "5px 10px", borderRadius: 999, fontSize: 12.5, fontWeight: 700 };
const bT = { fontSize: 14, color: C.ink, lineHeight: 1.55, margin: 0 };
const nL = { fontSize: 12.5, color: C.muted, margin: "8px 0 0", lineHeight: 1.45, fontWeight: 700 };
const trk = (on) => ({ width: 46, height: 28, borderRadius: 999, background: on ? C.sage : C.taupe, position: "relative", flexShrink: 0, transition: "background .2s" });
const knb = (on) => ({ position: "absolute", top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: 999, background: C.white, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.15)" });
