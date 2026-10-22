---
schema_version: 1
feature: "Trưởng đơn vị mở bộ OKR của đơn vị mình và biết ngay đội đang ra sao: ngày còn lại, tiến độ so với kỳ vọng, số KR đã cập nhật tuần này, số KR tự tin thấp, và mọi KR đã mở sẵn"
slug: bo-okr-co-so
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-22-bo-okr-co-so-design.md
---

# Acceptance Contract: bo-okr-co-so

## Context

Thẻ OKR của trang một bộ (VK3 `trang-bo-okr`) hôm nay chỉ có bảng mục tiêu gập: không có số tóm tắt, phải mở từng
dòng mới thấy KR. Vòng này thêm một hàng bốn ô số (`StatGroup` + `StatCard`) giữa hàng thẻ con và bảng, lấy từ hàng
`okr.toanCanh` của đúng đơn vị cộng ngày kết thúc chu kỳ, và cho bảng mở sẵn mọi KR với một nút Mở tất cả / Gập tất cả
(biến thể mới của `DataTable` trong `packages/ui`). Không thủ tục API mới.

Source input: hàng VK8 `docs/plan/lo-trinh-okr.json` (mã phạm vi `B2`); ô cơ hội `_acceptance/bo-okr-co-so/opportunity.md`;
hợp đồng VK3 `_acceptance/trang-bo-okr/contract.md` (nhánh `feat/trang-bo-okr`, chưa gộp `onehub`).

Đo trên phiên đo riêng của cây, bộ OKR mẫu (`bun run okr:mau`), tiếng Việt; khổ 1440×900 và 375×812. S2–S3 chỉ bắt đầu
sau khi VK3 gộp `onehub`.

## Criteria

- AC-1: Given trưởng một phòng ban trong bộ mẫu, chu kỳ đang chạy, When mở thẻ OKR của bộ OneHub (`donOkr=goc`), của
  một bộ phận (`bp:`) và của một phòng ban (`pb:`), Then mỗi trang có đúng một hàng bốn ô nằm dưới hàng thẻ con và trên
  bảng mục tiêu, theo thứ tự Ngày còn lại · Tiến độ · KR đã cập nhật tuần này · KR tự tin thấp; Tiến độ là `tienDo`% và
  dòng mô tả nêu `kyVong`% của hàng `okr.toanCanh` cùng khoá đơn vị, cập nhật là `daCapNhat`/`soKr`, tự tin thấp là
  `tuTin.thap` của cùng hàng (bộ phận gồm cả phòng ban con, như `okr.toanCanh`), và Ngày còn lại là số ngày lịch giờ
  Việt Nam từ hôm nay tới ngày kết thúc của chu kỳ đang xem, tính cả hai đầu. (cross-layer)
- AC-2: Given hàm dựng ô và trang một bộ, When chu kỳ chưa tới ngày bắt đầu, hôm nay là ngày kết thúc, đã qua ngày kết
  thúc, kỳ vọng của hàng là null hay 0, hoặc bộ chưa công bố mục tiêu nào (không có hàng hay `soKr` 0), Then ô Ngày còn lại
  lần lượt là «—» với «Bắt đầu <ngày>», «1», «0» với «Đã kết thúc <ngày>» (đếm cả ngày cuối và «—» trước ngày bắt đầu
  theo khuyến nghị Hỏi-4); mô tả Tiến độ là «chưa có vạch» hay «vừa
  công bố» như Toàn cảnh; bộ chưa công bố hiện Tiến độ «—», cập nhật «0/0», tự tin thấp «0»; không ô nào in `NaN`,
  `undefined` hay số âm.
- AC-3: Given trang một bộ của một phòng ban, When người xem bấm lần lượt thẻ Họp tuần, Việc, Sơ đồ góp vào (và Chấm
  điểm khi có), bật chip Cần bàn, chọn một người ở mặt Người phụ trách, đổi sắp xếp, Then hàng số chỉ có ở thẻ OKR, và ở
  thẻ OKR bốn giá trị không đổi khi lọc hay sắp xếp đổi; trang bộ cá nhân (`donOkr=nguoi:<id>`) và trang đơn vị không tìm
  thấy không có hàng số.
- AC-4: Given một bộ có mục tiêu có KR, mục tiêu không KR và mục tiêu đã bỏ, When mở thẻ OKR bằng URL không mang tham
  số mở hay gập, Then mọi mục tiêu chưa bỏ có KR đều mở sẵn (nút mở mang `aria-expanded="true"`, các dòng KR hiện), mục
  tiêu không KR và mục đã bỏ không có nút mở; bấm nút mở của một dòng thì đúng dòng ấy gập, các dòng khác giữ nguyên.
- AC-5: Given thẻ OKR đã mở sẵn, When người xem bấm «Gập tất cả», tải lại trang, mở URL ấy ở tab mới, rồi bấm «Mở tất
  cả», Then sau Gập tất cả mọi dòng gập, URL mang trạng thái gập và tải lại hay tab mới giữ nguyên; nút đổi nhãn thành
  «Mở tất cả» ngay khi có ít nhất một dòng gập (kể cả khi gập tay một dòng) và về «Gập tất cả» khi không dòng nào gập;
  sau Mở tất cả mọi dòng mở và URL không còn tham số gập; Tab tới nút rồi Enter làm đúng như bấm, và tên truy cập của nút
  là nhãn đang hiện.
- AC-6: Given mọi `DataTable` có `expandable` trong `apps/app` ngoài bảng mục tiêu của trang một bộ, When mở các bảng
  ấy, Then hành vi giữ như trước vòng: mặc định gập, trạng thái mở ở khoá URL `expand`, không có nút Mở tất cả / Gập tất
  cả.
- AC-7: Given thẻ OKR của một phòng ban, When `okr.toanCanh` đang tải và khi nó lỗi, Then lúc tải hàng số là bốn ô khung
  xương cùng hình, dòng vị trí và hàng thẻ con còn nguyên; lúc lỗi chỗ hàng số là vùng lỗi có nút Thử lại, bấm nút thì
  gọi lại `okr.toanCanh`, và bảng mục tiêu vẫn hiện, bấm được.
- AC-8: Given thẻ OKR của một phòng ban mẫu ở chế độ sáng và tối, khổ 1440 và 375, When người ký nhìn ảnh, Then ở 1440
  bốn ô nằm một hàng, ở 375 lưới hai cột hai hàng, trang không cuộn ngang, không nhãn ô nào bị cắt mất chữ, nút Mở tất
  cả / Gập tất cả nhìn thấy trên hàng công cụ của bảng, hàng số cùng nếp với Toàn cảnh OKR và không chữ hay viền nào chìm
  vào nền. (judgment)
- AC-9: Given vòng này đã làm, When chạy eval máy của mọi hồ sơ đã ký có thước hay bài kiểm đo bảng mục tiêu hoặc khung
  trang của trang đơn vị và trang một bộ (bước bấm mở dòng, tham số `expand`, hàng công cụ của bảng, khoảng giữa hàng
  thẻ con và bảng), Then mọi mục không xấu hơn trên nền `origin/onehub` (mục đỏ sẵn trên nền in «đỏ sẵn trên nền»), và
  mọi thay đổi trong thước của các hồ sơ ấy chỉ thuộc ba lớp Hỏi-1 cho phép: bỏ hay đổi bước bấm mở dòng (hoặc chờ dòng
  KR đã mở, đổi `expand` thành `gap`); thêm nút Mở/Gập tất cả và hàng số vào khẳng định bố cục (số mục hàng công cụ,
  khoảng dưới hàng thẻ con); đảo thứ tự mở/gập trong khẳng định bàn phím của một dòng — mỗi hồ sơ có một dòng sổ `fix`
  mang `decided_by` chủ kho và cặp đo hai chiều.

## Coverage

Trục: ô (ngày còn lại · tiến độ so kỳ vọng · đã cập nhật tuần này · tự tin thấp · mở sẵn · nút Mở/Gập tất cả) × loại
bộ (OneHub · bộ phận gồm phòng ban con · phòng ban · cá nhân · không tìm thấy) × pha chu kỳ (chưa bắt đầu · đang chạy ·
ngày cuối · đã kết thúc) × trạng thái dữ liệu (đang tải · lỗi · chưa công bố · có số · lọc bảng bật) × khổ (1440 · 375)
× chủ đề (sáng · tối).

Thước CE: bốn ô × ba loại bộ có số → AC-1; bốn ô × pha và chưa công bố → AC-2; thẻ con × lọc, bộ cá nhân, không tìm thấy
→ AC-3; mở sẵn → AC-4; nút → AC-5; bảng khác không đổi → AC-6; đang tải, lỗi → AC-7; khổ, chủ đề → AC-8; thước đã ký →
AC-9. Chân ngành: trang Plan của Tability có bốn ô số ở đầu [NGÀNH: Tability — dẫn trong `vi_sao` của hàng VK8]; không
đối chiếu sâu hơn. [CE chưa kiểm chứng] cho trục pha chu kỳ: bộ mẫu chỉ có chu kỳ đang chạy, ba pha còn lại chỉ đo bằng
DOM test (AC-2).

## Đường đo

- «Bốn ô số ở đầu thẻ OKR của mọi bộ» — thước màn `man-bo-okr-co-so.mjs` đọc bốn ô trên ba bộ (OneHub, bộ phận, phòng
  ban) và so với `okr.toanCanh` đọc qua API trong cùng phiên; AC-1 bảo đảm, AC-3 bảo đảm «chỉ ở thẻ OKR».
- «Nút Mở tất cả / Gập tất cả» — cùng thước, bấm nút rồi đếm dòng KR hiện và đọc URL sau tải lại; AC-4, AC-5 bảo đảm.

## Out of scope

- Ô bấm được dẫn tới bảng đã lọc (vd «KR tự tin thấp» → lọc tự tin thấp) — Later.
- Số tuần trước hay xu hướng theo tuần trong ô.
- Hàng số cho bộ cá nhân và trên trang danh sách Bộ OKR.
- Nhớ trạng thái mở/gập theo người qua các lần mở trang (chỉ URL).
- Chế độ Soạn cả bộ, nút Soạn, khối góp ý Kara ở ngăn theo dõi (VK10 `che-do-soan-bo-okr`).
- Đổi cách `okr.toanCanh` tính số (chỉ mục tiêu đã công bố, tuần VN) — vòng này đọc nguyên.

## Notes

- Ranh giới với VK10: VK8 giữ hàng số giữa thẻ con và bảng, và biến thể mở sẵn của `DataTable`; VK10 giữ chế độ Soạn,
  nút Soạn, chip góp ý ở ngăn theo dõi. Hai hàng cùng thêm dòng vào `theo-don-vi.tsx` và `okr-vo-khu.ts` ở chỗ khác nhau.
  Giám sát đã xác nhận ranh giới này (22/10).
- `packages/ui/src/components/data-table.tsx`: làn M5 có DA18 (#526) đang sửa cùng tệp; tới S3 xin `cham-tep` lại để
  giám sát hỏi trên #375 trước khi chạm.
