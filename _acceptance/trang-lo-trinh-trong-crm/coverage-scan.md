# Quét độ phủ — trang Lộ trình trong CRM

Preset: `entity-feature` (thực thể: một việc trên lộ trình), chỉnh cho trang chỉ đọc.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ của OneHub — chân sản phẩm: đào repo (`CONTEXT.md`, `apps/app/lib/pham-vi-man.ts`,
  `docs/plan/lo-trinh-*.json`, đặc tả `lo-trinh-du-lieu.md` của kit) · chân ngành: chế độ xem lộ trình cho
  người ngoài đội sản phẩm của Productboard (Portal), Jira Product Discovery (vai «stakeholder» chỉ xem),
  Linear (lộ trình dự án: trạng thái, ngày đích, lọc theo đội).

## Trục

- **A — Người xem:** thành viên đủ quyền | vai chỉ OKR | chưa đăng nhập
  [thước CE: `apps/app/lib/pham-vi-man.ts` — ba lối của bộ chặn đường; SUY-TỪ-REPO]
- **B — Nguồn dữ liệu:** khối đủ phiên bản 1 | không có khối | khối không phải JSON | khuôn lạ | phiên bản
  mới hơn | thiếu khoá | một lộ trình mang lỗi | tệp không có trong bản dựng
  [thước CE: bảng «Đọc khoan dung» của `lo-trinh-du-lieu.md` (năm ca) + hai ca của kho; SUY-TỪ-REPO]
- **C — Câu người xem hỏi:** cả lộ trình đi tới đâu | việc của luồng X ở đâu | việc này bao giờ xong
  (mốc) | việc nào trễ | việc nào kế tiếp | trạng thái này có đáng tin không (cờ lệch) | việc nào đã bác
  [thước CE: «Những gì bản chiếu thường cần» trong `lo-trinh-du-lieu.md` + NGÀNH: Productboard Portal,
  Jira Product Discovery, Linear]
- **D — Ngày xem so với mốc:** trước ngày mốc | đúng ngày mốc | sau ngày mốc còn việc | sau ngày mốc hết
  việc — theo giờ máy người xem [thước CE: khối `LO-TRINH-DU-LIEU-LUAT-NGAY`; SUY-TỪ-REPO]

Cắt ngang: khổ màn (máy tính, điện thoại) · hai ngôn ngữ giao diện · nền sáng/tối · chữ người nhập
không dịch.

## Core

1. A{đủ quyền, chỉ OKR} × B{đủ} × C{cả lộ trình} — tiến độ bốn nhóm và mọi việc với đúng chữ trạng thái
   của khối, từng lộ trình của kho.
2. × C{việc của luồng X} — lọc theo nhóm của hàng, giữ trên đường dẫn để gửi cho người khác.
3. × C{bao giờ xong, việc trễ} × D{cả bốn} — mốc đã qua còn việc, việc trễ, đúng ngày mốc chưa qua; theo
   ngày của máy người xem.
4. × C{có đáng tin không} — cờ lệch của từng việc và chỗ cần sửa của kế hoạch hiện đúng câu của khối.
5. B{năm ca khoan dung, lộ trình lỗi, tệp vắng} — mỗi ca một câu nói rõ, trang không vỡ.
6. A{chỉ OKR} — mục Lộ trình có trên thanh điều hướng và mở được; A{chưa đăng nhập} — về trang đăng nhập.
7. B{đủ} — khớp từng việc với `LO-TRINH.html` cùng lượt vẽ (đọc qua hàm `docDuLieu` chép nguyên, không
   tự suy trạng thái).
8. Bản dựng production mang tệp `LO-TRINH.html` của chính commit được dựng.

## Later

- Tìm việc theo chữ — số việc mỗi lộ trình còn dưới trăm; lọc nhóm đủ cho lượt đầu.
- Dòng «vẽ lúc …» — khối dữ liệu không mang thời điểm vẽ; cần bộ kit thêm khoá (NGÀNH: cả ba sản phẩm đều
  hiện thời điểm cập nhật).
- Lọc theo phòng ban thật — cần bộ kit thêm một khoá riêng (chủ kho chốt 08/10).
- Báo khi trạng thái một việc đổi (NGÀNH: Productboard, Linear có theo dõi) — là việc của LT2 hoặc sau.
- C{việc đã bác} — hiện gọn, thu gọn mặc định; không phải câu trưởng phòng ban hay hỏi.

## Never

- Ghi ý định, trạng thái, chữ ký từ CRM — nguồn ý định là git (chủ kho chốt 08/10).
- Tự suy trạng thái khi trang thiếu khối — dựng nguồn sự thật thứ hai.
- Hiện dòng lệnh mở việc trong Claude Code (`hang_ke.lenh`) — người xem không dùng git.
- Gộp lộ trình nhiều kho — mỗi kho một trang.

## Cắt ngang áp mọi ô Core

- Khổ điện thoại 375px không cuộn ngang.
- Hai ngôn ngữ giao diện, chữ theo tệp lời của khu.
- Câu giao, tên lộ trình, chữ trạng thái, cờ là chữ của tệp kế hoạch: không dịch, đánh dấu để trình duyệt
  không tự dịch.
