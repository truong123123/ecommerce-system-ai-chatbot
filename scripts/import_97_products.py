import json
import os
import sys
import psycopg2
from psycopg2.extras import Json

# Database connection settings
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME", "store_dev")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASS = os.environ.get("DB_PASSWORD", "oW4NxO3BQ260pn7UUVYjiBNUKzmA2rOv")

data_path = os.path.join(os.path.dirname(__file__), "..", "sanpham", "products_cloudinary.json")
if not os.path.exists(data_path):
    print(f"Error: file not found at {data_path}")
    sys.exit(1)

with open(data_path, "r", encoding="utf-8") as f:
    all_products = json.load(f)

products_to_import = [p for p in all_products if p.get("image_url")]
print(f"Loaded {len(products_to_import)} products with Cloudinary images.")

conn = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASS
)
conn.autocommit = False
cur = conn.cursor()

try:
    print("1. Truncating dependent and product tables safely...")
    truncate_sql = """
    TRUNCATE TABLE 
        order_items, orders, order_status_history, order_invoice_info,
        cart_items, carts,
        wishlist_items,
        reviews, review_helpful_votes, review_replies,
        flash_sale_slot_products, flash_sale_purchases, flash_sale_user_purchase, flash_sale_item,
        product_bundles, promotion_targets,
        inventory_movements, inventory_reservation, inventory,
        product_images, product_variants, products
    CASCADE;
    
    ALTER SEQUENCE products_product_id_seq RESTART WITH 1;
    ALTER SEQUENCE product_variants_variant_id_seq RESTART WITH 1;
    ALTER SEQUENCE product_images_image_id_seq RESTART WITH 1;
    """
    cur.execute(truncate_sql)
    print("   -> Truncate & sequence reset complete.")

    print("2. Ensuring all brands exist in 'brands' table...")
    new_brands = [
        ("Google", "google", "Mỹ", "Thương hiệu công nghệ hàng đầu thế giới với dòng Pixel"),
        ("OPPO", "oppo", "Trung Quốc", "Chuyên gia nhiếp ảnh chân dung và thiết bị di động"),
        ("vivo", "vivo", "Trung Quốc", "Công nghệ camera Zeiss đột phá và thiết kế tinh tế"),
        ("OnePlus", "oneplus", "Trung Quốc", "Hiệu năng dẫn đầu với triết lý Never Settle"),
        ("Honor", "honor", "Trung Quốc", "Thiết bị thông minh công nghệ cao, pin silicon-carbon"),
        ("Nothing", "nothing", "Anh", "Thiết kế trong suốt Glyph độc bản và trải nghiệm tối giản"),
        ("Motorola", "motorola", "Mỹ", "Tiên phong điện thoại gập Razr và di động thông minh"),
        ("Microsoft", "microsoft", "Mỹ", "Dòng thiết bị cao cấp Surface cho công việc và sáng tạo"),
        ("Razer", "razer", "Mỹ", "Thương hiệu gaming hàng đầu thế giới"),
        ("RedMagic", "redmagic", "Trung Quốc", "Smartphone gaming cấu hình khủng tản nhiệt quạt"),
    ]
    for b_name, b_slug, b_country, b_desc in new_brands:
        cur.execute("""
            INSERT INTO brands (name, slug, country, description, is_active, sort_order)
            VALUES (%s, %s, %s, %s, true, 50)
            ON CONFLICT (name) DO NOTHING;
        """, (b_name, b_slug, b_country, b_desc))
    
    # Reload brand mappings
    cur.execute("SELECT name, brand_id FROM brands;")
    brand_map = {row[0].lower(): row[1] for row in cur.fetchall()}
    print(f"   -> Brands ready ({len(brand_map)} brands total).")

    # Categories map
    # 1: iPhone, 2: MacBook, 3: iPad, 6: Samsung Galaxy, 7: Laptop, 18: Điện thoại, 20: Laptop Gaming, 21: Laptop Văn phòng
    cur.execute("SELECT category_id, name, slug FROM categories;")
    cats = cur.fetchall()
    print(f"   -> Categories ready ({len(cats)} categories).")

    def determine_category_id(p):
        brand = p.get("brand", "").lower()
        name = p.get("name", "").lower()
        cat = p.get("category", "phone").lower()
        
        if "apple" in brand:
            if "iphone" in name:
                return 1
            if "macbook" in name:
                return 2
            if "ipad" in name:
                return 3
        if "samsung" in brand and "galaxy" in name:
            return 6
        if cat == "laptop":
            if any(k in name for k in ["rog", "strix", "zephyrus", "predator", "helios", "nitro", "gaming", "blade"]):
                return 20  # Laptop Gaming
            return 7  # Laptop
        return 18  # Điện thoại

    def determine_brand_id(p):
        b = p.get("brand", "").lower()
        if b in brand_map:
            return brand_map[b]
        if "asus" in b and "asus" in brand_map:
            return brand_map["asus"]
        return 1  # Fallback Apple

    def compute_prices(p):
        usd = p.get("price_usd_from")
        if usd and usd > 0:
            sale = float(round(usd * 25500, -4))
        else:
            name = p["name"].lower()
            cat = p.get("category", "phone")
            if any(k in name for k in ["fold", "ultra", "pro max", "titan"]):
                sale = 33990000.0
            elif any(k in name for k in ["pro", "plus", "max", "neo"]):
                sale = 24990000.0
            elif cat == "laptop":
                if any(k in name for k in ["rog", "predator", "gaming", "strix", "studio"]):
                    sale = 34990000.0
                else:
                    sale = 22990000.0
            else:
                sale = 16990000.0
        cost = float(round(sale * 0.82, -4))
        return cost, sale

    def make_description(p):
        name = p["name"]
        brand = p.get("brand", "")
        specs = p.get("specs", {})
        parts = [f"{name} chính hãng {brand}."]
        if specs.get("chip"):
            parts.append(f"Trang bị vi xử lý {specs['chip']} mạnh mẽ vượt trội.")
        if specs.get("screen"):
            parts.append(f"Màn hình {specs['screen']} sắc nét, sống động.")
        if specs.get("ram") or specs.get("storage"):
            ram_rom = " / ".join(filter(None, [specs.get("ram"), specs.get("storage")]))
            parts.append(f"Bộ nhớ: {ram_rom}.")
        if specs.get("battery"):
            parts.append(f"Dung lượng pin ấn tượng {specs['battery']}.")
        if specs.get("os"):
            parts.append(f"Hệ điều hành {specs['os']}.")
        if p.get("note"):
            parts.append(f"Ghi chú: {p['note']}.")
        parts.append("Sản phẩm mới 100% nguyên seal, bảo hành 12 tháng chính hãng, 1 đổi 1 trong 30 ngày.")
        return " ".join(parts)

    def is_hot(p):
        name = p["name"].lower()
        return any(k in name for k in ["ultra", "pro max", "fold", "zephyrus", "predator", "titan"])

    print(f"3. Inserting {len(products_to_import)} products...")

    inserted_count = 0
    for p in products_to_import:
        cat_id = determine_category_id(p)
        brand_id = determine_brand_id(p)
        name = p["name"]
        slug = p["id"]
        desc = make_description(p)
        specs_json = Json(p.get("specs", {}))
        hot_flag = is_hot(p)
        new_flag = True

        # Insert product
        cur.execute("""
            INSERT INTO products (
                category_id, brand_id, supplier_id, name, slug, model_code,
                description, specs, is_active, is_hot, is_new, created_at, updated_at
            )
            VALUES (%s, %s, 1, %s, %s, %s, %s, %s, true, %s, %s, now(), now())
            RETURNING product_id;
        """, (cat_id, brand_id, name, slug, slug.upper(), desc, specs_json, hot_flag, new_flag))
        product_id = cur.fetchone()[0]

        # Insert product_variant
        cost_price, sale_price = compute_prices(p)
        sku = f"SKU-{slug.upper().replace('-', '')[:20]}-01"
        attrs = Json({"color": "Tiêu chuẩn", "storage": p.get("specs", {}).get("storage", "Tiêu chuẩn")})
        
        cur.execute("""
            INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
            VALUES (%s, %s, %s, %s, %s, true)
            RETURNING variant_id;
        """, (product_id, sku, attrs, cost_price, sale_price))
        variant_id = cur.fetchone()[0]

        # Insert product_image (Cloudinary CDN URL)
        img_url = p["image_url"]
        cur.execute("""
            INSERT INTO product_images (product_id, url, is_primary, sort_order)
            VALUES (%s, %s, true, 0);
        """, (product_id, img_url))

        # Insert inventory (warehouse 1 & 2)
        cur.execute("""
            INSERT INTO inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at)
            VALUES (1, %s, 50, 0, 10, now()), (2, %s, 50, 0, 10, now());
        """, (variant_id, variant_id))

        inserted_count += 1

    conn.commit()
    print(f"\n===> SUCCESS! Imported {inserted_count} products with variants, images, and inventory into store_dev!")

except Exception as e:
    conn.rollback()
    print(f"\n[ERROR] Transaction failed, rolled back: {e}")
    sys.exit(1)
finally:
    cur.close()
    conn.close()

