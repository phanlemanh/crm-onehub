# Kế hoạch — crm chuyển sang chợ delivery-loop v3.0.0

Hồ sơ `_acceptance/chuyen-cho-delivery-loop-3-0/` · thiết kế
`docs/superpowers/specs/2026-11-20-chuyen-cho-delivery-loop-3-0-design.md` · hạng T2 (không Gate 1.5).

Bản sửa T1–T5 đã dựng trước Cổng Phạm vi để đo (commit tạm trên nhánh `chore/chuyen-cho-delivery-loop-3-0`); sau khi
duyệt, các task tách lại thành commit theo bảng dưới. T6–T7 chạy ở tip, sau mọi commit mã.

| Task | Việc | Tệp | Kiểm từng task | Phục vụ | Độc lập |
|---|---|---|---|---|---|
| T1 | Chép lại lớp CI theo `INIT-CI-COPY-LIST` của thẻ v3.0.0; chép `resolve-plugin.mjs` của feature-loop 3.0.0; gỡ `dieu-phoi/scripts/*`; `t1_skip_globs` thay 3 dòng bằng 5; `.oxlintrc.json` bỏ một dòng | 38 đích lớp chép, `scripts/resolve-plugin.mjs`, `dieu-phoi/scripts/*`, `_acceptance/config.yaml`, `.oxlintrc.json` | `cc30_thu` ca AC-1 · `cc30_ban_do` · `bun run lint:slop` | E1, E7, E9b | có |
| T2 | Bản vá `chuyen-kho.mjs --soan`: settings (sáu bật, sáu tắt, chợ `delivery-loop` `ref v3.0.0`) và `tin-hieu-gom.yml` | `.claude/settings.json`, `.github/workflows/tin-hieu-gom.yml` | `cc30_thu` ca AC-2, AC-3, AC-4 | E2, E3, E4 | có |
| T3 | Phiên gom gọi skill và thư mục skill tên mới; kiểm chéo đêm giải gói `dispatch`; bài kiểm theo cùng; `docs/setup.md` mục token | `scripts/tin-hieu/gom-cau-hinh.ts`, `scripts/tin-hieu/test/gom-{gia-co,lich}.test.ts`, `scripts/kiem-cheo/cau-hinh.mjs`, `scripts/kiem-cheo/test/dem.test.mjs`, `docs/setup.md` | `t127_scripts` · `kcs_don_vi` · `cc30_thu` ca AC-2, AC-5 | E2, E2b, E5, E5b | có |
| T4 | Tên lệnh cũ: bảy gói đợt đã đóng, tệp mẫu `lo-trinh-kit.html` (Hỏi-1), `CLAUDE.md` (Hỏi-2) | `docs/plan/dot-*/README.md` (7), `apps/agent/test/mau/lo-trinh-kit.html`, `CLAUDE.md` | `cc30_chuyen_kho` · `cc30_thu` ca AC-6 | E6, E6b | có |
| T5 | Thước của hồ sơ: `thu/chuyen-cho.test.mjs`, `rang/{kit,luat,ghim,chuyen-kho,doi-chung}.mjs`; bốn khoá `cc30_*` | `_acceptance/chuyen-cho-delivery-loop-3-0/**`, `_acceptance/config.yaml` | chiều xanh trên bản sửa, chiều đỏ trên nhánh chính (12/16 ca đỏ, 4 ca bất biến xanh) | mọi E | không (đọc vật của T1–T4) |
| T6 | Gộp `origin/onehub` vào nhánh; làn ghim lại khô `--tung-ho-so` của feature-loop 3.0.0 trên tip với ứng viên viết trước; đối chứng hồ sơ đỏ trên nhánh chính bằng kit cũ; sửa và ghim (`--write`) đúng hồ sơ đỏ vì vòng; điền mục «Ghim lại — kết quả» | `_acceptance/<hồ sơ ghim>/{run-log.jsonl,evidence-report.md}`, `contract.md` | `cc30_thu` ca AC-8 · `pre-merge-check.sh . --base origin/onehub` | E8 | không (sau T1–T5) |
| T7 | Vẽ lại bản đồ trong bản clone `--no-hardlinks`; `product-map.mjs --check`; `pre-merge-check.sh` không `--slug` | `PRODUCT-MAP.md`, `LO-TRINH.html` | `cc30_ban_do` · lưới trước-gộp | E9, E9b | không (cuối) |

Thứ tự: T1–T5 (một lượt, đã dựng) → T6 → T7 → S4 (`s4-args --diff-base origin/onehub`) → Cổng Bằng chứng → PR sẵn
sàng → lời gộp của chủ kho → gộp bằng commit gộp → `chuyen-kho.mjs` chế độ kiểm và `--phien` trên nhánh chính.
