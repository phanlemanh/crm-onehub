---
schema_version: 2
feature_slug: tiep-thi-tuyen-doi-tac
verdict: PASS
failed_evals: []
reason: |
  Vòng 3 chạy làm HAI LƯỢT TÁCH RỜI, theo đường (a) người chọn sau khi hai vòng
  trước cùng hỏng vì làn bộ kiểm và làn lái trình duyệt giẫm lên nhau.

  Lượt máy (17 phép đo, KHÔNG chạy bộ kiểm cùng lúc): PENDING-JUDGMENT —
  0 phép đo trượt, 0 lệnh trượt, 0 chân bị chặn.
  Lượt lái (7 phép đo trình duyệt): PASS — 0 trượt, 0 chặn.

  Phán quyết hợp nhất là PENDING-JUDGMENT vì phép phán xét E19 trả UNCERTAIN:
  hội đồng ba mắt không thống nhất câu «sàn chặn bot ở mức làm hỏng nhịp hàng
  tháng không». Đó là câu người quyết ở Cổng Bằng chứng.

  BỐN LƯỢT CHẤM đã chạy trong vòng 3, mỗi lượt sửa một chỗ lượt trước phơi ra:
  (1) lượt máy đầu — bộ chấm phát hiện lệnh chỉ nạp HAI tệp kiểm trong khi hồ
  sơ khai năm, nên chân của AC-5 và AC-11 chưa từng chạy; (2) mở lệnh cho đủ
  năm tệp — lộ ra ba tệp kiểm XOÁ HÀNG CHÚNG KHÔNG TẠO RA, dọn cả dữ liệu người
  dùng; (3) sửa cô lập bộ kiểm — lộ ra hợp đồng hứa lô tới 500 mục mà trần thân
  yêu cầu thật chỉ ~360 mục; (4) chia lô và nâng trần cho đúng một đường —
  lượt này.
verified_by: fresh-context verification subagents
enforcement_mode: strict
bypass_used: false
verified_commit: 8b98a3d3329941a17df7ec226aeee9eb29f9d5db
human_signoff: Mạnh 2026-09-05 — ký trên giới hạn đã khai: 17 mục ngoài hợp đồng ghi vào giới hạn đã biết, 3 mục nhận nguyên trạng, Ngoài-13 tách thành hồ sơ riêng, và MỘT lỗ TRONG hợp đồng (AC-3: hỏng giữa lô nạp để lại phần đã ghi, lỗi trả về 500 trắng) mà máy khai chứ không sửa vì đã cạn lượt chấm theo luật lỗi-cùng-lớp.
---

# Evidence Report: tiep-thi-tuyen-doi-tac — vòng 3

| Lượt | Phép đo | Bộ kiểm | Phán quyết | Chạy ở commit |
|---|---|---|---|---|
| Máy (bản cuối) | 17 | 0 (chạy riêng) | PENDING-JUDGMENT | `49a9f63` |
| Lái trình duyệt | 7 | 0 | PASS | `3856984` |

**Điều người ký cần biết về lượt lái:** nó chạy ở `3856984`, trước ba commit
sau đó (`3eda9b3` cô lập bộ kiểm, `f3b0726` chia lô và trần thân yêu cầu,
`49a9f63` bằng chứng cào). Ba commit đó chạm bộ kiểm, bộ cào, và
`apps/api/src/create-app.ts` — **không chạm mã giao diện nào**. Rủi ro lệch là
thấp nhưng có thật, và nó được nói ra ở đây thay vì giấu.

Bốn lệnh chứng minh của kho chạy riêng sau cùng, tất cả xanh:
`bun run db:test && bun run test` · `check-types` · `lint` · `lint:slop`;
và bộ kiểm Python 28/28.

## Lượt máy


# Evidence Report: tiep-thi-tuyen-doi-tac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-11 | test | PASS |
| E16 | AC-12 | test | PASS |
| E17 | AC-13 | script | PASS |
| E18 | AC-14 | script | PASS |
| E19 | AC-14 | judgment | UNCERTAIN → Đạt (người) |
| E22 | AC-13 | script | PASS |
| E24 | AC-16 | test | PASS |
| E25 | AC-12 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tiep-thi-tuyen-doi-tac-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     129 expect() calls
    Ran 29 tests across 6 files. [6.39s]

- eval: E2
  run_id: minted-tiep-thi-tuyen-doi-tac-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     129 expect() calls
    Ran 29 tests across 6 files. [6.39s]

- eval: E3
  run_id: minted-tiep-thi-tuyen-doi-tac-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     129 expect() calls
    Ran 29 tests across 6 files. [6.39s]

- eval: E4
  run_id: minted-tiep-thi-tuyen-doi-tac-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     129 expect() calls
    Ran 29 tests across 6 files. [6.39s]

- eval: E5
  run_id: minted-tiep-thi-tuyen-doi-tac-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     129 expect() calls
    Ran 29 tests across 6 files. [6.39s]

- eval: E7
  run_id: minted-tiep-thi-tuyen-doi-tac-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     129 expect() calls
    Ran 29 tests across 6 files. [6.39s]

- eval: E8
  run_id: minted-tiep-thi-tuyen-doi-tac-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     129 expect() calls
    Ran 29 tests across 6 files. [6.39s]

- eval: E10
  run_id: minted-tiep-thi-tuyen-doi-tac-E10-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     129 expect() calls
    Ran 29 tests across 6 files. [6.39s]

- eval: E11
  run_id: minted-tiep-thi-tuyen-doi-tac-E11-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     129 expect() calls
    Ran 29 tests across 6 files. [6.39s]

- eval: E13
  run_id: minted-tiep-thi-tuyen-doi-tac-E13-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     129 expect() calls
    Ran 29 tests across 6 files. [6.39s]

- eval: E14
  run_id: minted-tiep-thi-tuyen-doi-tac-E14-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     129 expect() calls
    Ran 29 tests across 6 files. [6.39s]

- eval: E24
  run_id: minted-tiep-thi-tuyen-doi-tac-E24-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     129 expect() calls
    Ran 29 tests across 6 files. [6.39s]

- eval: E16
  run_id: minted-tiep-thi-tuyen-doi-tac-E16-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tt_app
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     209 expect() calls
    Ran 30 tests across 2 files. [423.00ms]

- eval: E25
  run_id: minted-tiep-thi-tuyen-doi-tac-E25-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tt_app
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     209 expect() calls
    Ran 30 tests across 2 files. [423.00ms]

- eval: E17
  run_id: minted-tiep-thi-tuyen-doi-tac-E17-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tt_crawl_test
  verified_at: 2026-09-05T04:10:00Z
  output: |
    Ran 28 tests in 0.066s

    OK

- eval: E18
  run_id: minted-tiep-thi-tuyen-doi-tac-E18-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tt_crawl_live
  verified_at: 2026-09-05T04:10:00Z
  output: |
    2026-09-05 08:21:34,926 WARNING 49/49 hồ sơ có tổng tin bằng tin mới 30 ngày — sàn chỉ công bố một con số
    2026-09-05 08:21:34,929 INFO đã ghi 1 lô ra đĩa trước khi gửi (49 mục): ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-batch.json
    2026-09-05 08:21:34,931 INFO chạy khô: 1 lô nằm trên đĩa, không gửi lô nào

- eval: E19
  judged_by: panel — domain-correctness, operational-feasibility, spec-alignment (fresh context)
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — (1) Tỷ lệ mất hồ sơ thấp và ổn định (1-2 bị chặn trên 50 gieo, tức 2-4%), và tổng đếm khớp đủ mọi lần thử ở cả 5 lượt (lan_thu_so_do + lan_thu_danh_ba + lan_thu_ho_so = lan_thu, ví dụ 13+5+50=68) — không cho thấy sàn chặn ở mức phá vỡ chi phí thuê tháng. (2) Tứ phân vị tin đăng của lô 49 hồ sơ là min 37 / q1 43 / trung vị 61 / q3 84 / max 436: ngưỡng 60 (Cao) có cơ sở vì chia mẫu gần đôi (26 cao/23 vừa), nhưng KHÔNG hồ sơ nào trong mẫu thấp hơn 37, nên ngưỡng 20 (Vừa) và 1 (Thấp) hoàn toàn chưa được dữ liệu thật chạm tới — không có căn cứ nói chúng hợp lý hay không. (3) 49/49 hồ sơ (100%) có số điện thoại theo log (`co_so_dien_thoai: 49`) — đủ dư để mở một chiến dịch gọi điện. Vì câu 2 chỉ trả lời được cho một trong ba ngưỡng, chưa đủ căn cứ để chốt PASS cho toàn bộ AC-14.
    - operational-feasibility: UNCERTAIN — (1) Có bằng chứng: 5 lượt chạy đều gieo 50, lấy được 48-49 (96-98%), bị chặn 1-2; tổng lần thử (lan_thu=68) khớp đúng tổng ba mục con (so_do+danh_ba+ho_so=13+5+50) ở cả 5 lượt nên tổng kết đếm đủ mọi lần thử — mức chặn thấp, không cho thấy sàn chặn ở mức làm hỏng thuê hàng tháng, dù nhãn "bi_chan" gộp cả lỗi trích xuất ("isCompany: không bóc được") lẫn chặn bot thật (chỉ 1/5 lượt có thông điệp "Blocked by anti-bot protection"). (2) Tứ phân vị tin_dang và tin_moi_30_ngay giống hệt nhau ở cả 5 lượt (vd min37/q1 43/trung vị 61/q3 84/max 436), xác nhận đúng lời khai hợp đồng là sàn chỉ công bố một con số; ngưỡng "Cao"=60 nằm sát trung vị và chia mẫu khoảng 28 cao/21 vừa — hợp lý cho mức Cao, nhưng sàn của mẫu (min=37) không có hồ sơ nào dưới 20, nên hai ngưỡng "Trung"=20 và "Thấp"=1 hoàn toàn chưa được kiểm chứng bằng dữ liệu thật. (3) co_so_dien_thoai bằng đúng lay_duoc ở cả 5 lượt (49/49, 48/48…) tức tỷ lệ có trường số điện thoại là 100%, đủ về mặt số lượng — nhưng toàn bộ 49 mục trong live-batch.json đều mang cùng một giá trị "09xxxxxxxx" y hệt, nên không thể xác nhận từ đúng ba file được cấp rằng đây là số thật quay được, hay chỉ là placeholder che cho hồ sơ nghiệm thu.
    - spec-alignment: PASS — (1) Không: lấy được 49/50 (98%, lần xấu nhất 48/50=96%), bị chặn chỉ 1-2/50; và chỉ 1 trong 5 lần chạy có cảnh báo "Blocked by anti-bot protection" thực sự (4/5 lần còn lại "bị chặn" thật ra là lỗi bóc trường isCompany, không phải chặn bot) — không cho thấy sàn chặn bot ở mức làm hỏng thuê hàng tháng. Tổng kết lan_thu=68 khớp đúng tổng ba pha (lan_thu_ho_so 50 + lan_thu_so_do 13 + lan_thu_danh_ba 5) và lan_thu_hong tăng đồng bộ khi bi_chan tăng (6→7 khi bi_chan 1→2) ở các lần chạy khác nhau, cho thấy phép đếm có vẻ bao trọn mọi lần thử qua cả ba pha, dù không mọi lần "hỏng" đều có dòng WARNING tường minh riêng. (2) Không: tứ phân vị (min 37, q1 43, trung vị 61, q3 84, max 436) cho thấy ngưỡng "cao"=60 nằm sát ngay dưới trung vị nên gần một nửa mẫu rơi vào "cao" — không chọn lọc được nhóm nhỏ; ngưỡng "vừa"=20 gần như vô nghĩa vì giá trị nhỏ nhất quan sát đã là 37. Đây đúng là việc hợp đồng đã khai chờ owner chỉnh trước chiến dịch đầu, và tứ phân vị được ghi lại đủ để owner thấy và quyết. (3) Có: 49/49 hồ sơ có số điện thoại (100%, xấu nhất 48/48=100%) — đủ để mở một chiến dịch gọi điện. Cả bốn số liệu AC-14 yêu cầu (lấy được, bị chặn, tỷ lệ số điện thoại, tứ phân vị) đều được ghi lại trong live-run.log và live-batch.json, đủ căn cứ cho quyết định mở chiến dịch đầu.
  rationale: Panel 2/3 lens UNCERTAIN, đề xuất chung UNCERTAIN — hai ngưỡng phân loại sản lượng "Trung"=20 và "Thấp"=1 chưa chạm dữ liệu thật (sàn mẫu min=37), và 49/49 số điện thoại trong live-batch.json đều cùng một giá trị placeholder "09xxxxxxxx" nên chưa xác nhận là số thật. spec-alignment cho PASS vì đọc đúng nghĩa hẹp của AC-14 (bốn số liệu có được ghi lại, không chặn bot phá chi phí) nhưng không bác bỏ hai khoảng trống trên.
  required_evidence:
    - Một lượt cào bổ sung (hoặc lượt thật kế tiếp) có hồ sơ với tin_dang bắc ngang mốc 20 — ví dụ cào từ một địa bàn/trang danh bạ có mật độ tin thấp hơn — rồi đính live-batch.json và live-run.log mới có tứ phân vị chạm được vùng dưới 60 (lý tưởng là vài hồ sơ trên và dưới 20); thiếu bằng chứng này thì không thể trả lời ngưỡng 20 và 1 có hợp lý hay không, và có bằng chứng này verdict câu 2 mới đổi từ UNCERTAIN sang PASS/FAIL cụ thể.
    - Một bản live-batch.json (hoặc live-run.log kèm mẫu) có ít nhất vài giá trị `phone` không đồng nhất/không phải chuỗi placeholder "09xxxxxxxx" — ví dụ che một phần theo quy ước thật (09xxxxx123, đủ 10 ký tự số khác nhau giữa các mục) — để xác nhận số điện thoại lấy được là số thật, không phải placeholder cố định.
    - Một lượt cào thật (live-run.log + live-batch.json mới) có ít nhất vài hồ sơ với tin_dang/tin_moi_30_ngay dưới 20 hoặc gần 1, để kiểm chứng hai ngưỡng «Trung»=20 và «Thấp»=1 có phân biệt đúng broker sản lượng thấp hay không — mẫu hiện tại có sàn min=37 nên chưa chạm hai ngưỡng đó.
  human_override: Đạt — Mạnh, 2026-09-05. AC-14 hứa GHI LẠI đủ bốn số liệu để người quyết có mở chiến dịch đầu hay không, và bốn số liệu đó đều có. Sàn không chặn tới mức làm hỏng nhịp hàng tháng: 49/50 hồ sơ lấy được, chỉ 1 trong 5 lượt có cảnh báo chặn bot thật. Nghi ngờ «49 số điện thoại giống hệt nhau nên chưa rõ là số thật» đã được bác bằng phép đo, đúng thứ required_evidence đòi: chuỗi giống nhau là do bước che danh tính thay MỌI số bằng một hằng (`redact.py`, `PHONE_STAND_IN`); bản trước khi che ở commit 982d771 có 49 mục với 49 số KHÁC NHAU, không mục nào bị che. Nghi ngờ còn lại người ký nhận nguyên: hai ngưỡng «Vừa»=20 và «Thấp»=1 chưa hồ sơ thật nào chạm tới (mẫu thấp nhất 37 tin) — đó là việc chỉnh tham số mà hợp đồng đã khai là của người trước chiến dịch đầu, không phải phép đo trượt.

- eval: E22
  run_id: minted-tiep-thi-tuyen-doi-tac-E22-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tt_crawl_to_ingest
  verified_at: 2026-09-05T04:10:00Z
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [230.00ms]

## Known limits

## Ngoài hợp đồng

## Analyst

E16, E25 (cmd: `cd apps/app && bun test test/messages-guard.spec.ts test/campaign-states.spec.ts`) — pass trên cả HEAD và diffBase (baseline: green), không phân biệt được feature này. Bài kiểm liệt kê `campaignMessages` trong danh sách MODULE và khẳng định quan hệ trạng thái→câu chữ (loading/empty/no-views) — cả hai mảng đó không đổi theo thay đổi nghiệp vụ chiến dịch round này, nên đây là regression-guard có chủ ý (chống lùi bản dịch/nhãn màn hình), không phải lỗ hổng đo lường; không cần viết lại.

## Variance

none — không eval nào trong vòng này có `runs` > 1, không có phương sai để người quyết.

## Iterations

Round 1: E15, E20 (chân "chủ" và "thiết kế") không chạy được — BLOCKED, driver/dev server chưa sẵn sàng khi verify. Quay lại triển khai.
Round 2: E21 (chân "bề rộng" — cắt cột theo bề rộng màn hình) fail exit 2. REJECT. Quay lại triển khai.
Round 3: Toàn bộ 17 eval máy PASS (test/script, cả AC-1 đến AC-16); E19 (ngưỡng phân loại sản lượng AC-14) UNCERTAIN từ panel (2/3 lens), E16/E25 non-discriminating trên baseline. PENDING-JUDGMENT — chờ người ở Cổng 2.


---

## Lượt lái trình duyệt (commit 3856984)


# Evidence Report: tiep-thi-tuyen-doi-tac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | ui-check | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | ui-check | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-11 | test | PASS |
| E15 | AC-12 | script | PASS |
| E16 | AC-12 | test | PASS |
| E17 | AC-13 | script | PASS |
| E18 | AC-14 | script | PASS |
| E19 | AC-14 | judgment | UNCERTAIN → Đạt (người) |
| E20 | AC-15 | script | PASS |
| E21 | AC-15 | script | PASS |
| E22 | AC-13 | script | PASS |
| E23 | AC-16 | ui-check | PASS |
| E24 | AC-16 | test | PASS |
| E25 | AC-12 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tiep-thi-tuyen-doi-tac-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E2
  run_id: minted-tiep-thi-tuyen-doi-tac-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E3
  run_id: minted-tiep-thi-tuyen-doi-tac-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E4
  run_id: minted-tiep-thi-tuyen-doi-tac-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E5
  run_id: minted-tiep-thi-tuyen-doi-tac-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E6
  run_id: e6v1788564734
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_luong
  verified_at: 2026-09-05T06:40:00+07:00
  screenshot: _acceptance/tiep-thi-tuyen-doi-tac/evidence/E6-goc-nhin.png
  observed: |
    Frame 1 (E6-goc-nhin.png, đọc bằng Read - ảnh): màn "Cá nhân" (danh sách cá nhân), ô tìm kiếm = "Range6v1788564734" (lọc theo run nonce), bảng hiện 4 dòng (Trâm/Diệp/Bảo/Quỳnh Range...), tất cả 4 dòng có cột "Sản lượng" = "Cao", chân trang ghi "... trong số 4". Khớp Expected (lọc màn Cá nhân theo Sản lượng=Cao, tập kết quả = 4).
    Frame 2 (E6-tao.png, đọc bằng Read - ảnh): hộp "Chiến dịch mới" đang mở, ô "Tên" = "Chiến dịch e6v1788564734", ô "Phân khúc" đang chọn = "Sản lượng cao e6v1788564734  4 cá nhân" (dropdown hiện rõ số 4 cạnh tên góc nhìn), ghi chú dưới ô "Chỉ hiện góc nhìn cá nhân đang dùng chung" xác nhận đây là góc nhìn đã lưu dùng chung từ bước trước. Khớp Expected (tạo chiến dịch từ đúng góc nhìn đã lưu, phân khúc hiện 4 cá nhân).
  network_observed: n-a (driver)

- eval: E7
  run_id: minted-tiep-thi-tuyen-doi-tac-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E8
  run_id: minted-tiep-thi-tuyen-doi-tac-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E9
  run_id: e9verify38957
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_luong
  verified_at: 2026-09-05T06:40:00+07:00
  screenshot: _acceptance/tiep-thi-tuyen-doi-tac/evidence/E9-dong-thoi-gian.png
  observed: |
    3 frame đọc bằng Read, tất cả khớp đúng 1 lượt của RUN_ID=e9verify38957:
    - E9-bat-dau.png: trang "Chiến dịch e9verify38957", "Đang chạy", "Bắt đầu lúc 6:34 5 thg 9, 2026", Thành viên=4, Đã gọi=0 (đúng TRƯỚC khi bấm kết quả).
    - E9-ghi.png: cùng trang, dòng "Trâm Range9verify38957" đã có thẻ "Trả lời" dưới cột Gần nhất, Đã gọi=1, Tỷ lệ trả lời=100% (đúng SAU khi bấm kết quả 'Trả lời').
    - E9-dong-thoi-gian.png: hồ sơ cá nhân "Trâm Range9verify38957" SAU KHI TẢI LẠI trang (URL ?record=contact:...&tab=activity, sheet mở lại từ đầu), tab Hoạt động hiện ĐÚNG 1 mục "HÔM NAY: Trả lời · Chiến dịch e9verify38957 — manh.phan · 6:34". Tiêu đề chứa cả nhãn kết quả 'Trả lời' (outcome.answered) VÀ tên chiến dịch (nonce) của đúng lượt này.
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-tiep-thi-tuyen-doi-tac-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E11
  run_id: minted-tiep-thi-tuyen-doi-tac-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E12
  run_id: n/a
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_luong
  verified_at: 2026-09-05T06:40:00+07:00
  screenshot: /Users/manhphan/dev/crm-onehub/_acceptance/tiep-thi-tuyen-doi-tac/evidence/E12-so-do.png
  observed: |
    Frame E12-so-do.png (1440x1000, đọc bằng Read): trang "Chiến dịch ttmtnl81oh" (Sản lượng cao ttmtnl81oh · Bắt đầu lúc 6:31 5 thg 9, 2026), badge "Đang chạy". Khối "Chiến dịch này": Thành viên=4, Đã gọi=2, Tỷ lệ trả lời=100% (Trả lời 2), Tỷ lệ hẹn gặp=50% (Hẹn gặp 1). Ngay dưới là khối "Mọi chiến dịch khác": Thành viên="—", Đã gọi=42, Tỷ lệ trả lời=100% (Trả lời 42), Tỷ lệ hẹn gặp=48% (Hẹn gặp 20) — hai khối xếp cạnh/dưới nhau rõ ràng, đúng "hàng đối chứng hiện cạnh hàng chiến dịch". Bảng thành viên bên dưới liệt kê 4 người (Trâm, Diệp, Báo, Quỳnh RangttmtnI81oh) với cột Gần nhất: Diệp="Hẹn gặp", Trâm="Không nghe", hai người còn lại "—" (chưa ghi) — khớp "3 lượt ghi trên 2 cá nhân" (tổng 3 lượt, 2 cá nhân đối trùng). Không thấy dấu hiệu mâu thuẫn với Expected. Góc trái dưới có widget "1 Issue" của dev tool, không liên quan nội dung nghiệp vụ.
  network_observed: n-a (driver)

- eval: E13
  run_id: minted-tiep-thi-tuyen-doi-tac-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E14
  run_id: minted-tiep-thi-tuyen-doi-tac-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E15
  run_id: minted-tiep-thi-tuyen-doi-tac-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_chu
  verified_at: 2026-09-05T06:40:00+07:00
  output: |
       [en] là câu của máy chủ: ĐÚNG — khớp nguyên văn, trừ khỏi phép so hai thứ tiếng
       KHÔNG phải chiều đo — hợp đồng khai câu này vẫn tiếng Anh; chặn ghi lại chữ thay vì trừ lặng. Trừ 1 chuỗi.
       đã ghi _acceptance/tiep-thi-tuyen-doi-tac/evidence/E15-chu-may-chu.txt

- eval: E16
  run_id: minted-tiep-thi-tuyen-doi-tac-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_app
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     209 expect() calls
    Ran 30 tests across 2 files. [712.00ms]

- eval: E17
  run_id: minted-tiep-thi-tuyen-doi-tac-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_crawl_test
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
    Ran 20 tests in 0.070s

    OK

- eval: E18
  run_id: minted-tiep-thi-tuyen-doi-tac-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_crawl_live
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
    2026-09-05 00:57:00,209 WARNING 49/49 hồ sơ có tổng tin bằng tin mới 30 ngày — sàn chỉ công bố một con số
    2026-09-05 00:57:00,211 INFO đã ghi ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-batch.json (49 mục)

- eval: E19
  criterion: AC-14
  executor: judgment
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  proposal: PASS
  votes:
  - domain-correctness: PASS — (1) Có — bị chặn thấp: bi_chan=1/50 gieo (2%), lan_thu_hong=6/68 lần thử (~8.8%); tổng lần thử đếm đủ vì 13 (sitemap) + 5 (danh bạ) + 50 (hồ sơ) = 68 = lan_thu, không sót tầng nào. (2) Không rõ ràng hợp lý — trung vị tin đăng = 61, sát ngay ngưỡng "Cao" = 60, tức khoảng phân nửa mẫu 49 hồ sơ đã rơi vào "Cao" (không chọn lọc); ngưỡng 20 và 1 hoàn toàn chưa được mẫu kiểm chứng vì giá trị nhỏ nhất trong mẫu là 37 (> 20) — đúng như hợp đồng đã tự khai "chưa có phân phối" và cần owner duyệt lại. (3) Có, đủ — 49/49 hồ sơ lấy được đều có trường số điện thoại (100%, co_so_dien_thoai=49=lay_duoc), thừa cho một chiến dịch gọi điện đầu tiên. Số liệu trong log và json khớp nhau, tứ phân vị tính đúng (kiểm tay: q1=43, trung vị=61, q3=84 khớp dữ liệu thô), và AC-14 là loại "judgment" — việc in ra các số này để người ký Cổng Phạm vi tự quyết ngưỡng là đúng vai trò của nó, không phải lỗi.
  - operational-feasibility: PASS — (1) Không — 49/50 gieo lấy được (98%), chỉ 1 bị chặn (2%), quá thấp để cho thấy sàn chặn bot ở mức làm hỏng chi phí thuê hàng tháng; tổng kết đếm đủ mọi lần thử: 13(sơ đồ)+5(danh bạ)+50(hồ sơ)+0(lộ số)=68=lan_thu, và 49(lay_duoc)+1(bi_chan)=50=gieo, cả hai chiều đều khớp. (2) Trung vị tin đăng (61) nằm sát ngay ngưỡng «cao»=60 nên khoảng một nửa mẫu rơi vào tier cao — đáng ngờ về độ chọn lọc — nhưng hợp đồng đã tự khai ngưỡng 60/20/1 "chưa có phân phối" và mức sản lượng thật xếp theo tổng tin đang đăng (không phải tin mới 30 ngày, vì sàn chỉ công bố một con số cho cả hai trường); AC-14 chỉ đòi in tứ phân vị để owner tự chỉnh trước chiến dịch đầu, và bằng chứng đã làm đúng việc đó (49/49 hồ sơ có min=37, q1=43, median=61, q3=84, max=436, đủ cho owner thấy ngưỡng cần xét lại). (3) Có — 49/49 hồ sơ lấy được có số điện thoại (100%), thừa đủ để mở một chiến dịch gọi điện.
  - spec-alignment: UNCERTAIN — (1) Có — 49/50 lấy được (98%), 1/50 bị chặn (2%); tổng lần thử ghi 68 khớp đúng tổng ba loại trang (so_do 13 + danh_ba 5 + ho_so 50 = 68), tổng kết đếm đủ và không cho thấy sàn chặn bot ở mức làm hỏng thuê hàng tháng. (2) Không đủ căn cứ — ngưỡng "60" nằm sát ngay trung vị mẫu (trung_vi=61), khiến 26/49 hồ sơ (53%) rơi vào mức Cao, quá rộng cho mức cao nhất; mẫu có min=37 nên ngưỡng "20" và "1" hoàn toàn không có dữ liệu nào trong lô này để kiểm — hợp đồng cũng tự khai ngưỡng "chưa có phân phối" và để owner chỉnh, nên phần này cần người quyết chứ log không đủ chứng minh hợp lý hay không. (3) Có về số lượng — log ghi co_so_dien_thoai=49/49 lay_duoc (100%), nhưng live-batch.json không mang giá trị số thật để đối chiếu: cả 49 mục đều là cùng một chuỗi che "09xxxxxxxx", nên tỷ lệ 100% chỉ xác nhận trường có giá trị, không xác nhận đó là số thật/khác nhau đủ gọi được.
    required_evidence:
    - Danh sách 49 số điện thoại thật (chưa che) hoặc một bản ghi kiểm định dạng số (ví dụ script kiểm regex số di động VN) từ pipeline cào, để xác nhận co_so_dien_thoai=49 là 49 số thật khác nhau chứ không phải placeholder — nếu thấy số thật hợp lệ, câu 3 đổi từ 'không kiểm chứng được' sang 'có'.
    - Một lượt cào hoặc mẫu bổ sung có tin_dang trải xuống dưới 37 (chạm vùng 20 và dưới 20) để tứ phân vị thật sự phủ được ngưỡng 20/1 — hiện min=37 nên hai ngưỡng đó không có điểm dữ liệu nào để đánh giá hợp lý hay không.
    - Ghi chú quyết định của owner (trong opportunity.md hoặc decisions.jsonl) đối chiếu tứ phân vị (min 37, q1 43, trung_vi 61, q3 84) với ngưỡng 60/20/1 và xác nhận có giữ 60 hay chỉnh lại — vì 53% mẫu rơi vào Cao là dấu hiệu ngưỡng có thể quá thấp mà hợp đồng đã lường trước phải có người chỉnh.
  human_override: Đạt — Mạnh, 2026-09-05. AC-14 hứa GHI LẠI đủ bốn số liệu để người quyết có mở chiến dịch đầu hay không, và bốn số liệu đó đều có. Sàn không chặn tới mức làm hỏng nhịp hàng tháng: 49/50 hồ sơ lấy được, chỉ 1 trong 5 lượt có cảnh báo chặn bot thật. Nghi ngờ «49 số điện thoại giống hệt nhau nên chưa rõ là số thật» đã được bác bằng phép đo, đúng thứ required_evidence đòi: chuỗi giống nhau là do bước che danh tính thay MỌI số bằng một hằng (`redact.py`, `PHONE_STAND_IN`); bản trước khi che ở commit 982d771 có 49 mục với 49 số KHÁC NHAU, không mục nào bị che. Nghi ngờ còn lại người ký nhận nguyên: hai ngưỡng «Vừa»=20 và «Thấp»=1 chưa hồ sơ thật nào chạm tới (mẫu thấp nhất 37 tin) — đó là việc chỉnh tham số mà hợp đồng đã khai là của người trước chiến dịch đầu, không phải phép đo trượt.

- eval: E20
  run_id: minted-tiep-thi-tuyen-doi-tac-E20-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_thiet_ke
  verified_at: 2026-09-05T06:40:00+07:00
  output: |
    E20 THIET KE _acceptance/tiep-thi-tuyen-doi-tac/evidence/E20-danh-sach.html verdict=PASS
    E20 THIET KE _acceptance/tiep-thi-tuyen-doi-tac/evidence/E20-chien-dich.html verdict=PASS

- eval: E21
  run_id: minted-tiep-thi-tuyen-doi-tac-E21-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_be_rong
  verified_at: 2026-09-05T06:40:00+07:00
  output: |
    Gần nhất               o=   46.92px chu=   50.19px  cắt + ba chấm + trợ năng
    Ghi kết quả            o=  271.52px chu=   63.41px  đủ
    E21 BE RONG 1024px=không cột nào bị cắt · 768px=mọi chỗ cắt có ba chấm và chữ đầy đủ

- eval: E22
  run_id: minted-tiep-thi-tuyen-doi-tac-E22-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_crawl_to_ingest
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [257.00ms]

- eval: E23
  run_id: e23v2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tt_ui_trang_thai
  verified_at: 2026-09-05T06:40:00+07:00
  screenshot: /Users/manhphan/dev/crm-onehub/_acceptance/tiep-thi-tuyen-doi-tac/evidence/E23-nhap.png
  observed: |
    E23-nhap.png: campaign "Chiến dịch trạng thái e23v2" ở trạng thái Nháp, header có nút "Bắt đầu", bảng 4 dòng thành viên không có nút kết quả nào trên dòng nào (0 nút/dòng) — khớp nhap=0nut. E23-ket-thuc-bam.png: ngay sau khi bấm Kết thúc (trước khi tải lại) — huy hiệu đã đổi "Đã kết thúc", dòng phụ đề đã có "Bắt đầu lúc 6:30 5 thg 9, 2026 · Kết thúc lúc 6:30 5 thg 9, 2026", bảng vẫn 4 dòng không nút kết quả (frame trung gian, không phải điểm kiểm cuối). E23-ket-thuc.png (SAU KHI TẢI LẠI trang, đây là frame đối chiếu Expected): huy hiệu "Đã kết thúc" ở góc trên phải, KHÔNG còn nút "Bắt đầu" nào ở khu vực actions (chỉ còn text huy hiệu) — khớp batdau=an; bảng 4 dòng không có nút kết quả nào — khớp ketthuc=0nut; dòng phụ đề vẫn giữ mốc "Bắt đầu lúc ... · Kết thúc lúc ...". Không có frame riêng cho trạng thái "chạy" (script không chụp bước đó) nhưng dòng log in ra chay=5nut đến từ page.evaluate ngay sau khi bấm Bắt đầu, trước khi bấm Kết thúc.
  network_observed: n-a (driver)

- eval: E24
  run_id: minted-tiep-thi-tuyen-doi-tac-E24-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_api
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     91 expect() calls
    Ran 23 tests across 2 files. [1290.00ms]

- eval: E25
  run_id: minted-tiep-thi-tuyen-doi-tac-E25-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tt_app
  verified_at: 2026-09-05T01:15:00+07:00
  output: |
     0 fail
     209 expect() calls
    Ran 30 tests across 2 files. [712.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run db:test && bun run test
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bun_run_db_test_bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-05T01:15:00+07:00

- cmd: bunx turbo run check-types --force
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bunx_turbo_run_check_types_force-r2
  exit_code: 0
  verified_at: 2026-09-05T01:15:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-05T01:15:00+07:00

- cmd: bun run lint:slop
  run_id: minted-tiep-thi-tuyen-doi-tac-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-05T01:15:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round trước — baseline không đo lại round này.

none — round này không đo lại baseline (P2, evals.yaml không đổi từ lần baseline cuối); danh sách eval không-phân-biệt giữ nguyên rỗng theo dữ liệu round trước, không có phép đo mới nào để xếp vào đây.

## Variance

none — không có eval nào mang field runs > 1 trong round này (mọi eval deterministic, runs=1).

## Iterations

Round 1: E15, E20 BLOCKED — bộ rang UI (chien-dich.mjs chu / thiet-ke) không dựng được, exit không trả về (cannot_run). Trả về triển khai.
Round 2: E15, E20 đã chạy được và PASS; nhưng E21 (AC-15, bề rộng 1024/768px) FAIL — RANG CỤN: không suy được slug từ http://localhost:3000/ (trả 200 mà không có header Location), phiên hỏng hoặc kho chưa có nơi làm việc. Verdict REJECT — trả về triển khai.
Round 3: Tách lượt máy và lượt lái trình duyệt (quyết định d-20260905T040000Z-tach-lan) — lượt máy chạy trước (sinh lại bộ khách, dựng lại cơ sở dữ liệu thử), lượt lái trình duyệt chạy sau khi cây đã tĩnh. E21 (bề rộng 1024/768px) nay PASS: ở 1024px không cột nào bị cắt, ở 768px mọi chỗ cắt có ba chấm và chữ đầy đủ. E6, E9, E12, E15, E20, E23 chạy lại trên cùng lượt và giữ PASS. failed_evals rỗng.

### Re-pin lần 1 — 2026-09-05, do gộp nhánh nền mang vòng màn Cài đặt vào cây

run_id: repin-tiep-thi-tuyen-doi-tac-20260905T063108Z
sha: 8b98a3d3329941a17df7ec226aeee9eb29f9d5db · suites: 4 lệnh exit 0

Nhánh nền đi trước 21 commit của một vòng khác (`man-cai-dat-noi-tieng-viet`).
Gộp về làm cây đổi, nên mốc bằng chứng cũ (`49a9f63`) lệch cây và chốt chặn chặn
merge. Không mã nào của vòng này đổi — mười tệp trong danh sách lệch đều thuộc màn
Cài đặt. Làn máy chạy lại trọn tại cây đã gộp: 1320 bài kiểm, 0 trượt, 0 hit đệm
(lượt đầu trả xanh từ đệm nên đã ép chạy lại bằng `--force`), cộng 28 bài của bộ cào.
Chữ ký người không bị đụng.
