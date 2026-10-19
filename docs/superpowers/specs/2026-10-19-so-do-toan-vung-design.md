# Sơ đồ ở khung toàn vùng — design (VK6, so-do-toan-vung)

Hàng VK6 của `docs/plan/lo-trinh-okr.json`, đợt `okr-vo-khu-1810` (mã V3 của `docs/plan/pham-vi-okr-vo-khu-1810.md`),
làn Mac Studio, đợt chạy `vo-khu-muc-tieu`, dãy V3. Cổng Đáng ký `build` 19/10 11:09Z.

> **Soạn trước khi VK2 gộp.** VK6 đứng trên VK2 (`vo-khu-muc-tieu`). Giám sát cho soạn S1 sớm (19/10, lối b) với
> ràng buộc: chỉ dựa vào những gì VK2 hứa — câu giao, `bat_khi` của VK2 và bản mẫu `/proto/vo-khu-muc-tieu`
> (`2790552ac`) — không đoán mã VK2 sẽ viết. Mọi chỗ phụ thuộc hình dạng thật của VK2 mang nhãn **[ĐỐI CHIẾU VK2]**.
> Khi VK2 gộp `onehub`: gộp vào nhánh, đối chiếu từng nhãn, sửa hợp đồng nếu lệch, rồi mới trình Cổng Phạm vi.

## Vấn đề

Câu giao: «Ban lãnh đạo mở Báo cáo › Sơ đồ, thấy sơ đồ góp vào chiếm trọn vùng nội dung, bấm Toàn màn hình để thu
thanh bên, và mở sơ đồ lấy tâm một mục tiêu từ ngăn của nó».

Hôm nay căn chỉnh có ba sơ đồ ở ba nơi:

| Nơi | Cách vẽ | Khung |
|---|---|---|
| Toàn cảnh › Theo đơn vị, cách xem Sơ đồ (`?xemToanCanh=so-do`, DH4) | `FlowMap` theo đơn vị, cao cố định 600 px | trong `Card` của `PageShell` mặc định (`max-w-7xl`) |
| Trang Sơ đồ quanh mục tiêu (`/okr/quanh-muc-tieu/<id>`, DH5) | `FlowMap` quanh tâm, cao 600 px | `PageShell` lồng trong `PageShell` của layout — hai vùng cuộn, lề dư (Ngoài-6 của DH5) |
| Trang đơn vị, cách xem Cây căn chỉnh (`?xemOkr=cay`, L3) | `TreeNav` thụt lề, mở hết, cao khoảng 4.100 px | `Card` trong `PageShell` |

Ba chỗ còn lại hiện căn chỉnh bằng chữ (khu «Đường lý do» và tab «Căn chỉnh» của ngăn mục tiêu, đếm «góp vào N chỗ»,
đề xuất của Kara). Những chỗ đó đúng việc của chúng và **không đổi** ở vòng này.

## Hướng

Một màn **Sơ đồ** ở nhóm Báo cáo của thanh bên khu mà VK2 dựng, theo `KhungToanVung` của bản mẫu:

- Một dải công cụ gọn ở đầu: đường mảnh «Báo cáo › Sơ đồ góp vào» (đổi thành «Báo cáo › Sơ đồ › <tên tâm>» khi lấy
  tâm), bộ lọc «Mọi đơn vị · Cần chú ý» (kiểu xem cả công ty), nút «Toàn màn hình» / «Thoát toàn màn hình». Dưới đó
  là khung vẽ chiếm phần còn lại của vùng nội dung, không bề rộng tối đa, không câu mô tả, không cuộn ở cấp tài liệu.
- Hai kiểu xem trên cùng một màn, chọn bằng đường dẫn:
  - **Cả công ty** — dữ liệu `okr.soDoDonVi`, thẻ đơn vị của DH4 (mở thẻ thấy mục tiêu kèm lý do, `moDonVi`).
  - **Quanh một mục tiêu** — tham số tâm trên đường dẫn, dữ liệu `okr.quanhMucTieu`, thẻ và dòng «Đang xem quanh» của
    DH5, một liên kết «Về sơ đồ cả công ty».
- **Toàn màn hình** là trạng thái của khung vỏ: thu thanh bên khu (`AreaSidebar` của VK1), giữ thanh biểu tượng và đầu
  ứng dụng — đúng như `anThanhBen` của bản mẫu. `AreaSidebar` chưa có cách thu: VK6 thêm nó trong `packages/ui` (luật
  «biến thể mới làm ở `packages/ui`»), không giấu bằng `className` ở chỗ gọi. Đã đối chiếu (V1 trả qua giám sát 20/10):
  VK2 không làm thu, VK6 làm chủ prop; eval đã ký của `thanh-ben-khu-dung-chung` giữ xanh. Sống trong vỏ khu khi đi giữa hai kiểu xem, mất khi tải lại, không
  đi theo đường dẫn (Hỏi-4). Esc thoát, trừ khi một ngăn, hộp thoại, menu hay thẻ đơn vị mở ra đang ở trên sơ đồ: Esc
  lúc đó đóng thứ ấy trước.
- **Chiều cao**: hai sơ đồ hôm nay cao cố định 600 px do nơi gọi đặt (`style` trên vùng bọc), không phải do `FlowMap`.
  Màn mới bỏ chiều cao cố định ở nơi gọi; `FlowMap` giữ nguyên.
- **Ngăn mục tiêu**: nút «Xem quanh mục tiêu» của DH5 thành liên kết «Xem trên sơ đồ» tới Sơ đồ lấy tâm mục tiêu đó.
  Chữ theo mục «Căn chỉnh» của `CONTEXT.md` (chốt 18/10: «"Sơ đồ góp vào" và nút "Xem trên sơ đồ"»). **[ĐỐI CHIẾU
  VK4]**: VK4 `doi-nhan-khu-muc-tieu` đổi nhãn màn theo tên mới và có thể đã đổi chữ nút; VK6 chỉ đổi đích.
- **Đường cũ**: `/okr/quanh-muc-tieu/<id>` → Sơ đồ lấy tâm `<id>`; Toàn cảnh `?xemToanCanh=so-do` → Sơ đồ cả công ty,
  giữ `moDonVi`, `locSoDo`. VK2 hứa «mọi đường dẫn cũ chuyển tới đúng chỗ mới» — **[ĐỐI CHIẾU VK2]**: nếu bảng chuyển
  hướng của VK2 đã trỏ hai đường này về Sơ đồ thì VK6 chỉ thêm phần mang tâm và tham số; nếu chưa thì VK6 thêm dòng
  vào đúng chỗ VK2 đặt bảng.
- **Bỏ trang và cách xem cũ**: xoá trang `quanh-muc-tieu/[objectiveId]` (thành chuyển hướng), bỏ cách xem Sơ đồ khỏi
  Toàn cảnh nếu VK2 còn giữ Toàn cảnh, và bỏ cách xem Cây căn chỉnh (`?xemOkr=cay` → Sơ đồ cả công ty mở sẵn thẻ đơn vị
  đang chọn — khuôn AC-13 của DH4). Phần Cây chờ Hỏi-1.

Thẻ, cạnh, rê chuột, bấm thẻ mở ngăn, danh sách dưới `md` và trạng thái tải của hai sơ đồ đã ký được dời sang màn mới,
không vẽ lại. Không đổi `FlowMap`, `flow-layout`, đầu ra của ba thủ tục `okr.soDoDonVi`, `okr.quanhMucTieu`,
`okr.cayCanChinh`.

## Phương án đã loại

- **Toàn màn hình bằng Fullscreen API của trình duyệt.** Câu giao nói «thu thanh bên», bản mẫu thu thanh bên khu và
  giữ phần còn lại; Fullscreen API cần cử chỉ người dùng, mất khi tải lại, không ghi được lên đường dẫn và đè lên lớp
  ngăn của Radix. Để Later.
- **Hai màn riêng (cả công ty và quanh mục tiêu) dưới nhóm Báo cáo.** `bat_khi` đòi «một màn Sơ đồ thay cho Cây căn
  chỉnh và trang Sơ đồ quanh mục tiêu».
- **Giữ `PageShellHeader` đầy đủ (tiêu đề lớn và câu mô tả).** Đúng cái `vi_sao` gọi là lỗi («một đầu trang lớn»).
  Cách thay chờ Hỏi-2.

## Câu chỉ người có — đã trả lời

Chủ kho trả lời cả bốn trước Cổng Phạm vi, 19/10, ở phiên V3: «Theo khuyến nghị cả bốn» (sổ d-…-12 tới d-…-16). Mỗi
câu dưới đây giữ nguyên để người đọc thấy lối đã bỏ; lối máy khuyên là lối đã chọn.

- **Hỏi-1 — bỏ Cây căn chỉnh ngay ở VK6?** Hạt giống B5
  (`docs/plan/2026-10-15-hat-giong-b5-bo-cay-sau-nghiem-thu-l3.md`, chủ kho tách 15/10) bảo bỏ Cây SAU phiên nghiệm thu
  của L3 `cay-can-chinh-co-ly-do`; phiên đó chưa có. `bat_khi` của VK6 (Cổng Đáng ký 19/10) lại ghi «một màn Sơ đồ thay
  cho Cây căn chỉnh». Máy khuyên: theo chữ mới hơn, bỏ Cây ở VK6, phiên nghiệm thu L3 đo trên Sơ đồ (lý do căn chỉnh đã
  có ở thẻ đơn vị mở ra, AC-7 của DH4). Lối khác: VK6 chỉ gộp sơ đồ quanh mục tiêu, Cây ở lại tới B5 — giá: `bat_khi`
  chưa đạt ở mốc 26/10, Cây còn là cách vẽ thứ ba. **[ĐỐI CHIẾU VK2]**: VK2/VK3 có thể đã bỏ `xemOkr` khỏi trang đơn vị.
- **Hỏi-2 — màn Sơ đồ không có `PageShellHeader`.** Nếp «Khung trang» của `docs/design.md` đòi `PageShellTitle` và một
  câu `PageShellDescription` ở mọi màn; hồ sơ đã ký `khung-man-chung` đo điều đó. Máy khuyên: Sơ đồ dùng dải công cụ
  một dòng có đường mảnh làm tiêu đề (dựng trong `page.tsx`, luôn hiện cả lúc tải và lỗi), thêm một dòng ngoại lệ «màn
  toàn vùng» vào `docs/design.md`. Lối khác: giữ đầu trang đầy đủ, thu khung vẽ — giá: mất khoảng 120 px chiều cao, trái
  `vi_sao`. **[ĐỐI CHIẾU VK2]**: VK2 có thể đã đổi khung trang của khu.
- **Hỏi-3 — sửa thước của hồ sơ đã ký.** Xoá trang quanh mục tiêu và cách xem Cây làm đỏ eval đã ký của DH5 (E4–E12,
  E15, E16), DH4 (E1 cách xem, E12 màn), L3 (E3–E8, E10, E11) và các script màn của `dat-okr-trong-crm`,
  `toan-canh-okr`, `ux-lai-thu-8c-okr`, `trang-don-vi-mot-bang`, `vung-cuon-la-khoi-chua`, `khung-man-chung`. Luật tạm
  18/10 cấm máy tự sửa thước hồ sơ đã ký. Máy khuyên: chủ kho cho theo khuôn của luật 21 (đổi đúng chỗ đo màn cũ sang
  màn mới hoặc khai `status: not-run` + `superseded_by: so-do-toan-vung#AC-n`, đo hai chiều, mỗi hồ sơ một dòng sổ `fix`
  mang `decided_by`, gửi `cham-tep`). Lối khác: giữ trang cũ sống song song — giá: `bat_khi` chưa đạt.
- **Hỏi-4 — toàn màn hình có đi theo đường dẫn không?** Câu giao và ngưỡng không nói. Máy khuyên: chế độ tạm của vỏ
  khu — giữ khi đổi kiểu xem, mất khi tải lại, người nhận đường dẫn luôn thấy thanh bên. Lối khác: ghi lên đường dẫn
  bằng `nuqs` — tải lại vẫn giữ, nhưng đường dẫn gửi đi mở ra không có thanh bên.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh bên khu › Báo cáo › Sơ đồ → khung vẽ cả công ty chiếm trọn vùng → bấm «Toàn màn hình» → thanh bên
  khu thu, khung vẽ rộng ra → Esc hoặc «Thoát toàn màn hình» → thanh bên hiện lại (điểm ra: Sơ đồ ở khung thường).
- Suôn sẻ, tâm: ngăn mục tiêu › «Xem trên sơ đồ» → Sơ đồ quanh mục tiêu, đường mảnh mang tên tâm → bấm một thẻ → ngăn
  của thẻ đó mở trên sơ đồ → «Về sơ đồ cả công ty» (điểm ra: Sơ đồ cả công ty).
- Biên: kỳ chưa có OKR; lọc Cần chú ý không còn thẻ; đang ở toàn màn hình thì mở ngăn (Esc đóng ngăn trước); đường dẫn
  cũ đã lưu trong dấu trang.
- Lỗi & quay lại: tải hỏng → `VungTaiLoi` có nút thử lại; tâm không thấy hay không có quyền → câu báo và liên kết «Về sơ
  đồ cả công ty»; dải công cụ và đường mảnh vẫn hiện ở mọi trạng thái.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Sơ đồ (cả công ty) | Thấy đơn vị nào góp vào đâu trên cả công ty | thanh bên khu, đường cũ Toàn cảnh và `?xemOkr=cay` / ngăn mục tiêu, Sơ đồ quanh mục tiêu |
| Sơ đồ (quanh một mục tiêu) | Thấy một mục tiêu góp lên đâu và ai góp vào nó | ngăn mục tiêu, đường cũ quanh mục tiêu / ngăn thẻ, Sơ đồ cả công ty |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-so-do-thuong | Sơ đồ | dải công cụ một dòng, khung vẽ chiếm trọn phần còn lại, thanh bên khu hiện | rê, bấm thẻ, lọc, bấm Toàn màn hình |
| ST-so-do-toan-man | Sơ đồ | thanh bên khu thu; nút đổi thành «Thoát toàn màn hình» | Esc hay bấm nút để thoát |
| ST-so-do-quanh | Sơ đồ | đường mảnh «Báo cáo › Sơ đồ › <tên tâm>», dòng «Đang xem quanh: <tên>», thẻ tâm đang chọn, «Về sơ đồ cả công ty» | bấm thẻ mở ngăn, về cả công ty |
| ST-so-do-dang-tai | Sơ đồ | dải công cụ thật + khung xương cùng hình, «Đang tải sơ đồ…» cho trình đọc | chờ |
| ST-so-do-loi | Sơ đồ | dải công cụ + `VungTaiLoi` «Không tải được sơ đồ» | thử lại |
| ST-so-do-khong-thay | Sơ đồ | «Không tìm thấy mục tiêu này, hoặc bạn không có quyền xem.» + «Về sơ đồ cả công ty» | về cả công ty |
| ST-so-do-rong | Sơ đồ | câu rỗng của DH4 (kỳ chưa OKR, hoặc lọc Cần chú ý không còn đơn vị) | đổi lọc hay chu kỳ |
| ST-so-do-hep | Sơ đồ (< `md`) | danh sách `Item` của DH4 / DH5, không khung vẽ, không nút Toàn màn hình | bấm dòng mở ngăn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Esc theo tầng: ngăn, hộp thoại, menu, thẻ đơn vị đang mở (AC-7 của DH4) đóng trước; chỉ khi không còn lớp nào mới
  thoát toàn màn hình.
- Tâm nằm trên đường dẫn (`nuqs`); toàn màn hình sống trong vỏ khu (Hỏi-4); đổi kiểu xem, kể cả qua ngăn › «Xem trên
  sơ đồ», giữ trạng thái toàn màn hình.
- Dưới `md`: không nút Toàn màn hình (không có khung vẽ để phóng); thanh bên khu ở đó là hàng cuộn ngang của
  `AreaSidebar`. Từ `md` thanh dọc `w-56` — thứ toàn màn hình thu. (Đối chiếu VK1 19/10: bản mẫu đổi ở `lg`, thành phần
  thật đổi ở `md`.)
- Nút Toàn màn hình có `aria-pressed`, nhãn đổi theo trạng thái; tiêu điểm ở lại trên nút sau khi bấm.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `FlowMap`, `FlowMapCard` | dùng | hai sơ đồ đã ký vẽ bằng nó; không đổi |
| `Breadcrumb` | dùng | đã có ở `packages/ui`, bản mẫu dùng cho đường mảnh |
| `ToggleGroup variant="outline" size="sm"` | dùng | nếp «Chip lọc» của `docs/design.md` |
| `Button variant="outline"` + `Icon` Maximize/Minimize | dùng | bản mẫu |
| `AreaSidebar` (VK1) | mở rộng | thêm cách thu trong `packages/ui`; vỏ khu Mục tiêu của VK2 giữ trạng thái **[ĐỐI CHIẾU VK2]** |
| Khung trang toàn vùng | mở rộng hay tạo trong `packages/ui` (bậc 5 của «Vẽ tay là bậc cuối») | `PageShell` chưa có biến thể không lề, không đầu trang; tra bậc 1–4 ở S2 |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: bảng-điều-khiển (dashboard-first)
Căn cứ: luồng hiển nhiên, không tra thêm — bản mẫu `KhungToanVung` là một mặt vẽ chiếm trọn vùng với dải công cụ, và
lượt rà Tability 18/10 (`vi_sao` của VK6) ghi Strategy map đặt trong vỏ, trọn vùng, có Full screen.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đường đo

`opportunity.md` hỏi: đã đạt «Sơ đồ không còn bề rộng tối đa của trang; một màn Sơ đồ thay cho Cây căn chỉnh và trang
Sơ đồ quanh mục tiêu; Esc thoát toàn màn hình» chưa? Ba vế đều đo được bằng máy trên cây: bề rộng khung vẽ bằng bề
rộng vùng nội dung (AC-1, E12), đường cũ tới màn mới và trang cũ không còn (AC-6, AC-7), Esc (AC-3). Không có code đo
mới.

## Đã đọc

`AGENTS.md`, `CLAUDE.md`, `docs/design.md`, `CONTEXT.md` (mục Báo cáo, Sơ đồ, Căn chỉnh, Bộ OKR), `docs/plan/pham-vi-okr-vo-khu-1810.md`,
hạt giống B5, hợp đồng DH4 và DH5, bản mẫu `vo-khu-muc-tieu` ở `2790552ac`, luật đợt và `LUAT-rieng.md`.
