# Phiếu Công ty: chi tiết hai cột, ô Tệp đủ rộng

Ngày 23/10/2026 · hồ sơ `_acceptance/chi-tiet-cong-ty-hai-cot` · hạng T2

## Vấn đề

Rà soát 23/10 mọi màn có đính kèm tệp. Chỉ phiếu Công ty hẹp: tab Tổng quan chia cột chính và cột phải 320px
(`DetailSheetSplit` · `DetailSheetRail`, upstream fc236a253 ngày 02/08), toàn bộ mục Chi tiết nằm trong cột phải một
cột. Ô Tệp chỉ còn khoảng 152px ở màn 1440: tên tệp bị cắt, nút Mở/Xoá rớt dòng, chữ của vùng kéo thả xuống mỗi dòng
một chữ. Cột chính chỉ còn Giới thiệu và Hoạt động web, để trống khoảng 600px.

| Nơi | Bố cục chi tiết | Bề rộng cho ô Tệp ở 1440 |
|---|---|---|
| Phiếu Công ty | cột phải 320px, một cột | ~152px |
| Phiếu Liên hệ | tràn ngang, hai cột, ô Tệp chiếm trọn hàng | ~810px |
| Phiếu Thoả thuận | như Liên hệ | ~810px |
| Mọi phiếu ở 375 | nhãn 104px bên trái | ~207px |

Lỗi thứ hai nằm trong thành phần dùng chung: vùng kéo thả (`NguonKeoTha`, `packages/ui`) đặt phần chữ là
`flex-1 min-w-0` cạnh nút «Chọn tệp». `flex-1` có `flex-basis: 0`, nên `flex-wrap` không bao giờ đẩy chữ xuống dòng —
chữ co tới mức mỗi dòng một chữ. Lỗi này gặp lại trên điện thoại ở cả ba phiếu.

Lý do hãng tách cột (commit fc236a253): tám hàng trường đứng trên đoạn giới thiệu nên người dùng phải cuộn qua trường
mới tới phần chữ, và không thấy danh sách liên hệ. Ở bản OneHub, danh sách liên hệ đã sang tab «Cá nhân», nên cột chính
chỉ còn đoạn giới thiệu.

## Thiết kế

1. **Phiếu Công ty theo khung của Liên hệ và Thoả thuận.** Tab Tổng quan thành một cột dọc:
   Giới thiệu (khi có mô tả) → Chi tiết (`DetailSheetProperties` mặc định hai cột từ `sm`, thứ tự theo Cài đặt › Trường
   như hôm nay) → dòng Kara đang tra cứu / chưa biết (`DetailSheetPending`) → Liên kết → Hoạt động web.
   Giới thiệu đứng đầu để giữ lý do của hãng: đoạn chữ không bị đẩy xuống dưới các hàng trường (Hỏi-1).
   Ô Tệp là trường `wide` nên tự chiếm trọn hàng (`col-span-full`), như ở Liên hệ.
2. **Gỡ bố cục cột phải.** `DetailSheetSplit`, `DetailSheetMain`, `DetailSheetRail` chỉ phiếu Công ty dùng; gỡ khỏi
   `apps/app/components/detail-sheet.tsx` để không còn đường dựng lại cột 320px.
3. **Vùng kéo thả tự xuống dòng.** Trong `packages/ui/src/components/nguon-keo-tha.tsx`, phần chữ nhận bề rộng nền tối
   thiểu (`basis-48`, giữ `flex-1 min-w-0`): còn đủ chỗ thì nút và chữ cùng hàng như hôm nay; thiếu chỗ thì cả khối chữ
   rơi xuống dưới nút, mỗi câu trọn dòng. Không thêm biến thể, không đổi API — mọi nơi dùng vùng kéo thả đều được.

Không đổi: dữ liệu, API, quyền, thứ tự trường, hành vi tải/mở/xoá tệp, phiếu Liên hệ và Thoả thuận.

Va chạm đã biết (23/10): PR #547 `fix/o-tep-dien-thoai` sửa cùng dòng của vùng kéo thả theo cùng hướng (`basis-52`) và cho
ô Tệp xếp nhãn trên giá trị dưới `md`. Gộp #547 vào nhánh này trước đường nền và S4; xung đột ở vùng kéo thả lấy bản #547.
Bộ đo không phụ thuộc con số bề rộng nền.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Danh sách công ty → bấm một công ty → ngăn mở ở tab Tổng quan → đọc Giới thiệu → xem/sửa Chi tiết hai cột →
  kéo tệp vào ô Tệp hoặc bấm «Chọn tệp» → tệp hiện thành một dòng đủ tên kèm Mở/Xoá (điểm ra: đóng ngăn).
- Biên: công ty chưa có mô tả (không có mục Giới thiệu, Chi tiết đứng đầu); Kara đang tra cứu (dòng chờ dưới Chi tiết);
  công ty đã lưu trữ (không có vùng kéo thả, như hôm nay).
- Lỗi & quay lại: tải hỏng hiện ngay trong ô Tệp như hôm nay (Thử lại / Bỏ) — vòng này không đổi.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn Công ty › Tổng quan | đọc và sửa thông tin một công ty | danh sách Công ty, liên kết bản ghi / đóng ngăn |
| Ngăn Liên hệ, ngăn Thoả thuận (chỉ vùng kéo thả) | như hôm nay | như hôm nay |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-congty-co-mo-ta | Ngăn Công ty | Giới thiệu → Chi tiết hai cột → Liên kết → Hoạt động web | đọc, sửa trường |
| ST-congty-khong-mo-ta | Ngăn Công ty | Chi tiết đứng đầu, không khung Giới thiệu rỗng | sửa trường |
| ST-congty-kara-dang-tra | Ngăn Công ty | dòng «Kara đang tra cứu» kèm tên trường, dưới Chi tiết | chờ |
| ST-otep-co-tep | Ô Tệp | mỗi tệp một dòng: biểu tượng, tên đủ (cắt «…» chỉ khi quá dài), cỡ · ngày · người tải, Mở, Xoá cùng hàng (từ `md`) | mở, xoá |
| ST-otep-hep | Ô Tệp ở 375 | nút «Chọn tệp» một dòng, chữ «Kéo tệp vào đây» và mô tả bên dưới, mỗi câu trọn dòng | chọn tệp |
| ST-otep-luu-tru | Ô Tệp, bản ghi đã lưu trữ | danh sách tệp, không vùng kéo thả | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Breakpoint: Chi tiết hai cột từ `sm` (640px), một cột dưới `sm` — cùng luật với Liên hệ, Thoả thuận.
- Vùng kéo thả: nút và chữ cùng hàng khi phần chữ còn ≥ 192px; dưới mức đó chữ xuống dưới nút.
- Không cuộn ngang ở 375.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DetailSheetSection`, `DetailSheetProperties` (2 cột), `DetailSheetProperty wide` | dùng | khung Chi tiết của Liên hệ và Thoả thuận |
| `NguonKeoTha` | mở rộng (sửa trong `packages/ui`) | một nguồn cho mọi vùng kéo thả, sửa một lần |
| `DetailSheetSplit` / `Main` / `Rail` | gỡ | chỉ phiếu Công ty dùng, là gốc của cột hẹp |

Tra bậc 1–3 (`docs/design.md` «Vẽ tay là bậc cuối»): dừng ở bậc 1 — mọi khối đã có trong `apps/app/components/detail-sheet.tsx`
và `packages/ui`. Không cần tra ReUI.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên — chép đúng khuôn đang chạy ở ngăn Liên hệ và Thoả thuận (một cột cuộn, các mục nối nhau);
đối chiếu ngoài: Salesforce Lightning đặt trường của bản ghi ở thẻ Details hai cột tràn ngang. Không tra Mobbin.
<!-- UX-SPEC-TEMPLATE>>> -->

## Phương án đã loại

- **Nới cột phải lên 384px:** ô Tệp chỉ được ~216px, Giới thiệu hẹp lại.
- **Đưa riêng ô Tệp sang cột chính:** trái luật «Trường: một trường, một cách cư xử» (`docs/design.md`) — Chi tiết theo
  thứ tự Cài đặt › Trường, không tách khối trường tự tạo.
- **Nhãn trên giá trị riêng cho ô Tệp:** ô Tệp cư xử khác các trường khác.
- **Vùng kéo thả đổi sang xếp dọc luôn:** phí chỗ ở hộp thoại rộng (Tài liệu › tải nguồn), không cần.

Thêm một lý do bỏ cột phải: `docs/ai-ux.md` §11 dành mép phải của khung bản ghi cho cột Kara; cột chi tiết bên phải
sẽ đụng nó khi phiếu có Kara.

## Cách đo

Một răng màn thật `_acceptance/chi-tiet-cong-ty-hai-cot/rang/do-bo-cuc.mjs` chạy qua phiên đo riêng (`tien-de.mjs`), gieo
qua API thật: ba trường Tệp (Công ty, Liên hệ, Thoả thuận), mỗi bản ghi một tệp tên dài tải qua `fieldFiles` với kho
Blob giả (khuôn `_acceptance/truong-tep/rang/blob-gia.mjs`); đo bằng `getBoundingClientRect` ở 1440, 768, 375 và chụp ảnh.
Chiều đỏ chạy trên bản sao với từng chỗ sửa bị phá lại (`--chi-do`).
