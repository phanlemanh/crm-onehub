---
schema_version: 1
feature: PR nháp và PR chỉ chạm tệp T1 không chạy job nặng của ci.yml và acceptance.yml; ci-ok xanh khi bỏ qua hợp lệ; push giữ nguyên; luật PR nháp trong CLAUDE.md
slug: giam-phut-ci-nhap-t1
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-11T02:06:10Z
design_doc: _acceptance/giam-phut-ci-nhap-t1/design.md
---

# Acceptance Contract: giam-phut-ci-nhap-t1

## Context

02–08/10 mỗi lần đẩy PR tốn khoảng 45 phút Actions (`ci.yml` 35′, Acceptance 9–10′), kể cả khi PR chỉ sửa tài liệu
(27/134 PR gộp) và kể cả các lần đẩy lại trong lúc chuẩn bị trình cổng. Vòng này thêm một bộ phân loại: PR nháp và PR chỉ
chạm tệp T1 bỏ job nặng; PR sẵn sàng khác và mọi lượt push chạy như cũ. Năm eval đã ký chụp cứng hình dạng CI hôm nay
được khai thay bởi các AC của vòng này (bảng ở design doc). Sha ghim của vòng: `27d47de04725bc04d8d6deff870ac16751f3bf69`.

## Criteria

- AC-1: Given bộ phân loại `.github/scripts/phan-loai.mjs`, When nhận một ngữ cảnh (sự kiện, cờ nháp, danh sách tệp),
  Then quyết đúng bảng viết trước: không phải `pull_request` → nặng; PR nháp → nhẹ với mọi tập tệp; PR sẵn sàng có tệp
  dưới `.github/` → nặng, kể cả khi tệp đó có tên trong `t1_skip_globs` (`.github/workflows/ci.yml`); PR sẵn sàng mà mọi
  tệp khớp T1 → nhẹ; có tệp không T1 → nặng; danh sách rỗng, HEAD không có đúng hai cha, đọc config hay gọi bash hỏng →
  nặng kèm lý do; một tệp mã đổi tên thành `.md` → nặng (cả tên cũ lẫn tên mới vào danh sách). Lệnh ghi `nang` và `ly_do`
  vào `GITHUB_OUTPUT` và luôn thoát 0 khi đối số hợp lệ.
- AC-2: Given `risk_tiers.t1_skip_globs` của `_acceptance/config.yaml`, When bộ phân loại xét T1, Then danh sách glob đọc
  bằng `configList` của `lib/workspace-record.cjs` và phép khớp là hai hàm `glob_variants`/`match_globs` rút từ
  `scripts/pre-merge-check.sh` — thêm một glob vào config đổi kết quả mà không sửa tệp nào khác; tệp `.md` ở gốc kho
  (`AGENTS.md`) khớp `**/*.md`; không workflow nào khai `paths` hay `paths-ignore`.
- AC-3: Given `ci.yml` sau vòng này, When đọc tệp, Then có đúng bốn job `phan-loai`, `check`, `test`, `ci-ok`; `check`
  và `test` khai `needs: phan-loai` và `if: ${{ !cancelled() && needs.phan-loai.outputs.nang != 'false' }}`; mọi khoá còn
  lại của `check`/`test` (bước, biến, ma trận ba ô, dịch vụ, trần giờ) và khối `on`, `concurrency`, `permissions`, `env`
  giống từng khoá bản ở sha ghim — tức cấu hình đã đo ở #323.
- AC-4: Given job `ci-ok` (`needs: [phan-loai, check, test]`, `if: always()`), When chạy chuỗi lệnh của nó với mọi tổ hợp
  kết cục phân loại × `nang` × kết cục `check` × kết cục `test`, Then xanh khi và chỉ khi phân loại `success` hoặc
  `skipped` và (cả hai job `success`, hoặc phân loại `success` với `nang` là `false` và cả hai job `skipped`); mọi ô khác đỏ.
- AC-5: Given `acceptance.yml` sau vòng này, When đọc tệp, Then có đúng bốn job `luat-kho`, `phan-loai`, `build`,
  `agent-okr-node24`; `luat-kho` giống từng khoá bản ở sha ghim (tên «acceptance gate», không `if` cấp job, chuỗi bước
  luật kho → `test:dieu-phoi` → bản đồ → pre-merge); job `phan-loai` giống từng khoá job cùng tên ở `ci.yml`; `build`
  khai `needs: phan-loai` và đúng `if` của AC-3; `agent-okr-node24` khai `needs: phan-loai` và `if` bắt đầu
  `github.event_name == 'pull_request' &&` rồi đúng biểu thức đó; phần còn lại của hai job, khối `on`, `concurrency`,
  `permissions` giống từng khoá bản ở sha ghim.
- AC-6: Given hai workflow sau vòng này và bản ở sha ghim, When mô phỏng job nào chạy theo luật GitHub — workflow kích
  hoạt khi hành động thuộc `on.pull_request.types`; `if` không chứa hàm trạng thái bị ghép ngầm `success() &&`, và
  `success()` sai khi một job cần đến bị bỏ qua, đỏ hay huỷ; bộ đánh giá nhận đúng ngữ pháp hai tệp dùng, biểu thức lạ → mã
  2 — cho tám ngữ cảnh: push `onehub`, push `release`, push `main`, PR sẵn sàng có tệp không T1, PR chuyển sẵn sàng
  (`ready_for_review`), PR sẵn sàng mà phân loại hỏng, PR sẵn sàng chỉ T1, PR nháp, Then: push chạy đúng đa tập lệnh `run`
  như bản ghim (không lệnh phân loại, không `--filter=agent-okr`, không `db:deploy` ở Acceptance); PR sẵn sàng không T1, PR
  chuyển sẵn sàng và PR phân loại hỏng chạy đúng đa tập lệnh kiểm của bản ghim cộng lệnh của job phân loại; PR nháp và PR
  chỉ T1 chỉ chạy lệnh của `acceptance gate`, job phân loại và `ci-ok`. Bước của `ci-ok` được so riêng ở AC-4, không vào đa
  tập; ở mọi ngữ cảnh `ci-ok` phải chạy.
- AC-7: Given các hồ sơ `signed-off` hoặc `machine-cleared` khác có eval `script` mà `paths` chạm một trong hai tệp
  workflow (rút từ `_acceptance/*/evals.yaml`, không liệt tay; bỏ eval khai `not-run` và eval của chính hồ sơ này), When
  chạy lại lệnh của chúng trên cây sau vòng này, Then không lệnh nào đỏ thêm so với cùng lệnh trên cây mang hai tệp workflow
  của sha ghim; lệnh đỏ trên cả hai cây được ghi tên kèm nhật ký. Hai lệnh nặng (`hld_build_heap`, `ld_ba_noi_deu_chay`)
  không chạy lại, mà điều kiện của chúng trên workflow được đo thẳng: `build` có đúng một bước `bun run build` không `if`,
  không `continue-on-error`, heap bằng heap của `check-types`.
- AC-8: Given năm eval cũ ở bảng «Eval cũ thay bởi vòng này» của design doc, When đọc `evals.yaml` của hai hồ sơ cũ, Then
  mỗi eval khai `status: not-run` và `superseded_by` trỏ đúng AC trong bảng; design doc nêu thẻ `<hồ sơ>/<id>` của từng
  eval; mỗi AC được trỏ có ít nhất một eval sống ở `evals.yaml` của vòng này; mọi dòng khác của hai `evals.yaml` cũ giữ
  nguyên so với sha ghim. Hàm `chungThayBoi` của `lib/evidence-core.cjs` (chính luật mà làn ghim lại và lưới trước-merge
  dùng) phán năm ô: trên cây thật, khi hồ sơ này chưa `signed-off` thì lý do DUY NHẤT là `ho-so-thay-chua-ky`, khi đã ký thì
  nhận cả năm; trên bản sao tạm đặt hồ sơ này `signed-off`, mọi điều kiện trước `ac-thay-khong-con-eval` đều qua.
- AC-9: Given hồ sơ, When cần đo ngưỡng 7 ngày của Cổng Đáng, Then có `rang/do-phut-ci.mjs` đọc lượt `pull_request` của cả
  hai workflow trong cửa sổ, tính phút bằng chính hàm của `giam-phut-acceptance/rang/do-phut.mjs` (mỗi job làm tròn lên
  phút, job `skipped` 0 phút), in từng workflow (số lượt, tổng phút, số lượt nhẹ/nặng) và dòng ngưỡng trên TỔNG hai workflow
  gộp theo nhánh (phút trung bình mỗi nhánh so với ngưỡng sống/chết đọc từ `opportunity.md`), cùng dòng lượt chỉ T1 (nhận
  bằng `ly_do=chi-t1` trong nhật ký job phân loại; phút mỗi lần đẩy cộng hai workflow theo `head_sha`, so với ngưỡng ≤ 8);
  trên dữ liệu thật 02–08/10 dòng tổng ra ≈ 58 phút mỗi nhánh (lệch ≤ 10%).
- AC-10: Given `CLAUDE.md` sau vòng này, When đọc, Then có mục luật PR nháp: mở bằng `gh pr create --draft`, chuyển
  `gh pr ready` đúng lúc trình thẻ Cổng Bằng chứng (sau ghim lại và vẽ bản đồ), nêu luật là tạm tới đề xuất
  `phanlemanh/acceptance-gate-kit#301`; đoạn `ci.yml` do OneHub giữ (luật 47) còn nguyên.
- AC-11: Given PR của chính vòng này mở dạng nháp, When đọc các lượt `ci.yml` và Acceptance của nó trên GitHub, Then có
  ít nhất một lượt mỗi workflow mà job phân loại in `ly_do=nhap`, `check`, mọi job tên bắt đầu `test` (ma trận bị bỏ qua
  hiện thành MỘT job chưa bung tên), `lệnh dựng` và `agent-okr-node24` bị bỏ qua, `ci-ok` xanh, và «acceptance gate» đã
  chạy.

## Coverage

- Trục A — ngữ cảnh: push `onehub` | push `release` | push `main` | PR nháp | PR sẵn sàng (opened, synchronize, reopened) |
  PR chuyển sẵn sàng [thước CE: khối `on:` của hai tệp ở sha ghim]
- Trục B — tập tệp: chỉ T1 | có `.github/**` (kể cả tệp khai T1 đích danh) | có tệp không T1 | rỗng | đổi tên mã → `.md` |
  `.md` ở gốc kho [thước CE: `risk_tiers.t1_skip_globs` + chú thích lịch sử glob gốc kho trong config]
- Trục C — kết cục phân loại: nặng | nhẹ | hỏng | bỏ qua (push) [thước CE: `result` của job GitHub: success, failure,
  cancelled, skipped]
- Trục D — kết cục job nặng: success | failure | cancelled | skipped [thước CE: cùng bảng `result`]
- Cross-cutting: hồ sơ đã ký đo hai tệp workflow (rút bằng lệnh) → AC-7, AC-8; thước ngưỡng → AC-9; luật phiên → AC-10.
- Core → AC: A×B×C (bộ phân loại) → AC-1, AC-2; A×C (job nào chạy) → AC-3, AC-5, AC-6; C×D → AC-4; A «PR nháp» trên GitHub
  thật → AC-11. Later: check bắt buộc của `onehub` (hôm nay không có; CI1 E5 vẫn đo). Never: danh sách `paths-ignore` (danh
  sách thứ hai); bỏ «acceptance gate» ở nháp; tính `.github/**` là T1.
- [NGÀNH: GitHub Docs — job bị bỏ qua báo `skipped`, job phụ thuộc bị bỏ qua trừ khi `if` có hàm trạng thái] · [NGÀNH:
  `dorny/paths-filter` — lọc job theo tệp đổi trong một job phân loại riêng, cùng khuôn với vòng này].
- [GIẢ ĐỊNH] Job phân loại +1 phút tính tiền mỗi workflow mỗi lượt PR là chấp nhận được.
- [GIẢ ĐỊNH] «acceptance gate» giữ chạy ở PR nháp.

## Đường đo

- «phút PR trung bình mỗi nhánh ≤ 42 / > 50» và «lượt PR chỉ T1 ≤ 8 phút» · `bun _acceptance/giam-phut-ci-nhap-t1/rang/do-phut-ci.mjs
  --tu <ngày gộp> --ngay 7` · AC-9.
- «mọi lệnh kiểm cũ vẫn chạy ở PR sẵn sàng không T1» · E6 chạy lại ở mỗi lượt ghim · AC-6.
- «`onehub` đỏ sau gộp vì lỗi mà job nặng bị bỏ qua lẽ ra bắt được» · đọc tay các lượt đỏ trên `onehub` 7 ngày — không có
  phép đo máy, xem Notes.

## Out of scope

- `TURBO_FORCE` ở `.githooks/pre-push` và luật «chạy mới hết» của `scripts/verify-gate-shape.mjs` — vòng riêng.
- Danh sách `paths`/`paths-ignore` ở khối `on:`.
- Bỏ job «acceptance gate» ở PR nháp.
- Bảo vệ nhánh, check bắt buộc, mọi cài đặt GitHub.
- Đổi lượt push (`ci.yml` push `main`/`release`, Acceptance push `onehub`/`release`).
- Sửa script kit vendored (`scripts/pre-merge-check.sh`, `lib/workspace-record.cjs`, `scripts/recheck-evidence.cjs`,
  `scripts/product-map.mjs`) — vòng này chỉ gọi chúng.

## Notes

- Ngưỡng «`onehub` đỏ sau gộp vì lỗi mà job nặng bị bỏ qua lẽ ra bắt được» không có phép đo máy: người đọc các lượt đỏ
  trên `onehub` 7 ngày và quyết.
- Lượt «chuyển sẵn sàng chạy đủ» của chính PR này chỉ có sau Cổng Bằng chứng; nó được thấy ở điều kiện gộp (check xanh với
  job nặng đã chạy), không phải ở S4. AC-6 đo cùng quan hệ bằng mô phỏng, có ngữ cảnh `ready_for_review` riêng.
- Điều kiện cuối của luật thay bởi (eval sống có mã 0 trong báo cáo ĐÃ KÝ của hồ sơ này) chỉ thoả được sau chữ ký; làn ghim
  lại hai hồ sơ cũ ở đỉnh nhánh là nơi nó được chứng.
- Hai hồ sơ cũ (`giam-phut-acceptance`, `ci-ma-tran-ba-o`) ghim lại ở đỉnh nhánh sau chữ ký Cổng Bằng chứng — luật thay
  bởi của kit đòi hồ sơ thay đã có chữ ký người.
