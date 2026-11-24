---
schema_version: 1
feature: crm nâng kit nghiệm thu delivery-loop từ v3.0.0 lên v3.1.1 — ref chợ của phiên, KIT_REF của luồng gom tín hiệu, lớp CI chép lại từ thẻ 3.1.1; không đổi hành vi
slug: nang-kit-3-1-1
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, config]
status: draft
design_doc: docs/superpowers/specs/2026-11-24-nang-kit-3-1-1-design.md
---

# Acceptance Contract: nang-kit-3-1-1

## Context

Kit v3.1.1 «Bản vá chữ ký giữ chỗ» ra ngày 23/11. Chủ kho đưa mọi kho trên máy lên bản này; phía máy đã xong (chợ
`delivery-loop` trỏ v3.1.1, plugin mức dự án của crm đã cập nhật). crm còn ghim v3.0.0 ở ba chỗ: ref chợ trong
`.claude/settings.json`, `KIT_REF` của `.github/workflows/tin-hieu-gom.yml`, và lớp CI chép từ kit (bốn tệp lệch byte,
thiếu đích thứ 39). Kit đọc theo commit `1193bc22` của thẻ v3.1.1; đối tượng thẻ là `f0b675ea`. Hạng T2: không tệp nào
thuộc `t3_paths`. Mẫu: vòng `chuyen-cho-delivery-loop-3-0` (PR #622).

Source input: lời giao của phiên giữ việc nâng kit 24/11 · thiết kế
`docs/superpowers/specs/2026-11-24-nang-kit-3-1-1-design.md`

## Criteria

- AC-1: Given PR này, When so mọi đích của khối `INIT-CI-COPY-LIST` trong `plugins/acceptance-gate/commands/acceptance-init.md`
  tại commit `1193bc22` với tệp cùng đường trong kho, Then danh sách có đúng 39 đích, mỗi đích khớp từng byte
  `plugins/acceptance-gate/<nguồn>` của commit ấy; `scripts/resolve-plugin.mjs` khớp từng byte
  `plugins/feature-loop/scripts/resolve-plugin.mjs` của commit ấy; `risk_tiers.t1_skip_globs` liệt đủ 39 đích, gồm
  `scripts/tro-ly-quyet-dinh.cjs`.
- AC-2: Given `.github/workflows/tin-hieu-gom.yml`, When luồng gom tín hiệu cài kit, Then tệp có đúng một dòng
  `KIT_REF: v3.1.1` và mọi dòng khác bằng bản merge-base; trong một cache dựng từ commit của thẻ, bộ giải kit chạy với
  đúng đối số của phiên gom (`GOM.kit.giai`) ra thư mục `delivery-loop/acceptance-gate/3.1.1`, và với gói điều phối của
  kiểm chéo đêm (`KIEM_CHEO.goiDieuPhoi`) ra `delivery-loop/dispatch/3.1.1`.
- AC-3: Given `.claude/settings.json`, When đọc tệp, Then `extraKnownMarketplaces.delivery-loop.source.ref` là `v3.1.1` và
  đặt lại đúng khoá ấy về `v3.0.0` thì tệp bằng bản merge-base; `.claude-plugin/marketplace.json` của commit thẻ mang tên
  `delivery-loop` và có đủ sáu plugin đang bật `@delivery-loop`.
- AC-4: Given các tệp được theo dõi của kho, When tìm chữ `v3.0.0`, Then không tệp sống nào còn nó; chữ ấy chỉ còn ở sổ
  kể lại: thư mục hồ sơ `_acceptance/<slug>/` (kể cả hồ sơ này, nơi chữ ấy tả việc đổi), `docs/superpowers/**`,
  `docs/findings/**`, và hai view máy vẽ từ hồ sơ `PRODUCT-MAP.md`, `LO-TRINH.html`. `_acceptance/config.yaml` là tệp
  sống.
- AC-5: Given merge-base với nhánh chính, When lớp chép của nhánh chính và lớp chép của thẻ 3.1.1 cùng chạy
  `pre-merge-check.sh --recheck-all` trên cây merge-base, Then cả hai 0 VIOLATION và cùng tập hồ sơ OK; và trên HEAD,
  lớp chép của HEAD chạy `--recheck-all` vẫn OK mọi hồ sơ ấy, dòng VIOLATION nếu có chỉ mang tên hồ sơ của vòng; và
  lưới chế độ PR đúng như `acceptance.yml` chạy (`pre-merge-check.sh . --base <merge-base>`) trên HEAD không báo
  VIOLATION nào mang tên một hồ sơ khác vòng này.
- AC-6: Given ứng viên suy từ diff — mọi eval `test`/`script` của hồ sơ `signed-off` hay `machine-cleared` mà `paths`
  khớp một tệp PR đổi ngoài hồ sơ này — When chạy khô đúng các eval ấy trên tip, rồi chạy lại eval đỏ trên nhánh chính,
  Then `evidence/phan-loai.json` mang sha tip có cây ngoài `_acceptance/` bằng cây HEAD, tập ứng viên bằng tập suy lại,
  mỗi eval đỏ trên tip có đúng một lớp («đỏ cả hai bên» khi cũng đỏ trên nhánh chính, «đỏ vì vòng» khi xanh trên nhánh
  chính); tập «đỏ vì vòng» bằng tập dòng `- gioi-han:` của mục «Làn khô — kết quả» (Hỏi-1).
- AC-7: Given PR này, When so diff với nhánh chính, Then mọi tệp đổi thuộc danh sách viết trước của thiết kế mục 2
  (cộng hồ sơ này, thiết kế, kế hoạch, `PRODUCT-MAP.md`, `LO-TRINH.html`); và `product-map.mjs --check` của lớp chép
  xanh.

## Coverage

- bỏ coverage-scan — phạm vi là diff của kit giữa hai thẻ cộng ba chỗ kho ghim phiên bản, đã đếm hết ở thiết kế mục 2;
  trục được phủ: lớp CI chép (AC-1) · luồng kéo kit lúc chạy (AC-2) · phía phiên (AC-3) · tên phiên bản trong tệp sống
  (AC-4) · không đổi phán quyết của lưới, ở cả chế độ toàn kho lẫn chế độ PR (AC-5) · không đổi kết quả eval của hồ sơ
  đã ký (AC-6) · diff đúng danh sách và bản đồ vẽ được (AC-7). Bộ suite của kho (`feature_loop.suite_keys`) do lượt chấm
  S4 chạy mỗi lượt, không thành AC riêng. Dòng sổ «bỏ coverage-scan» trong `decisions.jsonl`.

## Đường đo

- bỏ đường-đo — việc vận hành kho, không có ô cơ hội và ngưỡng nghiệm thu.

## Làn khô — kết quả

Điền ở S3 từ `evidence/phan-loai.json`. Mỗi eval «đỏ vì vòng» là một dòng `- gioi-han: <hồ sơ>/<eval>`.

## Out of scope

- Bật khoá mới nào của kit 3.1.1 (`ban_do.ngoai_git`, `dieu_phoi.chuyen_gop`, `tro_ly_quyet_dinh.mac_ky`) — mỗi khoá là
  một vòng riêng.
- Sửa thước, `evals.yaml` hay bất cứ tệp nào của `chuyen-cho-delivery-loop-3-0` — hồ sơ ấy giữ chữ ký.
- Cài đặt mức người dùng và plugin trên máy — đã xong trước vòng.
- Sổ kể lại còn nhắc `v3.0.0` (hồ sơ đã ký, `docs/superpowers/**`, `docs/findings/**`) — không sửa.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Không chạm bất biến nào của AGENTS.md: không mã sản phẩm, không cơ sở dữ liệu.
- Nhánh PR là `onehub` (kho không có `main`); `CONTRIBUTING.md` nói `main`, vòng theo thứ kho thật dùng.
