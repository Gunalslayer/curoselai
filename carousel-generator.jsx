import { useState } from "react";

const themes = [
  { bg: 'linear-gradient(135deg,#1a1a2e,#16213e)', text: '#e0e0ff', accent: '#6c63ff' },
  { bg: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)', text: '#e0f7fa', accent: '#43e97b' },
  { bg: 'linear-gradient(135deg,#1a0533,#2d0b5e)', text: '#f3e5f5', accent: '#ff6584' },
  { bg: 'linear-gradient(135deg,#0d1b0d,#1a3a1a)', text: '#e8f5e9', accent: '#69f0ae' },
  { bg: 'linear-gradient(135deg,#1c0a00,#3d1a00)', text: '#fff3e0', accent: '#f7971e' },
];

const STYLES = ['📚 Educational','🔥 Motivational','📋 Tips & Tricks','📖 Storytelling','🔍 Case Study','❓ Myth-Busting'];
const INDUSTRIES = ['Marketing & Advertising','E-commerce & Retail','Health & Wellness','Finance & Investing','Real Estate','SaaS & Tech','Education & Coaching','Food & Beverage','Fashion & Beauty','Travel & Hospitality','Other'];
const PLATFORMS = ['Instagram','LinkedIn','TikTok','Facebook','Pinterest'];

export default function CarouselAI() {
  const [bizName, setBizName] = useState('');
  const [services, setServices] = useState('');
  const [industry, setIndustry] = useState('Marketing & Advertising');
  const [platform, setPlatform] = useState('Instagram');
  const [style, setStyle] = useState('📚 Educational');
  const [batchMode, setBatchMode] = useState(false);
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [activeSlides, setActiveSlides] = useState({});
  const [copied, setCopied] = useState({});
  const [servicesError, setServicesError] = useState(false);

  const loadingSteps = ['Analyzing your business...','Crafting carousel topics...','Writing slide content...','Generating captions...','Adding hashtags...'];

  async function generate() {
    if (!services.trim()) {
      setServicesError(true);
      setTimeout(() => setServicesError(false), 1500);
      return;
    }
    const n = batchMode ? count : 1;
    setLoading(true);
    setError('');
    setPosts([]);
    setLoadStep(0);

    const stepInterval = setInterval(() => {
      setLoadStep(s => {
        if (s < loadingSteps.length - 1) return s + 1;
        clearInterval(stepInterval);
        return s;
      });
    }, 700);

    const prompt = `You are a viral social media content expert specializing in carousel posts.

Business: ${bizName || 'My Business'}
Services: ${services}
Industry: ${industry}
Platform: ${platform}
Style: ${style.replace(/^[^\w]+/, '').trim()}
Number of carousels to generate: ${n}

Generate ${n} unique carousel post(s). Each carousel has exactly 5 slides.

Return ONLY a valid JSON array (no markdown, no backticks, no explanation):
[
  {
    "topic": "short topic title (3-5 words)",
    "slides": [
      {
        "emoji": "one relevant emoji",
        "title": "slide headline (max 8 words, punchy)",
        "body": "2-3 lines of content for this slide (engaging, value-packed)",
        "cta": "optional call to action (only for slide 1 and slide 5)"
      }
    ],
    "caption": "Instagram-style caption (2-3 sentences, engaging)",
    "hashtags": "12-15 hashtags as a single string"
  }
]

Slide structure:
- Slide 1: Hook (CTA: "Swipe to learn more →")
- Slide 2: Problem or context
- Slide 3: Key insight or tip 1
- Slide 4: Key insight or tip 2
- Slide 5: Summary + strong CTA

Make each carousel topic DIFFERENT. Make content highly specific to the business.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await res.json();
      const raw = data.content.map(i => i.text || '').join('');
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      clearInterval(stepInterval);
      setPosts(parsed);
      setActiveSlides(Object.fromEntries(parsed.map((_, i) => [i, 0])));
    } catch (e) {
      setError('Generation failed. Please try again.');
    }

    setLoading(false);
  }

  function switchSlide(pi, si) {
    setActiveSlides(prev => ({ ...prev, [pi]: si }));
  }

  function copyCaption(idx) {
    const p = posts[idx];
    navigator.clipboard.writeText(`${p.caption}\n\n${p.hashtags}`);
    setCopied(prev => ({ ...prev, [idx]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [idx]: false })), 2000);
  }

  const t = (i) => themes[i % themes.length];

  return (
    <div style={{ background: '#06060a', minHeight: '100vh', color: '#eeeef5', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* NAV */}
      <div style={{ borderBottom: '1px solid #252535', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#6c63ff,#ff6584)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>⧉</div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: -0.3 }}>Carousel<span style={{ color: '#6c63ff' }}>AI</span></span>
        </div>
        <span style={{ fontSize: '0.6rem', color: '#43e97b', border: '1px solid rgba(67,233,123,0.3)', padding: '3px 9px', borderRadius: 20, letterSpacing: '0.8px' }}>AI POWERED</span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: window.innerWidth < 700 ? '1fr' : '320px 1fr', gap: 24 }}>

        {/* FORM */}
        <div style={{ background: '#0e0e16', border: '1px solid #252535', borderRadius: 18, overflow: 'hidden', alignSelf: 'start' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #252535', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#6c63ff', boxShadow: '0 0 8px #6c63ff' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#5a5a72' }}>Configure</span>
          </div>
          <div style={{ padding: 18 }}>

            {/* Business Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#5a5a72', marginBottom: 6 }}>Business Name</label>
              <input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. Nova Marketing Co."
                style={{ width: '100%', background: '#16161f', border: '1px solid #2e2e42', borderRadius: 10, color: '#eeeef5', fontSize: '0.88rem', padding: '10px 13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>

            {/* Services */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#5a5a72', marginBottom: 6 }}>Services / Products *</label>
              <textarea value={services} onChange={e => setServices(e.target.value)} placeholder="e.g. Social media management, content creation, paid ads..."
                style={{ width: '100%', background: '#16161f', border: `1px solid ${servicesError ? '#ff6584' : '#2e2e42'}`, borderRadius: 10, color: '#eeeef5', fontSize: '0.88rem', padding: '10px 13px', outline: 'none', resize: 'none', height: 75, fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }} />
            </div>

            {/* Industry */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#5a5a72', marginBottom: 6 }}>Industry</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)}
                style={{ width: '100%', background: '#16161f', border: '1px solid #2e2e42', borderRadius: 10, color: '#eeeef5', fontSize: '0.88rem', padding: '10px 13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>

            {/* Platform */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#5a5a72', marginBottom: 6 }}>Target Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)}
                style={{ width: '100%', background: '#16161f', border: '1px solid #2e2e42', borderRadius: 10, color: '#eeeef5', fontSize: '0.88rem', padding: '10px 13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Style */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#5a5a72', marginBottom: 6 }}>Content Style</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {STYLES.map(s => (
                  <div key={s} onClick={() => setStyle(s)}
                    style={{ padding: '8px 10px', border: `1px solid ${style === s ? '#6c63ff' : '#2e2e42'}`, borderRadius: 9, fontSize: '0.74rem', fontWeight: 500, cursor: 'pointer', textAlign: 'center', color: style === s ? '#6c63ff' : '#5a5a72', background: style === s ? 'rgba(108,99,255,0.12)' : 'transparent', transition: 'all 0.15s' }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Batch Mode */}
            <div onClick={() => setBatchMode(b => !b)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#16161f', border: '1px solid #2e2e42', borderRadius: 10, padding: '11px 13px', marginBottom: 14, cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: '0.83rem', fontWeight: 500 }}>📅 Batch Mode</div>
                <div style={{ fontSize: '0.68rem', color: '#5a5a72', marginTop: 2 }}>Generate multiple carousels at once</div>
              </div>
              <div style={{ width: 40, height: 22, background: batchMode ? '#6c63ff' : '#2e2e42', borderRadius: 11, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: 'white', top: 3, left: batchMode ? 21 : 3, transition: 'left 0.2s' }} />
              </div>
            </div>

            {/* Count */}
            {batchMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: '0.83rem', flex: 1 }}>Number of carousels</span>
                {['-', count, '+'].map((x, i) => i === 1
                  ? <span key="n" style={{ fontWeight: 700, color: '#6c63ff', minWidth: 24, textAlign: 'center' }}>{x}</span>
                  : <button key={x} onClick={() => setCount(c => Math.min(7, Math.max(1, c + (i === 0 ? -1 : 1))))}
                      style={{ width: 30, height: 30, background: '#16161f', border: '1px solid #2e2e42', borderRadius: 7, color: '#eeeef5', fontSize: '1rem', cursor: 'pointer' }}>{x}</button>
                )}
              </div>
            )}

            {/* Generate Button */}
            <button onClick={generate} disabled={loading}
              style={{ width: '100%', padding: 13, background: loading ? 'rgba(108,99,255,0.4)' : 'linear-gradient(135deg,#6c63ff,#9b59b6)', border: 'none', borderRadius: 12, color: 'white', fontSize: '0.92rem', fontWeight: 700, letterSpacing: '1px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              {loading ? 'GENERATING...' : '⧉ GENERATE CAROUSELS'}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Loading */}
          {loading && (
            <div style={{ background: '#0e0e16', border: '1px solid #252535', borderRadius: 18, padding: '50px 30px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: ['#6c63ff','#ff6584','#43e97b'][i],
                    animation: 'bounce 1.2s infinite ease-in-out', animationDelay: `${i*0.2}s` }} />
                ))}
              </div>
              <div style={{ color: '#6c63ff', fontWeight: 700, fontSize: '0.95rem', marginBottom: 16 }}>Building carousels...</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                {loadingSteps.map((s, i) => (
                  <div key={i} style={{ fontSize: '0.76rem', padding: '4px 12px', borderRadius: 20,
                    color: i < loadStep ? '#43e97b' : i === loadStep ? '#eeeef5' : '#3a3a50',
                    background: i === loadStep ? '#16161f' : 'transparent' }}>
                    {i < loadStep ? `✓ ${s}` : s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: '#0e0e16', border: '1px solid #252535', borderRadius: 18, padding: '50px 30px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.4 }}>⚠</div>
              <div style={{ color: '#ff6584' }}>{error}</div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && posts.length === 0 && (
            <div style={{ background: '#0e0e16', border: '1px solid #252535', borderRadius: 18, padding: '60px 30px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 14, opacity: 0.3 }}>⧉</div>
              <div style={{ color: '#5a5a72', fontSize: '0.9rem', lineHeight: 1.6 }}>Enter your business details and generate ready-to-post carousels</div>
            </div>
          )}

          {/* Posts */}
          {posts.map((post, pi) => {
            const theme = t(pi);
            const activeSl = activeSlides[pi] || 0;
            const slide = post.slides[activeSl];
            return (
              <div key={pi} style={{ background: '#0e0e16', border: '1px solid #252535', borderRadius: 18, overflow: 'hidden' }}>
                {/* Post Header */}
                <div style={{ padding: '13px 18px', borderBottom: '1px solid #252535', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.68rem', color: '#5a5a72', fontFamily: 'monospace' }}>Post {pi + 1} of {posts.length}</span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 600, color: theme.accent, background: `${theme.accent}1a`, border: `1px solid ${theme.accent}44`, padding: '3px 10px', borderRadius: 20 }}>{post.topic}</span>
                </div>

                <div style={{ padding: 18, display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 260px', gap: 18 }}>
                  {/* Slides */}
                  <div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#5a5a72', marginBottom: 10 }}>5 Slides — Tap to preview</div>
                    {/* Thumbnails */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                      {post.slides.map((sl, si) => (
                        <div key={si} onClick={() => switchSlide(pi, si)}
                          style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${si === activeSl ? theme.accent : 'transparent'}`, boxShadow: si === activeSl ? `0 0 10px ${theme.accent}55` : 'none', flexShrink: 0 }}>
                          <div style={{ width: '100%', height: '100%', background: theme.bg, color: theme.text, padding: 6, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '0.5rem', color: theme.accent, fontFamily: 'monospace' }}>{si + 1}</div>
                            <div style={{ fontSize: '0.85rem', margin: '2px 0' }}>{sl.emoji}</div>
                            <div style={{ fontSize: '0.5rem', fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{sl.title}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Big Slide */}
                    <div style={{ background: theme.bg, color: theme.text, borderRadius: 14, padding: '20px 18px', minHeight: 180, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: '0.62rem', color: theme.accent, fontFamily: 'monospace', opacity: 0.8 }}>{activeSl + 1}/{post.slides.length}</div>
                      <div style={{ fontSize: '1.5rem' }}>{slide.emoji}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.3 }}>{slide.title}</div>
                      <div style={{ fontSize: '0.82rem', lineHeight: 1.6, opacity: 0.85, flex: 1 }}>{slide.body}</div>
                      {slide.cta && <div style={{ fontSize: '0.72rem', fontWeight: 600, padding: '5px 12px', border: `1px solid ${theme.accent}`, color: theme.accent, borderRadius: 20, alignSelf: 'flex-start', marginTop: 4 }}>{slide.cta}</div>}
                    </div>
                  </div>

                  {/* Caption */}
                  <div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#5a5a72', marginBottom: 10 }}>Caption + Hashtags</div>
                    <div style={{ background: '#16161f', border: '1px solid #2e2e42', borderRadius: 10, padding: 12, fontSize: '0.8rem', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 10 }}>{post.caption}</div>
                    <div style={{ background: '#16161f', border: '1px solid #2e2e42', borderRadius: 10, padding: 12, fontSize: '0.72rem', color: '#6c63ff', lineHeight: 1.8, marginBottom: 12, wordBreak: 'break-word' }}>{post.hashtags}</div>
                    <button onClick={() => copyCaption(pi)}
                      style={{ width: '100%', padding: 10, background: 'transparent', border: `1px solid ${copied[pi] ? '#43e97b' : '#2e2e42'}`, borderRadius: 9, color: copied[pi] ? '#43e97b' : '#5a5a72', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {copied[pi] ? '✓ COPIED!' : '⊕ COPY CAPTION'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%,100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
