---
schema_version: 1
feature: Trưởng khối mở bộ OKR của khối mình chỉ thấy mục tiêu của khối, và sang bộ của từng phòng bằng dòng vị trí
slug: bo-okr-chi-don-vi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-28T07:18:11Z
design_doc: docs/superpowers/specs/2026-10-28-bo-okr-chi-don-vi-design.md
---

# Acceptance Contract: bo-okr-chi-don-vi

## Context

Mở bộ OKR của một bộ phận (`donOkr=bp:<id>`) hôm nay gom cả mục tiêu của mọi phòng ban con vào bốn thẻ con, không cột
đơn vị, rồi các phòng ấy hiện lần nữa ở lưới «Đơn vị trực thuộc»; trang một bộ có ba đường sang đơn vị khác và mục
gập «Đã bỏ (n)». Vòng này làm bộ của bộ phận chỉ gồm mục tiêu của chính nó ở mọi thẻ con và ở danh sách Bộ OKR, giữ
Toàn cảnh cộng dồn, và đưa đường sang đơn vị khác về một chỗ: menu ở mắt xích cuối của dòng vị trí. Chủ kho chốt cả
hướng ngày 25/10 (Q1 a, Q2 a, Q4, Q6, Q7) và Cổng Đáng 28/10 «build, giữ ngưỡng đề xuất».

Source input: hàng VK19 `docs/plan/lo-trinh-okr.json`; ô cơ hội `_acceptance/bo-okr-chi-don-vi/opportunity.md`;
`docs/findings/2026-10-25-bo-okr-gom-lan/README.md`; luật màn `docs/design.md` «Thứ tự một màn», «Hàng công cụ»,
«Thanh bên khu và thẻ con» (Dòng vị trí).

Đo trên phiên đo riêng của cây và bộ OKR mẫu (`bun run okr:mau`), tiếng Việt; khổ 1440×900 và 375×812.

## Criteria

- AC-1: Given một chu kỳ có bộ phận B mang mục tiêu cấp bộ phận B1, hai phòng ban con P1 (mục tiêu P1a, P1b) và P2
  (P2a), một bộ phận khác C và mục tiêu OneHub G1, When gọi `okr.danhSach`, `okr.viecCuaBo`, `okr.hopTuan`,
  `okr.bangCham` và `okr.soBo` với đơn vị `bp:B`, Then mỗi thủ tục chỉ trả mục tiêu, KR, việc và số của B1 — không gì
  của P1, P2, kể cả tập mục tiêu đã bỏ đi kèm bảng; với `pb:P1` chỉ P1a, P1b; với `goc` chỉ G1; với `nguoi:` như hôm nay. Trên màn, bốn thẻ con của bộ B
  hiện đúng tập ấy. (cross-layer)
- AC-2: Given cùng dữ liệu, When mở danh sách Bộ OKR (`okr.danhSachBo`), Then với mọi hàng `goc`, `bp:`, `pb:`:
  Tiến độ bằng `okr.soBo(đơn vị).tienDo`, KR tự tin thấp bằng `okr.soBo(đơn vị).tuTin.thap`, và Mục tiêu là số mục
  tiêu công bố riêng của đơn vị (`okr.countByUnit`); hàng B cho 1 mục tiêu, hàng của bộ phận không có mục tiêu riêng
  cho 0 mục tiêu và Tiến độ trống — không còn số gộp của phòng con ở hàng bộ phận. Bốn ô số đầu thẻ OKR của bộ B bằng
  các cột ấy. (cross-layer)
- AC-3: Given cùng dữ liệu, When mở Toàn cảnh (`okr.toanCanh`, `okr.sucKhoe`), Then hàng `bp:B` vẫn cộng mục tiêu và
  KR của B1, P1a, P1b, P2a (quyết định 04/10, `toan-canh-okr` AC-5) — Toàn cảnh là chỗ duy nhất còn cộng dồn.
- AC-4: Given trang một bộ của `goc`, một `bp:` và một `pb:`, When mở từng thẻ con OKR · Họp tuần · Việc · Chấm điểm,
  Then trang không có ô chọn đơn vị, không có lưới «Đơn vị trực thuộc», không có mục gập «Đã bỏ (n)»; thứ tự màn là
  đầu trang → dòng vị trí → thẻ con → một hàng công cụ → nội dung → chân (`docs/design.md` «Thứ tự một màn»).
- AC-5: Given trang một bộ `goc`, `bp:` hay `pb:`, When bấm (hoặc Enter) mắt xích cuối của dòng vị trí, Then một menu
  mở ra với các nhóm theo thứ tự Thuộc (đơn vị cha) · Cùng cấp (đơn vị cùng cha, cùng cấp) · Trực thuộc (con trực
  tiếp), nhóm rỗng không hiện, mục theo thứ tự cây, mỗi mục là tên đơn vị kèm số mục tiêu công bố riêng của nó; bấm
  một mục mở bộ của đơn vị ấy giữ nguyên `kyOkr` và thẻ con đang mở (`xemOkr`); Esc đóng menu và trả tiêu điểm về mắt
  xích. Bộ cá nhân (`nguoi:`) giữ mắt xích tĩnh, không menu. (cross-layer)
- AC-6: Given bộ có n > 0 mục tiêu đã bỏ, When nhìn hàng công cụ của bảng, Then cuối hàng có nút bật tắt «Đã bỏ (n)»
  (`aria-pressed`); bật thì bảng chỉ hiện đúng n mục tiêu đã bỏ và đường dẫn mang `daBoOkr=1`, tải lại vẫn bật; tắt
  thì bảng về các mục tiêu chưa bỏ. Bộ có 0 mục tiêu đã bỏ, hoặc bộ lọc trạng thái đang có giá trị (tập đã bỏ
  khi ấy đi theo bộ lọc như hôm nay), thì không có nút.
- AC-7: Given một bộ phận không có mục tiêu công bố riêng trong chu kỳ, When mở thẻ OKR của bộ ấy, Then chỗ bảng là câu
  «<tên bộ phận> chưa có mục tiêu riêng trong <tên chu kỳ>» cùng một câu chỉ sang menu ở tên bộ phận trên dòng vị trí;
  không có mục tiêu nào của phòng ban con. Phòng ban và OneHub rỗng giữ câu rỗng hiện có.
- AC-8: Given chu kỳ đang chạy và bộ OneHub không có KR công bố, When mở thẻ Họp tuần của OneHub, Then màn có câu
  «<tên OneHub> chưa có KR công bố trong <tên chu kỳ>.», một câu chỉ sang menu ở dòng vị trí và liên kết «Xem mọi bộ
  OKR» giữ `kyOkr`; không có danh sách «Đơn vị có KR». Họp tuần của một bộ phận chỉ đếm KR của chính nó.
- AC-9: Given bộ OKR mẫu (`bun run okr:mau`) trên phiên đo của cây, When trưởng Khối Kinh doanh mở bộ của khối mình ở
  1440 và 375, sáng và tối, rồi mở menu dòng vị trí và sang bộ của một phòng, Then thẻ OKR của Khối Kinh doanh hiện
  đúng 1 mục tiêu, Khối Vận hành 1, Khối Hỗ trợ 0 kèm câu rỗng riêng; hàng ba khối ở danh sách Bộ OKR có Mục tiêu,
  Tiến độ, KR tự tin thấp khớp `okr.soBo`; menu nằm gọn trong màn ở 375, không tràn ngang; sang bộ của phòng trong hai
  lần bấm.

## Coverage

- Trục A — loại đơn vị của bộ: `goc` · `bp:` có mục tiêu riêng · `bp:` không mục tiêu riêng · `bp:` không phòng con ·
  `pb:` trong khối · `pb:` chưa xếp · `nguoi:` [thước CE: `DonViChon` 4 loại, `okr-search-params.ts`] → AC-1, AC-5,
  AC-7.
- Trục B — chỗ đọc tập mục tiêu: thẻ OKR · Việc · Họp tuần · Chấm điểm · bốn ô số · danh sách Bộ OKR · Toàn cảnh ·
  Sức khoẻ [thước CE: năm chỗ gọi `dieuKienDonVi` + `gopDanhSachBo` + `gopToanCanh` + `gopSucKhoe`] → AC-1, AC-2,
  AC-3.
- Trục C — đường sang đơn vị khác: menu dòng vị trí · ô chọn đơn vị (gỡ) · lưới trực thuộc (gỡ) · danh sách «Đơn vị
  có KR» của Họp tuần (gỡ) · danh sách Bộ OKR (giữ) [thước CE: luật «Dòng vị trí» `docs/design.md`] → AC-4, AC-5, AC-8.
- Trục D — tập con của bảng: đang chạy · đã bỏ (nút) · lọc trạng thái có «Đã bỏ» [thước CE: `tachDaBo`,
  `okr-xem.service.ts`] → AC-6.
- Trục E — khổ và nền: 1440 · 375 × sáng · tối → AC-9.
- Trục F — lọc trạng thái: rỗng · có giá trị → AC-6.
- Later: menu dòng vị trí cho bộ cá nhân; cột phải «Góp vào» (VK15); Của tôi (SV1) — `descope` trong sổ.
- Bỏ coverage-scan bằng skill — entry d-20261028T050850Z-12; trục trên dựng tay từ năm chỗ đọc và luật màn.

## Đường đo

- Thước: số mục tiêu mỗi thẻ con của ba khối trên bộ mẫu · số từ: `okr.danhSach`/`viecCuaBo`/`hopTuan`/`bangCham` với
  `bp:` trên `okr:mau`, đếm trong ảnh và DOM của phiên đo · bảo đảm bởi: AC-1, AC-9
- Thước: hàng ba khối ở danh sách Bộ OKR khớp số trong bộ · số từ: `okr.danhSachBo` so `okr.soBo` · bảo đảm bởi: AC-2
- Thước: số đường sang đơn vị khác trên trang một bộ (mục tiêu 1) · số từ: DOM phiên đo (`[data-chon-don-vi]`,
  `[data-don-vi-con]`, `[data-menu-vi-tri]`) · bảo đảm bởi: AC-4, AC-5
- bỏ đường-đo — số lần mở bộ bp: dẫn tới bộ pb: qua menu dòng vị trí trên production: telemetry của kho chỉ có số đếm theo ngày từ máy chủ; chờ chủ kho ở Hỏi-3 (entry d-20261028T051257Z-13)

## Out of scope

- Menu ở dòng vị trí của bộ cá nhân (`nguoi:`) để sang người cùng phòng — chưa hàng nào gánh.
- Cột phải «Góp vào» của trang bộ — VK15 (chỉ còn «Góp vào» sau Q7).
- Đổi Toàn cảnh, Sức khoẻ: vẫn cộng dồn bộ phận với phòng ban con.
- Thẻ con «Sơ đồ góp vào»: nó mở Báo cáo › Sơ đồ của cả khu (C1 lối b, 24/10), không đọc tập mục tiêu của bộ.
- Của tôi: mục gập «Đã bỏ», «Đang theo dõi» giữ nguyên — SV1 gánh.
- Đổi lược đồ hay dữ liệu: không migration, không chuyển mục tiêu của phòng lên khối.
- Sự kiện telemetry cho menu dòng vị trí.

## Notes

- Hồ sơ đã ký đổi luật (ghi chú VK19, chủ kho 25/10 Q4 và bốn điểm HT1): `toan-canh-okr` AC-1/E1, `gop-y-dung-cho`,
  `tro-ly-okr-tom-tat`, `trang-bo-okr` AC-7, AC-10, E5, `bo-okr-co-so` E1/E14, `hop-tuan-mo-dung-bo` E7/E8. Mỗi hồ sơ
  một dòng sổ `fix` `decided_by` chủ kho, đo hai chiều, gửi `cham-tep` theo `LUAT.md` của đợt trước khi sửa.
- `CONTEXT.md` mục Bộ OKR thêm một dòng (chỉ thêm, luật 7 của đợt).
- S4 chỉ chạy sau khi VK10 #569, HT5 #578, HT2 gộp `onehub`, theo lệnh giám sát.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-28:
  - Ngoài-1: Khối chưa có trưởng và chưa có mục tiêu riêng không còn câu «chưa có trưởng» và nút sang trang gán trưởng; quản trị viên gán ở Cài đặt.
  - Ngoài-3: Phép đo màn có thể báo đạt khi thẻ con chưa hiện nội dung, nên mục tiêu phòng con lẫn vào bộ khối có thể không bị thấy.
  - Ngoài-4: Một chốt của bài kiểm không bắt được danh sách «Đơn vị có KR» của Họp tuần nếu nó quay lại; các chốt khác vẫn bắt.
  - Ngoài-5: Thẻ Họp tuần, Việc, Chấm điểm chưa được bài kiểm giao diện xem ở trạng thái có dữ liệu.
  - Ngoài-6: Phép đo màn cho ba thẻ con còn lại có thể báo đạt khi thẻ chưa tải xong.
  - Ngoài-7: Phép đo màn có thể báo «khớp ba nguồn» khi mới so hai nguồn, nên một ô số đầu thẻ lệch có thể lọt.
