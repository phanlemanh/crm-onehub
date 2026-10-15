# Sơ đồ căn chỉnh theo đơn vị — thiết kế (DH4)

Hồ sơ: `_acceptance/so-do-can-chinh-don-vi/` · hàng DH4 của `docs/plan/lo-trinh-okr.json` · đợt
`okr-dieu-huong-1410` (mã D1–D4, D6, B5 của `docs/plan/pham-vi-okr-dieu-huong-1410.md`) · Cổng Đáng
ký 15/10 (build · archive · ngưỡng 5 giây, ≥ 2/3 người dự).

## Vấn đề

Lãnh đạo mở Toàn cảnh, chuyển sang Sơ đồ và phải thấy trong một màn đơn vị nào chưa nối lên công
ty, đơn vị nào đang trượt. Hôm nay chỉ có cây căn chỉnh thụt lề ở trang đơn vị: cao khoảng 4.100px,
mọi nhánh mở sẵn, mục tiêu góp hai chỗ hiện hai lần, và luôn hiện toàn công ty dù đang chọn đơn vị
nào.

## Cách làm đã chọn

1. **Sơ đồ là cách xem thứ hai của thẻ «Theo đơn vị» ở Toàn cảnh.** `ViewSwitch` Bảng · Sơ đồ ở
   `CardAction` của thẻ, giá trị ghi lên đường dẫn bằng `nuqs` (khoá mới `xemToanCanh`, mặc định
   `bang`). Bảng giữ làm mặc định tới khi phiên nghiệm thu đạt (chính sách của ô).
2. **Một thẻ cho mỗi đơn vị**: công ty, bộ phận, phòng ban (tổ chức cố định hai cấp; phòng ban
   chưa xếp vào bộ phận nằm dưới công ty). Thẻ mang: tên, trưởng đơn vị (hoặc «Chưa có trưởng»),
   số mục tiêu · số KR · tiến độ trung bình, ba chấm đếm KR theo tình trạng (đúng nhịp · chậm nhịp ·
   trượt), và một dòng cảnh báo khi đơn vị cần chú ý.
3. **Đường nối là căn chỉnh thật, không phải sơ đồ tổ chức.**
   - *Nét liền* từ thẻ cha xuống thẻ con khi đơn vị con có ít nhất một mục tiêu góp vào mục tiêu
     hay KR của đơn vị cha.
   - *Nét đứt* từ thẻ ông xuống thẻ cháu khi một mục tiêu của phòng ban góp thẳng vào mục tiêu hay
     KR của công ty, bỏ qua bộ phận.
   - Đơn vị không có mục tiêu nào góp lên **không có đường nào đi lên**; thẻ vẫn nằm dưới cha (dagre
     xếp bằng một cạnh ẩn) và mang nhãn «Chưa nối lên». Đây là tín hiệu ngưỡng 5 giây đo: nhìn chỗ
     không có dây.
   - Đường mang nhãn số mục tiêu khi nhiều hơn một («3 mục tiêu»).
4. **«Cần chú ý»** (D3) — đơn vị khác công ty thoả ít nhất một trong bốn: chưa có trưởng · chưa đặt
   OKR (0 mục tiêu công bố) · có mục tiêu chưa góp vào đâu · có KR trượt. «Trượt» dùng đúng hàm
   `tinhTrang` dùng chung (`packages/validation/src/okr-muc-tieu.ts`) — chỉ mục tiêu cam kết trượt
   được; không định nghĩa thứ hai. Chip lọc `ToggleGroup` «Mọi đơn vị N · Cần chú ý K», giá trị trên
   đường dẫn (`locSoDo`). Bật lọc thì thẻ không cần chú ý mờ đi và không bấm được; không đơn vị
   nào cần chú ý thì hiện một dòng «Không đơn vị nào cần chú ý trong kỳ này».
5. **Mở thẻ ngay trên sơ đồ** (D2). Bấm (hay Enter/Space khi thẻ có tiêu điểm) một thẻ thì thẻ nở
   ra, liệt kê mục tiêu của đơn vị: tên mục tiêu (mở ngăn chi tiết mục tiêu như cây hôm nay), góp
   vào đâu (tên mục tiêu/KR đích kèm đơn vị), **mức tin và câu lý do căn chỉnh** đọc từ cùng nguồn
   cạnh của cây (`canhCuaCay`) — chỗ này mang lý do của L2–L4 sang sơ đồ. Khung lia tới thẻ vừa mở
   (bỏ hiệu ứng khi `prefers-reduced-motion`). Thẻ đang mở ghi lên đường dẫn (`moDonVi`), mở lại
   đúng thẻ khi tải lại. Bấm lần nữa hay Esc thì đóng.
6. **Thu gọn theo cấp** (D4). Hơn 12 đơn vị (`SO_DO.thuGonKhiHon`) thì mặc định phòng ban gộp vào
   thẻ bộ phận: thẻ bộ phận ghi «+n phòng ban», và «k cần chú ý bên trong» khi có. Bấm nút trên thẻ
   để mở nhánh, nhánh mở ghi lên đường dẫn (`moNhanh`). Bật «Cần chú ý» thì mọi nhánh có đơn vị cần
   chú ý tự mở — thu gọn không được giấu đơn vị mà ngưỡng đo.
7. **Dưới `md`** khung vẽ thay bằng danh sách `Item variant="outline"` thụt lề theo cấp, cùng dữ
   liệu, cùng chip lọc, mỗi dòng mang «Chưa nối lên» hay «Cần chú ý» như thẻ (nếp `docs/design.md`).
8. **Khung vẽ dùng chung `FlowMap` trong `packages/ui`** (D6): tệp máy rút từ block Pro
   `@reui/flow-2` theo luật «Block có phần máy» (`docs/reui.md`) — xếp vị trí dagre, đường nối theo
   điểm uốn, thanh phóng (thu nhỏ · phóng to · vừa khung, có `aria-label`). Nạp lười
   (`next/dynamic`, `ssr: false`) chỉ khi chọn cách xem Sơ đồ, nên trang Bảng không gánh thêm gói.
   DH5 dùng lại thành phần này. **Phương án phụ thuộc là câu hỏi Cổng Phạm vi** — xem «Hỏi» dưới.
9. **Dữ liệu**: một truy vấn tRPC mới `okr.soDoDonVi({ cycleId })` cùng quyền với `okr.toanCanh`,
   tính trong một hàm thuần `gopSoDoDonVi` ở `apps/api/src/okr/so-do-don-vi.ts`: đọc mục tiêu công
   bố của kỳ (bỏ mục tiêu cá nhân, như Toàn cảnh), căn chỉnh `OkrAlignment`, cây tổ chức và trưởng
   đơn vị; tính tình trạng KR bằng `tinhTrang`. Không sửa `apps/api/src/okr/can-chinh.ts` (rào
   `cay-can-chinh-co-ly-do/rang/giu-ho-so.mjs`), không đổi `hangToanCanh` (ba hồ sơ đã ký đo nó),
   không ghi gì vào cơ sở dữ liệu.
10. **B5 — bỏ cách xem «Cây» khỏi trang đơn vị** (theo trả lời Hỏi-2): bỏ `cay` khỏi
    `CACH_XEM_OKR`; đường cũ `?xemOkr=cay` chuyển sang Toàn cảnh › Sơ đồ, mở sẵn thẻ đơn vị đang
    chọn.

## Hỏi ở Cổng Phạm vi (chỉ người có)

- **Hỏi-1 — khung vẽ.** Khuyên **React Flow + dagre** (`@xyflow/react` 12.12, `@dagrejs/dagre`
  3.1, cả hai MIT; đo 15/10 bằng `bun build --minify`: ~61 KB + ~17 KB gzip, nạp lười chỉ ở cách xem
  Sơ đồ) cùng luật «Block có phần máy» (commit đầu của nhánh). Bản mẫu đã chạy trên nó và DH5 (sơ
  đồ quanh một mục, đường dài nhiều–nhiều) cần đúng phần máy này; `docs/design.md` xếp «dựng thành
  phần mới» là bậc cuối. Lối khác: **SVG tự vẽ** (0 KB ngoài, bỏ commit luật) — giá thêm ~4–6 giờ
  máy cho xếp vị trí, đường uốn, lia/phóng, phím và tiêu điểm; DH5 có thể phải thêm thư viện sau.
- **Hỏi-2 — B5 trong vòng này.** Khuyên **làm**: lý do căn chỉnh đã có chỗ trên sơ đồ (mục 5) nên
  điều kiện «sơ đồ thay được cây» của ô đạt trong vòng; cây hôm nay hiện sai đơn vị. Giá: ghim lại
  hay nghỉ eval của hồ sơ đã ký đo cây (`cay-can-chinh-co-ly-do` sáu eval `l3_*`,
  `ux-lai-thu-8c-okr` bài `nhan-danh-sach`, bài `theo-don-vi-cay` của `okr-theo-don-vi.dom.tsx`),
  ước ~1 giờ máy; chip «Chưa có lý do» của cây mất theo (B8 của đợt đã định thay nó). Lối khác:
  **hoãn B5 tới sau phiên nghiệm thu** — giá: cây sai đơn vị còn tới chậm nhất 04/11.

## Ngoài phạm vi

D5 (DH5) · E4 · B1–B4, B6–B8 · sửa căn chỉnh từ sơ đồ · mã rút từ block Pro trong PR gửi kho hãng.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Mục tiêu › Toàn cảnh → thẻ «Theo đơn vị» → Cách xem «Sơ đồ» → nhìn chỗ không có dây
  («Chưa nối lên») → bật «Cần chú ý» → bấm thẻ đơn vị trượt → đọc mục tiêu, góp vào đâu, lý do
  (điểm ra: tên mục tiêu mở ngăn chi tiết; tên đơn vị mở trang đơn vị).
- Biên: kỳ chưa có mục tiêu công bố nào · tổ chức chỉ có công ty · hơn 12 đơn vị (thu gọn) ·
  không đơn vị nào cần chú ý · tên đơn vị rất dài · đơn vị có mục tiêu góp hai chỗ.
- Lỗi & quay lại: truy vấn hỏng → `VungTaiLoi` trong thân thẻ, nút thử lại; đổi về Bảng luôn được.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Toàn cảnh › Theo đơn vị · Sơ đồ | Chỉ ra đơn vị chưa nối và đơn vị trượt | Từ thẻ Toàn cảnh, `?xemOkr=cay` cũ / tới ngăn mục tiêu, trang đơn vị |
| Toàn cảnh › Theo đơn vị · Bảng (có sẵn) | So tiến độ các đơn vị | Mặc định / chuyển qua lại với Sơ đồ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-sodo-don-vi | Sơ đồ | Mọi thẻ, đường liền/đứt, thẻ «Chưa nối lên» không có dây | Bấm thẻ · bật lọc |
| ST-sodo-mo-don-vi | Sơ đồ | Thẻ nở ra: mục tiêu, góp vào đâu, mức tin, câu lý do; khung lia tới | Mở ngăn mục tiêu · đóng |
| ST-sodo-can-chu-y | Sơ đồ | Chỉ thẻ cần chú ý rõ, thẻ khác mờ; nhánh có đơn vị cần chú ý tự mở | Bấm thẻ cần chú ý |
| ST-sodo-thu-gon | Sơ đồ | > 12 đơn vị: bộ phận gộp phòng ban, «+n phòng ban», «k cần chú ý bên trong» | Mở nhánh |
| ST-sodo-rong | Sơ đồ | Kỳ chưa có mục tiêu công bố: thẻ công ty + «Kỳ này chưa có mục tiêu công bố» | Đổi kỳ |
| ST-sodo-khong-chu-y | Sơ đồ | Lọc «Cần chú ý» rỗng: «Không đơn vị nào cần chú ý trong kỳ này» | Về «Mọi đơn vị» |
| ST-sodo-dang-tai | Sơ đồ | Khung xương cùng hình (một thẻ trên, ba thẻ dưới), «Đang tải sơ đồ…» cho trình đọc | Chờ |
| ST-sodo-loi | Sơ đồ | `VungTaiLoi` «Không tải được sơ đồ» + thử lại | Thử lại · đổi về Bảng |
| ST-sodo-hep | Sơ đồ dưới md | Danh sách `Item` thụt lề, cùng nhãn và chip lọc | Bấm dòng mở ngăn đơn vị |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thẻ là `button` có tiêu điểm thấy được (`focus-visible`); Tab đi lần lượt các thẻ theo thứ tự
  xếp; Enter/Space mở, Esc đóng; thanh phóng bấm được bằng phím, mỗi nút có `aria-label`.
- `prefers-reduced-motion`: không lia, không phóng có hiệu ứng.
- `touch-action: manipulation` trên khung vẽ; tên dài cắt `truncate` kèm `title`.
- Đổi lọc, đổi cách xem, mở thẻ, mở nhánh đều ghi lên đường dẫn (`nuqs`); số đếm lọc thông báo qua
  `aria-live="polite"`.
- Khung vẽ cao cố định 600px từ `md`; dưới `md` không dựng khung vẽ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `FlowMap` (`packages/ui`) | tạo (rút tệp máy block Pro, bậc 4 + luật «Block có phần máy») | Kho chưa có khung vẽ nút–cạnh nào |
| `ViewSwitch`, `ToggleGroup`, `Card`, `StatusIndicator`, `Item`, `Skeleton`, `VungTaiLoi` | dùng | Nếp màn có sẵn |
| Thẻ đơn vị trên sơ đồ | ghép (`Card` + `StatusIndicator` + `Item`) | Dựng lại từ bản mẫu bằng thành phần kho |
| Dòng lý do căn chỉnh | dùng (`LyDoNoiGop`/`KaraTrace` của L2–L4) | Một nguồn cho mức tin và câu lý do |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: bảng-điều-khiển (dashboard-first)
Căn cứ: Toàn cảnh đã là màn tổng quan (StatGroup, thẻ Theo đơn vị, Heatmap); sơ đồ là một cách xem
của thẻ có sẵn, không phải màn mới. Đã đối chiếu Tability Strategy Map (thẻ theo đơn vị, đường theo
căn chỉnh) qua lượt rà 14/10 — rút: tách sơ đồ theo đơn vị khỏi sơ đồ quanh một mục.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm thử

- API: `apps/api/test/okr-so-do-don-vi.spec.ts` gọi `gopSoDoDonVi` thật trên bộ dữ liệu sinh trong
  bài (công ty, hai bộ phận, phòng ban chưa xếp; mục tiêu góp cha, góp thẳng, không góp; KR trượt;
  đơn vị không trưởng) — ma trận viết trước mỗi đơn vị × bốn cờ «Cần chú ý» + loại đường.
- DOM: `apps/app/test/okr-so-do-don-vi.dom.tsx` dựng thành phần sơ đồ với dữ liệu parse bằng schema
  đầu ra thật của truy vấn; kiểm thẻ «Chưa nối lên», chip lọc, mở thẻ, lý do, thu gọn, danh sách hẹp.
- UI: ui-check trên bản đang chạy ở 1440 và 390 cho các trạng thái ở bảng trên.
