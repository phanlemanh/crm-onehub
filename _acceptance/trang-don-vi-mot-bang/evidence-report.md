---
schema_version: 2
feature_slug: trang-don-vi-mot-bang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 76d76e899ea5f4ee76aa9ec3989e9482cc1fe067
human_signoff: manh 2026-10-17
---

# Evidence Report: trang-don-vi-mot-bang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-4 | script | PASS |
| E4 | AC-8 | script | PASS |
| E5 | AC-1 | script | PASS |
| E6 | AC-3 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-6 | test | PASS |
| E10 | AC-7 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | script | PASS |
| E13 | AC-11 | script | PASS |
| E14 | AC-12 | judgment | PASS |
| E15 | AC-13 | test | PASS |
| E16 | AC-14 | script | PASS |
| E17 | AC-7 | script | PASS |
| E18 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-trang-don-vi-mot-bang-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_chon_don_vi
  verified_at: 2026-10-17T19:18:47Z
  output: |
    KET LUAN dvb-chon-don-vi: hai chieu dung (2 dot bien, worktree tam)

- eval: E2
  run_id: minted-trang-don-vi-mot-bang-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dvb_man
  verified_at: 2026-10-17T19:18:47Z
  screenshot: evidence/E2-step1.png
  observed: |
    E2-step1 (danh sach 1440): trang «Muc tieu», tab «Theo don vi» dang chon, mot hang cong cu ngang: o chon «Phap che», nut «Danh sach», «Cay can chinh», «Hop tuan», chip loc nhanh «Tat ca 3 / Can ban 0 / Chua gop vao dau 1», ben phai «Loc», «Sap xep», «Cot (4)» — tat ca cung mot duong ngang (y~233). Bang 3 muc tieu (Hop dong mua Tet 75%, Kinh doanh tu tra loi 24%, Xu ly dut diem tranh chap 48%), chan bang «Truong An Khanh Linh · 3 muc tieu · 5 KR · Thuoc OneHub Center > Khoi Ho tro». Khong co the (card) don vi tren bang. Khop Expected.
    E2-step2 (danh sach 390): tieu de, nut Kara/Quy 4/«...», «Them muc tieu», tab, o chon Phap che, «Danh sach», «Loc» xep doc; bang muc tieu hien thanh the doc, khong thay thanh cuon ngang/cat ngang. Khop (khong tran).
    E2-step3 (mo KR 1440): muc tieu dau mo ra, hien 2 dong KR (KR1 Giu thoi gian duyet hop dong duoi 2 ngay 100%, KR2 Ty le hop dong dung mau chuan 49%), mui ten xoay xuong. Khop MO KR 2 dong.
    E2-step4 (mo KR 390): tuong tu, 2 KR hien trong khung 390, khong tran.
    E2-step5 (chon 1440): o chon mo dropdown, go «mien», hien 2 dong «Kinh doanh mien Bac / Kinh doanh mien Nam — Thuoc Khoi Kinh doanh · 2 muc tieu» (ten dau bi cat «Kinh d...» do cot hep, van co dong day du khop log). Khop.
    E2-step6 (chon 390): dropdown «mien» hien 2 dong day du «Kinh doanh mien Bac», «Kinh doanh mien Nam», khop.
    E2-step7 (deals 1440, doi chung): trang «Thoa thuan», hang cong cu (tim kiem, chip Tat ca 27/Dang mo 17/Da chot 10, «Bang», «Bang cot», «Loc», «Sap xep», «Cot (7)», «Da luu tru») cach tieu de cung khoang nhu trang don vi (script do 69px ca hai). Bang 12 dong, dang nhap quan tri dung.
    E2-step8 (deals 390): trang Thoa thuan o 390, khong tran ngang. Khop.
    Khong frame nao mau thuan Expected.
  network_observed: n-a (driver)

- eval: E3
  run_id: minted-trang-don-vi-mot-bang-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dvb_man
  verified_at: 2026-10-17T19:18:47Z
  output: |
    phien-do: xong

- eval: E4
  run_id: minted-trang-don-vi-mot-bang-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dvb_man
  verified_at: 2026-10-17T19:18:47Z
  output: |
    phien-do: xong

- eval: E5
  run_id: minted-trang-don-vi-mot-bang-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dvb_man
  verified_at: 2026-10-17T19:18:47Z
  output: |
    phien-do: xong

- eval: E6
  run_id: minted-trang-don-vi-mot-bang-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_dong_mo
  verified_at: 2026-10-17T19:18:47Z
  output: |
    KET LUAN dvb-dong-mo: hai chieu dung (1 dot bien, worktree tam)

- eval: E7
  run_id: minted-trang-don-vi-mot-bang-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_hang_cong_cu
  verified_at: 2026-10-17T19:18:47Z
  output: |
    KET LUAN dvb-hang-cong-cu: hai chieu dung (1 dot bien, worktree tam)

- eval: E8
  run_id: minted-trang-don-vi-mot-bang-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_loc_nhanh
  verified_at: 2026-10-17T19:18:47Z
  output: |
    KET LUAN dvb-loc-nhanh: hai chieu dung (2 dot bien, worktree tam)

- eval: E9
  run_id: minted-trang-don-vi-mot-bang-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_sap_xep
  verified_at: 2026-10-17T19:18:47Z
  output: |
    KET LUAN dvb-sap-xep: hai chieu dung (1 dot bien, worktree tam)

- eval: E10
  run_id: minted-trang-don-vi-mot-bang-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_chan_bang
  verified_at: 2026-10-17T19:18:47Z
  output: |
    KET LUAN dvb-chan-bang: hai chieu dung (1 dot bien, worktree tam)

- eval: E11
  run_id: minted-trang-don-vi-mot-bang-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_trang_thai
  verified_at: 2026-10-17T19:18:47Z
  output: |
    KET LUAN dvb-trang-thai: hai chieu dung (1 dot bien, worktree tam)

- eval: E12
  run_id: minted-trang-don-vi-mot-bang-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dvb_ho_so_da_ky
  verified_at: 2026-10-17T19:18:47Z
  output: |
    KET LUAN dvb-ho-so-da-ky: hai chieu dung (2 dot bien, worktree tam)

- eval: E13
  run_id: minted-trang-don-vi-mot-bang-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dvb_proto
  verified_at: 2026-10-17T19:18:47Z
  output: |
    KET LUAN dvb-proto: hai chieu dung (1 dot bien, worktree tam)

- eval: E15
  run_id: minted-trang-don-vi-mot-bang-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_giu_xem
  verified_at: 2026-10-17T19:18:47Z
  output: |
    KET LUAN dvb-giu-xem: hai chieu dung (2 dot bien, worktree tam)

- eval: E16
  run_id: minted-trang-don-vi-mot-bang-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dvb_ghim_nam
  verified_at: 2026-10-17T19:18:47Z
  output: |
    KET LUAN dvb-ghim-nam: hai chieu dung (4 dot bien, worktree tam)

- eval: E17
  run_id: minted-trang-don-vi-mot-bang-E17-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dvb_man
  verified_at: 2026-10-17T19:18:47Z
  output: |
    phien-do: xong

- eval: E18
  run_id: minted-trang-don-vi-mot-bang-E18-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_dong_mo_ui
  verified_at: 2026-10-17T19:18:47Z
  output: |
    KET LUAN dvb-dong-mo-ui: hai chieu dung (1 dot bien, worktree tam)

### Judgment

- eval: E14
  judged_by: judge-subagent (fresh context) — de xuat panel 3 lens, chua co chu ky nguoi
  verdict: PASS
  rationale: Ba lens deu cho PASS tren khung anh da luu (khuon bang giong Thoa thuan o 1440 va 390; dong KR thut duoi dung muc tieu, cung cot; hang cong cu Hop tuan giong Danh sach). Nguoi xac nhan o Cong 2.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

### Judge panel (đề xuất) — E14

- domain-correctness: PASS — (1) Cùng khuôn: ở 1440, don-vi-danh-sach có ô chọn «Pháp chế» (x108–396, y≈233) đúng chỗ ô tìm kiếm của deals (x108–364, y≈175). Cả hai cùng có một hàng công cụ, với tab lọc nhanh ở giữa và Lọc/Sắp xếp/Cột bên phải, rồi bảng bo viền, rồi chân bảng. Thứ tự «cách xem» và «tab» có đảo nhau nhưng không phải điều AC-12 đòi. Ở 390, ô chọn nằm ở chỗ ô tìm kiếm của deals-390, tiếp theo là «Lọc», bảng và chân bảng. (2) KR: ở don-vi-mo-kr-1440, mục tiêu «Hợp đồng mùa Tết…» có mũi tên đổi xuống và vạch nhấn bên trái. KR1 và KR2 nằm ngay dưới nó, thụt vào, có nhãn «KR1»/«KR2» và dùng cùng các cột tiến độ, tình trạng, phụ trách. Hai mục tiêu còn lại vẫn thu với mũi tên phải, nên KR thuộc mục tiêu nào đọc được mà không cần chữ hướng dẫn. Ở 390 cũng vậy. (3) Họp tuần: ở don-vi-hop-tuan-1440, ô chọn «Pháp chế» (x108–396) và nhóm Danh sách/Cây căn chỉnh/Họp tuần cùng y≈233, cùng x với ảnh Danh sách. Hàng công cụ chỉ có hai thứ đó, không có ô lọc nhanh, Lọc, Sắp xếp hay Cột, đúng bảng ST-dvb-hop-tuan.
- operational-feasibility: PASS — (1) Cùng khuôn bảng. Ở 1440, don-vi-danh-sach và deals đều có một hàng công cụ, rồi bảng, rồi chân bảng. Ô chọn «Pháp chế» (x108–396, y≈233) nằm đúng chỗ ô tìm kiếm của Thoả thuận (x108–364). Cách xem và ô lọc nhanh «Tất cả/Cần bàn/Chưa góp vào đâu» đứng cùng hàng như «Tất cả/Đang mở/Đã chốt/Bảng». «Lọc/Sắp xếp/Cột» nằm bên phải. Chân bảng «Trưởng… 3 mục tiêu · 5 KR · Thuộc…» nằm ở chỗ chân «27 thoả thuận…». Ở 390, ô chọn thay ô tìm kiếm và «Lọc» đứng dưới, như deals-390. (2) don-vi-mo-kr-1440: dòng cha «Hợp đồng mùa Tết…» có mũi tên xuống, thanh nhấn bên trái và tên thụt vào x=169. Ngay dưới là KR1 và KR2 (nhãn x≈177, tên x≈221) thụt sâu hơn và chung cột Tiến độ, Tình trạng, Phụ trách. Mục tiêu kế «Kinh doanh tự trả lời…» trở về lề x=161. Vì thế KR đọc được là dòng con của mục tiêu đầu, không cần chữ hướng dẫn; ở 390 cũng vậy. (3) don-vi-hop-tuan-1440: ô chọn «Pháp chế» và các nút cách xem đứng đúng toạ độ như ở Danh sách (x108–396, x404…, y220–248). Hàng công cụ chỉ còn ô chọn và cách xem, không có ô lọc nhanh, «Lọc», «Sắp xếp», «Cột», đúng AC-4/AC-12 và ST-dvb-hop-tuan.
- spec-alignment: PASS — Trang đơn vị dùng cùng khuôn với Thoả thuận: ô chọn «Pháp chế» đứng ở chỗ ô tìm kiếm (x≈108), một hàng công cụ gồm cách xem, lọc nhanh, Lọc/Sắp xếp/Cột, rồi bảng và chân bảng. Ở don-vi-mo-kr, KR1/KR2 thụt vào ngay dưới mục tiêu có mũi tên mở nên nhận ra là dòng con mà không cần chữ hướng dẫn. Ở don-vi-hop-tuan, ô chọn và cách xem đứng cùng chỗ như Danh sách và hàng công cụ chỉ có hai thứ đó, đúng AC-4/AC-12 và ST-dvb-hop-tuan.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-trang-don-vi-mot-bang-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-17T19:18:47Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-trang-don-vi-mot-bang-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-17T19:18:47Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-trang-don-vi-mot-bang-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-17T19:18:47Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-trang-don-vi-mot-bang-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-17T19:18:47Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-don-vi-mot-bang-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-17T19:18:47Z

- cmd: bun run lint:slop
  run_id: minted-trang-don-vi-mot-bang-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-17T19:18:47Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-don-vi-mot-bang-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-17T19:18:47Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Ghi chú: chín phát hiện ngoài hợp đồng của vòng này nằm ở review-findings.md để người quyết ở Gate 2; không chép vào báo cáo này.

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-trang-don-vi.dom.tsx -t dvb-chon-don-vi && cd "$(git rev-parse --show-toplevel)" && bun _acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs dvb-chon-don-vi: bo qua baseline: tep apps/app/test/okr-trang-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-trang-don-vi.dom.tsx -t dvb-dong-mo && cd "$(git rev-parse --show-toplevel)" && bun _acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs dvb-dong-mo: bo qua baseline: tep apps/app/test/okr-trang-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-trang-don-vi.dom.tsx -t dvb-hang-cong-cu && cd "$(git rev-parse --show-toplevel)" && bun _acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs dvb-hang-cong-cu: bo qua baseline: tep apps/app/test/okr-trang-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-trang-don-vi.dom.tsx -t dvb-loc-nhanh && cd "$(git rev-parse --show-toplevel)" && bun _acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs dvb-loc-nhanh: bo qua baseline: tep apps/app/test/okr-trang-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-trang-don-vi.dom.tsx -t dvb-sap-xep && cd "$(git rev-parse --show-toplevel)" && bun _acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs dvb-sap-xep: bo qua baseline: tep apps/app/test/okr-trang-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-trang-don-vi.dom.tsx -t dvb-chan-bang && cd "$(git rev-parse --show-toplevel)" && bun _acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs dvb-chan-bang: bo qua baseline: tep apps/app/test/okr-trang-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-trang-don-vi.dom.tsx -t dvb-trang-thai && cd "$(git rev-parse --show-toplevel)" && bun _acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs dvb-trang-thai: bo qua baseline: tep apps/app/test/okr-trang-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/trang-don-vi-mot-bang/rang/ho-so-da-ky.mjs && cd "$(git rev-parse --show-toplevel)" && bun _acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs dvb-ho-so-da-ky: bo qua baseline: tep _acceptance/trang-don-vi-mot-bang/rang/ho-so-da-ky.mjs co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/trang-don-vi-mot-bang/rang/proto-don-vi.mjs && cd apps/app && bun test test/proto-catalog.spec.ts && cd "$(git rev-parse --show-toplevel)" && bun _acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs dvb-proto: bo qua baseline: tep _acceptance/trang-don-vi-mot-bang/rang/proto-don-vi.mjs co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-trang-don-vi.dom.tsx -t dvb-giu-xem && cd "$(git rev-parse --show-toplevel)" && bun _acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs dvb-giu-xem: bo qua baseline: tep apps/app/test/okr-trang-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/trang-don-vi-mot-bang/rang/ghim-nam.mjs && bun _acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs dvb-ghim-nam: bo qua baseline: tep _acceptance/trang-don-vi-mot-bang/rang/ghim-nam.mjs co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/data-table-mo-rong.spec.tsx && cd "$(git rev-parse --show-toplevel)" && bun _acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs dvb-dong-mo-ui: bo qua baseline: tep packages/ui/test/data-table-mo-rong.spec.tsx co o cay dang kiem nhung chua co o merge-base 30d982d2297b837f307dece57bffddc7120e8f64 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E3, E4, E5, E12, E16, E17 failed trong run-log vòng 1 (sha 31bb9927). Returned to implementation.
Round 2: chạy lại trên sha 9cff76c5; không còn lệnh eval nào ghi mã lỗi trong run-log vòng 2.
Round 3: chạy lại trên cây verified_commit e9075efe117e3f98f37c5e26a78342813d4749d9; toàn bộ eval máy, bảy lệnh suite và khung ui-check E2 đều xanh; E14 judge đề xuất PASS, chờ người ở Cổng 2.

### Re-pin lần 1 — 2026-10-18, do DA4 du-an-gantt: code Dự án làm DH2 cũ (E14 thiếu paths); răng E12, E16 đổi gốc so sánh ở a662ae69c
run_id: repin-20261018T015456Z-96064
sha: 76d76e899ea5f4ee76aa9ec3989e9482cc1fe067 · suites: 7 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E2, E14 (E14 không khai paths) · AC không có chốt máy: AC-2, AC-12 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
