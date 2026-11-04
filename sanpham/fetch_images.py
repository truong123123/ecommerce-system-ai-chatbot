"""Tìm ảnh có giấy phép tự do trên Wikimedia Commons cho từng sản phẩm,
upload lên Cloudinary và lưu kèm tác giả + giấy phép (bắt buộc ghi nguồn với CC-BY).
Chạy trên máy bạn (cần internet):
  pip install requests cloudinary
  export CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=...
  python fetch_images.py
Sản phẩm không tìm được ảnh -> ghi vào missing_images.txt, bạn tự bổ sung từ
press kit của hãng vào images/<id>.jpg rồi chạy lại.
"""
import json, os, glob, re, time, requests, cloudinary, cloudinary.uploader

API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "product-image-script/1.0 (contact: you@example.com)"}
OK_LICENSE = re.compile(r"^(CC0|CC BY|CC BY-SA|Public domain|PD)", re.I)

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", "c7w3ycu9"),
    api_key=os.environ.get("CLOUDINARY_API_KEY", "162552945264599"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET", "nUEJS_XhC7HJWqO4Q9i_3UT51kM"),
)

def find_commons(name):
    params = {"action":"query","format":"json","generator":"search","gsrnamespace":6,
              "gsrsearch":f'{name} filetype:bitmap',"gsrlimit":8,
              "prop":"imageinfo","iiprop":"url|extmetadata|size","iiurlwidth":1200}
    r = requests.get(API, params=params, headers=HEADERS, timeout=30).json()
    for page in (r.get("query", {}).get("pages", {}) or {}).values():
        info = page["imageinfo"][0]
        meta = info.get("extmetadata", {})
        lic = meta.get("LicenseShortName", {}).get("value", "")
        title = page["title"].lower()
        if not OK_LICENSE.match(lic) or info.get("width", 0) < 600:
            continue
        # tên model phải xuất hiện trong tên file để tránh ảnh sai máy
        if all(tok in title for tok in name.lower().split()[-2:]):
            author = re.sub(r"<[^>]+>", "", meta.get("Artist", {}).get("value", ""))
            return {"url": info["thumburl"], "license": lic, "author": author,
                    "page": info["descriptionurl"]}
    return None

products = json.load(open("products.json", encoding="utf-8"))
output_file = "products_cloudinary.json"
if os.path.exists(output_file):
    try:
        existing = json.load(open(output_file, encoding="utf-8"))
        existing_map = {item["id"]: item for item in existing if item.get("image_url")}
        for p in products:
            if p["id"] in existing_map:
                p["image_url"] = existing_map[p["id"]]["image_url"]
                if "image_credit" in existing_map[p["id"]]:
                    p["image_credit"] = existing_map[p["id"]]["image_credit"]
    except Exception as e:
        print("Note: could not load existing output:", e)

missing = []
processed_count = 0
for idx, p in enumerate(products, 1):
    if p.get("image_url"):
        print(f"[{idx}/{len(products)}] ALREADY DONE: {p['id']}", flush=True)
        continue
    local = glob.glob(f"images/{p['id']}.*")
    src, credit = None, None
    if local:
        src = local[0]
    elif p.get("image_source"):
        src = p["image_source"]
    else:
        try:
            hit = find_commons(p["name"])
        except Exception as e:
            print(f"[{idx}/{len(products)}] ERR search {p['id']}: {e}", flush=True)
            hit = None
        if hit:
            src, credit = hit["url"], hit
        time.sleep(0.3)
    if not src:
        missing.append(p["id"])
        print(f"[{idx}/{len(products)}] MISSING: {p['id']}", flush=True)
        continue
    try:
        res = cloudinary.uploader.upload(src, folder="products", public_id=p["id"], overwrite=True)
        p["image_url"] = res["secure_url"]
        if credit:
            p["image_credit"] = {k: credit[k] for k in ("author","license","page")}
        print(f"[{idx}/{len(products)}] OK: {p['id']} -> {res['secure_url']}", flush=True)
        processed_count += 1
        if processed_count % 3 == 0:
            json.dump(products, open(output_file, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
            open("missing_images.txt", "w").write("\n".join(missing))
    except Exception as e:
        missing.append(p["id"])
        print(f"[{idx}/{len(products)}] FAIL upload {p['id']}: {e}", flush=True)

json.dump(products, open("products_cloudinary.json","w",encoding="utf-8"), ensure_ascii=False, indent=2)
open("missing_images.txt","w",encoding="utf-8").write("\n".join(missing))
print(f"Xong. Co anh: {len(products)-len(missing)}/{len(products)}", flush=True)
