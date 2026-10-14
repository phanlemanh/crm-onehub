---
schema_version: 2
feature_slug: lich-su-va-luu-tru-trang
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2f53f8fa28f633002b9c72035a1aca35f7481ab4
human_signoff: Phan Le Manh 2026-10-14 — ký Cổng 2 trên S4 lượt 1 (17/17 eval máy và 4 ui-check PASS; E13j Đạt). Ngoài-1, 3, 4, 5, 6, 7, 8, 9 ghi Known limits; Ngoài-2 chấp nhận, không sửa; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: lich-su-va-luu-tru-trang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7a | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8m | AC-8 | test | PASS |
| E8u | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10m | AC-10 | test | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11m | AC-11 | test | PASS |
| E11 | AC-11 | ui-check | PASS |
| E12 | AC-12 | ui-check | PASS |
| E13j | AC-13 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-lich-su-va-luu-tru-trang-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lslt_lich_su
  verified_at: 2026-10-13T14:26:56Z
  output: |
    bun run test -- "cd apps/api && bun test test/tai-lieu-lich-su.spec.ts -t lich-su"
    test-run: dropped crm_mv6ryudv1u9d_test

- eval: E2
  run_id: minted-lich-su-va-luu-tru-trang-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lslt_phien_ban
  verified_at: 2026-10-13T14:26:56Z
  output: |
    bun run test -- "cd apps/api && bun test test/tai-lieu-lich-su.spec.ts -t phien-ban"
    test-run: dropped crm_mv6ryu1pi3t4_test

- eval: E3
  run_id: minted-lich-su-va-luu-tru-trang-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lslt_quay_lai
  verified_at: 2026-10-13T14:26:56Z
  output: |
    bun run test -- "cd apps/api && bun test test/tai-lieu-lich-su.spec.ts -t quay-lai"
    test-run: dropped crm_mv6ryu0luhpn_test

- eval: E4
  run_id: minted-lich-su-va-luu-tru-trang-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lslt_de_xuat_luu_tru
  verified_at: 2026-10-13T14:26:56Z
  output: |
    bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t de-xuat-luu-tru"
    test-run: dropped crm_mv6ryuflq4z8_test

- eval: E5
  run_id: minted-lich-su-va-luu-tru-trang-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lslt_duyet_luu_tru
  verified_at: 2026-10-13T14:26:56Z
  output: |
    bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t duyet-luu-tru"
    test-run: dropped crm_mv6rytxx3kr1_test

- eval: E6
  run_id: minted-lich-su-va-luu-tru-trang-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lslt_khoi_phuc
  verified_at: 2026-10-13T14:26:56Z
  output: |
    bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t khoi-phuc"
    test-run: dropped crm_mv6rytz09bof_test

- eval: E7
  run_id: minted-lich-su-va-luu-tru-trang-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lslt_loc
  verified_at: 2026-10-13T14:26:56Z
  output: |
    bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru-loc.spec.ts -t loc"
    test-run: dropped crm_mv6rytn0azo9_test

- eval: E7a
  run_id: mv6ryu8yp36b
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lslt_tro_ly
  verified_at: 2026-10-13T14:26:56Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tro-ly-kho-luu-tru.spec.ts"
    test-run: dropped crm_mv6ryu8yp36b_test

- eval: E8
  run_id: minted-lich-su-va-luu-tru-trang-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lslt_da_xu_ly
  verified_at: 2026-10-13T14:26:56Z
  output: |
    bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t da-xu-ly"
    test-run: dropped crm_mv6rytui4den_test

- eval: E8m
  run_id: minted-lich-su-va-luu-tru-trang-E8m-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lslt_dom_da_xu_ly
  verified_at: 2026-10-13T14:26:56Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-da-xu-ly.dom.tsx
    Ran 2 tests across 1 file. [1001.00ms]

- eval: E8u
  run_id: minted-lich-su-va-luu-tru-trang-E8u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lslt_man_da_luu_tru
  verified_at: 2026-10-13T14:26:56Z
  screenshot: evidence/E8u-step1.png
  observed: |
    E8u-step1.png (bản chép của lslt-da-xu-ly-1440.png do chính lượt chạy này chụp, 1440x900): trang Tài liệu, tab "Chờ duyệt" đang chọn gạch chân, bộ lọc con "Đã xử lý" đang chọn (viền nổi bật), "Đang chờ" không chọn. Danh sách có 3 dòng đề xuất: "Chính sách thưởng quý cũ" (Phạm Văn Minh · 13/10/2026) mang hai nhãn "Lưu trữ" và "Đã duyệt"; "Chính sách thưởng quý cũ" (Nguyễn Thu Hà · 13/10/2026) nhãn "Đã duyệt"; "Chính sách thưởng quý hiện hành" (Nguyễn Thu Hà · 13/10/2026) nhãn "Đã duyệt". Khớp Expected: nhóm Đã xử lý có dòng đề xuất đã duyệt mang nhãn "Đã duyệt". Không có dòng nào thiếu nhãn hay lỗi hiển thị.
  network_observed: n-a (driver)
  output: |
    Bước 3: tập id trên nhóm Đã xử lý toEqual taiLieu.proposals({nhom:'da-xu-ly'}) cùng phiên: đạt (đọc mã man.mjs bước 5: d.dat(5, nhan.startsWith('Đã duyệt') && tren.join(',') === api.join(',')) và bước báo đạt).
    Bước 4: ảnh bước 1 khớp Expected (nhãn Đã duyệt trên nhóm Đã xử lý): đạt.
    Frame lưu ở _acceptance/lich-su-va-luu-tru-trang/evidence/E8u-step1.png (chép từ .acceptance-runs/lich-su-va-luu-tru-trang/evidence/lslt-da-xu-ly-1440.png). Driver là script puppeteer của man.mjs, không có đường đọc network riêng.

- eval: E9
  run_id: minted-lich-su-va-luu-tru-trang-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lslt_chi_ghi_them
  verified_at: 2026-10-13T14:26:56Z
  output: |
    bun run test -- "cd apps/api && bun test test/tai-lieu-chi-ghi-them.spec.ts -t chi-ghi-them"
    test-run: dropped crm_mv6ryyyitcy6_test

- eval: E10m
  run_id: minted-lich-su-va-luu-tru-trang-E10m-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lslt_dom_lich_su
  verified_at: 2026-10-13T14:26:56Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-lich-su.dom.tsx
    Ran 6 tests across 1 file. [2.49s]

- eval: E10
  run_id: minted-lich-su-va-luu-tru-trang-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lslt_man_lich_su
  verified_at: 2026-10-13T14:26:56Z
  screenshot: evidence/E10-step1.png
  observed: |
    E10-step1.png (1440): trang 'Quy định hoa hồng đối tác theo tầng', phụ đề 'Lịch sử phiên bản — mỗi lần chủ trang duyệt là một phiên bản', bảng ba dòng mới nhất trước: Phiên bản 3 (13/10/2026 · Nguyễn Thu Hà, đề xuất Lê Hoàng Yến, nhãn chấm xanh 'Đang dùng' chỉ ở dòng đầu), Phiên bản 2 (Trần Minh Quân), Phiên bản 1 (Nguyễn Thu Hà). Khớp expected. E10-step2.png: màn phiên bản 1, đầu trang 'Phiên bản 1 · duyệt 13/10/2026 · Nguyễn Thu Hà duyệt', ToggleGroup 'So với bản đang dùng' (đang chọn) / 'Toàn văn', nút 'Quay lại phiên bản 1'; diff có chip 'Số và ngày sẽ đổi' (1,2%→, 3 hưởng→, 0,5%→, →10 triệu), dòng bị gạch (bỏ: 'Đối tác tầng 3 hưởng 0,5%...', 'Nguỡng và ngoại lệ', 'Nhân viên thử việc...') và đoạn tô xanh (thêm: 'Ngưỡng', 'Hợp đồng dưới 10 triệu...'), '1,2' gạch trong dòng tầng 2. Khớp 'có chỗ tô thêm/bớt'. E10-step3.png: chọn 'Toàn văn', hiện toàn văn phiên bản 1: 'Mức hưởng' (tầng 1 hưởng 2%, tầng 2 hưởng 1%), 'Ngưỡng' (Hợp đồng dưới 10 triệu đồng không phát sinh hoa hồng), không còn đánh dấu diff. Khớp. E10-step4.png: màn duyệt (đề xuất) 'Bản đề xuất · Phạm Văn Minh · 13/10/2026', nhãn 'Quay lại phiên bản 1', 'Con số và ngày bị đổi' và diff tô thêm/bớt, nút 'Về trang'; URL được man.mjs assert đúng dạng /<ws>/tai-lieu/de-xuat/<id> ('buoc 4: dat'). Khớp. E10-step5.png (390): màn di động, danh sách ba thẻ Phiên bản 3 (Duyệt 13/10/2026 · Lê Hoàng Yến đề xuất, 'Đang dùng'), Phiên bản 2, Phiên bản 1, không cuộn ngang (assert scrollWidth<=clientWidth đạt). Khớp. Không mâu thuẫn expected.
  network_observed: n-a (driver)
  output: |
    Lệnh chạy nguyên văn: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/lich-su-va-luu-tru-trang/rang/man.mjs --phan lich-su" (phiên đo riêng kho crm_gifted_poincare_71daab_do, app :4533, api :4796; log /tmp/lich-su-va-luu-tru-trang-e10.log).
    buoc 1: dat ... buoc 5: dat; man lich-su: dat; phien-do: xong.
    Chiều đỏ (--chieu-do) in "buoc 1: khong thay nut Lịch sử" và báo "DO DUNG GHIM": chiều đỏ đỏ đúng ghim (log /tmp/lich-su-va-luu-tru-trang-e10-cd.log).
    Ảnh gốc ở .acceptance-runs/lich-su-va-luu-tru-trang/evidence/, đã chép sang _acceptance/lich-su-va-luu-tru-trang/evidence/ thành E10-step1..5.png. Driver không đọc được network. Máy chủ phiên đo đã tự dọn, các cổng 4533/4796/4686/4787 không còn lắng nghe.

- eval: E11m
  run_id: minted-lich-su-va-luu-tru-trang-E11m-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lslt_dom_luu_tru
  verified_at: 2026-10-13T14:26:56Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-luu-tru.dom.tsx
    Ran 8 tests across 1 file. [3.65s]

- eval: E11
  run_id: minted-lich-su-va-luu-tru-trang-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lslt_man_luu_tru
  verified_at: 2026-10-13T14:26:56Z
  screenshot: evidence/E11-step1.png
  observed: |
    Đã mở từng frame bằng Read. step1 (1440x900): hộp 'Đề xuất lưu trữ trang' với mô tả, ô 'Lý do' đã gõ 'Đã thay bằng quy định hoa hồng năm 2027.', nút 'Huỷ' và 'Gửi đề xuất' (đang bật vì có chữ; trạng thái khoá khi rỗng do script khẳng định, không nằm trong khung này). step2: màn đọc 'Quy trình đối soát hoa hồng cũ' có huy hiệu 'Có đề xuất lưu trữ chờ duyệt', trình đơn '…' mở ra mục 'Đề xuất lưu trữ' mờ/khoá kèm câu 'Đã có một đề xuất lưu trữ chờ chủ trang duyệt.'. step3 (chủ trang C, avatar NT): màn duyệt tiêu đề 'Đề xuất lưu trữ trang · Phạm Văn Minh · 13/10/2026', lý do 'Đã thay bằng quy định hoa hồng năm 2027.', nút 'Duyệt lưu trữ' và 'Trả lại', không có diff. step4: dải 'Trang đã lưu trữ ngày 13/10/2026' + 'Trang không còn hiện trong danh sách, tìm kiếm và trợ lý AI...' + nút 'Đề xuất khôi phục'; chỉ có nút 'Lịch sử', KHÔNG có 'Sửa trang'. step5 (390x844): cùng dải đã lưu trữ và nút 'Đề xuất khôi phục', nội dung vừa khung, không thấy cuộn ngang. step6: dải đã lưu trữ kèm huy hiệu 'Có đề xuất khôi phục chờ duyệt' (thay cho nút Đề xuất khôi phục), còn 'Lịch sử' và 'Xem bản chờ duyệt'. step7 (chủ trang C): 'Đề xuất khôi phục trang · Phạm Văn Minh · 13/10/2026', lý do 'Đối tác cũ còn hợp đồng chạy tới hết năm.', nút 'Duyệt khôi phục' và 'Trả lại'. step8: danh sách Tài liệu mặc định, 'Tất cả 1', hàng 'Quy trình đối soát hoa hồng cũ' (Quy trình, Nguyễn Thu Hà) đã có lại. Tất cả khớp Expected, không mâu thuẫn.
  network_observed: n-a (driver)
  output: |
    buoc 1: dat ... buoc 8: dat (đủ 8 bước); man luu-tru: dat.
    man.mjs dòng 255-259: bước 3 gọi taiLieu.get qua API và đòi daLuuTru khác null (đạt); dòng 349: bước 8 so tập slug trên bảng với taiLieu.list({page:1}) cùng phiên (đạt, chứa trang).
    Chiều đỏ (--chieu-do) in "buoc 4: khong thay dai da luu tru" và báo "DO DUNG GHIM": đúng kỳ vọng trên bản sao bỏ Alert.
    Frame lưu E11-step1..8.png ở _acceptance/lich-su-va-luu-tru-trang/evidence/ (step5 là 390x844). Driver là script trình duyệt, không có đường đọc network.

- eval: E12
  run_id: minted-lich-su-va-luu-tru-trang-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lslt_man_da_luu_tru
  verified_at: 2026-10-13T14:26:56Z
  screenshot: evidence/E12-step1.png
  observed: |
    E12-step1.png (1440): trang Tài liệu, tab Trang đang chọn, nút "Đã lưu trữ" có viền xanh (đang bật). Bảng có đúng một dòng: "Chính sách thưởng quý cũ", Loại "Chính sách", Chủ trang "Nguyễn Thu Hà", Đơn vị "—", cột cuối tiêu đề "Lưu trữ ngày" giá trị 13/10/2026. Không có trang "Chính sách thưởng quý hiện hành" (trang đang dùng). Khớp Expected bước 1. Ghi chú: chip "Tất cả 1" vẫn hiện, nhưng đúng với tập đang lọc.
    E12-step2.png (1440, bước 4): cùng màn Tài liệu, nút "Đã lưu trữ" đang bật, các chip đếm 0, không có bảng. Giữa trang có biểu tượng kho lưu trữ, dòng đậm "Chưa có trang nào đã lưu trữ" và dòng phụ "Trang được lưu trữ sau khi chủ trang duyệt đề xuất lưu trữ sẽ hiện ở đây." Khớp Expected bước 4.
    E12-step3.png (1440, bước 5): người dùng NT (chủ trang), tab "Chờ duyệt" gạch chân, chip "Đã xử lý" đang chọn. Ba dòng: "Chính sách thưởng quý cũ · Phạm Văn Minh · 13/10/2026" có hai nhãn "Lưu trữ" và "Đã duyệt"; "Chính sách thưởng quý cũ · Nguyễn Thu Hà · 13/10/2026" nhãn "Đã duyệt"; "Chính sách thưởng quý hiện hành · Nguyễn Thu Hà · 13/10/2026" nhãn "Đã duyệt". Có dòng "Đã duyệt" như Expected bước 5.
    Cả ba frame khớp Expected, không mâu thuẫn. Bước 2 và 3 không có ảnh theo steps, đã kiểm bằng assertion URL và bảng ở script (đạt).
  network_observed: n-a (driver)
  output: |
    Frame ở _acceptance/lich-su-va-luu-tru-trang/evidence/E12-step1..3.png; bản gốc ở .acceptance-runs/lich-su-va-luu-tru-trang/evidence/. Log: /tmp/lich-su-va-luu-tru-trang-E12.log và /tmp/lich-su-va-luu-tru-trang-E12-do.log.
    Driver là script puppeteer, không có đường đọc network.

- eval: E13j
  judged_by: judge panel (fresh context, ba lăng kính; đề xuất của máy, chưa phải quyết định)
  verdict: UNCERTAIN
  rationale: Hai lăng kính cho PASS, lăng kính operational-feasibility cho UNCERTAIN vì thiếu ảnh nút mở hộp «Đề xuất lưu trữ trang» trên trang đang dùng và thiếu khoá chữ thật đối chiếu. Máy không tự gộp phiếu; người quyết ở Cổng 2.
  votes:
    - domain-correctness: PASS — (1) Các ảnh lslt-hop-luu-tru, lslt-duyet-luu-tru, lslt-da-luu-tru, lslt-ds-da-luu-tru, lslt-hop-khoi-phuc và lslt-duyet-khoi-phuc chỉ dùng «Đề xuất lưu trữ», «Duyệt lưu trữ», «Đề xuất khôi phục», «Duyệt khôi phục» và «Đã lưu trữ» cho nút xem. Không ảnh nào có «ẩn», «archive» hay «xoá» cho việc lưu trữ, khớp bộ chữ ở docs/vong-doi.md và CONTEXT.md. (2) «Khôi phục» chỉ dùng cho trang đã lưu trữ; việc đưa phiên bản cũ lên là «Quay lại phiên bản 1» (lslt-ban-cu-so-sanh, lslt-duyet-quay-lai), nên không có chữ nào mang hai nghĩa trên cùng một màn. (3) Dải ở lslt-da-luu-tru ghi «Trang đã lưu trữ ngày 13/10/2026 … không còn hiện trong danh sách, tìm kiếm và trợ lý AI. Đề xuất khôi phục nếu trang cần dùng lại» kèm nút «Đề xuất khôi phục», và lslt-duyet-khoi-phuc báo «Có đề xuất khôi phục chờ duyệt». Như vậy người đọc biết trang đã thôi dùng, từ ngày nào và làm gì để lấy lại. (4) CONTEXT.md có mục cho «Lịch sử phiên bản», «Quay lại phiên bản», «Đề xuất lưu trữ», «Đề xuất khôi phục», «Đã lưu trữ» và «Bản đang dùng». Các nhãn phụ như «Lưu trữ ngày», «Toàn văn» và nhãn «Lưu trữ» ở lslt-da-xu-ly chỉ là từ phái sinh từ các mục đó. Riêng tai-lieu.ts không chứa chuỗi lưu trữ nào, nên ở đây chỉ đối chiếu được qua ảnh và từ điển.
    - operational-feasibility: UNCERTAIN — Điểm (1)–(3) đạt trên các ảnh đã đọc: chỉ có «Đề xuất lưu trữ», «Duyệt lưu trữ», «Đề xuất khôi phục», «Duyệt khôi phục», «Đã lưu trữ»; «Quay lại phiên bản 1» tách khỏi «Khôi phục» (lslt-ban-cu-so-sanh, lslt-da-luu-tru). Dải trang đã lưu trữ nói rõ ngày, hệ quả và cách lấy lại. Nhưng nút mở hộp «Đề xuất lưu trữ trang» không có trong ảnh nào, `tai-lieu.ts` đưa kèm không có khoá chữ nào cho Lịch sử hay lưu trữ, và có vài chữ chưa có mục từ điển (xem required_evidence). Vì vậy chưa kết luận PASS cho (1) và (4).
    - spec-alignment: PASS — (1) Trên lslt-hop-luu-tru, lslt-duyet-luu-tru, lslt-da-luu-tru, lslt-ds-da-luu-tru, lslt-hop-khoi-phuc, lslt-duyet-khoi-phuc và lslt-da-xu-ly, việc cất trang luôn là «Đề xuất lưu trữ» / «Duyệt lưu trữ» / «Đã lưu trữ», việc lấy lại là «Đề xuất khôi phục» / «Duyệt khôi phục». Không ảnh nào dùng «ẩn», «archive» hay «xoá», và nút xem là «Đã lưu trữ» chứ không phải «Lưu trữ» trần, đúng bảng bộ chữ ở docs/vong-doi.md. (2) «Khôi phục» chỉ dành cho trang; màn phiên bản cũ (lslt-ban-cu-so-sanh, lslt-duyet-quay-lai) dùng «Quay lại phiên bản 1», nên không có chữ nào mang hai nghĩa trên một màn, đúng mục «Quay lại phiên bản» trong CONTEXT.md. (3) Dải ở lslt-da-luu-tru và lslt-duyet-khoi-phuc ghi «Trang đã lưu trữ ngày 13/10/2026. Trang không còn hiện trong danh sách, tìm kiếm và trợ lý AI. Đề xuất khôi phục nếu trang cần dùng lại.» kèm nút «Đề xuất khôi phục», nên người đọc biết trang thôi dùng, từ ngày nào và làm gì để lấy lại. (4) Các chữ mới cốt lõi đều có mục trong CONTEXT.md: Lịch sử phiên bản, Quay lại phiên bản, Đề xuất lưu trữ, Đề xuất khôi phục, Đã lưu trữ, Lưu trữ, Khôi phục, Bản đang dùng. Các chữ phụ như «Toàn văn», «So với bản đang dùng» là chữ thường ai cũng hiểu, được CONTEXT.md cho phép.
  required_evidence:
    - Ảnh 1440 của màn đọc một trang ĐANG DÙNG (chưa lưu trữ) có hiện nút mở hộp «Đề xuất lưu trữ trang», để kiểm nhãn nút đúng «Lưu trữ»/«Đề xuất lưu trúc» theo bộ chữ và không phải «Ẩn»/«Xoá». Hiện chỉ có lslt-hop-luu-tru-1440.png (hộp thoại) và các màn của trang đã lưu trữ.
    - Các khoá chữ thật của màn Lịch sử, lưu trữ và khôi phục (nhóm lichSu và luuTru trong apps/app/lib/messages, hoặc một tệp thông điệp tương đương) được thêm vào danh sách Input. apps/app/lib/messages/tai-lieu.ts bản đã đưa kèm không chứa chữ «lưu trữ», «Khôi phục», «Toàn văn» hay «Lịch sử», nên không đối chiếu được bộ chữ với mã.
    - Mục từ điển trong CONTEXT.md, hoặc một dòng của docs/vong-doi.md, cho các chữ mới đang hiện: nhãn «Lưu trữ» đứng trần cạnh «Đã duyệt» ở lslt-da-xu-ly-1440.png, tên thẻ «Toàn văn» và «So với bản đang dùng» ở lslt-ban-cu-so-sanh-1440.png, tiêu đề cột «Lưu trữ ngày» ở lslt-ds-da-luu-tru-1440.png. Hoặc một ghi chú của chủ kho rằng các nhãn phụ này không cần mục từ điển.
  human_override: Phan Le Manh 2026-10-14 — Đạt

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lich-su-va-luu-tru-trang-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T14:26:56Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lich-su-va-luu-tru-trang-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T14:26:56Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lich-su-va-luu-tru-trang-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T14:26:56Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lich-su-va-luu-tru-trang-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T14:26:56Z

- cmd: bunx turbo run lint --force
  run_id: minted-lich-su-va-luu-tru-trang-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T14:26:56Z

- cmd: bun run lint:slop
  run_id: minted-lich-su-va-luu-tru-trang-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T14:26:56Z

- cmd: bunx turbo run build --force
  run_id: minted-lich-su-va-luu-tru-trang-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T14:26:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh ở cả hai phía; toàn bộ baseline của eval feature là n-a (eval mới, tệp bài kiểm chưa có ở merge-base), nên chưa có eval nào được chứng minh là phân biệt trên baseline và cũng không có eval nào bị xác định là không phân biệt. Bốn eval ui-check (E8u, E10, E11, E12) mang baseline n-a, máy không kèm lý do riêng.

### Baseline khong do

- bun run test -- "cd apps/api && bun test test/tai-lieu-lich-su.spec.ts -t lich-su": bo qua baseline: tep apps/api/test/tai-lieu-lich-su.spec.ts co o cay dang kiem nhung chua co o merge-base 206096fc227e138ede34694f15d99f89d44fe9ae — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/tai-lieu-lich-su.spec.ts -t phien-ban": bo qua baseline: tep apps/api/test/tai-lieu-lich-su.spec.ts co o cay dang kiem nhung chua co o merge-base 206096fc227e138ede34694f15d99f89d44fe9ae — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/tai-lieu-lich-su.spec.ts -t quay-lai": bo qua baseline: tep apps/api/test/tai-lieu-lich-su.spec.ts co o cay dang kiem nhung chua co o merge-base 206096fc227e138ede34694f15d99f89d44fe9ae — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t de-xuat-luu-tru": bo qua baseline: tep apps/api/test/tai-lieu-luu-tru.spec.ts co o cay dang kiem nhung chua co o merge-base 206096fc227e138ede34694f15d99f89d44fe9ae — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t duyet-luu-tru": bo qua baseline: tep apps/api/test/tai-lieu-luu-tru.spec.ts co o cay dang kiem nhung chua co o merge-base 206096fc227e138ede34694f15d99f89d44fe9ae — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t khoi-phuc": bo qua baseline: tep apps/api/test/tai-lieu-luu-tru.spec.ts co o cay dang kiem nhung chua co o merge-base 206096fc227e138ede34694f15d99f89d44fe9ae — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru-loc.spec.ts -t loc": bo qua baseline: tep apps/api/test/tai-lieu-luu-tru-loc.spec.ts co o cay dang kiem nhung chua co o merge-base 206096fc227e138ede34694f15d99f89d44fe9ae — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/tro-ly-kho-luu-tru.spec.ts": bo qua baseline: tep apps/agent/test/tro-ly-kho-luu-tru.spec.ts co o cay dang kiem nhung chua co o merge-base 206096fc227e138ede34694f15d99f89d44fe9ae — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t da-xu-ly": bo qua baseline: tep apps/api/test/tai-lieu-luu-tru.spec.ts co o cay dang kiem nhung chua co o merge-base 206096fc227e138ede34694f15d99f89d44fe9ae — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-da-xu-ly.dom.tsx: bo qua baseline: tep apps/app/test/tai-lieu-da-xu-ly.dom.tsx co o cay dang kiem nhung chua co o merge-base 206096fc227e138ede34694f15d99f89d44fe9ae — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/tai-lieu-chi-ghi-them.spec.ts -t chi-ghi-them": bo qua baseline: tep apps/api/test/tai-lieu-chi-ghi-them.spec.ts co o cay dang kiem nhung chua co o merge-base 206096fc227e138ede34694f15d99f89d44fe9ae — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-lich-su.dom.tsx: bo qua baseline: tep apps/app/test/tai-lieu-lich-su.dom.tsx co o cay dang kiem nhung chua co o merge-base 206096fc227e138ede34694f15d99f89d44fe9ae — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-luu-tru.dom.tsx: bo qua baseline: tep apps/app/test/tai-lieu-luu-tru.dom.tsx co o cay dang kiem nhung chua co o merge-base 206096fc227e138ede34694f15d99f89d44fe9ae — eval moi, chay tren code cu khong phan biet gi

## Variance

none — không eval nào chạy nhiều lần (mọi eval có runs 1, variance false), không có eval flaky.

## Iterations

Round 1: mọi eval máy (17 eval) và 7 lệnh suite đều xanh; E13j còn một phiếu chưa chốt (operational-feasibility) nên verdict PENDING-JUDGMENT, chờ người quyết ở Cổng 2.

### Re-pin lần 1 — 2026-10-14, do gộp onehub 4b7f07936 (#388, #398, #397, V2e) và đổi mốc migration
run_id: repin-20261014T034137Z-96629
sha: cd1f865eba56dd622ff930b65341c43b594758c0 · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E8u, E10, E11, E12, E13j (E13j không khai paths) · diff chạm vật đo ngoài làn máy: E8u, E10, E11, E12 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-12, AC-13 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-14, do sau gộp #389 kara-mot-ten (2f53f8fa2): chữ Kara đổi vật mà hai hồ sơ đo
run_id: repin-20261014T094316Z-30187
sha: 2f53f8fa28f633002b9c72035a1aca35f7481ab4 · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E8u, E10, E11, E12, E13j (E13j không khai paths) · diff chạm vật đo ngoài làn máy: E10, E11, E12 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-12, AC-13 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
