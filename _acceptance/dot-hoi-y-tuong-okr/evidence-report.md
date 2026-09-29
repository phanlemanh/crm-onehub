---
schema_version: 2
feature_slug: dot-hoi-y-tuong-okr
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a235a0902e537ad38425a53488823604d0846dde
human_signoff:
---

# Evidence Report: dot-hoi-y-tuong-okr

Vòng 2. Hai mươi eval máy đều đạt; E21 là mục judgment chưa có người chốt nên báo cáo dừng ở PENDING-JUDGMENT để lên Cổng 2.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | ui-check | PASS |
| E13 | AC-11 | script | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-12 | ui-check | PASS |
| E16 | AC-12 | script | PASS |
| E17 | AC-13 | test | PASS |
| E18 | AC-14 | script | PASS |
| E19 | AC-14 | script | PASS |
| E20 | AC-15 | script | PASS |
| E21 | AC-15 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-dot-hoi-y-tuong-okr-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_mo
  verified_at: 2026-09-29T23:14:54Z
  output: |
    bun run test -- "cd packages/validation && bun test test/okr-hoi-y.spec.ts && cd ../../apps/api && bun test test/okr-hoi-y.spec.ts -t mo-hoi-y"
    __EXIT=0

- eval: E2
  run_id: minted-dot-hoi-y-tuong-okr-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_mo_tu_choi
  verified_at: 2026-09-29T23:14:54Z
  output: |
    test-run: dropped crm_munb4hveildq_test
    __EXIT=0

- eval: E3
  run_id: minted-dot-hoi-y-tuong-okr-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_gop
  verified_at: 2026-09-29T23:14:54Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-hoi-y.spec.ts -t gop-y"
    __EXIT=0

- eval: E4
  run_id: minted-dot-hoi-y-tuong-okr-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_ten_va_so
  verified_at: 2026-09-29T23:14:54Z
  output: |
    test-run: dropped crm_munb4h0lxk0p_test
    __EXIT=0

- eval: E5
  run_id: minted-dot-hoi-y-tuong-okr-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_ban_truoc
  verified_at: 2026-09-29T23:14:54Z
  output: |
    test-run: dropped crm_munb4hc7edbf_test
    __EXIT=0

- eval: E6
  run_id: minted-dot-hoi-y-tuong-okr-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_gom
  verified_at: 2026-09-29T23:14:54Z
  output: |
    test-run: dropped crm_munb4hngxqj0_test
    __EXIT=0

- eval: E7
  run_id: minted-dot-hoi-y-tuong-okr-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_ket_luan
  verified_at: 2026-09-29T23:14:54Z
  output: |
    Ran 3 tests across 1 file. [6.22s]
    test-run: dropped crm_munb4gv2yu1g_test

- eval: E8
  run_id: minted-dot-hoi-y-tuong-okr-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_cong_bo
  verified_at: 2026-09-29T23:14:54Z
  output: |
    test-run: dropped crm_munb4heu4hd6_test
    __EXIT=0

- eval: E9
  run_id: minted-dot-hoi-y-tuong-okr-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_ket_qua
  verified_at: 2026-09-29T23:14:54Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-hoi-y-thuan.spec.ts -t giu-them-bo && bun test test/okr-hoi-y.spec.ts -t ket-qua"
    __EXIT=0

- eval: E10
  run_id: minted-dot-hoi-y-tuong-okr-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_nhac
  verified_at: 2026-09-29T23:14:54Z
  output: |
    test-run: dropped crm_munb4hmobje0_test
    __EXIT=0

- eval: E11
  run_id: minted-dot-hoi-y-tuong-okr-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_do_phu
  verified_at: 2026-09-29T23:14:54Z
  output: |
    test-run: dropped crm_munb4hxx1m96_test
    __EXIT=0

- eval: E12
  run_id: E12-verify-20260930
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_man_chrome
  verified_at: 2026-09-29T23:14:54Z
  screenshot: evidence/E12-step3.png
  observed: |
    Đã mở từng ảnh 10 frame, đối chiếu Expected.
    Step3 (1440, tab «Hỏi ý», chọn «Năm kế · mẫu»): Empty «Chưa hỏi ý cho kỳ này», mô tả «Hỏi cả công ty một câu trước khi đặt mục tiêu Năm kế · mẫu», nút xanh «Mở hỏi ý». Đúng.
    Step4 (1440 quản trị sau «Mở»): dải pha 4 mốc Mở 30/9 06:30 «Bây giờ», Hạn 2/10 06:40, Gom ý 2/10 06:40, Công bố «chưa định». Dòng «Còn 48 giờ tới hạn · Người chọn: Lê Hải Đăng». Câu hỏi và lời mở hiện đủ, ba thẻ con số 186 tỷ +12%, 64% -3%, 41 +5. Toast «Đã mở hỏi ý.». Đúng.
    Step5 (390×812 thành viên): tab «Hỏi ý» có huy hiệu «Mới». Dải pha 4 mốc trên một hàng ngang, mốc Mở có nhãn «Bây giờ». Lời mở cắt 3 dòng kèm «Đọc thêm». Thẻ con số dạng lưới 2+1 có chênh lệch. «Ý của bạn» bắt đầu ở khoảng y 790 < 812. Lệch nhẹ: mốc Công bố hiện «chưa định» thay vì ngày giờ.
    Step6 (1440): «Ý của bạn (1/3)» chứa ý vừa gửi kèm «Vì sao» và «Đo bằng». «Ý của đồng nghiệp (12)» chỉ có nội dung, không tên tác giả, mỗi ý có nút «Tôi cũng nghĩ vậy». Toast «Đã gửi ý của bạn.». Không thấy huy hiệu ở khung này vì đã cuộn xuống; script khẳng định huy hiệu mất sau gửi.
    Step7: bảng «Độ phủ theo đơn vị» có hàng Toàn công ty 30.2%, Khối Kinh doanh 33.3%, Khối Vận hành 53.8%, Khối Hỗ trợ 0%, 10 phòng ban (Điều phối vận tải 75% khác 0), Chưa xếp phòng ban 0%. Đúng.
    Step8 (thành viên khác, Quý 4 · mẫu): Empty «Chưa có lần hỏi ý nào cho kỳ này», không có nút mở. Đúng.
    Step9: Empty lỗi «Không tải được lần hỏi ý» kèm nút «Thử lại»; ảnh khác cho thấy Skeleton (các thanh xám) dưới banner «Quý 3 · mẫu đã đóng». Đúng.
    Step10-mo-390: dải pha 4 mốc một hàng, «Bây giờ», thẻ con số, toast «Đã mở hỏi ý.», không tràn ngang. Step10-gop-390: ý của bạn và danh sách đồng nghiệp không tên, nút «Tôi cũng nghĩ vậy», không tràn ngang.
    Không frame nào mâu thuẫn Expected, ngoại trừ lệch nhẹ ở mốc Công bố đã nêu.
  network_observed: n-a (driver)
  output: |
    Frame đã lưu ở evidence/: E12-step3.png (trong-quan-tri), E12-step4.png (mo), E12-step5.png (man-dau 390), E12-step6.png (gop), E12-step7.png (do-phu), E12-step8.png (trong-thanh-vien), E12-step9.png (trang-thai-loi), E12-step9b.png (trang-thai skeleton), E12-step10-mo-390.png, E12-step10-gop-390.png.
    Mạng: driver là puppeteer trong script, không phải tool đọc network; E12-network.txt chỉ ghi kết luận: 61 khẳng định, 0 hỏng, không pageerror hay console.error ngoài ý muốn; lỗi phía máy chủ trên okr.hoiY chỉ sinh ở bước chặn do script chèn.

- eval: E13
  run_id: minted-dot-hoi-y-tuong-okr-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_man_chrome
  verified_at: 2026-09-29T23:14:54Z
  output: |
    phien-do: xong — mã 0
    __EXIT=0

- eval: E14
  run_id: minted-dot-hoi-y-tuong-okr-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_man_dom
  verified_at: 2026-09-29T23:14:54Z
  output: |
    Ran 37 tests across 1 file. [3.67s]
    __EXIT=0

- eval: E15
  run_id: man-hoi-y EVAL=E15 phien do crm_dot_hoi_y_tuong_okr_do; xanh EXIT=0 (app :4882), do EXIT=1 (app :4690)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_man_chrome
  verified_at: 2026-09-29T23:14:54Z
  screenshot: evidence/E15-step2.png
  observed: |
    Da mo tung frame. E15-step2 (buoc-khoa-nguoi-chon, 1440, nguoi chon Le Hai Dang): lan hoi y thu hai dang mo, dai pha 4 moc «Mo» la moc hien tai «Bay gio», «Con 47 gio toi han · Nguoi chon: Le Hai Dang», ghi «Ban la nguoi chon nen khong gop y», khoi «Ban viet truoc» co 3 cau trong, KHONG co danh sach y nao; dong ly do «Niem phong truoc khi doc y» nam duoi nep gap ma frame khong thay, do bang DOM (script khang dinh co mat, 0 y hien). Khop Expected. E15-step3 (buoc-gom): «Y chua gom (4)» moi y co ten nguoi gop (Doan Thi Thu, Tong Bich Ngoc, Vu Thu Ha, Tran Quoc Bao) va «0 nguoi cung nghi vay», khong co thanh chon nhieu, toast «Da dua 1 y vao chu de», muc luc «2/5 chu de da ket luan», thanh «Con 4 dieu truoc khi cong bo» voi «Cong bo» mo/tat; dai pha «Dang gom» nam ngoai khung nhin, do bang DOM. Khop. E15-step4b (muc-luc 1440): muc luc trai liet 5 chu de voi dau tick da ket luan/vong tron chua, muc thu 5 sang, thanh cong bo lien ket 4 dieu thieu, khoi «Ban viet truoc cua ban» van trong khung nhin ben phai. Khop. E15-step4 (buoc-thieu 390): khong co muc luc, thanh cong bo dinh day «Con 4 dieu truoc khi cong bo» liet dieu thieu (Con y chua gom, «Giu khach cu», «Bao gia nhanh...», ...), «Cong bo» tat, co dong «Cuon danh sach de xem phan con lai». Khop. E15-step5 (buoc-du 1440): muc luc «6/6 chu de da ket luan» tat ca tick, «Y la» chon «Khong lam» kem ly do 88 ky tu, thanh «San sang — 3 muc tieu nhap se duoc tao o cap OneHub», «Cong bo» bat xanh, toast «Da luu ket luan». Khop. E15-step6 (buoc-ket-qua 1440): sau cong bo toast «Da cong bo — 3 muc tieu nhap da tao», khung «Sua muc tieu» mo (cap Toan OneHub, ten «Giu ti le khach quay lai tren bay muoi phan tram») voi «Vi sao luc nay» bang ly do da go dai nguyen van. Khop. E15-step8 (buoc-ket-qua-390): ban viet truoc giu nguyen · doi · bo · them: 5 the co huy hieu Doi/Bo/Bo/Giu nguyen/Them, «Xem muc tieu nhap» o cac chu de chon, khong tran ngang. Khop. E15-step7 (buoc-hieu 390): hanh trinh co ngay «30/9 06:31», moc «Thanh muc tieu nhap», ly do nguyen van, «Xem muc tieu nhap», dong «Ban da xac nhan hieu». Khop. E15-step9 (390) va step10 (1440) cuoi trang truoc khi ket luan: thanh cong bo nam trong khung nhin khi cuon (390: day, «Cong bo» tat; 1440: day 714-880, 4 dieu thieu). Khop. Khong frame nao mau thuan Expected.
  network_observed: clean
  output: |
    Lượt xanh: man-hoi-y 84 khẳng định, 0 hỏng, 10 ảnh, 51 s; phien-do: xong — mã 0.
    Các bước đã kiểm: cảnh cây; nạp bộ OKR mẫu; lần hỏi ý thứ hai ở quý kế (đang mở, chưa niêm phong, 2 ý) người chọn thấy danh sách khoá; gom 1 ý vào chủ đề; mục lục và dấu đã/chưa kết luận; thanh công bố ở 390 và 1440 liệt kê 4 điều thiếu, liên kết đầu tiên là nút, «Công bố» tắt; kết luận Chọn/Để sau/Không làm; công bố ghi congBoLuc khác null, 3 chủ đề chọn, 3 mục tiêu OneHub nháp mới; whyNow khớp lý do đã gõ; thành viên ở 390 thấy hành trình và «Tôi hiểu vì sao».
    E16: 118 phản hồi tới trình duyệt thành viên trước công bố, 0 chứa câu viết trước; đường đối chứng 76 phản hồi tới người chọn có 7 chứa câu viết trước.
    Lượt chiều-đỏ (--chieu-do --chi E15) đỏ đúng như Expected: danh sách ý khoá hiện 0 ý khi bản sao lỗi trả 2 ý cho người chọn chưa niêm phong.
    Ảnh lưu ở evidence/: E15-step2.png, E15-step3.png, E15-step4.png, E15-step4b-muc-luc-1440.png, E15-step5.png, E15-step6.png, E15-step7.png, E15-step8.png, E15-step9-cuoi-trang-390.png, E15-step10-cuoi-trang-1440.png. Nhật ký mạng: E15-network.txt.

- eval: E16
  run_id: minted-dot-hoi-y-tuong-okr-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_man_chrome
  verified_at: 2026-09-29T23:14:54Z
  output: |
    phien-do: xong — mã 0
    __EXIT=0

- eval: E17
  run_id: minted-dot-hoi-y-tuong-okr-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_bo_mau
  verified_at: 2026-09-29T23:14:54Z
  output: |
    test-run: dropped crm_munb50er375n_test
    __EXIT=0

- eval: E18
  run_id: minted-dot-hoi-y-tuong-okr-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_ty_le
  verified_at: 2026-09-29T23:14:54Z
  output: |
    phien-do: xong — mã 0
    __EXIT=0

- eval: E19
  run_id: minted-dot-hoi-y-tuong-okr-E19-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_migration_chi_them
  verified_at: 2026-09-29T23:14:54Z
  output: |
    goc so sanh: origin/onehub (0553e0ce) · migration moi: 20261008010000_okr_hoi_y · so cau lenh: 26 · khoa ngoai viet truoc khop: 14/14
    __EXIT=0

- eval: E20
  run_id: minted-dot-hoi-y-tuong-okr-E20-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_san_thiet_ke
  verified_at: 2026-09-29T23:14:54Z
  output: |
    vi pham: 0
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-dot-hoi-y-tuong-okr-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-29T23:14:54Z

- cmd: bunx turbo run lint --force
  run_id: minted-dot-hoi-y-tuong-okr-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-29T23:14:54Z

- cmd: bun run lint:slop
  run_id: minted-dot-hoi-y-tuong-okr-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-29T23:14:54Z

- cmd: bunx turbo run build --force
  run_id: minted-dot-hoi-y-tuong-okr-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-29T23:14:54Z

### Judgment (E21)

Hội đồng đề xuất: UNCERTAIN. Ba giám khảo chỉ được đọc thiết kế, hợp đồng và design-pass, không được đọc diff, `schema.prisma`, migration, `OkrHoiYService`, thành phần `packages/ui` hay `CONTEXT.md`, nên không có căn cứ để PASS hay để bác. Mọi phiếu đều là UNCERTAIN, không có ý kiến bất đồng. Người quyết ở Cổng 2 tự đối chiếu với diff thật.

- domain-correctness: UNCERTAIN — Ba file được phép đọc chỉ là thiết kế, hợp đồng và design-pass, nghĩa là mô tả điều phải đúng chứ không cho thấy mã thật. Diff, schema.prisma, migration, OkrHoiYService, các thành phần packages/ui và CONTEXT.md đều ngoài danh sách nên không có căn cứ nào để PASS hay bác; thiết kế và hợp đồng thì nhất quán về hình mong đợi và cấm chữ «đợt» ở tên sản phẩm.
- operational-feasibility: UNCERTAIN — Ba tệp được phép đọc chỉ nói hình dạng dự định của sáu bảng, chỗ đặt luật quyền, đường tạo mục tiêu và thành phần giao diện. Chúng không chứa diff, schema.prisma, migration, service, màn hình hay CONTEXT.md, nên không xác nhận được mã thật khớp với thiết kế và với AC-15. Kết luận PASS hay bác về diff sẽ là đoán.
- spec-alignment: UNCERTAIN — Ba tệp được phép đọc chỉ nói điều được hứa (sáu bảng, một service quyền, công bố qua đường tạo mục tiêu, thành phần packages/ui, mục từ điển), chứ không chứng minh diff thật làm đúng như vậy. Judge mù không được đọc diff, schema, service, trang hay CONTEXT.md nên không có căn cứ để PASS, và cũng không có chỗ nào cho thấy vi phạm rõ để bác.

- eval: E21
  judged_by: judge-subagent (fresh context)
  verdict: UNCERTAIN
  rationale: Cả ba giám khảo chỉ đọc được thiết kế, hợp đồng và design-pass, không đọc được diff, schema, migration, service, màn hình hay CONTEXT.md, nên không xác nhận được sáu vế của AC-15 trên mã thật.
  required_evidence:
    - Khối sáu model mới ở cuối packages/db/prisma/schema.prisma (OkrHoiY, OkrHoiYBanTruoc, OkrY, OkrYDongY, OkrChuDe, OkrHoiYHieu) và migration của lượt: OkrHoiYBanTruoc là bảng riêng có hoiYId @unique, ý lạ là OkrChuDe loai y-la, objectiveId nằm trên OkrChuDe, không có ADD COLUMN trên bảng cũ, migration chỉ CREATE TABLE, CREATE INDEX, ADD CONSTRAINT trên bảng mới. Lấy bằng `git diff origin/onehub -- packages/db/prisma`.
    - Mã OkrHoiYService và router okr trong apps/api/src/okr: một chỗ duy nhất quyết định ai đọc được tên người góp, số đồng ý và bản viết trước; màn chỉ đọc các cờ quyen (moDuoc, gopDuoc, gomDuoc, chonDuoc, congBoDuoc, lyDoChuaCongBo) từ API. Lấy bằng `git diff origin/onehub -- apps/api/src/okr` và grep nơi bản viết trước được đọc.
    - Hàm congBo trong service: mục tiêu nháp được tạo qua đường tạo mục tiêu có sẵn (mucTieuInput.shape.title, giao dịch có FOR UPDATE), không prisma.okrObjective.create trực tiếp.
    - Trang Hỏi ý trong apps/app khu OKR: chỉ dùng thành phần @crm/ui (kể cả timeline và scrollspy), không dấu hiệu vẽ tay ở bảng docs/design.md, lint:slop xanh, mô tả PR ghi bậc dừng. Lấy bằng `git diff origin/onehub -- apps/app packages/ui`.
    - Các mục mới trong CONTEXT.md (Hỏi ý mục tiêu, Ý, Người chọn, Bản viết trước, Chủ đề, Ý lạ, Kết luận, Kho ý): mỗi mục có nghĩa, dòng _Avoid_ và «Vì sao», chữ «đợt» chỉ xuất hiện trong dòng _Avoid_. Lấy bằng `git diff origin/onehub -- CONTEXT.md`.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Không có eval nào xanh trên cả nhánh lẫn baseline cần viết lại: danh sách eval không-phân-biệt là rỗng. Trường baseline của từng eval ghi n-a vì round này không đo lại.

## Variance

none — không eval nào chạy nhiều lần (runs = 1), nên không có pass_rate hỗn hợp và không có eval chập chờn.

## Iterations

Round 1: PENDING-JUDGMENT — các eval máy đạt nhưng thước lệch (tệp args cũ neo c2927fa1, cây chấm d8785f4c); ghi nguyên trạng, chấm lại ở lượt mới.
Round 2: E1–E20 đạt trên cây a235a090, hai lượt đo màn E12 và E15 có ảnh và phần quan sát; E21 chưa có căn cứ nên UNCERTAIN. Chuyển lên Cổng 2.
