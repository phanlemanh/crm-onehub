# L3 — Cây căn chỉnh có lý do

Hàng L3 của `docs/plan/lo-trinh-okr.json`, câu giao: «Cây căn chỉnh hiện lý do của từng đường nối và lọc được các
đường «Chưa có lý do»». Cổng Đáng ký `build` 12/10. Đứng trên L1 (#348, cột `lyDo`/`canCu`/`lyDoTuKara` và `mucTin`
trong `alignments`); nhánh chồng lên L2 (`duong-ly-do-muc-tieu`, đã ký, chờ gộp) để dùng lại bảng mức tin → nghĩa
mà chủ kho chọn ở L2.

## Vấn đề

Lãnh đạo mở OKR → Theo đơn vị → Cây căn chỉnh thấy ai góp vào KR nào và tiến độ ra sao, nhưng không phân biệt nhánh
có căn cứ với nhánh gắn cho có. Trước buổi review không có cách nào gom nhanh các nhánh cần hỏi lại.

## Thiết kế

### Dữ liệu: lý do nằm trên cạnh, không trên nút

Lý do thuộc về một chỗ nối (mục tiêu con → KR hay mục tiêu đích), không thuộc mục tiêu: một mục tiêu góp hai chỗ thì
có hai lý do (đó là lý do cây có `lapLai`). Đầu ra `okr.cayCanChinh` thêm một danh sách `canh`, mỗi phần tử một chỗ
nối có mặt trong cây: `{ tu, den, lyDo, canCu, lyDoTuKara, mucTin }` — `tu` là id mục tiêu con, `den` là id KR hoặc
mục tiêu đích. Service `okr-xem.service.ts` dựng `canh` từ `alignments` của chính tập mục tiêu mà cây đã đọc
(`mucTieuCuaCay`, nên quyền xem đã lọc như cây). Hàm dựng cây `dungCayCanChinh` và kiểu nút `NutCanChinh` giữ
nguyên, và nút của `cayCanChinh` không thêm trường nào: `okr-can-chinh.spec.ts` (hồ sơ đã ký L1) so nguyên nút của `dungCayCanChinh`, `cay-day-du` của `okr-toan-canh.spec.ts` (hồ sơ đã ký `toan-canh-okr`) so nút `cayCanChinh` với nút `alignmentTree`.

### Màn

- Mỗi nút mục tiêu có cha trong cây đọc cạnh `(nút.objectiveId, cha.id)` và hiện thêm:
  - nhãn mức tin (`StatusIndicator`, nghĩa và nhãn dùng lại bảng của L2: Có số liệu = xong, Đặt cược = nháp,
    Chưa có lý do = chờ) ngay cạnh tên đơn vị;
  - một dòng lý do dưới tên đơn vị (dữ liệu người nhập, `translate="no"`, xuống dòng, không cắt), dấu Kara nhỏ khi
    Kara viết; cạnh chưa có lý do chỉ mang nhãn, không thêm dòng chữ lặp lại.
- Nút gốc (cấp OneHub), nút KR và nhóm «Chưa căn chỉnh» không có cạnh nên không có dòng lý do.
- Đầu cây có hàng chip lọc `ToggleGroup variant="outline" size="sm"`: Tất cả · Chưa có lý do · Đặt cược (hai chip sau mang nhãn mức tin của L2; chip số 0 vẫn bấm được), mỗi chip
  có số cạnh tương ứng (chữ phụ `tabular-nums`). Giá trị ghi lên đường dẫn bằng `nuqs` (khoá mới trong
  `search-param-keys.ts`).
- Lọc một mức: giữ các nút mục tiêu có cạnh đúng mức đó và mọi tổ tiên của chúng (để thấy nhánh góp vào đâu); ẩn
  nút không khớp mà không có hậu duệ khớp; ẩn nhóm «Chưa căn chỉnh». Lọc mà không cạnh nào khớp → trạng thái rỗng
  của cây với một câu nói không có nhánh nào ở mức đó.

Không đổi `migration`. Đổi hợp đồng API: chỉ thêm trường `canh` vào `cayCanChinhOutput`.

### Dữ liệu mẫu

Dùng lại ba ca bộ OKR mẫu mà L2 gieo (`q4-kd-bac-1` có số liệu, Kara viết · `q4-kd-bac-2` đặt cược ·
`q4-kd-nam-2` chưa có lý do).

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: OKR → Theo đơn vị → chuyển kiểu xem «Cây căn chỉnh» → đọc dòng lý do và nhãn mức tin dưới từng nhánh →
  bấm chip «Chưa có lý do» → cây chỉ còn các nhánh chưa có lý do và tổ tiên của chúng (điểm ra: bấm một nút mở sheet
  mục tiêu như nay; chép đường dẫn có bộ lọc gửi người khác).
- Biên: lọc mà không nhánh nào khớp → câu rỗng của cây; mục tiêu góp hai chỗ hiện hai lần, mỗi lần lý do của chỗ nối
  đó; nhóm «Chưa căn chỉnh» ẩn khi đang lọc.
- Lỗi & quay lại: cây tải lỗi → `VungTaiLoi` như nay; chip «Tất cả» đưa về cây đầy đủ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Theo đơn vị, kiểu xem Cây căn chỉnh | Cho lãnh đạo thấy nhánh nào góp vào đâu, có căn cứ hay chưa | Từ OKR / ra: sheet mục tiêu |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-cay-loading | Cây căn chỉnh | Khung xương như nay | Chờ |
| ST-cay-tat-ca | Cây căn chỉnh | Chip «Tất cả» chọn; mỗi nhánh có nhãn mức tin và dòng lý do | Đọc, bấm chip |
| ST-cay-chua-co-ly-do | Cây căn chỉnh | Chỉ nhánh chưa có lý do và tổ tiên; nhóm Chưa căn chỉnh ẩn | Mở sheet để hỏi lại |
| ST-cay-dat-cuoc | Cây căn chỉnh | Chỉ nhánh đặt cược và tổ tiên | Mở sheet |
| ST-cay-loc-rong | Cây căn chỉnh | Câu rỗng: không có nhánh nào ở mức này | Bấm «Tất cả» |
| ST-cay-hep | Cây căn chỉnh, 390 px | Dòng lý do xuống dòng trong bề ngang, chip cuộn ngang nếu cần, không tràn trang | Đọc |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Giá trị lọc trên đường dẫn (`nuqs`), mở lại trang giữ bộ lọc; giá trị lạ trên đường dẫn đọc như «Tất cả».
- Dữ liệu người nhập `translate="no"`; chữ khung qua `apps/app/lib/messages/okr-toan-canh.ts`, đủ `vi` và `en`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `TreeNav` của cây | dùng | Cây đã dựng bằng nó |
| `ToggleGroup` | dùng | Mẫu chip lọc của `docs/design.md` |
| `StatusIndicator` + `toneTheoNghia` + `NGHIA_MUC_TIN` | dùng | Nhãn mức tin cùng bảng với L2 |
| `KaraTrace` | dùng | Dấu nhỏ tại chỗ (`docs/ai-ux.md` §3) |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — cây là danh sách có cấp, nút mở sheet chi tiết như nay; việc này thêm chữ và một hàng
lọc vào màn có sẵn.
<!-- UX-SPEC-TEMPLATE>>> -->

## Tệp dự kiến chạm

- `apps/api/src/okr/okr-xem.contracts.ts` (`cayCanChinhOutput` thêm `canh`), `apps/api/src/okr/okr-xem.service.ts`.
- `apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx`, `theo-don-vi/theo-don-vi.tsx` (truyền `canh`),
  `okr-search-params.ts`, `apps/app/lib/search-param-keys.ts` (chỉ thêm), `apps/app/lib/messages/okr-toan-canh.ts`
  (chỉ thêm).
- `apps/app/test/okr-theo-don-vi.dom.tsx` (chỉ thêm `canh: []` vào dữ liệu giả), bài mới
  `apps/app/test/cay-can-chinh-ly-do.dom.tsx`, `apps/api/test/okr-cay-ly-do.spec.ts`.
- `_acceptance/config.yaml` (chỉ thêm khoá executor).
