
import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../lib/auth";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { error: "请先输入团队密码" },
    { status: 401 }
  );
}

// 获取某个项目的全部工时记录
export async function GET(request) {
  if (!(await isAuthenticated())) return unauthorized();

  try {
    const projectId = new URL(request.url)
      .searchParams.get("project_id");

    if (!projectId) {
      return NextResponse.json(
        { error: "请选择项目" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .eq("project_id", projectId)
      .order("work_date", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(10000);

    if (error) throw error;

    return NextResponse.json({ entries: data });
  } catch {
    return NextResponse.json(
      { error: "工时记录读取失败" },
      { status: 500 }
    );
  }
}

// 新增律师工时记录
export async function POST(request) {
  if (!(await isAuthenticated())) return unauthorized();

  try {
    const body = await request.json();

    if (
      !body.project_id ||
      !body.work_date ||
      !String(body.lawyer_name ?? "").trim() ||
      !String(body.description ?? "").trim()
    ) {
      return NextResponse.json(
        { error: "项目、日期、律师和服务内容不能为空" },
        { status: 400 }
      );
    }

    const workHours = Number(body.work_hours ?? 0);
    const travelHours = Number(body.travel_hours ?? 0);
    const totalHours = Number(
      body.total_hours ?? workHours + travelHours
    );
    const wordCount = Number(body.word_count ?? 0);

    if (
      ![workHours, travelHours, totalHours, wordCount]
        .every(Number.isFinite) ||
      [workHours, travelHours, totalHours, wordCount]
        .some(n => n < 0) ||
      !Number.isInteger(wordCount)
    ) {
      return NextResponse.json(
        { error: "工时和字数必须为有效的非负数字" },
        { status: 400 }
      );
    }

    const entry = {
      project_id: body.project_id,
      work_date: body.work_date,
      work_time: body.work_time ?? null,
      work_hours: workHours,
      travel_hours: travelHours,
      work_location: body.work_location ?? null,
      lawyer_name: String(body.lawyer_name).trim(),
      description: String(body.description).trim(),
      total_hours: totalHours,
      word_count: wordCount
    };

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("time_entries")
      .insert(entry)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { entry: data },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "保存失败，请检查填写内容" },
      { status: 500 }
    );
  }
}
