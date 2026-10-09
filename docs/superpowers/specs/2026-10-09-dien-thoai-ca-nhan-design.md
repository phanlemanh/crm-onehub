# Số điện thoại là trường chính của cá nhân — design (DT1 `dien-thoai-ca-nhan`)

Ngày 2026-10-09 · làn P6 đợt sau-14-10 · hạng T2 · Cổng Đáng `build` 2026-10-09T00:01:52Z.

## Bối cảnh

Anh báo 09/10: form «Thêm cá nhân» trong tab Cá nhân của công ty không có ô Điện thoại. Ở VN số điện thoại
là trường chính để nhận diện và liên hệ một người. Kho đã có `Contact.phone` và API tạo/sửa đã nhận `phone`,
nên thiếu nằm ở giao diện, tìm kiếm và chống trùng. Soát toàn kho: `_acceptance/dien-thoai-ca-nhan/coverage-scan.md`.

Anh chọn A cho chống trùng: chuẩn hoá về `+84…` và chặn trùng như email.

## Thiết kế

### Một mô-đun số điện thoại dùng chung — `packages/validation/src/so-dien-thoai.ts`

Hàm thuần, không phụ thuộc server, nên app (client) và API dùng cùng một luật:

- `docSoDienThoai(raw)` → `{ kind: "rong" } | { kind: "ok"; so: string } | { kind: "sai" }`.
  Bỏ dấu cách, chấm, gạch, ngoặc. Rồi:
  - `0` + 9–10 chữ số → `+84` + phần sau số 0 (di động 10 chữ số, cố định 11 chữ số).
  - `84` + 9–10 chữ số (không dấu cộng) → `+84…`.
  - `+84` + 9–10 chữ số → giữ.
  - `+` + mã nước khác + tổng 8–15 chữ số (trần E.164) → giữ `+<chữ số>`.
  - Còn lại (có chữ, quá ngắn, quá dài) → `sai`. Chỉ khoảng trắng → `rong`.
- `hienThiSoDienThoai(raw)` → đọc qua `docSoDienThoai` trước, rồi số VN về dạng quốc nội có nhóm: di động
  `0901 234 567` (kể cả số thô cũ `0901.234.567`), cố định `028 3812 3456`; số nước ngoài `+…`; chuỗi không
  đọc được trả nguyên văn.
- `soQuocNoiDeTim(term)` → mảnh chữ số đã bỏ đầu `0`/`84`/`+84` để tìm, hoặc `null` khi chuỗi có chữ
  hay ít hơn ngưỡng chữ số (khi đó không tìm theo số — gõ «12» không lọc ra mọi người).
- Hằng số gom trong `SO_DIEN_THOAI` (độ dài, ngưỡng tìm) — một chỗ, `as const`.

### Tìm và chống trùng trên dữ liệu cũ — `packages/db/src/so-dien-thoai.ts`

Dữ liệu cũ có số lưu thô (`0901.234.567`, từ listing). Không backfill (migration là đường T3). Thay vào đó
một truy vấn SQL so trên «số quốc nội» tính tại chỗ:
`regexp_replace(phone, '[^0-9]', '', 'g')`, rồi bỏ đầu `84` (khi đủ 11–12 chữ số) hoặc `0` (khi đủ 10–11).
Hai hàm, dùng ở ba nơi (API contacts, API ⌘K, agent Kara):

- `caNhanCoSo(db, manh)` → id cá nhân có số quốc nội CHỨA mảnh (tìm).
- `caNhanTrungSo(db, so, { boQua })` → cá nhân đang hoạt động (`archivedAt IS NULL`) có số quốc nội BẰNG
  số quốc nội của `so`, trừ `boQua` (chống trùng).

### API (`apps/api/src/contacts`, `apps/api/src/search`)

- `contactCreateInput.phone` / `contactUpdateInput.phone`: thêm kiểm `docSoDienThoai(...).kind !== "sai"`,
  câu lỗi «That is not a phone number.» (theo nếp câu lỗi API của kho).
- `create`: chuẩn hoá; có số → `caNhanTrungSo` → `ConflictException("<tên> already uses <số hiện>.")`
  như email. `update`: chỉ kiểm trùng khi có gửi `phone` VÀ số quốc nội khác số hiện có của chính người đó
  (`boQua = id`) — người đã trùng sẵn trong dữ liệu cũ vẫn sửa được trường khác; đổi về rỗng thì lưu `null`.
- `contactRowOutput` thêm `phone`; `list` chọn `phone`.
- `searchFilter` và `search.service.ts` thêm nhánh `id IN caNhanCoSo(...)` khi `soQuocNoiDeTim` khác `null`.
  Dòng phụ ⌘K: công ty, không có thì số (dạng hiện), không có thì email.
- Chặn trùng ở tầng ứng dụng nên hai lần tạo đồng thời cùng số vẫn có thể lọt — chấp nhận (không ràng buộc
  duy nhất ở cơ sở dữ liệu: cần migration, đụng dữ liệu cũ đã trùng).

### Agent (`apps/agent/agent/lib/lookup.ts`)

Tìm cá nhân của Kara thêm nhánh theo số (cùng `caNhanCoSo`). Kết quả KHÔNG thêm trường số — Kara tìm được
người qua số nhưng không đọc số ra (luật `data-boundaries.md`).

### App

- Lỗi trùng: toast hiện câu của API, form giữ nguyên chữ đã gõ.
- `QuickAddContact` và `CreateContactSheet`: thêm ô Điện thoại ngay sau Họ/Tên, trước Email.
  `Input type="tel" inputMode="tel"`. Gửi đi: kiểm bằng `docSoDienThoai` trước; `sai` → không gọi API,
  `FieldError` cạnh ô «Số điện thoại chưa đúng — ví dụ 0901 234 567», con trỏ về ô.
- Bảng Cá nhân: cột «Điện thoại» ngay sau Tên (`tabular-nums`, `translate="no"`, dạng hiện), ẩn dưới `md`
  như cột Email.
- Ngăn chi tiết cá nhân: ô thống kê và ô sửa hiện dạng `0901 234 567`; liên kết `tel:` dùng dạng `+84…`.
- Ô chọn môi giới (30 ngày đầu): gợi ý = số (dạng hiện), không có số thì email. Tìm theo số đi qua
  `contacts.list` nên có sẵn.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: tab Cá nhân của công ty → «Thêm cá nhân» → gõ Tên + Điện thoại `0901 234 567` → «Thêm cá nhân» → toast «Đã thêm …», dòng mới trong tab (điểm ra: tab Cá nhân).
- Suôn sẻ (tìm): bảng Cá nhân → gõ `0901234567` hay `+84 901…` vào ô tìm → còn đúng người đó.
- Biên: chỉ có Tên, không số → vẫn thêm được; số nước ngoài `+65…` → lưu nguyên, hiện nguyên.
- Lỗi & quay lại: số sai → câu lỗi đỏ ngay dưới ô, con trỏ về ô, chưa gửi gì; số đã thuộc người khác → toast lỗi nêu tên người đó, form giữ nguyên chữ đã gõ để sửa.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Form «Thêm cá nhân» (tab Cá nhân của công ty) | thêm một người vào công ty này | nút «Thêm cá nhân» / dòng mới trong tab |
| Sheet «Cá nhân mới» (trang Cá nhân) | thêm một người, chọn công ty tuỳ ý | nút «Cá nhân mới» / bảng Cá nhân |
| Bảng Cá nhân | tìm và mở một người | thanh bên / ngăn chi tiết |
| Ngăn chi tiết cá nhân | xem, sửa một người | dòng bảng, ⌘K / đóng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-them-trong | Form «Thêm cá nhân» | ô Điện thoại trống, nút thêm tắt tới khi có Tên | gõ Tên (số tuỳ ý) |
| ST-them-sai | Form «Thêm cá nhân» / Sheet «Cá nhân mới» | câu lỗi dưới ô Điện thoại, ô viền lỗi, con trỏ ở ô | sửa số hoặc xoá trống |
| ST-them-trung | Form «Thêm cá nhân» / Sheet «Cá nhân mới» | toast lỗi nêu tên người đang giữ số | sửa số, hoặc mở người kia |
| ST-them-dang-gui | Form «Thêm cá nhân» | nút có spinner, tắt | chờ |
| ST-bang-khong-so | Bảng Cá nhân | ô Điện thoại trống chuẩn (`EmptyCellValue`) | mở người để thêm số |
| ST-tim-khong-ra | Bảng Cá nhân | trạng thái rỗng sẵn có của bảng | sửa chữ tìm |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô Điện thoại: `type="tel"`, `inputMode="tel"`, không chặn dán, không giới hạn ký tự lúc gõ (kiểm lúc gửi).
- Kiểm lúc gửi, không kiểm từng phím. Số sai: không gọi API, con trỏ về ô.
- Thứ tự Tab: Tên → Họ → Điện thoại → Email → Chức danh.
- Khổ < 640 px: lưới một cột, thứ tự giữ nguyên; cột Điện thoại của bảng ẩn dưới `md` như cột Email.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Field`, `FieldLabel`, `FieldError`, `Input` (`@crm/ui`) | dùng | form tạo đã dựng bằng chúng |
| Cột `DataTable` của bảng Cá nhân | dùng | thêm một cột theo khuôn cột Email |
| `EmptyCellValue` | dùng | ô trống chuẩn của kho |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi khuôn — bảng Cá nhân + ngăn chi tiết đã là danh-sách-chi-tiết; vòng này chỉ thêm một ô và một cột vào màn có sẵn, nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Chuẩn UI đã nạp

`web-design-guidelines` (khai ở `feature_loop.ui_standards_skill`): ô nhập đúng `type`/`inputmode` (tel),
không chặn dán, nhãn bấm được, lỗi hiện ngay cạnh ô và đưa con trỏ về ô lỗi đầu, cột số dùng
`tabular-nums`, trạng thái rỗng không vỡ. `docs/design.md`: chỉ thành phần `@crm/ui`, không `className`
đổi màu/góc; câu lỗi cạnh ô dùng `FieldError`.

## Kiểm thử

- Hàm thuần: ma trận dạng số → kết quả (`packages/validation/test/so-dien-thoai.spec.ts`).
- API: tạo/sửa/trùng/tìm trên CSDL thử (`apps/api/test/dien-thoai-ca-nhan.spec.ts`), có số cũ lưu thô.
- Agent: `lookup` tìm theo số và không trả số.
- DOM: hai form gửi `phone`, chặn số sai trước khi gọi API.
- Màn thật: một lượt đo màn chụp form và bảng ở 1440 và 375.
