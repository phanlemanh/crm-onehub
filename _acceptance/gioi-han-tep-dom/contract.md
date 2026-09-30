---
schema_version: 1
feature: Trình chạy test DOM từng tệp tự cắt một tệp quá giờ và gọi tên nó, in thời lượng thật của từng tệp và năm tệp chậm nhất
slug: gioi-han-tep-dom
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: verified
design_doc: docs/superpowers/specs/2026-09-30-gioi-han-tep-dom-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-30T14:33:38Z
---

# Acceptance Contract: gioi-han-tep-dom

## Context

Job CI «check-types, lint, test» của PR #222 (run 36724007135) bị cắt ở trần 20 phút. Log cho
thấy không tệp DOM nào treo — `turbo run test --concurrency=1` chạy các gói nối tiếp, `app:test`
mới chạy khoảng 4 phút lúc bị cắt, và cả lượt chậm hơn lượt xanh trước đó. Nhưng trình chạy từng
tệp (`packages/ui/test/chay-tung-tep-dom.ts`) vẫn gọi `spawnSync` không giới hạn: một tệp treo
thật sẽ đứng tới khi job bị cắt, và log của gói đó mất cùng job. Nó cũng không in thời lượng thật
của từng tệp. Giới hạn 1 phút là số lớn nhất còn lọt ngân sách của một lượt CI bình thường (tệp
cuối treo: 3m22s + 1 phút < 4m43s còn lại); ở máy chạy chậm như run 36724007135 thì không giới
hạn nào cứu được tên tệp — việc đó thuộc vòng nới trần hoặc rút ngắn bộ test. Source input: prompt của chủ kho 30/09 · log hai run 36721133755 và 36724007135 ·
design doc ở `design_doc`.

## Criteria

- AC-1: Given một thư mục `test/` có ba tệp theo thứ tự tên — xanh, treo (chặn đồng bộ, đồng hồ riêng của `bun test` không cắt được), xanh — và giới hạn 1,5 s, When trình chạy chạy thư mục đó, Then nó tự dừng trong vòng giới hạn cộng vài giây, thoát bằng mã quá giờ của module cấu hình (124), dòng lỗi gọi đúng tên `test/<tệp treo>` kèm giới hạn đã vượt, không còn tiến trình nào của thư mục đó sống, và tệp thứ ba không được chạy (tệp dấu nó sẽ ghi không tồn tại); cùng thư mục đó bỏ tệp treo thì thoát 0 và tệp dấu có mặt.
- AC-2: Given ba tệp xanh, tệp giữa ngủ 300 ms ở cấp module (ngoài mọi ca test), When trình chạy chạy xong, Then có đúng một dòng thời lượng cho mỗi tệp theo thứ tự chạy, thời lượng của tệp ngủ không dưới 0,3 s, một dòng tổng số tệp, tổng thời gian và giới hạn mỗi tệp, và một dòng «chậm nhất» liệt min(số tệp chậm nhất của cấu hình, số tệp) tệp, xếp giảm dần, tệp ngủ đứng đầu.
- AC-3: Given ba tệp — xanh, đỏ (một `expect` sai), xanh — When trình chạy chạy, Then nó thoát với đúng mã của `bun test` cho tệp đỏ, dòng lỗi gọi tên tệp đỏ kèm mã và thời lượng, và tệp thứ ba không được chạy (tệp dấu vắng) — hành vi hôm nay giữ nguyên, chỉ thêm thời lượng.
- AC-4: Given bộ DOM thật của kho, When chạy `test:dom` của `apps/app` và `test` của `packages/ui` qua đúng lệnh trong `package.json`, Then cả hai thoát 0, số dòng thời lượng bằng đúng số tệp `*.dom.tsx` của gói đó, mỗi gói có một dòng tổng mà giới hạn in ra bằng giới hạn của module cấu hình, và một dòng «chậm nhất» gồm đúng những tệp có thời lượng lớn nhất theo các dòng thời lượng, số mục bằng số tệp chậm nhất của cấu hình, xếp giảm dần — không số nào viết thẳng trong trình chạy.

## Coverage

Bỏ quét `morphological-scan` — xem entry `descope` «bỏ coverage-scan» trong `decisions.jsonl`.
Không gian nhỏ, viết tay:

- Trục A — kết cục một tệp: xanh | đỏ | quá giờ [thước CE: `status`, `error.code` của `spawnSync`]
- Trục B — vị trí tệp hỏng: đầu | giữa | cuối [thước CE: thứ tự `sort()` của tên tệp]
- Trục C — nơi chạy: thư mục tạm | bộ thật `apps/app` | bộ thật `packages/ui`
- Ánh xạ: quá giờ × giữa × thư mục tạm → AC-1 · xanh × mọi vị trí × thư mục tạm → AC-2 · đỏ × giữa × thư mục tạm → AC-3 · xanh × bộ thật × hai gói → AC-4. Vị trí đầu và cuối không có AC riêng: cùng một vòng lặp, «tệp sau không chạy» đã đo ở vị trí giữa.

## Out of scope

- `.github/workflows/ci.yml` và trần `timeout-minutes: 20` — CI của hãng, không sửa ở kho này.
- Rút ngắn tổng thời lượng bộ test: bỏ `--concurrency=1`, chia job, gộp tệp DOM — việc riêng.
- Chạy tiếp các tệp sau một tệp quá giờ để gom hết lỗi — giữ dừng sớm như ca đỏ.
- Làm log của một gói hiện ra khi chính job bị cắt (turbo gom log theo gói) — việc của cách gọi turbo, không của trình chạy.

## Notes

- Không tệp DOM nào treo trong run 36724007135; chi tiết đo ở design doc.
