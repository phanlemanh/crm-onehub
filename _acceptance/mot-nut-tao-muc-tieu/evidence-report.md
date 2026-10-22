---
schema_version: 2
feature_slug: mot-nut-tao-muc-tieu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e6c2463394dc2a596bf6983ae119ba934d98b68f
human_signoff: Phan Le Manh 2026-10-22 — ký Cổng Bằng chứng trên vòng chấm 2 (PASS, 16 eval, 7 suite xanh; vòng 1 REJECT vì năm chỗ yếu thước, đã sửa); Ngoài-3 và Ngoài-9 mở hợp đồng mới, 11 mục ghi Known limits
---

# Evidence Report: mot-nut-tao-muc-tieu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-3 | judgment | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-4 | script | PASS |
| E9 | AC-5 | test | PASS |
| E10 | AC-5 | test | PASS |
| E11 | AC-6 | test | PASS |
| E12 | AC-6 | test | PASS |
| E13 | AC-7 | test | PASS |
| E14 | AC-7 | test | PASS |
| E15 | AC-8 | test | PASS |
| E16 | AC-9 | ui-check | PASS |

Vòng 2 chạy lại E1, E2, E3, E4, E6, E8, E9, E11, E13, E15, E16 và bảy lệnh suite. E7, E10, E12, E14 mang từ vòng 1 (delta không chạm paths của chúng). E5 là mục judgment: đề xuất của panel là PASS, người chốt ở Cổng 2.

## Evidence

- eval: E1
  run_id: minted-mot-nut-tao-muc-tieu-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_dau_trang
  verified_at: 2026-10-22T12:41:31Z
  output: |
    Ran 1 test across 1 file. [3.16s]

- eval: E2
  run_id: minted-mot-nut-tao-muc-tieu-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_man_doc
  verified_at: 2026-10-22T12:41:31Z
  output: |
    Ran 1 test across 1 file. [2.43s]

- eval: E3
  run_id: minted-mot-nut-tao-muc-tieu-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mnt_man
  verified_at: 2026-10-22T12:41:31Z
  output: |
    phien-do: xong — mã 0
    (một lần chạy bàn đo màn chung cho E3 và E8)

- eval: E4
  run_id: minted-mot-nut-tao-muc-tieu-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_hop
  verified_at: 2026-10-22T12:41:31Z
  output: |
    Ran 5 tests across 1 file. [3.22s]

- eval: E6
  run_id: minted-mot-nut-tao-muc-tieu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_tu_viet
  verified_at: 2026-10-22T12:41:31Z
  output: |
    Ran 2 tests across 1 file. [2.74s]

- eval: E7
  run_id: minted-mot-nut-tao-muc-tieu-E7-r1
  exit_code: 0
  verifier: config:executors.test.mnt_api_muc_tieu
  verified_at: 2026-10-22T12:07:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-mot-nut-tao-muc-tieu-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mnt_man
  verified_at: 2026-10-22T12:41:31Z
  output: |
    phien-do: xong — mã 0
    (cùng một lần chạy bàn đo màn với E3)

- eval: E9
  run_id: minted-mot-nut-tao-muc-tieu-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_tu_mau
  verified_at: 2026-10-22T12:41:31Z
  output: |
    Ran 3 tests across 1 file. [2.54s]

- eval: E10
  run_id: minted-mot-nut-tao-muc-tieu-E10-r1
  exit_code: 0
  verifier: config:executors.test.mnt_api_tu_mau
  verified_at: 2026-10-22T12:07:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-mot-nut-tao-muc-tieu-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_bang_tinh
  verified_at: 2026-10-22T12:41:31Z
  output: |
    Ran 2 tests across 1 file. [1.98s]

- eval: E12
  run_id: minted-mot-nut-tao-muc-tieu-E12-r1
  exit_code: 0
  verifier: config:executors.test.mnt_api_nhap
  verified_at: 2026-10-22T12:07:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-mot-nut-tao-muc-tieu-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_soan
  verified_at: 2026-10-22T12:41:31Z
  output: |
    Ran 4 tests across 1 file. [2.87s]

- eval: E14
  run_id: minted-mot-nut-tao-muc-tieu-E14-r1
  exit_code: 0
  verifier: config:executors.test.mnt_api_soan
  verified_at: 2026-10-22T12:07:09Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-mot-nut-tao-muc-tieu-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mnt_khoa
  verified_at: 2026-10-22T12:41:31Z
  output: |
    Ran 1 test across 1 file. [3.42s]

- eval: E16
  run_id: minted-mot-nut-tao-muc-tieu-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mnt_man
  verified_at: 2026-10-22T12:41:31Z
  screenshot: evidence/cua-toi-dau-trang-1280.png
  observed: |
    Da mo tung anh bang Read.
    1) cua-toi-dau-trang-1280: tieu de "Muc tieu"; goc phai dau trang co dung hai nut "Hoi Kara" (ve Kara AI) va nut xanh "+ Them muc tieu"; khong co nut "…", khong co nhom "Soan". Phan duoi co "Can cap nhat tuan nay", "Don vi ban dan - Kinh doanh mien Bac", "KR ban phu trach". Dat.
    2) bo-okr-hop-1280: hop "Them muc tieu" nam giua man; phu de "Muc tieu moi cua Kinh doanh mien Bac. Chon cach bat dau." (goi ten don vi); bon dong theo thu tu Tu viet, Tu mau, Tu bang tinh, Soan cung Kara; dong Soan co bieu tuong dau tia sang "AI" kem nhan Kara o goc phai; dong Soan mo di va ghi "Chi mo khi chu ky dang lap ke hoach..." vi chu ky Quy 4 dang chay (trang thai khoa dung nghiep vu). Dat.
    3) suc-khoe-dau-trang-1280: dau trang Suc khoe chi co nut "Hoi Kara" (nen toi/xam), khong co nut to mau xanh, khong co "Them muc tieu". Dat.
    4) cua-toi-hop-375: hop vua be ngang man (le ~16px moi ben), tieu de + phu de xuong dong gon, bon dong Tu viet / Tu mau / Tu bang tinh / Soan cung Kara doc tron, khong cat chu, dong Soan co bieu tuong Kara; khong tran ngang. Dat.
    5) bo-okr-hop-375: giong het anh 4 (cung hop tren cung don vi): hop vua man, bon dong tron chu, khong tran ngang. Dat.
    Doi chieu Expected: khong mau thuan; ban do xac nhan so do tran ngang 0, dong cat 0, vung bam 4/4 cho ca ba anh hop.
  network_observed: n-a (driver)
  output: |
    - DUNG AC-9 cua-toi-hop-375: tran ngang 0, dong bi cat 0, vung bam tron 4/4
    - DUNG AC-9 bo-okr-hop-375: tran ngang 0, dong bi cat 0, vung bam tron 4/4
    Du 5 anh trong evidence/: cua-toi-dau-trang-1280.png, bo-okr-hop-1280.png, suc-khoe-dau-trang-1280.png, cua-toi-hop-375.png, bo-okr-hop-375.png. Ban sao theo buoc: E16-step1..5.png. Network: driver la script bun, khong doc duoc network -> n-a (driver), ghi E16-network.txt.
    Luu y: cua-toi-hop-375 va bo-okr-hop-375 trung md5 vi hop o 375 phu kin man den va cung noi dung, khong phai loi.

- eval: E5
  judged_by: judge-panel (3 lens, fresh context) — de xuat, nguoi chot o Cong 2
  verdict: PASS
  rationale: Panel de xuat PASS. Bon cau mo ta cua bon duong, dong "Tiep cuoc dang soan" va ba cau ly do khoa co mat o ca ban vi va en trong apps/app/lib/messages/okr.ts (dong 48-79 ban vi, 829-860 ban en), goi AI la Kara, khong chu ky thuat. Hai lens PASS (operational-feasibility, spec-alignment). Mot lens chua ket luan duoc (domain-correctness), xem tung phieu ben duoi.
  votes:
    - domain-correctness: UNCERTAIN — Cac cau mo ta noi ro nguoi lam gi, khong co ten ky thuat, goi AI la «Kara», ban EN giu cung nghia. Hai cho chua ket luan duoc tu ba tep duoc phep doc. Mot la loi chi dan «Cài đặt › OKR» trong cau khoa Tu mau (dong 72 va 853) khong khop ten khu «Cài đặt › Chương trình OKR» o dong 137 va 919, nen chua ro nguoi dung co tim dung cho them mau khong. Hai la dong «Tiếp cuộc đang soạn» (EN «Continue the open draft») khong co cau mo ta; chu «cuộc» va «draft» co the bi hieu nham voi trang thai «Nháp» cua muc tieu.
    - operational-feasibility: PASS — Tieu de, cau don vi dich, bon cau mo ta duong, «Tiếp cuộc đang soạn» va ba cau ly do khoa deu dung loi nguoi dung, AI goi la Kara. Cau khoa cua Tu mau va cau ly do pha cua Soan noi ro khi nao mo hoac nen lam gi thay. Ban EN giu cung nghia. Hai diem nho khong du de chan: «của bạn» trong cau Tu mau gan nhu thua; cau pha goi y «Từ mẫu» du duong do co the cung dang khoa.
    - spec-alignment: PASS — Bon cau mo ta noi ro nguoi lam gi o moi duong: go cau muc tieu, chon mau roi dien so, dan roi xem truoc roi ghi, tro chuyen voi Kara. Ba cau ly do khoa noi khi nao mo lai hoac nen chon duong nao thay. Ban EN giu cung nghia, «Tiếp cuộc đang soạn» ung voi «Continue the open draft».
  required_evidence:
    - Ten nhan that cua trang cai dat noi quan tri them mau OKR (nhan thanh ben Cai dat hoac tieu de trang mau OKR). Ban ghi bao cao tra thay messages/settings.ts dat nhan muc la «Chương trình OKR» (EN «OKR program»); chua xac nhan trang mau OKR nam duoi nhan nao. Neu trang mau nam duoi nhan do thi loi chi dan «Cài đặt › OKR» o dong 72 va 853 cua okr.ts can doi cho khop.
    - Tu dien CONTEXT.md co muc «cuộc soạn» (hoac tuong duong) va ban tieng Anh tuong ung, de go nghi van ve chu «cuộc» va «draft».
    - Anh hop «Thêm mục tiêu» o trang thai co cuoc soan dang mo (ban do man 1280x800), cho thay dong «Tiếp cuộc đang soạn» hien cung cau mo ta nao.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-22T12:41:31Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-22T12:41:31Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-22T12:41:31Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-22T12:41:31Z

- cmd: bunx turbo run lint --force
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-22T12:41:31Z

- cmd: bun run lint:slop
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-22T12:41:31Z

- cmd: bunx turbo run build --force
  run_id: minted-mot-nut-tao-muc-tieu-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-22T12:41:31Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Ghi chú: E3 và E8 là hai eval có baseline phân biệt được (red). Các eval DOM còn lại là eval mới nên baseline không đo (xem mục dưới). E7, E10, E12, E14 là bài API có sẵn mang từ vòng 1, đúng như `expected` của chúng khai: «Không phải phép đo mới», giữ vai trò bảo vệ hồi quy cho đường ghi, nên không liệt kê.

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-dau-trang: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-man-doc: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-hop: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-tu-viet: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-tu-mau: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-bang-tinh: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-soan: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t mnt-khoa: bo qua baseline: tep apps/app/test/mot-nut-tao-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT — năm phát hiện trong hợp đồng về độ yếu của thước đo (AC-2, AC-4, AC-7, AC-8). Trả về sửa thước ở commit 18ca9ae0d.
Round 2: các eval chạy lại đều PASS trên commit e6c2463394dc2a596bf6983ae119ba934d98b68f; E7, E10, E12, E14 mang từ vòng 1. Mốc verified_at của các khối vòng 2 là mốc ghi báo cáo, sau lần ghi sổ cuối 2026-10-22T12:33:19Z.

