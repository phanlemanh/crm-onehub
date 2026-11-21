---
schema_version: 1
feature: crm chuyển kit nghiệm thu từ chợ cũ acceptance-gate-kit sang chợ delivery-loop v3.0.0 — lớp CI chép lại từ thẻ 3.0.0, luồng gom tín hiệu kéo kho mới, phiên bật sáu plugin chợ mới và tắt đích danh sáu plugin chợ cũ, tệp sống thôi gọi tên lệnh cũ, hồ sơ cần thì ghim lại; không đổi hành vi
slug: chuyen-cho-delivery-loop-3-0
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, config]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-11-21
design_doc: docs/superpowers/specs/2026-11-20-chuyen-cho-delivery-loop-3-0-design.md
---

# Acceptance Contract: chuyen-cho-delivery-loop-3-0

## Context

Từ 18/11 nguồn của kit là kho `phanlemanh/delivery-loop`; kho cũ đóng băng ở `v2.39.0`. crm là kho cuối còn dùng kit
cũ: job `gate` chạy lớp CI chép từ kit 2.37.0, luồng `tin-hieu-gom.yml` kéo kit cũ `v2.36.0`, phiên bật sáu plugin chợ
cũ, kiểm chéo đêm và phiên gom gọi gói và skill theo tên cũ. Đây là chặng II.2 của «chuyển nhà giai đoạn 2» (chủ kho
duyệt kế hoạch 19/11; «Mở crm» 20/11): một vòng, một PR, mốc cài `v3.0.0` (commit `c16d25db`), không ghép đổi hành vi.
Mẫu: Quỹ hàng PR #247 (gộp `f7218b5f`). Hạng T2: không tệp nào thuộc `t3_paths`.

Source input: lời giao của phiên giữ đợt 20/11 · `migration/KE-HOACH-GIAI-DOAN-2.md` mục 4 dòng II.2 (kho delivery-loop,
nhánh `chuyen-nha`) · `migration/chuyen-kho/README.md` (K1–K6) · thiết kế
`docs/superpowers/specs/2026-11-20-chuyen-cho-delivery-loop-3-0-design.md`

## Criteria

- AC-1: Given PR này, When so 38 đích của khối `INIT-CI-COPY-LIST` trong `commands/acceptance-init.md` của kit v3.0.0
  với tệp cùng đường trong kho, Then mỗi đích khớp từng byte `plugins/acceptance-gate/<nguồn>` của thẻ;
  `scripts/resolve-plugin.mjs` khớp từng byte `plugins/feature-loop/scripts/resolve-plugin.mjs` của thẻ; kho không còn
  tệp nào dưới `dieu-phoi/`, không tệp mã nào nạp `dieu-phoi/scripts/`, và `.oxlintrc.json` thôi trỏ nó;
  `risk_tiers.t1_skip_globs` liệt đủ 38 đích và không còn ba đích chép cũ `dieu-phoi/scripts/*`. Kit đọc theo commit
  `c16d25db` của thẻ (đối tượng thẻ là `228f9b64`).
- AC-2: Given `.github/workflows/tin-hieu-gom.yml` và `scripts/tin-hieu/gom-cau-hinh.ts`, When luồng gom tín hiệu cài
  kit, Then luồng có đúng một dòng `KIT_REF: v3.0.0`, clone `https://github.com/phanlemanh/delivery-loop`, cài
  `acceptance-gate@delivery-loop`; không tệp nào dưới `.github/` còn chữ `acceptance-gate-kit`; bộ giải kit của phiên gom
  tìm được bản acceptance-gate 3.0.0 trong một cache dựng từ thẻ; hai skill phiên gom được gọi
  (`acceptance-gate:signal-intake`, `acceptance-gate:scope-slice`) có trên kit 3.0.0, lời dặn gọi đúng hai tên ấy và
  không tên cũ nào; bộ kiểm `scripts/tin-hieu/test` xanh.
- AC-3: Given `.claude/settings.json`, When đọc khoá chợ và plugin, Then chợ khai duy nhất là `delivery-loop` (github
  `phanlemanh/delivery-loop`, `ref: v3.0.0`), sáu plugin `acceptance-gate`, `feature-loop`, `diagram-design`,
  `dispatch`, `roadmap`, `knowledge` `@delivery-loop` là `true`, và `.claude-plugin/marketplace.json` của thẻ mang tên
  `delivery-loop` với đủ sáu plugin ấy; mọi khoá khác của tệp và plugin ngoài kit giữ nguyên so với nhánh chính.
- AC-4: Given cùng tệp, When đọc khoá chợ cũ, Then có đúng sáu khoá `acceptance-gate`, `feature-loop`,
  `diagram-design`, `dieu-phoi`, `road-map`, `tri-thuc` `@acceptance-gate-kit` và cả sáu là `false`.
- AC-5: Given `scripts/kiem-cheo/cau-hinh.mjs`, When kiểm chéo đêm giải gói điều phối, Then nó giải gói `dispatch`, lệnh
  cài gợi ý là `claude plugin install dispatch@delivery-loop --scope project`; trong một cache dựng từ thẻ v3.0.0 bộ giải
  ra đúng bản `dispatch` 3.0.0 và ba tệp nó nạp có ba hàm `timThuMucDot`, `chamNhip`, `kiemDon`; tên `dieu-phoi` không
  giải được trong cùng cache; bộ kiểm `scripts/kiem-cheo/test` xanh.
- AC-6: Given tệp sống của kho, When công cụ kiểm chuyển kho (`migration/chuyen-kho/chuyen-kho.mjs` của kho delivery-loop
  tại `469e5ba4`) chạy chế độ kiểm trên cây, Then K1–K5 đều ĐẠT và dòng cuối `KẾT: ĐẠT`, còn trên merge-base cả năm điểm
  CHƯA; tệp mẫu `apps/agent/test/mau/lo-trinh-kit.html` chỉ đổi đúng 14 tên lệnh theo bảng tên của kit (Hỏi-1);
  `CLAUDE.md` chỉ đường báo lỗi kit sang `~/dev/delivery-loop` (Hỏi-2).
- AC-7: Given merge-base với nhánh chính, When lớp chép của nhánh chính và kit v3.0.0 cùng chạy `--recheck-all` trên
  cây merge-base, Then cả hai 0 VIOLATION và cùng tập hồ sơ OK; và trên HEAD, lớp chép của HEAD chạy `--recheck-all`
  vẫn OK mọi hồ sơ ấy, dòng VIOLATION nếu có chỉ thuộc hồ sơ của vòng. Khác biệt luật duy nhất của lớp chép 3.0.0 so
  với 2.37 là luật kit 2.38 «code `t3_paths` phải đi cùng hồ sơ thật sự bị chấm» (T3-CAN-HO-SO-GUARD): nó xét theo diff
  nên không đổi phán quyết của hồ sơ đã ký nào, còn PR sau chạm `t3_paths` chịu luật ấy (Hỏi-3).
- AC-8: Given ứng viên viết trước — mọi eval máy của hồ sơ đã ký mà `paths` khớp một tệp PR đổi (eval chỉ khớp vì tệp
  mẫu `lo-trinh-kit.html` thì thay bằng hai bài kiểm đọc tệp ấy) — When chạy khô đúng các eval ấy trên tip, rồi chạy lại
  eval đỏ trên nhánh chính và trên bản sau gộp giả, Then `evidence/phan-loai-ghim.json` xếp mỗi eval đỏ trên tip vào
  đúng một lớp: «đỏ cả hai bên» (đỏ sẵn, để nguyên), «đo diff của nhánh» (xanh trên bản sau gộp giả), «đỏ vì vòng»;
  mỗi eval «đỏ vì vòng» hoặc thuộc một hồ sơ vòng ghim lại bằng làn máy tại tip — dòng ghim cuối có `sha` bằng
  `verified_commit`, suite thoát 0, báo cáo nêu `run_id`, chữ ký người giữ nguyên — hoặc được nêu đích danh ở một dòng
  `- gioi-han:` của mục «Ghim lại — kết quả» (Hỏi-4), và mỗi dòng `gioi-han` là một eval thật sự đỏ vì vòng; tập hồ sơ
  có `run-log.jsonl` đổi trong PR, tập ghim của tệp phân loại và tập «ghim» của mục ấy bằng nhau.
- AC-9: Given PR này, When so diff với nhánh chính, Then mọi tệp đổi thuộc danh sách viết trước của thiết kế mục 2 (cộng
  hồ sơ này, thiết kế, kế hoạch, tệp vẽ lại), ở hồ sơ ghim lại chỉ `run-log.jsonl`, `evidence-report.md` và tệp thước
  nêu đích danh ở mục «Ghim lại — kết quả»; lệnh suite của lượt chấm (`feature_loop.suite_keys`) xanh, hoặc đỏ đúng các ca
  đã đỏ trên nhánh chính (nhãn «đỏ sẵn trên nền» của kho); và `product-map.mjs --check` của lớp chép xanh.

## Coverage

- bỏ coverage-scan — phạm vi do kế hoạch đã duyệt chốt (năm phần của dòng II.2) và công cụ kiểm chuyển kho liệt các điểm
  K1–K6; trục được phủ: lớp CI chép (AC-1) · luồng kéo kit lúc chạy (AC-2) · phía phiên (AC-3) · tắt đích danh (AC-4) ·
  công cụ máy gọi gói theo tên (AC-5) · tên cũ trong tệp sống (AC-6) · không đổi phán quyết (AC-7) · ghim lại (AC-8) ·
  không đổi hành vi (AC-9). Dòng sổ «bỏ coverage-scan» trong `decisions.jsonl`.

## Đường đo

- bỏ đường-đo — việc vận hành kho, không có ô cơ hội và ngưỡng nghiệm thu.

## Ghim lại — kết quả

Làn khô 20/11 trên `29fa0598` (157 ứng viên, 50 đỏ) với đối chứng nhánh chính `74a29a68` và bản sau gộp giả
`183ae167`: 35 đỏ cả hai bên, 14 xanh sau gộp, 1 đỏ vì vòng. Chạy lại ở tip cuối trước Cổng Bằng chứng
(`evidence/phan-loai-ghim.json`).

Làn khô 21/11 trên `25053cbd` (46 đỏ) với đối chứng nhánh chính `5e2c0b39` và bản sau gộp giả `185fc4bc`: 33 đỏ cả
hai bên, 8 xanh sau gộp, 5 đỏ vì vòng. Bốn dòng `gioi-han` sau `E6` mở lại hợp đồng theo lời chủ kho 21/11 «Lối A»:
ba eval chạy `pre-merge-check` toàn kho và đếm hồ sơ của chính vòng này khi nó chưa ở trạng thái gộp được
(`VIOLATION [chuyen-cho-delivery-loop-3-0]: verdict=REJECT`, và khi bỏ báo cáo ấy:
`status=implemented but no evidence-report.md`); `sua-bom-gio-test-api/E14` đòi một lần chạy CI `test (api)` trên
GitHub mà bản gộp giả không có.

- gioi-han: `chuyen-goi-dieu-phoi/E6`
- gioi-han: `do-man-tren-kho-rieng/E13`
- gioi-han: `don-ho-so-cu/E9`
- gioi-han: `sua-paths-e5-soan-okr/E5`
- gioi-han: `sua-bom-gio-test-api/E14`

## Out of scope

- Phép thử phiên thật (K6: phiên nạp đủ sáu plugin 3.0, 0 plugin chợ cũ) — máy chạy `chuyen-kho.mjs --phien` trên nhánh
  trước khi gộp và trên nhánh chính sau khi gộp, ghi vào mô tả PR; không phải eval vì tốn một lượt gọi model và chỉ đo
  được máy đang chạy.
- Cài đặt mức người dùng, cài sáu plugin `@delivery-loop` lên máy, gỡ chợ cũ khỏi máy — việc của người (II.4).
- Bật khoá hay luật mới nào của kit 3.0 (ví dụ `lo_trinh.chan`) — mốc cài là `v3.0.0`, không ghép đổi hành vi.
- Dữ liệu sản phẩm lấy `phanlemanh/acceptance-gate-kit` làm ví dụ kho của trang lộ trình nhiều sản phẩm — dữ liệu mẫu,
  không phải chỗ kéo kit.
- Sổ kể lại (`docs/superpowers/**`, `docs/findings/**`, `docs/plan/don-dep-3110.md`, hồ sơ đã ký) và khoá executor chết
  của hồ sơ cũ trong `_acceptance/config.yaml` — không sửa.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Known limits (khai trước, Hỏi-4)

- `chuyen-goi-dieu-phoi/E6` (`goi-vang.mjs`) đỏ sau gộp: thước viết cứng gói `dieu-phoi` và lệnh cài
  `dieu-phoi@acceptance-gate-kit`, đúng thứ vòng này đổi sang `dispatch@delivery-loop`. Hồ sơ ấy đã không ghim được trên
  nhánh chính (E1, E10 đỏ sẵn), nên vòng không sửa thước của nó; kiểm chéo đêm vẫn báo hồ sơ này đỏ như trước.

## Notes

- Không chạm bất biến nào của AGENTS.md: không mã sản phẩm, không cơ sở dữ liệu.
- Đo trên cây chưa sửa `74a29a68` (20/11): `check-types`, `lint`, `lint:slop`, `build` xanh; `bun run test` đỏ ở
  `api#test` với 9 ca (`cmst-goc`, sáu ca `dem-chip`, `loc-gop-y`, `dong-bo`, `bo-qua`), 2159 ca qua — đỏ sẵn trên nền.
- Bản vá K1–K3 lấy từ `chuyen-kho.mjs --soan`; công cụ không biết lớp CI chép của crm (K3 chỉ đọc workflow kéo kit) —
  phần ấy làm theo `INIT-CI-COPY-LIST` của thẻ, báo lại cho phiên giữ đợt.
- Known limits — chọn ở Cổng Bằng chứng 2026-11-21:
  - Ngoài-2: việc kiểm hồ sơ ghim lại chưa từng bị thử với dữ liệu sai, vì vòng này không có hồ sơ nào cần ghim.
  - Ngoài-3: phép so với nhánh chính neo mốc cố định `74a29a68`, không neo merge-base thật; nhánh chính đổi cấu hình
    phiên sau mốc ấy thì bài kiểm có thể báo sai.
