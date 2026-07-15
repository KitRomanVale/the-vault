import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpHandler } from "agents/mcp";
import { z } from "zod";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type"
};

const STORE_VERSION = 2;
const ENERGIES = ["low", "medium", "high"];
const STATUSES = ["idea", "active", "paused", "finished"];

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
  });
}

// Constant-time token check: hash both values to fixed-length SHA-256
// digests, then compare with the runtime's timing-safe primitive. Hashing
// first means digests are always 32 bytes, so neither the token's length
// nor how much of it matched leaks via timing (timingSafeEqual also
// REQUIRES equal-length inputs — it throws otherwise).
// Runtime note, verified by probe on workerd 2026-07: the extension lives
// at crypto.subtle.timingSafeEqual; plain crypto.timingSafeEqual does NOT
// exist despite some docs summaries claiming so.
async function tokenMatches(candidate, secret) {
  if (typeof candidate !== "string" || typeof secret !== "string" || !candidate || !secret) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(candidate)),
    crypto.subtle.digest("SHA-256", enc.encode(secret))
  ]);
  return crypto.subtle.timingSafeEqual(new Uint8Array(a), new Uint8Array(b));
}

async function authorized(request, env) {
  const header = request.headers.get("Authorization") || "";
  const headerToken = header.startsWith("Bearer ") ? header.slice(7) : "";
  // Some MCP clients (Hearthline's connector system included) call out to
  // external servers without adding custom headers, so the secret has to be
  // embeddable in the URL itself — same fallback Hearthline's own bridge uses.
  const queryToken = new URL(request.url).searchParams.get("secret") || "";
  return (await tokenMatches(headerToken, env.AUTH_TOKEN)) || (await tokenMatches(queryToken, env.AUTH_TOKEN));
}

function uid() {
  return crypto.randomUUID();
}

// Structural check only — normalizeProject already fills in sane defaults
// for missing/malformed fields on individual projects, so this just rejects
// shapes that would crash that logic (non-objects, missing arrays) rather
// than re-validating every field.
function isValidVaultPayload(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  if (!Array.isArray(body.projects)) return false;
  for (const p of body.projects) {
    if (!p || typeof p !== "object" || Array.isArray(p)) return false;
  }
  if (body.tombstones !== undefined) {
    if (!Array.isArray(body.tombstones)) return false;
    for (const t of body.tombstones) {
      if (!t || typeof t !== "object" || typeof t.id !== "string") return false;
    }
  }
  return true;
}

// Spread ...p FIRST so fields this worker doesn't know about (added by a
// newer app version) pass through untouched instead of being stripped from
// every project on each MCP edit — that drift already ate nextStep/mood
// once. Known fields are then re-asserted with sane defaults on top.
function normalizeProject(p) {
  return {
    ...p,
    id: p.id || uid(),
    title: p.title || "Untitled",
    desc: p.desc || "",
    energy: ENERGIES.includes(p.energy) ? p.energy : "medium",
    status: STATUSES.includes(p.status) ? p.status : "idea",
    mode: p.mode === "stepped" ? "stepped" : "simple",
    created: p.created || Date.now(),
    updatedAt: p.updatedAt || p.created || Date.now(),
    lastTouched: p.lastTouched ?? null,
    logs: Array.isArray(p.logs) ? p.logs : [],
    workedCount: p.workedCount || 0,
    steps: Array.isArray(p.steps) ? p.steps : [],
    nextStep: typeof p.nextStep === "string" ? p.nextStep : "",
    mood: typeof p.mood === "string" ? p.mood : ""
  };
}

// Store shape is {version, savedAt, projects, tombstones} — the same shape
// the browser client's merge logic expects. Tombstones are only ever
// written by the browser (on delete); MCP tools just pass them through
// unchanged so a deletion made in the app doesn't get silently dropped by
// the next MCP-driven edit.
async function loadStore(env) {
  const stored = await env.VAULT_KV.get("vault");
  if (!stored) return { projects: [], tombstones: [] };
  try {
    const parsed = JSON.parse(stored);
    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects.map(normalizeProject) : [],
      tombstones: Array.isArray(parsed.tombstones) ? parsed.tombstones : []
    };
  } catch {
    return { projects: [], tombstones: [] };
  }
}

async function saveStore(env, projects, tombstones) {
  await env.VAULT_KV.put("vault", JSON.stringify({
    version: STORE_VERSION,
    savedAt: Date.now(),
    projects,
    tombstones: tombstones || []
  }));
}

// Case-insensitive substring match on title. Returns { project } or { error } —
// tools surface the error as text so the caller can ask a clarifying question
// instead of silently guessing which project was meant.
function findProject(projects, title) {
  const needle = title.trim().toLowerCase();
  const exact = projects.find(p => p.title.toLowerCase() === needle);
  if (exact) return { project: exact };
  const matches = projects.filter(p => p.title.toLowerCase().includes(needle));
  if (matches.length === 1) return { project: matches[0] };
  if (matches.length > 1) {
    return { error: `Multiple projects match "${title}": ${matches.map(p => p.title).join(", ")}. Ask which one.` };
  }
  return { error: `No project found matching "${title}".` };
}

function summarize(p) {
  const progress = p.mode === "stepped" && p.steps.length
    ? `${p.steps.filter(s => s.done).length}/${p.steps.length} steps`
    : p.mode === "simple" && p.workedCount
    ? `worked on ${p.workedCount}x`
    : "not started";
  const last = p.lastTouched ? new Date(p.lastTouched).toISOString().slice(0, 10) : "never";
  return `"${p.title}" [${p.status}, ${p.energy} energy, ${p.mode}] — ${progress}, last touched ${last}`;
}

function text(str) {
  return { content: [{ type: "text", text: str }] };
}

function createServer(env) {
  const server = new McpServer({ name: "vault-mcp", version: "1.0.0" });

  server.tool(
    "list_projects",
    "List all projects in The Vault, including finished ones, with status and progress.",
    {},
    async () => {
      const { projects } = await loadStore(env);
      if (!projects.length) return text("The Vault is empty — no projects yet.");
      const active = projects.filter(p => p.status !== "finished");
      const finished = projects.filter(p => p.status === "finished");
      const lines = [
        ...active.map(summarize),
        ...(finished.length ? ["", "Finished:", ...finished.map(summarize)] : [])
      ];
      return text(lines.join("\n"));
    }
  );

  server.tool(
    "get_project",
    "Get full details on one project by title (fuzzy match) — description, steps, recent logs.",
    { title: z.string().describe("The project's title, or part of it") },
    async ({ title }) => {
      const { projects } = await loadStore(env);
      const { project, error } = findProject(projects, title);
      if (error) return text(error);
      const stepLines = project.steps.length
        ? project.steps.map(s => `  ${s.done ? "[x]" : "[ ]"} ${s.text}`).join("\n")
        : "  (no steps)";
      const logLines = project.logs.length
        ? project.logs.slice(0, 5).map(l => `  ${new Date(l.ts).toISOString().slice(0, 10)}: ${l.note}`).join("\n")
        : "  (no logs yet)";
      return text(
        `${summarize(project)}\n${project.desc ? project.desc + "\n" : ""}\nSteps:\n${stepLines}\n\nRecent logs:\n${logLines}`
      );
    }
  );

  server.tool(
    "add_project",
    "Add a new project to The Vault.",
    {
      title: z.string().describe("Project title"),
      desc: z.string().optional().describe("Short description"),
      energy: z.enum(ENERGIES).optional().describe("Energy it needs — default medium"),
      mode: z.enum(["simple", "stepped"]).optional().describe("'simple' for open-ended, 'stepped' for a checklist — default simple")
    },
    async ({ title, desc, energy, mode }) => {
      const { projects, tombstones } = await loadStore(env);
      // New projects go to the top of the manual order: pos sorts ascending,
      // so take a spot below the current minimum (mirrors the app's own
      // addProject). Projects without a pos yet are simply ignored here —
      // the app assigns them positions on its next load.
      const positions = projects.map(p => p.pos).filter(n => typeof n === "number");
      const topPos = (positions.length ? Math.min(...positions) : 1000) - 1000;
      const project = normalizeProject({ title, desc, energy, mode, created: Date.now(), pos: topPos });
      await saveStore(env, [project, ...projects], tombstones);
      return text(`Added "${project.title}" to the Vault.`);
    }
  );

  server.tool(
    "log_progress",
    "Add a progress log note to a project — use when the user mentions working on something.",
    {
      title: z.string().describe("The project's title, or part of it"),
      note: z.string().describe("What was done")
    },
    async ({ title, note }) => {
      const { projects, tombstones } = await loadStore(env);
      const { project, error } = findProject(projects, title);
      if (error) return text(error);
      const updated = projects.map(p => p.id === project.id ? {
        ...p,
        updatedAt: Date.now(),
        lastTouched: Date.now(),
        status: p.status === "idea" || p.status === "paused" ? "active" : p.status,
        logs: [{ id: uid(), note, ts: Date.now() }, ...p.logs]
      } : p);
      await saveStore(env, updated, tombstones);
      return text(`Logged on "${project.title}": ${note}`);
    }
  );

  server.tool(
    "touch_project",
    "Mark a project as picked up / touched today, without adding a log note.",
    { title: z.string().describe("The project's title, or part of it") },
    async ({ title }) => {
      const { projects, tombstones } = await loadStore(env);
      const { project, error } = findProject(projects, title);
      if (error) return text(error);
      const updated = projects.map(p => p.id === project.id ? {
        ...p,
        updatedAt: Date.now(),
        lastTouched: Date.now(),
        status: p.status === "idea" || p.status === "paused" ? "active" : p.status
      } : p);
      await saveStore(env, updated, tombstones);
      return text(`Marked "${project.title}" as touched today.`);
    }
  );

  server.tool(
    "add_step",
    "Add a checklist step to a project. Switches the project to 'stepped' mode if it wasn't already.",
    {
      title: z.string().describe("The project's title, or part of it"),
      text: z.string().describe("The step text")
    },
    async ({ title, text: stepText }) => {
      const { projects, tombstones } = await loadStore(env);
      const { project, error } = findProject(projects, title);
      if (error) return text(error);
      const updated = projects.map(p => p.id === project.id ? {
        ...p,
        mode: "stepped",
        updatedAt: Date.now(),
        lastTouched: Date.now(),
        status: p.status === "idea" || p.status === "paused" ? "active" : p.status,
        steps: [...p.steps, { id: uid(), text: stepText, done: false }]
      } : p);
      await saveStore(env, updated, tombstones);
      return text(`Added step "${stepText}" to "${project.title}".`);
    }
  );

  server.tool(
    "toggle_step",
    "Check or uncheck a step on a project by matching its text.",
    {
      title: z.string().describe("The project's title, or part of it"),
      step_text: z.string().describe("The step's text, or part of it")
    },
    async ({ title, step_text }) => {
      const { projects, tombstones } = await loadStore(env);
      const { project, error } = findProject(projects, title);
      if (error) return text(error);
      const needle = step_text.trim().toLowerCase();
      const matches = project.steps.filter(s => s.text.toLowerCase().includes(needle));
      if (matches.length !== 1) {
        return text(matches.length === 0
          ? `No step matching "${step_text}" on "${project.title}".`
          : `Multiple steps match "${step_text}" on "${project.title}": ${matches.map(s => s.text).join(", ")}.`);
      }
      const step = matches[0];
      const newDone = !step.done;
      const updated = projects.map(p => p.id === project.id ? {
        ...p,
        updatedAt: Date.now(),
        lastTouched: Date.now(),
        status: p.status === "idea" || p.status === "paused" ? "active" : p.status,
        steps: p.steps.map(s => s.id === step.id ? { ...s, done: newDone } : s)
      } : p);
      await saveStore(env, updated, tombstones);
      const finalProject = updated.find(p => p.id === project.id);
      const doneCount = finalProject.steps.filter(s => s.done).length;
      const allDone = doneCount === finalProject.steps.length;
      return text(
        `${newDone ? "Checked" : "Unchecked"} "${step.text}" on "${project.title}" (${doneCount}/${finalProject.steps.length} steps).` +
        (allDone ? " Every step is done — consider marking it finished." : "")
      );
    }
  );

  server.tool(
    "finish_project",
    "Mark a project as finished.",
    { title: z.string().describe("The project's title, or part of it") },
    async ({ title }) => {
      const { projects, tombstones } = await loadStore(env);
      const { project, error } = findProject(projects, title);
      if (error) return text(error);
      const updated = projects.map(p => p.id === project.id ? {
        ...p,
        status: "finished",
        updatedAt: Date.now(),
        lastTouched: Date.now()
      } : p);
      await saveStore(env, updated, tombstones);
      return text(`Finished "${project.title}". Time to celebrate.`);
    }
  );

  return server;
}

async function checkMcpAuth(request, env) {
  if (!env.AUTH_TOKEN) return json({ error: "Server misconfigured: AUTH_TOKEN not set" }, 500);
  if (!(await authorized(request, env))) return json({ error: "Unauthorized" }, 401);
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (url.pathname === "/mcp" || url.pathname === "/sse") {
      const authResponse = await checkMcpAuth(request, env);
      if (authResponse) return authResponse;
      const server = createServer(env);
      const handler = createMcpHandler(server);
      try {
        return await handler(request, env, ctx);
      } catch (err) {
        return json({ error: "Internal error", detail: String(err && err.message || err) }, 500);
      }
    }

    if (url.pathname !== "/vault") {
      return json({ error: "Not found" }, 404);
    }

    if (!(await authorized(request, env))) {
      return json({ error: "Unauthorized" }, 401);
    }

    if (request.method === "GET") {
      const stored = await env.VAULT_KV.get("vault");
      return stored
        ? new Response(stored, { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } })
        : json(null);
    }

    if (request.method === "PUT") {
      const body = await request.text();
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        return json({ error: "Body must be valid JSON" }, 400);
      }
      if (!isValidVaultPayload(parsed)) {
        return json({ error: "Body must be a vault object with a projects array" }, 400);
      }
      await env.VAULT_KV.put("vault", body); // store the raw text — byte-identical to what the client sent
      return json({ ok: true });
    }

    return json({ error: "Method not allowed" }, 405);
  }
};
