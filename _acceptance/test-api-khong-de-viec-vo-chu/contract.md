---
schema_version: 1
feature: Test api không để lại dòng AgentTask vô chủ cho gói agent
slug: test-api-khong-de-viec-vo-chu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ci]
status: signed-off
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-24T04:55:00Z
design_doc: docs/superpowers/specs/2026-09-24-test-api-khong-de-viec-vo-chu-design.md
---

# Acceptance Contract: test-api-khong-de-viec-vo-chu

## Context

Trong một lượt `bun run test`, gói api để lại liên hệ chưa dọn, rồi một lần
đăng nhập thật trong `go-la-cat-quyen.spec.ts` đánh thức lượt quét của mọi ứng
dụng Nest từng dựng trong tiến trình — kể cả ứng dụng đã đóng — và lượt quét
xếp việc `identify` cho những liên hệ đó. Các dòng việc sống sang gói agent và
làm đỏ bài `claimDue`. Vòng này bịt cả hai nguồn: dọn thứ đã gieo, và cho ứng
dụng đã đóng thôi phản ứng với đăng nhập.

Source input: prompt (bằng chứng CI run 35879017470 lượt 1, phanlemanh/crm-onehub)

## Criteria

- AC-1: Given một lượt chỉ chạy `dieu-phoi.spec.ts` và `dieu-phoi-diem-nhan.spec.ts`, When lượt kết thúc, Then cơ sở dữ liệu của lượt không còn liên hệ, công ty, người dùng hay bộ phận nào do bộ gieo `dieu-phoi-gieo.ts` tạo.
- AC-2: Given hai ứng dụng api dựng trong cùng tiến trình, cái trước đã đóng, When một người đăng nhập thật, Then ứng dụng đang chạy nhận đúng một lần gọi quét và ứng dụng đã đóng nhận không lần nào.
- AC-3: Given một ứng dụng api đang chạy và một liên hệ chưa từng được tìm hiểu, When một người đăng nhập thật, Then lượt quét vẫn xếp một việc `identify` cho liên hệ đó như trước vá, và bài test xoá đúng các dòng việc lượt quét ấy sinh ra để sau file không còn dòng nào của nó.
- AC-4: Given một liên hệ chưa từng được tìm hiểu đã có trong cơ sở dữ liệu trước khi `go-la-cat-quyen.spec.ts` chạy, When file đó chạy xong mọi lần đăng nhập của nó, Then không có dòng `AgentTask` nào mang mã liên hệ đó.
- AC-5: Given cả gói api chạy trong một lượt (`bun run test -- "cd apps/api && bun test"`), When lượt kết thúc, Then cơ sở dữ liệu của lượt còn 0 dòng `AgentTask` chưa xong, 0 liên hệ và 0 công ty.
- AC-6: Given `go-la-cat-quyen.spec.ts` là bài của một hồ sơ đã ký, When vòng này sửa nó, Then diff của file chỉ thêm dòng, không xoá hay sửa dòng nào của bài cũ.

## Coverage

- Bỏ coverage-scan — hai nguồn rò đã đo bằng số tại chỗ (11 liên hệ từ một bộ gieo; handler tích qua `createApp`), không gian là một chuỗi nhân quả chứ không phải lưới nhiều chiều (entry d-20260924T041816Z-2 trong decisions.jsonl).

## Out of scope

- Bộ phận và khuôn kế hoạch mà `dieu-phoi.spec.ts` tạo qua `OnboardingService` (không qua bộ gieo): không phải đầu vào của lượt quét, không gây dòng việc.
- Cho `onSignedIn` trả hàm huỷ đăng ký trong `packages/auth` — đường T3; handler của ứng dụng đã đóng vẫn nằm trong mảng, chỉ thôi hành động.
- Chờ lượt quét đang dở khi ứng dụng đóng (tắt êm): lượt quét bắt đầu trước `close()` vẫn chạy tới cuối.
- Cho dòng `AgentTask.contactId` khoá ngoại để xoá liên hệ kéo theo việc — đổi lược đồ, đường T3.
- Tái hiện thứ tự file của CI: `bun test` không giữ thứ tự tham số, nên các phép đo tự dựng tình huống.

## Notes

- Đổi sản phẩm duy nhất: `apps/api/src/backfill/backfill.service.ts` thêm `onModuleDestroy` bật cờ đã dừng; handler đăng nhập bỏ qua khi cờ bật. Production chỉ có một ứng dụng, đóng khi tắt tiến trình — không ai quan sát được khác biệt.
- Phép đo AC-3 dựa vào bộ nhớ đệm riêng từng ứng dụng (không đặt `REDIS_URL`, như CI và `.env` hiện tại). Có Redis dùng chung thì khoá chống quét lặp 5 phút có thể chặn lượt quét của bài.
- Bản vá cờ đã-dừng đáng gửi lên hãng (`trycompai/crm`) — cùng lỗi tích handler có ở bản gốc.

- Known limits — chọn ở Cổng Bằng chứng 2026-11-02:
  - Ngoài-1: dịch vụ quét tắt bằng `OnModuleDestroy` và một cờ, khác nếp `OnApplicationShutdown` của các dịch vụ khác; handler của ứng dụng đã đóng vẫn nằm trong danh sách đăng nhập, chỉ không làm gì.
  - Ngoài-2: thước đếm sau hai file điều phối chép tay khuôn tên từ bộ gieo và không có bước báo «đo rỗng»; bộ gieo đổi tên thì thước có thể báo sạch sai.
  - Ngoài-3: thước so mã lượt thô với tên cơ sở dữ liệu; mã lượt tự đặt có chữ hoa hoặc gạch nối làm thước báo đọc nhầm giả. Mã lượt máy sinh không vấp.
  - Ngoài-4: phép đếm sau hai file điều phối không có đối chứng dương chạy lại mỗi lượt; chiều đỏ chỉ có bản ghi một lần trên mã trước vá.
  - Ngoài-5: vế «bộ phận» của phép đếm đó luôn bằng 0, vì hai file điều phối không gieo bộ phận qua bộ gieo.
