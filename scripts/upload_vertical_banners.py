import os
import time
import hashlib
import urllib.request
import json

cloud_name = 'c7w3ycu9'
api_key = '162552945264599'
api_secret = 'nUEJS_XhC7HJWqO4Q9i_3UT51kM'

banner_dir = r'd:\DoAnTotNgiep\frontend\public\images\banners'
target_files = ['poster_iphone_duo.jpg', 'poster_redmi_note17.jpg', 'banner_phone_hand.jpg', 'banner_fashion_model.jpg']

results = {}
for f in target_files:
    file_path = os.path.join(banner_dir, f)
    if not os.path.exists(file_path):
        continue
    public_id = os.path.splitext(f)[0]
    timestamp = str(int(time.time()))
    
    to_sign = f'folder=banners/vertical&public_id={public_id}&timestamp={timestamp}{api_secret}'
    signature = hashlib.sha1(to_sign.encode('utf-8')).hexdigest()
    
    with open(file_path, 'rb') as fp:
        file_bytes = fp.read()
    
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = bytearray()
    
    def add_field(name, val):
        body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{val}\r\n'.encode('utf-8'))
        
    add_field('api_key', api_key)
    add_field('timestamp', timestamp)
    add_field('folder', 'banners/vertical')
    add_field('public_id', public_id)
    add_field('signature', signature)
    
    body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{f}"\r\nContent-Type: image/jpeg\r\n\r\n'.encode('utf-8'))
    body.extend(file_bytes)
    body.extend(f'\r\n--{boundary}--\r\n'.encode('utf-8'))
    
    url = f'https://api.cloudinary.com/v1_1/{cloud_name}/image/upload'
    req = urllib.request.Request(url, data=bytes(body), headers={'Content-Type': f'multipart/form-data; boundary={boundary}'})
    
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results[f] = data['secure_url']
            print(f, '=>', data['secure_url'])
    except Exception as e:
        print('ERR', f, e)

output_path = r'd:\DoAnTotNgiep\sanpham\vertical_banners.cloudinary.json'
with open(output_path, 'w', encoding='utf-8') as out:
    json.dump(results, out, indent=2)
print("Uploaded vertical banners to Cloudinary successfully! Saved to", output_path)
