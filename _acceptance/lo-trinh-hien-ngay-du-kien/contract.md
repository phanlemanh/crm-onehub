---
schema_version: 1
feature: Trưởng phòng ban mở trang Lộ trình và thấy mỗi việc, mỗi mốc có ngày dự kiến xong do máy tính — ghi rõ là dự kiến, có cờ khi số đo chưa đủ
slug: lo-trinh-hien-ngay-du-kien
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: draft
design_doc: docs/superpowers/specs/2026-10-17-lo-trinh-hien-ngay-du-kien-design.md
---

# Acceptance Contract: lo-trinh-hien-ngay-du-kien

## Context

Kit 2.32.0 (hàng RM6c, nhận ở #463) đưa giờ máy của việc, giờ máy và ngày dự kiến của mốc, và cờ quá tải vào khối dữ
liệu của `LO-TRINH.html`, vẫn phiên bản khuôn 2. Khuôn đọc của CRM bỏ khoá lạ, nên trang Lộ trình chưa hiện chúng: đo
17/10, 7 mốc đang chạy, 0/7 hiện ngày. Vòng này cho trang đọc bốn khoá ấy và hiện ngày dự kiến cho từng mốc đang chạy
và từng việc chưa giao — luôn ghi «dự kiến», nói cách tính, có cờ khi số đo chưa đủ, và có cờ nói vì sao khi chưa có
ngày. Trang không tự tính ngày.

Source input: hàng LT1e `docs/plan/lo-trinh-okr.json` · `_acceptance/lo-trinh-hien-ngay-du-kien/opportunity.md` (Cổng
Đáng: build, Manh Phan 17/10, ngưỡng bản máy khuyên) · hồ sơ kit `lo-trinh-du-lieu-ngay-du-kien` (RM6c) · thiết kế
`docs/superpowers/specs/2026-10-17-lo-trinh-hien-ngay-du-kien-design.md`.

Dữ liệu trong mọi bài kiểm do code sinh trong lượt từ khối đúng hình kit vẽ (hoặc rút từ `LO-TRINH.html` thật của cây);
«hôm nay» ghim trong bài kiểm, múi giờ ghim bằng `TZ`.

## Criteria

- AC-1: Given kho đang nhận kit có bộ đọc khối dữ liệu mới, When so bộ đọc của trang với hàm `docDuLieu` trong
  `scripts/lo-trinh.mjs` của kho, Then hai bản giống từng byte; và bảng khoá của khuôn đọc CRM bằng bảng khoá của bộ đọc
  ở mọi cấp, kể cả ba cấp mới (giờ máy việc, giờ máy mốc, ngày dự kiến); và một khối mang bốn khoá mới đi qua khuôn đọc
  còn nguyên giá trị, một khối không mang chúng đọc ra `null` ở cả bốn chỗ.
- AC-2: Given một mốc còn việc chưa giao và khối có ngày dự kiến cho nó, When người xem mở trang Lộ trình ở kiểu xem «Mốc»,
  Then dòng của mốc hiện «Dự kiến xong <ngày hoàn tất>» theo ngôn ngữ người xem, kèm một câu nói máy tính lúc mốc bắt
  đầu (<ngày tính>), coi như chỉ mình mốc ấy đang chạy, và đây là ước tính không phải cam kết; mốc đã hết việc không có
  dòng ngày dự kiến nào.
- AC-3: Given một mốc có ngày dự kiến, When ít nhất một việc chưa giao của mốc có giờ máy là máy ước hoặc không có giờ
  máy, Then ngày dự kiến của mốc mang cờ «ước sơ bộ» kèm câu giải thích; và When mọi việc chưa giao của mốc có giờ máy
  do kho khai hoặc đã đo đủ, Then không có cờ ấy — cùng một mốc, chỉ đổi giờ máy của việc.
- AC-4: Given một mốc có ngày dự kiến, When khối có cờ quá tải cho mốc, Then ngày mang cờ «sau ngày mục tiêu»; When hôm
  nay của người xem đã qua ngày hoàn tất dự kiến mà mốc còn việc, Then ngày mang cờ «đã qua ngày dự kiến»; không cờ nào
  dùng màu của «xong» hay «hỏng».
- AC-5: Given một mốc còn việc mà khối không có ngày dự kiến dùng được, When trang hiện mốc, Then mốc mang cờ «Chưa có
  ngày dự kiến» kèm đúng một lý do: chưa việc nào của mốc được mở từ khi máy tính ngày (khối có giờ máy của mốc), bản lộ
  trình chưa mang ngày dự kiến (khối không có giờ máy của mốc), hoặc ngày trong dữ liệu không đọc được (ngày sai dạng);
  và trang không bao giờ hiện ngày mục tiêu của mốc như ngày dự kiến.
- AC-6: Given một việc chưa giao thuộc một mốc, When người xem nhìn bảng, bảng cột hoặc mở ngăn hồ sơ của việc, Then cột
  mốc của bảng và thẻ hiện «dự kiến <ngày ngắn>» với cùng cờ của mốc (hoặc «Chưa có ngày dự kiến»); ngăn hồ sơ hiện mục
  «Ngày dự kiến» dạng đủ và mục «Ước lượng» (khoảng giờ máy, cờ «ước sơ bộ» khi giờ máy là máy ước); việc không có giờ
  máy không có mục «Ước lượng» và ngăn không vỡ; việc đã giao và việc chưa hẹn mốc không hiện ngày dự kiến.
- AC-7: Given trang hay bản chụp vẽ bằng kit chưa mang giờ máy, When người xem mở trang Lộ trình, Then trang không vỡ, mọi
  mốc đang chạy mang cờ «Chưa có ngày dự kiến» lý do bản lộ trình chưa mang ngày dự kiến, và hộp «Trang có thể thiếu một
  phần» không bật chỉ vì thiếu giờ máy; Given kịch bản đẩy gửi khối mới qua đường đẩy bản chụp thật và máy chủ lưu nó,
  When trang đọc bản chụp, Then mốc hiện đúng ngày dự kiến như khi đọc tệp đóng gói cùng khối. (cross-layer)
- AC-8: Given người xem ở 375 px và 1280 px, tiếng Việt và tiếng Anh, nền sáng và tối, When trang hiện kiểu xem «Mốc»,
  bảng và ngăn hồ sơ có ngày dự kiến — kể cả mốc mang đủ ba cờ — Then mỗi ngày dự kiến đứng cạnh chữ «dự kiến» /
  «Expected», không chỗ nào cuộn ngang hay cắt chữ, và tên mốc, tên lộ trình không bị dịch; và trên khối của
  `LO-TRINH.html` thật của cây, mọi mốc đang chạy ra hoặc ngày kèm chữ «dự kiến», hoặc cờ «Chưa có ngày dự kiến» kèm lý
  do, và mọi ngày tính trên số đo chưa đủ mang cờ.

## Coverage

- Ngữ cảnh: chân sản phẩm đào từ repo [SUY-TỪ-REPO: apps/app/components/lo-trinh/trang-lo-trinh.tsx]
  [SUY-TỪ-REPO: /Users/manhphan/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.32.0/skills/acceptance/references/lo-trinh-du-lieu.md]
  · chân ngành [NGÀNH: Jira Software — Version Report: ngày phát hành dự đoán kèm khoảng lạc quan/bi quan và cảnh báo khi
  việc chưa ước lượng].
- Trục A — nguồn khối: trang mới đủ khoá | trang đời trước | bản chụp khối mới | bản chụp cũ | khoá ngày sai dạng
  [thước CE: bảng «Đọc khoan dung» của `lo-trinh-du-lieu.md` + hai đường đọc của `doc-trang.ts`].
- Trục B — tình trạng mốc: đang chạy có ngày | đang chạy chưa ngày | quá tải | đã qua ngày dự kiến | hết việc
  [thước CE: các nhánh của `duKienMoc`].
- Trục C — độ đủ số đo: mọi việc mở khai hay đo | có việc máy ước | có việc không giờ máy [thước CE: `gio_may.nguon` +
  `gio_may.co` của khối].
- Trục D — chỗ hiện: xem theo mốc | bảng | bảng cột | ngăn hồ sơ [SUY-TỪ-REPO: apps/app/components/lo-trinh/].
- Lớp cắt ngang: tiếng Việt và Anh · 375 và 1280 · sáng và tối (AC-8).
- Core (8 ô): đọc × mọi nguồn → AC-1 · có ngày → AC-2 · độ đủ số đo → AC-3 · quá tải và đã qua → AC-4 · chưa ngày ba lý do
  → AC-5 · chỗ hiện của việc → AC-6 · trang và bản chụp đời trước, bản chụp mới → AC-7 · màn thật và khối thật → AC-8.
- Later: ngày riêng từng việc (kit không có) · khoảng lạc quan/bi quan như Jira (kit chỉ có một ngày) · hiện % hạn mức
  tuần cho chủ kho.
- Never: CRM tự tính ngày từ giờ máy hay từ ngày mục tiêu — kit là nguồn duy nhất, trang tự tính là nguồn sự thật thứ hai.
- [GIẢ ĐỊNH] Trưởng phòng ban hiểu «giờ máy» trong mục «Ước lượng» mà không cần định nghĩa thêm; phiên nghiệm thu chung
  22/10 sẽ cho biết.

## Đường đo

- Thước: tỷ lệ mốc đang chạy hiện ngày kèm «dự kiến» hoặc cờ «chưa có ngày» kèm lý do (ngưỡng sống 100 %) · số từ: bài
  kiểm chạy trên khối `LO-TRINH.html` thật của cây lúc giao, rồi đọc lại trang production ở phiên nghiệm thu · bảo đảm
  bởi: AC-8 (khối thật), AC-2, AC-5.
- Thước: mọi ngày tính trên số đo chưa đủ mang cờ · số từ: cùng bài kiểm, cờ của mỗi mốc có ngày so với việc chưa giao
  của mốc tính độc lập từ khối thô · bảo đảm bởi: AC-8 (khối thật), AC-3.
- Thước: độ lệch ngày dự kiến so với ngày khép thật ở mốc khép đầu tiên (ghi lại; lệch quá một ngày → gửi tín hiệu cho
  kit, không tính là việc này chết) · số từ: `du-bao.json` của hồ sơ mở sớm nhất của mốc so với ngày mốc hết việc mở trên
  `LO-TRINH.html` của `onehub` (`git log` của tệp) · đọc tay ở phiên nghiệm thu, không có code mới.

## Out of scope

- Sửa cách kit tính ngày (mốc bắt đầu hôm nay, giờ 24/24, không xếp mốc nối tiếp) — việc của kit, hạt giống
  `docs/plans/2026-10-17-hat-giong-gio-may-theo-moc-khong-xep-noi-tiep.md` bên kit.
- Ngày dự kiến riêng từng việc — khối không có; việc dùng ngày của mốc chứa nó.
- Hiện phần trăm hạn mức tuần — đó là hạn mức tài khoản máy của chủ kho, không phải thông tin cho trưởng phòng ban.
- Đổi đường đẩy bản chụp, API hay bảng lưu bản chụp — chúng giữ nguyên khối; AC-7 chứng điều đó, không sửa chúng.
- Sửa bộ vẽ `LO-TRINH.html` hay sửa tay bản chép bộ đọc ngoài việc chép lại nguyên hàm của kit.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Ba câu vòng đời (`docs/vong-doi.md`): không có loại bản ghi mới, không nút xoá hay lưu trữ, không trạng thái kết thúc
  mới — không áp.
- Giới hạn đã biết từ trước, mang vào Known limits:
  - Kit 2.32.0 tính mọi mốc bắt đầu hôm nay (trừ khi có `dung_tren`) và cộng giờ 24/24, nên ngày của nhiều mốc song song có
    thể vô nghĩa (đo 17/10: «Lộ trình bước 2» hoàn tất 17/10, mục tiêu 21/10); trang ghi «dự kiến», nói cách tính và gắn
    cờ, không sửa phép tính.
  - Kit 2.32.0 vẽ `LO-TRINH.html` trong worktree đọc tín hiệu ở thư mục chính nên lệch CI; tới bản 2.32.1, vòng này vẽ
    trang trong một bản `git clone --no-hardlinks` độc lập.
  - Ngày dự kiến chỉ có cho mốc có việc mở bằng kit từ 2.32.0; lúc giao 6/7 mốc đang chạy sẽ hiện «Chưa có ngày dự kiến»
    tới lần mở việc kế của mốc.
