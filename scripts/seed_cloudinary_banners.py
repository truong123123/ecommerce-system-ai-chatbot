import sys
import psycopg2

sys.stdout.reconfigure(encoding='utf-8')

banners_data = [
    {
        "title": "Galaxy S26 Ultra",
        "headline": "Đặt trước nhận quà khủng",
        "subHeadline": "Thu cũ lên đời trợ giá tới 5 Triệu - Trả góp 0%",
        "imageUrl": "https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859058/banners/471331_S26-Series-1200x375.webp",
        "primaryBtnText": "Đặt ngay",
        "primaryBtnLink": "/products/samsung-galaxy-s26-ultra",
        "displayOrder": 1,
        "isActive": True
    },
    {
        "title": "iPhone 18 Series",
        "headline": "Sẵn hàng giá tốt",
        "subHeadline": "Ưu đãi thanh toán ngân hàng - Trả góp 0%",
        "imageUrl": "https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859066/banners/iphone-18-web-082925157.webp",
        "primaryBtnText": "Mua ngay",
        "primaryBtnLink": "/products/iphone-17-pro-256gb",
        "displayOrder": 2,
        "isActive": True
    },
    {
        "title": "Huawei Watch GT 7",
        "headline": "Đỉnh cao pin 2 tuần",
        "subHeadline": "Thiết kế thể thao sang trọng - Theo dõi sức khỏe chuyên sâu",
        "imageUrl": "https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859060/banners/666649_KV-HUAWEI-WATCH-GT-7-Series-1200x375.webp",
        "primaryBtnText": "Khám phá",
        "primaryBtnLink": "/products?category=dong-ho",
        "displayOrder": 3,
        "isActive": True
    },
    {
        "title": "Galaxy A18 & A08",
        "headline": "Siêu pin 25W - Giá hời",
        "subHeadline": "Màn hình 90Hz mượt mà - Pin 5000mAh bền bỉ",
        "imageUrl": "https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859062/banners/702904_KV-SS-A18-_-A08-1200x375-25w.webp",
        "primaryBtnText": "Xem chi tiết",
        "primaryBtnLink": "/products?category=dien-thoai",
        "displayOrder": 4,
        "isActive": True
    },
    {
        "title": "OPPO Find X10 Series",
        "headline": "Nhiếp ảnh bậc thầy",
        "subHeadline": "Camera Hasselblad cao cấp - Sạc siêu tốc 100W",
        "imageUrl": "https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859063/banners/860851_OPPO-Find-X10-Series-web.webp",
        "primaryBtnText": "Tìm hiểu thêm",
        "primaryBtnLink": "/products?category=dien-thoai",
        "displayOrder": 5,
        "isActive": True
    },
    {
        "title": "iPhone Duo Siêu Phẩm",
        "headline": "Đăng ký sớm có lợi thế",
        "subHeadline": "Đột phá thiết kế kép - Màn hình tràn viền",
        "imageUrl": "https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859067/banners/iphone-duo-web-084156526.webp",
        "primaryBtnText": "Đăng ký nhận tin",
        "primaryBtnLink": "/products/iphone-air",
        "displayOrder": 6,
        "isActive": True
    },
    {
        "title": "Astra 2 AI",
        "headline": "Tương lai công nghệ AI",
        "subHeadline": "Xử lý AI tức thì on-device - Trải nghiệm thông minh đỉnh cao",
        "imageUrl": "https://res.cloudinary.com/c7w3ycu9/image/upload/v1793859064/banners/astra-2-web-083724546.webp",
        "primaryBtnText": "Trải nghiệm ngay",
        "primaryBtnLink": "/products",
        "displayOrder": 7,
        "isActive": True
    }
]

def main():
    conn = psycopg2.connect(
        dbname='store_dev',
        user='postgres',
        password='oW4NxO3BQ260pn7UUVYjiBNUKzmA2rOv',
        host='localhost',
        port=5432
    )
    cur = conn.cursor()
    
    # Clear old placeholder banners
    cur.execute("DELETE FROM banners;")
    print("Cleared existing banners.")
    
    insert_sql = """
    INSERT INTO banners (
        title, headline, sub_headline, image_url,
        primary_btn_text, primary_btn_link,
        display_order, is_active, created_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW());
    """
    
    for b in banners_data:
        cur.execute(insert_sql, (
            b["title"],
            b["headline"],
            b["subHeadline"],
            b["imageUrl"],
            b["primaryBtnText"],
            b["primaryBtnLink"],
            b["displayOrder"],
            b["isActive"]
        ))
        print(f"Inserted: {b['title']} -> {b['imageUrl']}")
        
    conn.commit()
    cur.close()
    conn.close()
    print("Successfully seeded all 7 Cloudinary banners!")

if __name__ == '__main__':
    main()
