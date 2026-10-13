# Quét độ phủ — viec-chung (DA1)

Preset `entity-feature` của skill `morphological-scan` (acceptance-gate 2.28.0), chạy 13/10/2026 ở S1.

## Ngữ cảnh

- Sản phẩm: OneHub Center (CRM nội bộ một workspace) — chân sản phẩm: đào repo, bản Product Context ở
  `docs/plan/viec-du-an-nghien-cuu/01-ma-kho-onehub.md` mục 6 [SUY-TỪ-REPO: docs/plan/viec-du-an-nghien-cuu/01-ma-kho-onehub.md]
  · chân ngành: khảo sát DA0 ngày 05/10 trên 29 nền tảng có tên — Salesforce, HubSpot, Odoo, Asana, Bitrix24,
  Base, 1Office, MISA AMIS, Fastwork [NGÀNH: docs/plan/viec-du-an-nghien-cuu.md mục 3, bản gốc ở
  docs/plan/viec-du-an-nghien-cuu/02…06].

## Trục

- **A. Vòng đời việc**: tạo · sửa nội dung và hạn · đổi người (thực hiện, theo dõi) · gắn và gỡ bản ghi · đổi
  trạng thái (năm nhóm, trả về «Làm lại», mở lại) · dọn (xoá khi chưa có lịch sử, kết cục Xong/Huỷ, bản ghi cha
  bị xoá vĩnh viễn) · chuyển giao khi người nghỉ.
  [thước CE: luật vòng đời `docs/vong-doi.md` ba câu + mẫu «Người được giao luôn đóng được việc của mình»,
  «không nhân bản việc khi giao nhiều người» — NGÀNH: Odoo, Salesforce, Asana, Bitrix24, 1Office]
- **B. Người × phạm vi việc**: người giao · người thực hiện · người theo dõi · thành viên khác có phạm vi đối tác
  · quản trị · người vai «chỉ OKR» · người đã rời — × việc gắn bản ghi đối tác | việc không gắn gì (riêng).
  [thước CE: phương án P3 `docs/plan/viec-du-an-nghien-cuu.md` mục 4; bốn vai `packages/validation/src/vai-workspace.ts`]
- **C. Nơi việc đi vào và hiện ra**: vào — ô soạn dòng thời gian của bốn khung bản ghi · màn Việc của tôi · API
  (tRPC/REST) · Tác nhân (`create_crm_activity` TASK) · chép từ «việc cần làm» cũ; ra — dòng thời gian của từng
  bản ghi gắn · Việc của tôi · khung việc · Tổng quan · thẻ «Việc của bạn» OKR · tin nhắc Zalo/Slack · trả lời
  «xong n» · chuyển việc khi nghỉ.
  [thước CE: bản đồ màn ở `01-ma-kho-onehub.md` mục 4 «Màn sẽ hiện việc», đối chiếu mã ở báo cáo đọc mã 13/10]
- **D. Thời gian**: hạn (quá hạn · hôm nay · sắp hạn) · nhắc buổi sáng · lịch sử thay đổi · cửa sổ đo 14 ngày.
  [thước CE: luật nhắc của bước kế hoạch `packages/db/src/onboarding-nhac.ts` — cùng bộ gom]

## Core (≤20%)

1. A·tạo × C·dòng thời gian deal/kế hoạch × B·người giao chọn người thực hiện khác mình — lời hứa của câu giao.
2. A·gắn × C·dòng thời gian — một việc gắn deal và kế hoạch hiện ở cả hai dòng thời gian, không nhân bản.
3. A·đổi trạng thái × B·(người thực hiện, người giao, người theo dõi, thành viên khác) — vá «ai cũng đánh dấu
   xong được».
4. B·vai «chỉ OKR» × A·(giao, theo dõi, chuyển giao, đổi vai) — vế an toàn của ngưỡng.
5. B·mọi vai × C·(đọc một việc, danh sách, dòng thời gian, REST) — quyền xem P3.
6. C·Việc của tôi × D·hạn — người nhận thấy việc (ba nhóm: giao cho tôi, tôi giao, đang theo dõi).
7. C·tin nhắc Zalo/Slack + «xong n» × D·hạn — người nhận được nhắc.
8. A·chuyển giao × C·hộp «Chuyển việc» — việc đang mở của người nghỉ không thành mồ côi.
9. A·mọi thay đổi × D·lịch sử — ai đổi gì lúc nào.
10. A·dọn — ba câu vòng đời, bản ghi cha xoá vĩnh viễn chỉ gỡ liên kết.
11. C·chép từ «việc cần làm» cũ — một chỗ cho mọi việc trên dòng thời gian.
12. D·cửa sổ đo — thước đếm hai ngưỡng của Cổng Đáng.

## Later

- Bulk: đổi trạng thái, đổi người nhiều việc một lần (Later — chưa có người dùng thật hỏi).
- Tìm việc trong ô tìm kiếm chung (⌘K) — Later.
- Việc gắn KR (DA5), việc con và Kanban (DA2), việc sinh từ khuôn kế hoạch (DA3), dự án (DA4).
- Trạng thái tự đặt trong năm nhóm (Jira, Linear, ClickUp) — DA1 chỉ dùng năm nhóm làm trạng thái.
- Bình luận và đính kèm trên việc [NGÀNH: Asana, Bitrix24] — Later.
- Đẩy việc ra lịch Google/Outlook — Later.
- Trưởng phòng thấy việc của người trong phòng — DA7.

## Never

- Nhân bản việc khi giao nhiều người — bẫy x1 của lộ trình (`da_bac`).
- Tự đóng hay xoá việc khi đóng hay xoá bản ghi cha — bẫy x4 của lộ trình.
- Tiến độ KR cộng từ việc xong — bẫy x3.
- Gộp trùng (merge duplicate) việc — việc không có khoá tự nhiên để phát hiện trùng.

## Cross-cutting áp mọi ô Core

- Vai «chỉ OKR» không bao giờ nhận tên đối tác qua bất kỳ kênh ra nào ở trục C.
- Mọi thay đổi để một dòng lịch sử; mọi chữ trên màn qua bộ chữ tiếng Việt và luật vòng đời.
- Chờ tải, lỗi tải, rỗng theo `docs/design.md` mục «Nếp màn trong app».
- Dữ liệu cá nhân: việc có thể mang tên cá nhân đối tác — không gửi ra kênh mới nào ngoài Zalo/Slack đã có
  [NGÀNH: Luật Bảo vệ dữ liệu cá nhân 2025 — đã chốt ở `docs/plan/lo-trinh-dieu-phoi-30-ngay.md:334`].
