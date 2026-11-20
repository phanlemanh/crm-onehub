---
schema_version: 1
feature: Sửa 9 ca đỏ sẵn của suite api — bom giờ trong mã kiểm (cmst-goc, gop-y-dung-cho)
slug: sua-bom-gio-test-api
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: machine-cleared
design_doc: docs/superpowers/specs/2026-11-20-sua-bom-gio-test-api-design.md
approved_by: Phan Le Manh
approved_at: 2026-11-20
---

# Acceptance Contract: sua-bom-gio-test-api

## Context

Từ 12/11/2026 suite api trên `onehub` đỏ sẵn 9 ca (`cmst-goc` ×1, `gop-y-dung-cho` ×8: `dem-chip` ×5, `loc-gop-y`,
`dong-bo`, `bo-qua`). Ngày 03/11 suite này xanh ở `6561f724`, mã không đổi từ đó; đỏ vì ngày giờ. Chỗ đỏ sẵn này
làm lượt chấm S4 của vòng chuyển kit (II.2) REJECT dù 14/14 bài của vòng đạt. Chủ kho duyệt sửa bằng một vòng
riêng («Duyệt cả hai»). Đo 20/11 bằng đầu dò tạm, cả hai đều là bom giờ trong mã kiểm:

- `cmst-goc`: `beforeAll` ghi chương trình OKR (`okr.setProgram`) lúc đồng hồ còn chạy giờ thật (20/11), rồi
  `gieoKyDong` ghim đồng hồ về `LUC_DOC = 2026-11-10T03:00Z`; `okr.soanMo` đọc cấu hình bằng `createdAt ≤ 10/11`
  nên không thấy hàng nào và trả `don-vi-chua-bat`. Hôm 03/11 giờ thật còn trước 10/11 nên ca xanh.
- `gop-y-dung-cho`: một tệp chạy trước để lại hàng `okrProgramConfig` ghi ở giờ thật (20/11, người tạo không
  mang tiền tố mẫu, `aiOn: false`) mà `donTroLy` không dọn. Bộ đếm chip góp ý (`demGopYCho`) đọc cấu hình mới
  nhất theo `createdAt`, nên hàng ấy thắng hàng của bài (ghim `MOC_MAU` 12/11, AI bật) và chip đếm 0.

Source input: prompt (phiên giữ đợt II.2, chủ kho «Duyệt cả hai»)

## Criteria

- AC-1: Given cây của vòng, When chạy `bun run test -- --filter=api`, Then lệnh thoát 0 với 0 fail, số pass không
  dưới 2168 và số skip bằng nền (18) — 9 ca đỏ sẵn ở `74a29a68` đều qua, không ca nào mới đỏ hay bị bỏ qua.
- AC-2: Given `chu-may-sinh-ten-moi-goc.spec.ts` chạy một mình, và `gop-y-dung-cho.spec.ts` chạy sau một hàng
  cấu hình ghi ở giờ thật còn sót (cùng hình hàng đã đo: người tạo ngoài mẫu, `aiOn: false`), When chạy trên cây
  của vòng, Then cả hai tệp xanh; và cùng lệnh ấy chạy trên hai tệp của `74a29a68` thì đỏ đúng dấu
  (`don-vi-chua-bat` ở `cmst-goc`, `dem sai` ở `gop-y-dung-cho`).
- AC-3: Given diff của vòng so với `onehub`, When liệt kê tệp đổi, Then mã đổi chỉ là đúng hai tệp
  `apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts` và `apps/api/test/gop-y-dung-cho.spec.ts`; còn lại là hồ sơ của
  vòng, `_acceptance/config.yaml`, `docs/superpowers/**` hoặc bản đồ máy vẽ — không tệp mã sản phẩm hay tệp hỗ trợ
  kiểm nào khác.
- AC-4: Given hai tệp kiểm đã sửa, When so với `74a29a68`, Then chỉ có dòng thêm — không bớt khẳng định nào,
  không thêm `skip`/`todo`/`only` — nên 9 ca vẫn đo đúng điều chúng hứa.
- AC-5: Given cây của vòng, When chạy trọn suite api trên một CSDL có mồi việc máy, Then suite không để lại việc
  máy (`AgentTask`) chưa xong, liên hệ hay công ty nào — lần ghi chương trình thứ hai của `cmst-goc` (dưới đồng hồ
  ghim) không sinh việc `okr-kiem-san-sang` vô chủ; và `gop-y-dung-cho` trả lại đúng các hàng cấu hình nó đã tạm
  gỡ.

## Coverage

- Bỏ coverage-scan — lỗi một chiều đã đo tới gốc (9 ca, 2 cơ chế, đầu dò ghi bảng `okrProgramConfig`); đổi lại
  không có bằng chứng độ phủ (entry `bỏ coverage-scan` trong decisions.jsonl).

## Out of scope

- Không đổi mã sản phẩm. `demGopYCho` đọc cấu hình mới nhất không kèm `luc`, còn `soanMo` đọc «tại `now`»; ở
  production `createdAt` luôn ≤ giờ thật nên hai cách đọc trùng nhau — chỉ lệch trong thế giới đồng hồ ghim của bài.
- Không truy tệp cụ thể đã để lại hàng cấu hình giờ thật: mọi tệp gọi `okr.setProgram` không ghim đồng hồ đều
  sinh ra hàng như vậy; bài `gop-y-dung-cho` phải chịu được nó, như tiền lệ `tom-tat-tuan-dang-cho`.
- Không quét các mốc ghim cứng khác trong suite (`MOC_MAU` 12/11 và các `LUC_*`): bom giờ chưa nổ ở tệp khác là
  việc riêng.
- Không đổi hành vi kit hay lượt chấm S4 (kế hoạch giai đoạn 2 cấm); không chạm vòng chuyển kit.

## Notes

- Hỏi-1 (Cổng Phạm vi): chỗ đỏ nằm ở mã kiểm. Sản phẩm có một chỗ đọc cấu hình bất nhất (`demGopYCho` đọc bản mới
  nhất, `soanMo` đọc tại `now`), nhưng ở production hai cách đọc trùng nhau. Khuyến nghị: sửa mã kiểm ở vòng này;
  chỗ đọc bất nhất của sản phẩm, nếu muốn, thành một hàng riêng. Lối khác: dừng vòng, sửa sản phẩm ở vòng T2 khác.
- Đo 20/11: Prisma điền `createdAt @default(now())` bằng đồng hồ JS — một `AgentTask` tạo dưới
  `setSystemTime(2020-01-01)` mang `createdAt` 2020-01-01. Vì thế dời lần ghi đầu của `cmst-goc` xuống dưới đồng hồ
  ghim sẽ cho việc `okr-kiem-san-sang` ngày ghim, lọt khỏi bước dọn `createdAt ≥ BAT_DAU`.

- Đo đỏ trước khi sửa (20/11, cây `74a29a68`): trọn suite api 2159 pass / 9 fail (09:03–09:10Z); lượt có đầu dò
  tạm in bảng `okrProgramConfig` ngay trước ca đỏ (bản vá đầu dò ở scratchpad, không commit).
- Phiên vòng chuyển kit đo `6561f724` hôm 20/11: 2159 pass / 9 fail, cùng 9 ca; ngày 03/11 chính commit ấy thoát 0.
- Ngoài-1 (máy định tuyến 2026-11-20, đề xuất S4 known-limits): Nếu sau này cách chạy kiểm thử của phần API đổi, bước đo việc máy sót có thể chạy lệch so với lệnh thật mà không ai hay. Người dùng cuối không thấy gì; chỉ làm kết quả nghiệm thu về sau kém đáng tin. — `_acceptance/config.yaml`
- Ngoài-3 (máy định tuyến 2026-11-20, đề xuất S4 known-limits): Nếu ai đó gõ thiếu đối số khi chạy bước kiểm, nó có thể báo xanh giả thay vì báo lỗi. Hiện không lệnh nào của hồ sơ bị ảnh hưởng. — `_acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs`
- Ngoài-4 (máy định tuyến 2026-11-20, đề xuất S4 known-limits): Bước kiểm xác nhận không còn việc máy sót chưa từng được thử trên một ca sót cố ý, nên chưa chứng minh được nó sẽ báo đỏ khi có sót thật. Hiện chưa có dấu hiệu dữ liệu sót. — `_acceptance/sua-bom-gio-test-api/evals.yaml`
- Ngoài-5 (máy định tuyến 2026-11-20, đề xuất S4 known-limits): Chỉ ảnh hưởng bài kiểm nội bộ, không ảnh hưởng người dùng sản phẩm. Nếu bước dọn hỏng giữa chừng, một số cấu hình mẫu trong bài kiểm có thể mất và làm các bài sau đỏ khó hiểu. — `apps/api/test/gop-y-dung-cho.spec.ts`
- Ngoài-6 (máy định tuyến 2026-11-20, đề xuất S4 known-limits): Một bài kiểm để lại cấu hình mang ngày cũ, có thể làm một bài kiểm viết sau này đọc ra trạng thái AI bật ngoài ý muốn. Hiện toàn bộ suite vẫn xanh và người dùng sản phẩm không bị ảnh hưởng. — `apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts`
- Ngoài-7 (máy định tuyến 2026-11-20, đề xuất S4 known-limits): Công cụ canh giữ bài kiểm có thể bỏ sót vài cách lách hiếm gặp, như đảo nghĩa một ca kiểm. Hai tệp kiểm hiện tại không dính cách nào như vậy nên người dùng không bị ảnh hưởng. — `_acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs`
- Ngoài-8 (máy định tuyến 2026-11-20, đề xuất S4 known-limits): Chưa có phép đo trực tiếp cho việc bài kiểm trả lại đủ cấu hình đã gỡ, nên nếu bước trả lại thiếu hàng thì có thể không ai thấy. Người dùng sản phẩm không bị ảnh hưởng. — `_acceptance/sua-bom-gio-test-api/evals.yaml`
