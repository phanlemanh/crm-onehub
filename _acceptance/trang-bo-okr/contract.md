---
schema_version: 1
feature: Trưởng đơn vị mở Bộ OKR, lọc Tôi dẫn, mở bộ OKR của đơn vị mình và đi giữa OKR · Họp tuần · Việc · Sơ đồ · Chấm điểm bằng thẻ con có đường dẫn riêng
slug: trang-bo-okr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-21T14:07:05Z
design_doc: docs/superpowers/specs/2026-10-21-trang-bo-okr-design.md
---

# Acceptance Contract: trang-bo-okr

## Context

Hôm nay `/okr/bo-okr` là một màn chung: ô chọn đơn vị và ô chuyển kiểu xem trên cùng một trang, không có trang
liệt kê các bộ, không có lọc Tôi dẫn · Đang theo dõi, không có kiểu xem Việc. Vòng này tách thành trang danh sách
Bộ OKR và trang một bộ có hàng thẻ con là liên kết, theo hai quyết định của chủ kho ở V1-17 (ghi trong
`opportunity.md`): «Đang theo dõi» suy từ theo dõi mục tiêu, đường dẫn một bộ giữ dạng tham số.

Source input: hàng VK3 `docs/plan/lo-trinh-okr.json`; ô cơ hội `_acceptance/trang-bo-okr/opportunity.md`; bản mẫu
`/proto/vo-khu-muc-tieu` (nhánh `feat/vo-khu-muc-tieu`, `2790552ac`).

Đo trên phiên đo riêng của cây, bộ OKR mẫu (`bun run okr:mau`), tiếng Việt; khổ 1440×900 và 375×812.

## Criteria

- AC-1: Given trưởng một phòng ban trong bộ mẫu, chu kỳ đang chạy, When bấm mục «Bộ OKR» trên thanh bên khu Mục
  tiêu (hoặc mở `/okr/bo-okr` không kèm `donOkr` và `xemOkr`), Then trang (tiêu đề «Mục tiêu» như cả khu) có dòng vị trí «Bộ OKR» và một hàng cho mỗi bộ đơn vị của cây tổ chức (OneHub, mỗi bộ phận, mỗi
  phòng ban) — không thiếu, không thừa so với cây — với cột Bộ OKR của · Trưởng · Mục tiêu · Tiến độ · KR tự tin
  thấp; số mục tiêu mỗi hàng bằng số của `okr.countByUnit` và tiến độ bằng số của `okr.toanCanh` cho cùng đơn vị.
- AC-2: Given trang danh sách, When người xem chọn Tôi dẫn rồi Đang theo dõi, Then danh sách chỉ còn đúng các bộ
  người xem là trưởng (với Tôi dẫn) và đúng các bộ có ít nhất một mục tiêu người xem theo dõi (với Đang theo dõi);
  URL mang `phamViBo=toi-dan` hoặc `phamViBo=theo-doi` (Tất cả thì không mang); tải lại trang hay mở URL ấy ở tab
  mới giữ nguyên lọc; số đếm cạnh mỗi mục bằng số hàng khi chọn mục đó. Người xem là thành viên không dẫn đơn vị
  nào bấm Tôi dẫn thì thấy câu nêu tên lọc đang bật và nút «Về Tất cả», không phải một bảng trống; bấm nút thì URL
  bỏ `phamViBo` và mọi bộ hiện lại. Trưởng một bộ phận thấy bộ phận ấy trong Tôi dẫn, không thấy các phòng ban con;
  bộ OneHub không thuộc Tôi dẫn của ai.
- AC-3: Given trang danh sách, When người xem bấm tên một bộ, Then trình duyệt mở `/okr/bo-okr?donOkr=<đơn vị>` kèm
  `kyOkr` của chu kỳ đang xem, dòng vị trí «Bộ OKR › <tên đơn vị>» với «Bộ OKR» là liên kết về danh sách giữ `kyOkr`,
  và bảng mục tiêu là của đúng đơn vị ấy; bộ OneHub mở bằng `donOkr=goc`.
- AC-4: Given trang một bộ ở chu kỳ đang chạy, When trang tải xong, Then ngay dưới đầu trang có hàng thẻ con OKR ·
  Họp tuần · Việc · Sơ đồ (thêm Chấm điểm khi chu kỳ ở pha chấm điểm hoặc đã đóng, và chỉ khi đó), mỗi thẻ là một
  liên kết có `href` riêng, đúng một thẻ mang `aria-current="page"`; không còn ô chuyển kiểu xem `ViewSwitch` trên
  trang.
- AC-5: Given trang một bộ của một phòng ban ở một chu kỳ không phải chu kỳ hiện tại, When người xem bấm lần lượt
  từng thẻ con rồi bấm Quay lại của trình duyệt, Then mỗi URL giữ đúng `kyOkr` và `donOkr` ban đầu, nội dung đổi
  theo thẻ (Họp tuần, Việc, Sơ đồ, OKR), và Quay lại đưa về thẻ trước đó; với bộ OneHub, `donOkr=goc` cũng được
  giữ.
- AC-6: Given một bộ có KR gắn việc trong bộ mẫu, When mở thẻ Việc, Then trang liệt kê đúng các việc gắn KR của các
  mục tiêu thuộc bộ trong chu kỳ — nhóm theo KR, mỗi việc có tiêu đề, người làm, hạn và trạng thái xong — khớp
  `OkrViecKr` trong cơ sở dữ liệu; bộ chưa có việc nào gắn KR thì hiện câu rỗng thay cho bảng.
- AC-7: Given các liên kết cũ, When mở `/okr/theo-don-vi?donOkr=pb:<id>&xemOkr=hop-tuan&kyOkr=<id>` và
  `/okr/bo-okr?xemOkr=hop-tuan`, Then cái thứ nhất về `/okr/bo-okr` giữ nguyên ba tham số và mở thẻ Họp tuần của phòng
  ban ấy, cái thứ hai mở thẻ Họp tuần của bộ OneHub; mọi liên kết trong app trỏ tới bộ OneHub (Toàn cảnh, Đơn vị
  con, bản nháp Soạn) mang `donOkr=goc`; nút «Sang Theo đơn vị» của Của tôi mở trang danh sách.
- AC-8: Given khổ 375×812, When mở trang danh sách và trang một bộ, Then danh sách các bộ hiện thành danh sách mục
  (không phải bảng tràn ngang), hàng thẻ con cuộn ngang trong chính nó, và trang không cuộn ngang (`scrollWidth` của
  tài liệu ≤ bề rộng khung nhìn).
- AC-9: Given trang danh sách, When dữ liệu đang tải và khi thủ tục `okr.danhSachBo` lỗi, Then lúc tải hiện khung
  xương với tiêu đề «Bộ OKR» còn nguyên, lúc lỗi hiện vùng lỗi có nút Thử lại và bấm nút thì gọi lại thủ tục.
- AC-10: Given trang danh sách và trang một bộ ở chế độ sáng và tối, When người ký nhìn ảnh 1440 và 375, Then bố cục
  khớp bản mẫu `/proto/vo-khu-muc-tieu` (bảng các bộ, lọc ba mục, hàng thẻ con dạng gạch chân dưới đầu trang), chỉ
  lệch đúng những chỗ liệt kê ở mục «Chỗ lệch bản mẫu» của bản thiết kế (ô chọn đơn vị, thẻ Chấm điểm, nội dung
  Sơ đồ, lọc ghi URL), và không có chữ hay viền chìm vào nền. (judgment)
- AC-11: Given vòng này đã làm, When chạy eval máy của các hồ sơ đã ký có thước chạm `/okr/bo-okr`, `theo-don-vi`
  hay ô chuyển kiểu xem, Then mọi mục không xấu hơn trên nền `origin/onehub` (mục đỏ sẵn trên nền in «đỏ sẵn trên
  nền»), và mọi thay đổi trong thước của các hồ sơ ấy chỉ là đổi chuỗi đường dẫn hay bộ chọn — mỗi hồ sơ có một dòng
  sổ `fix` mang `decided_by` chủ kho và cặp đo hai chiều.

## Coverage

Trục: vai người xem (trưởng đơn vị · thành viên · quản trị chương trình) × trang (danh sách · một bộ) × lọc (Tất cả
· Tôi dẫn · Đang theo dõi) × thẻ con (OKR · Họp tuần · Việc · Sơ đồ · Chấm điểm) × trạng thái (đang tải · lỗi ·
rỗng · có dữ liệu) × khổ (1440 · 375) × đường vào (thanh bên · liên kết cũ · liên kết trong app).

Thước CE: danh sách × {đang tải, lỗi} → AC-9; danh sách × rỗng theo lọc → AC-2; danh sách × có dữ liệu → AC-1,
AC-2; một bộ × có dữ liệu → AC-3…AC-6; một bộ × rỗng (thẻ Việc) → AC-6; một bộ × {đang tải, lỗi} giữ nguyên màn hôm
nay (hồ sơ đã ký `khung-cho-don-vi-mot-hinh` đo, AC-11 giữ không xấu hơn). Vai: trưởng phòng ban, trưởng bộ phận,
thành viên → AC-2; quản trị không có «dẫn» riêng (AC-2). Đường vào: thanh bên → AC-1, liên kết cũ và trong app →
AC-7. Pha chấm điểm chỉ đo bằng DOM test (AC-4) vì bộ mẫu không có chu kỳ đang chấm. [CE chưa kiểm chứng]

## Đường đo

- «Mỗi bộ OKR có đường dẫn riêng» — URL trang một bộ đọc từ trình duyệt ở thước `man-bo-okr.mjs`; AC-3 bảo đảm.
- «Đổi thẻ con không mất chu kỳ và bộ đang xem» — URL từng bước bấm thẻ và Quay lại; AC-5 bảo đảm.
- «Bộ lọc Tất cả · Tôi dẫn · Đang theo dõi ghi trên đường dẫn» — tham số `phamViBo` sau bấm và sau tải lại; AC-2
  bảo đảm.

## Out of scope

- Bảng hay nút theo dõi riêng cho một bộ OKR (V1-17 Hỏi-1 (b)).
- Đường dẫn dạng đoạn `/okr/bo-okr/<đơn vị>/<thẻ>` (V1-17 Hỏi-2 (b)).
- Thẻ Sơ đồ chỉ quanh bộ đang xem — giữ cây căn chỉnh cả chu kỳ như kiểu xem `cay` hôm nay.
- Hàng số đầu trang một bộ (B2), chế độ Soạn cả bộ (B5a), hàng công cụ một dòng (hàng V1-15).
- Bộ OKR cá nhân (`nguoi:`) trong trang danh sách.

## Notes
