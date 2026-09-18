---
schema_version: 2
feature_slug: truong-tu-tao-o-cai-dat
verdict: PASS
failed_evals: []
reason: ""
verified_by: mot agent context sach, chay tuan tu tung lenh
enforcement_mode: strict
bypass_used: false
verified_commit: cde88a9c54fd4aa89c092317e5b740c8b986965d
run_id: r3-tuan-tu-20260918T070759Z
human_signoff: Phan Le Manh 2026-09-18 — ký Cổng Bằng chứng trên verdict PASS của vòng chấm 3 (22 thước và 4 lệnh cổng, 26/26 mã thoát 0, làn tuần tự một agent context sạch), với NĂM giới hạn đã khai. Ký trên hiểu biết rằng bằng chứng các thước trình duyệt đến từ làn tuần tự chứ không từ bầy chấm song song, vì bầy bị chặn hai lần bởi môi trường agent; rằng phép đếm ngưỡng bốn tuần là xấp xỉ bằng phép loại trừ vì bảng dữ liệu không có cột ghi ai tạo trường; và rằng bốn mục ngoài hợp đồng đã được định đoạt từng mục ở lượt ký này — ba mục ghi Known limits, một mục mở hợp đồng mới.
---

# Hồ sơ bằng chứng: truong-tu-tao-o-cai-dat

Vòng chấm 3, làn **tuần tự**. Hai mươi hai thước và bốn lệnh cổng, tổng hai
mươi sáu lệnh, tất cả mã thoát 0. Không lệnh nào bị công cụ ngắt.

## Vì sao làn tuần tự, không phải bầy song song

Vòng 1 chạy bầy song song hai lần, ba mươi lăm rồi hai mươi chín agent, cả hai
lần đều **BLOCKED**: các agent không lái được trình duyệt trong môi trường của
chúng (MCP mất kết nối, script treo ở bước dựng phiên dev). Điều khoản
`CLASSIFIER-FALLBACK` của kho cấm tung lại lần thứ ba cùng một cách và buộc
lượt kế đi verify độc lập, lệnh chạy tuần tự.

Tuần tự còn đúng về bản chất, không chỉ là đường lùi: bốn thước trong bộ này tạo
rồi xoá trường trên **cùng một** cơ sở dữ liệu. Chạy song song thì chúng đụng
nhau. Đó là lý do thật của một chỗ đỏ ở vòng 1, khi một thước thấy trên API một
trường mà thước khác vừa tạo và chưa dọn.

## Bảng kết quả

| Thước | Tiêu chí | Loại | Kết quả |
|---|---|---|---|
| E1 | AC-6 | script | PASS |
| E2 | AC-7 | script | PASS |
| E3 | AC-8 | script | PASS |
| E4 | AC-13 | script | PASS |
| E5 | AC-1 | ui-check | PASS |
| E6 | AC-3 | ui-check | PASS |
| E7 | AC-4 | script | PASS |
| E8 | AC-5 | script | PASS |
| E9 | AC-9 | script (tầng sau) | PASS |
| E10 | AC-10 | script (tầng sau) | PASS |
| E11 | AC-11 | script (tầng sau) | PASS |
| E12 | AC-12 | ui-check | PASS |
| E13 | AC-5 | test | PASS |
| E14 | AC-2 | ui-check | PASS |
| E15 | AC-14 | script (tầng sau) | PASS |
| E16 | AC-15 | script | PASS |
| E17 | AC-16 | test | PASS |
| E18 | AC-15 | script | PASS, 15/15 ca phá thử |
| E19 | AC-17 | script | PASS |
| E20 | AC-18 | script | PASS |
| E21 | AC-19 | script (tầng sau) | PASS |
| E22 | AC-20 | ui-check | PASS |

Bốn lệnh cổng của kho: `bun run test` (288 bài, 11 gói) · `turbo run lint --force`
(9 gói) · `bun run lint:slop` (0 cảnh báo, 0 lỗi) · `turbo run build --force`
(4 gói). Tất cả thoát 0.

## Bằng chứng từng thước

Mọi trường dưới đây đến từ lượt chạy `r3-tuan-tu-20260918T070759Z`, làn tuần tự, một agent context sạch
chạy từng lệnh lần lượt. Mã thoát là mã thật của lệnh.

Chín thước có ảnh thì **mỗi ảnh đã được một agent chấm mở ra và kể lại**, và lời
kể đó là trường `observed`. Ba chỗ agent chấm nói khung không chứng đủ thì lời
kể ghi thẳng giới hạn, không làm nhẹ. Mười ba thước còn lại không có dòng ảnh vì
chúng đo ở tầng sau hoặc đo tệp, không có gì để nhìn.

**Một lỗ đã sửa trong lượt này:** ba khung `ba-the.png`, `khong-bat-khay.png` và
`tieu-de-vi.png` từng TRÙNG BYTE, tức ba thước dẫn cùng một vật và trông như ba
bằng chứng độc lập. Agent chấm phát hiện bằng cách so mã băm. Đã sửa: hai thước
giờ chụp ảnh cắt sát cảnh của riêng nó, thước khay chụp cả vế đối chứng, và
thước bàn phím chụp cặp trước và sau khi bấm Escape. Sáu khung mới có sáu mã băm
khác nhau.

- eval: E1
  criterion: AC-6
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_bo_goi_y
    verified_at: 2026-09-18T07:07:59Z

- eval: E2
  criterion: AC-7
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_bo_goi_y_ba_thuc_the
    verified_at: 2026-09-18T07:07:59Z

- eval: E3
  criterion: AC-8
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_khong_trung_bo_cao
    verified_at: 2026-09-18T07:07:59Z

- eval: E4
  criterion: AC-13
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_tu_dien
    verified_at: 2026-09-18T07:07:59Z

- eval: E5
  criterion: AC-1
  executor: ui-check
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_duong_vao
    verified_at: 2026-09-18T07:07:59Z
    screenshot: evidence/thanh-ben-vi.png
    observed: Thanh ben Cai dat tieng Viet du tam muc dung thu tu: Tong quan, Theo doi & phan tich, Ket noi, Tien te, TRUONG, Thanh vien, Khoa API, SSO — muc Truong dung ngay sau Tien te. Vung noi dung trong khung nay la trang Tong quan, nen khung chi chung duoc thanh ben, khong chung duoc trang Truong.

- eval: E6
  criterion: AC-3
  executor: ui-check
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_trang_ba_the
    verified_at: 2026-09-18T07:07:59Z
    screenshot: evidence/ba-the.png
    observed: Anh CAT sat hang the, khoang 240x48 diem, thay dung ba nhan Cong ty · Ca nhan · Thoa thuan tren nen den, khong co thanh ben hay tieu de. The Cong ty co nen xam sang hon va vien, tuc dang duoc chon; hai the kia chu xam mo. Khong co chu nao bi cat.

- eval: E7
  criterion: AC-4
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_the_tren_dia_chi
    verified_at: 2026-09-18T07:07:59Z

- eval: E8
  criterion: AC-5
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_khong_bat_khay
    verified_at: 2026-09-18T07:07:59Z
    screenshot: evidence/khong-bat-khay-ve-mot-khong-khay.png
    observed: Anh ca trang 1280x900: thanh ben voi Truong dang chon, tieu de, hang ba the voi Cong ty chon, hai hang gap Truong chuan 8 va Truong goi y 6, roi bay truong tu tao va nut Truong moi. KHONG co khay truot, hop thoai hay lop phu nao. Ve doi chung nam o tep khong-bat-khay-ve-hai-co-khay.png: cung trang nhung dia chi mang tham so cua khay thi khay rong 460 diem dan sat mep phai, tuc phep do phan biet duoc hai canh.

- eval: E9
  criterion: AC-9
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_tao_tu_goi_y
    verified_at: 2026-09-18T07:07:59Z
    screenshot: evidence/tao-tu-goi-y-CONTACT.png
    observed: The Ca nhan dang chon, khoi Truong goi y da mo voi bon dong con lai kem nut Them. Danh sach truong tu tao co bon truong, trong do Loai bat dong san mang nam lua chon. GIOI HAN da khai: man KHONG co dau hieu nao cho biet truong nao vua duoc tao — khong vien nhan, khong thong bao — nen khung nay mot minh khong chung duoc no sinh ra tu mot goi y; phan do do bang API trong cung lenh.

- eval: E10
  criterion: AC-10
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_ba_viec_tren_trang
    verified_at: 2026-09-18T07:07:59Z

- eval: E11
  criterion: AC-11
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_khay_cu_con_chay
    verified_at: 2026-09-18T07:07:59Z
    screenshot: evidence/khay-cu.png
    observed: Khay truot mo o mep phai, ben trong co tieu de Truong, mo ta «Truong nay ap cho moi ca nhan trong CRM», ba the thuc the voi Ca nhan dang chon, danh sach truong va nhom «Da luu tru · 1 · giu gia tri, an o moi noi». GIOI HAN da khai: khoang 64 phan tram khung ben trai den hoan toan, khong thay the ho so phia sau, nen khung khong chung duoc khay mo TU duong cu; phan do do bang tham so dia chi trong cung lenh.

- eval: E12
  criterion: AC-12
  executor: ui-check
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_trang_thai_rong_va_loi
    verified_at: 2026-09-18T07:07:59Z
    screenshot: evidence/trang-thai-rong.png
    observed: The Thoa thuan dang chon, phan duoi hien dung loi «Chua co truong tu tao nao» kem dong phu «Tao truong dong de tac nhan tra cuu va dien san» va nut xanh Truong moi. Khoi Truong goi y dang mo voi bon dong bam duoc, moi dong co nut Them. Ve thu hai, trang thai loi, nam o tep trang-thai-loi.png.

- eval: E13
  criterion: AC-5
  executor: test
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.test.trg_khoa_tham_so
    verified_at: 2026-09-18T07:07:59Z

- eval: E14
  criterion: AC-2
  executor: ui-check
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_tieu_de_trang
    verified_at: 2026-09-18T07:07:59Z
    screenshot: evidence/tieu-de-vi.png
    observed: Anh CAT sat vung tieu de: chu Truong co lon va ngay duoi la dong mo ta tieng Viet «Hinh dang du lieu cua ban: moi cong ty, ca nhan va thoa thuan ghi nhung gi». Ca hai dung tieng Viet, khong lan chu Anh. Ve tieng Anh nam o tep trang-en.png de doi chieu hai thu tieng khac nhau.

- eval: E15
  criterion: AC-14
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_ba_nhom
    verified_at: 2026-09-18T07:07:59Z
    screenshot: evidence/ba-nhom.png
    observed: The Ca nhan dang chon; danh sach chia nhom voi tieu de doc ro: «Truong chuan · 9 · chi sap lai thu tu va an», «Truong goi y · 5 · mot cu bam de them», «TRUONG TU TAO · Keo de sap thu tu» voi ba truong, va «Da luu tru · 1 · giu gia tri, an o moi noi». Co ca nhom truong chuan cua he thong lan nhom dang dung. Hai nhom chuan va goi y dang thu gon nen chi doc duoc tieu de.

- eval: E16
  criterion: AC-15
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_bang_muoi_lam
    verified_at: 2026-09-18T07:07:59Z

- eval: E17
  criterion: AC-16
  executor: test
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.test.trg_khoa_bo_dau
    verified_at: 2026-09-18T07:07:59Z

- eval: E18
  criterion: AC-15
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_pha_thu
    verified_at: 2026-09-18T07:07:59Z

- eval: E19
  criterion: AC-17
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_tranh_tu_dien
    verified_at: 2026-09-18T07:07:59Z

- eval: E20
  criterion: AC-18
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_khong_dung_lai_phan_khuc
    verified_at: 2026-09-18T07:07:59Z

- eval: E21
  criterion: AC-19
  executor: script
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_nap_truoc
    verified_at: 2026-09-18T07:07:59Z
    screenshot: evidence/nap-truoc-CONTACT.png
    observed: The Ca nhan dang chon, du lieu da co san — Truong chuan 9, Truong goi y 5, ba truong tu tao — khong thay vong cho, khung xuong hay o trong nao. GIOI HAN da khai: khung chi chup vung noi dung, KHONG co thanh dia chi trinh duyet, nen phan «dia chi mang tham so the Ca nhan» khong kiem duoc tu anh; phan do do bang cach lang nghe loi goi mang trong cung lenh.

- eval: E22
  criterion: AC-20
  executor: ui-check
  verdict: PASS
  required_evidence:
    run_id: r3-tuan-tu-20260918T070759Z
    exit_code: 0
    verifier: config:executors.script.trg_ban_phim_kho_hep
    verified_at: 2026-09-18T07:07:59Z
    screenshot: evidence/design-pass/ban-phim-truoc-esc--o-sua-mo.png
    observed: Cap hai khung co lap dung mot bien la trang thai dong hay mo cua o sua. Khung truoc Esc: o soan truong dang MO, thay du cac o Nhan, Khoa, cong tac «De tac nhan dien giup», o «The nao la mot cau tra loi», o chon Kieu, hai hop kiem va hai nut. Khung sau Esc, tep ban-phim-sau-esc--o-sua-dong.png: toan bo khoi bieu mau bien mat, man ve danh sach truong cua the Ca nhan; thanh ben, tieu de va the dang chon giu nguyen giua hai khung.

## Giới hạn đã khai, người ký cần biết trước khi ký

1. **Làn tuần tự do một agent context sạch chạy, không phải bầy chấm song song.**
   Agent đó không viết mã này, nên điều kiện doer khác grader được giữ. Nhưng nó
   chạy trên cùng máy và cùng máy chủ dev với phiên viết mã.
2. **Bàn phím và khổ hẹp không có phép đo máy nào.** Đặc tả UX mục 4 khai ba
   hành vi: ba thẻ cuộn ngang ở khổ hẹp, ba thẻ đi được bằng mũi tên, ô sửa đóng
   bằng Esc. Không thước nào trong hai mươi mốt thước đo ba điều đó. Bốn thước
   dạng kiểm giao diện đều chạy ở một khổ duy nhất, 1280 nhân 900.
3. **Phiên thiết kế bị bỏ bằng một dòng quyết định, và dòng đó chưa ai đọc.**
   Dòng `d-20260918T012859Z-7` bỏ nghi thức S1-D với lý do trang mới không sinh
   hình thái mới. Cổng Phạm vi lại chốt ở đường máy đi tiếp nên không thẻ nào
   được trình, tức không mắt người nào đọc dòng đó. Trạng thái rỗng và trạng
   thái lỗi có ảnh trong `evidence/`, nhưng chưa ai duyệt chúng như một quyết
   định thiết kế.
4. **Phép đếm ngưỡng bốn tuần là xấp xỉ bằng loại trừ**, vì bảng dữ liệu không
   có cột ghi ai tạo trường. Chi tiết ở mục Đường đo của hợp đồng.
5. **Bốn tiêu chí là phạm vi nới thêm sau khi chốt phạm vi**: AC-16 ở bước viết
   mã, và AC-17 AC-18 AC-19 theo quyết định nâng phạm vi của người ký.

## Ngoài hợp đồng

Ba mục ngoài hợp đồng của vòng 1 đã được người ký quyết lối «nâng phạm vi sửa
ngay» và đã sửa, mỗi mục thành một tiêu chí có thước: AC-17, AC-18, AC-19.

Lượt chấm này không sinh mục ngoài hợp đồng mới.

## Iterations

Vòng 1, bầy song song, hai lượt: BLOCKED cả hai. Lượt một bắt năm phép đo rỗng
của chính bộ đo (lệnh khai bằng `node` khi thước cần `bun`; một thước hứa sáu
việc mà làm hai; một thước bỏ nửa phép đo rồi báo đạt; một thước khẳng định yếu
hơn điều đã khai; một thước để lại rác mang đúng nhãn gợi ý thật). Lượt hai bắt
phép đo rỗng thứ sáu (hàm đọc mô tả trang bắt cả tiêu đề) và ba mục ngoài hợp
đồng. Tất cả đã sửa.

Vòng 2, làn tuần tự: 25/25 mã thoát 0. Sau vòng đó owner veto dòng bỏ phiên
thiết kế, phiên thiết kế tìm ra lỗi Esc, và vòng thêm AC-20 cùng thước E22.

Vòng 3, làn tuần tự ở cây hiện tại: 26/26 mã thoát 0.
