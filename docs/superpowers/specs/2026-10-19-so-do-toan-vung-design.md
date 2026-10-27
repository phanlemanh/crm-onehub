# Sơ đồ ở khung toàn vùng — design (VK6, so-do-toan-vung)

Hàng VK6 của `docs/plan/lo-trinh-okr.json`, đợt `okr-vo-khu-1810` (mã V3 của `docs/plan/pham-vi-okr-vo-khu-1810.md`),
làn Mac Studio, đợt chạy `vo-khu-muc-tieu`, dãy V3. Cổng Đáng ký `build` 19/10 11:09Z.

> **Soạn trước khi VK2 gộp (19/10), đối chiếu với VK2 thật ngày 21/10** sau khi #516 gộp `onehub` (`6f9b770fb`).
> Bảng «Đối chiếu VK2» ngay dưới thay mọi nhãn **[ĐỐI CHIẾU VK2]** cũ.

## Đối chiếu VK2 và VK4 (21/10)

| Chỗ bản nháp đoán | VK2/VK4 thật trên `onehub` | VK6 làm gì |
|---|---|---|
| Đường của mục Sơ đồ | `/okr/so-do` (`DUONG_SO_DO` trong `tab-okr.ts`); trang `so-do/page.tsx` dựng `PageShellHeader` đầy đủ và **Cây căn chỉnh** (`XemCay`) — VK2 tạm lấp chỗ | Thay nội dung trang bằng màn Sơ đồ toàn vùng |
| Tâm của sơ đồ | Đoạn đường `/okr/so-do/muc-tieu/<id>`: `next.config.ts` chuyển `/okr/quanh-muc-tieu/:id` tới đó và rewrite ngược về thư mục `quanh-muc-tieu/[objectiveId]`; mục Sơ đồ sáng cả ở đường con | Tâm là đoạn đường này, không phải tham số `nuqs` (sổ mới thay d-…-10); trang đích rewrite dựng cùng màn Sơ đồ |
| Bảng chuyển hướng | Sáu quy tắc trong `redirects()` của `next.config.ts`; hồ sơ VK2 AC-5 đo «không đích nào của redirect là nguồn của redirect khác» | Không sửa `next.config.ts`. `?xemToanCanh=so-do` chuyển ở lớp trang Sức khoẻ (đích rewrite `toan-canh/`) |
| Số phận Toàn cảnh | Thành Sức khoẻ `/okr/suc-khoe`, vẫn còn cách xem Bảng · Sơ đồ (`xemToanCanh`) | Bỏ cách xem Sơ đồ khỏi Sức khoẻ |
| `?xemOkr=cay` | Còn: `CACH_XEM_OKR` có `cay`, trang Bộ OKR còn thẻ Cây | Bỏ như Hỏi-1 đã chốt |
| Khung vỏ | `KhungTrangOkr` (`soan/khung-trang-okr.tsx`) bọc mọi trang trong `PageShell` mặc định (`max-w-7xl`), trang soạn dùng `contained` | Thêm nhánh màn toàn vùng: `PageShell width="full" contained` đã có — bậc 1, không dựng khung mới |
| Thu thanh bên | `AreaSidebar` chưa có cách thu (VK2 không làm); bản mẫu bỏ dựng thanh bên chứ không thu bằng prop | Hỏi-5 — khuyên: vỏ khu thôi dựng `AreaSidebar` khi toàn màn hình; lối khác: prop thu trong `packages/ui` |
| Nút trong ngăn (VK4) | `objective-sheet.tsx` đã trỏ `/okr/so-do/muc-tieu/<id>`, chữ vẫn «Xem quanh mục tiêu» (`okr-quanh.ts` khoá `nutXemQuanh`) | Chỉ đổi chữ thành «Xem trên sơ đồ», giữ đích |

Hệ quả cho hồ sơ đã ký: eval E4 của `vo-khu-muc-tieu` đo «`/okr/so-do`: sơ đồ góp vào (CayCanChinh) có ít nhất một
nút» và AC-3 của nó kể «cây» trong danh sách kiểu xem — bỏ Cây làm đỏ hai chỗ này. Cả hai thuộc «cách xem Cây» mà
Hỏi-3 chủ kho đã cho chuyển thước theo khuôn luật 21; E11 liệt chúng cùng DH4, DH5, L3.

Vùng tạm né của đợt (`LUAT.md`): `apps/app/components/crm/record-sheet/**` và `apps/app/app/(app)/[slug]/okr/**` chỉ
được sửa sau khi #525 (VK7) gộp — S3 của VK6 bắt đầu sau mốc đó; S1 không chạm mã.

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
  - **Cả công ty** — `/okr/so-do`, dữ liệu `okr.soDoDonVi`, thẻ đơn vị của DH4 (mở thẻ thấy mục tiêu kèm lý do,
    `moDonVi`).
  - **Quanh một mục tiêu** — `/okr/so-do/muc-tieu/<id>` (đường VK2 đã đặt), dữ liệu `okr.quanhMucTieu`, thẻ và dòng
    «Đang xem quanh» của DH5, một liên kết «Về sơ đồ cả công ty» trỏ `/okr/so-do`.
  - Hai đường là hai trang trong cùng `okr/layout.tsx`; cả hai dựng một thành phần màn Sơ đồ chung, nên đổi kiểu xem
    là điều hướng phía khách trong cùng vỏ và trạng thái toàn màn hình của vỏ còn nguyên.
- **Khung**: `KhungTrangOkr` của VK2 nhận thêm một nhánh cho hai đường Sơ đồ — `PageShell width="full" contained`
  (đã có, không bề rộng tối đa, vùng cuộn là khung vẽ chứ không phải tài liệu).
- **Toàn màn hình** là trạng thái của khung vỏ: thu thanh bên khu (`AreaSidebar` của VK1), giữ thanh biểu tượng và đầu
  ứng dụng — đúng như `anThanhBen` của bản mẫu (`anThanhBen ? null : <ThanhBenKhu/>`). Nháp theo lối khuyên của
  Hỏi-5: `okr/layout.tsx` thôi dựng `AreaSidebar` khi đang toàn màn hình — không `className` giấu, không chạm
  `packages/ui`, không đụng tệp mà hồ sơ đã ký `thanh-ben-khu-dung-chung` đo. Trạng thái sống trong vỏ khu khi đi giữa
  hai kiểu xem, mất khi tải lại, không đi theo đường dẫn (Hỏi-4). Toàn màn hình chỉ có từ `md`; khung nhìn co xuống dưới
  `md` thì vỏ thoát toàn màn hình để hàng cuộn ngang của thanh bên trở lại. Esc thoát, trừ khi một ngăn, hộp thoại,
  menu hay thẻ đơn vị mở ra đang ở trên sơ đồ: Esc lúc đó đóng thứ ấy trước.
- **Chiều cao**: hai sơ đồ hôm nay cao cố định 600 px do nơi gọi đặt (`style` trên vùng bọc), không phải do `FlowMap`.
  Màn mới bỏ chiều cao cố định ở nơi gọi; `FlowMap` giữ nguyên.
- **Ngăn mục tiêu**: nút của DH5 đã trỏ `/okr/so-do/muc-tieu/<id>` (VK2); VK6 đổi chữ «Xem quanh mục tiêu» thành
  «Xem trên sơ đồ» theo mục «Căn chỉnh» của `CONTEXT.md` (chốt 18/10: «"Sơ đồ góp vào" và nút "Xem trên sơ đồ"»). VK4
  không đổi chữ nút.
- **Đường cũ**: `/okr/quanh-muc-tieu/<id>` đã tới `/okr/so-do/muc-tieu/<id>` nhờ VK2 — VK6 chỉ làm cho đích đó dựng
  màn Sơ đồ toàn vùng. Sức khoẻ (Toàn cảnh cũ) với `?xemToanCanh=so-do` → `/okr/so-do`, giữ `moDonVi`, `locSoDo`;
  chuyển ở lớp trang, không thêm quy tắc vào `next.config.ts` (luật «không đích nào là nguồn» của VK2).
- **Bỏ trang và cách xem cũ**: trang đích rewrite `quanh-muc-tieu/[objectiveId]` thôi dựng `PageShell` lồng và trang
  riêng, chỉ dựng màn Sơ đồ chung; bỏ cách xem Sơ đồ khỏi Sức khoẻ; bỏ Cây căn chỉnh ở cả `/okr/so-do` lẫn trang Bộ OKR
  (`?xemOkr=cay` → Sơ đồ cả công ty mở sẵn thẻ đơn vị đang chọn — khuôn AC-13 của DH4), như Hỏi-1 đã chốt.

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

## Câu chỉ người có — trả lời ở Cổng Phạm vi

Chủ kho duyệt 21/10 («duyệt» — nhận khuyến nghị; sổ d-20261021T074335Z-25): vỏ khu thôi dựng `AreaSidebar`.

- **Hỏi-5 — thu thanh bên bằng cách nào?** (sổ thay d-…-18, do phản biện 21/10 chỉ ra lối chết của d-…-18 không
  thật chết.) Máy khuyên: vỏ khu Mục tiêu thôi dựng `AreaSidebar` khi đang toàn màn hình, đúng như `anThanhBen` của
  bản mẫu — không chạm `packages/ui`, không đụng thước của hồ sơ đã ký `thanh-ben-khu-dung-chung`. Lối khác: thêm prop
  thu vào `AreaSidebar` trong `packages/ui` — giá: dùng lại được cho Cài đặt, Hội thoại sau này, nhưng sửa tệp hồ sơ VK1
  đang đo, phải giữ eval của nó xanh và có thể phải gửi giám sát. Hợp đồng không đổi theo câu trả lời: AC-2 đo
  `[data-slot=area-sidebar]` vắng khỏi cây truy cập, đúng với cả hai lối.

## Câu chỉ người có — đã trả lời

Chủ kho trả lời cả bốn trước Cổng Phạm vi, 19/10, ở phiên V3: «Theo khuyến nghị cả bốn» (sổ d-…-12 tới d-…-16). Mỗi
câu dưới đây giữ nguyên để người đọc thấy lối đã bỏ; lối máy khuyên là lối đã chọn.

- **Hỏi-1 — bỏ Cây căn chỉnh ngay ở VK6?** Hạt giống B5
  (`docs/plan/2026-10-15-hat-giong-b5-bo-cay-sau-nghiem-thu-l3.md`, chủ kho tách 15/10) bảo bỏ Cây SAU phiên nghiệm thu
  của L3 `cay-can-chinh-co-ly-do`; phiên đó chưa có. `bat_khi` của VK6 (Cổng Đáng ký 19/10) lại ghi «một màn Sơ đồ thay
  cho Cây căn chỉnh». Máy khuyên: theo chữ mới hơn, bỏ Cây ở VK6, phiên nghiệm thu L3 đo trên Sơ đồ (lý do căn chỉnh đã
  có ở thẻ đơn vị mở ra, AC-7 của DH4). Lối khác: VK6 chỉ gộp sơ đồ quanh mục tiêu, Cây ở lại tới B5 — giá: `bat_khi`
  chưa đạt ở mốc 26/10, Cây còn là cách vẽ thứ ba. Đối chiếu 21/10: VK2 giữ `xemOkr=cay` và còn đặt Cây làm nội dung
  tạm của `/okr/so-do`.
- **Hỏi-2 — màn Sơ đồ không có `PageShellHeader`.** Nếp «Khung trang» của `docs/design.md` đòi `PageShellTitle` và một
  câu `PageShellDescription` ở mọi màn; hồ sơ đã ký `khung-man-chung` đo điều đó. Máy khuyên: Sơ đồ dùng dải công cụ
  một dòng có đường mảnh làm tiêu đề (dựng trong `page.tsx`, luôn hiện cả lúc tải và lỗi), thêm một dòng ngoại lệ «màn
  toàn vùng» vào `docs/design.md`. Lối khác: giữ đầu trang đầy đủ, thu khung vẽ — giá: mất khoảng 120 px chiều cao, trái
  `vi_sao`. Đối chiếu 21/10: VK2 không đổi nếp khung trang; `/okr/so-do` của VK2 dựng đầu trang đầy đủ.
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
- Tâm là đoạn đường `/okr/so-do/muc-tieu/<id>`; lọc và thẻ đơn vị mở (`locSoDo`, `moDonVi`) trên đường dẫn bằng
  `nuqs`; toàn màn hình sống trong vỏ khu (Hỏi-4); đổi kiểu xem, kể cả qua ngăn › «Xem trên sơ đồ», giữ trạng thái
  toàn màn hình.
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
| `AreaSidebar` (VK1) | dùng | vỏ khu thôi dựng nó khi toàn màn hình (Hỏi-5, lối khuyên); trạng thái toàn màn hình sống ở `okr/layout.tsx` của VK2 (vỏ khu), không ở trang |
| `PageShell width="full" contained` | dùng | bậc 1: biến thể không bề rộng tối đa đã có; `KhungTrangOkr` chọn nó cho hai đường Sơ đồ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: bảng-điều-khiển (dashboard-first)
Căn cứ: luồng hiển nhiên, không tra thêm — bản mẫu `KhungToanVung` là một mặt vẽ chiếm trọn vùng với dải công cụ, và
lượt rà Tability 18/10 (`vi_sao` của VK6) ghi Strategy map đặt trong vỏ, trọn vùng, có Full screen.
<!-- UX-SPEC-TEMPLATE>>> -->

## Eval cũ thay bởi hồ sơ này

Mười ba ô của hồ sơ đã ký khai `status: not-run` kèm `superseded_by` trỏ về đây; vòng này nhận việc thay (cùng
ánh xạ với `_acceptance/so-do-toan-vung/rang/anh-xa-nghi.json`).

| Eval cũ | AC mới | Eval mới chứng |
|---|---|---|
| cay-can-chinh-co-ly-do/E3 | AC-6 | E6 |
| cay-can-chinh-co-ly-do/E4 | AC-6 | E6 |
| cay-can-chinh-co-ly-do/E5 | AC-6 | E6 |
| cay-can-chinh-co-ly-do/E6 | AC-6 | E6 |
| cay-can-chinh-co-ly-do/E7 | AC-6 | E6 |
| cay-can-chinh-co-ly-do/E8 | AC-6 | E6 |
| cay-can-chinh-co-ly-do/E10 | AC-6 | E10 |
| cay-can-chinh-co-ly-do/E11 | AC-6 | E6 |
| doi-nhan-khu-muc-tieu/E12 | AC-6 | E6 |
| toan-canh-okr/E5 | AC-6 | E6 |
| bam-kr-mo-chi-tiet-kr/E2 | AC-6 | E6 |
| so-do-can-chinh-don-vi/E12 | AC-10 | E10 |
| so-do-quanh-muc-tieu/E12 | AC-10 | E10 |

## Đường đo

`opportunity.md` hỏi: đã đạt «Sơ đồ không còn bề rộng tối đa của trang; một màn Sơ đồ thay cho Cây căn chỉnh và trang
Sơ đồ quanh mục tiêu; Esc thoát toàn màn hình» chưa? Ba vế đều đo được bằng máy trên cây: bề rộng khung vẽ bằng bề
rộng vùng nội dung (AC-1, E1, E10), đường cũ tới màn mới và trang cũ, Cây không còn (AC-5, AC-6), Esc (AC-2). Không
có code đo mới.

## Đã đọc

`AGENTS.md`, `CLAUDE.md`, `docs/design.md`, `CONTEXT.md` (mục Báo cáo, Sơ đồ, Căn chỉnh, Bộ OKR), `docs/plan/pham-vi-okr-vo-khu-1810.md`,
hạt giống B5, hợp đồng DH4 và DH5, bản mẫu `vo-khu-muc-tieu` ở `2790552ac`, luật đợt và `LUAT-rieng.md`. Đối chiếu
21/10: hợp đồng và `evals.yaml` của `vo-khu-muc-tieu` (VK2), `next.config.ts`, `okr/layout.tsx`, `tab-okr.ts`,
`soan/khung-trang-okr.tsx`, `so-do/`, `toan-canh/toan-canh.tsx`, `components/page-shell.tsx`,
`packages/ui/src/components/area-sidebar.tsx`, `objective-sheet.tsx`, `LUAT.md` của đợt `vo-khu-muc-tieu`.
