
"use client";

import { useState } from "react";

export default function Home() {
  const [projects, setProjects] = useState([
    "日立中国公司常法",
    "佛吉亚常法",
    "上海科创常法"
  ]);

  return (
    <main style={{
      maxWidth: 1100,
      margin: "40px auto",
      padding: 24,
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>Dacheng Timesheet</h1>
      <p>律师团队法律服务工时管理系统</p>

      <h2>项目管理</h2>

      <button onClick={() => {
        const name = prompt("请输入项目名称");
        if (name) setProjects([...projects, name]);
      }}>
        + 创建新项目
      </button>

      <div style={{ marginTop: 24 }}>
        {projects.map((name, index) => (
          <div key={index} style={{
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 8,
            marginBottom: 12
          }}>
            <strong>{name}</strong>
            <p>工时台账 · 待配置</p>
          </div>
        ))}
      </div>
    </main>
  );
}
