export function sendRequest(url, method, data) {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : null
  })
  .then(res => res.json())
  .catch(err => {
    console.error(`${method} ${url} failed:`, err);
    throw err;
  });
}