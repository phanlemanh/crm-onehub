---
schema_version: 1
slug: push-ghim-lai-t1
feature: Lần đẩy chỉ ghim lại (run-log, decisions) bỏ test và build, mà acceptance gate vẫn chạy và recheck bằng chứng vẫn đỏ được
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: C-1c
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

Gốc: lượt S4 và Cổng Bằng chứng của `t1-ma-doc` (PR phanlemanh/crm-onehub#480) — mục ngoài hợp đồng «lần đẩy chỉ
ghim lại vẫn chạy đủ năm bước» (`_acceptance/t1-ma-doc/decisions.jsonl`, dòng `revisit`), chủ kho phê mở hợp đồng mới
ở Cổng 2 (18/10). Nằm ngoài cả hợp đồng `pre-push-t1` (Notes: run-log/decisions/evals không phải T1) lẫn `t1-ma-doc` (OOS-2).

## Vấn đề & ai gặp

Mở từ hàng C-1c của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: chưa gắn — việc vệ sinh bộ công cụ, đứng sau C-1b (`t1-ma-doc`), không thuộc mốc sản phẩm nào.

Ghim lại (`repin-lane.mjs --write`) chỉ ghi ba loại tệp: `_acceptance/<slug>/run-log.jsonl`, `decisions.jsonl`
(dòng `repin-do`, sổ quyết định) và `evidence-report.md`. `evidence-report.md` đã khớp `**/*.md`, nhưng hai tệp
`.jsonl` không khớp glob nào của `risk_tiers.t1_skip_globs`, nên bộ phân loại chung (`.github/scripts/phan-loai.mjs`,
`scripts/pre-push-t1.mjs` gọi lại) trả `co-tep-nang`.

Đo trên cây `4f22bad43` (đỉnh #480): commit ghim lại thật `38ecca3be` (8 hồ sơ, 16 tệp) → `{"nang":true,
"lyDo":"co-tep-nang"}`, 8/16 tệp không phải T1 — đúng 8 tệp `run-log.jsonl`. Điều phối M5 đo cùng kết quả ở #461 (DA3).

Hệ quả: mỗi lần đẩy chỉ ghim lại chạy đủ năm bước pre-push (~15–18′, giữ khoá nặng của máy); và PR chỉ ghim lại chạy
đủ job nặng của CI. Đếm 30 ngày (300 PR đã gộp từ 18/09): 6 PR chỉ chạm ba loại tệp trên (+ `PRODUCT-MAP.md`,
`LO-TRINH.html`): #473, #455, #454, #446, #394, #267 — làn đêm C-2 ghim lại hồ sơ hoá cũ mỗi ngày gộp.

**Giới hạn của lợi ích (nói trước):** CI phân loại cả PR (diff gốc PR), không phân loại từng lần đẩy — PR có mã thì
lần đẩy ghim lại vào nó vẫn nặng ở CI; lợi ích CI chỉ có ở PR toàn ghim lại. Pre-push phân loại theo lần đẩy, nên
lợi ích ở đó rộng hơn; nhưng lần đẩy mang commit gộp onehub kèm ghim lại vẫn nặng (diff mang tệp của onehub).

**Người gặp:** thợ và Điều phối M5 ba máy (khoá nặng bị giữ cho một lần đẩy không đổi mã); chủ kho (CI đốt phút
cho PR làn đêm).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Không bài kiểm, bản dựng hay runtime nào trong năm bước đọc `_acceptance/*/run-log.jsonl` / `decisions.jsonl` thật | Lần đẩy nhẹ bỏ đúng bài kiểm đọc nó; lệch lộ muộn ở onehub | Thêm glob rồi chạy bộ quét `.github/scripts/t1-ma-doc.mjs` (trong `@crm/ui#test`) + grep người đọc; đã grep sơ: chỉ `lib/*.cjs`, `scripts/{recheck-evidence,product-map,…}` đọc — chạy ở job `acceptance gate` | Grep sơ xong, quét chưa chạy |
| 2 | Job `acceptance gate` (`luat-kho`: product-map `--check`, pre-merge-check, luật đọc OKR) chạy ở mọi PR bất kể phân loại, nên recheck bằng chứng vẫn đỏ được | PR ghim lại sửa tay run-log lọt cổng — đúng điều kiện bắt buộc của hàng C-1c | Đọc `acceptance.yml`: `luat-kho` không `needs: phan-loai` (đã đọc); ca đỏ: PR chỉ ghim lại có dòng repin giả → `VIOLATION` | Đọc xong, ca đỏ chưa dựng |
| 3 | Thêm hai glob vào `t1_skip_globs` không đổi hành vi cổng nghiệm thu | Hồ sơ hết hạn hay T1-escape đổi kết luận | `pre-merge-check.sh` bỏ `_acceptance/*` TRƯỚC khi khớp T1 (dòng 680, 813); so output trước/sau trên cùng cây | Đọc xong, so chưa chạy |
| 4 | Thêm đúng hai glob đích danh tốt hơn xếp mọi `_acceptance/**` là hồ sơ như `--hang-pr` của kit | Sót tệp ghim lại khác, hoặc bỏ bài kiểm đọc `evidence/**`, `rang/**`, `evals.yaml`, `config.yaml` | Có bài kiểm đọc chúng (listing-fixture-batch.spec, lai-ra-man.spec, pre-push-t1.spec) → `ho-so` của kit quá rộng cho kho này | Đã đo 17/10 trong vòng t1-ma-doc |

## Ngưỡng chết / ngưỡng UAT

- Không đo được — việc nội bộ của bộ công cụ, không có người dùng cuối để mời phiên nghiệm thu; giá trị đo bằng ca của bộ phân loại: commit ghim lại thật `38ecca3be` → nhẹ, và PR chỉ ghim lại có bằng chứng giả → cổng nghiệm thu đỏ.

## Chính sách đợt

Chạm trần 3 lượt → thu phạm vi · đỏ sẵn trên nền → tách vòng vệ sinh. Làn M5 sau C-1b (#480 chưa gộp — nhánh chồng
trên `chore/t1-ma-doc`); xin làn Điều phối M5 trước việc nặng; báo `cham-tep` ở #375 trước commit `_acceptance/config.yaml`.

## Kết quả prototype

Không dựng bản thử — phép đo là bộ phân loại chạy trên danh sách tệp.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Bộ khớp glob `match_globs` | `scripts/pre-merge-check.sh` (chép từ acceptance-gate-kit) | triết-lý/logic | có — dùng nguyên, không sửa | |
| Hạng `ho-so` của `--hang-pr` | `scripts/pre-merge-check.sh` (kit, hồ sơ ci-cua-kho-bo-job-nang) | triết-lý | không — xếp mọi `_acceptance/**` là nhẹ, quá rộng cho kho có bài kiểm đọc `evidence/`, `rang/` | |

## Cổng 0

- **decision = ?** Khuyến nghị `build`: lỗ đã gọi tên, đo được trên commit thật, sửa một khối cấu hình + ca kiểm.
- **Ngưỡng UAT chốt cùng lúc ký:** Không đo được (đề xuất).
- **disposition = archive** Căn cứ: không có code bản thử.

## Thước đo thành công → ứng viên criterion

- Lần đẩy / PR chỉ chạm `run-log.jsonl`, `decisions.jsonl`, `evidence-report.md` (+ tệp T1 khác) → nhẹ (`chi-t1`).
- Cùng lần đẩy thêm một tệp `evidence/**`, `rang/**`, `evals.yaml` hay `config.yaml` → nặng.
- PR chỉ ghim lại với dòng repin giả → job `acceptance gate` vẫn chạy và `pre-merge-check` đỏ.
- Bộ quét t1-ma-doc đỏ nếu sau này một bài kiểm đọc `run-log.jsonl`/`decisions.jsonl`.
