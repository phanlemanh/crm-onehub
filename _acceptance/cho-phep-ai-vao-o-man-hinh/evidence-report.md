---
schema_version: 2
feature_slug: cho-phep-ai-vao-o-man-hinh
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1147c00e2884ea786a182fbeb40ed1a2e94b6885
human_signoff:
---

# Evidence Report: cho-phep-ai-vao-o-man-hinh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-9 | test | PASS |
| E7 | AC-12 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-11 | test | PASS |
| E11 | AC-10 | test | PASS |
| E16 | AC-14 | test | PASS |
| E15 | AC-6 | script | PASS |
| E12 | AC-6 | ui-check | PASS |
| E13 | AC-8 | ui-check | PASS |
| E14 | AC-13 | judgment | PASS (đề xuất panel — chưa human_override, vòng này REJECT nên chưa tới Cổng 2) |

## Evidence

- eval: E1
  run_id: minted-cho-phep-ai-vao-o-man-hinh-E1-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_ham_thuan
  verified_at: 2026-09-18T00:00:00Z
  output: |
    0 fail
    13 expect() calls
    Ran 12 tests across 1 file. [41.00ms]

- eval: E2
  run_id: mu72k7loubdx
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_vai_dinh_truoc
  verified_at: 2026-09-18T00:00:00Z
  output: |
    1 expect() calls
    Ran 1 test across 1 file. [230.00ms]
    test-run: dropped crm_mu72k7loubdx_test

- eval: E3
  run_id: mu72k6suoqif
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_rut_chan_chua_vao
  verified_at: 2026-09-18T00:00:00Z
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [495.00ms]
    test-run: dropped crm_mu72k6suoqif_test

- eval: E4
  run_id: mu72k8ds81i8
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_rut_khong_dung_da_vao
  verified_at: 2026-09-18T00:00:00Z
  output: |
    1 expect() calls
    Ran 1 test across 1 file. [231.00ms]
    test-run: dropped crm_mu72k8ds81i8_test

- eval: E5
  run_id: mu72k7kmi63l
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_go_tron_ven
  verified_at: 2026-09-18T00:00:00Z
  output: |
    2 expect() calls
    Ran 2 tests across 1 file. [287.00ms]
    test-run: dropped crm_mu72k7kmi63l_test

- eval: E6
  run_id: mu72k6tae0fz
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_duong_moi
  verified_at: 2026-09-18T00:00:00Z
  output: |
    7 expect() calls
    Ran 5 tests across 1 file. [465.00ms]
    test-run: dropped crm_mu72k6tae0fz_test

- eval: E7
  run_id: mu72k74ft0jd
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_doc_hong_khong_khoa
  verified_at: 2026-09-18T00:00:00Z
  output: |
    1 expect() calls
    Ran 1 test across 1 file. [252.00ms]
    test-run: dropped crm_mu72k74ft0jd_test

- eval: E8
  run_id: mu72k6wkujs4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_chu_cuoi_cung
  verified_at: 2026-09-18T00:00:00Z
  output: |
    4 expect() calls
    Ran 3 tests across 1 file. [345.00ms]
    test-run: dropped crm_mu72k6wkujs4_test

- eval: E9
  run_id: mu72k88wwhou
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_quyen_hai_ve
  verified_at: 2026-09-18T00:00:00Z
  output: |
    4 expect() calls
    Ran 2 tests across 1 file. [295.00ms]
    test-run: dropped crm_mu72k88wwhou_test

- eval: E10
  run_id: mu72k8pf1fn5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_chuan_hoa_dia_chi
  verified_at: 2026-09-18T00:00:00Z
  output: |
    5 expect() calls
    Ran 1 test across 1 file. [222.00ms]
    test-run: dropped crm_mu72k8pf1fn5_test

- eval: E11
  run_id: mu72kfd517oy
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_domain_nha_tach
  verified_at: 2026-09-18T00:00:00Z
  output: |
    5 expect() calls
    Ran 3 tests across 1 file. [241.00ms]
    test-run: dropped crm_mu72kfd517oy_test

- eval: E16
  run_id: mu72kir7w904
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_cho_phep_lai
  verified_at: 2026-09-18T00:00:00Z
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [227.00ms]
    test-run: dropped crm_mu72kir7w904_test

- eval: E15
  run_id: design-gate-2ecb9e3fa4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_san_thiet_ke
  verified_at: 2026-09-18T00:00:00Z
  output: |
    "hits": [],
    "findings": []
    }

- eval: E12
  run_id: minted-cho-phep-ai-vao-o-man-hinh-E12-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-18T00:00:00Z
  screenshot: evidence/E12-man-het-quyen.png
  observed: |
    E12-man-het-quyen.png (Read, English locale, viewport 390x844): dark theme main content, heading "This account is not in the workspace", body "Someone removed it. Ask an owner or an admin to allow your address again.", a green "Sign out" button below it — no nav chrome, no dashboard, no error trace, no blank canvas. Matches Expected: "MOT man noi thang rang tai khoan nay khong con trong khong gian lam viec, kem duong dang xuat." E12-identity-check-members.png (Read, dark theme, admin session on this tree): Members page with roster table (Ada Okafor/Owner, Marcus/Priya/dev/manh.phan/manh — Members) AND below it an "Allowed in" section header with "Addresses that may sign in but have not yet." and an "Allow an address" button, i.e. the allow-list block the identity check requires is present — confirms this tree's build is the one with the AC-6/AC-8 feature (not a stale checkout).
  network_observed: unscoped-partial

- eval: E13
  run_id: minted-cho-phep-ai-vao-o-man-hinh-E13-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-18T00:00:00Z
  screenshot: evidence/E13-members-member.png
  observed: |
    E13-members-member.png (đọc bằng Read, ảnh thật): header phải trên là avatar "ML" (Marcus Lindqvist), dòng Marcus Lindqvist trong bảng có nhãn "You" -> đúng phiên vai member. Bảng Members có 4 cột: Name/Email/Role/Joined — KHÔNG có cột hành động, không nút "..." ở dòng nào. Dưới bảng KHÔNG có khối "Allowed in" nào cả (không tiêu đề, không nút "Allow an address", không bảng phụ) — toàn bộ section allowances vắng mặt, không phải hiện read-only. E13-members-admin.png (đọc bằng Read, ảnh thật): header phải trên là avatar "AO" (Ada Okafor), dòng Ada Okafor có nhãn "You", vai "Owner" -> đúng phiên vai admin. Bảng Members có cột hành động với nút "..." trên CẢ SÁU dòng (đi kèm gỡ-thành-viên). Dưới bảng có khối "Allowed in" đầy đủ: nút xanh "Allow an address" ở góc phải, và một dòng mới seed "evidence-seed-e13@onemount.com" · Member · Allowed by Ada Okafor · Allowed just now · nút "Withdraw" ở cuối dòng. Cả ba hành động (cho phép, gỡ, rút) đều có mặt và bấm được. Hai khung hình KHÁC nhau rõ: bản member thiếu toàn bộ cột hành động VÀ toàn bộ khối Allowed-in; bản admin có đủ cả hai. Dòng được seed xuất hiện trong cả hai frame (cùng một workspace/DB), nhưng chỉ frame admin có nút Withdraw cạnh nó.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mu72k5mltx33
  exit_code: 0
  verified_at: 2026-09-18T00:00:00Z
  output: |
    Time:    22.182s
    test-run: dropped crm_mu72k5mltx33_test

- cmd: bunx turbo run lint --force
  run_id: minted-cho-phep-ai-vao-o-man-hinh-SUITE-bunx_turbo_run_lint_force-r5
  exit_code: 0
  verified_at: 2026-09-18T00:00:00Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
    Time:    238ms

- cmd: bun run lint:slop
  run_id: minted-cho-phep-ai-vao-o-man-hinh-SUITE-bun_run_lint_slop-r5
  exit_code: 0
  verified_at: 2026-09-18T00:00:00Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 475ms on 1047 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-cho-phep-ai-vao-o-man-hinh-SUITE-bunx_turbo_run_build_force-r5
  exit_code: 0
  verified_at: 2026-09-18T00:00:00Z
  output: |
    Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
    Time:    16.17s

### Judgment

- eval: E14
  judged_by: judge panel (fresh context) — lens domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS (đề xuất panel; hợp đồng T3 vẫn bắt buộc human_override trên MỌI mục judgment bất kể verdict của panel — vòng này verdict tổng REJECT nên chưa tới Cổng 2, để trống)
  votes:
    - domain-correctness: PASS — Hai hộp thoại dùng từ khác biệt rõ (Remove this person / Gỡ người này vs Withdraw this allowance / Rút lời cho phép này) và phần thân câu nói rõ phạm vi tác động: "go" nói "They lose access now. Signing in again will not bring them back" (ngụ ý người đã từng vào, nay mất quyền), còn "rut" nói thẳng "This only stops someone who has not signed in yet. Anyone already in stays in" (chỉ chặn người CHƯA có tài khoản, người đã vào rồi không bị ảnh hưởng). Câu "Anyone already in stays in" là điểm phân biệt tường minh, đủ để người đọc lần đầu không nhầm hai hành động.
    - operational-feasibility: PASS — Hai hộp thoại dùng danh từ khác nhau (người vs. địa chỉ/lời cho phép) và thân câu nói rõ phạm vi: "rut" viết thẳng "chỉ chặn người CHƯA đăng nhập lần nào. Ai đã vào rồi thì vẫn ở trong" (EN: "only stops someone who has not signed in yet. Anyone already in stays in"), đối lập trực tiếp với "go" viết "Họ mất quyền ngay bây giờ" (EN: "They lose access now") — ngụ ý người này đang có quyền, tức đã vào. Tiêu đề cũng khác hẳn: "Gỡ người này?"/"Remove this person?" so với "Rút lời cho phép này?"/"Withdraw this allowance?". Văn bản tự giải thích được sự khác biệt mà không cần ai chỉ thêm, nên không có dấu hiệu hai câu nghe giống nhau đến mức gây bấm nhầm.
    - spec-alignment: PASS — Hai hộp thoại dùng ngôn ngữ tương phản rõ, không chỉ khác nhãn mà khác cả nội dung giải thích. Hộp "go" (vi: "Gỡ người này?" / "Họ mất quyền ngay bây giờ. Đăng nhập lại cũng không vào được nữa.") nói về người ĐÃ có quyền và bị cắt ngay. Hộp "rut" (vi: "Rút lời cho phép này?" / "Việc này chỉ chặn người chưa đăng nhập lần nào. Ai đã vào rồi thì vẫn ở trong.") minh thị nói ngược lại — chỉ chặn người CHƯA từng đăng nhập, và còn chủ động nói rõ người đã vào thì không bị ảnh hưởng. Câu "Ai đã vào rồi thì vẫn ở trong" trực tiếp trả lời đúng câu hỏi phân biệt mà thẩm định đặt ra, nên người đọc lần đầu có đủ căn cứ để hiểu đúng hai hành động là khác nhau, không nghe giống nhau đến mức dễ bấm nhầm.
  rationale: Ba lens đồng thuận PASS trên cùng một câu hỏi (hai hộp thoại "Gỡ"/"Rút" có tự phân biệt được hành vi không), không có bất đồng nào giữa các vote — nội dung inputs không đổi so với round 4. Vì đây là hợp đồng T3, human_override vẫn bắt buộc trên mục này trước khi verdict tổng có thể là PASS — nhưng vòng này verdict tổng là REJECT (do các finding trong hợp đồng ánh xạ AC-4 mà review S4 vừa phát hiện, không phải do E14), nên chưa tới Cổng 2 và trường này để trống chờ vòng sau.
  human_override:

## Known limits

## Ngoài hợp đồng

## Analyst

E1, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11, E16, E15 — tất cả đạt trên CẢ HEAD lẫn nhánh diffBase (baseline: green). Đây là các eval kiểm hành vi lõi của cổng vào (hàm thuần vai-định-trước/rút/gỡ/domain-nhà-tách/chuẩn-hoá-địa-chỉ/cho-phép-lại) và sân thiết kế tĩnh (E15) — vì mã lõi các đường này không đổi giữa round 5 với nhánh diffBase, các bài không tự phân biệt được sửa đổi của vòng này; giữ nguyên như regression-guard có chủ ý (bộ ca cố định vẫn cần chạy mỗi vòng để bắt hồi quy), không cần viết lại. E12/E13 (ui-check) không có baseline khả dụng (n-a) nên không nằm trong danh sách này.

## Variance

none — không có eval nào mang field runs > 1 trong vòng 5.

## Iterations

Round 2: E2, E7 hỏng vì cơ sở dữ liệu sạch chưa có hàng tổ chức (đã sửa beforeEach); E15 thoát mã 4 vì lệnh thiếu `--target`. Quay lại implementation.
Round 3: E3, E5, E8, E11 viết lại theo đối chứng đường thật (Prisma trực tiếp → thủ tục/service thật); tất cả eval máy (E1–E11, E16, E15, E12, E13) đạt; E14 (judgment, T3) panel đề xuất PASS trên cả ba lens; verdict PENDING-JUDGMENT, sau đó Mạnh chấm Đạt tại Cổng 2 (human_signoff 2026-09-16) → PASS.
Round 4: sau các commit sửa cữ-liệu-drift của E4 (19578cb8) và đổi mốc sẵn-tràn-thuộc (a8d00ebf), chạy lại vòng S4 delta trên bản mới nhất — E13 FAIL: màn Members vai `member` ẩn hoàn toàn khối "Allowed in"/"Được phép vào" (`allowances-table.tsx` dòng 65: `if (!workspace.data?.canManageMembers) return null;`) thay vì hiện read-only như Expected của AC-8 đòi; 14/15 eval máy còn lại + 4 lệnh suite đều đạt. E14 (judgment, T3) panel đề xuất PASS trên cả ba lens, chưa có human_override vòng này vì verdict tổng REJECT chưa tới Cổng 2. Quay lại implementation.
Round 5 (hiện tại): sau commit "S4 round 4 REJECT -> hai nhất sửa" (1147c00e), cả 16 eval máy (E1–E11, E16, E15, E12, E13) và 4 lệnh suite hồi quy đều exit 0 — E13 nay đã PASS (khối "Allowed in" hiện đúng read-only/ẩn theo vai). Tuy nhiên verdict tổng vẫn REJECT: review S4 (adversarial code review + scope-triage) tìm được 5 finding TRONG HỢP ĐỒNG, tất cả ánh xạ AC-4 (`packages/auth/test/cong-vao.integration.spec.ts`) — lượt rút bị gieo trực tiếp bằng `db.invitation.updateMany` thay vì đi qua `revokeAllowance` thật (chiều đỏ mà E4 khai không bao giờ bắn được), và `phienSau`/`activeOrganizationId` là các khẳng định vòng tròn (đọc lại chính hàng mà bài kiểm vừa tự ghi) nên vế "vẫn tạo được phiên mới" của AC-4 vẫn chưa có phép đo thật chạm lời hứa. E14 (judgment, T3) panel đề xuất PASS trên cả ba lens (inputs không đổi so với round 4), chưa có human_override vì verdict tổng REJECT chưa tới Cổng 2. Quay lại implementation để viết lại E4 theo đường ghi/đọc thật (gọi `revokeAllowance` cho một người ĐÃ là thành viên, đọc lại hàng `member`/`session` thay vì đếm số bản ghi tự tạo).

### Re-pin lần 1 — 2026-09-17, do chiến dịch ghim lại kit 2.14.0 (PR #47): làn eval thật trên cây đã chuyển đường ghi tạo phẩm; đo bằng phanlemanh@gmail.com
run_id: repin-20260917T051527Z-61120
sha: ed70d70dd0ec9ee7412b45e63c90c925500d50c6 · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng