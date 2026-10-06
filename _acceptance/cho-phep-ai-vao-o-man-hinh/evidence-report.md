---
schema_version: 2
feature_slug: cho-phep-ai-vao-o-man-hinh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0b38a8c65b5f01363ea7af878d378483a308da9e
human_signoff: Phan Le Manh 2026-09-19
---

# Evidence Report: cho-phep-ai-vao-o-man-hinh

Round 6 hoàn tất: 16/16 eval máy đạt, kể cả E10 và E12 — hai eval từng chặn lượt đầu của chính round này (E10 do agent bị skip/chết, E12 do network app-fail). Duy nhất E14 (AC-13, judgment) còn chờ người: hợp đồng T3 bắt buộc `human_override` trên mọi mục judgment bất kể verdict của panel, nên verdict tổng giữ ở PENDING-JUDGMENT.

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
| E12 | AC-6 | ui-check | PASS |
| E13 | AC-8 | ui-check | PASS |
| E14 | AC-13 | judgment | PASS (đề xuất panel — chờ human_override, bắt buộc vì hợp đồng T3) |
| E15 | AC-6 | script | PASS |
| E16 | AC-14 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-cho-phep-ai-vao-o-man-hinh-E1-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_ham_thuan
  verified_at: 2026-09-18T09:00:00Z
  output: |
     0 fail
     13 expect() calls
    Ran 12 tests across 1 file. [40.00ms]

- eval: E2
  run_id: mu75zwkivvqv
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_vai_dinh_truoc
  verified_at: 2026-09-18T09:02:00Z
  output: |
     1 expect() calls
    Ran 1 test across 1 file. [566.00ms]
    test-run: dropped crm_mu75zwkivvqv_test

- eval: E3
  run_id: mu75zwbc6mhh
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_rut_chan_chua_vao
  verified_at: 2026-09-18T09:04:00Z
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [546.00ms]
    test-run: dropped crm_mu75zwbc6mhh_test

- eval: E4
  run_id: mu75zvi3eotr
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cp_rut_khong_dung_da_vao
  verified_at: 2026-09-18T09:06:00Z
  output: |
     1 expect() calls
    Ran 1 test across 1 file. [419.00ms]
    test-run: dropped crm_mu75zvi3eotr_test

- eval: E5
  run_id: mu75zw898ruk
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_go_tron_ven
  verified_at: 2026-09-18T09:08:00Z
  output: |
     2 expect() calls
    Ran 2 tests across 1 file. [475.00ms]
    test-run: dropped crm_mu75zw898ruk_test

- eval: E6
  run_id: mu75zwhk8zja
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_duong_moi
  verified_at: 2026-09-18T09:10:00Z
  output: |
     7 expect() calls
    Ran 5 tests across 1 file. [513.00ms]
    test-run: dropped crm_mu75zwhk8zja_test

- eval: E7
  run_id: mu75zwehzghh
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_doc_hong_khong_khoa
  verified_at: 2026-09-18T09:12:00Z
  output: |
     1 expect() calls
    Ran 1 test across 1 file. [422.00ms]
    test-run: dropped crm_mu75zwehzghh_test

- eval: E8
  run_id: mu75zvjehn6r
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_chu_cuoi_cung
  verified_at: 2026-09-18T09:14:00Z
  output: |
     4 expect() calls
    Ran 3 tests across 1 file. [429.00ms]
    test-run: dropped crm_mu75zvjehn6r_test

- eval: E9
  run_id: mu75zvu9naqx
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_quyen_hai_ve
  verified_at: 2026-09-18T09:16:00Z
  output: |
     4 expect() calls
    Ran 2 tests across 1 file. [287.00ms]
    test-run: dropped crm_mu75zvu9naqx_test

- eval: E10
  run_id: mu75zvk06c0w
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_chuan_hoa_dia_chi
  verified_at: 2026-09-18T09:18:00Z
  output: |
    5 expect() calls
    Ran 1 test across 1 file. [328.00ms]
    test-run: dropped crm_mu75zvk06c0w_test

- eval: E11
  run_id: mu7605rnzbib
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_domain_nha_tach
  verified_at: 2026-09-18T09:20:00Z
  output: |
     5 expect() calls
    Ran 3 tests across 1 file. [247.00ms]
    test-run: dropped crm_mu7605rnzbib_test

- eval: E16
  run_id: mu7606ibqkil
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cp_cho_phep_lai
  verified_at: 2026-09-18T09:22:00Z
  output: |
     3 expect() calls
    Ran 1 test across 1 file. [236.00ms]
    test-run: dropped crm_mu7606ibqkil_test

- eval: E15
  run_id: design-gate-8b999ff043
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cp_san_thiet_ke
  verified_at: 2026-09-18T09:24:00Z
  output: |
      "hits": [],
      "findings": []
    }

- eval: E12
  run_id: minted-cho-phep-ai-vao-o-man-hinh-E12-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-18T09:30:00Z
  screenshot: evidence/E12-man-het-quyen.png
  observed: |
    Read both saved PNGs directly via Read (not from memory of steps).

    E12-man-het-quyen.png (1280x900, fresh isolated headless Chrome via
    puppeteer-core, cookie set with page.setCookie() for a freshly-seeded
    non-member account, navigated to /campaigns): shows a plain,
    fully-rendered page — black background, heading "This account is not in
    the workspace", body "Someone removed it. Ask an owner or an admin to
    allow your address again.", and a filled "Sign out" button. No blank
    page, no server-error chrome, no visible redirect artifacts. final-url
    reported by the capture script: http://localhost:3300/het-quyen (started
    from /campaigns; server did ONE 307 redirect to /het-quyen, confirmed
    separately via curl -D-, then 200 OK — no bounce loop). Matches Expected
    exactly: a screen that states plainly the account is no longer in the
    workspace, with a sign-out path, no redirect loop / blank page / server
    error page.

    E12-identity-check-members.png (1280x900, separate fresh capture, cookie
    for real workspace owner ada@trycomp.ai, navigated to
    /crm/settings/members): shows the Members settings page with the 6-row
    member table AND, below it, a distinct "Allowed in" section — subtitle
    "Addresses that may sign in but have not yet.", an "Allow an address"
    button, and a table with Address/Role on arrival/Allowed by/Allowed
    columns (3 existing allow-list rows visible, unrelated leftover from a
    prior E13 run, not touched by me). This is the "Được phép vào" block
    required by step 5 as the freshness/identity check — its presence
    confirms the running build is current, not stale.
  network_observed: clean

- eval: E13
  run_id: minted-cho-phep-ai-vao-o-man-hinh-E13-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-18T09:34:00Z
  screenshot: evidence/E13-members-member.png
  observed: |
    E13-members-member.png (Read, ảnh thật, tự chụp bằng phiên cookie
    dev:session cho marcus@trycomp.ai, role=member trong DB): header phải
    trên avatar "ML"; dòng "Marcus Lindqvist  You" trong bảng, role=Member ->
    đúng phiên vai member. Bảng Members đúng 4 cột Name/Email/Role/Joined,
    KHÔNG có cột hành động, KHÔNG có nút "..." trên bất kỳ dòng nào trong 6
    dòng. Dưới bảng KHÔNG có khối "Allowed in" nào — không tiêu đề, không nút
    "Allow an address", không bảng phụ: toàn bộ section vắng mặt hoàn toàn
    (hình dạng "khối không hiện ra", đối chiếu
    apps/app/app/(app)/[slug]/settings/members/allowances-table.tsx dòng 65
    `if (!workspace.data?.canManageMembers) return null;`).

    E13-members-admin.png (Read, ảnh thật, phiên cookie dev:session cho
    ada@trycomp.ai, role=owner trong DB, chụp LẠI SAU bước gieo UI để đối
    chứng mạnh nhất): header phải trên avatar "AO"; dòng "Ada Okafor  You",
    role=Owner. Bảng Members có nút "..." trên CẢ SÁU dòng. Dưới bảng có
    khối "Allowed in" đầy đủ: nút xanh "Allow an address" góc phải, bảng phụ
    Address/Role on arrival/Allowed by/Allowed, và dòng trên cùng
    "e13-verifier-r7@onemount.com · Member · Ada Okafor · just now" — dòng
    này được tạo TRỰC TIẾP qua CHÍNH UI (dialog Allow an address -> submit ->
    toast "Address allowed." -> POST /api/trpc/workspace.allowEmail trả 200)
    trong chính phiên xác minh này, có nút "Withdraw" đứng cạnh. Cả ba hành
    động (Allow an address, "..." đổi vai/gỡ thành viên, Withdraw) đều có
    mặt và bấm được trên khung admin.

    Hai khung hình tương phản rõ: member = 0 điểm thao tác cho quản thành
    viên/lời cho phép (khối vắng mặt hoàn toàn); admin = đủ 3 điểm thao tác
    (Allow, "...", Withdraw), đúng như AC-8 đòi hỏi. Không có trường hợp mơ
    hồ (không phải "cả hai đều ẩn" hay "cả hai đều hiện").
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mu75zueflejq
  exit_code: 0
  verified_at: 2026-09-18T09:40:00Z
  output: |
     Time:    22.265s

    test-run: dropped crm_mu75zueflejq_test

- cmd: bunx turbo run lint --force
  run_id: minted-cho-phep-ai-vao-o-man-hinh-SUITE-bunx_turbo_run_lint_force-r6
  exit_code: 0
  verified_at: 2026-09-18T09:42:00Z
  output: |
     Time:    343ms

    All linting completed. Found 21 warnings across packages (mostly about
    barrel files and unused imports), but no errors. Linting verification
    passed.

- cmd: bun run lint:slop
  run_id: minted-cho-phep-ai-vao-o-man-hinh-SUITE-bun_run_lint_slop-r6
  exit_code: 0
  verified_at: 2026-09-18T09:44:00Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 882ms on 1047 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-cho-phep-ai-vao-o-man-hinh-SUITE-bunx_turbo_run_build_force-r6
  exit_code: 0
  verified_at: 2026-09-18T09:46:00Z
  output: |
     Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    16.298s

### Judgment

- eval: E14
  judged_by: judge panel (fresh context) — lens domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS (đề xuất panel; hợp đồng T3 vẫn bắt buộc human_override trên MỌI mục judgment bất kể verdict của panel)
  votes:
    - domain-correctness: PASS — Hai hộp thoại dùng từ ngữ khác nhau rõ ràng và thân bài tự giải thích, không chỉ tiêu đề/nút. Hộp "go" (Gỡ): "Họ mất quyền ngay bây giờ. Đăng nhập lại cũng không vào được nữa" — nói rõ đối tượng đang có quyền, đăng nhập được, và hành động cắt quyền đó vĩnh viễn. Hộp "rut" (Rút): "Việc này chỉ chặn người chưa đăng nhập lần nào. Ai đã vào rồi thì vẫn ở trong" — nói rõ và tương phản trực tiếp: chỉ chặn người CHƯA vào, người đã vào không bị ảnh hưởng. Hai câu thân bài đối lập nhau minh bạch (mất-quyền-ngay vs. chỉ-chặn-người-chưa-vào), tiêu đề cũng khác chủ ngữ ("Gỡ người này?" vs "Rút lời cho phép này?"), nút bấm khác từ ("Gỡ" vs "Rút"). Một người đọc lần đầu, chỉ dựa vào chữ trong file này, có đủ căn cứ để hiểu đúng hai hành động khác nhau.
    - operational-feasibility: PASS — Hai hộp thoại dùng từ khác nhau (nhan đề "Gỡ người này?" / nút "Gỡ" — hướng tới "người" đang có quyền, vs "Rút lời cho phép này?" / nút "Rút" — hướng tới "lời cho phép"), và quan trọng nhất, phần thân câu tự giải thích rõ phạm vi: xacNhan.go.than nói "Họ mất quyền ngay bây giờ. Đăng nhập lại cũng không vào được nữa" (ngụ ý người này đã có quyền/đã từng vào), còn xacNhan.rut.than nói thẳng "Việc này chỉ chặn người chưa đăng nhập lần nào. Ai đã vào rồi thì vẫn ở trong" — câu này chủ động loại trừ khả năng nhầm với việc gỡ người đã vào. Dựa trên chữ trong file, một người đọc thân thoại (không chỉ tiêu đề) sẽ phân biệt được hai hành động.
    - spec-alignment: PASS — Trong file duy nhất được phép đọc, hai hộp thoại dùng từ ngữ khác biệt rõ: GO ("Gỡ người này?" / "Họ mất quyền ngay bây giờ. Đăng nhập lại cũng không vào được nữa.") ngụ ý người này đang có quyền và từng đăng nhập trước đó — nay bị cắt. RUT ("Rút lời cho phép này?" / "Việc này chỉ chặn người chưa đăng nhập lần nào. Ai đã vào rồi thì vẫn ở trong.") nói thẳng phạm vi: chỉ áp dụng cho người CHƯA từng đăng nhập, và tương phản rõ với người đã vào. Hai tiêu đề dùng động từ khác nhau (gỡ/rút) và tân ngữ khác nhau (người/lời cho phép), thân câu của RUT nêu tường minh "chưa đăng nhập lần nào" đối lập "đã vào rồi thì vẫn ở trong" — đủ để người đọc lần đầu phân biệt hai hành động khác nhau, không phải hai câu na ná nhau đến mức dễ bấm nhầm.
  rationale: Ba lens đồng thuận PASS trên cùng một câu hỏi (hai hộp thoại xác nhận — gỡ thành viên và rút lời cho phép — có tự phân biệt được hành vi qua thân câu hay không), không có bất đồng nào giữa các vote. Vì đây là hợp đồng T3, verdict tổng của báo cáo vẫn giữ PENDING-JUDGMENT cho tới khi một người tự đọc lại hai câu thân hộp thoại và điền human_override — máy không được tự nâng lên PASS cho mục judgment dù panel đồng thuận.
  human_override: Đạt — Phan Le Manh 2026-09-19. Đọc lại hai câu thân hộp thoại:
    GỠ nói «Họ mất quyền ngay bây giờ. Đăng nhập lại cũng không vào được nữa»,
    RÚT nói «Việc này chỉ chặn người chưa đăng nhập lần nào. Ai đã vào rồi thì vẫn
    ở trong». Hai câu nói đúng hai việc khác nhau, người quản đọc lần đầu không
    bấm nhầm.

## Known limits

## Ngoài hợp đồng

## Analyst

E1, E2, E3, E5, E6, E7, E8, E9, E10, E11, E16 — các eval này pass trên cả HEAD
lẫn baseline (diffBase), tức không phân biệt được nên chưa chứng minh feature;
cần xem lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý.
E10 vào danh sách này lần đầu ở round này (lượt trước BLOCKED, chưa từng đo
được baseline). E4 loại khỏi danh sách vì baseline: red (có phân biệt) — dù
riêng vế 4–5 của chính E4 có lỗ hổng đo lường được ghi tại review-findings.md
(t1, t6, t9, t14, t15).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 4: E4 REJECT — khép vòng ghi-đọc còn thiếu ở
`apps/api/test/workspace-thanh-vien.spec.ts`; sửa hai chỗ (xem 1147c00e). Quay
về implementation.
Round 5: REJECT — ghi hỏi của S4 round 5 (xem 7a1fb24c); chưa đạt khuôn đo cho
E4.
Round 6: PENDING-JUDGMENT — lượt đầu của round BLOCKED (E10 agent bị
skip/chết, không ra kết quả; E12 network app-fail trong lượt chụp); đổi khuôn
E4 sang `apps/api` để gọi được thủ tục thật (xem 5b19f4f6); chạy lại E10 và
tái chụp E12/E13 — cả 16 eval máy đạt, còn E14 (judgment, T3) chờ
human_override.

### Re-pin lần 1 — 2026-10-04, do sửa thước đỏ lô 2-4 (c1)
run_id: repin-20261004T145505Z-62389
sha: 64d8a231b08ba0a8c4f1aba6724daa053a81c2a1 · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12, E13, E14 · diff chạm vật đo ngoài làn máy: E12, E13, E14 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-13

### Re-pin lần 2 — 2026-10-06, do sửa thước đỏ lô 2-4 (c1)
run_id: repin-20261006T093948Z-62927
sha: 0b38a8c65b5f01363ea7af878d378483a308da9e · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12, E13, E14 · diff chạm vật đo ngoài làn máy: E12, E13, E14 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-13
