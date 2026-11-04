// Upload toàn bộ ảnh trong ./anhwweb lên Cloudinary,
// rồi tạo products.cloudinary.json có link ảnh thật.
//
// Cách chạy:
//   npm install
//   node upload.js

const path = require("path");
const fs = require("fs");

// Đọc biến môi trường từ .env trong thư mục sanpham hoặc thư mục gốc
require("dotenv").config({ path: path.join(__dirname, ".env") });
if (!process.env.CLOUD_NAME && fs.existsSync(path.join(__dirname, "..", ".env"))) {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
}

const cloudinary = require("cloudinary").v2;

// Lấy thông tin xác thực từ biến môi trường
const CLOUD_NAME = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.API_KEY || process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.API_SECRET || process.env.CLOUDINARY_API_SECRET;

const IMG_DIR = fs.existsSync(path.join(__dirname, "anhwweb"))
  ? path.join(__dirname, "anhwweb")
  : path.join(__dirname, "annhsp");
const INPUT_JSON = path.join(__dirname, "products.json");
const OUTPUT_JSON = path.join(__dirname, "products.cloudinary.json");
const CLOUD_FOLDER = "products";

// Giữ DELETE_ALL_OLD = false sau khi đã dọn dẹp sạch
const DELETE_ALL_OLD = false;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

async function main() {
  const files = fs
    .readdirSync(IMG_DIR)
    .filter((f) => /\.(webp|png|jpe?g)$/i.test(f));

  console.log(`Tìm thấy ${files.length} ảnh.`);

  if (DELETE_ALL_OLD) {
    console.log("Đang xóa toàn bộ ảnh cũ...");
    const del = await cloudinary.api.delete_all_resources({
      resource_type: "image",
      invalidate: true,
    });
    console.log("Đã xóa:", Object.keys(del.deleted || {}).length, "ảnh");
  }

  console.log("Bắt đầu upload...");

  const urls = {}; // tên file -> link Cloudinary

  for (const file of files) {
    try {
      const res = await cloudinary.uploader.upload(path.join(IMG_DIR, file), {
        folder: CLOUD_FOLDER,
        public_id: path.parse(file).name,
        overwrite: true,
        resource_type: "image",
      });
      urls[file] = res.secure_url;
      console.log("OK  ", file);
    } catch (err) {
      console.error("LỖI", file, "-", err.message);
    }
  }

  // Thay tên file bằng link Cloudinary trong products.json
  const data = JSON.parse(fs.readFileSync(INPUT_JSON, "utf8"));
  let missing = 0;

  const productList = data.products || (Array.isArray(data) ? data : []);
  for (const p of productList) {
    const swap = (name) => {
      if (!name) return name;
      if (urls[name]) return urls[name];
      const base = path.basename(name);
      if (urls[base]) return urls[base];
      missing++;
      return name;
    };
    if (p.thumbnail) p.thumbnail = swap(p.thumbnail);
    if (Array.isArray(p.images)) p.images = p.images.map(swap);
    if (p.image_url) p.image_url = swap(p.image_url);
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(data, null, 2), "utf8");

  console.log(`\nXong! Đã tạo ${OUTPUT_JSON}`);
  if (missing) console.log(`Cảnh báo: ${missing} ảnh chưa có link (upload lỗi hoặc thiếu file).`);
}

main();
