# Bản quét không gian — ke-hoach-sinh-viec (DA3)

Preset `entity-feature`, chạy 2026-10-14 ở bước thiết kế, đọc mã `origin/onehub` c4b46acd6.

## Ngữ cảnh

- Sản phẩm: OneHub CRM, khu Điều phối 30 ngày đầu và Việc. Chân sản phẩm lấy bằng cách đào kho:
  - `[SUY-TỪ-REPO: docs/plan/viec-du-an-nghien-cuu.md]`
  - `[SUY-TỪ-REPO: packages/db/prisma/schema.prisma]`
  - `[SUY-TỪ-REPO: _acceptance/viec-chung/contract.md]`
- Chân ngành: Odoo activity plan, Salesforce Action Plans, Pipedrive cho «kế hoạch mẫu sinh việc thường, hạn tính từ ngày mốc, người làm chọn lúc chạy». Pipedrive, HubSpot, Dynamics, 1Office cho «deal thắng thì mở việc bàn giao».
  - Tên và bảng chấm có nguồn đánh số ở `docs/plan/viec-du-an-nghien-cuu/02-crm-lon.md`, `03-crm-moi.md` và `06-thi-truong-viet.md`. Lượt khảo sát 05/10 đã tra trang sản phẩm.
  - Vì đã tra, ô lấy từ đây mang nhãn `[NGÀNH: <tên>]` chứ không phải `[GIẢ ĐỊNH]`.

## Trục

**A. Vòng đời của kế hoạch tạo từ khuôn**
- Giá trị:
  1. tạo kế hoạch: chọn người cho từng phòng ban
  2. việc sinh ra
  3. sửa một việc đã sinh: đổi người, đổi hạn
  4. xong, huỷ, mở lại
  5. thêm việc tay vào kế hoạch
  6. đóng kế hoạch, mở lại
  7. chuyển việc khi nghỉ
- Thước CE: hành trình chủ cầm trịch trong `docs/plan/lo-trinh-dieu-phoi-30-ngay.md` mục 4 lượt 1, cùng sáu thủ tục ghi của `onboarding.router.ts`.

**B. Nguồn kích hoạt kế hoạch**
- Giá trị:
  1. tạo tay ở danh mục 30 ngày
  2. tạo tay ở sheet công ty
  3. deal sang giai đoạn thắng qua `setStage`
  4. deal sang giai đoạn thắng hàng loạt (`bulkSetStage`)
  5. deal tạo thẳng ở giai đoạn thắng
  6. deal bị dời sang giai đoạn thắng vì giai đoạn cũ bị lưu trữ (`giai-doan.service.ts:155`)
  7. Tác nhân soạn bàn giao
- Thước CE: mọi nơi gọi `chuyenGiaiDoanTrongTx`, cùng nhánh `deal.closed` trong `deals.service.ts` `create`.

**C. Người × quyền**
- Giá trị:
  1. người tạo kế hoạch (thành viên)
  2. người được chọn làm, ca thường
  3. người được chọn làm là trưởng phòng
  4. phòng ban không có trưởng phòng
  5. người được chọn mang vai «chỉ OKR» (bị chặn)
  6. người phụ trách deal (nhận gợi ý)
  7. quản trị soạn khuôn
- Thước CE: ma trận vai của `viec-chung` AC-3/AC-5 và luật P3 (`packages/db/src/viec.ts:233`).

**D. Thời gian**
- Giá trị:
  1. hạn = ngày bắt đầu kế hoạch + số ngày lệch của bước
  2. nhắc buổi sáng cho việc quá hạn hoặc sắp hạn
  3. nhắc buổi sáng cho gợi ý chưa xử lý
  4. gợi ý để quá 3 ngày
  5. đo ngưỡng sau 14 ngày
- Thước CE: `NHAC` trong `packages/db/src/onboarding-nhac.ts:61` và ngưỡng đã ký ở `opportunity.md`.

Mỗi trục có ≤ 7 giá trị, không trục nào cần tách.

## Dựng không gian

Lát cắt theo trục A (trục quan trọng nhất), tổ hợp với B, C, D. Có 41 ô có nghĩa; gạch 9 ô vô nghĩa, chẳng hạn «trưởng phòng × thêm việc tay × deal thắng».

## Core (8 / 41 ≈ 20 %)

1. Tạo kế hoạch từ khuôn: mỗi bước sinh đúng một Việc gắn kế hoạch, có phòng ban, hạn tính từ ngày mốc, người làm chọn cho từng phòng ban (mặc định trưởng phòng). `[NGÀNH: Odoo activity plan · Salesforce Action Plans]`
2. Người được chọn mang vai «chỉ OKR» thì bị từ chối kèm lý do; phòng ban không có trưởng phòng thì người làm mặc định là người cầm trịch. `[SUY-TỪ-REPO: packages/db/src/viec-ghi.ts:144]`
3. Việc sinh ra đi đúng đường sống của Việc: hiện ở Việc của tôi, vào nhắc buổi sáng, «xong n» đóng được, và xong ở Việc thì bước được đánh dấu xong — một nguồn sự thật cho trạng thái xong.
4. Thêm bước tay vào kế hoạch cũng sinh Việc, nối với `addStep` của E6 `dieu-phoi-va`.
5. Deal sang giai đoạn thắng qua mọi đường (B3–B6) mà công ty chưa có kế hoạch mở thì sinh đúng một gợi ý ở trạng thái «chờ»; luật này chạy tất định trong cùng giao dịch ở máy chủ. `[NGÀNH: Pipedrive · HubSpot]`
6. Người phụ trách deal xử lý gợi ý: «Mở kế hoạch» mở ô tạo kế hoạch điền sẵn công ty; «Bỏ qua» ghi trạng thái. Một kế hoạch được tạo cho công ty bằng bất kỳ đường nào thì gợi ý đang chờ của công ty đó tự chuyển «đã mở».
7. Gợi ý chưa xử lý vào nhắc buổi sáng của người phụ trách deal.
8. Thước đo ngưỡng (a) và (b) đọc được từ cơ sở dữ liệu, như `do-nguong.mjs` của `viec-chung`.

## Later

- Ngày bắt đầu cho từng bước hoặc việc sinh từ khuôn: chuyển sang DA4, vì Gantt là bên đọc đầu tiên. Đây là câu hỏi cho chủ kho ở Cổng Phạm vi.
- Chép các bước của kế hoạch cũ (tạo trước DA3) sang Việc: cần cổng riêng như DA1b, vì là chép dữ liệu production.
- Khuôn tự gợi ý theo `partnerType` của công ty khi mở từ gợi ý.
- Gắn kế hoạch với deal để dự án đọc tệp và ghi chú của deal. `[NGÀNH: Pipedrive · Dynamics]`
- Gợi ý theo khuôn riêng cho từng giai đoạn thắng hoặc từng loại deal.

## Never

- Tác nhân soạn bản bàn giao do AI viết (B7): ghi chú của hàng DA3 nói nó «thuộc tác tử», tức một hàng khác.
- Tự mở kế hoạch khi deal thắng mà không hỏi người: lộ trình đã bác «tự làm thay vì hỏi» (`da_bac` x4 cùng tinh thần); câu giao nói «gợi ý».
- Nhân bản một việc cho nhiều người trong một phòng ban (`da_bac` x1).

## Cross-cutting áp mọi ô Core

- Mỗi thủ tục ghi mới có một AC đọc lại từ cơ sở dữ liệu (lộ trình 30 ngày §8).
- Có trạng thái chờ tải, lỗi và rỗng trên ô tạo kế hoạch và trên thẻ gợi ý.
- Có vết lịch sử: Việc ghi vết «tao» với nguồn `khuon`; gợi ý ghi người và giờ xử lý.
- Tin nhắc không mang tên công ty đối tác tới vai «chỉ OKR» (`viec-chung` AC-8).
