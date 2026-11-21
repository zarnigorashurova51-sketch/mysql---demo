import { desc } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { guests } from "../../db/schema.ts";

export const config = {
  path: "/api/*",
};

export default async (request: Request) => {
  const url = new URL(request.url);

  if (url.pathname !== "/api/guests") {
    return Response.json({ error: "Topilmadi" }, { status: 404 });
  }

  try {
    if (request.method === "GET") {
      const rows = await db
        .select({ id: guests.id, name: guests.name, createdAt: guests.createdAt })
        .from(guests)
        .orderBy(desc(guests.id))
        .limit(200);
      return Response.json(rows);
    }

    if (request.method === "POST") {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return Response.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
      }
      const name = String((body as { name?: unknown })?.name ?? "").trim().slice(0, 100);
      if (!name) {
        return Response.json({ error: "Ism bo'sh bo'lmasligi kerak" }, { status: 400 });
      }
      const [row] = await db.insert(guests).values({ name }).returning();
      return Response.json(row, { status: 201 });
    }

    return Response.json({ error: "Ruxsat etilmagan metod" }, { status: 405 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server xatosi" }, { status: 500 });
  }
};
