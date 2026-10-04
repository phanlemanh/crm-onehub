# Chặn bản nháp OKR trùng khoá — design

Ngày: 2026-10-04 · Hạng: T2 · Hồ sơ: `_acceptance/chan-trung-khoa-ban-nhap/`

## Vấn đề

Phát hiện khi làm hồ sơ `nop-ban-nhap-chon-theo-khoa` (PR #244, mục «Mã sản phẩm: không đổi»):

- Schema `banNhap` (`packages/validation/src/okr-cuoc-soan.ts`) không chặn hai Mục tiêu trùng
  `khoa`, hay hai KR trùng `khoa` dưới cùng một Mục tiêu.
- `chanTrungKhoa` (`apps/agent-okr/agent/lib/nop-ban-nhap.ts`) chỉ chặn trùng `khoaDong`. Với
  Mục tiêu và KR, `khoaDong` là tên chuẩn hoá, không phải khoá.
- Một bản nháp như vậy sinh hai dòng `okrDeXuat` cùng `khoaModel` và cùng `createdAt` (một
  `createMany`). Ở lần nộp sau, `docDaQuyet` giữ dòng có `id` nhỏ hơn: xác định nhưng tuỳ ý. Tên
  trong `giuNguyen`, và việc KR con nối vào cha nào theo `chaKhoa`, có thể sai.

Khoá đúng của một dòng chính là `khoaModel`: `muc-tieu-moi:<khoa>` cho Mục tiêu,
`kr-moi:<chaKhoa>:<khoa>` cho KR. Luật cần chặn là: không hai dòng của một bản nháp chung một
`khoaModel`.

## Quyết định chỗ chặn (chủ kho chốt 04/10)

Chặn ở **biên**: `superRefine` trong schema `banNhap`, đúng luật «parse ở biên» của `AGENTS.md`.

Đã đo trước khi chọn: eve 0.29.4 bọc schema Zod gốc của công cụ vào `tool({ inputSchema })` của
AI SDK (`harness/tools.js`); `shared/tool-schema.js` giữ nguyên schema khi nó là Standard Schema
thay vì chuyển sang JSON Schema. Với AI SDK 7 (`ai@7.0.85`), một thí nghiệm model giả gọi công cụ
có `superRefine` cho thấy: `execute` chạy 0 lần, model nhận tool-result kiểu `error-text` gồm
`AI_InvalidToolInputError` + đường dẫn issue + thông điệp, và vòng agent đi tiếp sang bước sau.

Phương án bị loại:

- Từ chối trong `nopBanNhap` với mã `tu-choi` mới: kiểm hình dạng nằm trong lõi chứ không ở biên;
  agent nhận lý do không có đường dẫn ô.
- Cả hai lớp: một ràng buộc kiểm ở hai chỗ; lớp thứ hai chỉ che người gọi thẳng `nopBanNhap`, mà
  người gọi thẳng duy nhất là bài kiểm nội bộ.

## Thiết kế

`packages/validation/src/okr-cuoc-soan.ts`:

- Hằng `BAN_NHAP_LOI` cạnh `BAN_NHAP_TRAN`, mang hai thông điệp: Mục tiêu trùng khoá, KR trùng
  khoá trong cùng Mục tiêu.
- `banNhap` thêm `superRefine`. Mỗi lần một `khoa` xuất hiện lại, refine sinh một issue
  `custom` tại đúng ô bị lặp: `["mucTieu", i, "khoa"]` hoặc `["mucTieu", i, "kr", j, "khoa"]`.
  Thông điệp là `<nhãn>: <khoa>`. Mọi chỗ trùng đều được báo trong một lượt, để agent sửa một lần.
- So trên giá trị đã qua `khoaNhap` (đã `trim`), nên `"m1 "` trùng `"m1"`. Hoa/thường khác nhau
  là khác khoá, khớp `khoaModel`.
- Hai KR cùng `khoa` dưới **hai** Mục tiêu khác nhau vẫn hợp lệ (khác `khoaModel`). KR trùng
  `khoa` với một Mục tiêu cũng hợp lệ.

`apps/agent-okr/agent/tools/nop_ban_nhap.ts`: mô tả công cụ thêm một vế nói luật này, để agent biết
trước khi bị từ chối.

`nopBanNhap`, `chanTrungKhoa`, `docDaQuyet` giữ nguyên.

## Ai dùng `banNhap`

Tìm toàn kho (`apps`, `packages`, trừ `node_modules`) ngày 04/10: schema `banNhap` chỉ được dùng ở
`apps/agent-okr/agent/tools/nop_ban_nhap.ts` (làm `inputSchema`) và
`packages/validation/test/okr-cuoc-soan.spec.ts`. `parseBanNhap` chỉ có bài kiểm gọi. Không nơi nào
gọi `.extend`, `.pick`, `.omit` hay bọc `banNhap` trong schema khác; không nơi nào parse lại bản nháp
đã lưu bằng nó (dòng đã lưu đọc qua `dongSoanTuHang`). Mọi `banNhap` khác trong kho là khoá chuỗi
giao diện (`m.banNhap.*`, `t.banNhap.*`) hay biến cục bộ cùng tên.

## Bài kiểm

- `packages/validation/test/okr-cuoc-soan.spec.ts`, khối `trung-khoa`: ma trận bị từ chối (hai Mục
  tiêu trùng, hai KR trùng cùng cha, trùng sau `trim`, nhiều chỗ trùng cùng lúc) và được nhận (KR
  trùng khác cha, KR trùng khoá Mục tiêu, khác hoa/thường). Ca từ chối ghim cả đường dẫn lẫn thông
  điệp.
- `apps/agent-okr/test/ban-nhap-trung-khoa.integration.spec.ts` (tệp mới, tách khỏi tệp PR #244
  đang sửa): `generateText` của AI SDK với `MockLanguageModelV4`. Công cụ mang `inputSchema` thật
  của `nop_ban_nhap`, `execute` gọi công cụ thật với ngữ cảnh phiên thật trên CSDL thật. Bước một
  nộp bản nháp trùng khoá; bước hai nộp bản đã sửa. Đo: số lần `execute` chạy, số dòng
  `okrDeXuat` của cuộc sau bước một, mảng issue cắt từ `error-text` model nhận (so `toEqual` cả
  `path` lẫn `message`), và `khoaModel` của các dòng lần nộp cuối đôi một khác nhau. Công cụ trong
  bài dùng `banNhap` import từ `@crm/validation`; một ca riêng (không mang nhãn `trung-khoa`) khẳng
  định `inputSchema` của công cụ thật chính là đối tượng đó.
- Răng `rang/pha-thu.mjs`: chép hai tệp kiểm cùng một bản sao `okr-cuoc-soan.ts` vào
  `.acceptance-runs/`. Chiều xanh dùng bản sao nguyên vẹn; chiều đỏ gỡ đúng lời gọi `superRefine`.
  Răng chỉ đổi đường import `@crm/validation/okr-cuoc-soan` (tích hợp) và
  `../src/okr-cuoc-soan` (đơn vị) sang bản sao, chạy các ca nhãn `trung-khoa`. Chiều đỏ phải đỏ với
  chữ ký ghim ở cả hai tệp, và ba ca nhận vẫn xanh.

## Giới hạn đã biết

- Bài tích hợp bọc schema bằng `tool()` của AI SDK, không dựng máy chủ eve. Việc eve chuyển nguyên
  schema vào `tool()` là đọc từ mã eve 0.29.4, không có bài kiểm giữ. Nâng eve thì phải đọc lại.
- Mã gọi thẳng `nopBanNhap` (bài kiểm nội bộ) không qua schema, nên không được che.
- `refine` không hiện trong JSON Schema gửi cho model; agent biết luật qua mô tả công cụ.
