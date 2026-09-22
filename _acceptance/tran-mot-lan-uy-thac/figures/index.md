# Hình tại điểm quyết định — tran-mot-lan-uy-thac

Ngưỡng N5: cần hình khi điểm quyết định có từ **ba bước nối tiếp** hoặc từ
**hai nhánh rẽ**.

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Nền cây: cắt từ `41ba0a7` thay vì `onehub` | 1 nhánh rẽ (3 lựa chọn), 0 chuỗi | dưới ngưỡng: 1 |
| Một câu ném chung thay vì hai câu theo chiều | 1 nhánh rẽ (3 lựa chọn) | dưới ngưỡng: 1 |
| Đo bằng `ContextContainer` thật, chạy chính hook | 6 bước nối tiếp | **cần hình** → `chuoi-do.html` |
| Giữ hai câu dặn `not_authorized` trong `task.ts` | 1 nhánh rẽ | dưới ngưỡng: 1 |
| `descope` đường-đo · `descope` đặc-tả-UX | 0 | dưới ngưỡng: 0 |
| Gỡ sàn dân số khỏi AC-8 | 1 nhánh rẽ | dưới ngưỡng: 1 |
| Không dựng eval xuyên lớp cho câu ném | 4 bước nối tiếp + 4 nhánh phân loại | **cần hình** → `duong-cau-nem.html` |
| `revisit`: không ghim số câu dặn `task.ts` bằng eval | 1 nhánh rẽ | dưới ngưỡng: 1 |
| Finding P0 của gap-probe, đẩy lên người quyết | dùng chung hình `duong-cau-nem.html` | **cần hình** |

Không dòng `[GIẢ ĐỊNH]` nào trong Coverage, nên không điểm quyết định nào từ đó.

## Đề bài hình 1 — `chuoi-do.html`

Loại: sơ đồ luồng, một chiều trái sang phải.

Nút — chuỗi đo đi từ bên ghi thật tới lần ném:
`buildPendingInputRequest` → `commandTypeFromAuthorization` →
`builderSessionAttributes` → `ctx` của phiên → `hook.events["actions.requested"]`
→ `builderDelegationState` → ném.

Nhánh phụ vào nút `hook`: `ContextContainer` thật của eve, nạp qua
`require.resolve("eve/package.json")`, đặt vào `AsyncLocalStorage` ở
`Symbol.for("eve.context-storage")`.

Nhãn bằng chữ, đặt ngay tại nút `hook`: đánh dấu **chỗ hở** — bản tại `41ba0a7`
return sớm ở đây khi `commandType` khác `CREATE_AGENT`, nên ba nút sau không
chạy trên lượt không có quyền.

Đánh dấu **chỗ cấm**: một mũi tên đứt nét đi tắt từ `ctx` thẳng tới
`builderDelegationState` (tức gọi hàm thuần, bỏ qua hook) — ghi rõ đây là mã 2,
không phải đường được phép.

AC liên quan: AC-1, AC-3.

## Đề bài hình 2 — `duong-cau-nem.html`

Loại: sơ đồ luồng có nhánh rẽ ở cuối.

Nút: hook ném → `turn.failed` → `crm.ts` đọc
`eveTurnFailure.parse(data).message` → `latestTurnFailure` ở `apps/app` → bốn
nhánh phân loại: `restricted` · `rate-limit` · `credits` · `unknown`.

Nhãn bằng chữ: câu trần **không** khớp ba nhánh đầu; nó rơi vào `unknown` cả
trước lẫn sau vòng. Grep `apps/app` + `apps/api` + `packages` cho **0** chỗ
khớp theo câu trần.

Đánh dấu chỗ eval dừng: ngay sau nút "hook ném" — đó là phạm vi AC-8 đã khai.

AC liên quan: AC-8. Đây là hình cho finding P0 mà người quyết ở Cổng 1.
