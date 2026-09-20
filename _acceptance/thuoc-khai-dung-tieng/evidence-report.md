---
schema_version: 2
feature_slug: thuoc-khai-dung-tieng
verdict: BLOCKED
failed_evals: [E3, E10, E12a, E13]
reason: "KS_NHOM=vua bun _acceptance/thuoc-khai-dung-tieng/rang/khai-sinh-phu-vong-nay.mjs — Bi cong cu giet o 600 giay (10 phut). Script dang tao ban sao CSDL va thiet lap 27 ban csdl test truoc khi chay 5/24 nhom dot bien (nhom vua). Output cat truoc khi co ket qua cuoi cung. Ben canh do con 4 eval do that (E3, E10, E12a, E13) — xem bang va Evidence duoi day."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6064ca6976230c19390bc39a96d595099a224112
human_signoff:
---

# Evidence Report: thuoc-khai-dung-tieng (round 1)

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | FAIL |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | script | FAIL |
| E11 | AC-10 | judgment | PASS (đề xuất panel, chờ human_override ở Gate 2) |
| E12a | AC-11 | script | FAIL |
| E12b | AC-11 | script | CANNOT-RUN (tool-kill ở 600 giây) |
| E12c | AC-11 | script | PASS |
| E12d | AC-11 | script | PASS |
| E13 | AC-12 | script | FAIL |
| E14 | AC-13 | script | PASS |
| E15 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-thuoc-khai-dung-tieng-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tk_ghim_phan_biet
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    phan biet duoc E9   "tieng-viet-lot"
    phan biet duoc E12  "MAN DANH SACH"
    ket qua: 0 chuoi ghim KHONG phan biet duoc tren 14

- eval: E2
  run_id: minted-thuoc-khai-dung-tieng-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tk_khai_sinh_dung_ghim
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    (2) no bao "ghim vang o luot lanh: KHONG":         co
    (3) no cham E1 la KHONG DAT:                     co
    ket qua: dat

- eval: E3
  run_id: minted-thuoc-khai-dung-tieng-E3-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tk_cong_chan_duoc
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    them cho thu muoi -> `bun run test` DO (ma 1), va goi ten apps/app/components/crm/deal-stage.tsx (24.0 giay)
    tra ban goc      -> `bun run test` xanh (45.5 giay)
    [cay-bi-cham] `git status --porcelain` cua cay dang xet da doi sau luot chay
    ket qua: 1 cho hong

- eval: E4
  run_id: minted-thuoc-khai-dung-tieng-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tk_hai_ho_so
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    xanh chu-cung
    xanh mau-ban-kinh
    ket qua: 0 cho hong

- eval: E5
  run_id: minted-thuoc-khai-dung-tieng-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tk_khong_de_lai_vet
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    vat thu mang moc doclmu9au0th: da don sach
    ket qua: 0 ban ghi that con lech tren 27

- eval: E6
  run_id: minted-thuoc-khai-dung-tieng-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tk_xoa_co_kiem
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    (c) thu muc thuong, khong tien to bi chan boi [luat-2-tien-to], va vat con nguyen
    (d) MANG tien to, khong worktree  bi chan boi [luat-3-khong-phai-worktree], va vat con nguyen
    ket qua: 0 duong hong tren 4

- eval: E7
  run_id: minted-thuoc-khai-dung-tieng-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tk_ban_khai_khop
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    co khoa    tieng-trang.tieng_viet_lot
    co khoa    ho-so-trong.tieng_viet_lot
    ket qua: 0 cho ban khai lech ban that

- eval: E8
  run_id: minted-thuoc-khai-dung-tieng-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tk_bai_kiem_dung_nha_quet
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    nam trong chuong trinh packages/ui/test/khai-tieng.spec.tsx (tsc doc 1346 tep)
    nam trong chuong trinh apps/app/test/khai-thieng-metaline.spec.tsx (tsc doc 3825 tep)
    ket qua: 0 cho hong (ve a: nhap nguoc chieu tren 224 tep · ve b: 2 bai kiem)

- eval: E9
  run_id: minted-thuoc-khai-dung-tieng-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tk_bai_kiem_dung_nha
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    Tasks:    13 successful, 13 total
    Cached:    13 cached, 13 total
    Time:    62ms >>> FULL TURBO

- eval: E10
  run_id: minted-thuoc-khai-dung-tieng-E10-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tk_ho_so_cu_van_xanh
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    xanh gioi-thieu
    xanh tom-tat-lien-he
    xanh nganh
    xanh dong-thoi-gian
    xanh khong-khai-thua
    xanh ho-so-trong
    xanh tieng-trang
    xanh mot-duong
    DO   [ho-so-cu-do:hoi-quy-nam-cho] ma thoat 1
    bang chung: 0 cho lech tren 8 muc
    diff 57 tep, giao voi 11 tep san pham: RONG
    ket qua: 1 cho hong

- eval: E11
  judged_by: judge panel (fresh context) — 3 lens: domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS (đề xuất panel — chờ human_override ở Gate 2)
  rationale: Cả ba lens đều đề xuất PASS sau khi đối chiếu bảng 13 cách nói dối (A–M, design doc) với contract, evidence và mã nguồn thật; xem votes bên dưới cho lý do từng góc nhìn. Verdict tổng của round này vẫn là BLOCKED vì E12b chưa chạy xong và bốn eval máy khác đỏ thật — human ở Gate 2 quyết định độc lập với các eval máy đó.
  votes:
    - domain-correctness: PASS — Đối chiếu bảng 13 cách (A–M, design doc) với contract + evidence + 3 rang script đọc trực tiếp: 7 cách chưa vá trước vòng này (B,H,I,J,K,L,M) đều có phép đo QUAN HỆ thật, xác nhận được tận nguồn — B qua E1(ghim-phan-biet, "0/14 chuỗi ghim không phân biệt được")+E2(khai-sinh-dung-ghim, xác nhận pha-thu.mjs DÙNG kết quả vắng-ở-lành chứ không "đếm rồi vứt", khớp đúng đoạn `vangOLuotLanh`/`ket.vang` tôi đọc thấy trong pha-thu.mjs); H qua E3(cong-chan-duoc, thêm chỗ khai thứ 10 rồi khẳng định `bun run test` đỏ, gọi tên deal-stage.tsx)+E4(hai-ho-so, xác nhận gate-shape.json đã đổi `rang` thành mảng và rang-chat.spec.ts lặp qua từng khối — khớp đúng gate-shape.json/rang-chat.spec.ts tôi đọc); M qua E7(b) cộng cơ chế `ghiVung()` trong khai-tieng-ho-so.mjs tự NÉM lỗi nếu thiếu khoá `tieng_viet_lot` ở bất kỳ mục nào (đọc thấy trực tiếp trong mã); I/J/K/L qua E8/E5/E6/E7(a) với số liệu đặt tên cụ thể (224 tệp, 28 bản ghi, 4 đường, 21 hình dạng) khớp đúng nội dung AC-8/AC-5/AC-6/AC-7. Sáu cách đã vá cũ (A,C,D,F,G,chốt-ghim-cũ) chỉ được E14 bắt bằng "dấu hiệu cấu trúc" (chuỗi con còn trong tệp) — không phải quan hệ thật — và điều này được khai TƯỜNG MINH, không im lặng, trong Known limits ("sáu-bệnh-chỉ-đo-bằng-dấu-hiệu"), đúng yêu cầu AC-10. Riêng E là ngoại lệ trong nhóm sáu, được E14 đo bằng QUAN HỆ thật (bản lành đỏ/bản khôi phục bệnh xanh). Riêng C được khai là giới hạn THẬT (không phép đo nào trong kho phân biệt được so DOM với máy chủ và so DOM với hằng gõ sẵn) — cũng được nêu tên tường minh, không im lặng. Không cách nào trong 13 cách thiếu cả phép đo lẫn mục Known limits, nên tiêu chí AC-10 ("cách nào không có phép đo nào bắt thì phải có tên trong Known limits") được thoả trên toàn bộ 13 dòng.
    - operational-feasibility: PASS — Đối chiếu bảng 13 cách nói dối (A–M) trong design doc với đầu ra dau-ra-mot-luot.txt và contract: mỗi chữ cái có một khối E-eval gọi tên trực tiếp bằng chính ngôn ngữ mô tả lỗi đó — B→E1/E2 (chuỗi ghim vắng ở lượt lành), H→E3/E4 (thêm chỗ thứ mười, bun run test đỏ), I→E8 (tsconfig include:["src"]), J→E5 (mượn bản ghi thật không try/finally), K→E6 (bốn đường vào dungCaySao/rmSync), L,M→E7 (hai vế bản khai khớp bản thật), và A,C,D,E,F,G,chốt-ghim-cũ→E14 (liệt kê từng dấu hiệu, riêng E là quan hệ thật). Cách duy nhất không có phép đo nào thực sự bắt được (chỉ có dấu hiệu cấu trúc yếu, không phân biệt được quan hệ thật) là C, và mục Known limits của contract đã nêu tên nó tường minh kèm lý do — đúng yêu cầu AC-10/AC-13 là không im lặng. Một người chỉ với đúng các tệp trong danh sách Input đã tái dựng được toàn bộ ánh xạ này mà không cần evals.yaml hay review-findings.md, nên xét theo lăng kính khả thi vận hành, bài tập AC-10 đòi hỏi là làm được.
    - spec-alignment: PASS — Cả 13 cách (A–M) trong bảng design doc đều lần ra được một AC/eval cụ thể bắt nó — 6 cách cũ (A,D,E,F,G,chốt-ghim-cũ) qua AC-13 (một trong đó, E, bằng quan hệ thật, năm còn lại bằng dấu hiệu cấu trúc), 7 cách mới (B,H,I,J,K,L,M) qua AC-1/2, AC-3/4, AC-5, AC-6, AC-7, AC-8 — toàn bộ đều là phép đo quan hệ thật, và tôi xác minh trực tiếp được cơ chế của A,B,C,D,E,F,G,H trong ba tệp mã (pha-thu.mjs, khai-tieng-ho-so.mjs, mot-duong.mjs) cộng gate-shape.json/rang-chat.spec.ts. Cách duy nhất không có phép đo bắt bằng quan hệ thật (C — hằng gõ sẵn so với giá trị máy chủ) được gọi tên tường minh, kèm lý do "giới hạn thật", trong mục `## Known limits` của contract.md, đúng yêu cầu AC-10 (không im lặng).
  human_override:

- eval: E12a
  run_id: minted-thuoc-khai-dung-tieng-E12a-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tk_khai_sinh_nhanh
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    dat  E14-E ma 1 · ghim CO · vang o luot lanh co
    dat  E14-F ma 1 · ghim CO · vang o luot lanh co
    dat  E14-G ma 1 · ghim CO · vang o luot lanh co
    dat  E14-chot-ghim-cu ma 1 · ghim CO · vang o luot lanh co
    dat  E15  ma 1 · ghim CO · vang o luot lanh co
    ket qua: 2 phep pha KHONG do duoc tren 17 (nhom nhanh; ca bang 24)

- eval: E12b
  run_id: minted-thuoc-khai-dung-tieng-E12b-r1
  exit_code: 1
  baseline: red
  cannot_run: true
  verifier: config:executors.script.tk_khai_sinh_vua
  verified_at: 2026-09-20T10:00:00+07:00
  reason: Bi cong cu giet o 600 giay (10 phut). Script dang tao ban sao CSDL va thiet lap 27 ban csdl test truoc khi chay 5/24 nhom dot bien (nhom vua). Output cat truoc khi co ket qua cuoi cung.
  output: |
    -- Thuoc cua thuoc khong duoc mien luat cua thuoc (AC-11).
    -- Phu do bang ANH XA TUNG EVAL, khong bang so tong. So tong 13=13 van dat
    -- 17 eval may, moi eval co it nhat mot dot bien:
    -- NHOM CHAY: vua — 5/24 dot bien.
       Tach nhom vi cong cu cham cat lenh o 600 giay, ma tron bo mat ~30 phut.
       Phep kiem ANH XA o tren van doc bang DAY DU, khong doc bang da loc —
    -- CHUP CSDL TRUOC: 27 thoa thuan. Mot phep pha o day co CHU DICH
       vo hieu hoa phep tra lai (E5), nen chinh bo khai sinh phai tra CSDL ve
    -- BAN SAO: /Users/manh-macmini/dev/crm/.claude/worktrees/.pha-thu-khai-tieng-88303
    -- MAY CHU CUA BAN SAO: http://localhost:57796 · http://localhost:57797

- eval: E12c
  run_id: minted-thuoc-khai-dung-tieng-E12c-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tk_khai_sinh_cham
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    -- nhom cham: 1 phep pha:
       dat  E2   ma 1 · ghim CO · vang o luot lanh co
    ket qua: 0 phep pha KHONG do duoc tren 1 (nhom cham; ca bang 24)

- eval: E12d
  run_id: minted-thuoc-khai-dung-tieng-E12d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tk_khai_sinh_dat
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    -- nhom dat: 1 phep pha:
       dat  E3   ma 1 · ghim CO · vang o luot lanh co
    ket qua: 0 phep pha KHONG do duoc tren 1 (nhom dat; ca bang 24)

- eval: E13
  run_id: minted-thuoc-khai-dung-tieng-E13-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tk_ghim_lai_da_xong
  verified_at: 2026-09-20T10:00:00+07:00
  reason: "Verification failed: evidence became stale because .githooks/gate-shape.json was modified after the evidence was signed. The nen-chat-ai-elements evidence must be regenerated using the repin-lane.mjs script."
  output: |
    -- Ho so nen-chat-ai-elements da ky, va vong nay sua .githooks/gate-shape.json —
       mot tep nam trong paths eval cua no. Bang chung da ky cua no vi the HOA CU.
    -- verified_commit hien tai: a008db1b22266291c9dc7177892e93494926aabd
    -- 14 duong trong paths eval, doc TU _acceptance/nen-chat-ai-elements/evals.yaml.
    -- Tung duong, kem bam truoc/sau:
       HOA CU [bang-chung-hoa-cu:**] 1773 tep · 229 -> 1773 tep · dd9
    con tuoi _acceptance/nen-chat-ai-elements/rang/** 6 tep · d13703
       con tuoi apps/** 801 tep · 2d59
    Cach sua KHONG phai sua tay evidence-report: chay nghi thuc ghim lai
       (repin-lane.mjs) de mot lan chay bang MAY chong lung cho bam moi.
    ket qua: 1 duong hoa cu tren 14

- eval: E14
  run_id: minted-thuoc-khai-dung-tieng-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tk_bay_benh_cu_khong_quay_lai
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    chot-ghim-cu: Khoi phuc = dat chuoi ghim ve ten chan. Cho bat la ghim-phan-biet, ma no mo trinh duyet cho bay chan ui-check — vai phut va can may chu dev.
    ket qua: 0 cho hong (7 benh · 1 do quan he · 6 khai gioi han)

- eval: E15
  run_id: minted-thuoc-khai-dung-tieng-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tk_chung_spec
  verified_at: 2026-09-20T10:00:00+07:00
  output: |
    chung.mjs: 10 khang dinh dat

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mu9atww1dwe6
  exit_code: 0
  verified_at: 2026-09-20T10:00:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-thuoc-khai-dung-tieng-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-20T10:00:00+07:00

- cmd: bun run lint:slop
  run_id: minted-thuoc-khai-dung-tieng-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-20T10:00:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-thuoc-khai-dung-tieng-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-20T10:00:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

- E9 (`bun run check-types`) là non-discriminating: baseline = green (xanh trên cả code cũ lẫn code mới của vòng này). Đây là quy luật đã biết từ round trước (hội đồng S4 vòng 1): `check-types` không có phép phá nào chạy qua trong ma trận đột biến của AC-11, nên eval này chứng minh harness (tsc chạy được) chứ không phân biệt được feature có/không. Không cần viết lại — đây là regression-guard có chủ ý (giữ cổng kiểu sạch), không phải lỗ hổng của bộ đo.

## Variance

none — không có eval nào mang `runs > 1` trong vòng này; mọi eval là deterministic (runs: 1).

## Iterations

Round 1: E3 (cong-chan-duoc), E10 (ho-so-cu-van-xanh), E12a (khai-sinh-phu-vong-nay, nhóm nhanh) và E13 (ghim-lai-da-xong) đỏ thật — không phải lỗi harness. Riêng E12b (nhóm "vừa" của khai-sinh-phu-vong-nay) bị công cụ giết ở mốc 600 giây trước khi in dòng kết quả cuối, nên không có phán quyết pass/fail cho nhóm đó — verdict tổng của vòng này là BLOCKED (thiếu phép đo), không phải REJECT hay PASS. Chưa quay lại implementation; cần rerun E12b với timeout dài hơn trước khi tính lại verdict tổng.
