import os
import psycopg2

# Database connection settings
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as env_f:
        for line in env_f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME", "store_dev")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASS = os.environ.get("DB_PASSWORD") or os.environ.get("SPRING_DATASOURCE_PASSWORD")

if not DB_PASS:
    print("Error: DB_PASSWORD or SPRING_DATASOURCE_PASSWORD must be set in environment or .env file.")
    import sys
    sys.exit(1)

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
    print("Seeding Flash Sale campaign for new products...")

    cur.execute("""
        INSERT INTO flash_sale_campaign (
            title, disclaimer, is_active, status, publish_status,
            start_time, end_time, created_at, updated_at, version
        )
        VALUES (
            'SIÊU SALE CÔNG NGHỆ CHÍNH HÃNG - GIẢM ĐẾN 50%',
            'Số lượng có hạn, áp dụng cho khách hàng đặt mua online sớm nhất.',
            true, 'ACTIVE', 'ACTIVE',
            now() - interval '2 hours', now() + interval '5 days',
            now(), now(), 1
        )
        RETURNING campaign_id;
    """)
    campaign_id = cur.fetchone()[0]

    # Create 3 time slots: 09:00 - 12:00, 12:00 - 18:00, 18:00 - 22:00
    slots = [
        ("09:00 - 12:00", "- interval '2 hours'", "+ interval '1 hour'", True),
        ("12:00 - 18:00", "+ interval '1 hour'", "+ interval '7 hours'", False),
        ("18:00 - 22:00", "+ interval '7 hours'", "+ interval '11 hours'", False),
    ]

    slot_ids = []
    for label, s_rel, e_rel, is_act in slots:
        sql = f"""
            INSERT INTO flash_sale_time_slot (
                campaign_id, label, start_time, end_time, is_active, version
            )
            VALUES (
                %s, %s, now() {s_rel}, now() {e_rel}, %s, 1
            )
            RETURNING slot_id;
        """
        cur.execute(sql, (campaign_id, label, is_act))
        slot_ids.append(cur.fetchone()[0])

    # Fetch 8 products to put into Flash Sale
    cur.execute("""
        SELECT p.product_id, p.name, pi.url, pv.sale_price, p.specs
        FROM products p
        LEFT JOIN product_images pi ON pi.product_id = p.product_id AND pi.is_primary = true
        JOIN product_variants pv ON pv.product_id = p.product_id
        ORDER BY p.product_id ASC
        LIMIT 8;
    """)
    prods = cur.fetchall()

    for idx, (p_id, p_name, p_img, p_sale, p_specs) in enumerate(prods):
        sale = float(p_sale)
        orig = float(p_specs.get("originalPrice", sale * 1.15))
        discount = int(p_specs.get("discountPercentage", 15))
        if discount < 10:
            discount = 12

        cur.execute("""
            INSERT INTO flash_sale_item (
                campaign_id, slot_id, product_id, name, image_url,
                original_price, sale_price, discount_percent, sold_count,
                total_stock, reserved_quantity, max_quantity_per_user,
                status, display_order, version
            )
            VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, 0, 2,
                'AVAILABLE', %s, 1
            );
        """, (
            campaign_id, slot_ids[0], p_id, p_name, p_img,
            orig, sale, discount, idx * 3 + 2,
            50, idx
        ))

    conn.commit()
    print(f"===> Flash Sale campaign created with ID: {campaign_id} and {len(prods)} products!")

except Exception as e:
    conn.rollback()
    print("Error:", e)
finally:
    cur.close()
    conn.close()
