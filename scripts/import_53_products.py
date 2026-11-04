import json
import os
import sys
import re
import psycopg2
from psycopg2.extras import Json

# Database connection settings
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME", "store_dev")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASS = os.environ.get("DB_PASSWORD", "oW4NxO3BQ260pn7UUVYjiBNUKzmA2rOv")

data_path = os.path.join(os.path.dirname(__file__), "..", "sanpham", "products.cloudinary.json")
if not os.path.exists(data_path):
    print(f"Error: file not found at {data_path}")
    sys.exit(1)

with open(data_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

products_to_import = raw_data.get("products", [])
print(f"Loaded {len(products_to_import)} products from {data_path}.")

conn = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASS
)
conn.autocommit = False
cur = conn.cursor()

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', text)
    text = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', text)
    text = re.sub(r'[ìíịỉĩ]', 'i', text)
    text = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', text)
    text = re.sub(r'[ùúụủũưừứựửữ]', 'u', text)
    text = re.sub(r'[ỳýỵỷỹ]', 'y', text)
    text = re.sub(r'[đ]', 'd', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text).strip('-')
    return text

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

    print("2. Ensuring all brands exist...")
    needed_brands = [
        ("Apple", "apple", "Mỹ", "Thương hiệu Apple cao cấp"),
        ("Samsung", "samsung", "Hàn Quốc", "Gã khổng lồ công nghệ Hàn Quốc"),
        ("Xiaomi", "xiaomi", "Trung Quốc", "Hệ sinh thái công nghệ thông minh"),
        ("OPPO", "oppo", "Trung Quốc", "Chuyên gia nhiếp ảnh và sạc nhanh"),
        ("LG", "lg", "Hàn Quốc", "Màn hình và thiết bị điện tử gia dụng đỉnh cao"),
        ("Dell", "dell", "Mỹ", "Thương hiệu máy tính, laptop doanh nghiệp hàng đầu"),
        ("Honor", "honor", "Trung Quốc", "Thiết bị thông minh công nghệ cao"),
        ("Huawei", "huawei", "Trung Quốc", "Thiết bị viễn thông và công nghệ thông minh"),
        ("Lenovo", "lenovo", "Trung Quốc", "Laptop ThinkPad và thiết bị cá nhân bền bỉ"),
        ("JBL", "jbl", "Mỹ", "Huyền thoại âm thanh sống động từ Harman"),
        ("Sennheiser", "sennheiser", "Đức", "Thương hiệu âm thanh audiophile hàng đầu Đức"),
        ("Amazfit", "amazfit", "Trung Quốc", "Đồng hồ thể thao thông minh chuyên nghiệp"),
        ("DJI", "dji", "Trung Quốc", "Thiết bị flycam, gimbal và camera hành trình số 1"),
        ("Gochek", "gochek", "Việt Nam", "Micro thu âm không dây chuyên nghiệp"),
        ("Insta360", "insta360", "Trung Quốc", "Camera 360 độ và camera hành động sáng tạo"),
        ("IMOU", "imou", "Trung Quốc", "Camera an ninh gia đình thông minh"),
        ("HP", "hp", "Mỹ", "Laptop và máy in văn phòng đáng tin cậy"),
        ("Brother", "brother", "Nhật Bản", "Máy in và thiết bị văn phòng Nhật Bản"),
        ("Panasonic", "panasonic", "Nhật Bản", "Điện máy gia dụng bền bỉ Nhật Bản"),
        ("Aqua", "aqua", "Nhật Bản", "Điện lạnh gia dụng tiết kiệm điện"),
        ("CellphoneS", "cellphones", "Việt Nam", "Hệ thống bán lẻ công nghệ toàn quốc"),
    ]
    for b_name, b_slug, b_country, b_desc in needed_brands:
        cur.execute("""
            INSERT INTO brands (name, slug, country, description, is_active, sort_order)
            VALUES (%s, %s, %s, %s, true, 50)
            ON CONFLICT (name) DO NOTHING;
        """, (b_name, b_slug, b_country, b_desc))

    cur.execute("SELECT name, brand_id FROM brands;")
    brand_map = {row[0].lower(): row[1] for row in cur.fetchall()}
    print(f"   -> Brands ready ({len(brand_map)} brands total).")

    def determine_category_id(p):
        g_slug = p.get("groupSlug", "")
        cat_slug = p.get("category", "")
        title_lower = p.get("title", "").lower()

        if g_slug == "dien-thoai-tablet":
            if cat_slug == "tablets" or "ipad" in title_lower or "tablet" in title_lower or "pad" in title_lower:
                if "ipad" in title_lower:
                    return 3  # iPad
                return 19  # Máy tính bảng
            if "iphone" in title_lower:
                return 1  # iPhone
            if "galaxy" in title_lower:
                return 6  # Samsung Galaxy
            return 18  # Điện thoại

        if g_slug == "laptop":
            if "macbook" in title_lower:
                return 2  # MacBook
            if any(k in title_lower for k in ["gaming", "legion", "rog", "nitro"]):
                return 20  # Laptop Gaming
            return 7  # Laptop

        if g_slug == "am-thanh-mic":
            if cat_slug == "headphones" or "tai nghe" in title_lower:
                return 23  # Tai nghe
            return 22  # Âm thanh, Mic thu âm

        if g_slug == "dong-ho-camera":
            if "watch" in title_lower or "đồng hồ" in title_lower:
                if "apple watch" in title_lower:
                    return 4  # Apple Watch
                return 11  # Đồng hồ thông minh
            return 25  # Đồng hồ, Camera

        if g_slug == "phu-kien":
            return 5  # Phụ kiện

        if g_slug == "pc-man-hinh-may-in":
            if cat_slug == "monitors" or "màn hình" in title_lower:
                return 8  # Màn hình
            if cat_slug == "pcs" or "pc" in title_lower or "case" in title_lower:
                return 9  # PC
            return 28  # PC, Màn hình, Máy in

        if g_slug == "tivi-dien-may":
            if cat_slug == "tvs" or "tivi" in title_lower:
                return 30  # Tivi
            return 31  # Gia dụng thông minh

        return 18

    def determine_brand_id(p):
        b = p.get("brand", "").lower()
        if b in brand_map:
            return brand_map[b]
        for key in brand_map:
            if key in b:
                return brand_map[key]
        return 1  # Default Apple

    print(f"3. Inserting {len(products_to_import)} products...")

    used_slugs = set()
    inserted_count = 0

    for idx, p in enumerate(products_to_import, 1):
        name = p.get("title", f"Sản phẩm {idx}")
        base_slug = slugify(name)
        slug = base_slug
        count = 1
        while slug in used_slugs:
            count += 1
            slug = f"{base_slug}-{count}"
        used_slugs.add(slug)

        cat_id = determine_category_id(p)
        brand_id = determine_brand_id(p)
        brand_name = p.get("brand", "Chính hãng")
        orig_price = float(p.get("price", 0))
        final_price = float(p.get("finalPrice", orig_price))
        discount = p.get("discountPercentage", 0)
        stock = int(p.get("stock", 50))
        rating = float(p.get("rating", 4.8))

        desc = (
            f"{name} chính hãng {brand_name}. "
            f"Sản phẩm thuộc nhóm {p.get('group', 'Công nghệ')} - {p.get('categoryName', '')}. "
            f"Giá gốc: {orig_price:,.0f}₫, ưu đãi giảm {discount}% chỉ còn {final_price:,.0f}₫. "
            f"Bảo hành chính hãng 12 tháng, 1 đổi 1 trong 30 ngày nếu có lỗi từ nhà sản xuất. "
            f"Hỗ trợ trả góp 0% lãi suất, giao hàng nhanh toàn quốc."
        )

        specs_json = Json({
            "brand": brand_name,
            "group": p.get("group", ""),
            "groupSlug": p.get("groupSlug", ""),
            "categoryName": p.get("categoryName", ""),
            "category": p.get("category", ""),
            "originalPrice": orig_price,
            "finalPrice": final_price,
            "discountPercentage": discount,
            "rating": rating,
            "stock": stock
        })

        is_hot = idx <= 12 or discount >= 15 or "pro max" in name.lower() or "ultra" in name.lower()
        is_new = True

        # Insert product
        cur.execute("""
            INSERT INTO products (
                category_id, brand_id, supplier_id, name, slug, model_code,
                description, specs, is_active, is_hot, is_new, created_at, updated_at
            )
            VALUES (%s, %s, 1, %s, %s, %s, %s, %s, true, %s, %s, now(), now())
            RETURNING product_id;
        """, (cat_id, brand_id, name, slug, slug.upper()[:30], desc, specs_json, is_hot, is_new))
        product_id = cur.fetchone()[0]

        # Insert product_variant
        cost_price = float(round(final_price * 0.82, -3))
        sku = f"SKU-{slug.upper().replace('-', '')[:18]}-{idx:02d}"
        attrs = Json({"color": "Tiêu chuẩn", "edition": "Chính hãng VN/A"})

        cur.execute("""
            INSERT INTO product_variants (product_id, sku, attributes, cost_price, sale_price, is_active)
            VALUES (%s, %s, %s, %s, %s, true)
            RETURNING variant_id;
        """, (product_id, sku, attrs, cost_price, final_price))
        variant_id = cur.fetchone()[0]

        # Insert product_images
        thumb_url = p.get("thumbnail") or ""
        images_list = p.get("images", [])
        if thumb_url and thumb_url not in images_list:
            images_list = [thumb_url] + images_list

        if not images_list and thumb_url:
            images_list = [thumb_url]

        for s_idx, img_url in enumerate(images_list):
            is_primary = (s_idx == 0)
            cur.execute("""
                INSERT INTO product_images (product_id, url, is_primary, sort_order)
                VALUES (%s, %s, %s, %s);
            """, (product_id, img_url, is_primary, s_idx))

        # Insert inventory
        cur.execute("""
            INSERT INTO inventory (warehouse_id, variant_id, quantity, reserved_qty, reorder_level, updated_at)
            VALUES (1, %s, %s, 0, 5, now()), (2, %s, %s, 0, 5, now());
        """, (variant_id, stock, variant_id, stock))

        inserted_count += 1

    conn.commit()
    print(f"\n===> SUCCESS! Imported {inserted_count} new products with Cloudinary images and stock into store_dev!")

except Exception as e:
    conn.rollback()
    print(f"\n[ERROR] Transaction failed, rolled back: {e}")
    sys.exit(1)
finally:
    cur.close()
    conn.close()

