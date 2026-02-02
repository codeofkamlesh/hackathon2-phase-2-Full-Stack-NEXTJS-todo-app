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

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

// 1. PUT: Update Task (FIXED: Added Tags & Safe Date Handling)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // ✅ Extract all possible fields (handle snake_case & camelCase)
    const {
      title,
      description,
      priority,
      tags,
      dueDate,
      due_date,
      recurring,
      recurrencePattern
    } = body;

    // ✅ Safe Values Calculation
    const finalDueDate = dueDate || due_date || null;
    const finalRecurring = recurring !== undefined ? recurring : null;
    const finalRecurrencePattern = recurrencePattern || null;
    const finalTags = tags || []; // Tags ko empty array rakhein agar null ho

    // ✅ SQL Query Update (Added "tags" column)
    const { rows } = await pool.query(
      `UPDATE "task"
       SET
         title = $1,
         description = $2,
         priority = $3,
         tags = $4,
         "dueDate" = $5,
         "recurring" = $6,
         "recurrencePattern" = $7,
         "updatedAt" = NOW()
       WHERE id = $8 AND "userId" = $9
       RETURNING
        id, "userId", title, description, completed, priority, tags,
        "dueDate" as due_date,
        "recurring",
        "recurrencePattern",
        "createdAt" as created_at,
        "updatedAt" as updated_at`,
      [
        title,
        description,
        priority || "medium",
        finalTags,        // ✅ Ab Tags update honge!
        finalDueDate,
        finalRecurring,   // ✅ Recurring update hoga!
        finalRecurrencePattern,  // ✅ Recurrence pattern update hoga!
        params.id,
        session.user.id
      ]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// 2. DELETE: Remove Task
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rows } = await pool.query(
      'DELETE FROM "task" WHERE id = $1 AND "userId" = $2 RETURNING *',
      [params.id, session.user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: params.id });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}

// 3. PATCH: Toggle Completion
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (body.toggle) {
      const { rows } = await pool.query(
        `UPDATE "task"
         SET completed = NOT completed, "updatedAt" = NOW()
         WHERE id = $1 AND "userId" = $2
         RETURNING
          id, "userId", title, description, completed, priority, tags,
          "dueDate" as due_date,
          "recurring",
          "recurrencePattern",
          "createdAt" as created_at,
          "updatedAt" as updated_at`,
        [params.id, session.user.id]
      );

      if (rows.length === 0) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
      return NextResponse.json(rows[0]);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Toggle Error:", error);
    return NextResponse.json({ error: "Failed to toggle task" }, { status: 500 });
  }
}