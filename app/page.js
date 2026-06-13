"use client";

import { useState } from "react";
import { 
  Bot, 
  Sparkles, 
  Send, 
  Copy, 
  CheckCircle2, 
  Type, 
  AlignLeft, 
  MessageSquare,
  AlertCircle
} from "lucide-react";

export default function Home() {
  const [type, setType] = useState("instagram");
  const [tone, setTone] = useState("casual");
  const [duration, setDuration] = useState("");
  const [videoType, setVideoType] = useState("");
  const [safeMode, setSafeMode] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imagesBase64, setImagesBase64] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) {
      setImagesBase64([]);
      return;
    }

    const newImages = [];
    for (const file of files) {
      if (file.size > 4 * 1024 * 1024) {
        alert(`Ukuran gambar ${file.name} terlalu besar. Maksimal 4MB per gambar.`);
        continue;
      }
      
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      newImages.push(base64);
    }
    
    setImagesBase64(newImages);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError("");
    setResult("");
    setIsCopied(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, tone, duration, videoType, safeMode, prompt, images: imagesBase64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghasilkan konten");
      }

      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <main className="container">
      <header className="header">
        <h1>Ale UGC AI</h1>
        <p>Buat konten berkualitas tinggi untuk media sosial dan blog dalam hitungan detik dengan kekuatan AI terdepan.</p>
      </header>

      <div className="main-content">
        {/* Left Column - Form */}
        <div className="glass-panel">
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label htmlFor="type"><AlignLeft size={18} /> Jenis Konten</label>
              <div className="select-wrapper">
                <select 
                  id="type" 
                  className="form-control"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="instagram">Caption Instagram</option>
                  <option value="tiktok">Script TikTok / Reels</option>
                  <option value="twitter">Thread Twitter / X</option>
                  <option value="blog">Artikel Blog (SEO Friendly)</option>
                  <option value="linkedin">Postingan LinkedIn</option>
                  <option value="affiliate_video">Script Video Affiliate (TikTok/Shopee)</option>
                  <option value="video_prompt">Prompt Video Produk (B-Roll Khusus)</option>
                  <option value="prompt_video_apapun">Prompt Video Apapun (Veo 3/Kling/dll)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tone"><MessageSquare size={18} /> Gaya Bahasa (Tone)</label>
              <div className="select-wrapper">
                <select 
                  id="tone" 
                  className="form-control"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="casual">Kasual & Santai</option>
                  <option value="professional">Profesional & Formal</option>
                  <option value="funny">Lucu & Menghibur</option>
                  <option value="educational">Informatif & Edukatif</option>
                  <option value="persuasive">Persuasif (Menjual)</option>
                  <option value="asmr">ASMR (Visual Detail & Minim Suara)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="videoType"><Bot size={18} /> Jenis Video (Khusus Video)</label>
              <div className="select-wrapper">
                <select 
                  id="videoType" 
                  className="form-control"
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value)}
                >
                  <option value="">-- Bukan Video / Tidak Spesifik --</option>
                  <option value="storyboard">Storyboard (Adegan, Visual & Narasi)</option>
                  <option value="pov">POV (Point of View) / Relatable</option>
                  <option value="grwm">GRWM (Get Ready With Me)</option>
                  <option value="day_in_my_life">Day in My Life / Mini Vlog</option>
                  <option value="asmr_unboxing">ASMR / Unboxing Estetik</option>
                  <option value="storytime">Storytime / Spill The Tea</option>
                  <option value="transformation">Before & After / Transformation</option>
                  <option value="b_roll">B-Roll Cinematic / Estetik</option>
                  <option value="talking_head">Talking Head / VLOG Style</option>
                  <option value="product_showcase">Product Showcase (Fokus Produk)</option>
                  <option value="tutorial">Tutorial / How-to Step by Step</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="safeMode"><Bot size={18} /> Keamanan Prompt (AI Safe Mode)</label>
              <div className="select-wrapper">
                <select 
                  id="safeMode" 
                  className="form-control"
                  value={safeMode}
                  onChange={(e) => setSafeMode(e.target.value)}
                >
                  <option value="">-- Standar (Tanpa Filter Khusus) --</option>
                  <option value="safe_universal">Universal AI Safe (Bypass Filter AI & Copyright)</option>
                  <option value="safe_ads">Safe for Ads (Hindari Kata Terlarang Sosmed/Iklan)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="duration"><Bot size={18} /> Durasi Waktu (Khusus Video)</label>
              <div className="select-wrapper">
                <select 
                  id="duration" 
                  className="form-control"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="">-- Tanpa Durasi Spesifik --</option>
                  <option value="2">2 Detik</option>
                  <option value="4">4 Detik</option>
                  <option value="6">6 Detik</option>
                  <option value="8">8 Detik</option>
                  <option value="10">10 Detik</option>
                  <option value="20">20 Detik</option>
                  <option value="30">30 Detik</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prompt"><Bot size={18} /> Deskripsi / Topik</label>
              <textarea 
                id="prompt" 
                className="form-control"
                placeholder="Contoh: Buatkan script untuk mempromosikan serum wajah yang bikin glowing dalam 7 hari..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageRef"><Bot size={18} /> Referensi Gambar (Opsional, Bisa Lebih dari 1)</label>
              <input 
                type="file" 
                id="imageRef" 
                className="form-control"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageChange}
                multiple
                style={{ padding: '10px' }}
              />
              {imagesBase64.length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {imagesBase64.map((img, idx) => (
                    <img key={idx} src={img} alt={`Preview ${idx+1}`} style={{ height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <><Sparkles size={18} className="spin" /> Sedang Membuat Konten...</>
              ) : (
                <><Send size={18} /> Generate Konten</>
              )}
            </button>
          </form>
        </div>

        {/* Right Column - Result */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="result-header">
            <div className="result-title">
              <Sparkles size={20} className="text-accent-primary" /> 
              Hasil Konten
            </div>
            {result && (
              <button 
                onClick={handleCopy}
                className="btn-icon"
                title="Copy to clipboard"
              >
                {isCopied ? <CheckCircle2 size={18} color="var(--success-color)" /> : <Copy size={18} />}
              </button>
            )}
          </div>
          
          <div className="result-content" style={{ flexGrow: 1 }}>
            {isLoading ? (
              <div className="empty-state">
                <Sparkles size={48} className="spin" style={{ color: 'var(--accent-primary)' }} />
                <p>AI sedang meracik kata-kata terbaik untuk Anda...</p>
              </div>
            ) : error ? (
              <div className="empty-state" style={{ color: 'var(--error-color)' }}>
                <AlertCircle size={48} />
                <p>{error}</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Pastikan API Key sudah disetel dengan benar di file .env</p>
              </div>
            ) : result ? (
              <div>{result}</div>
            ) : (
              <div className="empty-state">
                <Bot size={48} />
                <p>Hasil konten akan muncul di sini.<br/>Silakan isi form dan klik Generate.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
