---
schema_version: 2
feature_slug: gioi-han-duyet-cay-okr
verdict: REJECT
failed_evals: ["E16","E19"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6f272b15d946a37825fab888e0d4cfee5eab8d08
human_signoff:
---

# Evidence Report: gioi-han-duyet-cay-okr

Round 2. Nội dung thay toàn bộ round cũ; lịch sử round nằm ở mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-11 | script | PASS |
| E15 | AC-12 | ui-check | PASS |
| E16 | AC-12 | script | FAIL |
| E17 | AC-12 | test | PASS |
| E18 | AC-13 | ui-check | PASS |
| E19 | AC-13 | script | FAIL |
| E20 | AC-14 | test | PASS |
| E21 | AC-14 | script | PASS |
| E22 | AC-14 | script | PASS |
| E23 | AC-15 | script | PASS |
| E24 | AC-15 | script | PASS |
| E25 | AC-15 | judgment | UNCERTAIN |

Lệnh fail không gắn eval nào: không có. Lệnh duy nhất đỏ là lệnh chung của E16 và E19 (phiên đo màn `man-gioi-han-duyet.mjs` chạy qua `tien-de.mjs`), nó gắn với hai eval đó nên được ghi ở hai khối bên dưới.

Lưu ý mâu thuẫn cần người đọc: hai eval ui-check E15 và E18 (do tác tử ui-check chạy lần 2 và đã mở từng ảnh) báo đạt, nhưng chính lần chạy script chung mà E16 và E19 dựa vào in ra hàng loạt dòng HONG ở các bước của E15 (không thấy lựa chọn người xem, không thấy hộp hỏi lại «Gửi mục tiêu này đi duyệt?», hết 30000ms ở nhiều chỗ), và script ghi rõ «KHÔNG chép sang evidence/ (lần chạy có hỏng)». Hai nguồn không cùng một lần chạy, nên không thể coi E15 xanh hơn lần chạy script đã đỏ; đây là lý do REJECT nằm ở E16 và E19 và cần chạy lại cả cụm.

## Evidence

- eval: E1
  run_id: minted-gioi-han-duyet-cay-okr-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_hien_thi_ghi
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-gioi-han-duyet-cay-okr-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_hien_thi_ma_tran
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-gioi-han-duyet-cay-okr-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_hien_thi_bon_duong
  verified_at: 2026-09-29T11:38:27Z
  output: |
    bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts -t hien-thi-an && bun test test/vai-chi-okr.spec.ts -t ma-tran"
    chay 1 lan, dat 1 lan, khong phuong sai
    __EXIT=0

- eval: E4
  run_id: minted-gioi-han-duyet-cay-okr-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_hien_thi_so_gop
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-gioi-han-duyet-cay-okr-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_hien_thi_ghi_ke
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-gioi-han-duyet-cay-okr-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_hien_thi_nhac
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-gioi-han-duyet-cay-okr-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_duyet_cong_bo
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-gioi-han-duyet-cay-okr-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_duyet_vong
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-gioi-han-duyet-cay-okr-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_duyet_nguoi
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-gioi-han-duyet-cay-okr-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_duyet_nhac
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-gioi-han-duyet-cay-okr-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_luu_tru_chan
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-gioi-han-duyet-cay-okr-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_chuyen_don_vi
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-gioi-han-duyet-cay-okr-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_mo_coi
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-gioi-han-duyet-cay-okr-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_mo_coi_sql
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E15
  run_id: E15-lan-2-pass-2026-09-29T12:32Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_man_chrome
  verified_at: 2026-09-29T11:38:27Z
  screenshot: evidence/E15-step3-gioi-han.png
  observed: |
    Đã mở và đọc cả 10 frame lần 2, và đối chiếu Expected:
    - step3-gioi-han: khung G «Giữ chân đối tác chiến lược miền Bắc gmnp020», đầu khung có chip «Giới hạn» có ổ khoá cạnh «Cam kết» và «Nháp». Toast «Đã lưu mức hiển thị», nút «Gửi duyệt» hiện. Khớp.
    - step4-con-can-chinh: hộp «Mức hiển thị», radio «Giới hạn» được chọn, chữ đỏ «Mục tiêu còn 1 căn chỉnh — gỡ hết căn chỉnh (góp vào và nhận góp) rồi mới đặt mức giới hạn.», nút «Mở tab Căn chỉnh», nút «Lưu» mờ (khoá). Khớp.
    - step5-cho-duyet: dải «Chờ Trần Quốc Bảo duyệt · gửi 29/09 … Rút lại», chip «Chờ duyệt» và «Giới hạn», toast «Đã gửi duyệt». Không còn nút «Gửi duyệt» và «Thêm KR», cột việc chỉ còn «—» (sửa bị khoá). Khớp.
    - step6-nguoi-duyet (đăng nhập Trần Quốc Bảo): dải «Nguyễn Thị Lan gửi duyệt · 29/09» với nút xanh «Duyệt và công bố» và «Trả lại…». Khớp.
    - step7-bi-tra-lai: dải viền cam «Trần Quốc Bảo trả lại · 29/09», lý do «Chưa nêu số khởi điểm của KR, bổ sung rồi gửi lại gmnp020», chip «Nháp» + «Giới hạn», có «Gửi duyệt». Khớp.
    - step8-khong-thay (Võ Đức Anh): khung «Mục tiêu» chỉ có «Không tìm thấy mục tiêu này / Đường dẫn có thể sai, hoặc mục tiêu không còn.» và nút «Đóng». Không có tiêu đề G. Khớp.
    - step8b-theo-don-vi: «OKR theo đơn vị › Kinh doanh miền Bắc», 2 mục tiêu (Giữ đà tăng trưởng bán lẻ miền Bắc, Mở rộng tệp đối tác bán lẻ miền Bắc), không có dòng G. Khớp.
    - step9-cho-duyet-390 và step9-nguoi-duyet-390: drawer ở 390 px, dải chờ duyệt (nút «Rút lại») và dải người duyệt (nút «Duyệt và công bố», «Trả lại…») hiển thị đủ, không tràn ngang. Bảng KR bị cắt ở mép phải cột «Việc», đúng phần cuộn ngang trong bảng, trang không tràn.
    - step9-trang-thai-loi: Empty lỗi «Không tải được mục tiêu / Chưa có gì bị mất — thử lại sau ít phút.» kèm nút «Thử lại». Khớp.
    Không có frame nào mâu thuẫn Expected. Lưu ý: frame lần 1 (hỏng) chỉ hiện hộp «Bỏ những gì vừa nhập?» trên nền đen và không đạt.
  network_observed: clean

- eval: E16
  run_id: minted-gioi-han-duyet-cay-okr-E16-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.ghd_man_chrome
  verified_at: 2026-09-29T11:38:27Z
  output: |
    lệnh: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/gioi-han-duyet-cay-okr/rang/man-gioi-han-duyet.mjs"
    HONG: E15 buoc-gioi-han: khong co lua chon «Đỗ Minh Khoa» o [data-hop='muc-hien-thi'] [role='combobox']
    HONG: E16: sau Luu, G.hienThi «cong-khai» mong gioi-han va okrNguoiXem [] mong [mau-okr-nguoi-do-minh-khoa]
    HONG: E15 buoc-cho-duyet: hoi lai «Gửi mục tiêu này đi duyệt?»: het 30000ms van chua thay
    HONG: E16: sau Gui duyet G.status «nhap» mong cho-duyet va dung mot vet gui-duyet cua T (thay 0: )
    HONG: E15 buoc-nguoi-duyet: viec OKR cua toi co «Chờ bạn duyệt: Giữ chân đối tác chiến lược miền Bắc gmlsc2g»: het 30000ms van chua thay
    HONG: E15 buoc-tra-lai: khong thay [data-okr-sheet='cmumlsdjs0002mccfluywtdxc'] [data-nut='tra-lai'] de bam
    HONG: E16: sau Tra lai G.status «nhap» mong nhap va dung mot vet tra-lai co note «Chưa nêu số khởi điểm của KR, bổ sung rồi gửi lại gmlsc2g» (thay [])
    HONG: E15 buoc-bi-tra-lai: dai co «Trần Quốc Bảo trả lại» va ly do da go (thay «»)
    HONG: E15 buoc-khong-thay: G dang gioi-han truoc khi nguoi ngoai mo (thay cong-khai) — lo chi tinh khi G that su gioi han
    HONG: E15 buoc-khong-thay: Theo don vi khong co dong G (thay ["mau-okr-mt-q4-kd-bac-1","mau-okr-mt-q4-kd-bac-2","cmumlsdjs0002mccfluywtdxc"])
    HONG: E16: nguoi khong xem duoc nhan 2 phan hoi chua id/tieu de G (mong 0)
    bang chung: 18 anh o .acceptance-runs/gioi-han-duyet-cay-okr/man/ · KHONG chep sang evidence/ (lan chay co hong)
    phien-do: xong — mã 1
    Cả ba điều kiện DB của E16 (mức giới hạn sau Lưu, vết gui-duyet, vết tra-lai) và điều kiện không lộ (2 phản hồi chứa G, mong 0) đều lệch. Nguyên nhân gốc chưa xác định; dòng đầu tiên hỏng là không chọn được người xem, các bước sau là hệ quả dây chuyền.

- eval: E17
  run_id: minted-gioi-han-duyet-cay-okr-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_khung_dom
  verified_at: 2026-09-29T11:38:27Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-gioi-han-duyet.dom.tsx
    Ran 16 tests across 1 file. [1.61s]
    __EXIT=0

- eval: E18
  run_id: minted-gioi-han-duyet-cay-okr-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_man_chrome
  verified_at: 2026-09-29T11:38:27Z
  screenshot: evidence/E18-step1.png
  observed: |
    Da mo bang Read tung frame:
    step1: trang Chuong trinh OKR (dark, quan tri Le Hai Dang), muc Cau hinh co dong «Công bố cần duyệt» voi cong tac nam trong form, dang BAT; nut «Lưu» da mờ sau khi luu; toast xanh «Đã lưu cấu hình chương trình.» goc trai duoi. Khop expected.
    step2: cung trang, thanh vien thuong (VĐ): duoi tieu de co dong «Chỉ quản trị đổi được cấu hình chương trình.»; cac o nhap, select, cong tac deu mo/khoa (nut Mo chu ky va Luu mo). Khop.
    step3: hop thoai «Lưu trữ «Kinh doanh miền Bắc»?» co canh bao vang «Chưa lưu trữ được — Phòng ban còn 4 mục tiêu ở kỳ đang mở — chuyển OKR hoặc bỏ mục tiêu trước khi lưu trữ.», nut «Chuyển OKR… →» dang kich hoat, nut «Lưu trữ» mo (khoa), «Huỷ». Khop.
    step4: man To chuc, phong Kinh doanh mien Bac, dong «OKR: 1 mục tiêu ở kỳ đang mở» (con lai 1) voi nut «Chuyển OKR…»; toast «Đã chuyển 3 mục tiêu sang Kinh doanh miền Nam.» kem canh bao vuot tran 5 (6 muc tieu). Khop.
    step5a: Suc khoe chuong trinh, khoi «OKR mồ côi» rong: «Không có OKR mồ côi — Mọi mục tiêu ở kỳ đang mở đều có đơn vị còn hoạt động và người trả lời.» Khop.
    step5b: cung khoi co 1 muc «Xuất kho nhanh như đối thủ tốt nhất», «Phòng ban · Kho vận», nhan «Người phụ trách KR đã rời», nut «Mở mục tiêu». Khop.
    step6a (390px): sheet phong Kinh doanh mien Bac trong khung hep, «OKR: 1 mục tiêu ở kỳ đang mở», nut «Chuyển OKR…», toast chuyen 3 muc tieu; khong thay tran ngang. Khop.
    step6b (390px): khoi «OKR mồ côi» voi 1 muc, nhan «Người phụ trách KR đã rời», nut «Mở mục tiêu» vua khung 390, khong cat ngang. Khop.
  network_observed: n-a (driver)

- eval: E19
  run_id: minted-gioi-han-duyet-cay-okr-E19-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.ghd_man_chrome
  verified_at: 2026-09-29T11:38:27Z
  output: |
    Cùng lệnh và cùng lần chạy với E16 (một lệnh gắn hai eval E16, E19). Phần đuôi kết quả máy trả về chỉ liệt kê các bước HONG của E15 và E16; không có dòng HONG riêng nào của E18 hay E19 trong phần đuôi đó.
    Lệnh kết thúc lỗi, nên cả hai eval gắn với lệnh này bị tính đỏ theo quy tắc gắn lệnh-với-eval. Các điều kiện riêng của E19 (version program tăng và duyetCongBo true sau Lưu; đúng ba mục tiêu đổi departmentId; ba vết chuyen-don-vi; khối mồ côi khớp okr.moCoi) chưa được tách kết quả riêng trong đuôi này.
    phien-do: xong — mã 1
    Cần chạy lại phiên đo và đọc log đầy đủ của E19 trước khi kết luận nguyên nhân.

- eval: E20
  run_id: minted-gioi-han-duyet-cay-okr-E20-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ghd_bo_mau
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E21
  run_id: minted-gioi-han-duyet-cay-okr-E21-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_ty_le
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E22
  run_id: minted-gioi-han-duyet-cay-okr-E22-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_migration_chi_them
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E23
  run_id: minted-gioi-han-duyet-cay-okr-E23-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_soi_xem
  verified_at: 2026-09-29T11:14:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E24
  run_id: minted-gioi-han-duyet-cay-okr-E24-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ghd_san_thiet_ke
  verified_at: 2026-09-29T11:38:27Z
  output: |
    bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca thiet-ke
    vi pham: 0
    __EXIT=0

- eval: E25
  judged_by: judge-subagent (fresh context)
  verdict: UNCERTAIN
  panel_proposal: UNCERTAIN
  rationale: Cả ba góc nhìn đều thấy spec, mô tả PR và danh sách tệp khớp về cấu trúc, nhưng evidence/diff-luot.txt chỉ có thống kê và danh sách tệp, không có nội dung diff nên không kiểm được mã, bốn mục CONTEXT.md, luật mới ở docs/api.md, việc to-chuc không nhập okr, hay dải chờ duyệt có lộ tên mục tiêu không. Góc spec-alignment còn ghi nhận có hai chỗ dựng ngữ cảnh xem (OkrAccessService.quyen và nguCanhXemOkr) chỉ được giữ khớp bằng một bài so tập ở AC-2.
  votes:
    - domain-correctness: UNCERTAIN — Kiến trúc khai đúng (hàm thuần cộng hàm dựng điều kiện, người duyệt suy lúc đọc không thêm bảng, đếm OKR cho to-chuc, thành phần ở packages/ui) nhưng diff-luot.txt không có nội dung diff nên chỉ có lời khai của tác giả làm căn cứ.
    - operational-feasibility: UNCERTAIN — Cấu trúc và danh sách tệp khớp mô tả PR, nhưng không kiểm được to-chuc có nhập module okr hay không, mọi truy vấn có đi qua điều kiện xem hay không, dải và nhãn có lộ tên mục tiêu hay không, và độ đủ của CONTEXT.md, docs/api.md.
    - spec-alignment: UNCERTAIN — Cấu trúc khớp (hàm thuần ở packages/validation và packages/db, không có bảng duyệt mới, okr-don-vi.ts tách riêng, CONTEXT.md thêm 46 dòng, docs/api.md thêm 121 dòng) nhưng thiếu nội dung diff, và mô tả PR cho thấy hai chỗ dựng ngữ cảnh xem thay vì một.
  required_evidence:
    - Nội dung diff thật của CONTEXT.md và docs/api.md (và docs/agent.md), để thấy bốn mục Mức hiển thị, Chờ duyệt / Người duyệt, Chuyển OKR, OKR mồ côi có đủ nghĩa, Avoid, Vì sao, và luật xem, bước duyệt, chặn lưu trữ, xoá hẳn, chuyển OKR được nói đủ. Lấy bằng git diff origin/onehub...HEAD trên các tệp đó.
    - Đầu ra của soi-ma.mjs --ca xem (thoát 0, liệt kê các truy vấn okrObjective và bảy bảng con đi qua dieuKienXemMucTieu hoặc có trong danh sách miễn kèm lý do), hoặc một tệp evidence lưu đầu ra đó.
    - Diff của packages/db/src/okr-hien-thi.ts, packages/validation/src/okr-hien-thi.ts, packages/db/src/okr-duyet.ts, packages/db/src/okr-nhac.ts và apps/api/src/okr/okr-access.service.ts, kèm giải thích vì sao có hai hàm dựng ngữ cảnh xem mà vẫn coi là một chỗ, hoặc bằng chứng bài so tập trưởng hai bên xanh.
    - Diff của apps/api/src/to-chuc (và packages/db/src/okr-don-vi.ts) cho thấy không có import nào từ apps/api/src/okr và có dùng demOkrCuaDonVi, demOkrTheoDonVi từ @crm/db/okr-don-vi.
    - Diff của objective-duyet.tsx, objective-hien-thi.tsx, objective-sheet.tsx, hop-chuyen-okr.tsx và viec-cua-toi.tsx để xác nhận chỉ dùng thành phần packages/ui và dải chờ duyệt, nhãn giới hạn, mục «Chờ bạn duyệt» không mang tên mục tiêu cho người không xem được.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-gioi-han-duyet-cay-okr-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-29T11:38:27Z

- cmd: bunx turbo run lint --force
  run_id: minted-gioi-han-duyet-cay-okr-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-29T11:38:27Z

- cmd: bun run lint:slop
  run_id: minted-gioi-han-duyet-cay-okr-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-29T11:38:27Z

- cmd: bunx turbo run build --force
  run_id: minted-gioi-han-duyet-cay-okr-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-29T11:38:27Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Baseline cua moi eval ghi n-a.

Không có eval không-phân-biệt được liệt kê.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định).

## Iterations

Round 1: REJECT theo bảng tổng kết round (27 eval trả về, không eval nào bị chặn); các sửa sau đó nằm ở các commit S4 vòng 1 (khoá chữ chết, «Rút lại» dùng ConfirmDialog, hien-thi-an đếm chuỗi của G cho K, sổ quyết định). Trả về triển khai.
Round 2: E16 và E19 đỏ vì phiên đo màn chung kết thúc lỗi; đuôi kết quả cho thấy nhiều bước của E15 hết 30000ms và không chọn được người xem, trong khi ui-check E15 và E18 do tác tử chạy riêng báo đạt. Phải chạy lại cả cụm đo màn trên một lần chạy thống nhất và tách kết quả E19. E25 vẫn chờ người ở Cổng 2 vì diff-luot.txt thiếu nội dung diff. Trả về triển khai.
