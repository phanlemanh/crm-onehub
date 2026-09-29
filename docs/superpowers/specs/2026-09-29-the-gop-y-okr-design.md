# Thẻ góp ý của Trợ lý OKR — thiết kế

Ngày: 2026-09-29 · Slug: `the-gop-y-okr` · Hạng: T2 (chỉ giao diện)

## Vì sao

Lái thử 29/09 và bản rà soát UX cùng ngày
(`.acceptance-runs/tro-ly-okr-de-xuat/ux-ra-soat-2026-09-29/index.html`) cho thấy cột góp ý
của lượt 9b chật: hộp «rộng» 640 px chia đôi cho form và cột, mỗi thẻ xếp Nhận · Sửa · Bác
bên phải chữ, câu đề xuất còn ≈ 135 px ở cỡ 12 px. Ba nút cùng kiểu mờ, không có hành động
chính. Chủ kho duyệt phương án A ngày 29/09: thẻ xếp dọc, nút ở chân, một nút chính.

Mọi mẫu tham chiếu đặt nút dưới nội dung và tô đúng một nút: ReUI ai-chat-8 và
c-code-block-22, HubSpot «đề xuất cập nhật thuộc tính deal», GitHub Copilot «Commit
suggestion», Word Copilot «Replace».

## Làm gì

1. **Hộp sửa mở rộng khi cột mở.** Thêm cỡ `assist` cho `Dialog` trong `packages/ui`:
   form giữ bề ngang cũ, cột góp ý cố định 380 px, khoảng cách 24 px; dưới `lg` cột xếp
   xuống dưới form. Cỡ `wide` giữ nguyên cho nơi khác.
2. **Thẻ duyệt thay đổi một nguồn.** Cài AI Elements `confirmation` bằng CLI vào
   `packages/ui/src/components/ai-elements/`, sửa theo `docs/design.md` và `locale-provider`,
   ghi vào sổ lệch chuẩn. Dựng trên đó thành phần `ProposedChange` trong `packages/ui`
   (thay `Suggestion` cũ): tầng đầu nhãn loại + tên ô; thân câu cũ gạch mờ trên, câu mới
   nổi dưới (token `diff-bo`, `diff-them`), lý do một câu; chân là hàng nút. Chế độ gọn
   (một giá trị, như gợi ý thông tin) vẫn là thẻ, nút ở chân.
3. **Một nút chính cho mỗi thẻ cần quyết.** Thẻ viết lại, căn chỉnh và thông tin có đúng một
   nút tô màu: «Nhận» (hoặc «Căn chỉnh»); «Sửa» outline; «Bác» ghost, đẩy về cuối hàng. Thẻ
   câu hỏi không có nút tô màu: «Mở KR này» outline, «Bỏ qua» ghost cuối hàng.
4. **Câu hỏi có lối đi tiếp.** Câu hỏi gắn một KR thì có «Mở KR này»: đóng hộp Mục tiêu,
   mở hộp sửa KR đó. Câu hỏi cấp Mục tiêu chỉ có «Bỏ qua».
5. **Thẻ chỉ tới ô.** Rê chuột hoặc focus vào thẻ viết lại làm ô tương ứng trong form
   sáng viền (`ring`).
6. **Phím trong cột:** J / K chuyển thẻ, Enter nhận thẻ đang focus, E mở sửa, Esc trong ô
   sửa huỷ sửa. Phím chỉ có hiệu lực khi focus ở trong cột.
7. **Gợi ý thông tin ở tab Tổng quan** (`facts.tsx`) chuyển sang `ProposedChange` chế độ gọn.
8. **Bấm bất kỳ đâu trong cột không đóng hộp** — lái thử 29/09 thấy một lần bấm «Sửa» đóng
   cả hộp.
9. **Register:** `docs/chat-ui.md` chuyển `confirmation` sang Adopted, ghi file có trong
   cây, sửa câu đã cũ về nguồn ở tab Agent.

## Không đổi

Dữ liệu, tác tử, bộ kiểm, thủ tục API, vết «theo đề xuất của Trợ lý OKR», hoàn tác 7 ngày,
nấc bật/ẩn, số đo. **Tên truy cập của nút giữ nguyên** (Nhận · Sửa · Bác · Bỏ qua · Nhận bản
đã sửa · Huỷ) để thước của lượt 9b chỉ phải đổi chỗ bám bố cục.

## Giả định đã chọn thay chủ kho (chờ soi ở Cổng Phạm vi)

- Chưa làm «Nhận tất cả», chip nguồn Trợ lý đã đọc, nhiều phương án viết lại (Later).
- «Mở KR này» đóng hộp Mục tiêu trước khi mở hộp KR (không lồng hai hộp).
- Phím J/K theo Linear và Gmail; không phím tắt toàn cục.
- Tên thành phần mới `ProposedChange` (tiếng Anh như mọi tên trong `packages/ui`).

## Tác động lên hồ sơ đã ký

- `tro-ly-okr-de-xuat`: bài `tro-ly-okr-gop-y.dom.tsx`, `packages/ui/test/suggestion.dom.tsx`,
  `render-diff.spec.tsx` và kịch bản lái màn `rang/man-gop-y.mjs` bám cấu trúc thẻ cũ —
  cập nhật trong lượt này, hồ sơ đó ghim lại ở S5.
- Bản mẫu `/proto/tro-ly-okr-de-xuat` dùng `HopThoaiMucTieu` thật nên tự đổi theo.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: hộp Sửa mục tiêu → «Nhờ Trợ lý OKR góp ý» → hộp mở rộng, cột 380 px → đọc thẻ → Nhận (hoặc Sửa → Nhận bản đã sửa) → thẻ gọn «Đã nhận», thông báo có Hoàn tác (điểm ra: đóng cột hoặc hộp).
- Biên: câu hỏi gắn KR → «Mở KR này» → hộp Sửa KR; màn hẹp dưới `lg` → cột xếp dưới form; ô đang sửa chưa lưu → Nhận khoá kèm lý do.
- Lỗi & quay lại: nhận bị từ chối → lỗi dưới thẻ, thẻ vẫn chờ; soạn lỗi → «Thử lại».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp Sửa mục tiêu có cột | Quyết từng góp ý cho Mục tiêu và KR của nó | khung chi tiết Mục tiêu / đóng, hoặc hộp Sửa KR |
| Hộp Sửa KR có cột | Quyết góp ý của một KR | khung chi tiết / đóng |
| Tab Tổng quan của liên hệ | Duyệt thông tin tác tử đề xuất | trang liên hệ / ở lại |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-thegopy-cho | Hộp Sửa mục tiêu | Thẻ viết lại: «Viết lại · Tên mục tiêu», câu cũ gạch mờ, câu mới nổi, lý do; chân: Nhận (primary) · Sửa · …· Bác | Nhận / Sửa / Bác |
| ST-thegopy-sua | Hộp Sửa mục tiêu | Câu mới thành ô sửa có focus; chân: Nhận bản đã sửa (primary) · Huỷ | Sửa rồi nhận / Huỷ |
| ST-thegopy-dang-gui | Hộp Sửa mục tiêu | Nút chính quay; các nút khác khoá | Chờ |
| ST-thegopy-da-quyet | Hộp Sửa mục tiêu | Thẻ gọn một dòng «Tên mục tiêu — Đã nhận» / «Đã bác» | Quyết thẻ khác |
| ST-thegopy-khoa-nhan | Hộp Sửa mục tiêu | Nhận khoá, dưới hàng nút: «Lưu thay đổi ở ô này trước khi nhận» | Lưu ô |
| ST-thegopy-loi-nhan | Hộp Sửa mục tiêu | Lỗi dưới thẻ; thẻ vẫn chờ | Thử lại / Bác |
| ST-thegopy-hoi-kr | Hộp Sửa mục tiêu | Thẻ câu hỏi gắn KR: câu hỏi; chân: Mở KR này (viền) · …· Bỏ qua (mờ); 0 nút tô màu | Mở KR / Bỏ qua |
| ST-thegopy-hoi-muc-tieu | Hộp Sửa mục tiêu | Thẻ câu hỏi cấp Mục tiêu; chân: …· Bỏ qua (mờ); 0 nút tô màu | Bỏ qua |
| ST-thegopy-can-chinh | Hộp Sửa mục tiêu | Thẻ căn chỉnh: «Góp vào «…»»; chân: Căn chỉnh (primary) · …· Bác | Căn chỉnh / Bác |
| ST-thegopy-chi-o | Hộp Sửa mục tiêu | Focus/rê thẻ viết lại → ô tương ứng của form sáng viền | Đọc, quyết |
| ST-thegopy-hep | Hộp Sửa mục tiêu và Sửa KR 390 | Cột xếp dưới form, thẻ trải hết bề ngang, không tràn ngang (đo trong trình duyệt thật ở E1, E11) | Cuộn, quyết |
| ST-thegopy-kr | Hộp Sửa KR | Cột 380 px chỉ thẻ của KR đó (bề ngang đo ở E1, E11) | Quyết |
| ST-thegopy-thong-tin | Tab Tổng quan | Thẻ gọn: giá trị, bằng chứng; chân: Nhận (primary) · …· Bác | Nhận / Bác |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Phím trong cột: J/K chuyển thẻ (vòng tròn không), Enter nhận thẻ đang focus, E mở sửa, Esc trong ô sửa huỷ sửa và không đóng hộp; ngoài cột phím không đổi gì.
- Bấm nút, chữ, khoảng trống trong cột không bao giờ đóng hộp.
- Cỡ chữ câu mới 14 px, câu cũ và lý do 12 px; câu cũ, câu mới giữ `translate="no"`.
- Dưới `lg` (1024 px) cột xếp dưới form; hộp cao tối đa 70svh, cuộn chung.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| AI Elements `confirmation` | dùng (cài CLI, register Available → Adopted) | Khuôn duyệt một thay đổi do AI đề xuất, nút ở chân |
| `ProposedChange` | tạo trong `packages/ui`, ghép từ `Confirmation` + `Button` | Thay `Suggestion` trùng tên với gợi ý câu hỏi của AI Elements |
| `Dialog` cỡ `assist` | mở rộng | Hộp form + trợ lý cần bề ngang riêng |
| `Button`, `Textarea`, `FieldError`, `Item` | dùng | Có sẵn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: giữ khuôn của lượt 9b (form là chi tiết, cột thẻ là danh sách góp ý); nhánh nghiên cứu 29/09 đã tra ReUI ai-chat-2/8, HubSpot, GitHub Copilot, Linear Triage — rút: nút ở chân thẻ, một nút chính, thẻ gọn sau khi quyết.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- Bài DOM mới cho `ProposedChange` và cột góp ý: mỗi trạng thái trong bảng, thứ bậc nút, phím, không đóng hộp.
- Bài đo bố cục trong trình duyệt thật, cho cả hộp Sửa mục tiêu và hộp Sửa KR: bề ngang câu đề xuất ≥ 320 px ở 1440, không tràn ngang ở 390; sau mỗi cú bấm trong cột còn đúng một hộp thoại.
- Lái màn thật (cập nhật `rang/man-gop-y.mjs` của 9b dùng lại cho lượt này) với ảnh từng bước.
- Năm lệnh chứng của kho.
