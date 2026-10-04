# Màn OKR trước R1 — design

Hồ sơ: `_acceptance/man-okr-truoc-r1/` · hàng R1c của `docs/plan/lo-trinh-okr.json` · phiên P2.
Nguồn: khảo sát màn thật 04/10 (mục A2, ảnh `r1-quan-tri-hoi-y-1440.png`,
`r1-nhan-vien-cap-nhat-tuan-1440.png`, `r1-quan-tri-toan-canh-1440.png`).

## Vấn đề

Ba màn đang khiến người dùng hiểu sai, ngay trước khi cả công ty vào OKR:

1. **Hồi ý (R1m-1).** `ThanhCongBo` (`okr/hoi-y/khoi-ket-luan.tsx`) dựng `SaveBar` dạng
   `checklist` với `defaultOpen`. Thanh nổi dính đáy bung sẵn bốn điều thiếu, cao khoảng 180 px,
   phủ lên 3/5 ý chưa gom ở màn đầu 1440 × 900 — đúng những ý người chọn phải gom.
2. **Cập nhật tuần (R1m-4).** `CapNhatTuan` luôn mở form. Trạng thái «Đã gửi» (`DaGui`) chỉ sống
   trong phiên vừa gửi; tải lại trang là form trống «Gửi 0 cập nhật», chỉ còn chữ nhỏ «Tuần này: cao»
   dưới ô mức tự tin. API đã trả `updatedThisWeek`, `lastAt`, `lastConfidence`, `currentValue` cho
   từng KR — đủ để nói «đã xong» mà không cần đổi API.
3. **Toàn cảnh (R1m-6).** Thẻ «Đơn vị đã công bố OKR» đếm đơn vị có mục tiêu **riêng**
   (`gopToanCanh` ở `apps/api/src/okr/toan-canh.ts`), còn hàng bộ phận trong bảng **gộp** mục tiêu
   của chính nó với các phòng ban con. Bộ phận chưa có mục tiêu riêng nhưng phòng ban con có thì thẻ
   ghi «Khối Hỗ trợ chưa đặt» trong khi bảng ghi 6 mục tiêu · 12 KR.
4. **R1m-7** — chủ kho chốt 04/10 là lỗi (quản trị phải thêm được mục tiêu lẻ). Vùng sửa là
   `theo-don-vi/**` và quyền API, thuộc P1; điều phối giao cho R1d (Nhật ký 13:35). Không làm ở đây.

## Hướng đã chốt (chủ kho trả lời bốn câu brainstorm, 04/10)

- **Hồi ý — thu gọn mặc định.** Bỏ `defaultOpen` ở `ThanhCongBo`. Thanh còn một hàng: «Còn N điều
  trước khi công bố · [Hiện danh sách] · [Công bố]». Bấm «Hiện danh sách» mới bung, liên kết vẫn
  cuộn tới đúng thẻ. Không đổi `SaveBar` dùng chung trong `packages/ui` (hơn 80 hồ sơ đo nó).
- **Cập nhật tuần — màn «đã xong tuần này».**
  - Mọi KR đã có cập nhật tuần này: trang mở ở trạng thái `ST-capnhat-daxong` — một `Alert` «Bạn đã
    gửi cập nhật tuần này» kèm ngày giờ lần gửi mới nhất, danh sách KR với số hiện tại và mức tự
    tin, nút «Sửa cập nhật» mở lại form: số điền sẵn, mức tự tin chưa chọn — chỉ KR được chọn mức mới được gửi, để không sinh bản ghi trùng cho KR không đổi (gap-probe P0, 04/10).
  - Gửi một phần: form như cũ, thêm một dòng «Đã gửi x/y KR tuần này» trên đầu và dấu «Đã gửi tuần
    này» trên từng KR đã gửi.
  - Chưa gửi KR nào: không đổi.
  - Vừa gửi xong trong phiên: giữ `DaGui` như cũ; tải lại thì ra `ST-capnhat-daxong`.
- **Toàn cảnh — giữ cách đếm, nói rõ.** Không đổi API. Câu của thẻ đổi thành «<tên> chưa có mục tiêu
  riêng»; câu mô tả bảng nói rõ hàng bộ phận cộng mục tiêu riêng với mục tiêu của phòng ban con, nên
  một bộ phận chưa có mục tiêu riêng vẫn có số. Dấu từng hàng («bộ phận này chưa có mục tiêu riêng»)
  cần một trường mới từ API — để sau (Later), vì đổi API kéo theo ghim lại hơn 20 hồ sơ OKR đã ký.

## Phương án đã loại

- Hồi ý: đưa danh sách điều thiếu vào trang; chỉ thu gọn ở điện thoại — chủ kho chọn thu gọn mặc định.
- Cập nhật tuần: chỉ thêm băng báo trên form — nút «Gửi» vẫn mời gửi lại, không trả lời «tôi xong chưa».
- Toàn cảnh: đổi cách đếm (bộ phận tính «đã đặt» khi phòng ban con có) — đổi API, đổi nghĩa số đã
  báo cáo cho quản trị.
- Dò tên đơn vị trong `donViChuaDat` để gắn dấu cho hàng bộ phận — hai đơn vị trùng tên là gắn
  nhầm; dữ liệu thô không được đoán.

## Chuẩn nội đã nạp

`docs/design.md` (bậc thành phần, chỉ `primary` và `destructive` được tô nền), skill
`web-design-guidelines` (khoá `feature_loop.ui_standards_skill`): trạng thái đổi phải đọc được bằng
trình đọc màn hình (`role="status"` / `aria-live`), nút mở rộng mang `aria-expanded`, không dựng lại
thứ `@crm/ui` đã có. `CONTEXT.md`: «bộ phận» là cấp trên, «Khối» chỉ là chữ trong tên do người nhập;
tên đơn vị, tên KR là dữ liệu người nhập — `translate="no"`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (Hồi ý): người chọn mở tab Hồi ý ở pha gom → thấy trọn danh sách «Ý chưa gom», thanh đáy một
  hàng «Còn N điều…» → bấm «Hiện danh sách» → bấm một điều thiếu → trang cuộn tới thẻ đó.
- Suôn sẻ (Cập nhật tuần): người phụ trách gửi cập nhật → thấy «Đã gửi…» → hôm sau mở lại từ tin nhắc
  → thấy «Bạn đã gửi cập nhật tuần này · <ngày giờ>» → muốn sửa thì bấm «Sửa cập nhật» → form điền sẵn
  → gửi lại.
- Suôn sẻ (Toàn cảnh): quản trị mở Toàn cảnh → thẻ ghi «<bộ phận> chưa có mục tiêu riêng» → bảng ghi
  rõ hàng bộ phận là số gộp.
- Biên: Cập nhật tuần gửi một phần (x/y); Hồi ý đủ điều kiện (thanh «Sẵn sàng…», không có nút danh
  sách); Toàn cảnh mọi đơn vị đã có mục tiêu riêng (câu cũ «Mọi đơn vị đã có mục tiêu công bố»).
- Lỗi & quay lại: Cập nhật tuần gửi lỗi từ form sửa → `ST-capnhat-loigui` như cũ, các ô vẫn còn.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hồi ý (pha gom, người chọn) | Gom hết ý vào chủ đề rồi công bố | tab Hỏi ý / thẻ thiếu, Công bố |
| Cập nhật tuần | Gửi số và mức tự tin tuần này cho mọi KR mình phụ trách | tin nhắc, tab / Về Của tôi |
| Toàn cảnh | Cho quản trị thấy cả công ty trong một màn | tab / Theo đơn vị, Sức khoẻ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hoiy-thanh-gon | Hồi ý | thanh một hàng «Còn N điều trước khi công bố», nút «Hiện danh sách» (`aria-expanded=false`), «Công bố» tắt | đọc ý chưa gom / bấm Hiện danh sách |
| ST-hoiy-thanh-mo | Hồi ý | thanh bung danh sách điều thiếu, mỗi điều là liên kết, nút «Ẩn danh sách» | bấm một điều → cuộn tới thẻ |
| ST-hoiy-san-sang | Hồi ý | «Sẵn sàng — N mục tiêu nháp…», không nút danh sách, «Công bố» bật | Công bố |
| ST-capnhat-dangdien | Cập nhật tuần | form như cũ (chưa gửi KR nào) | điền, Gửi |
| ST-capnhat-motphan | Cập nhật tuần | dòng «Đã gửi x/y KR tuần này», dấu «Đã gửi tuần này» trên KR đã gửi | điền KR còn lại, Gửi |
| ST-capnhat-daxong | Cập nhật tuần | `Alert` «Bạn đã gửi cập nhật tuần này» + «Lần gửi mới nhất <dd/mm> lúc <hh:mm>», danh sách KR với số và mức tự tin, nút «Sửa cập nhật», «Về Của tôi» | đi / Sửa cập nhật |
| ST-capnhat-dagui | Cập nhật tuần | như cũ (ngay sau khi gửi) | Về Của tôi |
| ST-capnhat-rong | Cập nhật tuần | như cũ — người không phụ trách KR nào, không bao giờ ra «đã xong» | Về Của tôi |
| ST-toancanh-codulieu | Toàn cảnh | thẻ «N/M · <tên> chưa có mục tiêu riêng», mô tả bảng nói hàng bộ phận là số gộp | đọc bảng |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- «Sửa cập nhật» chuyển sang form trong cùng trang, focus về ô giá trị đầu tiên; mức tự tin chưa chọn,
  nút «Gửi 0 cập nhật» tắt cho tới khi chọn mức cho ít nhất một KR; chỉ KR đã chọn được gửi.
- Thời điểm «lần gửi mới nhất» = `lastAt` lớn nhất trong các KR, hiện theo giờ Việt Nam.
- Khổ 390: cả ba màn không cuộn ngang; thanh Hồi ý thu gọn vẫn một hàng chữ + hai nút (chữ xuống dòng
  nếu dài, nút không cắt).
- Thông báo «đã gửi» nằm trong `role="status"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `SaveBar` (`@crm/ui`) | dùng | đã có `defaultOpen`; chỉ đổi cách gọi ở Hồi ý |
| `Alert`, `Item`, `StatusIndicator`, `Button`, `Card` (`@crm/ui`) | ghép | màn «đã xong» ghép từ đúng bộ `DaGui` đang dùng |
| `Badge` (`@crm/ui`) | dùng | dấu «Đã gửi tuần này» trên KR |
| `StatCard` (`@crm/ui`) | dùng | chỉ đổi chữ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: ba màn đã là một cột cuộn; vòng này không đổi khuôn, chỉ đổi trạng thái và chữ. «Đã gửi tuần
này» theo mẫu check-in của 15Five và Lattice Updates — sau khi gửi, màn check-in hiện trạng thái đã gửi
kèm nút sửa thay vì form trống. Thanh một hàng theo khuôn «contextual save bar» của Shopify Polaris.
<!-- UX-SPEC-TEMPLATE>>> -->
