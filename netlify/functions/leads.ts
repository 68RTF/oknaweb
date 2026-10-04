import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { leads } from "../../db/schema.js";

const field = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ ok: false, error: "Метод не поддерживается." }, { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Некорректный запрос." }, { status: 400 });
  }

  // Honeypot field: real visitors never fill it in.
  if (field(body.website, 200)) return Response.json({ ok: true });

  const name = field(body.name, 80);
  const contact = field(body.contact, 120);
  if (!name || !contact) {
    return Response.json({ ok: false, error: "Укажите имя и удобный способ связи." }, { status: 400 });
  }

  try {
    await db.insert(leads).values({
      name,
      contact,
      project: field(body.project, 80),
      message: field(body.message, 1200),
    });
  } catch (error) {
    console.error("Failed to save lead", error);
    return Response.json({ ok: false, error: "Сервис временно недоступен. Попробуйте ещё раз." }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 201 });
};

export const config: Config = {
  path: "/api/leads",
};
