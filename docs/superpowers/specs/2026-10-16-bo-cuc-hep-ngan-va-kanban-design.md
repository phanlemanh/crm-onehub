# Bố cục hẹp của ngăn bản ghi và Kanban thoả thuận — thiết kế

Hàng V2c của `docs/plan/lo-trinh-okr.json`, dãy P4 của đợt r2. Cổng Đáng ký build 12/10. Câu giao: «Ngăn bản ghi và
Kanban thoả thuận không vỡ bố cục ở khổ hẹp».

## Vì sao

Hội đồng E13 của V2 (`_acceptance/vong-doi-mot-cach-cat`, vòng 1, 09/10) trượt cả ba phiếu vì hai lỗi bố cục có từ trước
V2, chủ kho chọn ngả A — mở hàng riêng (sổ `d-20261009T135725Z-13`). Ảnh `vdc-ngan-da-cat-390.png` và
`vdc-kanban-390.png` của hồ sơ đó cho thấy:

1. Ngăn thoả thuận ở 390: hàng số liệu cắt «Ngày dự …», «Ở giai đo…», tên phụ trách còn «P…»; thanh giai đoạn cắt tên
   mọi bước («Demo boo…», «Qualified t…», «Decision …»).
2. Kanban thoả thuận ở 390: nhãn giai đoạn «Demo booked» tràn ra ngoài viền phải của thẻ.

Ở 1440 cả hai vùng đúng (ảnh `vdc-ngan-da-cat-1440.png`).

## Nguyên nhân

| Vùng | Tệp | Nguyên nhân |
|---|---|---|
| Hàng số liệu | `apps/app/components/detail-sheet.tsx` (`DetailSheetStats`, `DetailSheetStat`) | Bốn ô một hàng `flex` chia đều; nhãn `dt` luôn `truncate`; ô Phụ trách dùng `OwnerCell` mặc định `truncate` |
| Thanh giai đoạn | `apps/app/components/crm/stage-stepper.tsx` | Tên bước bọc `block truncate`; bước chốt dùng `StatusIndicator` vốn cắt nhãn |
| Thẻ Kanban | `apps/app/app/(app)/[slug]/deals/deals-board.tsx`, `apps/app/components/crm/deal-stage.tsx` | Hàng người phụ trách và giai đoạn không cho xuống dòng, và nhãn giai đoạn không co dưới bề rộng chữ của nó (phần tử flex mặc định `min-width: auto`) — nên nhãn dài đẩy ra ngoài viền thẻ |

`DetailSheetStats` dùng chung cho ngăn thoả thuận, ngăn công ty và ngăn kế hoạch; sửa ở thành phần chung thì cả ba
ngăn cùng được.

## Cách làm

Dưới `md` (ngăn là drawer toàn bề ngang):

- Hàng số liệu: lưới hai cột, bốn ô thành 2×2; nhãn và giá trị xuống dòng thay vì cắt. Ô Phụ trách truyền
  `xuongDongDienThoai` cho `OwnerCell` (nếp có sẵn). Từ `md`: giữ một hàng chia vạch như hôm nay (Hỏi-1).
- Thanh giai đoạn: tên bước xuống dòng đủ chữ; bước chốt dùng `StatusIndicator` ở chế độ xuống dòng. Từ `md`: giữ
  `truncate` như hôm nay (Hỏi-2).
- Thẻ Kanban, mọi khổ: hàng người phụ trách và giai đoạn cho xuống dòng (`flex-wrap`), và nhãn giai đoạn co được và
  xuống dòng trong viền thẻ, đủ chữ (Hỏi-3). Cần cả hai: chỉ xuống dòng thì nhãn dài hơn bề ngang thẻ vẫn tràn, chỉ co
  nhãn thì nhãn bị cắt. Dữ liệu ngắn thì vẫn cùng hàng như hôm nay.

Có xem bố cục mới trước Cổng Phạm vi hay không là Hỏi-4: khuyến nghị bỏ bản mẫu, xem ảnh sau ở Cổng Bằng chứng, vì
ba vùng chỉ đổi CSS — đổi sang lối khác của Hỏi-1 đến Hỏi-3 sau khi thấy ảnh là một nhát sửa nhỏ.

`StatusIndicator` (`packages/ui`) thêm một biến thể xuống dòng cho nhãn (mặc định vẫn cắt), theo luật «biến thể mới
làm trong `packages/ui`» của `docs/design.md` — không đè `className` ở chỗ gọi.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Thoả thuận (điện thoại) → «Bảng cột» → đọc thẻ (tên, công ty, giá trị, ngày, người phụ trách, giai đoạn) →
  bấm thẻ → ngăn thoả thuận mở → đọc bốn số liệu và đường giai đoạn.
- Biên: tên thoả thuận, công ty, người phụ trách 120 ký tự không dấu cách; giai đoạn tên dài («Decision maker
  bought-in»); ô số liệu rỗng («—»).
- Lỗi & quay lại: không đổi — vòng chỉ đổi bố cục.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thoả thuận › Bảng cột | Xem thoả thuận theo giai đoạn | Thanh bên / Ngăn thoả thuận |
| Ngăn thoả thuận | Đọc và đổi một thoả thuận | Bảng, Bảng cột / đóng ngăn |
| Ngăn công ty, ngăn kế hoạch | Đọc một bản ghi | Danh sách / đóng ngăn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ngan-hep | Ngăn thoả thuận, công ty, kế hoạch dưới `md` | Bốn số liệu lưới 2×2, nhãn và giá trị đủ chữ | Đọc |
| ST-ngan-hep-giai-doan | Ngăn thoả thuận dưới `md` | Đường giai đoạn, tên mỗi bước đủ chữ, có thể hai–ba dòng | Bấm bước để đổi giai đoạn |
| ST-ngan-rong | Ba ngăn từ `md` | Bốn số liệu một hàng, tên bước một dòng — như hôm nay | Đọc |
| ST-kanban-hep | Bảng cột dưới `md` | Nhãn giai đoạn trong viền thẻ, đủ chữ, xuống dòng dưới người phụ trách khi chật | Bấm thẻ, đổi giai đoạn |
| ST-kanban-rong | Bảng cột từ `md` | Người phụ trách và giai đoạn cùng hàng — như hôm nay | Như trên |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ngưỡng là `md` (768), cùng ngưỡng ngăn chuyển thành drawer.
- Không phần tử nào trong ngăn hay thẻ tràn ngang; trang không cuộn ngang ở 375.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `StatusIndicator` | mở rộng | thêm biến thể nhãn xuống dòng trong `packages/ui`, mặc định giữ cắt |
| `DetailSheetStats` | mở rộng | lưới 2×2 dưới `md`, thành phần chung của ba ngăn |
| `OwnerCell` | dùng | nếp `xuongDongDienThoai` có sẵn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail) — không đổi cấu trúc màn, chỉ đổi bố cục khổ hẹp.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đo

- Bàn đo màn thật (phiên đo, `mot-luot.sh`): gieo qua service một giai đoạn mở tên dài, một giai đoạn chốt tên dài,
  một công ty tên 120 ký tự không dấu cách, một người phụ trách tên 120 ký tự không dấu cách, và ba thoả thuận — dài ở
  giai đoạn mở, dài ở giai đoạn chốt, ngắn với người phụ trách tên ngắn.
  - 375: Bảng cột — mỗi thẻ đã gieo, mọi phần tử con nằm trong viền thẻ và nhãn giai đoạn không bị cắt; ngăn thoả thuận
    dài — hàng số liệu hai hàng, không `dt`/`dd` nào bị cắt; thanh giai đoạn không tên bước nào bị cắt; ngăn thoả thuận
    ở giai đoạn chốt — bước chốt không bị cắt; ngăn công ty — hàng số liệu như trên; trang không cuộn ngang.
  - 1440: thẻ dài nằm trong viền, nhãn không bị cắt; thẻ ngắn — chỉ báo cùng hàng người phụ trách; ngăn — bốn số liệu
    một hàng, mỗi bước giai đoạn một dòng.
- «Bị cắt» = `scrollWidth > clientWidth + 1` của phần tử chữ; «tràn» = phần tử vượt khỏi khung chứa quá 1 px.
- Bài kiểm `packages/ui`: `StatusIndicator` không truyền biến thể thì nhãn vẫn `truncate`; có biến thể thì không.
- Chiều đỏ trên bản sao, mỗi chiều phá đúng một thứ bản sửa giữ: nhãn số liệu trả `truncate`; ô Phụ trách bỏ
  `xuongDongDienThoai`; thẻ bỏ `flex-wrap`; thẻ bỏ biến thể xuống dòng của nhãn; tên bước trả `truncate`; bước chốt bỏ
  biến thể xuống dòng.

## Ngoài phạm vi

- Ngăn liên hệ và các bảng (`DataTable`) ở khổ hẹp — không thuộc câu giao.
- Kanban việc (`DA2`) và các bảng cột khác — không có lỗi nào trong E13.
- Đầu ngăn (tên bản ghi, chip giai đoạn ở góc phải) — ảnh 390 không cắt chữ ở đó.
