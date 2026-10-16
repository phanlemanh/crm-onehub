---
schema_version: 2
feature_slug: bo-cuc-hep-ngan-va-kanban
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 30c0982b1ab0c8e9507410cad6b59fc4b8b1034d
human_signoff:
---

# Evidence Report: bo-cuc-hep-ngan-va-kanban

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-2 | script | PASS |
| E8 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man
  verified_at: 2026-10-16T07:55:53Z
  screenshot: evidence/E1-step1.png
  observed: |
    Đã mở cả hai frame bằng Read.
    E1-step1.png (375, bảng cột): trang Thoả thuận, cột «Demo booked» (6) hiện đầy đủ, cột «Qualifie…» bị cắt bởi vùng cuộn ngang. Các thẻ hiện ra đều nằm gọn trong khung thẻ, tên dài xuống dòng, chữ giai đoạn ở hàng riêng dưới avatar người phụ trách (chấm xanh + «Demo booked»), không có chữ tràn ra ngoài viền thẻ. Thẻ DAI không có trong khung hình vì nó ở cột thứ năm ngoài vùng nhìn thấy. Frame này không chứng minh trực tiếp thẻ DAI ở 375. Việc đó chỉ dựa vào số đo DOM trong log: 23 phần tử, cat false, hang rieng true. Frame không mâu thuẫn Expected.
    E1-step2.png (1440, bảng cột): bốn cột đầu hiện đầy đủ, thẻ gọn, nhãn giai đoạn một dòng không bị cắt, thẻ «Công ty cổ phần Đầu tư…» có tên dài xuống dòng trong thẻ. Cột thứ năm «Decision maker bought-in re…» chứa thẻ DAI («ThoaThuanDaibcholf70xxxx…», công ty xxxx…, «NguoiPhuTrachDaib…», chấm xanh + «Decision maker bought-in review bcholf70» xuống hai dòng, không cắt «…»). Thẻ DAI bị mép phải của vùng cuộn bảng cắt cùng lúc với tiêu đề cột, nên đây là cắt của vùng cuộn, không phải chữ tràn khỏi thẻ. Nhãn giai đoạn dài xuống dòng đủ chữ, khớp Expected «cat false». Frame không mâu thuẫn Expected.
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man
  verified_at: 2026-10-16T07:55:53Z
  screenshot: evidence/E2-step1.png
  observed: |
    I opened the frame bch-ngan-thoa-thuan-375.png, a 375px-wide sheet of the DAI deal. The long deal name and the long company name wrap onto many lines inside the sheet header with no horizontal overflow. In the stats block below, "Giá trị" and "Ngày dự kiến chốt" sit in the first row and "Ở giai đoạn" (value "vừa xong") and "Phụ trách" sit in the second row. That is four cells in two rows, so the 3rd cell is lower than the 1st. The Phụ trách cell shows the avatar "NG" plus the owner name "NguoiPhuTrachDaibchokozdxxxx..." wrapped over many lines, so the name is visible and not just the avatar. No clipped text is visible in the cells. The E2-step1.png and E2-step2.png files are byte-identical copies of this one capture, because the eval has a single screenshot step and the script saves only that one frame.
  network_observed: n-a (driver)

- eval: E3
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man
  verified_at: 2026-10-16T07:55:53Z
  screenshot: evidence/E3-step1.png
  observed: |
    E3-step1.png (bch-giai-doan-375.png, ngăn thoả thuận giai đoạn mở đai, 375 px): chỉ thấy phần đầu ngăn. Tiêu đề «ThoaThuanDaibchonkl7xxx…» và tên công ty dài xuống dòng nhiều hàng trong cột của nó, không tràn ngang; nút giai đoạn ở góc phải rút gọn «D…»; hàng số liệu «Giá trị / Ngày dự kiến chốt / Ở giai đoạn / Phụ trách» hiển thị, tên người phụ trách dài xuống dòng. Thanh giai đoạn nằm dưới nếp gập nên KHÔNG nằm trong khung chụp (ảnh bị cắt ở 844 px), vì vậy mắt không đối chiếu được từng bước ở khung này; phép đo scrollWidth<=clientWidth của từng bước do script đo trong DOM (log: 7 bước, đạt). E3-step2.png (bch-giai-doan-chot-375.png, ngăn thoả thuận CHỐT): tiêu đề «ThoaThuanChotbchonkl7» xuống 2 hàng, nút «Cl…» có chấm xanh (status-indicator) ở góc phải; tab Tổng quan/Cá nhân/Hoạt động/Kara; mục «GIAI ĐOẠN» hiện thanh bảy bước: Demo, Qualified to…, Decision…, Contrac…, Decision maker bought-…, Gắn bchonkl…, và bước cuối có chấm xanh vuông + «Clos…» ở mép phải, chữ các bước xuống dòng nhiều hàng (cắt ở đáy khung 844 px). Không mâu thuẫn với expected; ghi nhận hạn chế: khung chụp không trọn thanh giai đoạn ở step1 và bước chốt hiện bị cắt đáy ảnh ở step2, nên khẳng định không-cắt-chữ và tên giai đoạn chốt dựa vào số đo DOM của script, không dựa vào ảnh.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man
  verified_at: 2026-10-16T07:55:53Z
  screenshot: /Users/manh-macmini/dev/crm/.claude/worktrees/blissful-jepsen-65fb89/.acceptance-runs/bo-cuc-hep-ngan-va-kanban/evidence/bch-ngan-cong-ty-375.png
  observed: |
    bch-ngan-cong-ty-375.png (khung 375 px, ngan cong ty mo): tieu de ngan 'CongTyDaibchojzklxxxx...' (ten dai khong dau cach) xuong nhieu dong, nam gon trong khung, khong bi cat «…», khong tran ngang. Duoi la bon o so lieu xep hai hang x hai cot: hang 1 'Gia tri dang mo' (—) va 'Thoa thuan dang mo' (2); hang 2 'Lan chot gan nhat' (—) va 'Phu trach' co avatar 'NG' kem ten 'NguoiPhuTrachDaibchojzklxxxx...' xuong nhieu dong, hien du khong cat chu. Doi chieu expected: dat (bon o, hai hang, chu dai xuong dong khong cat, co ten phu trach), khop 'buoc 4: dat'.
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man
  verified_at: 2026-10-16T07:55:53Z
  screenshot: evidence/E5-step1.png
  observed: |
    Frame 1 (E5-step1.png = bch-ngan-1440.png, 1440x900, theme toi): nen la trang Thoa thuan o che do Bang cot bi lam toi, ngan chi tiet 'Ngan bchom53f' mo ben phai (bat dau x~770). Trong ngan: 3 o so lieu (Gia tri, Ngay du kien chot, O giai doan 'vua xong') nam cung mot hang (y~110/135); o thu 4 bi cat o mep phai anh. Thanh GIAI DOAN: cac nut buoc 'Demo booked', 'Qualified to buy', 'Decision maker in', 'Contract sent', 'Decision maker boug…' nam cung mot hang y~249, vach tren deu nhau, khong xuong dong (khop do 7 buoc cao 26). Phan CHI TIET/MO TA/DANG TOI DAU doc duoc, chu dai khong dau cach xuong dong trong mo ta va 'Nguoi tham gia'. Phia sau lop toi, the NGAN 'Ngan bchom53f' o cot 'Gan bchom53f': anh dai dien 'LB' + 'Lan Bch' va chip trang thai nam cung mot hang (y~386), khop 'the NGAN cung hang true'. Khung doi chieu Expected: khong co chi tiet mau thuan voi cung hang/cung chieu cao; luu y tran mep phai cua ngan nhu ghi chu o outputTail. Frame bch-kanban-1440.png (doi chieu): board 5 cot, the dai o cot 'Decision maker bought-in review' voi nhan va ten dai xuong dong trong the, khong lam vo cac the khac.
  network_observed: n-a (driver)

- eval: E6
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man
  verified_at: 2026-10-16T07:55:53Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png (375px, Bang cot Thoa thuan): trang vua man hinh, khong thay tran ngang cua trang; cot "Demo booked" hien the day du, cot "Qualifie..." ben phai bi cat boi khung cuon ngang co chu dich cua bang cot (dung nhu Expected, khung cuon ngang co chu dich duoc bo qua). The co ten cong ty dai ("Cong ty co phan Dau tu va Phat trien Dia oc Phu My — Comp AI") xuong dong trong the, khong tran khoi the. E6-step2.png (375px, ngan chi tiet the DAI): ten thoa thuan dai "ThoaThuanDaibchomv9hxxxx..." va ten cong ty dai xuong dong trong cot tieu de, khong tran ra ngoai man hinh; tieu de rong khoang 128px (khop do 128px >= 120), o "Phu trach" voi ten nguoi dai cung xuong dong trong o, hang so lieu (Gia tri, Ngay du kien chot, O giai doan, Phu trach) nam gon trong 375px, khong co thanh cuon ngang; khong phan tu nao vuot mep phai cua ngan. Nut chuyen giai doan o cot phai thu hep ("D...") nhung van trong khung. Khop Expected: khong tran ngang, tieu de ngan khong bi bop duoi 120px.
  network_observed: n-a (driver)

- eval: E7
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bch_man_do
  verified_at: 2026-10-16T07:55:53Z
  output: |
    cmd: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs --chi-do"
    phien-do: xong — mã 0

- eval: E8
  run_id: minted-bo-cuc-hep-ngan-va-kanban-E8-r1
  exit_code: 0
  verifier: config:executors.test.bch_nhan
  verified_at: 2026-10-16T07:24:42Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: `
  exit_code: 0
  verified_at: 2026-10-16T07:55:53Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-bo-cuc-hep-ngan-va-kanban-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-16T07:55:53Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-bo-cuc-hep-ngan-va-kanban-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-16T07:55:53Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-bo-cuc-hep-ngan-va-kanban-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-16T07:55:53Z

- cmd: bunx turbo run lint --force
  run_id: minted-bo-cuc-hep-ngan-va-kanban-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-16T07:55:53Z

- cmd: bun run lint:slop
  run_id: minted-bo-cuc-hep-ngan-va-kanban-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-16T07:55:53Z

- cmd: bunx turbo run build --force
  run_id: minted-bo-cuc-hep-ngan-va-kanban-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-16T07:55:53Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào được đo là xanh ở cả hai phía: baseline của các eval đều là n-a, nên chưa có eval nào được chứng minh là không phân biệt.

Baseline khong do

Máy không ghi lý do riêng cho baseline n-a của E1-E6 và E8. Lệnh có lý do được ghi:

- bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs --chi-do": baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu

## Variance

none — mọi eval chạy một lần (runs: 1), không eval nào có phương sai hay chập chờn.

## Iterations

Round 1: cả tám eval (E1-E8) đạt, các lệnh suite hồi quy đều xanh; verdict PASS.
Round 2: E1-E7 chạy lại trên cây đã sửa ở vật (S4-r1), đều đạt; E8 giữ nguyên từ round 1 vì delta không chạm paths của nó; các lệnh suite đều xanh; verdict PASS.
