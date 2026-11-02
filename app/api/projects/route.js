
import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../lib/auth";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 获取所有项目
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: "请先输入团队密码" },
      { status: 401 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ projects: data });
  } catch {
    return NextResponse.json(
      { error: "项目读取失败" },
      { status: 500 }
    );
  }
}

// 创建新项目
export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: "请先输入团队密码" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();

    if (!name || name.length > 200) {
      return NextResponse.json(
        { error: "请输入有效的项目名称" },
        { status: 400 }
      );
    }

    const fields = [
      "client_name",
      "project_type",
      "start_date",
      "end_date",
      "fixed_fee",
      "included_hours",
      "included_words",
      "hourly_rate",
      "overtime_rate",
      "notes"
    ];

    const project = { name };

    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        project[field] = body[field];
      }
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("projects")
      .insert(project)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { project: data },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "创建项目失败，请检查填写内容" },
      { status: 500 }
    );
  }
}
