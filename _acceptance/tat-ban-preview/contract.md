---
schema_version: 1
feature: Tắt bản Preview của crm-onehub-app, crm-onehub-api, crm-onehub-agent bằng git.deploymentEnabled ở đúng vercel.json mỗi dự án đọc, giữ Production của onehub
slug: tat-ban-preview
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [config, docs]
status: signed-off
design_doc: docs/superpowers/specs/2026-10-16-tat-ban-preview-design.md
approved_by: manh
approved_at: 2026-10-16
---

# Acceptance Contract: tat-ban-preview

## Context

Bản Preview của app, api, agent dùng chung DB với production (`docs/setup.md`): mỗi lần đẩy nhánh, mã chưa
qua cổng nào chạy được trên dữ liệu thật. Đo 16/10: 840 bản Preview trong 7 ngày, 0 request trong 24 giờ, và
chủ kho không dùng Preview. Vòng này tắt Preview của ba dự án như `agent-okr` đã tắt từ 04/10, đặt khoá ở đúng
tệp mỗi dự án đọc — riêng api có Root Directory là gốc kho, nên tệp là `vercel.json` ở gốc kho.

Source input: prompt (Điều phối M5, PV1; căn cứ finding kit `docs/findings/2026-10-16-truy-nguyen-toc-do-m5.md`
§9.1 mục 2 và §9.6, câu trả lời của chủ kho «chỉ giao tiếp qua Claude Code Desktop, xem Screenshot trên đó, và
Local»).

## Criteria

- AC-1: Given bảng bốn dự án → tệp (`crm-onehub-app` → `apps/app/vercel.json`, `crm-onehub-api` → `vercel.json` ở gốc kho, `crm-onehub-agent` → `apps/agent/vercel.json`, `agent-okr` → `apps/agent-okr/vercel.json`), When đọc từng tệp, Then mỗi tệp là JSON hợp lệ có khoá đỉnh đúng `$schema` và `git`, và `git` chỉ có `deploymentEnabled` — không khoá nào khác đổi cách dựng, và `vercel.json` ở gốc kho không mang `crons`.
- AC-2: Given luật `git.deploymentEnabled` của từng tệp trong bảng, When áp cho nhánh `onehub` đúng luật Vercel (khớp bằng minimatch; nhánh khớp nhiều mẫu thì deploy khi ít nhất một mẫu khớp mang `true`; không mẫu nào khớp thì deploy), Then `onehub` được deploy ở cả bốn dự án.
- AC-3: Given cùng luật, When áp cho bảng nhánh viết trước — một nhánh cho mỗi tiền tố từng dùng ở kho (`feat/`, `fix/`, `docs/`, `chore/`, `claude/`, `proto/`, `test/`, `ci/`, `ops/`, `thu/`, `tam/`), một nhánh hai tầng `/`, các nhánh không `/` (`main`, `release`, `test-lane-per-run`), các nhánh mang chữ `onehub` mà không phải `onehub` (`onehub-thu`, `onehub/con`, `sao-luu/onehub`) — Then không nhánh nào được deploy ở dự án nào, và phép thử liệt mọi cặp dự án × nhánh lệch kèm tên.
- AC-4: Given danh sách dự án Vercel của team nối kho `phanlemanh/crm-onehub` đọc bằng GET lúc chấm, When so Root Directory của từng dự án (trống = gốc kho) với bảng ở AC-1, Then tập dự án bằng đúng tập trong bảng và tệp của mỗi dự án là `<Root Directory>/vercel.json` — `apps/api/vercel.json` không phải tệp của dự án nào.
- AC-5: Given mọi lần đẩy (sự kiện push của GitHub) lên nhánh vòng này mà commit ĐẦU của lần đẩy (`after`) có cây chứa cả ba tệp mới, có ít nhất một lần như vậy, và lần mới nhất đã qua ít nhất 5 phút, When đọc deployment của ba dự án `crm-onehub-app`, `crm-onehub-api`, `crm-onehub-agent` cho từng commit đầu ấy và commit status GitHub của nó, Then không dự án nào có deployment cho commit đầu nào và không có status «Vercel – crm-onehub-*» nào — đo trên commit đầu vì Vercel chỉ dựng commit đầu của mỗi lần đẩy.
- AC-6: Given commit gộp M của vòng này trên `onehub`, When Vercel dựng Production từ git (`source: git`) cho M ở cả bốn dự án, Then cả bốn bản READY (không CANCELED hay ERROR; bản deploy tay qua API hay CLI không tính), và dự án `crm-onehub-api` vẫn có đúng năm cron như `apps/api/vercel.json` khai.
- AC-7: Given người đọc `docs/production.md` mục Preview và `docs/setup.md` các chỗ nói Preview dùng chung DB, When đọc sau vòng này, Then tài liệu nói Preview đã tắt ở cả bốn dự án, chỉ đúng tệp tắt của từng dự án (kể cả bẫy `apps/api/vercel.json`), không còn mô tả Preview của app, api, agent như đang chạy, vẫn dặn kiểm bản Production READY sau mỗi lần đổi cài đặt build, và không câu nào khuyên dùng Ignored Build Step theo `VERCEL_ENV`. (judgment)

## Coverage

- Bỏ coverage-scan — không gian nhỏ, các trục liệt kê tay dưới đây (entry `descope` «bỏ coverage-scan» trong decisions.jsonl).
- Trục dự án: `crm-onehub-app` · `crm-onehub-api` (Root Directory trống — bẫy tệp) · `crm-onehub-agent` · `agent-okr` (đã tắt, giữ trong bảng làm đối chứng cùng luật) [thước CE: `vercel api /v9/projects?repo=crm-onehub` 16/10 trả đúng bốn dự án] → AC-1..4.
- Trục loại nhánh: `onehub` · tiền tố có `/` · hai tầng `/` · không `/` · mang chữ `onehub` mà khác `onehub` [thước CE: tiền tố trong `git log origin/onehub --merges --since=2026-09-16` (feat 159, fix 87, docs 66, chore 31, claude 12, proto 3, ci 3, test 1) cộng tiền tố nhánh đang có trên origin và ở máy (`thu/`, `tam/`, `ops/`)] → AC-2, AC-3.
- Trục đường kích hoạt: đẩy nhánh → AC-5 · đẩy `onehub` (gộp) → AC-6 · deploy qua API/CLI → Out of scope.
- Trục lớp đo: luật cục bộ chạy ở CI (AC-1..3) · bảng khớp Vercel thật (AC-4) · Vercel thật Preview (AC-5) · Vercel thật Production (AC-6) · tài liệu (AC-7).

## Out of scope

- Gỡ bản ghi `DATABASE_URL`/`POSTGRES_URL_NON_POOLING` của đích preview, hay đổi bất kỳ biến môi trường nào — việc tuỳ chọn của chủ kho, chỉ nêu trên thẻ.
- Đổi cài đặt dự án trên Vercel (Root Directory, Ignored Build Step, `createDeployments`); dùng lại Ignored Build Step dưới bất kỳ dạng nào.
- Xoá các bản Preview cũ đã dựng (vẫn nằm sau SSO).
- Bản deploy tạo qua API hay CLI có tuân `deploymentEnabled` không — đó là đường lui nếu Production hỏng.
- Sửa `apps/agent-okr/vercel.json` hay phép thử `apps/agent-okr/test/vercel-trien-khai.spec.ts` của hồ sơ đã ký `tat-preview-agent-okr`.

## Notes

- Thứ tự S3 → S4: AC-5 cần nhánh đã đẩy, nên sau S3 thợ xin lượt pre-push, đẩy nhánh MỘT lần, chờ đủ 5 phút rồi mới sinh args S4. Đẩy thêm trong lúc sửa lượt thì E7 đo cả lần đẩy mới.
- AC-6 chỉ đo được sau gộp: eval xanh của nó khai `status: not-run` trong S4 và chạy ở S5 với sha gộp làm đối số; chiều đỏ của nó chạy được ngay trên sha `226231c9` (bản production agent-okr bị huỷ 04/10).
- Sau gộp, đẩy một nhánh thử từ `onehub` mới và chạy hàm đo của AC-5 với sha của nó: phải ra 0 deployment ở ba dự án. Ghi số vào mục này.
- Hẹn đếm lại ngày 2026-10-23 (7 ngày sau gộp): số bản Preview của app, api, agent kể từ commit gộp phải bằng 0. Lệnh: `bun _acceptance/tat-ban-preview/rang/dem-preview.mjs <ISO lúc gộp>`.
- Đường lui nếu AC-6 đỏ: deploy Production `onehub` qua API như 04/10, rồi revert PR.
- Gộp trong giờ chủ kho thức — đây là đổi cấu hình triển khai production.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-16:
  - Ngoài-1: Khi bản Production bị huỷ vì có commit mới hơn, báo cáo kiểm tra chỉ nói chung chung là không đọc được, không ghi rõ lý do bị thay. Người đọc phải tự suy ra nguyên nhân, nhưng kết luận đúng sai của việc tắt Preview không đổi.
  - Ngoài-2: Nếu tệp cấu hình của api bị mất danh sách cron hoặc hỏng, báo cáo sẽ ghi là lỗi hệ thống thay vì lỗi cấu hình. Người đọc có thể đi tìm nhầm hướng, nhưng kiểm tra vẫn không báo xanh.
  - Ngoài-3: Lần đếm lại ngày 23/10 có thể báo đỏ chỉ vì ai đó đẩy nhánh cũ chưa cập nhật cấu hình mới, dù việc tắt Preview đã đúng. Cần đọc kết quả kèm xem nhánh nào gây ra.
  - Ngoài-4: Báo cáo kiểm tra Production không in đúng nhãn mà mô tả kiểm tra đã hứa khi bản bị thay. Người đọc phải mở chi tiết lý do để biết vì sao, kết luận chính không đổi.
  - Ngoài-5: Phép thử chứng minh bộ kiểm tra Production biết báo đỏ chưa đủ chặt: nó chỉ cho thấy báo đỏ được khi bản không READY, chưa chứng minh đã đọc đúng bản và đúng trạng thái. Độ tin vào bộ kiểm tra này thấp hơn vẻ ngoài.
- Trả lời câu «có ai dùng Preview» ở crm #375: **Mac Studio — «Không dùng.»** (02:17Z, issuecomment-6206547961: không thước, workflow hay script nào mở URL Preview; check «Vercel – crm-onehub-*» sẽ thôi chạy, «CI xanh trọn» tính trên các job còn lại) · **MacBook Pro — chưa trả lời** (hỏi 01:40Z, nhắc 02:16Z).
- Nền hạ tầng, chân engine đỏ (đường nền 16/10 01:59Z): nhãn *không đọc được ở đây* — tám tệp kit chép trong kho cũ hơn bộ đệm 2.30.0 đang chạy; lỗi đã biết của mọi vòng crm hôm nay, #413 (crm nhận kit) gỡ. Không phải câu hỏi cho chủ kho.
