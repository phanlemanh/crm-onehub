# Phá-thử — tac-nhan-model-rieng

Mỗi lượt phá chạy trên tệp đã commit, rồi `git checkout -- <tệp>`.

| Lượt | Commit gốc | Phá gì | Lệnh | Kết quả |
|---|---|---|---|---|
| E1 | 62045fac | `finish_run.ts` đặt lại `z.record(z.string(), z.json())` | `bun test test/khuon-di-dong.spec.ts -t khuon-di-dong` | đỏ: «khuon co vong tham chieu: …/agent_runner/tools/finish_run.ts» · 2 pass 1 fail |
| E3 | 62045fac | `ketQuaLuot` thành `z.record(z.string(), z.unknown())` | `bun test test/khuon-di-dong.spec.ts -t ket-qua-phang` | đỏ: «ket qua long phai bi tu choi» · 2 pass 2 fail |
| E6 | 889572ec | `agent_runner/agent.ts` quay về đọc `run.version.modelId` từ DB | `bun test test/model-theo-vai.integration.spec.ts -t doi-sau-khi-dung` | đỏ: «luot moi phai chay model cua Cai dat», vi phạm `subagents/agent_runner/agent.ts` · 2 pass 1 fail |
| E7 | 889572ec | `agent_builder/agent.ts` gọi thẳng `readAgentModel` | `bun test test/model-theo-vai.integration.spec.ts -t bon-phien` | đỏ ở kiểm «moi phien qua modelTheoVai» (dòng 326) |
| E4 | b7ae81eb | bỏ kiểm `isError` (`z.boolean().optional()`) | `bun test test/dong-luot-tac-nhan.integration.spec.ts -t bao-loi` | đỏ: «chi loi cua bo chay moi dong luot» ở ô đối chứng · 3 pass 1 fail |
| E4 | 5599a73a | hook rỗng (không xử lý `action.result`) | cùng lệnh | đỏ: «bo chay bao loi phai dong luot ngay» ở ô chính và ma trận · 2 pass 2 fail |
| E5 | 5599a73a | bỏ nhánh `result === null` trong `choKetLuot` | `bun test test/dong-luot-tac-nhan.integration.spec.ts -t chua-nop` | đỏ: «chua nop ket qua phai la Hong» · 2 pass 1 fail |
| E2 | (Task 4) | `--khuon-cu`: ô `result` của `finish_run` đặt lại `z.record(z.string(), z.json())`, gọi Google | `bun _acceptance/tac-nhan-model-rieng/rang/goi-that.ts --khuon-cu` | «khuon-cu: google tu choi nhu mong doi», mã 3 |
| E2 | (Task 4) | chạy từ thư mục không có `.env`, không khoá | `env -u AI_GATEWAY_API_KEY bun …/goi-that.ts` | «thieu AI_GATEWAY_API_KEY», mã 2 |

Lượt xanh của E2 (khuôn mới): ba dòng `ok` cho `google/gemini-3.8-flash`, `zai/glm-5.2-fast`, `openai/gpt-5-mini`, mã 0. Tiền bốn lượt gọi: $0,0054 (khoá chung, 4,63543 → 4,64082).
