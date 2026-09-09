# Hình tại điểm quyết định — do-quyen-luot-bang-hanh-vi

Kê từ artifact cuối S1: mỗi entry sổ quyết định chờ seal · mỗi chỗ design lệch
spec đã có · mỗi dòng `[GIẢ ĐỊNH]` trong Coverage · mỗi finding gap-probe xử lý
`human-gate1`.

Coverage không có dòng `[GIẢ ĐỊNH]` nào và không có `[CE chưa kiểm chứng]`.
Gap-probe không có finding nào xử lý `human-gate1` — cả năm đều `fixed`.

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-…-20324 — đường B+: client khai, máy chủ và agent không nâng | 3 nhánh rẽ (A · B+ · C) và 6 bước nối tiếp trong chuỗi quyền | **chuoi-quyen** |
| d-…-20598 — bỏ hàm đồng nhất `builderCommandType` | 2 nhánh (giữ / bỏ) | gộp vào **chuoi-quyen** |
| d-…-31001 — tách `builderSessionAuthFromRow` | 2 nhánh (đo từ khối tham số / đo từ hàng) | gộp vào **chuoi-quyen** |
| d-…-21009 — bỏ phép đo tích hợp chạm DB | 2 nhánh | gộp vào **chuoi-quyen** (vẽ đúng chỗ biên DB nằm) |
| d-…-21146 — giữ tier T2 dù là chuỗi quyền | 2 nhánh (giữ T2 / nâng T3) | gộp vào **chuoi-quyen** (đánh dấu đường nào nằm trong `t3_paths`) |
| d-…-20461 — sàn dân số đổi mệnh đề sang bất biến nguồn ghi | 3 nhánh (giữ mệnh đề + AST rộng · đổi mệnh đề · bỏ hẳn sàn) | **san-nguon-ghi** |
| d-…-20735 + d-…-31138 — không viết lại hồ sơ cũ, và AC-9 sinh ra từ đó | 3 nhánh xử hồ sơ cũ, rồi 4 bước nối tiếp tới `recheck: strict` | **ho-so-cu** |
| d-…-20872 — bỏ đặc-tả-UX | dưới ngưỡng: 0 nhánh rẽ (feature không chạm surface web-UI nào) | — |

## Đề bài từng hình

### chuoi-quyen

Sơ đồ luồng, một chiều trái→phải. Sáu nút nối tiếp: **ô soạn / nút Tạo tác
nhân** → **biên tRPC (`builderPromptShape`, zod enum)** → **hàng
`AgentConversationSubmission`** → **`builderSessionAuthFromRow`** → **thuộc
tính phiên** → **`builderTurnApproval`**. Nhánh thứ hai vào cùng hàng:
**`respondToQuestion`** với nhãn `commandTypeFromAuthorization(câu hỏi treo)`.
Đánh dấu: nút nào là **lời khai của client**, nút nào **máy chủ tự suy**, nút
nào **agent chỉ đọc**. Vẽ ba đường đã cân bằng ba màu chú thích: **A** cắt ở
biên tRPC (tách điểm vào), **C** cắt ở hàng (cấm nâng giữa hội thoại), **B+**
không cắt mà chỉ **khai và đo**. Vẽ chỗ `builderCommandType` từng đứng, gạch
chéo. Khoanh vùng `t3_paths` hiện hành và cho thấy `conversations` nằm ngoài
vùng ấy. Ghi rõ biên DB nằm ở đâu để thấy phép đo AC-1 dừng trước nó.
AC liên quan: AC-1, AC-2, AC-6.

### san-nguon-ghi

Sơ đồ tập hợp / cây quyết định. Trung tâm: **dân số** = mọi thuộc tính
`commandType` trong object `data` của Prisma `create`/`update`/`upsert` trong
`apps/api/src`, **kể cả object `create` lồng của quan hệ**. Hai nhánh **hợp lệ**
tô đậm: `<x>.commandType` (lời khai đã parse ở biên) và
`commandTypeFromAuthorization(...)`. Nhánh **loại khỏi dân số** vẽ mờ:
`commandType` dưới `select` · `where` · `orderBy` · `include`. Nhánh **đỏ**:
chuỗi ghim cứng · biến trung gian · hàm mới. Cạnh mỗi nhánh đỏ ghi tên vectơ
tương ứng: `ghim-cung`, `bien-trung-gian`, `quan-he-long`, `duoi-select` (vectơ
cuối là vectơ **phải vẫn xanh**, vẽ khác màu). Ghi rõ đây là **ma trận toàn
phần**: tập tìm được phải bằng đúng danh sách đã ghim, thừa hay thiếu đều đỏ.
AC liên quan: AC-3.

### ho-so-cu

Sơ đồ hai khối cạnh nhau cộng một chuỗi hệ quả. Khối trái: hồ sơ
`quyen-luot-mang-theo` chia hai vùng — **đóng băng** (AC-5 và khối eval E5,
kiểm bằng sha256) và **được động** (`## Notes`). Khối phải: mã —
`apps/agent/test/quyen-luot.spec.ts`, khối `describe("suy-dien")` giữ nguyên
tên nhưng thay ruột. Nối hai khối bằng chuỗi bốn bước: `recheck: strict` →
lệnh `ql_khong_suy_dien` lọc `-t suy-dien` → bài đầu của khối gọi
`builderCommandType` → hàm ấy bị AC-2 xoá. Ghi ba đường đã cân và đường đã
chọn (giữ tên khối, thay ruột), cùng cái giá phải nói ra: `expected` đã ghim của
E5 cũ không còn mô tả thứ lệnh của nó chạy.
AC liên quan: AC-5, AC-8, AC-9.
