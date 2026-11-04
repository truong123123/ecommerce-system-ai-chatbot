async function test() {
  const getRes = await fetch('http://localhost:8080/api/v1/categories');
  const cookie = getRes.headers.get('set-cookie') || '';
  const match = cookie.match(/XSRF-TOKEN=([^;]+)/);
  const xsrf = match ? match[1] : '';
  console.log('Got XSRF:', xsrf);
  const postRes = await fetch('http://localhost:8080/api/v1/vouchers/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `XSRF-TOKEN=${xsrf}`,
      'X-XSRF-TOKEN': xsrf
    },
    body: JSON.stringify({ code: 'DISCOUNT10', orderTotal: 1000000 })
  });
  console.log('Post Status:', postRes.status, await postRes.text());
}
test();
