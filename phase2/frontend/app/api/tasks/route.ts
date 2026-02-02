import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 1000,
});

// GET: Fetch All Tasks
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ DB se data mangwate waqt hum naming fix kar rahe hain
    // "dueDate" ko "due_date" keh kar mangwa rahe hain taake frontend confusion na ho
    const { rows } = await pool.query(
      `SELECT
        id, "userId", title, description, completed, priority, tags,
        "dueDate" as due_date,
        "recurring",
        "recurrencePattern",
        "createdAt" as created_at,
        "updatedAt" as updated_at
       FROM "task"
       WHERE "userId" = $1
       ORDER BY "createdAt" DESC`,
      [session.user.id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST: Create Task
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Frontend se jo bhi aye (snake_case ya camelCase), hum handle kar lenge
    const { title, description, priority, tags, due_date, dueDate, recurring, recurrencePattern } = body;

    // Correct value pick karo
    const finalDueDate = dueDate || due_date || null;
    const finalRecurring = recurring || false;
    const finalRecurrencePattern = recurrencePattern || null;
    const finalTags = tags || []; // Agar tags na hon to empty array

    const { rows } = await pool.query(
      `INSERT INTO "task"
       ("userId", title, description, priority, tags, "dueDate", "recurring", "recurrencePattern", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING
        id, "userId", title, description, completed, priority, tags,
        "dueDate" as due_date,
        "recurring",
        "recurrencePattern",
        "createdAt" as created_at,
        "updatedAt" as updated_at`,
      [
        session.user.id,
        title,
        description,
        priority || "medium",
        finalTags,        // ✅ Tags ab save honge!
        finalDueDate,     // ✅ Due Date save hogi!
        finalRecurring,   // ✅ Recurring save hoga!
        finalRecurrencePattern  // ✅ Recurrence pattern save hoga!
      ]
    );

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}