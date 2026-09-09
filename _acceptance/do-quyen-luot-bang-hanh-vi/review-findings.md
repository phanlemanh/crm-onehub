# Review Findings — do-quyen-luot-bang-hanh-vi (round 2)

## Trong hợp đồng

- **nguon-ghi.mjs mù với upsert / updateMany / data không phải object literal — cổng AC-3 vẫn xanh khi có chỗ ghi commandType ghim cứng**
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs:78`
  severity: high
  AC: AC-3
  source: bugs
  Chi tiết: khoiData() (dòng 48-62) chỉ nhận chỗ ghi khi đối số 0 là object literal CÓ khoá `data` mà giá trị cũng là object literal; ngoài ra `if (!data) return;` (dòng 78) bỏ qua lặng lẽ, không đếm, không báo. Hệ quả:

  1. `upsert` nằm trong tập VIET (dòng 18) nhưng Prisma upsert có khuôn `{ where, create, update }` — KHÔNG có khoá `data`. Nên mọi upsert đều vô hình, dù chân đo tuyên bố có phủ upsert.
  2. `updateMany` / `createMany` không nằm trong VIET nên cũng vô hình.
  3. `create({ data: payload })` với payload là biến (hoặc `data: { ...payload }`) vô hình.

  Đã dựng cây thử: chép apps/api/src rồi thêm một tệp probe.ts có ba chỗ ghi `commandType: "CREATE_AGENT"` ghim cứng (một upsert, một updateMany, một create với data là biến). Chạy `node rang/nguon-ghi.mjs --goc <cây thử>` → in đúng 3 chỗ ghi cũ, "khop dung danh sach da ghim", thoát 0. Ba chỗ leo thang quyền không xuất hiện ở đâu cả.

  Điều này phá đúng lời hứa của E4 trong evals.yaml: "MA TRAN TOAN PHAN VIET TRUOC, khong phai can duoi" — ma trận không toàn phần, và cái lọt qua chính là dạng nguy hiểm nhất (ghi thẳng CREATE_AGENT). Bốn vecto đột biến của E4 đều đột biến trên dạng `create({ data: {...} })` nên không vecto nào chạm tới điểm mù này.

  Vị trí liên quan trong mã đo: khoiData 48-62, tập VIET dòng 18, nhánh bỏ qua lặng tại dòng 78.
  Vì sao trong hợp đồng: AC-3 tuyên phép đo là ma trận toàn phần các chỗ ghi commandType qua create/update/upsert (kể cả lồng quan hệ); finding chứng minh bằng repro rằng upsert, updateMany và data không phải object literal đều lọt qua hoàn toàn, nên lời hứa toàn phần của chính Then trong AC-3 thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **BuilderAuthRow bắt buộc có `message` nhưng builderSessionAuthFromRow không bao giờ đọc**
  Người dùng thấy gì: Kiểu dữ liệu đầu vào vẫn giữ một trường nội dung tin nhắn dù không dùng để quyết quyền, nên một lượt sửa sau này có thể vô tình đọc lại tin nhắn đó để suy quyền mà không ai nhận ra.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: medium
  Đề xuất: known-limits

- **Hai bộ khung chạy vectơ đột biến bị chép nguyên khối qua 6 tệp rang, dù chung.mjs là module dùng chung của vùng**
  Người dùng thấy gì: Bộ khung đo bị lặp lại giống hệt nhau ở nhiều nơi, nên mỗi lần cần siết chặt phép kiểm phải sửa nhiều chỗ cùng lúc và dễ sửa sót, khiến các phép đo lệch nhau dần theo thời gian.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/mang-theo-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **giuKhoa phá khoá của tiến trình còn sống sau 120s, rồi chủ cũ xoá khoá của chủ mới**
  Người dùng thấy gì: Khi nhiều phiên làm việc cùng lúc trên kho dùng chung, cơ chế khoá có thể tự phá khoá của một phiên khác đang chạy rồi xoá luôn khoá mới, khiến hai phiên đụng nhau trên cùng thao tác quản lý cây làm việc.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Nhánh regex `khong\s+còn mô tả` trong vet-ho-so-cu.mjs là nhánh chết**
  Người dùng thấy gì: Một nhánh nhận diện cách viết cũ trong tài liệu không bao giờ khớp với cách viết thực tế đang dùng, nên nếu sau này có ai viết đúng theo dạng đó, phép kiểm sẽ không phát hiện được — dù hiện tại chưa gây ảnh hưởng.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/vet-ho-so-cu.mjs`
  severity: low
  Đề xuất: known-limits

- **Vecto chứng "duoi-select" của E4 rỗng nghĩa — nó đột biến vào một findMany, chỗ mà chân đo không bao giờ đi vào**
  Người dùng thấy gì: Một trong các phép thử dùng để chứng minh máy phân biệt đúng giữa đọc và ghi dữ liệu thực ra không thử đúng chỗ, nên nếu sau này khả năng phân biệt đó bị hỏng, phép đo vẫn báo an toàn trong khi thực tế không còn đúng.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs`
  severity: medium
  Đề xuất: known-limits

- **giuKhoa() phá khoá của tiến trình đang sống rồi tiến trình rời đi lại xoá khoá của người khác**
  Người dùng thấy gì: Khi nhiều phiên làm việc cùng lúc trên kho dùng chung, một phiên có thể phá khoá của phiên khác đang chạy rồi vô tình xoá luôn khoá của phiên thứ ba, khiến cơ chế tránh đụng độ mất tác dụng cho mọi phiên vào sau.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: medium
  Đề xuất: known-limits

- **tu-kiem-khung.mjs sửa tệp nguồn có theo dõi trong cây làm việc thật, khôi phục lại phụ thuộc một finally mà bộ bắt tín hiệu bỏ qua**
  Người dùng thấy gì: Trong lúc đo, công cụ tạm thời sửa vào đúng tệp mã nguồn thật đang dùng chung với người khác, và nếu tiến trình bị ngắt giữa chừng ở đúng thời điểm hiếm, tệp đó có thể bị bỏ quên ở trạng thái đã sửa thay vì được khôi phục.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/tu-kiem-khung.mjs`
  severity: low
  Đề xuất: known-limits

- **Đối chứng dương rỗng (hình dạng 4): vectơ `duoi-select` của E4 rơi ngoài dân số đo, xanh vì lý do sai**
  Người dùng thấy gì: Một trong các phép thử dùng để chứng minh máy phân biệt đúng giữa đọc và ghi dữ liệu thực ra không thử đúng chỗ, nên nếu sau này khả năng phân biệt đó bị hỏng hoàn toàn, phép đo vẫn báo an toàn trong khi thực tế không còn đúng.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs`
  severity: high
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
