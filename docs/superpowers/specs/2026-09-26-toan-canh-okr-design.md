# Thiết kế — toan-canh-okr (lượt 5 lộ trình OKR)

Hồ sơ: `_acceptance/toan-canh-okr/` (Cổng Đáng ký 2026-09-26 theo uỷ quyền).
Bản mẫu: `/proto/ban-mau-okr` (đã duyệt 2026-09-24) và `/proto/toan-canh-okr`
(design-pass lượt này, 22 trạng thái). Luật đã đọc: `AGENTS.md`, `docs/design.md`
(kể cả «Vẽ tay là bậc cuối»), `docs/api.md` (tRPC, cây tổ chức, OKR), `docs/settings.md`,
`docs/proto.md`, `docs/reui.md`, `docs/telemetry.md`, `CONTEXT.md` (mục OKR, Bộ phận,
Phòng ban, Đơn vị, Trưởng đơn vị, Mức tự tin, Phạm vi dữ liệu); skill `nuqs`,
`no-use-effect`, `nestjs-trpc`, `web-design-guidelines`, `dataviz`.

## 1. Mục đích và ranh giới

Câu giao: «Cả công ty nhìn được toàn cảnh và họp tuần trên cùng một màn.» Phủ mã
XEM-02 (danh sách theo đơn vị có lọc), XEM-03 (chi tiết mục tiêu đầy đủ — diễn
biến), XEM-04 (cây căn chỉnh toàn công ty, bàn phím), XEM-05 (bảng họp tuần),
XEM-06 (toàn cảnh + heatmap), XEM-07 (khối OKR trên Tổng quan và trang một người),
QT-04 (sức khoẻ chương trình).

Hạng T2: không bảng mới, không `migration`, không chạm quyền. Mọi số đọc từ bảng
có sẵn (lượt 3) và bảng lần cập nhật (lượt 4). Lượt này chỉ **đọc**, trừ một dòng
vết «mở bảng họp tuần» (mục 4).

### Hai nhịp

Lượt 4 (`cap-nhat-tuan-okr`) chưa lên `onehub`. Lượt này chia hai nhịp trên cùng
một nhánh, cùng một hợp đồng:

| Nhịp | Khi | Gồm |
|---|---|---|
| 1 | ngay | biến thể `packages/ui`; `okr.danhSach` (lọc đơn vị + con, người, loại, trạng thái); cây đơn vị và cây căn chỉnh đi bằng bàn phím; `okr.toanCanh` phần tiến độ; `okr.sucKhoe` phần KR chưa có khởi điểm và người chưa nối kênh; thanh tiến độ trung tính ở mọi màn OKR |
| 2 | sau khi lượt 4 gộp và nhánh này gộp `origin/onehub` | lọc theo mức tự tin; `okr.hopTuan` + đếm mở bảng; toàn cảnh phần tự tin và heatmap; `okr.dienBien` trên sheet; `okr.khoiCuaToi` trên Tổng quan và trang một người; sức khoẻ phần cập nhật đúng tuần và KR im; chọn chu kỳ thay `Select` ở đầu khu (sau vòng «Sửa bốn điểm giao diện OKR» gộp) |

Hợp đồng chỉ lên `implemented` khi xong cả hai nhịp. Tiêu chí của nhịp 2 ghi rõ
«(nhịp 2)».

## 2. Dữ liệu đọc

Không thêm cột, không thêm bảng. Đọc:

- Lượt 3: `OkrCycle`, `OkrObjective`, `OkrKeyResult`, `OkrAlignment`,
  `OkrProgramConfig`, `OkrTrail`; cây tổ chức qua `ToChucService.tree()`.
- Lượt 4 (nhịp 2): `OkrCheckIn` (`keyResultId`, `weekStart` ngày thứ Hai giờ Việt
  Nam, `value`, `confidence` ∈ `cao|vua|thap`, `note`, `createdAt`); hằng
  `OKR_NHAC.imNgay` (14) từ `@crm/db/okr-nhac`; hàm `dauTuanVN` từ
  `@crm/db/onboarding-nhac`. Không chép mã lượt 4 — nhập sau khi gộp.
- Kênh nhắc: người «đã nối kênh» khi có `ZaloLink` hoặc `SlackMemberMatch` với
  `slackUserId` khác rỗng — cùng luật kết quả `khong-slack`/`khong-khop` của lượt 4.

Chỉ mục mục tiêu đang «tính» trong số đo: `status = cong-bo` (đã bỏ và nháp không
vào tiến độ). Riêng sức khoẻ đếm KR của mục tiêu `nhap` ở kỳ đang chạy là «chưa
có khởi điểm» (giả định 5 của hồ sơ cơ hội — quyết ở Cổng Phạm vi).

## 3. API — `OkrXemService`, nối vào router `okr`

Tệp mới trong `apps/api/src/okr/`: `okr-xem.service.ts` (Prisma), `okr-xem.contracts.ts`
(Zod vào/ra), `toan-canh.ts`, `hop-tuan.ts`, `dien-bien.ts` (hàm thuần, thử không cần
cơ sở dữ liệu). `okr.router.ts` chỉ **nối thêm** thủ tục ở cuối; `okr.module.ts` thêm
một provider; `OkrService.docMucTieu` đổi `private` → công khai để danh sách dùng
lại đúng một cách đổi hàng thành `MucTieuOutput`.

| Thủ tục | Vào | Ra | Nhịp |
|---|---|---|---|
| `danhSach` | `{cycleId, unit, loc: {phuTrach[], loai[], trangThai[], tuTin[]}}` | `{rows: (MucTieuOutput & {krKhop: string[]})[], total, facetCounts}` | 1 (`tuTin`: 2) |
| `toanCanh` | `{cycleId}` | `{tongQuan, hang[], tuan[]}` | 1 + 2 |
| `hopTuan` | `{cycleId, unit}` | `{tuan, dangBan[], conLai[], daCapNhat, tongKr}` | 2 |
| `moHopTuan` | `{cycleId, unit}` | `{ghi: boolean}` | 2 |
| `dienBien` | `{keyResultId}` | `{kieu, dich, diem[]}` | 2 |
| `khoiCuaToi` | `{cycleId, userId?}` | `{kr[], tong}` | 2 |
| `sucKhoe` | `{cycleId}` | `{tongQuan, hang[]}` — chỉ quản trị | 1 + 2 |

- **Đơn vị gồm con.** `unit` là `donViChon` có sẵn. `bp:<id>` lấy mục tiêu của bộ
  phận **và** mọi phòng ban sống trong nó (đọc từ `tree()`, một câu `IN`);
  `nguoi:<id>` lấy mục tiêu người đó là người phụ trách, là chủ cá nhân, tham gia,
  hoặc phụ trách ít nhất một KR — cùng luật `mine`.
- **Lọc ở Prisma**, không ở bộ nhớ: `phuTrach` khớp người phụ trách mục tiêu **hoặc**
  người phụ trách một KR; `tuTin` khớp mục tiêu có KR mà lần cập nhật mới nhất mang
  mức đó. `krKhop` là KR khớp bộ lọc KR (để màn mở sẵn). `facetCounts` đếm mỗi giá trị
  trên tập đã lọc theo mọi mặt **trừ** mặt của chính nó (chọn một người vẫn thấy số của
  người khác để chọn thêm) — số câu hỏi cố định theo số mặt, không theo số mục tiêu.
- **Toàn cảnh** trả hàng theo thứ tự cây: OneHub, rồi từng bộ phận kèm các phòng ban
  của nó, rồi phòng ban chưa xếp. Hàng bộ phận gộp mục tiêu của chính nó và của phòng
  ban con. Mỗi hàng: tiến độ trung bình (mục tiêu đã công bố, cùng công thức
  `tienDoMucTieu`), lẽ ra trung bình, số mục tiêu, số KR; nhịp 2 thêm phân bố tự tin,
  KR đã cập nhật tuần này, một câu «đáng bàn» (lý do mạnh nhất theo luật họp tuần), và
  dãy heatmap theo tuần của kỳ: tỷ lệ KR có lần cập nhật **mức cao** trong số KR có
  cập nhật tuần đó, `null` khi không ai cập nhật hoặc tuần chưa tới. `tongQuan`: tiến
  độ trung bình toàn công ty, lẽ ra, đơn vị đã công bố / tổng đơn vị có trưởng hoặc có
  người, tên các đơn vị chưa đặt; nhịp 2 thêm KR đã cập nhật tuần này, KR tự tin thấp
  và số tuần trước.
- **Họp tuần** (hàm thuần `xepHopTuan`): mỗi KR của mục tiêu đã công bố thuộc đơn vị
  (gồm con) mang lý do: **tự tin tụt** — lần cập nhật mới nhất trong tuần này thấp hơn
  lần ngay trước; **im** — không lần cập nhật nào từ `OKR_NHAC.imNgay` ngày (tính từ
  lần cuối, hoặc từ ngày khoá khởi điểm nếu chưa có); **ghi chú mới** — có ghi chú khác
  rỗng từ đầu tuần trước. Thứ tự: có «tự tin tụt» trước (tụt hai bậc trước tụt một
  bậc), rồi «im» dài trước, rồi «ghi chú mới» mới trước, rồi thứ tự KR trong mục tiêu.
  KR không lý do vào `conLai`. Không có danh sách người.
- **Diễn biến**: một điểm mỗi tuần của kỳ, giá trị là lần cập nhật cuối trong tuần,
  «lẽ ra» nội suy thẳng từ khởi điểm tới đích theo `kyVongTheoNgay` của thứ Hai tuần
  đó, mức tự tin của lần đó, ghi chú. KR mốc: không có giá trị số, chỉ dãy mức tự tin và
  ghi chú.
- **Khối của tôi**: KR mà người (mặc định người xem) phụ trách trong kỳ, xếp: trượt,
  chậm nhịp, mốc chưa xong, tự tin thấp (nhịp 2) lên trước; trả tối đa năm và tổng.
- **Sức khoẻ**: chỉ quản trị (`canManageProgram`), còn lại 403 câu ghim. Mỗi hàng đơn
  vị: KR đang tính, «KR của mục tiêu chưa công bố» (nhãn chốt tại Cổng Phạm vi), người chưa nối kênh (người lấy phòng ban
  chính; bộ phận gộp con), trưởng hoặc «chưa có trưởng»; nhịp 2: KR cập nhật đúng tuần
  (có lần cập nhật với `weekStart` bằng tuần vừa qua), KR im.
- **Số câu hỏi cố định, dưới 1 giây.** Mỗi thủ tục đọc bằng một số câu
  `findMany`/`groupBy` không đổi theo số đơn vị, rồi gộp trong hàm thuần. Cây tổ chức
  đọc một lần mỗi lời gọi. Ngưỡng: dưới 1.000 ms trên bộ 50 đơn vị × 2.000 KR (giả định
  3 của hồ sơ cơ hội).
- **Mọi tab đọc theo kỳ đang chọn.** `kyOkr` giải qua `giaiKy` ở mọi trang máy chủ và
  mọi truy vấn khách; không trang nào tự lấy kỳ đang chạy khi URL đã chọn kỳ khác.

## 4. Đếm «mở bảng họp tuần» — đường đo của Cổng Giá trị

Cổng Đáng đòi nguồn bền. Telemetry của kho là sự kiện ẩn danh theo cả bản cài
(`docs/telemetry.md`: không người dùng, không `identify`, gửi ra ngoài), nên không
đếm được «trưởng nào mở tuần nào» và trái luật không gửi số OKR ra ngoài. Bảng chỉ
thêm mới thì chạm `packages/db/prisma` → T3. Chọn: **bảng vết OKR sẵn có**
(`OkrTrail`, chỉ thêm), hành động mới `mo-hop-tuan` trong `HANH_DONG_VET` (khuôn
Zod, không `migration`), `objectiveId` rỗng, `cycleId` là kỳ, `after = {donVi, tuan}`.

- `hopTuan` là thủ tục **đọc thuần**. Việc ghi là một thủ tục riêng `moHopTuan({cycleId,
  unit})`, màn gọi **một lần khi cách xem Họp tuần gắn vào trang** cho đơn vị đó
  (`useMountEffect` đặt khoá theo đơn vị) — làm mới dữ liệu, đổi bộ lọc không gọi lại.
  Máy chủ bỏ qua lời gọi trùng người × đơn vị trong `OKR_XEM.moHopTuan.gopPhut` (30
  phút) để tải lại trang giữa chừng không thành lượt mới. Mỗi lượt mở bảng một dòng
  (chốt tại Cổng Phạm vi); câu đếm đếm đơn vị khác nhau nên số dòng thừa không làm
  sai tỷ lệ.
- Chỉ ghi khi người mở là trưởng của đơn vị đó hoặc của bộ phận chứa nó; người khác
  mở không ghi (số đo là của trưởng).
- Dòng **không mang `objectiveId` hay `keyResultId`** — tab «Vết» của sheet đọc theo
  `objectiveId` nên không thấy; hôm nay không màn nào đọc vết theo chu kỳ, và mọi chỗ
  đọc vết theo chu kỳ về sau phải lọc bỏ `mo-hop-tuan` (phép đo E30 khẳng định).
- Hình dòng ghim: `after = {donVi: "pb:<id>" | "bp:<id>", tuan: "YYYY-MM-DD"}` — `tuan` là **chuỗi** ngày thứ Hai theo giờ Việt Nam từ `dauTuanVN`, không phải `Date` (một `Date` đầu tuần giờ Việt Nam ra JSON là `…T17:00:00.000Z` của ngày hôm trước và câu SQL so chuỗi sẽ đếm 0).
- Dòng vết đơn vị không hiện ở tab «Vết» của sheet (sheet đọc theo `objectiveId`).
- Câu đếm ở `_acceptance/toan-canh-okr/rang/ty-le-mo-hop-tuan.sql`: tử số = đơn vị
  chưa lưu trữ có trưởng mà trưởng có dòng `mo-hop-tuan` của đơn vị đó trong tuần;
  mẫu số = đơn vị chưa lưu trữ có trưởng. Đọc số ngày 2026-11-23 cho tuần 2026-11-16.

## 5. `packages/ui` — biến thể mới

Thứ tự bậc «Vẽ tay là bậc cuối» (tra 2026-09-26): bậc 1 `packages/ui` — không có
cây, heatmap, biểu đồ đường có đích, chọn chu kỳ; `progress` chỉ tô `bg-primary`;
`chart.tsx` có `LineChart`/`ReferenceLine` nhưng chưa ai bọc. Bậc 2 shadcn gốc —
không có tree/heatmap. Bậc 3 ReUI miễn phí — `search("tree view keyboard navigation
expand collapse")` trả **`@reui/tree`** (dựng trên `@headless-tree`, có sẵn bàn phím
WAI-ARIA) → **cây dừng ở bậc 3**; `search("heatmap grid calendar intensity cells")`
không có gì khớp (máy chủ báo `weakMatch`). Bậc 4 block Pro chỉ là bố cục. Các
thành phần còn lại dừng ở **bậc 5 — dựng mới trong `packages/ui`**:

| Thành phần | Tệp | API chính |
|---|---|---|
| Cây nhiều cấp (bậc 3) | `reui/tree.tsx` (cài `@reui/tree`, `--dry-run` trước, sửa bốn chỗ của `docs/reui.md`: `cn`, chú thích, icon Carbon, màu/góc) + `tree-nav.tsx` (mới, bọc mỏng) | `TreeNav({label, nodes, expanded, onExpandedChange, selectedId, onSelect, renderLabel})` dựng instance `useTree` với `hotkeysCoreFeature` + `syncDataLoaderFeature`; WAI-ARIA Tree View: `role="tree"`/`treeitem`, `aria-level`/`setsize`/`posinset`/`expanded`/`selected`; một điểm dừng tab; ↑↓ đi, → mở hoặc vào con, ← gập hoặc về cha, Home/End, Enter chọn |
| Thanh tiến độ trung tính | `progress.tsx` (sửa — thêm biến thể) | `Progress({variant: "neutral", value, expected, label})`: nền `muted`, phần đi `muted-foreground`, vạch `foreground` 2px ở `expected`; `expected` rỗng → không vạch (KR mốc); nhãn cho trình đọc «X%, lẽ ra đã tới Y%». Biến thể mặc định không đổi |
| Cặp tự tin / tình trạng | `okr-status.tsx` (mới) | `ConfidenceIndicator({level})` Cao·Vừa·Thấp ↔ success·warning·error; `PaceIndicator({pace})` Đúng nhịp·Chậm nhịp·Trượt·Chưa có vạch·Mốc xong·Mốc chưa xong; tham vọng không bao giờ đỏ (luật `tinhTrang` sẵn có); chữ từ `messages.ts` vi/en |
| Biểu đồ đường có đích | `target-line-chart.tsx` (mới) | bọc `LineChart`/`Line`/`ReferenceLine` của `chart.tsx`: một chuỗi giá trị (liền), «lẽ ra» (đứt), vạch đích có nhãn trực tiếp, tuần chưa tới là khoảng trống, một trục, tooltip mặc định; `aria-label` và bảng ẩn cho trình đọc |
| Chọn chu kỳ | `period-select.tsx` (mới) | `PeriodSelect({label, groups: {label, items: {value, label, current?, closed?}[]}[], value, onValueChange})`: nhóm theo năm, quý nằm trong năm, «hiện tại» và «đã đóng» mang chữ, không chỉ màu |
| Heatmap | `heatmap.tsx` (mới) | `Heatmap({caption, rows: {id, label, indent?}[], columns: {id, label, current?}[], values, formatValue, legend})`: năm bậc `foreground` theo độ trong, ô rỗng viền đứt có chữ ẩn «chưa có», cột tên dính trái, tự cuộn tới cột hiện tại (`useMountEffect`); thang và màu chữ ghim ở bảng dưới |

**Thang heatmap — ghim, tính từ token thật** (nền sáng `--background` ≈ #fafafa,
chữ `--foreground` ≈ #171717; nền tối #000, chữ #ededed; tỷ lệ WCAG của chữ trên
nền pha):

| Bậc | Giá trị ô | Lớp nền | Chữ | Nền sáng | Nền tối |
|---|---|---|---|---|---|
| 0 | ≤ 0% | `foreground/5` | `foreground` | 15,5 | 16,8 |
| 1 | ≤ 25% | `foreground/15` | `foreground` | 12,5 | 13,4 |
| 2 | ≤ 50% | `foreground/30` | `foreground` | 8,8 | 7,9 |
| 3 | ≤ 75% | `foreground/65` | `background` | 5,5 | 7,5 |
| 4 | > 75% | `foreground/85` | `background` | 11,0 | 12,8 |

Thang bản mẫu (0/10/25/45/70%) bị bỏ: bậc 45% chỉ đạt 4,6 ở nền tối, bậc 70% với
chữ tối chỉ 2,6 ở nền sáng — phản biện context sạch bắt, bảng trên tính lại.

Luật chung cho sáu thành phần: không mặc định chuỗi trong tham số destructure (bài
`lai-ra-man` đếm), `?? "x"` ở chỗ dùng; chữ qua `useMessages()` với ca vi/en trong
`render-diff.spec.tsx`; không `Intl` ở mức module; bài `*.dom.tsx` riêng mỗi thành phần.

**Để sau (Nhóm 2 của bản mẫu, không trong lượt này):** `ToggleGroup` cỡ chạm 44px
(bề mặt là «Cập nhật tuần» của lượt 4), `Tabs` biến thể thanh khu và `StatGroup` bo
góc (vá chỗ gọi đang chạy; `thanh-tab.tsx` lượt 4 đang sửa), `DetailSheetHeader` ô
biểu tượng và `DetailSheetStats` cắt chữ (việc của khung record sheet mọi loại bản
ghi). Sổ quyết định ghi từng mục.

## 6. Ứng dụng — khu `okr/`

| Khối | Tệp | Bậc dừng |
|---|---|---|
| Bộ lọc «Theo đơn vị» | `okr/loc-okr.tsx` (mới) — `DataTableFacetMenu` + nút «Bỏ lọc»; tham số URL qua `nuqs` | 1 |
| Danh sách theo đơn vị | `okr/theo-don-vi/theo-don-vi.tsx` (sửa: `okr.danhSach` thay `byUnit`; cách xem thứ ba «Họp tuần») | 1 |
| Cây đơn vị | `okr/cay-don-vi.tsx` (sửa: `TreeNav`) | 3 (`@reui/tree`) |
| Cây căn chỉnh | `okr/cay-can-chinh.tsx` (sửa: `TreeNav`, gập mở từng nhánh) | 3 (`@reui/tree`) |
| Tiến độ và tình trạng | `okr/tien-do-kr.tsx` (sửa: `Progress variant="neutral"`, `PaceIndicator`, `ConfidenceIndicator`) | 5 |
| Toàn cảnh | `okr/toan-canh/page.tsx` (sửa), `okr/toan-canh/toan-canh.tsx` (mới): `StatGroup` + `StatCard`, `SimpleTable` theo đơn vị, `Heatmap` (nhịp 2), nút «Sức khoẻ chương trình» chỉ quản trị | 1 + 5 |
| Bảng họp tuần | `okr/hop-tuan.tsx` (mới, nhịp 2): `Card` + `SimpleTable`, `Collapsible` «Còn lại» | 1 |
| Sức khoẻ chương trình | `okr/suc-khoe/page.tsx`, `okr/suc-khoe/suc-khoe.tsx` (mới): `Breadcrumb`, `StatGroup`, `SimpleTable` | 1 |
| Trang một người | `okr/theo-don-vi/theo-don-vi.tsx` khi `donOkr=nguoi:<id>`: `Card` đầu trang người + `okr/khoi-kr-cua-toi.tsx` | 1 |
| Khối Tổng quan (nhịp 2) | `okr/khoi-kr-cua-toi.tsx` (mới), gắn một dòng vào `dashboard-summary.tsx` và `tong-quan-chi-okr.tsx` | 1 |
| Diễn biến trên sheet (nhịp 2) | `components/crm/record-sheet/objective-dien-bien.tsx` (mới), một tab trong `objective-sheet.tsx` | 5 (`target-line-chart.tsx`) |
| Chọn chu kỳ (nhịp 2) | `okr/chon-chu-ky.tsx` dùng `PeriodSelect` | 5 |

Chữ mới ở `apps/app/lib/messages/okr-toan-canh.ts` (tệp riêng; `okr.ts` lượt 4 đang
sửa). Hàm ghép chữ nhận đối số vô hướng (bài `messages-guard`).

Tham số URL mới trong `lib/search-param-keys.ts`: `phuTrachOkr`, `loaiOkr`,
`trangThaiOkr`, `tuTinOkr` (mảng, `parseAsArrayOf`); `xemOkr` thêm `hop-tuan`.

## 7. Tệp chung với vòng khác — ghi để gộp

| Tệp | Lượt 4 | Vòng «bốn điểm» | Lượt này làm gì |
|---|---|---|---|
| `apps/api/src/okr/okr.router.ts`, `okr.module.ts` | sửa | — | nối thêm thủ tục/provider ở cuối |
| `apps/api/src/okr/okr.service.ts` | sửa | — | một chữ: `docMucTieu` công khai |
| `apps/api/src/generated/server.ts` | sinh lại | — | sinh lại sau khi gộp |
| `packages/validation/src/okr-vet.ts` | thêm hành động | — | thêm `mo-hop-tuan` |
| `apps/app/lib/messages/okr.ts` | sửa | có thể | không sửa (tệp riêng) trừ nhãn vết `mo-hop-tuan` |
| `apps/app/app/(app)/[slug]/okr/okr-search-params.ts`, `lib/search-param-keys.ts` | sửa | — | thêm khoá |
| `okr/theo-don-vi/theo-don-vi.tsx`, `okr/tien-do-kr.tsx`, `okr/cay-don-vi.tsx`, `okr/cay-can-chinh.tsx` | có thể | — | sửa |
| `dashboard-summary.tsx`, `tong-quan-chi-okr.tsx`, `objective-sheet.tsx` | sửa | — | nhịp 2, sau khi gộp |
| `okr/chon-chu-ky.tsx` | — | sửa | nhịp 2, sau khi vòng đó gộp |
| `_acceptance/config.yaml` | thêm khoá | — | thêm khoá `tco_*` |

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: trưởng đơn vị mở OKR › Theo đơn vị (đơn vị mình đã chọn từ URL) → «Cách xem: Họp tuần» → đọc KR đáng bàn từ trên xuống, bấm dòng mở sheet KR → «Diễn biến» xem đường giá trị có đích → đóng sheet quay lại đúng dòng (điểm ra: hết danh sách «Đáng bàn»).
- Suôn sẻ: lãnh đạo mở OKR › Toàn cảnh → bảng theo đơn vị (bộ phận gộp phòng ban) → heatmap tuần → bấm tên đơn vị sang Theo đơn vị của đơn vị đó.
- Suôn sẻ: quản trị mở Toàn cảnh → «Sức khoẻ chương trình» → bảng theo đơn vị → «Toàn cảnh» ở breadcrumb để quay lại.
- Biên: chưa có lần cập nhật nào (tuần đầu) — họp tuần và heatmap trống có câu hẹn ngày; tuần yên ắng — «Không KR nào đáng bàn», phần «Còn lại» vẫn mở được; lọc không khớp — rỗng có «Bỏ lọc»; đơn vị chưa có trưởng — sức khoẻ ghi chữ «Chưa có trưởng»; không phải quản trị mở đường sức khoẻ — trang nói chỉ quản trị xem được, trỏ về Toàn cảnh.
- Lỗi & quay lại: mỗi khối tải lỗi → `Empty` có «Thử lại», khối khác vẫn chạy; toàn cảnh lỗi trỏ sang Theo đơn vị.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Theo đơn vị — Danh sách có lọc | tìm mục tiêu của một đơn vị theo người, loại, trạng thái, mức tự tin | tab / sheet mục tiêu |
| Theo đơn vị — Cây căn chỉnh | thấy toàn công ty góp vào đâu, đi bằng bàn phím | tab / sheet mục tiêu |
| Theo đơn vị — Họp tuần | chạy họp tuần theo KR đáng bàn | tab, tin nhắc / sheet KR |
| Theo đơn vị — một người | xem OKR của một người | bấm tên người / sheet |
| Toàn cảnh | so tiến độ và mức tự tin giữa các đơn vị | tab / Theo đơn vị, Sức khoẻ |
| Sức khoẻ chương trình | biết đơn vị nào cần kèm | nút trên Toàn cảnh (quản trị) / Toàn cảnh |
| Tổng quan — khối OKR | thấy KR của mình đáng lo nhất | trang chủ / khu OKR |
| Sheet mục tiêu — Diễn biến | xem một KR đi thế nào từng tuần so với đích | sheet / sheet |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-donvi-loc | Danh sách | menu lọc có số đếm, «Bỏ lọc», mục tiêu khớp với KR khớp mở sẵn | đổi lọc / mở sheet |
| ST-donvi-loc-khongkhop | Danh sách | «Không mục tiêu nào khớp bộ lọc» + «Bỏ lọc» | bỏ lọc |
| ST-donvi-caycanchinh | Cây căn chỉnh | cây `role=tree`, nhánh gập mở, lặp lại ghi «cũng hiện ở chỗ góp kia», nhóm «Chưa căn chỉnh vào đâu» | mũi tên / Enter mở sheet |
| ST-hoptuan-codulieu | Họp tuần | «Đáng bàn tuần này (n)», dòng KR có lý do chấm + chữ, tiến độ có vạch, ghi chú mới nhất; «Còn lại n KR» gập | mở KR |
| ST-hoptuan-yenang | Họp tuần | «Tuần này không KR nào đáng bàn» + «Còn lại» | mở «Còn lại» |
| ST-hoptuan-tuandau | Họp tuần | «Chưa có lần cập nhật nào để bàn» + ngày cập nhật đầu | chờ |
| ST-hoptuan-dangtai / ST-hoptuan-loi | Họp tuần | khung xương / `Empty` «Thử lại» | chờ / thử lại |
| ST-toancanh-codulieu | Toàn cảnh | bốn thẻ số, bảng theo đơn vị, heatmap | bấm đơn vị |
| ST-toancanh-tuandau | Toàn cảnh | thẻ số «—», câu hẹn ngày, heatmap toàn ô rỗng | chờ |
| ST-toancanh-dangtai / ST-toancanh-loi | Toàn cảnh | khung xương / `Empty` «Thử lại» trỏ Theo đơn vị | chờ / thử lại |
| ST-suckhoe-codulieu | Sức khoẻ | bốn thẻ số, bảng đơn vị với trưởng hoặc «Chưa có trưởng» | quay Toàn cảnh |
| ST-suckhoe-khongquyen | Sức khoẻ | «Chỉ quản trị xem được sức khoẻ chương trình» | về Toàn cảnh |
| ST-suckhoe-dangtai / ST-suckhoe-loi | Sức khoẻ | khung xương / `Empty` «Thử lại» | chờ / thử lại |
| ST-tongquan-khoi / ST-tongquan-rong / ST-tongquan-chiokr | Tổng quan | bảng KR của tôi xếp đáng lo lên đầu / câu chưa phụ trách + mục tiêu OneHub / như trên cho vai «chỉ OKR» | «Mở OKR» |
| ST-nguoi-codulieu / ST-nguoi-rong | một người | đầu trang người + khối KR + mục tiêu tham gia / «chưa phụ trách KR nào» | mở sheet / xem phòng ban |
| ST-dienbien-so / ST-dienbien-moc / ST-dienbien-chuaco | Sheet | biểu đồ đường có đích + dãy tự tin / dòng thời gian mốc / «Chưa có lần cập nhật nào» | chọn KR khác |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bàn phím trong cây: một điểm dừng tab; ↑↓ Home End; → mở hoặc vào con; ← gập hoặc về cha; Enter mở sheet; tiêu điểm hiện rõ.
- Lọc đổi URL (`history: replace`), đọc lại được khi tải trang; mọi lọc chạy ở máy chủ.
- 390px: bảng giữ một cột chính, tiến độ gấp vào ô KR, cột phụ ẩn; heatmap cuộn ngang trong khung `relative`, cột tên dính trái, tự tới tuần hiện tại; không trang nào tràn ngang.
- Chữ người nhập (tên mục tiêu, KR, người, đơn vị, ghi chú) mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DataTableFacetMenu` | dùng | menu lọc sẵn có, có số đếm |
| `SimpleTable`, `Card`, `StatGroup`, `StatCard`, `Empty`, `Breadcrumb`, `Collapsible` | dùng | bậc 1 đủ |
| `Progress` | mở rộng | thêm biến thể trung tính có vạch |
| `@reui/tree` + `TreeNav` | dùng (bậc 3) + ghép | ReUI miễn phí có sẵn bàn phím |
| `Heatmap`, `TargetLineChart`, `PeriodSelect`, `ConfidenceIndicator`/`PaceIndicator` | tạo | chưa có ở bậc 1–4 (mục 5) |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: khu OKR đã là danh-sách-chi-tiết (cây đơn vị trái, nội dung phải, sheet chi tiết); họp tuần và một người là cách xem của cùng khung, Toàn cảnh và Sức khoẻ là bảng-điều-khiển con trong khu. Hai chỗ đặt còn mở (họp tuần, sức khoẻ) đã bày thành hướng A/B ghim trên bản mẫu `/proto/toan-canh-okr`; tra mẫu ngành: Profit.co gom cập nhật tuần có tự tin và vướng mắc, Perdoo có bản đồ căn chỉnh toàn tổ chức.
<!-- UX-SPEC-TEMPLATE>>> -->

## 8. Kiểm chứng

- API: `apps/api/test/okr-toan-canh.spec.ts` (sàn `okr-san.ts`, gieo tự dọn theo tiền tố), từng `describe` là một khoá `-t`. Hàm thuần `xepHopTuan`, `gopToanCanh`, `dienBienKr` thử trong `apps/api/test/okr-toan-canh-thuan.spec.ts`.
- `packages/ui`: `test/tree-nav.dom.tsx`, `test/heatmap.dom.tsx`, `test/okr-thanh-phan.dom.tsx` (progress, cặp chỉ báo, chọn chu kỳ, biểu đồ đường).
- Màn thật: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs` (puppeteer-core, cảnh cây, gieo qua API thật, dọn theo id, ảnh vào `.acceptance-runs/toan-canh-okr/evidence/`), máy chủ dev ở 3930/3931.
- Tĩnh: `rang/san-thiet-ke.mjs` — cổng thiết kế tĩnh + dấu hiệu vẽ tay trên tệp lượt này chạm; `rang/soi-ma.mjs` — không `Progress` tô khối trong khu OKR, không mặc định chuỗi trong thành phần mới.
- Năm lệnh chứng tuần tự trước khi báo phiên điều phối.

## 9. Việc đi kèm

- Ba trang hướng dẫn theo vai (lộ trình mục 6): `docs/huong-dan/okr-nguoi-phu-trach.md`, `okr-truong-don-vi.md`, `okr-quan-tri.md`.
- Ảnh chụp chỗ đứng «Toàn cảnh mở ở lượt 5» của hồ sơ `dat-okr-trong-crm` (bước E11-12 của `man-okr.mjs`) sẽ đỏ khi toàn cảnh có nội dung: ghi dòng `revisit` vào sổ hồ sơ đó và ghim lại trong cùng PR.
- `CONTEXT.md`: thêm mục «Toàn cảnh», «Họp tuần», «KR im», «Sức khoẻ chương trình», «Tình trạng (đúng nhịp, chậm nhịp, trượt)» trước khi đặt nhãn.
