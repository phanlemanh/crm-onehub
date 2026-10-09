---
schema_version: 1
feature: Workflow Acceptance thôi chạy test tác nhân OKR khi push lên onehub, huỷ lượt cũ khi PR đẩy chồng, và gộp ba job nhỏ thành một — giảm phút GitHub Actions mà không bỏ phép kiểm nào ở PR
slug: giam-phut-acceptance
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-09T21:56:45Z
design_doc: _acceptance/giam-phut-acceptance/design.md
---

# Acceptance Contract: giam-phut-acceptance

## Context

Acceptance chạy 367 lượt trong 10 ngày (29/09–09/10), 130 lượt là push lên `onehub` lặp lại đủ năm job đã chạy ở PR;
mỗi lượt khoảng 12 phút tính tiền. Ngày 09/10 GitHub dừng mọi job vì vượt mức chi. Vòng này chỉ sửa
`.github/workflows/acceptance.yml` (ranh giới giám sát duyệt), không chạm `ci.yml`.

## Criteria

- AC-1: Given `acceptance.yml` sau vòng này, When một sự kiện `pull_request` tới, Then các lệnh `run` được chạy đúng
  bằng tập lệnh `run` mà bản ở merge-base chạy cho `pull_request` — không thiếu, không thừa — rút từ chính hai tệp, không
  liệt tay.
- AC-2: Given `acceptance.yml` sau vòng này, When push lên `onehub` hoặc `release`, Then chạy job khoá `acceptance`
  (luật kho, bản đồ sản phẩm, pre-merge chế độ push, `test:dieu-phoi`) và job `build`; `agent-okr-node24` bị bỏ qua vì
  `if` cấp job chỉ đúng khi `pull_request`, nên không còn `db:deploy` hay test agent-okr khi push. Khối `on:` giữ nguyên.
- AC-3: Given hai lượt Acceptance của cùng một PR, When lượt sau bắt đầu, Then lượt trước bị huỷ; Given hai lượt push lên
  `onehub` liên tiếp, When lượt sau bắt đầu, Then không lượt nào bị huỷ hay bỏ chờ (nhóm concurrency của push khác nhau
  theo commit).
- AC-4: Given job khoá `acceptance`, When đọc job, Then tên hiển thị đúng «acceptance gate», không có `if` hay
  `continue-on-error` cấp job; bước luật kho đứng sau `bun install` và không có `if`; mọi bước sau luật kho mang
  `if: ${{ !cancelled() }}`, nên một bước đỏ thì các bước sau vẫn chạy và job vẫn đỏ.
- AC-5: Given các hồ sơ `signed-off` hoặc `machine-cleared` có eval `script` mà `paths` chạm
  `.github/workflows/acceptance.yml` (rút từ `_acceptance/*/evals.yaml`, không liệt tay), When chạy lại lệnh của các eval
  đó trên cây sau vòng này, Then không lệnh nào đỏ thêm so với cùng lệnh chạy trên cây có `acceptance.yml` của bản
  merge-base; lệnh đỏ sẵn trên cả hai cây được ghi tên kèm nhật ký; không sửa thước nào của các hồ sơ đó. Hai lệnh nặng
  (`hld_build_heap` chạy `next build`, `ld_ba_noi_deu_chay` chạy trọn pre-push) không chạy lại, mà điều kiện của chúng trên
  `acceptance.yml` (bước build không `if`, không `continue-on-error`) được đo thẳng.
- AC-6: Given hồ sơ, When cần đo bốn ngưỡng 7 ngày của Cổng Đáng, Then có `rang/do-phut.mjs` tính phút tính tiền của
  từng lượt Acceptance (tổng các job, mỗi job làm tròn lên phút) tách theo sự kiện `push`/`pull_request`, in trung vị mỗi
  nhóm trong một cửa sổ thời gian (lượt bị huỷ không vào trung vị, đếm riêng), chạy được trên dữ liệu thật của kho.
- AC-7: Given luật bảo vệ nhánh `onehub` (rules và branch protection), When đọc tập check bắt buộc, Then mọi check bắt
  buộc đều còn một job cùng tên chạy khi `pull_request` — gộp job không làm kẹt PR nào ở «Expected — Waiting for status».

## Coverage

- Trục A — sự kiện: `pull_request` | push `onehub` | push `release` [thước CE: khối `on:` của bản ở merge-base]
- Trục B — job: `acceptance` (gộp) | `build` | `agent-okr-node24` [thước CE: `jobs` của bản mới]
- Trục E — check bắt buộc của `onehub`: không có | có tên job cũ | có tên job còn [thước CE: `gh api …/rules/branches/onehub`]
- Trục C — kết cục bước trong job gộp: xanh | đỏ | bị huỷ [thước CE: tài liệu GitHub Actions về `cancelled()`]
- Trục D — đẩy chồng: hai lượt cùng PR | hai push liên tiếp lên `onehub` [thước CE: tài liệu GitHub Actions về `concurrency`]
- Core → AC: A×B → AC-1, AC-2; C → AC-4; D → AC-3; E → AC-7; thước đã ký → AC-5; ngưỡng Cổng Đáng → AC-6. Không quét bằng skill —
  xem sổ quyết định («bỏ coverage-scan»).

## Đường đo

- «push lên `onehub` có trung vị ≤ 8 phút; PR có trung vị ≤ 10 phút» · `bun _acceptance/giam-phut-acceptance/rang/do-phut.mjs
  --tu <ngày gộp> --ngay 7` · AC-6.
- «mọi lệnh kiểm cũ vẫn chạy ở PR» · E2 chạy lại ở mỗi lượt ghim lại · AC-1.
- «`onehub` đỏ sau gộp vì lỗi chỉ lượt push cũ bắt được» · đọc tay các lượt đỏ của Acceptance và CI trên `onehub` trong 7
  ngày — không có phép đo máy, xem Notes.

## Out of scope

- `.github/workflows/ci.yml` (cửa sổ đo 7 ngày của F22 sau #331).
- Runner tự dựng trên Mac mini và dời ảnh đĩa Docker (cần anh duyệt riêng, giám sát chọn giờ).
- Bỏ qua CI cho PR nháp hay PR chỉ sửa tài liệu.
- Turbo remote cache, cache `bun install`.

## Notes

- Giữ `build` khi push (đổi so với thiết kế anh duyệt ở Cổng Đáng): 10 ngày qua, lượt push trên `onehub` đỏ 7 lần,
  5 lần ở «lệnh dựng» (29/09 bốn lần, 05/10 lượt hết heap 37263692533); 26/107 commit gộp 7 ngày qua có cây khác cây đầu
  PR. agent-okr chưa đỏ lần nào khi push.

- Ngưỡng «`onehub` đỏ sau gộp vì lỗi chỉ lượt push cũ bắt được» không có phép đo máy: người đọc các lượt đỏ trên `onehub`
  trong 7 ngày và quyết. Vòng này chấp nhận giới hạn đó (sổ quyết định).
