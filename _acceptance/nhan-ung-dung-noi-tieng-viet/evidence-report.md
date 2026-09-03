---
schema_version: 2
feature_slug: nhan-ung-dung-noi-tieng-viet
verdict: BLOCKED
failed_evals: ["E9","E15"]
reason: |
  Máy chủ API (port 3001) không chạy trong lượt verify này, nên ba chặn không
  đo được: E1 (`ban-ve.mjs ba-man`), E2 (`ban-ve.mjs ho-so`), E11
  (`du-lieu-bien.mjs`) — cả ba đều nhận ECONNREFUSED khi gọi
  http://localhost:3001. Cần khởi động lại `cd apps/api && bun run dev` và
  `cd apps/app && PORT=3100 API_URL=http://localhost:3001 APP_URL=http://localhost:3100 bun run dev`
  từ worktree này rồi verify lại; đây không phải lỗi mã nguồn.
  Trong số các eval ĐO ĐƯỢC (không cần server này), hai chặn FAIL thật —
  không liên quan tới việc server nghẽn: E9 (`rang/may-chu-ve.sh`, exit 1 —
  cả ba luợt trả đầu /companies, /contacts, /deals đều thiếu lang=vi) và E15
  (`rang/khong-may-quet.sh`, exit 1 — 1/8 chặn bị gắn cờ chỉ đọc mã nguồn,
  tên `chu-cung-jsx.mjs`). Ghi cả hai vào failed_evals để không lẫn với ba
  chặn bị BLOCKED do hạ tầng.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6729ad488a98bbf2c473b5d1e5eac9ae024d09f7
human_signoff:
---

> ⚠ **ĐÍNH CHÍNH của vòng điều phối — nguyên nhân trong `reason:` ở trên SAI.**
>
> `reason:` nói máy chủ API không chạy và khuyên khởi động lại. Đo ngay sau lượt
> chạy: **cả hai máy chủ đang sống**, cùng PID từ trước khi resume (không hề khởi
> động lại), `curl localhost:3001/` trả **200**, `localhost:3000/` trả 307 sang
> `/onehub`.
>
> Nguyên nhân thật: **chân đo ghim slug workspace `crm`**, mà workspace của kho
> nay là `onehub`. `may-chu-ve.sh:6` khai `SLUG="${SLUG:-crm}"`, và `curl` không
> theo redirect, nên nó đo một cái 307 rỗng. Chạy lại đúng một lệnh đó với
> `SLUG=onehub`: **man hong=0/3**, cả ba màn mang `lang=vi`, `<title>` và `h1`
> đều tiếng Việt. Ba lệnh bị chặn (E1, E2, E11) cùng gốc này; chúng ném lỗi trần
> khi đường dẫn không tồn tại và người kiểm đọc thành ECONNREFUSED — đúng lớp lỗi
> vòng 4 đã trả giá và đã ghi trong handoff.
>
> Năm chân ghim slug: `ban-ve.mjs:12` · `khai-tieng.mjs:11` · `no-vong-1.mjs:9` ·
> `may-chu-ve.sh:6` · `kiem-ke.mjs:42`.
>
> **E15 thì đỏ thật, và không phải vì slug.** Chân chống-lách gọi tên
> `chu-cung-jsx.mjs` — phép đo dựng ở vòng sửa này — là "CHỈ ĐỌC MÃ, không chạm
> tới sản phẩm đang chạy": `chan chi doc ma=1/8`. Đây là xung đột giữa hai điều
> đã duyệt, không phải lỗi môi trường, và nó cần người quyết.


# Evidence Report: nhan-ung-dung-noi-tieng-viet

⚠ BLOCKED — máy chủ API (port 3001) không chạy nên E1, E2, E11 không đo
được; trong số eval đo được, E9 và E15 FAIL thật (không phải do server).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | BLOCKED |
| E2 | AC-2 | script | BLOCKED |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | FAIL |
| E10 | AC-10 | script | PASS |
| E11 | AC-11 | script | BLOCKED |
| E12 | AC-12 | test | PASS |
| E13 | AC-12 | script | PASS |
| E14 | AC-13 | judgment | UNCERTAIN |
| E15 | AC-1 | script | FAIL |
| E16 | AC-14 | script | PASS |
| E17 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: (không có — cannotRun, xem reason)
  exit_code: 1
  baseline: red
  verifier: config:executors.script.rang3_ba_man
  verified_at: 2026-09-03T09:40:00Z
  reason: API server (port 3001) không chạy. Lệnh cần kết nối tới http://localhost:3001 nhưng nhận được ECONNREFUSED — script bun chạy `dev-session.ts` cố gắng gọi fetch tới port 3001 và thất bại.
  output: |
    [TypeError: fetch failed] {
      [cause]: AggregateError [ECONNREFUSED]:
          at internalConnectMultiple (node:net:1193:18)
          at afterConnectMultiple (node:net:1783:7) {
        code: 'ECONNREFUSED',
        [errors]: [
          Error: connect ECONNREFUSED ::1:3001
          Error: connect ECONNREFUSED 127.0.0.1:3001
        ]
      }
    }

- eval: E2
  run_id: (không có — cannotRun, xem reason)
  exit_code: 1
  baseline: red
  verifier: config:executors.script.rang3_ho_so
  verified_at: 2026-09-03T09:40:00Z
  reason: API server not running on localhost:3001. The verification script requires the API to be running locally (typically via `bun run dev` in apps/api), but the server is not available. ECONNREFUSED error indicates the connection was refused on the required port.
  output: |
    Node.js v24.15.0

    (Full error: fetch failed with ECONNREFUSED on port 3001 attempting to connect to API server)

- eval: E3
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E3-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_dong_thoi_gian
  verified_at: 2026-09-03T09:40:00Z
  output: |
       (b) KHONG phai chieu do — hop dong khai cau may chu van tieng Anh, vong ④

    ket qua: con lai=0 lan · duong hong (a) tieng Viet=co

- eval: E4
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E4-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_no_vong_1
  verified_at: 2026-09-03T09:40:00Z
  output: |
       khong hien     "Nothing found"                          · nhãn trạng thái bổ sung dữ liệu
       khong hien     "2d ago"                                 · chữ thời gian tương đối
    ket qua: con tieng Anh=0 · khong hien de doi chieu=5 · tong=10

- eval: E5
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E5-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_trinh_doc_man_hinh
  verified_at: 2026-09-03T09:40:00Z
  output: |
    -- nhan chi trinh doc man hinh nghe: vi=196 lan, en=196 lan
    -- CON LAI: 0 chuoi / 0 lan
    ket qua: con lai=0 lan

- eval: E6
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E6-r8
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-03T09:40:00Z
  output: |
     Tasks:    11 successful, 11 total
    Cached:    11 cached, 11 total
      Time:    56ms >>> FULL TURBO

- eval: E12
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E12-r8
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-09-03T09:40:00Z
  output: |
     Tasks:    11 successful, 11 total
    Cached:    11 cached, 11 total
      Time:    56ms >>> FULL TURBO

- eval: E7
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E7-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_khai_tieng
  verified_at: 2026-09-03T09:40:00Z
  output: |
       boc du  Banking                2 cho, chua boc 0
       boc du  Accounting             1 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

- eval: E8
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E8-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_doi_tieng
  verified_at: 2026-09-03T09:40:00Z
  output: |
       thanh chon dong con giu: co
       chu thoi gian sau khi doi: "5 phút trước" — tieng Viet
    ket qua: hong=0

- eval: E9
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E9-r8
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.rang3_may_chu_ve
  verified_at: 2026-09-03T09:40:00Z
  output: |
    THE GOC SAI  /companies — luot ve dau khong mang lang=vi
    THE GOC SAI  /contacts — luot ve dau khong mang lang=vi
    THE GOC SAI  /deals — luot ve dau khong mang lang=vi
    ket qua: man hong=3/3

- eval: E10
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E10-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang3_be_rong
  verified_at: 2026-09-03T09:40:00Z
  output: |
    $ bun scripts/dev-session.ts manh.phan@onemount.com
    ket qua 1440px: cat tran=0 · cat kem ba cham=0 · tong=7 · hong=0
    ket qua: o hong=0/12

- eval: E11
  run_id: (không có — cannotRun, xem reason)
  exit_code: 1
  baseline: red
  verifier: config:executors.script.rang3_du_lieu_bien
  verified_at: 2026-09-03T09:40:00Z
  reason: API development server is not running at http://localhost:3001. The acceptance test requires both the API server (cd apps/api && bun run dev) and the app server (cd apps/app && PORT=3100 API_URL=http://localhost:3001 APP_URL=http://localhost:3100 bun run dev) to be running before verification can proceed.
  output: |
    RANG CUN: khong noi duoc toi may chu o http://localhost:3001 (ECONNREFUSED).
    Dung may chu dev TU CAY LAM VIEC nay truoc khi tin bat ky con so nao:
      cd apps/api && bun run dev
      cd apps/app && PORT=3100 API_URL=http://localhost:3001 APP_URL=http://localhost:3100 bun run dev

- eval: E13
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E13-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_dot_bien
  verified_at: 2026-09-03T09:40:00Z
  output: |
       Hau qua: quy ket theo khoa suy tu chuoi hien ra, khong tu tung luot rieng.

    ket qua: bat 247/247 khoa ve ra (100%) · do phu 45% · mu 0 · khong quy ket 14 · ngoai tam voi 282 · dot bien cun 0

- eval: E15
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E15-r8
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.rang3_khong_may_quet
  verified_at: 2026-09-03T09:40:00Z
  output: |
    dung vat that  ban-ve.mjs
    CHI DOC MA     chu-cung-jsx.mjs — chan nay khong cham toi san pham dang chay
    qua ban-ve.mjs  dot-bien.mjs — cham san pham bang cach chay ban-ve.mjs
    dung vat that  du-lieu-bien.mjs
    dung vat that  khai-tieng.mjs
    dung vat that  no-vong-1.mjs
    qua ban-ve.mjs  be-rong.sh — cham san pham dang chay bang cach chay ban-ve.mjs
    dung vat that  may-chu-ve.sh
    ket qua: chan chi doc ma=1/8

- eval: E16
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E16-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_giai_doan
  verified_at: 2026-09-03T09:40:00Z
  output: |
       boc du  Closed lost          3 cho, chua boc 0
       boc du  Unqualified          3 cho, chua boc 0
    ket qua: cho chua khai lang=en=0

- eval: E17
  run_id: minted-nhan-ung-dung-noi-tieng-viet-E17-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang3_chu_cung_jsx
  verified_at: 2026-09-03T09:40:00Z
  output: |
    quet 97 file trong lat
    chu cung nguoi doc thay: 0 cho, tren 0 file
    XANH: khong cho nao khoa cung.

- eval: E14
  judged_by: judge panel (fresh context) — 3 lens: domain-correctness, operational-feasibility, spec-alignment
  proposal: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — (1) Giọng dịch tự nhiên, nhất quán với từ điển CONTEXT.md (thoả thuận hợp tác/công ty/cá nhân, tránh đúng các từ cấm), không có dấu hiệu dịch máy trong các chuỗi đã khảo. (2) Xác nhận thật: 5 lựa chọn của facet `closing.*` đứng chung một khối (`closing-window.ts` + `deals-table.tsx:215-222`) nhưng lẫn 3 loại từ — `Chốt trong tháng này`/`Chốt tháng sau` là cụm động từ cạnh `Quá hạn`/`Muộn hơn` (tính từ) và `Chưa có ngày chốt` (mệnh đề) — song CONTEXT.md chưa có mục từ cho nhóm này nên chưa rõ đây là vi phạm AC-13 hay một lựa chọn chữ sản phẩm còn treo ở Cổng 2. (3) Chữ thật đo ở E10 xác nhận `Số lượng cá nhân` và `Số thoả thuận đang mở` đứng cạnh nhau và hiện ĐỦ, không cắt, từ 1024px trở lên, chung tiền tố "Số" — nhưng CONTEXT.md (mục Luật viết nhãn) đã duyệt `Số lượng cá nhân` là nhãn tối thiểu và cần thiết, nên không có căn cứ viết sẵn để gọi việc đứng cạnh một nhãn cùng tiền tố là lỗi.
      required_evidence:
        - Đoạn AC-13 trong contract.md (hoặc file tiêu chí tương đương ở _acceptance/nhan-ung-dung-noi-tieng-viet/) nói rõ liệu 'các lựa chọn trong cùng một facet phải chung một loại từ' có nằm trong phạm vi AC-13 hay không. Có đoạn đó và nó xác nhận trong phạm vi (facet closing.* còn nguyên trạng) → verdict đổi FAIL; xác nhận ngoài phạm vi → câu (2) hết vướng, nghiêng PASS.
        - Biên bản Cổng 2 (sign-off/evidence-report) trả lời đúng hai câu hỏi mà E14-nhom-han-chot.md để ngỏ: loại từ của facet closing.* trên bảng Thoả thuận, và cặp nhãn cạnh nhau Số lượng cá nhân / Số thoả thuận đang mở trên bảng Công ty. Có biên bản đó và nó duyệt nguyên trạng → verdict đổi PASS; nó yêu cầu sửa mà bản dịch ở ban-dich.md chưa sửa → verdict đổi FAIL.
    - operational-feasibility: UNCERTAIN — (1) Đạt rõ: bảng đổi giọng bán hàng sang giọng hợp tác nhất quán (vd. "đang bán cho" → "đang trao đổi", "thua" → "không thành"), bám đúng từ điển CONTEXT.md, không lẫn từ cấm (liên hệ, khách hàng, giao dịch, cơ hội) — không đọc như bản dịch máy. (2) và (3) đều có bằng chứng thật nhưng cục bộ: năm nhãn của facet Hạn chốt lẫn ba loại từ — hai nhãn cụm động từ giữa ba nhãn tính từ/mệnh đề — và cặp `Số lượng cá nhân`/`Số thoả thuận đang mở` đứng cạnh nhau chung tiền tố `Số`, dù theo đúng chữ đo ở E10 cả hai hiện đủ, không cắt, từ 1024px trở lên và phần sau tiền tố khác hẳn nhau. Phạm vi input của eval này không có ngưỡng nào (AC-13 nằm ngoài phạm vi input) để biết hai vết cục bộ đó đủ làm rớt tiêu chí "đọc như người trong nghề", hay là mức lệch chấp nhận được trong một bảng phần lớn tốt.
      required_evidence:
        - Nội dung AC-13 trong _acceptance/nhan-ung-dung-noi-tieng-viet/contract.md (hiện ngoài phạm vi input của eval này) — đọc để biết tiêu chí có cấm tuyệt đối việc lẫn loại từ trong một khối hiển thị cùng lúc hay chỉ đòi bảng "đọc chung chuyên nghiệp"; ngưỡng đó quyết định câu (2) có đủ làm rớt verdict hay không.
        - Quyết định của người ở Cổng 2 — ghi thêm vào ban-dich.md hoặc một mục mới trong CONTEXT.md — về facet Hạn chốt (apps/app/lib/messages/crm.ts:413-419, năm khoá closing.*) và cặp headers.contacts/headers.openDeals trên bảng Công ty; đây là lựa chọn chữ sản phẩm cần người quyết, nên chính quyết định giữ-hay-sửa đó là bằng chứng còn thiếu để chốt câu (2) và (3).
    - spec-alignment: UNCERTAIN — (1) Bảng đọc tự nhiên, đúng giọng quan hệ đối tác, bám từ điển CONTEXT.md — không phải dịch máy. (2) Bằng chứng xác nhận điều hội đồng lo là thật: 5 nhãn closing.* đứng chung một khối và lẫn ba loại từ, nhưng chính bằng chứng đó tự nhận đây là "chọn chữ sản phẩm" mà CONTEXT.md chưa có mục từ cho nhóm này — nên là quyết định còn treo, không phải vi phạm luật đã chốt. (3) Cặp `Số lượng cá nhân`/`Số thoả thuận đang mở` đứng cạnh nhau chung tiền tố `Số`, nhưng chữ thật ở E10 cho thấy cả hai luôn giữ chữ phân biệt ở mọi khổ cùng hiện, và CONTEXT.md còn chọn đúng `Số lượng cá nhân` làm ví dụ nhãn ĐÚNG của chính nó.
      required_evidence:
        - Một dòng quyết định — thêm vào bảng nhãn CONTEXT.md hoặc mục ngoại lệ của ban-dich.md — chốt cho năm nhãn facet closing.* ở mục 'Hạn chốt thoả thuận' trong ban-dich.md (khoá overdue/thisMonth/nextMonth/later/none, crm.ts:413-419): hoặc xác nhận loại từ lẫn nhau chấp nhận được cho nhãn facet kiểu elip tiếng Việt, hoặc ghi chữ thay thế đã chọn cho thisMonth/nextMonth để cùng loại từ với ba nhãn kia. Thiếu dòng này thì câu (2) còn là lựa chọn chữ chưa ai ký, không phải phép đo đã qua.
  human_override:

### Lệnh suite (hồi quy)

- cmd: bunx turbo run check-types --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r8
  exit_code: 0
  verified_at: 2026-09-03T09:40:00Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    15.386s

- cmd: bunx turbo run lint --force
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r8
  exit_code: 0
  verified_at: 2026-09-03T09:40:00Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    846ms

- cmd: bun run lint:slop
  run_id: minted-nhan-ung-dung-noi-tieng-viet-SUITE-bun_run_lint_slop-r8
  exit_code: 0
  verified_at: 2026-09-03T09:40:00Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 1.8s on 788 files with 9 rules using 14 threads.

## Known limits

## Ngoài hợp đồng

## Analyst

E6, E12 — `bun run db:test && bun run test` xanh trên cả HEAD lẫn baseline (diffBase): hai eval này không phân biệt được feature khỏi code cũ. Đây là bài kiểm hồi quy có chủ ý (regression-guard) đã tồn tại trước vòng này, không phải bằng chứng riêng cho AC-6/AC-12 — đọc như một guard bình thường, không phải một chỗ hổng của E6/E12. Lệnh suite (check-types, lint, lint:slop) xanh cả hai phía cũng là regression-guard bình thường, không liệt kê.

## Variance

none — không có eval nào chạy nhiều lần (runs > 1) round này

## Iterations

Round 1: E1 failed — bản vẽ ba màn chưa mở đủ bề mặt ẩn trước khi đối chiếu. Returned to implementation.
Round 2: E13 failed — chặn đột biến báo tỷ lệ bắt dưới ngưỡng khớp mới. Returned to implementation.
Round 3: 16 eval máy PASS; E14 (AC-13) UNCERTAIN ở hai lens (domain-correctness, operational-feasibility) — verdict PENDING-JUDGMENT, chờ người quyết.
Round 4: 16/16 tiêu chí máy đạt, 0 lệnh đỏ, 0 bị chặn, hội đồng E14 PASS. Verdict REJECT vì bảy phát hiện trong-hợp-đồng, cả bảy nhắm vào THƯỚC chứ không vào sản phẩm. Lượt đầu của vòng 4 bị BLOCKED oan ở E16 — chân khai tiếng ném lỗi trần khi máy chủ nghẽn nên người kiểm chẩn đoán sai thành 'API chưa chạy'; API thật ra đã sống 20 giờ. Đã vá chân để nó tự phân biệt hai ca, và chạy lại cùng vòng.
Round 5: E13 failed — chặn đột biến chỉ bắt được 240/254 khoá bốn chân có vẻ ra (94%, dưới ngưỡng 100% đã sửa ở Cổng 2 S4-r2); 265 khoá ngoài tầm với đã ghi tên đủ ở rang/dot-bien-sot.txt. 15/16 eval máy còn lại PASS, hội đồng E14 giữ nguyên PASS ở cả ba lens. Verdict REJECT vì có eval máy thất bại thật (E13), chưa tính tới sáu phát hiện trong-hợp-đồng khác vẫn còn treo từ round 4. Returned to implementation.
Round 6: 16/16 eval máy PASS (E13 nay bắt đủ 240/240 khoá bốn chặn có vẻ ra = 100%, đạt đúng ngưỡng đã sửa ở Cổng 2 S4-r2). Hội đồng E14 lật từ PASS (round 4, round 5) sang UNCERTAIN ở hai lens (operational-feasibility, spec-alignment) — domain-correctness vẫn PASS; cả hai lens UNCERTAIN đều thiếu bằng chứng đo "chữ thật hiện ra" cho record-sheet/deals mà E10 chưa phủ. Verdict REJECT vì một phát hiện trong-hợp-đồng mức cao khớp AC-2: mười vị trí chữ Anh cứng còn sót trên hồ sơ công ty, hồ sơ thoả thuận, dòng thời gian, danh sách trường và hộp thoại lưu view — khoá dịch đã tồn tại sẵn trong kho chuỗi nhưng chưa được nối vào JSX; guard test chỉ soi kho chuỗi chứ không đọc JSX nên không bắt được lớp lỗi này. Returned to implementation.
Round 7: 16/16 eval máy PASS (E13 giữ đúng ngưỡng, bắt đủ 242/242 khoá bốn chặn có vẻ ra = 100%), 0 lệnh suite đỏ, 0 bị chặn. Hội đồng E14: operational-feasibility quay lại PASS (round 6 từng UNCERTAIN), domain-correctness giữ PASS, nhưng spec-alignment tiếp tục UNCERTAIN — hai câu hỏi mới: nhãn nhóm 'Hạn chốt' và cặp 'Số lượng cá nhân'/'Số thoả thuận đang mở' cùng tiền tố 'Số' trên bảng Companies; verdict eval vẫn UNCERTAIN, chờ người quyết. Verdict REJECT vì năm phát hiện trong-hợp-đồng: hai hộp thoại xoá (thoả thuận, cá nhân) còn nguyên câu tiếng Anh cứng dù khoá dịch tương ứng đã có sẵn trong kho chuỗi nhưng chưa được gọi (AC-2); huy hiệu kiểu trường trong tấm Trường vẫn tiếng Anh vì máy chủ đúc sẵn chuỗi hiển thị thay vì gửi khoá cho client dịch (AC-2); companies.ts lệch khuôn `satisfies` so với bốn kho chuỗi anh em, mất chốt biên dịch cho khoá thiếu (AC-12); và menu 'Change stage' trong thao tác hàng loạt trên màn Deals chưa có khoá dịch (AC-1). Thêm mười ba phát hiện ngoài-hợp-đồng, phần lớn chỉ ra các chân đo chứng minh yếu hơn lời hứa của chúng. Returned to implementation.
Round 8: BLOCKED — máy chủ API (port 3001) không chạy trong lượt verify này, nên E1, E2, E11 (cần server sống) không đo được. Trong số 14 eval máy đo được, 12 PASS nhưng 2 FAIL thật, không liên quan tới server: E9 (`may-chu-ve.sh`) — cả ba lượt trả đầu /companies, /contacts, /deals thiếu lang=vi; E15 (`khong-may-quet.sh`) — 1/8 chặn (`chu-cung-jsx.mjs`) bị gắn cờ chỉ đọc mã nguồn, không chạm sản phẩm đang chạy. E13 giữ đúng ngưỡng 100% (247/247 khoá bốn chặn có vẻ ra). Eval mới E17 (chống chữ cứng trong JSX) PASS. Hội đồng E14 giữ UNCERTAIN ở cả ba lens, cùng hai câu hỏi từ round 7 (facet Hạn chốt, cặp nhãn 'Số'). 16 phát hiện review ghi ở review-findings.md (0 trong-hợp-đồng, 16 ngoài-hợp-đồng) — không triage được tác động lên verdict round này vì verdict đã là BLOCKED trước khi review chạy. Cần chạy lại `apps/api` + `apps/app` từ cây làm việc này rồi verify lại vòng sau.
