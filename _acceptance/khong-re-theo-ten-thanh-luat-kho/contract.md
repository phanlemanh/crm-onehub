---
schema_version: 1
feature: "Phép kiểm «không rẽ theo tên» chạy một lần như luật kho trong lint:slop; E17 của giai-doan-thoa-thuan đọc luật đó và thôi phủ cả app"
slug: khong-re-theo-ten-thanh-luat-kho
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [tooling]
status: approved
design_doc: docs/superpowers/specs/2026-10-15-khong-re-theo-ten-thanh-luat-kho-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-15T14:57:22Z
---

# Acceptance Contract: khong-re-theo-ten-thanh-luat-kho

## Context

Hàng F23 của `docs/plan/lo-trinh-okr.json` (đợt r2, dãy P7), câu giao «Phép kiểm «không rẽ theo tên» chạy một lần
như luật kho, không còn là eval phủ cả app làm mọi PR chạm app thành hồ sơ cũ». E17 của hồ sơ đã ký
`giai-doan-thoa-thuan` (AC-14) quét bảy id giai đoạn cũ và tên `GIAI_DOAN_GOC` trong mã sản phẩm, và khai `paths`
phủ `apps/api/src/**`, `apps/agent/agent/**`, `apps/app/{app,components,lib}/**`, `packages/db/src/**`. Kho bật
`risk_tiers.stale_scope: paths`, và lượt kiểm chéo đêm (`scripts/kiem-cheo/tap-cham.mjs`) chọn hồ sơ theo `paths`,
nên gần như mọi PR chạm app kéo hồ sơ 19 eval này vào làn ghim. Vòng này chuyển phép kiểm thành một luật oxlint
chạy trong `bun run lint:slop` — lệnh CI (`ci.yml`) và `pre-push` đã chạy mỗi PR — rồi để E17 đọc chính luật đó và
thu `paths` về đúng các tệp định nghĩa luật.

## Criteria

- AC-1: Given cấu hình `.oxlintrc.json` của kho, When `bun run lint:slop` chạy trên cây có một tệp trong bảy thư mục
  `apps/api/src`, `apps/agent/agent`, `apps/app/app`, `apps/app/components`, `apps/app/lib`, `packages/db/src`,
  `packages/telemetry/src` nhắc một id giai đoạn cũ hay tên `GIAI_DOAN_GOC`, Then lệnh thoát khác 0 với một chẩn
  đoán gọi tên tệp đó và từ bị nhắc — luật `onehub(khong-re-theo-ten-giai-doan)` cho bảy id, luật
  `onehub(khong-dung-giai-doan-goc)` cho tên `GIAI_DOAN_GOC`; danh sách id rút từ `GIAI_DOAN_GOC` bằng import, không
  viết tay.
- AC-2: Given các chỗ miễn của phép kiểm cũ — `packages/db/src/giai-doan.ts`, `apps/app/app/proto/**`, thư mục
  `generated`, và riêng tên `GIAI_DOAN_GOC` trong `packages/telemetry/src/allowlist.ts` — When các tệp đó nhắc từ
  cấm, Then luật không báo chúng; một id cũ (khác `GIAI_DOAN_GOC`) trong `allowlist.ts` vẫn bị báo; tệp ngoài bảy
  thư mục (ví dụ `apps/agent-okr`) không bị luật xét.
- AC-3: Given cây ở đỉnh nhánh, When chạy `bun run lint:slop`, Then thoát 0 — luật mới không làm đỏ mã đang có.
- AC-4: Given E17 của `giai-doan-thoa-thuan` (`config:executors.script.gdtt_khong_re_theo_ten`), When chạy, Then nó
  lấy kết luận từ chính luật kho (oxlint với cấu hình kho trên bảy thư mục, chỉ giữ chẩn đoán của hai luật), script
  không còn danh sách từ hay biểu thức riêng; thoát 0 ở đỉnh và in số tệp đã quét (dưới 50 thì «KHONG DO DUOC», mã
  2); luật bị tắt cục bộ — bỏ một thư mục khỏi cấu hình, một mục `overrides` tắt luật ngoài chỗ miễn đã khai, một tệp
  cấu hình oxlint lồng, một chỉ thị `oxlint-disable`/`eslint-disable` trong bảy thư mục — thì E17 không xanh mà in
  «KHONG DO DUOC» mã 2 gọi tên chỗ tắt; trên bản sao chèn `stage === "CLOSED_WON"` hay một export `GIAI_DOAN_GOC` vào
  `apps/api/src/dashboard/dashboard.service.ts` thì thoát 1 với dòng `HONG <tệp>:<dòng>: <từ>`.
- AC-5: Given `evals.yaml` của `giai-doan-thoa-thuan` sau vòng, When bộ chọn của lượt kiểm chéo đêm (`tapCham`) và bộ
  lọc hoá cũ theo `paths` của lưới trước-gộp nhận một diff chỉ chạm tệp sản phẩm nằm ngoài `paths` của mọi eval khác
  của hồ sơ, Then hồ sơ không bị chọn, trong khi bản `evals.yaml` ở mốc nền với cùng diff thì bị chọn; diff chạm tệp
  luật, `.oxlintrc.json` hay `packages/db/src/giai-doan.ts` vẫn chọn hồ sơ; tệp mồi của phép đo nằm ngoài `paths`
  của mọi eval khác của hồ sơ (không thì «KHONG DO DUOC»).
- AC-6: Given hồ sơ `giai-doan-thoa-thuan`, When đọc dòng ghim mới nhất trong `run-log.jsonl` của nó, Then đó là dòng
  `repin` mọi suite và eval đạt kỳ vọng (E17 = 0), `sha` bằng `verified_commit` của báo cáo, không cũ hơn commit
  cuối sửa tệp của hồ sơ, và `recheck-evidence` của kit xanh.
- AC-7: Given các commit của vòng này (không phải commit gộp, mang slug trong tiêu đề), When so từng commit với cha
  của nó, Then hợp các tệp đổi nằm trong danh sách khai ở thiết kế; trong `evals.yaml` của `giai-doan-thoa-thuan`
  chỉ khối E17 đổi và chỉ ở `paths` và `expected`; `_acceptance/config.yaml` chỉ thêm khoá; không hồ sơ đã ký nào
  khác bị chạm; và kết quả không đổi khi cây có thêm một commit không thuộc vòng.

## Coverage

- Trục A — chỗ của token: một trong bảy thư mục · chỗ miễn (tệp khai báo, bản mẫu, `generated`) · danh sách cho
  phép (`allowlist.ts`) · ngoài bảy thư mục. Thước CE: hằng `THU_MUC`, `TRU`, `CHO_PHEP` của
  `_acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs` ở mốc nền [SUY-TỪ-REPO:
  _acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs].
- Trục B — từ: bảy id của `GIAI_DOAN_GOC` · tên `GIAI_DOAN_GOC`. Thước CE: `packages/db/src/giai-doan.ts`
  [SUY-TỪ-REPO: packages/db/src/giai-doan.ts].
- Trục C — người đọc luật: `lint:slop` (CI, `pre-push`) · E17 · bộ chọn kiểm chéo đêm · bộ lọc hoá cũ của lưới
  trước-gộp. Thước CE: `.github/workflows/ci.yml`, `.githooks/pre-push`, `scripts/kiem-cheo/tap-cham.mjs`,
  `risk_tiers.stale_scope` [SUY-TỪ-REPO: scripts/kiem-cheo/tap-cham.mjs].
- Core: A × B qua `lint:slop` (AC-1, AC-2, AC-3), C2 (AC-4), C3–C4 (AC-5), ghim (AC-6), phạm vi (AC-7).
  Later: mở rộng sang `apps/agent-okr` hay thư mục khác — đổi phạm vi đã ký của AC-14. Never: kiểm theo cây cú
  pháp thay cho quét chữ — hẹp hơn AC-14 đã ký (bỏ sót chú thích, chuỗi trong JSX).

## Đường đo

Ô cơ hội của hàng không khai ngưỡng nghiệm thu (mục «Ngưỡng chết / ngưỡng UAT» còn trống), nên không có thước
sau-gộp. Vòng ship thẳng sau ghim.

## Out of scope

- Mở rộng phạm vi quét ra ngoài bảy thư mục của phép kiểm cũ.
- Thu `paths` của eval khác (E2–E19 trừ E17) hay của hồ sơ khác.
- Đưa luật vào plugin `anti-slop` của hãng (`tools/oxlint/anti-slop`).
- Đổi `ci.yml`, `pre-push` hay lệnh `lint:slop`.
- Chặn chỉ thị tắt luật và cấu hình lồng ngay ở mỗi PR: `lint:slop` tôn trọng chỉ thị `oxlint-disable` và cấu hình
  lồng. E17 soát chúng ở lượt chấm lại hồ sơ, và luật kho «không viết chú thích» (`AGENTS.md`) đã cấm chỉ thị trong
  mã sản phẩm.
