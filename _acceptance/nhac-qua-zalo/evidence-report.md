---
schema_version: 2
feature_slug: nhac-qua-zalo
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0ab96e3963f5c7dc00118505e87a1c27f5318c0e
human_signoff: Phan Le Manh 2026-09-23
---

# Evidence Report: nhac-qua-zalo

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | test | PASS |
| E13 | AC-12 | test | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-13 | test | PASS |
| E16 | AC-13 | test | PASS |
| E17 | AC-14 | ui-check | PASS |
| E18 | AC-14 | test | PASS |
| E19 | AC-7 | test | PASS |
| E20 | AC-7 | test | PASS |
| E21 | AC-15 | test | PASS |
| E22 | AC-10 | test | PASS |
| E23 | AC-15 | test | PASS |

## Evidence

- eval: E1
  run_id: mudxv4xebxzm
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_chon_kenh
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    13 expect() calls
    Ran 13 tests across 1 file. [359.00ms]
    test-run: dropped crm_mudxv4xebxzm_test

- eval: E2
  run_id: mudxv50samlf
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_gui_zalo
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    11 expect() calls
    Ran 2 tests across 1 file. [673.00ms]
    test-run: dropped crm_mudxv50samlf_test

- eval: E3
  run_id: mudxv69nykq2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_tran_zalo
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    5 expect() calls
    Ran 2 tests across 1 file. [941.00ms]
    test-run: dropped crm_mudxv69nykq2_test

- eval: E4
  run_id: mudxv669cu5j
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_lech_kenh
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [759.00ms]
    test-run: dropped crm_mudxv669cu5j_test

- eval: E5
  run_id: mudxv5h6d5om
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_zalo_loi
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    3 expect() calls
    Ran 3 tests across 1 file. [516.00ms]
    test-run: dropped crm_mudxv5h6d5om_test

- eval: E6
  run_id: mudxv5x0qkkn
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_khong_token
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    8 expect() calls
    Ran 4 tests across 1 file. [504.00ms]
    test-run: dropped crm_mudxv5x0qkkn_test

- eval: E7
  run_id: minted-nhac-qua-zalo-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_noi_ma
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    12 expect() calls
    Ran 1 test across 1 file. [376.00ms]
    test-run: dropped crm_mudxv5fe3jsy_test

- eval: E19
  run_id: mudxvjc0qbbx
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_tao_ma_api
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    Ran 3 tests across 1 file. [803.00ms]
    test-run: dropped crm_mudxvjc0qbbx_test
    EXIT_CODE=0

- eval: E20
  run_id: minted-nhac-qua-zalo-E20-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_nut_noi_go
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    0 fail
    3 expect() calls
    Ran 3 tests across 1 file. [938.00ms]

- eval: E8
  run_id: minted-nhac-qua-zalo-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_ma_hong
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    7 expect() calls
    Ran 2 tests across 1 file. [754.00ms]
    test-run: dropped crm_mudxv6o2olyr_test

- eval: E9
  run_id: mudxvf5yce17
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_chong_do
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    3 expect() calls
    Ran 2 tests across 1 file. [350.00ms]
    test-run: dropped crm_mudxvf5yce17_test

- eval: E10
  run_id: mudxvgsqsh2e
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_noi_lai
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [355.00ms]
    test-run: dropped crm_mudxvgsqsh2e_test

- eval: E22
  run_id: minted-nhac-qua-zalo-E22-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_go_xac_nhan
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    0 fail
    5 expect() calls
    Ran 4 tests across 1 file. [577.00ms]

- eval: E11
  run_id: mudxvhstx9qp
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_go_zalo
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    9 expect() calls
    Ran 1 test across 1 file. [881.00ms]
    test-run: dropped crm_mudxvhstx9qp_test

- eval: E12
  run_id: mudxvhlufrig
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_trung_tin
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    Ran 3 tests across 1 file. [564.00ms]
    test-run: dropped crm_mudxvhlufrig_test

- eval: E13
  run_id: mudxvhau27q4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_luu_uu_tien
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    14 expect() calls
    Ran 1 test across 1 file. [932.00ms]
    test-run: dropped crm_mudxvhau27q4_test

- eval: E14
  run_id: minted-nhac-qua-zalo-E14-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_chon_kenh_man
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    0 fail
    9 expect() calls
    Ran 4 tests across 1 file. [517.00ms]

- eval: E15
  run_id: minted-nhac-qua-zalo-E15-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_trang_thai
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    34 expect() calls
    Ran 5 tests across 1 file. [908.00ms]
    test-run: dropped crm_mudxvizyibad_test

- eval: E16
  run_id: minted-nhac-qua-zalo-E16-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_trang_thai_man
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    0 fail
    8 expect() calls
    Ran 5 tests across 1 file. [481.00ms]

- eval: E21
  run_id: mudxvpsvwuri
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_trang_thai_lien_ket
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    7 expect() calls
    Ran 1 test across 1 file. [753.00ms]
    test-run: dropped crm_mudxvpsvwuri_test

- eval: E23
  run_id: minted-nhac-qua-zalo-E23-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_lam_moi
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    0 fail
    3 expect() calls
    Ran 2 tests across 1 file. [618.00ms]

- eval: E18
  run_id: design-gate-ee4059f7d8
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nqz_san_thiet_ke
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    "blocking": [],
    "findings": []
    }

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-nhac-qua-zalo-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-23T17:25:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-nhac-qua-zalo-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-23T17:25:00+07:00

- cmd: bun run lint:slop
  run_id: minted-nhac-qua-zalo-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-23T17:25:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-nhac-qua-zalo-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-23T17:25:00+07:00

- eval: E17
  run_id: E17-AC-14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-23T17:25:00+07:00
  output: |
    Tat server: kill DUNG 2 PID goc (87923 api, 87930 app; cong them 2 PID vo bash wrapper 87920/87927), KHONG dung pkill -f. Xac nhan lsof -nP -iTCP:3300/-iTCP:3301 -sTCP:LISTEN deu RONG sau khi tat.

    KET LUAN: exitCode=0 — ca 6 dong Expected deu thay dung tren anh that (da Read tung file, doi chieu tung dong), moi assertion HTTP/DOM/JS deu PASS, moi ho so gieo da don sach dung snapshot goc, khong file code nao con thay doi.
  screenshot: /Users/manh-macmini/dev/crm/.claude/worktrees/nhac-qua-zalo/_acceptance/nhac-qua-zalo/evidence/E17-ma-cho-1440.png
  observed: |
    Mo tung file bang Read (anh that, khong doan tu code):
    - E17-ma-cho-1440.png: khoi "Zalo cua ban" hien "Nhắn mã này cho Bot OneHub trên Zalo." + o so "247 541" (2 nhom x3 chu so) + nut "Chép mã" + "Đang chờ bạn nhắn · hết hạn lúc 17:35". Nhom nut Tự động/Zalo/Slack (Tự động dang chon), 2 dong ly do khoa "Zalo: Nối Zalo trước." va "Slack: Slack chưa nhận ra bạn — nhờ quản trị viên ghép người ở Kết nối › Slack.". Sidebar "Cài đặt" co muc "Thông báo của bạn" duoc boi den (active).
    - E17-ma-cho-375.png: cung noi dung (o so khac "944 039" do goi lai qua nut that trong trinh duyet), khong tran ngang (scrollWidth===innerWidth=375 do bang JS = true), chu doc duoc.
    - E17-lech-1440.png va E17-lech-375.png: khoi Zalo doi thanh "Đã nối · E17 Login Zalo" + nut "Gỡ"; nhom kenh dang chon "Slack" (vien xanh); Alert mau cam "Nhắc sáng mai sẽ qua Zalo — Kênh bạn chọn đang chưa dùng được, nên tin đi đường còn lại để bạn không lỡ việc." — dung dong canh bao lech kenh yeu cau. 375 khong tran ngang (scrollWidth check = true).
    - E17-zalo-tat-1440.png: khoi Zalo hien "Zalo chưa bật cho xưởng này. Nhờ quản trị viên bật trong Kết nối › Zalo."; ca hai nut Zalo/Slack khoa; canh bao lech BIEN MAT (dung logic: zaloDuoc=false nen khong con lech).
    - E17-ket-noi-song-1440.png: header Zalo cham xanh + "Bot OneHub · trả lời lần cuối lúc 17:19 23-09" (KHONG canh bao). Dong tieu de "4/10 người đã nối Zalo" — khop DUNG voi GET /rest/zalo/workspace tra ve {daNoi:4, tong:10} luc chup (dinh dang X/Y dung nghia dong, dung theo Expected da sua "x/y bang dung daNoi/tong tra luc chup", khong con doi hoi chuoi co dinh "3/7"). Danh sach 10 nguoi, dung 4 dong "Đã nối" (Ada Okafor, manh.phan, Marcus Lindqvist, Priya Raman) khop chinh xac nguoi da gieo.
    - E17-ket-noi-im-1440.png: header chuyen cham cam + "Bot OneHub · trả lời lần cuối lúc 17:10 23-09", Alert "Bot không trả lời từ 17:10 23-09 — Tác tử có thể đang tắt. Người đang chờ nối sẽ không nhận được xác nhận, và nhắc sáng mai có thể không đi." — dung canh bao "bot khong tra loi" yeu cau; van "4/10".
    - E17-ket-noi-song-375.png: cung trang thai song (xanh, "4/10 người đã nối Zalo"), khong tran ngang (scrollWidth===innerWidth=375 do bang JS = true; vai o ten/gio bi rut gon bang dau "..." trong the cua rieng no, khong phai tran trang).
    Doi chieu 6 dong Expected: ca 6 dong deu THAY DUNG tren anh that, khong suy tu ma.
  network_observed: unscoped-partial

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E17 failed — command `ui-check:E17` exited 1 (exitCode=1). Dòng Expected 4 của E17 đòi đúng chuỗi "3/7" người đã nối, nhưng frame chụp được cho ra "4/10" vì môi trường DB dev đang dùng chung giữa nhiều worktree đang chạy song song (tổng thành viên workspace là 10, không phải 7) cộng với bước 7 (gieo lệch kênh) tự gieo ZaloLink cho chính người đăng nhập trước bước 9 (chụp trang kết nối), đẩy số đã nối từ 3 lên 4 — logic và cả hai trạng thái sống/im vẫn đúng, chỉ sai đúng phần chữ số được trích dẫn. Verdict REJECT, chờ quyết định ở Gate 2 (mở rộng contract cho môi trường DB dùng chung, hay bắt buộc một bàn đo cô lập cho E17).
Round 2: Expected dòng 4 của E17 được sửa thành "x/y bằng đúng daNoi/tong tra lúc chụp" thay cho chuỗi cố định "3/7" (theo hướng quyết định ở Gate 2 round 1); toàn bộ 23 eval + 4 lệnh suite hồi quy đều PASS (exit 0), gồm cả E17 với 8 frame khớp đủ cả 6 dòng Expected trên ảnh thật (đối chiếu bằng Read từng file). Verdict PASS.
