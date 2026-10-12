# Quét chống sót — tín hiệu (preset entity-feature)

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, một công ty, mọi phòng ban dùng từ 14/10 — chân sản phẩm: đào repo
  [SUY-TỪ-REPO: CONTEXT.md] [SUY-TỪ-REPO: docs/api.md] (một tenant, ba vai owner/admin/member cộng vai «chỉ OKR»).
- Chân ngành (cận kề — tiện ích góp ý trong ứng dụng):
  [NGÀNH: Sentry User Feedback widget] nút cố định ở mọi màn, tự ghi đường dẫn màn, gửi một ô chữ;
  [NGÀNH: Canny] người gửi thấy trạng thái ý của mình (đang xét · đã lên kế hoạch · đang làm · xong) và nhận tin khi trạng thái đổi.

## Trục

- **A — Vòng đời một tín hiệu:** gửi · cất kèm trần · xoá khi chưa kéo về · kéo về git · gom (kit, ngoài CRM) · trạng thái về người gửi · đếm cho ngưỡng
  [thước CE: chuỗi «tín hiệu → nhóm → hàng → hồ sơ → trạng thái» của kit, `docs/superpowers/specs/2026-10-11-cua-tin-hieu-gom-nhom-design.md` §3 ở kho kit; luật vòng đời `docs/vong-doi.md`]
- **B — Người × quyền:** người gửi (mọi vai, kể cả «chỉ OKR») · quản trị chạy lượt kéo về · người khác
  [thước CE: bảng phạm vi router `docs/api.md` «tRPC is the data surface»; `apps/app/lib/pham-vi-man.ts`]
- **C — Nguồn của trạng thái:** CSDL của CRM (chưa vào git) · bản vẽ lộ trình có danh sách tín hiệu · bản vẽ không có danh sách / hỏng / vắng
  [thước CE: năm ca đọc khoan dung của LT1 (`_acceptance/trang-lo-trinh-trong-crm/contract.md`)]
- **D — Ca:** suôn sẻ · rỗng · vượt trần · máy chủ lỗi · khoá vắng hoặc sai · chạy lặp · tín hiệu đã xoá
  [thước CE: ca của luồng «Báo sai» `apps/app/app/(app)/[slug]/tai-lieu/hop-bao-sai.tsx` và trần của `tai-lieu-hoi.service.ts`]

## Core

1. A-gửi × B-người gửi × D-suôn sẻ/rỗng/vượt trần/lỗi — nút ở mọi màn, ô kể, màn tự ghi, trần mỗi ngày, giữ chữ khi lỗi.
2. A-cất × B-mọi vai — vai «chỉ OKR» gửi được (router phạm vi chung).
3. A-xoá × B-người gửi × D-đã kéo về — xoá khi chưa kéo về, từ chối sau đó, kiểm trong cùng giao dịch.
4. A-kéo về × B-quản trị × D-suôn sẻ/chạy lặp/khoá vắng/đã xoá — tệp đúng khuôn kit, bất biến khi chạy lại, không mang danh tính.
5. A-trạng thái × C-ba nguồn — câu của kit khi có, hai câu của CRM khi chưa, khoan dung khi bản vẽ thiếu.
6. A-trạng thái × B-người khác — chỉ thấy của mình.
7. A-đếm × B-quản trị — số tín hiệu 30 ngày theo phòng ban (đường đo của ngưỡng).

## Later

- Báo tin cho người gửi khi trạng thái đổi [NGÀNH: Canny] — chờ xem người gửi có tự mở trang không.
- Đính ảnh chụp màn hình [NGÀNH: Sentry User Feedback widget] — cần chỗ cất tệp và luật riêng tư.
- Quản trị xem, gỡ tín hiệu rác trước khi kéo về — lượt gom đã xếp rác vào «lẻ»; mở khi rác thật nhiều.
- Lượt kéo về tự chạy theo lịch — lối 1 chốt lệnh chạy tay đầu lượt gom.

## Never

- Bầu chọn, xếp ưu tiên theo số tín hiệu [NGÀNH: Canny] — trái luật kit «không xếp điểm ưu tiên tự động».
- Gom, phân loại bằng AI trong CRM — việc phán của phiên gom theo skill kit.
- Ứng dụng tự commit vào git — Cổng Đáng 12/10 chọn lối 1.
- Sửa nội dung tín hiệu sau khi gửi — tín hiệu là lời kể đã gửi; gửi lại một tín hiệu mới.

## Cross-cutting áp mọi ô Core

- Dữ liệu cá nhân: tên, thư, mã người gửi không vào git; trường «màn» chỉ giữ đường dẫn, bỏ phần truy vấn.
- Nhật ký máy chủ không ghi nội dung tín hiệu (docs/api.md, Logging).
- Trạng thái chờ tải, rỗng, lỗi tải theo nếp màn của `docs/design.md`.
