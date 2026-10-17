---
schema_version: 2
feature_slug: trang-don-vi-mot-bang
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9cff76c580a66cad4ffb272d54c27efa03fb381e
human_signoff:
---

# Evidence Report: trang-don-vi-mot-bang

Lý do REJECT (round 2): 17 eval máy đều chạy xong với kết quả đạt và hội đồng đề xuất đạt cho E14, nhưng bước phân loại phạm vi xác nhận một finding TRONG hợp đồng, mức high, gắn AC-14 (phép đo của E16 miễn đếm dòng kiểm bị xoá chỉ nhờ một chú thích `// AC-14 …`). Finding đó nằm trong `review-findings.md`, mục «Trong hợp đồng». Không có eval nào hỏng nên `failed_evals` rỗng. Lệnh hỏng không gắn eval: không có.

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
| E14 | AC-12 | judgment | PASS (hội đồng đề xuất, chờ người) |
| E15 | AC-13 | test | PASS |
| E16 | AC-14 | script | PASS |
| E17 | AC-7 | script | PASS |
| E18 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-trang-don-vi-mot-bang-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_chon_don_vi
  verified_at: 2026-10-17T18:44:49Z
  output: |
    KET LUAN dvb-chon-don-vi: hai chieu dung (2 dot bien, worktree tam)

- eval: E2
  run_id: minted-trang-don-vi-mot-bang-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dvb_man
  verified_at: 2026-10-17T18:44:49Z
  screenshot: evidence/E2-step1.png
  observed: |
    Da mo bang Read tung anh (tat ca dang nhap quan tri, bo OKR mau «Quy 4 · mau», phong ban «Pháp chế» co 3 muc tieu).
    - don-vi-danh-sach-1440: trang «Mục tiêu», tab «Theo đơn vị». MOT hang cong cu duy nhat: o chon «Pháp chế», cach xem «Danh sách / Cây cân chỉnh / Họp tuần», o loc nhanh «Tất cả 3 / Cần bàn 0 / Chưa góp vào đâu 1», ben phai «Lọc», «Sắp xếp», «Cột (4)» — cung hang ngang. Duoi la MOT bang (3 dong muc tieu, cot Tiến độ/Tình trạng/Phụ trách), chan «Trưởng An Khánh Linh · 3 mục tiêu · 5 KR». Khong co the (card) don vi nao tren bang.
    - don-vi-mo-kr-1440: dong muc tieu dau mo (mui ten xuong), hien 2 dong KR (KR1, KR2) voi tien do 100% / 49%. Hang cong cu van mot hang.
    - don-vi-chon-1440: o chon mo dropdown, go «mien» -> hai ket qua «Kinh doanh miền Bắc», «Kinh doanh miền Nam» (Thuộc Khối Kinh doanh · 2 mục tiêu); hang cong cu nguyen ven.
    - don-vi-danh-sach-390 / mo-kr-390 / chon-390: bo cuc xep doc, cac dieu khien (o chon, cach xem, Lọc) xep cot, bang muc tieu dang the doc; khong thay thanh cuon ngang, khong cat noi dung ngang; KR mo ra 2 dong; dropdown hien hai ket qua «mien» dung.
    - deals-1440: trang «Thoả thuận» (doi chung): tieu de + mo ta, hang cong cu mot hang (tim kiem, Tất cả 27/Đang mở/Đã chốt, Bảng/Bảng cột, Lọc, Sắp xếp, Cột, Đã lưu trữ), bang day du; khoang tu tieu de toi day thanh cong cu khop voi trang don vi (cung bo do 69px).
    - deals-390: trang Thoả thuận tren mobile, o tim kiem + Lọc, bang cuon trong khung, khong tran trang.
    Tat ca khop Expected; khong co anh mau thuan assertion.
  network_observed: n-a (driver)
  output: |
    Frames da luu trong _acceptance/trang-don-vi-mot-bang/evidence/: E2-step1.png (don-vi-danh-sach-1440), E2-step2.png (don-vi-danh-sach-390), E2-step3.png (don-vi-mo-kr-1440), E2-step4.png (don-vi-mo-kr-390), E2-step5.png (don-vi-chon-1440), E2-step6.png (don-vi-chon-390), E2-step7.png (deals-1440), E2-step8.png (deals-390).
    Chieu do (DVB_PHA=the-don-vi) KHONG duoc chay vi steps chi yeu cau chay 1 lan thuong.
    Network: driver la script (khong doc duoc network) -> n-a (driver); khong ghi E2-network.txt.

- eval: E3
  run_id: minted-trang-don-vi-mot-bang-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dvb_man
  verified_at: 2026-10-17T18:44:49Z
  output: |
    phien-do: xong — mã 0

- eval: E4
  run_id: minted-trang-don-vi-mot-bang-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dvb_man
  verified_at: 2026-10-17T18:44:49Z
  output: |
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-trang-don-vi-mot-bang-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dvb_man
  verified_at: 2026-10-17T18:44:49Z
  output: |
    phien-do: xong — mã 0

- eval: E6
  run_id: minted-trang-don-vi-mot-bang-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_dong_mo
  verified_at: 2026-10-17T18:44:49Z
  output: |
    KET LUAN dvb-dong-mo: hai chieu dung (1 dot bien, worktree tam)

- eval: E7
  run_id: minted-trang-don-vi-mot-bang-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_hang_cong_cu
  verified_at: 2026-10-17T18:44:49Z
  output: |
    KET LUAN dvb-hang-cong-cu: hai chieu dung (1 dot bien, worktree tam)

- eval: E8
  run_id: minted-trang-don-vi-mot-bang-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_loc_nhanh
  verified_at: 2026-10-17T18:44:49Z
  output: |
    KET LUAN dvb-loc-nhanh: hai chieu dung (2 dot bien, worktree tam)

- eval: E9
  run_id: minted-trang-don-vi-mot-bang-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_sap_xep
  verified_at: 2026-10-17T18:44:49Z
  output: |
    KET LUAN dvb-sap-xep: hai chieu dung (1 dot bien, worktree tam)

- eval: E10
  run_id: minted-trang-don-vi-mot-bang-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_chan_bang
  verified_at: 2026-10-17T18:44:49Z
  output: |
    KET LUAN dvb-chan-bang: hai chieu dung (1 dot bien, worktree tam)

- eval: E11
  run_id: minted-trang-don-vi-mot-bang-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_trang_thai
  verified_at: 2026-10-17T18:44:49Z
  output: |
    KET LUAN dvb-trang-thai: hai chieu dung (1 dot bien, worktree tam)

- eval: E12
  run_id: minted-trang-don-vi-mot-bang-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dvb_ho_so_da_ky
  verified_at: 2026-10-17T18:44:49Z
  output: |
    KET LUAN dvb-ho-so-da-ky: hai chieu dung (2 dot bien, worktree tam)

- eval: E13
  run_id: minted-trang-don-vi-mot-bang-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dvb_proto
  verified_at: 2026-10-17T18:44:49Z
  output: |
    KET LUAN dvb-proto: hai chieu dung (1 dot bien, worktree tam)

- eval: E14
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Hội đồng ba góc nhìn đều đề xuất đạt; chi tiết từng phiếu ở mục «Judge panel E14» bên dưới. Đây chỉ là đề xuất, người quyết ở Cổng 2.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

- eval: E15
  run_id: minted-trang-don-vi-mot-bang-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_giu_xem
  verified_at: 2026-10-17T18:44:49Z
  output: |
    KET LUAN dvb-giu-xem: hai chieu dung (2 dot bien, worktree tam)

- eval: E16
  run_id: minted-trang-don-vi-mot-bang-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dvb_ghim_nam
  verified_at: 2026-10-17T18:44:49Z
  output: |
    KET LUAN dvb-ghim-nam: hai chieu dung (2 dot bien, worktree tam)

- eval: E17
  run_id: minted-trang-don-vi-mot-bang-E17-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dvb_man
  verified_at: 2026-10-17T18:44:49Z
  output: |
    phien-do: xong — mã 0

- eval: E18
  run_id: minted-trang-don-vi-mot-bang-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dvb_dong_mo_ui
  verified_at: 2026-10-17T18:44:49Z
  output: |
    KET LUAN dvb-dong-mo-ui: hai chieu dung (1 dot bien, worktree tam)

### Judge panel E14 (đề xuất, chờ người; human_override để trống)

Đề xuất tổng: PASS. Ba góc nhìn, mọi phiếu hiển thị đầy đủ:

- domain-correctness: PASS — Ba ý đều đạt trên ảnh 1440 px, và ảnh 390 px khớp ở chỗ đã chụp. (1) Khuôn bảng giống Thoả thuận: ô chọn «Pháp chế» (x 108–396, y≈233) đứng đúng chỗ ô tìm kiếm của deals (x 108–364, y≈175), kế đó là nhóm nút/tab, «Lọc · Sắp xếp · Cột» bên phải, một bảng viền bo, rồi chân bảng («Trưởng … · 3 mục tiêu · 5 KR · Thuộc …» so với «27 thoả thuận · …»). Ở 390 px thì ô chọn, tiếp theo là «Lọc», giống ô tìm kiếm rồi «Lọc» của deals-390. (2) Ở don-vi-mo-kr, mục tiêu đang mở có mũi tên xuống, vạch sáng bên trái và hai dòng KR1/KR2 thụt vào ngay dưới, nằm trước mục tiêu kế tiếp có mũi tên phải, nên đọc ra KR thuộc «Hợp đồng mùa Tết…» mà không cần chữ hướng dẫn; 390 px cũng vậy. (3) Ở don-vi-hop-tuan, hàng công cụ chỉ có ô chọn «Pháp chế» (x 108–396, y 220–248) và ba nút cách xem, cùng tọa độ như Danh sách; tab lọc nhanh, «Lọc», «Sắp xếp», «Cột» không còn, đúng AC-4/AC-12 và ST-dvb-hop-tuan.
- operational-feasibility: PASS — (1) Cùng khuôn bảng với Thoả thuận: ô chọn «Pháp chế» ở x≈108–396, y≈233, đúng chỗ ô tìm kiếm của deals-1440 (x≈108, y≈176). Cả hai có một hàng công cụ duy nhất (chọn/tìm, cách xem hoặc tab, ô lọc nhanh bên trái, «Lọc», «Sắp xếp», «Cột» bên phải), rồi khung bảng, rồi chân bảng («Trưởng … · 3 mục tiêu · 5 KR · Thuộc …» so với «27 thoả thuận · …»). (2) Ở don-vi-mo-kr, mục tiêu đầu có chevron xoay xuống (x≈139, y≈337) và vạch nhấn bên trái. Hai dòng KR1 và KR2 nằm ngay dưới, thụt vào cùng các cột Tiến độ, Tình trạng, Phụ trách, và dòng mục tiêu kế tiếp bắt đầu sau chúng, nên nhìn là thấy KR thuộc «Hợp đồng mùa Tết…» mà không cần chữ hướng dẫn. (3) Ở don-vi-hop-tuan-1440, ô chọn «Pháp chế» và ba nút cách xem nằm đúng vị trí như ở Danh sách (cùng y≈233, cùng x≈108 và 404/493/602). Hàng công cụ chỉ có hai thứ đó, không có ô lọc nhanh, «Lọc», «Sắp xếp», «Cột», khớp với ST-dvb-hop-tuan.
- spec-alignment: PASS — Ba ý đều thấy được trong ảnh 1440. (1) Trang đơn vị dùng cùng khuôn với Thoả thuận: ô chọn «Pháp chế» ở chỗ ô tìm kiếm (x108–396), một hàng công cụ gồm cách xem, ô lọc nhanh, Lọc, Sắp xếp, Cột, rồi bảng, rồi chân bảng. (2) Ở don-vi-mo-kr, KR1 và KR2 là dòng thụt vào ngay dưới mục tiêu «Hợp đồng mùa Tết…», dưới mục tiêu có mũi tên chỉ xuống và vạch trắng bên trái; hai mục tiêu còn lại vẫn thu với mũi tên chỉ phải, nên không cần chữ hướng dẫn. (3) Ở don-vi-hop-tuan, ô chọn và cách xem nằm cùng toạ độ như Danh sách (y≈233, ô chọn x108, ba nút ở x404/493/602), và hàng công cụ chỉ có hai thứ đó.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-trang-don-vi-mot-bang-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-17T18:44:49Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-trang-don-vi-mot-bang-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-17T18:44:49Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-trang-don-vi-mot-bang-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-17T18:44:49Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-trang-don-vi-mot-bang-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-17T18:44:49Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-don-vi-mot-bang-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-17T18:44:49Z

- cmd: bun run lint:slop
  run_id: minted-trang-don-vi-mot-bang-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-17T18:44:49Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-don-vi-mot-bang-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-17T18:44:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — danh sách eval KHÔNG-PHÂN-BIỆT rỗng (không eval nào xanh trên cả HEAD lẫn baseline). E3, E4, E5, E17 đỏ trên baseline (có phân biệt); các eval máy còn lại không đo được baseline (xem dưới).

Ghi chú về phép đo của E2: chiều đỏ DVB_PHA=the-don-vi không được chạy vì các bước của eval chỉ yêu cầu chạy một lần thường. E2 mang baseline n-a và không nằm trong danh sách lệnh baseline do máy cung cấp, nên máy không nêu lý do riêng cho E2.

Ghi chú về E16: eval đạt, nhưng finding trong hợp đồng AC-14 (xem `review-findings.md`) chỉ ra phép đo của nó miễn đếm dòng kiểm bị xoá chỉ nhờ một chú thích khai tại chỗ, và vế đếm dòng xoá không có đột biến phá nó. Đó là lý do verdict là REJECT dù `failed_evals` rỗng.

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

Round 1: lịch sử chi tiết của round 1 không có trong dữ liệu round này; finding t7 ghi rằng ở lượt 1 phép đo AC-14 từng đỏ với «soan-okr-trong-khung xoa 21 dong ngoai dau cu khong khai» và màu đỏ đó đã tắt bằng cách thêm chú thích. Returned to implementation.
Round 2: 17 eval máy đạt, E14 hội đồng đề xuất PASS (chờ người); nhưng 1 finding trong hợp đồng AC-14 (mức high, phép đo E16 miễn đếm dòng kiểm bị xoá nhờ chú thích) được xác nhận. REJECT; chi tiết ở review-findings.md.
