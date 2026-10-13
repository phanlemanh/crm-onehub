# L2 — Lý do căn chỉnh trên sheet mục tiêu

Hàng L2 của `docs/plan/lo-trinh-okr.json`, câu giao: «Sheet mục tiêu hiện lý do căn chỉnh của từng đường nối lên
mục tiêu cha». Cổng Đáng ký `build` 12/10 (Phan Le Manh). Đứng trên L1 `ly-do-can-chinh-tu-soan` (#348, đã lên
`onehub`) — L1 thêm `lyDo`, `canCu`, `lyDoTuKara` vào `OkrAlignment` và trả thêm `mucTin` ở mỗi phần tử
`alignments` của `okr.objective`. Chưa màn nào đọc bốn trường đó.

## Vấn đề

Mở một mục tiêu, khối «Góp vào» cho biết mục tiêu nối lên đâu (mục tiêu cha, qua KR nào) nhưng không nói vì sao
nối và nối chắc tới đâu. Lý do Kara viết ở Soạn OKR nay đã đi vào căn chỉnh thật (L1) mà vẫn không ai thấy.

## Thiết kế

Mỗi dòng «Góp vào» trên tab KR của sheet mục tiêu thêm phần lý do ngay dưới chỗ nối:

- **Có lý do**: câu lý do (dữ liệu người nhập, `translate="no"`), dòng «Căn cứ: …» khi có căn cứ, nhãn mức tin
  («Có số liệu» khi có căn cứ, «Đặt cược» khi không), và dấu Kara nhỏ (`KaraTrace`) cạnh câu khi `lyDoTuKara`.
- **Chưa có lý do**: chỉ nhãn mức tin «Chưa có lý do» — không ô rỗng, không dòng căn cứ, không dấu Kara.

Giữ nguyên những gì hồ sơ đã ký ghim: thứ tự «Vì sao lúc này» → «Góp vào» → bảng KR (`muc-tieu-va-kr` E3, E16),
`[data-khu=vi-sao]`, `[data-khu=gop-vao]`, `[data-gop-vao]`, nội dung `item-title` và `item-description` của từng
dòng. Phần lý do nằm trong dòng nhưng ngoài `item-description`.

Mức tin không tính lại ở màn: đọc `mucTin` API trả (`mucTinCanChinh` của `apps/api/src/okr/can-chinh.ts`). Màn
chỉ khai mỗi mức thuộc nghĩa nào trong bảng màu của `docs/design.md` và lấy `tone` qua `toneTheoNghia`: Có số liệu
→ `xong`, Đặt cược → `nhap`, Chưa có lý do → `cho` (Hỏi-2).

Không đổi API, không `migration`. Quyền xem đã chốt ở L1 AC-6 (lý do chỉ sống trên mục tiêu công khai; người ngoài
workspace bị chặn), màn này chỉ đọc cái API đã lọc.

### Dữ liệu mẫu

Ô căn cứ chưa có đường ghi (L4 dựng ô đó), nên màn «Có số liệu» không dựng được qua đường ghi thật. Theo
`CLAUDE.md` («thiếu dữ liệu thì mở rộng dữ liệu mẫu, không đợi»), bộ OKR mẫu (`bun run okr:mau`) — vốn là bên ghi
căn chỉnh của dữ liệu mẫu — nhận thêm ba trường tuỳ chọn `lyDo`, `canCu`, `lyDoTuKara` trong `canChinh`, và gieo
đủ ba mức tin. Khuôn của bộ mẫu từ chối `canCu` khi không có `lyDo` (căn cứ không lý do không có nghĩa trong
`mucTinCanChinh`). Bộ mẫu ghi căn chỉnh bằng `createMany` từ trước (khối `okrAlignment` của `nap.ts`); ba trường đi
cùng hàng đó, không thêm đường ghi thứ hai — đường ghi qua service cho căn cứ là việc của L4.

### Hai câu chỉ người trả lời (gửi giám sát P2-2, P2-3)

- **Hỏi-1 — bố cục.** Bản vẽ trước/sau mục 03 (`.acceptance-runs/dieu-phoi-sau-14-10/tai-lieu/ly-do-can-chinh/`,
  ngoài kho) dời «Vì sao lúc này» xuống cuối một «Đường lý do». Khuyến nghị: giữ thứ tự cũ, chỉ thêm lý do lên
  chỗ nối — không hồ sơ đã ký nào đỏ. Lối khác: đúng bản vẽ, phải sửa hợp đồng đã ký `muc-tieu-va-kr` và chỉnh ba
  hồ sơ ký khác (~1 ngày, một lượt ghim lại).
- **Hỏi-2 — màu mức tin.** Khuyến nghị: Chưa có lý do = chờ (vàng). Lối khác: = nháp (xám) như Đặt cược.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Danh sách OKR (Của tôi / Theo đơn vị) → bấm một mục tiêu → sheet mục tiêu mở ở tab KR → đọc «Góp vào»:
  mỗi chỗ nối có lý do, căn cứ, nhãn mức tin (điểm ra: đóng sheet, hoặc sang tab Căn chỉnh để gắn/gỡ).
- Biên: mục tiêu không căn chỉnh → không có khối «Góp vào» (như nay); nhiều căn chỉnh → mỗi dòng một phần lý do
  riêng, thứ tự như API; `whyNow` rỗng → không khối «Vì sao lúc này» (như nay).
- Lỗi & quay lại: sheet tải lỗi → `VungTaiLoi` của sheet như nay; vùng lý do không có trạng thái lỗi riêng (đi cùng
  một truy vấn `okr.objective`).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Sheet mục tiêu, tab KR | Cho người đọc thấy mục tiêu này góp vào đâu và vì sao | Từ danh sách OKR, cây, link `?record=` / ra: đóng sheet, tab Căn chỉnh |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-sheet-loading | Sheet mục tiêu | Khung xương của sheet như nay, giữ tiêu đề | Chờ |
| ST-sheet-khong-can-chinh | Sheet mục tiêu | Không khối «Góp vào» | Sang tab Căn chỉnh để gắn |
| ST-sheet-co-so-lieu | Sheet mục tiêu | Dòng Góp vào + câu lý do + «Căn cứ: …» + nhãn «Có số liệu» | Đọc |
| ST-sheet-dat-cuoc | Sheet mục tiêu | Dòng Góp vào + câu lý do + nhãn «Đặt cược», không dòng căn cứ | Đọc |
| ST-sheet-chua-co-ly-do | Sheet mục tiêu | Dòng Góp vào + nhãn «Chưa có lý do», không ô rỗng | Đọc (gắn lý do là L4) |
| ST-sheet-ly-do-kara | Sheet mục tiêu | Như hai dòng có lý do, thêm dấu Kara nhỏ cạnh câu lý do | Đọc |
| ST-sheet-nhieu-can-chinh | Sheet mục tiêu | Mỗi dòng Góp vào một phần lý do riêng | Đọc |
| ST-sheet-hep | Sheet mục tiêu, 390 px | Câu lý do và căn cứ xuống dòng trong bề ngang sheet, không tràn ngang | Đọc |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Câu lý do và căn cứ hiện trọn (không cắt), xuống dòng theo bề ngang; `translate="no"` trên dữ liệu người nhập.
- Không có tương tác mới: phần lý do chỉ đọc. Dấu Kara là `KaraTrace` (có chữ cho trình đọc màn), không bấm được.
- Mọi chữ khung qua `apps/app/lib/messages/okr.ts`, đủ `vi` và `en`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Item`, `ItemContent`, `ItemTitle`, `ItemDescription` | dùng | Dòng «Góp vào» đã là `Item`; giữ để không đổi gì hồ sơ đã ký ghim |
| `StatusIndicator` + `toneTheoNghia` | dùng | Nhãn trạng thái theo bảng màu của `docs/design.md` |
| `KaraTrace` | dùng | Dấu nhỏ tại chỗ cho giá trị Kara viết (`docs/ai-ux.md` §3) |
| Phần lý do của một dòng (`LyDoNoiGop`) | ghép | Ghép ba thành phần trên trong một tệp mới cạnh sheet; không thành phần mới ở `packages/ui` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — sheet mục tiêu đã là chi tiết của danh sách OKR; việc này chỉ thêm chữ vào một khối có
sẵn của chi tiết, không đổi khuôn, nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Tệp dự kiến chạm

- `apps/app/components/crm/record-sheet/objective-sheet.tsx` — `KhuGopVao` gọi phần lý do.
- `apps/app/components/crm/record-sheet/ly-do-noi-gop.tsx` — mới: phần lý do của một dòng và bảng mức tin → nghĩa.
- `apps/app/lib/messages/okr.ts` — chỉ thêm khoá (`vi`, `en`).
- `apps/api/scripts/okr-mau/khuon.ts`, `nap.ts`, `cong-ty.json` — ba trường tuỳ chọn và ba ca gieo.
- Bài thử mới `apps/app/test/duong-ly-do.dom.tsx`, `apps/api/test/okr-mau-ly-do.spec.ts`.
- `_acceptance/config.yaml` — chỉ thêm khoá executor.
