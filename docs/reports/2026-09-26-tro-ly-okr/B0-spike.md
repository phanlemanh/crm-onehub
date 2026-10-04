# B0 — app eve thứ hai chạy cạnh app thứ nhất (giả định 5)

Đo 30/09 trên cây `friendly-liskov-8d4458`, eve 0.29.4, bun 1.3.10. Kết quả: **xanh** — luật dừng không kích hoạt.

- **Lệnh dựng:** `bunx turbo run build --filter=agent-okr` — 2 task xanh (`@crm/db#build`, `agent-okr#build`), ra `apps/agent-okr/.output`; `.eve/agent-summary.json` liệt kê hai kênh `eve` và `suc-khoe` (`GET /health`). `@crm/db` (Prisma qua `@prisma/adapter-pg`, không có engine nhị phân) và `@crm/ai-okr` gói được vào `.output/server/_libs`.
- **Giây khởi động (`eve dev --no-ui`, tới khi `/eve/v1/health` trả 200):** `apps/agent-okr` 1,9 s; `apps/agent` 10,7 s, khởi động sau, trong khi app thứ nhất vẫn chạy.
- **Cổng:** `apps/agent-okr` 55663, `apps/agent` 55672 (cổng tự do do test lấy). Mỗi app ghi `.eve/dev-server-state.v1.json` dưới gốc app của chính nó, mỗi bản trỏ đúng cổng của mình. `GET /health` trả `{"cay":"friendly_liskov_8d4458"}` ở `apps/agent-okr` và 404 ở `apps/agent`.

Cũng đã thấy: bản dựng chạy bằng `bun scripts/start.ts` (`eve start`, `OKR_AGENT_PORT` là cổng tự do) trả `/health` 200 sau 0,9 s. Với `auth: []`, `GET /eve/v1/info` và `POST /eve/v1/session` trả 401. Khi `DATABASE_URL` trỏ vào cổng chết, log in «[agent-okr] chưa nối được kho: … Can't reach database server», nghĩa là `agent.ts` được nạp lúc khởi động và `@crm/db` thật sự gọi tới kho.
