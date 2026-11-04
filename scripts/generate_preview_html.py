import json
import os

data_path = os.path.join(os.path.dirname(__file__), "..", "sanpham", "products_cloudinary.json")
out_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "preview.html")

with open(data_path, "r", encoding="utf-8") as f:
    products = json.load(f)

with_img = [p for p in products if p.get("image_url")]

def get_vnd_price(p):
    usd = p.get("price_usd_from")
    if usd and usd > 0:
        vnd = round(usd * 25500, -4)  # round to nearest 10,000
        return f"{int(vnd):,}".replace(",", ".") + " ₫"
    name = p["name"].lower()
    cat = p.get("category", "phone")
    if "fold" in name or "ultra" in name or "pro max" in name:
        return "29.990.000 ₫ (Dự kiến)"
    if "pro" in name or "max" in name or "plus" in name:
        return "23.990.000 ₫ (Dự kiến)"
    if cat == "laptop":
        return "24.990.000 ₫ (Dự kiến)"
    return "16.990.000 ₫ (Dự kiến)"

cards_html = []
brands = sorted(list(set(p.get("brand", "Khác") for p in with_img)))

for p in with_img:
    brand = p.get("brand", "Khác")
    name = p.get("name", "Sản phẩm")
    cat = "Điện thoại" if p.get("category") == "phone" else "Laptop"
    img = p.get("image_url", "")
    price = get_vnd_price(p)
    usd_ref = f"${p['price_usd_from']:,}" if p.get("price_usd_from") else "N/A"
    
    specs = p.get("specs", {})
    specs_pills = []
    if specs.get("chip"):
        specs_pills.append(f'<span class="pill pill-chip">⚡ {specs["chip"]}</span>')
    if specs.get("ram"):
        specs_pills.append(f'<span class="pill">🧠 {specs["ram"]}</span>')
    if specs.get("storage"):
        specs_pills.append(f'<span class="pill">💾 {specs["storage"]}</span>')
    if specs.get("screen"):
        specs_pills.append(f'<span class="pill">📱 {specs["screen"]}</span>')
    if specs.get("battery"):
        specs_pills.append(f'<span class="pill">🔋 {specs["battery"]}</span>')
        
    pills_rendered = "".join(specs_pills) if specs_pills else '<span class="pill pill-empty">Cấu hình tiêu chuẩn</span>'
    credit = p.get("image_credit", {})
    credit_author = credit.get("author", "Wikimedia") or "Wikimedia"
    credit_lic = credit.get("license", "Free License") or "Free License"

    card = f"""
    <div class="product-card" data-brand="{brand.lower()}" data-category="{p.get('category','phone')}" data-name="{name.lower()}">
      <div class="img-wrapper">
        <img src="{img}" alt="{name}" loading="lazy" onerror="this.src='https://placehold.co/400x300?text=No+Image'"/>
        <span class="badge badge-brand">{brand}</span>
        <span class="badge badge-cat">{cat}</span>
      </div>
      <div class="card-body">
        <h3 class="product-title" title="{name}">{name}</h3>
        <div class="pills-container">
          {pills_rendered}
        </div>
        <div class="card-footer">
          <div>
            <div class="price-vnd">{price}</div>
            <div class="price-usd">Tham chiếu: {usd_ref}</div>
          </div>
          <a href="{img}" target="_blank" class="view-btn" title="Xem ảnh gốc Cloudinary">Ảnh gốc ↗</a>
        </div>
        <div class="credit-note">Nguồn: {credit_author[:25]} • {credit_lic}</div>
      </div>
    </div>
    """
    cards_html.append(card)

brand_buttons = ['<button class="filter-btn active" data-filter="all">Tất cả (97)</button>']
for b in brands:
    count = len([p for p in with_img if p.get("brand") == b])
    brand_buttons.append(f'<button class="filter-btn" data-filter="{b.lower()}">{b} ({count})</button>')

html_content = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xem trước 97 Sản phẩm Cloudinary - Store System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg: #090a0f;
      --card-bg: rgba(22, 24, 35, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --accent: #3b82f6;
      --accent-glow: rgba(59, 130, 246, 0.25);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --radius: 18px;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: radial-gradient(circle at 50% 0%, #151928 0%, var(--bg) 60%);
      color: var(--text);
      min-height: 100vh;
      padding: 32px 24px 80px;
    }}
    .header {{
      max-width: 1300px;
      margin: 0 auto 32px;
      text-align: center;
    }}
    .tag {{
      display: inline-block;
      padding: 6px 14px;
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 12px;
    }}
    h1 {{
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}
    .subtitle {{
      color: var(--text-muted);
      font-size: 15px;
      max-width: 650px;
      margin: 0 auto 28px;
    }}
    .controls {{
      max-width: 1300px;
      margin: 0 auto 32px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }}
    .search-bar {{
      width: 100%;
      max-width: 500px;
      margin: 0 auto;
      padding: 14px 20px;
      border-radius: 999px;
      border: 1px solid var(--card-border);
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
      font-size: 15px;
      backdrop-filter: blur(10px);
      outline: none;
      transition: all 0.2s;
    }}
    .search-bar:focus {{
      border-color: var(--accent);
      box-shadow: 0 0 20px var(--accent-glow);
    }}
    .filters {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }}
    .filter-btn {{
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-muted);
      border: 1px solid var(--card-border);
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }}
    .filter-btn:hover {{
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }}
    .filter-btn.active {{
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
      box-shadow: 0 0 14px var(--accent-glow);
    }}
    .grid {{
      max-width: 1300px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 22px;
    }}
    .product-card {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(12px);
      transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
    }}
    .product-card:hover {{
      transform: translateY(-5px);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
    }}
    .img-wrapper {{
      position: relative;
      width: 100%;
      height: 220px;
      background: #0f111a;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      overflow: hidden;
    }}
    .img-wrapper img {{
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      transition: transform 0.3s;
    }}
    .product-card:hover .img-wrapper img {{
      transform: scale(1.05);
    }}
    .badge {{
      position: absolute;
      top: 12px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    .badge-brand {{
      left: 12px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }}
    .badge-cat {{
      right: 12px;
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }}
    .card-body {{
      padding: 18px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }}
    .product-title {{
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 12px;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 42px;
    }}
    .pills-container {{
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;
      min-height: 52px;
      align-content: flex-start;
    }}
    .pill {{
      padding: 3px 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 6px;
      font-size: 11.5px;
      color: #cbd5e1;
    }}
    .pill-chip {{
      background: rgba(168, 85, 247, 0.12);
      color: #d8b4fe;
      border-color: rgba(168, 85, 247, 0.25);
    }}
    .pill-empty {{
      color: #64748b;
      font-style: italic;
    }}
    .card-footer {{
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 14px;
      margin-top: auto;
    }}
    .price-vnd {{
      font-size: 17px;
      font-weight: 700;
      color: #38bdf8;
    }}
    .price-usd {{
      font-size: 11.5px;
      color: var(--text-muted);
      margin-top: 2px;
    }}
    .view-btn {{
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #e2e8f0;
      text-decoration: none;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s;
    }}
    .view-btn:hover {{
      background: var(--accent);
      color: #fff;
    }}
    .credit-note {{
      font-size: 10.5px;
      color: #64748b;
      margin-top: 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}
  </style>
</head>
<body>
  <div class="header">
    <span class="tag">STORE SHOWCASE • LIVE CLOUDINARY PREVIEW</span>
    <h1>Xem Trước 97 Sản Phẩm Mới</h1>
    <p class="subtitle">Toàn bộ 97 sản phẩm đã được gắn link ảnh Cloudinary CDN thực tế, chuẩn hóa quy đổi giá VND và bóc tách cấu hình sẵn sàng nạp vào hệ thống.</p>
  </div>

  <div class="controls">
    <input type="text" id="searchInput" class="search-bar" placeholder="🔍 Tìm kiếm sản phẩm theo tên, chip, thương hiệu..."/>
    <div class="filters">
      {' '.join(brand_buttons)}
    </div>
  </div>

  <div class="grid" id="productGrid">
    {' '.join(cards_html)}
  </div>

  <script>
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.product-card');

    let currentFilter = 'all';

    filterBtns.forEach(btn => {{
      btn.addEventListener('click', () => {{
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        applyFilters();
      }});
    }});

    searchInput.addEventListener('input', applyFilters);

    function applyFilters() {{
      const query = searchInput.value.toLowerCase().trim();
      cards.forEach(card => {{
        const brand = card.dataset.brand;
        const name = card.dataset.name;
        const text = card.textContent.toLowerCase();

        const matchBrand = (currentFilter === 'all') || (brand === currentFilter);
        const matchSearch = (!query) || text.includes(query);

        if (matchBrand && matchSearch) {{
          card.style.display = 'flex';
        }} else {{
          card.style.display = 'none';
        }}
      }});
    }}
  </script>
</body>
</html>
"""

with open(out_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"DONE! Generated preview page at: {out_path} with {len(with_img)} products.")

