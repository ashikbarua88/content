// Accounts, discussion and the reflection journal, in the reader's browser.
// Everything is rendered as text (textContent), never as HTML, so nothing a reader writes can run.
import { createClient } from "@supabase/supabase-js";

const URL_ = import.meta.env.PUBLIC_SUPABASE_URL || "";
const KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || "";
export const connected = Boolean(URL_ && KEY);
let client = null;
export function sb() {
  if (!connected) return null;
  if (!client) client = createClient(URL_, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  return client;
}

/* ---------- small helpers ---------- */
const h = (tag, props = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v; else if (k === "text") e.textContent = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? "" : v);
  }
  kids.flat().forEach((c) => c != null && e.append(c.nodeType ? c : document.createTextNode(String(c))));
  return e;
};
const paragraphs = (text) => text.split(/\n{2,}/).map((p) => h("p", { text: p }));
const when = (iso) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
  keys(prefix) { try { return Object.keys(localStorage).filter((k) => k.startsWith(prefix)); } catch { return []; } },
};
export const base = (document.documentElement.dataset.base || "/");

/* ---------- auth ---------- */
let session = null, profile = null;
const listeners = new Set();
export function onAuth(fn) { listeners.add(fn); fn(session, profile); return () => listeners.delete(fn); }
async function loadProfile() {
  profile = null;
  if (session) {
    const { data } = await sb().from("profiles").select("id, display_name, avatar_url, is_admin").eq("id", session.user.id).maybeSingle();
    profile = data || { id: session.user.id, display_name: "Reader", is_admin: false };
  }
  listeners.forEach((fn) => fn(session, profile));
}
export async function startAuth() {
  if (!connected) { listeners.forEach((fn) => fn(null, null)); return; }
  const { data } = await sb().auth.getSession();
  session = data.session; await loadProfile();
  sb().auth.onAuthStateChange((_e, s) => { const changed = (s?.user?.id || null) !== (session?.user?.id || null); session = s; if (changed) loadProfile(); });
}
export const signInWith = (provider) => sb().auth.signInWithOAuth({ provider, options: { redirectTo: location.href } });
export const signUpEmail = (email, password, name) => sb().auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: location.origin + base + "account/" } });
export const signInEmail = (email, password) => sb().auth.signInWithPassword({ email, password });
export const resetPassword = (email) => sb().auth.resetPasswordForEmail(email, { redirectTo: location.origin + base + "account/" });
export const signOut = () => sb().auth.signOut();
export async function saveName(name) { await sb().from("profiles").update({ display_name: name }).eq("id", session.user.id); await loadProfile(); }
export const deleteAccount = () => sb().rpc("delete_my_account");

/* ---------- the reflection journal ---------- */
const JK = (page) => "reflect:" + page;
export function initJournal(root) {
  const page = root.dataset.page, meta = { title: root.dataset.title, url: location.pathname, question: root.dataset.q };
  const box = root.querySelector("textarea"), status = root.querySelector(".jstatus");
  const local = store.get(JK(page));
  if (local) box.value = local.body || "";
  let timer = null, signedIn = false;
  const say = (t) => { status.textContent = t; };
  say(local?.body ? "Saved in this browser." : "Only you can see this.");
  async function push() {
    const rec = { ...meta, body: box.value, updated_at: new Date().toISOString() };
    store.set(JK(page), rec);
    if (!signedIn) { say("Saved in this browser."); return; }
    const { error } = await sb().from("reflections").upsert({ page, title: rec.title, url: rec.url, question: rec.question, body: rec.body, updated_at: rec.updated_at });
    say(error ? "Saved in this browser; could not reach your account." : "Saved to your account.");
  }
  box.addEventListener("input", () => { clearTimeout(timer); say("Saving…"); timer = setTimeout(push, 700); });
  onAuth(async (s) => {
    signedIn = Boolean(s);
    if (!signedIn) return;
    const { data } = await sb().from("reflections").select("body, updated_at").eq("page", page).maybeSingle();
    const mine = store.get(JK(page));
    if (data && (!mine || data.updated_at > mine.updated_at)) { box.value = data.body; store.set(JK(page), { ...meta, body: data.body, updated_at: data.updated_at }); say("Saved to your account."); }
    else if (mine?.body) push();
  });
}

/* ---------- discussion ---------- */
export function initDiscussion(root) {
  const page = root.dataset.page;
  const list = root.querySelector(".cm-list"), form = root.querySelector(".cm-form"), gate = root.querySelector(".cm-gate");
  if (!connected) { gate.replaceChildren(h("p", { class: "off", text: "Discussion is not connected yet. Your reflection above is kept in this browser." })); form.hidden = true; return; }
  let me = null, admin = false;

  async function load() {
    const { data, error } = await sb().from("comments")
      .select("id, parent_id, user_id, body, deleted, hidden, created_at, edited_at, profiles(display_name, avatar_url)")
      .eq("page", page).order("created_at", { ascending: true });
    if (error) { list.replaceChildren(h("p", { class: "off", text: "Could not load the discussion. Try again later." })); return; }
    const top = data.filter((c) => !c.parent_id), kids = (id) => data.filter((c) => c.parent_id === id);
    list.replaceChildren(...(top.length ? top.map((c) => item(c, kids(c.id))) : [h("p", { class: "off", text: "No one has written here yet. Begin with the opening question." })]));
    root.querySelector(".cm-count").textContent = data.filter((c) => !c.deleted && !c.hidden).length || "";
  }

  function item(c, replies = []) {
    const own = me && c.user_id === me;
    const name = c.profiles?.display_name || "Reader";
    const body = h("div", { class: "cm-body" }, c.deleted ? h("p", { class: "off", text: "Removed by its author." }) : paragraphs(c.body));
    const acts = h("div", { class: "cm-acts" });
    if (me && !c.parent_id && !c.deleted) acts.append(h("button", { type: "button", text: "Reply", onclick: () => replyBox(li, c.id) }));
    if (own && !c.deleted) {
      acts.append(h("button", { type: "button", text: "Edit", onclick: () => editBox(body, c) }));
      acts.append(h("button", { type: "button", text: "Delete", onclick: async () => { if (confirm("Delete this comment?")) { await sb().from("comments").update({ deleted: true, body: "(removed)" }).eq("id", c.id); load(); } } }));
    }
    if (admin) acts.append(h("button", { type: "button", text: c.hidden ? "Unhide" : "Hide", onclick: async () => { await sb().from("comments").update({ hidden: !c.hidden }).eq("id", c.id); load(); } }));
    const li = h("article", { class: "cm" + (c.hidden ? " cm-hidden" : ""), id: "comment-" + c.id },
      h("header", {}, h("b", { text: name }), " ", h("a", { href: "#comment-" + c.id, text: when(c.created_at) }), c.edited_at ? h("span", { class: "muted", text: " · edited" }) : null, c.hidden ? h("span", { class: "muted", text: " · hidden" }) : null),
      body, acts,
      replies.length ? h("div", { class: "cm-replies" }, replies.map((r) => item(r))) : null);
    return li;
  }

  function composer(onSend, initial = "", label = "Post") {
    const ta = h("textarea", { rows: 4, maxlength: 5000, "aria-label": "Your comment" }); ta.value = initial;
    const b = h("button", { type: "submit", class: "btn primary", text: label });
    const f = h("form", { class: "cm-compose" }, ta, h("div", { class: "cm-row" }, b, h("span", { class: "muted ui cm-msg" })));
    f.addEventListener("submit", async (e) => {
      e.preventDefault(); const text = ta.value.trim(); if (!text) return;
      b.disabled = true; const err = await onSend(text); b.disabled = false;
      if (err) f.querySelector(".cm-msg").textContent = "Could not save: " + err.message; else { ta.value = ""; load(); }
    });
    return f;
  }
  function replyBox(li, parent) {
    if (li.querySelector(":scope > .cm-compose")) return;
    li.append(composer(async (text) => (await sb().from("comments").insert({ page, parent_id: parent, body: text })).error, "", "Reply"));
  }
  function editBox(body, c) {
    body.replaceChildren(composer(async (text) => (await sb().from("comments").update({ body: text }).eq("id", c.id)).error, c.body, "Save"));
  }

  onAuth((s, p) => {
    me = s?.user?.id || null; admin = Boolean(p?.is_admin);
    if (s) {
      gate.replaceChildren(h("p", { class: "muted ui", text: "Writing as " + (p?.display_name || "Reader") + ". " }, h("a", { href: base + "account/", text: "Your account" })));
      form.replaceChildren(composer(async (text) => (await sb().from("comments").insert({ page, body: text })).error));
      form.hidden = false;
    } else {
      gate.replaceChildren(h("p", { class: "muted ui" }, h("a", { href: base + "account/?next=" + encodeURIComponent(location.pathname + "#discuss"), text: "Sign in" }), " to join the discussion. Reading is open to everyone."));
      form.hidden = true;
    }
    load();
  });
}

/* ---------- header: sign-in link or the reader's name ---------- */
export function initHeader(a) {
  if (!connected) { a.hidden = true; return; }
  onAuth((s, p) => { a.textContent = s ? (p?.display_name || "Account") : "Sign in"; });
}

/* ---------- my reflections ---------- */
export function localReflections() {
  return store.keys("reflect:").map((k) => ({ page: k.slice(8), ...store.get(k) })).filter((r) => r.body && r.body.trim());
}
export async function allReflections() {
  const local = Object.fromEntries(localReflections().map((r) => [r.page, r]));
  if (session) {
    const { data } = await sb().from("reflections").select("page, title, url, question, body, updated_at");
    (data || []).forEach((r) => { if (r.body?.trim() && (!local[r.page] || r.updated_at > local[r.page].updated_at)) local[r.page] = r; });
  }
  return Object.values(local).sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
}
export function toMarkdown(rs) {
  return "# My reflections\n\n" + rs.map((r) => `## ${r.title}\n\n*${r.question}*\n\n${r.body.trim()}\n\n_${r.updated_at?.slice(0, 10) || ""} · ${location.origin}${r.url}_\n`).join("\n");
}
export const clearLocal = () => store.keys("reflect:").forEach((k) => store.del(k));
export { h, paragraphs, when };
