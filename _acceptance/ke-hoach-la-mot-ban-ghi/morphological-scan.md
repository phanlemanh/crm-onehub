# Quét không gian — bên trong một kế hoạch 30 ngày

> Chạy 2026-09-22 tại phase khám phá, preset `entity-feature`, trước design doc.
> Đây là tầng sâu hơn của bản quét 2026-09-19
> (`_acceptance/dieu-phoi-30-ngay-dau/morphological-scan.md`, 47 ô): bản đó quét
> *phần mềm điều phối làm gì*; bản này quét *một kế hoạch cần những thao tác nào
> để làm việc được trên nó*.

## Ngữ cảnh

- **Chân sản phẩm:** kế hoạch treo vào Công ty, bước chép từ khuôn mang bộ phận ·
  người được giao · hạn, phễu bốn bậc trên từng môi giới
  `[SUY-TỪ-REPO: packages/db/prisma/schema.prisma §OnboardingPlan/Step/Enrollment]`.
  Luồng suôn sẻ đã ký ở vòng một: «chọn đối tác → Hồ sơ → giao bước / đánh dấu
  xong → đối tác rời nhóm đang tắc»
  `[SUY-TỪ-REPO: docs/superpowers/specs/2026-09-20-dieu-phoi-30-ngay-dau-design.md §4.1]`.
  Sau khi tạo, không thủ tục nào ghi vào bước
  `[SUY-TỪ-REPO: apps/api/src/onboarding/onboarding.service.ts — chỉ một onboardingStep.createMany]`.
- **Chân ngành:** giải phẫu một thẻ Trello `[NGÀNH: Trello]` làm thước cho trục
  vòng đời; năm sản phẩm của bản quét 19/09 (GUIDEcx · Rocketlane · Dock ·
  Gainsight CS · PartnerStack, đọc trang sản phẩm 2026-09-19) giữ nguyên cho tầm
  rộng.

## Trục

- **A — vòng đời của một mục việc** (thước CE: thành phần thẻ Trello):
  bảng/cột | thẻ | mẫu thẻ | checklist | người trên mục | hạn trên mục | thêm/bỏ/sắp
  mục | mục con | nhãn | thành viên thẻ | bình luận | đính kèm | nhật ký | lưu trữ
  thẻ | trường tuỳ chỉnh
- **B — vai × quyền** (thước CE: journey năm vai của bản quét 19/09):
  quan hệ đối tác | bộ phận chuyên môn | quản lý | quản trị | chuyển giao khi nghỉ
- **C — vào/ra** (thước CE: `CONTEXT.md` + điểm nhận vòng một):
  gõ tay | điểm nhận nền tảng | AgentTask | sang record sheet công ty/cá nhân |
  xuất | nhắc qua kênh
- **D — thời gian** (thước CE: preset entity-feature, trục Thời gian):
  lúc tạo | liên tục | tại mốc | sau 30 ngày

## Đang có / thiếu (đối chiếu mã `origin/onehub` @ `b7fac38a`)

| Ô | Trạng thái |
| --- | --- |
| A bảng/cột · thẻ · mẫu thẻ · nhãn (bộ phận) · lưu trữ thẻ (đóng) · trường tuỳ chỉnh | có |
| A checklist — đọc | có · **đánh dấu xong: thiếu** |
| A người trên mục | **thiếu** (schema có, API không) |
| A hạn trên mục | sinh từ khuôn · **sửa: thiếu** · «Quá hạn» so giờ thay vì ngày |
| A thêm/bỏ/sắp mục | **thiếu** |
| A thành viên thẻ (cầm trịch) | bắt buộc lúc tạo · **hiện và đổi: thiếu** |
| A bình luận · nhật ký | **thiếu** — `Activity` không có `planId` |
| A mục con · đính kèm | thiếu |
| B bộ phận chuyên môn làm và đánh dấu xong | **thiếu** |
| C sang record sheet | **thiếu** — hồ sơ là trang riêng |
| D liên tục | **chết** — `imNgay` tính từ `updatedAt` bước, bước không bao giờ đổi |

## Core — 6 / 31 ô có nghĩa (19%)

1. Giao người · đánh dấu xong · sửa hạn trên từng bước — mở khoá ba cột chết của danh mục.
2. Thêm / bỏ / sắp bước trong một kế hoạch — trả nợ `ST-hoso-khongkhuon` của vòng một.
3. Vết ai giao / ai xong / đổi hạn lúc nào — bàn giao có vết (#9 cũ), lịch sử thay đổi bắt buộc.
4. Ghi chú trên kế hoạch — bình luận Trello, gần như miễn phí khi có #3.
5. Hiện và đổi người cầm trịch — không có thì «một người cầm trịch» chỉ đúng lúc tạo.
6. Kế hoạch là một loại record sheet — đồng nhất với Công ty · Cá nhân · Thoả thuận.

## Later

- Tab «30 ngày» ở sheet Công ty · dòng ở sheet Cá nhân · «việc của tôi» · báo theo người · chuyển giao khi nghỉ — lượt 2 `moi-phia-deu-thay-ke-hoach`.
- Nhắc trước hạn · cảnh báo im lặng · theo dõi — lượt 3 `may-nhac-truoc-nguoi`.
- Mục con · phụ thuộc · đính kèm — lượt 4 `buoc-co-viec-con`, chỉ khi có bằng chứng bước còn quá to.
- Xuất danh mục — lượt 5.
- Sửa nhãn bước — nhãn đã nằm trong vết cũ; bỏ bước rồi thêm bước mới thay thế (duyệt 2026-09-22).
- Sửa số ngày mục tiêu — dịch mọi hạn đã sinh, là quyết định nghiệp vụ riêng (duyệt 2026-09-22).

## Never

- Kéo thả thẻ giữa cột — bảng cột cố ý chỉ để xem (`d6489181`); cột là bước tắc suy ra.
- Nhãn tự do — bộ phận đã là nhãn có nghĩa; nhãn tự do là đường về lại Sheet.
- Bình chọn, power-up, tự động hoá kiểu Butler — Tác nhân đã là chỗ đó.
- Ngày bắt đầu riêng cho bước — hạn một mốc là đủ cho 30 ngày.
- Kéo thả để sắp bước trong sheet — dễ thả nhầm trong khung hẹp, không dùng được bằng bàn phím; thay bằng Lên/Xuống.

## Cross-cutting áp mọi ô Core

- Mỗi thủ tục ghi có một tiêu chí đọc lại từ DB thấy đúng — vòng một lọt lỗ vì chỉ đo tạo và đọc.
- Mỗi thủ tục ghi chạm `OnboardingStep.updatedAt`; thao tác không đổi gì thì không chạm.
- Kế hoạch đã đóng là chỉ đọc.
- Dữ liệu cá nhân: vết mang tên người — Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 và Nghị định 356/2025/NĐ-CP, hiệu lực 01/01/2026 (tra lại 2026-09-19, đang áp); vết đi theo dây chuyền khi công ty bị xoá.
- Trạng thái rỗng · đang tải · lỗi cho mọi màn mới.
- Từ mới vào `CONTEXT.md` trước khi lên màn.

## Giới hạn của bản quét

- Trello dùng từ hiểu biết chắc, không teardown lại; đủ cho trục A vì chỉ lấy giải phẫu thẻ, không lấy hình.
- Bản quét không có ô `[GIẢ ĐỊNH]` mới; giả định 2 và 4 của vòng một (bộ phận có tài khoản CRM) vẫn chưa thử và được mang sang `opportunity.md` giả định 2.
