## Quét không gian tiêu chí (morphological-scan, preset entity-feature)

### Ngữ cảnh
- Sản phẩm: CRM nội bộ OneHub — chân sản phẩm: đào kho (`CONTEXT.md`, `packages/db/src/onboarding-nhac.ts`, `packages/db/src/kenh-thong-bao.ts`, `apps/app/components/app-header.tsx`) · chân ngành: chuông thông báo của Salesforce (chuông hiện 20 thông báo gần nhất trong 90 ngày) và HubSpot (chuông có số chưa đọc; người dùng than phiền số bị xoá khi mới bấm chuông chứ chưa đọc).

### Trục
- **A. Vòng đời thông báo:** sinh từ lượt nhắc · gộp mục lặp · hiện trên chuông (số) · bấm mở (tới chỗ, thành đã đọc) · đánh dấu tất cả đã đọc · xem lại ở trang lịch sử · tự dọn khi quá hạn giữ. [thước CE: vòng đời bản ghi `docs/vong-doi.md` + NGÀNH Salesforce, HubSpot]
- **B. Người nhận × quyền:** người có kênh · người không kênh · trưởng phòng (tóm tắt OKR) · quản trị (trần AI, đối soát) · vai chỉ-OKR · người mất quyền xem bản ghi đích. [thước CE: `VAI_NHAN_BAO_AI` trong `packages/db/src/ai-nhac.ts`, `okr-tom-tat.ts`, `docs/` vai chỉ-OKR] [SUY-TỪ-REPO: packages/db/src/ai-nhac.ts]
- **C. Nguồn × đích:** nhóm mục nhắc (onboarding · Việc · OKR · tài liệu · tóm tắt OKR · AI) × đích (bản ghi cụ thể · trang danh sách đã lọc). [thước CE: danh sách loại trong `THU_TU_NHAC`, đường dẫn trong `duongMo`] [SUY-TỪ-REPO: packages/db/src/onboarding-nhac.ts]
- **D. Trạng thái màn × khổ:** chờ tải · rỗng · lỗi tải · ít · nhiều (>99, cuộn, trang sau) · đang cập nhật — × 1280 / 375. [thước CE: `docs/design.md` mục «Nếp màn trong app»]

### Core
1. A·sinh × B·mọi người — mỗi mục nhắc thành một thông báo cho mọi người bất kể kênh (đây là lý do của hàng).
2. A·gộp × C·mọi nguồn — mục lặp không sinh dòng mới khi chưa xong.
3. A·hiện × D·mọi trạng thái — chuông có số chưa đọc, 0 thì không số, quá 99 thì «99+», chờ tải/lỗi không vỡ đầu trang.
4. A·bấm mở × C·đích — tới đúng chỗ, thành đã đọc; mở chuông KHÔNG đổi số (khác HubSpot).
5. A·tất cả đã đọc — số về 0 ngay.
6. A·xem lại × D — trang lịch sử, lọc chưa đọc, khổ 375.
7. B·mất quyền — bấm vào bản ghi không còn quyền thì nói rõ.
8. B·chỉ của mình — không ai thấy thông báo của người khác.
9. A·sinh × lượt hỏng — ghi thông báo và gửi Zalo/Slack không làm hỏng nhau; chạy lại không nhân đôi.
10. Đường đo — đối chiếu mục nhắc với thông báo theo ngày, đếm người đã bấm mở.

### Later
- Sự kiện tức thời (giao việc, nhắc tên) ghi ngay lúc xảy ra — đi cùng TB2.
- Zalo/Slack rẽ từ bản ghi, cài đặt loại × kênh, mức Cần làm / Để biết — TB2.
- «Có n tín hiệu mới» (TH2), tín hiệu đổi chỗ (TH3) — nguồn mới của chuông ở vòng của chúng.
- Nhóm thông báo theo bản ghi; tắt một loại từ chính thông báo [NGÀNH: HubSpot «Don't show me these again»] — cần cài đặt của TB2.
- Chấm đỏ trên thẻ trình duyệt khi có chưa đọc [NGÀNH: HubSpot].

### Never
- Người dùng xoá từng thông báo — thông báo là vết của điều CRM đã báo; tự dọn theo hạn giữ (chờ chủ kho chốt ở Cổng Phạm vi).
- Websocket — app không có, mọi chỗ cập nhật dùng hỏi lại định kỳ.
- Đẩy qua trình duyệt, thư, ứng dụng điện thoại — ngoài bản phạm vi N1–N2.

### Cross-cutting áp mọi ô Core
- Song ngữ vi/en: chữ thông báo dựng lúc đọc theo ngôn ngữ người xem, không lưu chữ sẵn.
- Dữ liệu cá nhân: thông báo chỉ mang mã bản ghi và tên đã có trong CRM; không gửi đi đâu ở vòng này.
- Chờ tải / rỗng / lỗi theo `docs/design.md`; bàn phím và trình đọc màn cho chuông và danh sách.
