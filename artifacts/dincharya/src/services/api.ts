const BASE = "/api";

export async function registerUser(data: {
  name: string;
  age: number;
  email: string;
  goal: string;
  password: string;
}) {
  const res = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function saveUser(data: {
  email: string;
  prakriti: string;
  guna: string;
}) {
  const res = await fetch(`${BASE}/saveUser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { ok: res.ok, data: await res.json() };
}
