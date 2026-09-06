## Trong hợp đồng

### 1. Rang file trượt `lint:slop` (anti-slop/no-runtime-typeof) — pre-push sẽ chặn
file: `apps/agent/rang/khoa-lo-giu-tran.rang.ts:93`
severity: high
source: conventions
AC: AC-8
detail: `typed()` dùng `typeof value === "string"` để đoán tham số từ Prisma query event. Chạy `bun run lint:slop` ở gốc → `Found 0 warnings and 1 error`, exit 1 (đã chạy thật trên worktree). Tệp nằm ở `apps/agent/rang/` nên KHÔNG rơi vào override `**/test/**` / `**/*.spec.ts` của `.oxlintrc.json` — anti-slop áp đủ luật. `pre-push` chạy `check-types`, `lint`, `lint:slop`, `test` (CLAUDE.md) nên nhánh này không đẩy được nếu không `--no-verify`. Theo luật 'Parse at the boundary': `event.params` là JSON string từ Prisma → parse bằng Zod schema (mảng union string|number|Date-string) ngay lúc bắt event, thay vì `JSON.parse` thành `unknown[]` rồi `typeof` ở hạ nguồn. Hoặc thêm `**/rang/**` vào override — nhưng đó là quyết định cần ghi vào sổ.

### 2. Hình dạng 3 + 4: chân tai-lieu assert 'chuỗi có mặt' trong khi AC-9 hứa QUAN HỆ vị trí, và từ `claimDue` được thoả bởi chính dòng neo
file: `_acceptance/khoa-lo-giu-tran/rang.sh:56`
severity: medium
source: measurement
AC: AC-9
detail: AC-9/E12 hứa: một đoạn nêu cả `claimDue`, `retireExhausted`, `MATERIALIZED` đứng NGAY SAU luật 'claimDue sorts what it claims'. `doc_rule` (dòng 54-61) dùng awk lấy từ dòng neo tới `### ` kế tiếp rồi grep 3 từ trong toàn khối. (a) Khối bắt đầu bằng chính dòng neo `**\`claimDue\` sorts what it claims**`, nên grep `claimDue` (dòng 58-59) luôn xanh dù đoạn mới không nhắc `claimDue` — assert này tautological. (b) Quan hệ 'ngay sau' không được đo: MATERIALIZED/retireExhausted nằm ở bất kỳ đoạn nào trước heading kế tiếp đều xanh. (c) Chiều đỏ (dòng 131-133) chỉ đột biến `MATERIALIZED`; hai từ còn lại không có đối chứng dương/âm, và stdout của doc_rule bị nuốt nên không ghim thông điệp 'đoạn luật thiếu MATERIALIZED'. Kết quả: phép đo không phân biệt được 'có đoạn luật mới đúng chỗ' với 'section Two lanes có chứa ba từ rời rạc'.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Biến môi trường mới `KHOA_LO_RANG` không được khai ở `.env.example` hay bảng Tests của `docs/agent.md`**
  Người dùng thấy gì: Người tự chạy bộ kiểm này bằng tay có thể thấy một số bước bị bỏ qua mà không rõ vì sao.
  file: `apps/agent/rang/khoa-lo-giu-tran.rang.ts:15`
  severity: low
  Đề xuất: known-limits

- **Tám executor mới trong `_acceptance/config.yaml` không đặt trong ngoặc kép như mọi entry hiện có**
  Người dùng thấy gì: Không ảnh hưởng người dùng sản phẩm; chỉ là khác kiểu viết trong một tệp cấu hình nội bộ.
  file: `_acceptance/config.yaml:109`
  severity: low
  Đề xuất: known-limits

- **rang.sh prepare_db lặng lẽ rơi về DB test chung khi không viết lại được tên DB**
  Người dùng thấy gì: Nếu việc tách kho dữ liệu kiểm tra thất bại âm thầm, dữ liệu của các bước kiểm có thể dùng chung một chỗ và bị xoá nhầm lẫn nhau.
  file: `_acceptance/khoa-lo-giu-tran/rang.sh:26`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
