
export const metadata = {
  title: "Dacheng Timesheet",
  description: "律师团队工时管理系统"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, background: "#f8fafc" }}>
        {children}
      </body>
    </html>
  );
}
