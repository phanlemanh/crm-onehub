---
schema_version: 1
feature: Tắt hẳn Preview của project Vercel agent-okr bằng apps/agent-okr/vercel.json, giữ Production của onehub
slug: tat-preview-agent-okr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [config, ci, docs]
status: signed-off
design_doc: docs/superpowers/specs/2026-10-04-tat-preview-agent-okr-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-04T06:00:58Z
---

# Acceptance Contract: tat-preview-agent-okr

## Context

Check «Vercel – agent-okr» đỏ ở mọi PR vì bản Preview của project agent-okr chết ở
`prisma generate` (mọi biến của project chỉ có target Production). Không gì gọi bản Preview
đó, nên việc đúng là không tạo nó. Lần thử bằng Ignored Build Step theo `VERCEL_ENV` (#246)
đã huỷ luôn Production và được gỡ ở #247; lần này tắt theo tên branch bằng
`git.deploymentEnabled` trong `apps/agent-okr/vercel.json`, và đo cả Preview lẫn Production
trên Vercel thật.

Source input: prompt (chủ kho, 04/10: «Tắt hẳn preview»)

## Criteria

- AC-1: Given tệp `apps/agent-okr/vercel.json`, When đọc tệp, Then nó là JSON hợp lệ, khoá đỉnh đúng `$schema` và `git`, và `git` chỉ có `deploymentEnabled` — không khoá nào khác để `eve build` hay Vercel đổi cách dựng.
- AC-2: Given luật `git.deploymentEnabled` của tệp, When áp cho branch `onehub` đúng luật Vercel (khớp bằng minimatch; branch khớp nhiều mẫu thì deploy khi ít nhất một mẫu khớp mang `true`; không mẫu nào khớp thì deploy), Then `onehub` được deploy.
- AC-3: Given cùng luật, When áp cho từng branch của bảng viết trước — một branch cho mỗi tiền tố từng dùng ở kho (`feat/`, `fix/`, `docs/`, `chore/`, `claude/`, `proto/`, `test/`, `ci/`), một branch hai tầng `/`, các branch không `/` (`main`, `release`, `test-lane-per-run`), và các branch mang chữ `onehub` mà không phải `onehub` (`onehub-thu`, `onehub/con`, `sao-luu/onehub`) — Then không branch nào được deploy.
- AC-4: Given commit S là commit gần nhất của branch vòng này có chạm `apps/agent-okr/`, S đã đẩy lên origin, và GitHub đã nhận status Vercel của các project `crm-onehub-*` cho S (Vercel đã xử lý lần đẩy S), When đọc deployment của project `agent-okr` cho S và commit status GitHub của S, Then không có deployment `agent-okr` nào cho S và không có status «Vercel – agent-okr» nào ở failure hay error.
- AC-5: Given một merge vào `onehub` có tệp này, When Vercel deploy Production của `agent-okr` từ git (`source: git`) cho sha của merge, Then bản đó READY, không CANCELED hay ERROR; bản deploy tay qua API hay CLI cho cùng sha không được tính.
- AC-6: Given người dựng lại project đọc mục «Deploying `apps/agent-okr` to Vercel» của `docs/setup.md`, When làm theo bảng thiết lập, Then mục đó nêu `apps/agent-okr/vercel.json` là nơi tắt Preview, không còn nói check agent-okr đỏ ở PR là bình thường, và vẫn dặn kiểm bản Production READY sau mỗi lần đổi cài đặt build. (judgment)

## Coverage

- Bỏ coverage-scan — không gian nhỏ, các trục liệt kê tay dưới đây (entry `descope` «bỏ coverage-scan» trong decisions.jsonl).
- Trục loại branch: `onehub` · có `/` (mọi tiền tố đã dùng) · hai tầng `/` · không `/` · mang chữ `onehub` mà khác `onehub` [thước CE: tiền tố trong `git log origin/onehub --merges` ngày 04/10 — feat 83, fix 44, docs 43, chore 23, claude 14, proto 3, test 1, ci 1, và bốn branch không `/`] → AC-2, AC-3.
- Trục đường kích hoạt: git push branch PR → AC-4 · git push `onehub` (merge) → AC-5 · deploy qua API → Out of scope.
- Trục lớp đo: luật cục bộ (AC-1..3) · Vercel thật Preview (AC-4) · Vercel thật Production (AC-5) · tài liệu (AC-6).
- Trục project: `agent-okr` đổi · ba project khác không đổi (tệp chỉ ở Root của agent-okr; AC-4 đòi `crm-onehub-app` vẫn có deployment cho cùng sha).

## Out of scope

- Đặt `DATABASE_URL` hay biến nào khác cho Preview; sửa `packages/db/prisma.config.ts`.
- Dùng lại Ignored Build Step (`commandForIgnoringBuildStep`) dưới bất kỳ dạng nào.
- Check đỏ «Root Directory "apps/agent-okr" does not exist» của #231 và #214 — hai branch rẽ trước khi có `apps/agent-okr`, tự hết khi trộn `onehub`.
- Bản deploy tạo qua API (`POST /v13/deployments`) có tuân `deploymentEnabled` không — đó là đường lui nếu Production hỏng, không phải đường chính.
- Preview của ba project `crm-onehub-app`, `crm-onehub-api`, `crm-onehub-agent`.

## Notes

- `eve build` đọc `vercel.json` nhưng chỉ lấy khoá `services`/`experimentalServices*` (đọc ở `node_modules/eve/dist/src/internal/nitro/host/build-application.js`). Lệnh dựng không-cache của kho nằm trong `feature_loop.suite_keys`, nên mỗi lượt S4 chứng `eve build` vẫn xanh khi có tệp.
- AC-5 chỉ đo được sau merge: eval xanh của nó khai `status: not-run` trong S4 và chạy ở S5; chiều đỏ của nó chạy được ngay trên sha `226231c9` (bản bị huỷ 04/10).
- Đường lui nếu AC-5 đỏ sau merge: deploy Production `onehub` qua API như đã làm 04/10 (`dpl_9Ldx1dhroSFozvAo1zV1RuhQfXbA`), rồi revert PR nếu bản API cũng bị chặn.

### Known limits (Cổng Bằng chứng, 2026-10-05)

Mọi mục dưới đây là giới hạn của công cụ đo trong `rang/`, không phải của `vercel.json`.

- Ngoài-3, Ngoài-10: rang Production (E7) không kiểm `git fetch` có thành công không, nên khi mạng lỗi nó có thể đo `origin/onehub` cũ và báo xanh oan. Ở S5, chạy E7 với sha của commit gộp làm đối số và tự kiểm sha đó có `apps/agent-okr/vercel.json`.
- Ngoài-4: lệnh `tpa_vercel_production_xanh` không truyền sha của commit gộp; nếu có PR khác gộp vào `onehub` trước lúc đo thì E7 đo bản của PR kia. Cùng cách lách như trên.
- Ngoài-13: rang Production chế độ xanh lấy đầu `onehub` lúc chạy mà không kiểm sha đó có `apps/agent-okr/vercel.json`. Cùng cách lách như trên.
- Ngoài-5, Ngoài-12, Ngoài-15: chế độ `bo-tay` (E10) thoát 0 khi thấy bản git CANCELED mà không đòi đã thấy và bỏ qua bản deploy tay. Lượt chấm 04/10 có in dòng «bo qua dpl_9Ldx… (source cli)», nhưng rang không bắt buộc dòng đó.
- Ngoài-6, Ngoài-14: ca `json` của rang phá-thử khớp chữ «JSON», chữ này có sẵn trong khung mã nguồn bun in ra, nên ca đó chứng yếu rằng thước bắt được JSON hỏng. Ca `khoa` (thêm khoá lạ) vẫn chứng phần schema.
- Ngoài-8, Ngoài-11: `vercel-doc.mjs` chỉ đọc 100 deployment mới nhất, không theo phân trang. Khi project agent-okr có hơn 100 deployment mới hơn các sha ghim (9333acad, 226231c9, ff8c3372), E6, E8, E10 sẽ không tìm thấy chúng và báo đỏ oan ở lượt ghim lại.
