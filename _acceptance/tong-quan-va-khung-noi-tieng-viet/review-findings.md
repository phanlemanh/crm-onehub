# Review Findings: tong-quan-va-khung-noi-tieng-viet (round 2)

## Trong hợp đồng

(không có finding nào ánh xạ được vào AC ở vòng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **monthIso đọc giờ UTC từ Date dựng theo giờ máy — nhãn 6 tháng của biểu đồ lệch một tháng ở mọi múi giờ đông UTC**
  Người dùng thấy gì: Biểu đồ xu hướng doanh số trên Tổng quan có thể gắn nhầm nhãn tháng, khiến số liệu của tháng hiện tại bị hiển thị dưới tên tháng trước.
  file: `apps/api/src/dashboard/dashboard.service.ts`
  severity: high
  Đề xuất: new-contract

- **Hợp đồng output vẫn là z.string() sau khi month đổi từ nhãn hiển thị sang khoá máy, client tự tách chuỗi và nuốt lỗi parse**
  Người dùng thấy gì: Nếu định dạng tháng gửi từ máy chủ bị sai, trục biểu đồ có thể hiển thị chuỗi thô khó hiểu thay vì báo lỗi rõ ràng cho người dùng.
  file: `apps/api/src/dashboard/dashboard.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **Bề mặt hàng đợi làm giàu được Việt hoá nhưng tên công ty/cá nhân người nhập không mang translate="no"**
  Người dùng thấy gì: Tên công ty hoặc tên người dùng nhập trong hàng đợi làm giàu có thể bị trình duyệt tự ý dịch sai vì thiếu đánh dấu chặn dịch.
  file: `apps/app/components/enrichment-queue.tsx`
  severity: medium
  Đề xuất: new-contract

- **Bảng hàng đợi làm giàu nói hai thứ tiếng: khung tiếng Việt bọc quanh dòng tiếng Anh do API sinh**
  Người dùng thấy gì: Trong hàng đợi làm giàu, một số dòng trạng thái tra cứu vẫn hiện tiếng Anh xen giữa phần khung đã dịch sang tiếng Việt.
  file: `apps/app/components/enrichment-queue.tsx`
  severity: medium
  Đề xuất: known-limits

- **COT đặt tên kiểu hằng số nhưng là biến dựng lại mỗi lần render**
  Người dùng thấy gì: Không ảnh hưởng tới trải nghiệm người dùng; đây chỉ là một chi tiết nhỏ trong cách tổ chức mã nguồn.
  file: `apps/app/app/(app)/[slug]/dashboard-summary.tsx`
  severity: low
  Đề xuất: known-limits

- **Trend chart month labels are computed in UTC from local-midnight dates — every bucket is labelled one month early in any UTC+ timezone**
  Người dùng thấy gì: Biểu đồ xu hướng doanh số trên Tổng quan có thể gắn nhầm nhãn tháng, khiến số liệu của tháng hiện tại bị hiển thị dưới tên tháng trước.
  file: `apps/api/src/dashboard/dashboard.service.ts`
  severity: high
  Đề xuất: new-contract

- **be-rong-do-lib.sh cannot tell "mutation never applied" from "width ruler is blind" — reports a false red with the wrong diagnosis**
  Người dùng thấy gì: Nếu công cụ kiểm tra bề rộng nhãn được cấu hình sai ở lần dùng sau, báo cáo kiểm thử có thể chỉ sai nguyên nhân lỗi chứ không phản ánh vấn đề thật của sản phẩm.
  file: `_acceptance/man-cai-dat-noi-tieng-viet/rang/be-rong-do-lib.sh`
  severity: medium
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng thiếu ma trận toàn phần — tập "nhãn của lát" bị cắt cụt âm thầm (hình dạng 5)**
  Người dùng thấy gì: Một số nhãn tiếng Việt dài trong Tổng quan có thể chưa được kiểm tra tràn chữ đầy đủ, nên nếu có lỗi tràn chữ ở những chỗ đó thì có thể chưa được phát hiện.
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`
  severity: high
  Đề xuất: known-limits

- **Assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ vị trí — chặn trạng thái rỗng làm phẳng khoá DOM (hình dạng 3)**
  Người dùng thấy gì: Cách kiểm tra tự động cho câu thông báo bảng rỗng có thể chưa phát hiện được nếu câu rỗng lỡ hiện nhầm bảng, dù hiện tại màn hình vẫn đang hiển thị đúng.
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`
  severity: medium
  Đề xuất: known-limits

- **Assert "chuỗi có mặt" thay cho QUAN HỆ trên cây cú pháp — chặn mức mã của E7 dùng regex kề-nhau trên văn bản nguồn (hình dạng 3)**
  Người dùng thấy gì: Cách kiểm tra tự động cho các nhãn không-dịch có thể bỏ sót một số trường hợp thực sự sai, dù hiện tại các nhãn liên quan vẫn đang hiển thị đúng.
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`
  severity: medium
  Đề xuất: known-limits

- **Fixture VIẾT TAY đúng khuôn bên đọc — bài kiểm mucDangMo tự chép lại workspaceUrl thay vì round-trip qua hàm thật (hình dạng 2)**
  Người dùng thấy gì: Bài kiểm tự động cho việc đánh dấu mục đang mở ở thanh điều hướng có thể không phát hiện ra nếu cách tạo đường dẫn workspace bị đổi trong tương lai, dù hiện tại việc đánh dấu vẫn đúng.
  file: `apps/app/test/khung-dieu-huong.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình — quét formatCount không có đối chứng dương và không ghim tổng số lời gọi (hình dạng 4)**
  Người dùng thấy gì: Bài kiểm tự động chống việc gắn cứng tiếng Anh vào phần đếm số lượng có thể mất tác dụng nếu mã nguồn đổi cách viết trong tương lai, dù hiện tại phần đếm số lượng vẫn đúng.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Đường dẫn hardcode ROOT trong bản khai đo — s4-args.json ghim /Users/manh-macmini/dev/crm (hình dạng 6)**
  Người dùng thấy gì: Không ảnh hưởng tới người dùng sản phẩm; đây chỉ là chi tiết trong hồ sơ nội bộ dùng để chạy lại vòng kiểm thử.
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/s4-args.json`
  severity: low
  Đề xuất: known-limits

## Chưa phân loại (triage-failed)

phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ.

- **English `unconverted.sentence` dropped the verb — user-visible copy is now ungrammatical**
  file: `apps/app/lib/messages/tong-quan.ts:28`
  severity: low
  detail: The extracted English string is:
    `Every figure above is in ${reporting}. ${n} in ${currencies} not included — there is no rate to convert with.`
    The code it replaced (apps/app/app/(app)/[slug]/sales-dashboard.tsx, removed hunk) carried explicit agreement:
    `... {unconverted.currencies.join(", ")} {unconverted.count === 1 ? "is" : "are"} not included — there is no rate to convert {unconverted.currencies.length === 1 ? "it" : "them"} with.`
    Both the copula and the object pronoun were dropped during extraction, so the banner now renders e.g. "Every figure above is in USD. 2 deals in EUR not included — there is no rate to convert with." The Vietnamese counterpart (line 110) reads correctly, so this affects the `en` locale only. This is a text regression introduced by the diff, not a preference.
  source: bugs

## Chưa adversarial-verify (refuter chết)

(không có finding refuter-chết ở vòng này)

⚠ Cụm ngoài vùng phủ: 5/14 lỗi rơi vào file không bộ đo nào phủ (apps/api/src/dashboard/dashboard.service.ts, apps/api/src/dashboard/dashboard.contracts.ts, _acceptance/man-cai-dat-noi-tieng-viet/rang/be-rong-do-lib.sh, _acceptance/tong-quan-va-khung-noi-tieng-viet/s4-args.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
