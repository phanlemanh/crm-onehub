---
schema_version: 2
feature_slug: man-cai-dat-noi-tieng-viet
failed_evals: []
reason:
verified_by: fresh-context verifier, three rounds
enforcement_mode: strict
bypass_used: false
slug: man-cai-dat-noi-tieng-viet
verdict: PASS
round: 3
run_id: s4r3d-20260904T130156Z-16359
verified_commit: 2bf938e6511c00c6c2d29af571759b2afaad2a49
verified_at: 2026-09-04T13:04:00Z
human_signoff: Manh Phan 2026-09-04
---

# Bằng chứng — man-cai-dat-noi-tieng-viet

Ba vòng chấm, mỗi vòng một phiên tươi chạy tuần tự, không phiên nào viết mã của
vòng này. Máy viết thì không tự chấm.

| vòng | verdict | phát hiện |
|---|---|---|
| 1 | PENDING-JUDGMENT | 7 — một suite đỏ, một eval sai dây, bốn phép đo tự hạ chuẩn |
| 2 | REJECT | 7 — **cùng lớp lỗi với vòng 1** |
| 3 | PENDING-JUDGMENT → PASS (người ký) | 7, đều nhẹ; 16/16 eval khớp bản khai |

## Ghim lại sau khi gộp nhánh xa

Nhánh xa tiến một commit (`746d3ef`, gỡ hai type import không ai đọc, chạm
`apps/api/src/tracking/tracking.service.ts` và `packages/db/src/fields.ts`). Gộp
xong thì hai file mã đó khác cây đã chấm, nên chốt chặn merge gọi bằng chứng là
cũ — đúng luật. **Chạy lại toàn bộ trên cây đã gộp rồi ghim lại, không sửa con
số cho khớp.**

Lượt chạy đầu sau khi gộp cho E13 màu ĐỎ. Đó là màu thoáng qua: máy chủ dev đang
biên dịch lại vì hai file vừa đổi, và chân đo chộp đúng lúc dở dang. Ghi lại ở
đây thay vì im lặng chạy tới lúc xanh — chân đo chạy ba lượt liên tiếp xanh trước
khi lượt có-ghi-sổ này chạy.

## Vòng 3 — bảng phép đo

| eval | AC | mã | ghi chú |
|---|---|---|---|
| E13 | AC-1 | 0 | 160 cặp hai thứ tiếng trên máy chủ thật, hỏng=0; tập quan sát phủ cả thanh bên |
| E1 | AC-1b | 0 | 10 file, 0 chuỗi khoá cứng |
| E2 | AC-2 | 0 | 12/12 theo (file, khoá); bỏ qua 8 lượt `error.message` |
| E3 | AC-3 | 0 | 9 ô nhãn, 7 giải được qua nhóm `thanhBen` |
| E4 | AC-4 | 0 | 2 ô ghim, mức mã |
| E5 | AC-5 | **2** | không đo được — đã khai trước; đo được 1/3 ô |
| E6 | AC-6 | 0 | 55 ứng viên sinh từ màn, thiếu=0 thừa=0 |
| E7 | AC-7 | 0 | 11 vết, mỗi vết ít nhất một chân đỏ **mã 1** |
| E8 | AC-8 | 0 | hàng FILE 10/10/10/10 · hàng VẬT khớp theo tập |
| E9 | AC-9 | 0 | dân số 10→11 tự thấy file mới, hai chân đỏ |
| E10 | AC-10 | 0 | 78 nhãn ở 360px, vi tràn mà en vừa=0 |
| E11 | AC-1 | 0 | 27 pass |
| E12 | AC-1 | — | eval judgment, không có lệnh máy — **việc của người**, không có khối bằng chứng máy |
| E14 | AC-6b | 0 | tên workspace mang `translate="no"` |
| E15 | AC-11 | 0 | 2 chuỗi giữ nguyên, cả 2 còn đối tượng thật |
| E16 | AC-10b | 0 | vi 274/198px tràn, en 60/60 vừa |

**Bốn suite:** `db:test && test` 210 pass · `check-types` 0 · `lint` 0 · `lint:slop` 0.
Vòng 3 chạy lại `check-types` và `test` với `--force` (0 cached) để không tin cache.
`lint` đúng ba cảnh báo có sẵn trên cây sạch, không có chỗ thứ tư.

## Mười hai phép phá độc lập, đều bị bắt đúng chiều

Vòng 3 tự dựng lại từng thí nghiệm, cây trả nguyên trạng sau mỗi lần:

- ghim locale `"en"` vào trang Currencies → E13 đỏ, gọi tên hai chuỗi và đường DOM
- bỏ dấu một nhãn thanh bên → E13 đỏ (chứng thanh bên nằm trong tập quan sát)
- xoá hẳn khối `canRename` → E4 đỏ, và là chân **duy nhất** đỏ
- cắm `{ name: "Ninety days after close" }` → E15 đỏ, in nguyên văn
- đổi một khoá bảng toast (tổng vẫn 12=12) → E2 và E8 đều mã 2, in mục thiếu lẫn thừa
- giữ khoá toast nhưng thêm `description: "…"` tiếng Anh → E2 đỏ mã 1
- gỡ `translate="no"` khỏi ô tên công ty → E14 đỏ
- bỏ / thêm một dòng bảng không-dịch → mã 2 hai chiều
- thêm một ô `title:` thứ mười → E3 mã 2, liệt kê cả mười
- cắm chuỗi Anh vào `aria-label=` và `title=` → E15 đỏ
- bỏ dấu một giá trị kho chuỗi → E11 đỏ, gọi tên khoá
- thả một file `.tsx` mới vào thư mục lát → dân số 10→11, hai chân đỏ

## Lớp lỗi của vòng này, và nó đã đóng ra sao

Cả ba vòng chấm ra **một lớp duy nhất: phép đo trông như có kiểm mà không kiểm.**
Vòng 2 lặp lại đúng lớp của vòng 1, nên theo điều khoản dừng-vá của bộ kit, vòng
này KHÔNG tự chạy tiếp mà đổi cách: thay vì vá từng thể hiện, mỗi phép đo bị hỏi
lại một câu — *nếu tôi phá đúng thứ nó hứa sẽ bắt, nó có đỏ không?* Mười hai phép
phá ở trên là câu trả lời.

Bốn chỗ nặng nhất và cách đóng:

- **Chân "không đủ quyền" chỉ hỏi hai câu vô hại** — file không còn chứa câu cũ, và
  file có chữ `settingsMessages` ở đâu đó. Xoá hẳn khối đi vẫn xanh. Nay nó đọc cây
  cú pháp, đòi mỗi ô còn MỘT NÚT đọc đúng khoá đã khai.
- **Bản khai loại trừ dùng chung một danh sách** cho thuộc tính JSX và khoá object,
  nên `{ name: "…" }` lọt qua cả bốn chân. Nay tách đôi; danh sách khoá object chỉ
  giữ khoá mang giá trị enum.
- **Mã 2 được tính là "chân đã bắt được"** — một cây thước chết sẽ ghi điểm là bắt
  được mọi vết. Nay chỉ mã 1 mới tính.
- **Hàng VẬT so đếm với đếm** nên phép phá của vòng 1 lọt qua vòng 2. Nay so tập.

## Ba lần hồ sơ tả một cái cây không còn tồn tại

Cùng một lớp, ở mặt tài liệu — đều đã sửa trong vòng này:

- con số *chín tiêu đề* là tính chất của cây CHƯA dịch; dịch xong còn 0 → đếm **ô nhãn**
- bảng toast ghim số dòng và hình dạng cú pháp; sau khi dịch 10/12 số dòng sai và
  12/12 hình dạng vô nghĩa → ghim **(file, khoá kho chuỗi)**
- Known limit khai `lint:slop` không quét `_acceptance` — sai, nó có quét

## Ba nợ có tên, trả TRƯỚC khi mở đợt 33 file

1. **Bộ quét ③a vọng lại danh sách đầu vào** thay vì đếm file nó thật sự mở, nên hàng
   FILE của AC-8 không thể lệch. Sửa nó là chạm vào thước của một hồ sơ đã ký.
2. **Cần gạt `khong_quet` chưa ai canh** — khai một dòng loại trừ có tên thì cả năm
   chân đều xanh. Hôm nay danh sách rỗng nên chưa giấu gì.
3. **E11 bắt được kho vắng mặt khỏi `MODULE` chỉ do tình cờ** — nó đỏ ở một bất biến
   khác, và lưới đó mất nếu kho settings về sau không còn hàm ghép biến nào.

## Evidence

- eval: E13
  run_id: s4r3d-20260904T130156Z-16359-E13
  exit_code: 0
  verifier: config:executors.script.cai_dat_hai_tieng
  verified_at: 2026-09-04T13:02:11Z
  output: |
    -- kho /Users/manhphan/dev/crm · workspace "onehub" · hai man /settings /settings/currencies · 10 file trong lat
    
    -- man /settings · vi=42 chuoi · en=42 chuoi
       ve 2: 0 cap giong nhau ngoai bang · ve 3: 0 chuoi vi khong dau
    
    -- man /settings/currencies · vi=118 chuoi · en=118 chuoi
       ve 2: 0 cap giong nhau ngoai bang · ve 3: 0 chuoi vi khong dau
    
    ket qua: 160 cap doi chieu · hong=0

- eval: E1
  run_id: s4r3d-20260904T130156Z-16359-E1
  exit_code: 0
  verifier: config:executors.script.cai_dat_chu_cung_jsx
  verified_at: 2026-09-04T13:02:12Z
  output: |
    bo quet doc 10 file
    ket qua: 10 file .tsx tren dia, tru 0 loai tru co ten, cong 0 khai them = 10 file quet. 0 chuoi khoa cung ngoai 0 dong mien tru, va ca 0 dong deu con doi tuong that.

- eval: E2
  run_id: s4r3d-20260904T130156Z-16359-E2
  exit_code: 0
  verifier: config:executors.script.cai_dat_chu_ngoai_jsx
  verified_at: 2026-09-04T13:02:12Z
  output: |
    
    quet 10 file trong lat · nhan ra 12/12 loi goi khai trong bang · bo qua 8 luot chi chuyen tiep error.message (ngoai pham vi)
    XANH: khong loi goi toast nao con mang chu tieng Anh viet thang.

- eval: E3
  run_id: s4r3d-20260904T130156Z-16359-E3
  exit_code: 0
  verifier: config:executors.script.cai_dat_tieu_de
  verified_at: 2026-09-04T13:02:12Z
  output: |
    
    quet 10 file · 9 o nhan (2 tieu de tab + 7 nhan thanh ben) · 7 nhan thanh ben deu giai duoc qua nhom thanhBen (8 khoa) · 0 o con viet thang
    XANH: ca 9 o nhan deu doc tu kho chuoi.

- eval: E4
  run_id: s4r3d-20260904T130156Z-16359-E4
  exit_code: 0
  verifier: config:executors.script.cai_dat_khong_du_quyen
  verified_at: 2026-09-04T13:02:12Z
  output: |
    do 2 o ghim — trang thai khong du quyen. PHEP DO MUC MA: moi o phai con MOT NUT doc dung khoa da khai, va ban tieng Viet cua khoa do phai mang dau. Khong chung man hien dung (gioi han khai o AC-4).
    XANH: ca 2 o deu con nut doc dung khoa, va ban tieng Viet co dau.

- eval: E5
  run_id: s4r3d-20260904T130156Z-16359-E5
  exit_code: 2
  khong_do_duoc: tien-de-thieu (ma thoat 2) — KHONG phai mot phep do truot, ma la mot phep do TU CHOI chay vi tien de khong dung duoc. Gioi han da khai o AC-5 va o muc Known limits.
  verifier: config:executors.script.cai_dat_trang_thai_rong
  verified_at: 2026-09-04T13:02:22Z
  output: |
    -- kho /Users/manhphan/dev/crm · workspace "onehub" · hai man /settings /settings/currencies · 10 file trong lat
    -- do o thu ba, tren man that:
       "khong model nao khop" -> "Không model nào khớp."
       mang dau tieng Viet: co
    
    -- thu dung hai o dau qua dung luong nguoi dung:
       workspace.create -> 404 (khong co thu tuc)
       workspaces.create -> 404 (khong co thu tuc)
       organization.create -> 404 (khong co thu tuc)
       workspace.new -> 404 (khong co thu tuc)
       dieu khien tren man tao workspace: 0
    
    ket qua: do duoc 1/3 o · thieu 2 o · o do duoc ma khong co dau tieng Viet: 0
    KHONG DO DUOC: tien de thieu — khong dung duoc o: chua co ty gia nao · chua deal nao co so tien.
       Tien de thieu co ten: kho nay chay MOT workspace duy nhat. Khong thu tuc trpc nao tao workspace,
       va khong dieu khien nao tren man lam viec do. Khong co workspace moi thi khong co man chua co ty gia,
       cung khong co man chua deal nao co so tien.
    $ bun scripts/dev-session.ts manh.phan@onemount.com

- eval: E6
  run_id: s4r3d-20260904T130156Z-16359-E6
  exit_code: 0
  verifier: config:executors.script.cai_dat_khong_dich
  verified_at: 2026-09-04T13:02:37Z
  output: |
       bang-khai            "https://"
       du-lieu-nguoi-nhap   "onehub.vn"
       ma-va-ten-dong-tien  "· Australian Dollar"
       ma-va-ten-dong-tien  "· Canadian Dollar"
       ma-va-ten-dong-tien  "· Chinese Yuan"
       ma-va-ten-dong-tien  "· Euro"
       ma-va-ten-dong-tien  "· Hong Kong Dollar"
       ma-va-ten-dong-tien  "· Japanese Yen"
       ma-va-ten-dong-tien  "· Pound Sterling"
       ma-va-ten-dong-tien  "· Singapore Dollar"
       ma-va-ten-dong-tien  "· South African Rand"
       ma-va-ten-dong-tien  "· Swiss Franc"
       ma-va-ten-dong-tien  "· US Dollar"
       so-thuan             "·"
       gia-tri-bi-che       "••••lder"
    
    -- AC-6b · ten workspace nguoi nhap: "OneHub"
       co translate="no" — /settings main:2/div:0/div:1/div:0/div:0/div:1/form:0/div:0/div:0/input:1@value
    
    ket qua: thieu dong=0 · thua gia tri=0 · AC-6b thieu thuoc tinh=0

- eval: E7
  run_id: s4r3d-20260904T130156Z-16359-E7
  exit_code: 0
  verifier: config:executors.script.cai_dat_dot_bien
  verified_at: 2026-09-04T13:02:44Z
  output: |
    chieu xanh: ca 5 chan xanh tren cay lanh.
    vet "chu trong JSX" -> do boi: moi-chuoi, chu-cung-jsx
    vet "o tieu de tab" -> do boi: moi-chuoi, tieu-de
    vet "xoa han cau khong du quyen" -> do boi: khong-du-quyen
    vet "mang lua chon mang chu tieng Anh" -> do boi: moi-chuoi
    vet "nhan thanh ben doi sang chu viet thang" -> do boi: tieu-de
    vet "tu don viet thuong trong JSX" -> do boi: moi-chuoi
    vet "thuoc tinh khong ky thuat" -> do boi: moi-chuoi, chu-cung-jsx
    vet "toast giu khoa nhung them chuoi Anh trong cung loi goi" -> do boi: moi-chuoi, toast
       (ma 2, KHONG tinh la bat duoc — tien de thieu: toast)
    vet "toast doc khoa model.daLuu" -> do boi: moi-chuoi
       (ma 2, KHONG tinh la bat duoc — tien de thieu: toast)
    vet "toast doc khoa luuTru.daLuu" -> do boi: moi-chuoi
       (ma 2, KHONG tinh la bat duoc — tien de thieu: toast)
    vet "toast doc khoa luuTru.phaiLaSo" -> do boi: moi-chuoi
    cay lam viec da tro ve dung trang thai truoc khi chay.
    
    XANH: ca 11 vet deu bi it nhat mot chan bat, va cay lanh thi ca 5 chan deu xanh.

- eval: E8
  run_id: s4r3d-20260904T130156Z-16359-E8
  exit_code: 0
  verifier: config:executors.script.cai_dat_khai_sinh
  verified_at: 2026-09-04T13:02:45Z
  output: |
    hang FILE: {"latSinh":10,"chanJsx":10,"chanNgoaiToast":10,"chanNgoaiTieuDe":10}
    hang VAT:  {"toastNhanRa":12,"toastKhai":12,"tieuDeNhanRa":9,"tieuDeKhai":9}
    XANH: 10 file, ba chan doc bang nhau; 12 loi goi toast va 9 o tieu de, khop bang khai.

- eval: E9
  run_id: s4r3d-20260904T130156Z-16359-E9
  exit_code: 0
  verifier: config:executors.script.cai_dat_dan_so_tu_dia
  verified_at: 2026-09-04T13:02:45Z
  output: |
    tha them mot file .tsx mang chu tieng Anh: dan so 10 -> 11 · moi-chuoi(1) chu-cung-jsx(1) · cay da don sach
    XANH: dan so tu thay file moi, va ca hai chan deu do vi no.

- eval: E10
  run_id: s4r3d-20260904T130156Z-16359-E10
  exit_code: 0
  verifier: config:executors.script.cai_dat_be_rong
  verified_at: 2026-09-04T13:03:00Z
  output: |
    -- kho /Users/manhphan/dev/crm · workspace "onehub" · hai man /settings /settings/currencies · 10 file trong lat
    
    -- man /settings o 360px · phan tu co chu: vi=30 en=30 · nhan dich duoc=26
    
    -- man /settings/currencies o 360px · phan tu co chu: vi=103 en=103 · nhan dich duoc=52
    
    ket qua 360px: 78 nhan dich duoc · vi tran ma en vua=0 · ca hai cung tran=0 (bao rieng)

- eval: E14
  run_id: s4r3d-20260904T130156Z-16359-E14
  exit_code: 0
  verifier: config:executors.script.cai_dat_khong_dich
  verified_at: 2026-09-04T13:03:16Z
  output: |
       bang-khai            "https://"
       du-lieu-nguoi-nhap   "onehub.vn"
       ma-va-ten-dong-tien  "· Australian Dollar"
       ma-va-ten-dong-tien  "· Canadian Dollar"
       ma-va-ten-dong-tien  "· Chinese Yuan"
       ma-va-ten-dong-tien  "· Euro"
       ma-va-ten-dong-tien  "· Hong Kong Dollar"
       ma-va-ten-dong-tien  "· Japanese Yen"
       ma-va-ten-dong-tien  "· Pound Sterling"
       ma-va-ten-dong-tien  "· Singapore Dollar"
       ma-va-ten-dong-tien  "· South African Rand"
       ma-va-ten-dong-tien  "· Swiss Franc"
       ma-va-ten-dong-tien  "· US Dollar"
       so-thuan             "·"
       gia-tri-bi-che       "••••lder"
    
    -- AC-6b · ten workspace nguoi nhap: "OneHub"
       co translate="no" — /settings main:2/div:0/div:1/div:0/div:0/div:1/form:0/div:0/div:0/input:1@value
    
    ket qua: thieu dong=0 · thua gia tri=0 · AC-6b thieu thuoc tinh=0

- eval: E15
  run_id: s4r3d-20260904T130156Z-16359-E15
  exit_code: 0
  verifier: config:executors.script.cai_dat_moi_chuoi
  verified_at: 2026-09-04T13:03:16Z
  output: |
    
    quet 10 file · 2 chuoi nguoi co the doc · tru 2/2 dong giu nguyen co ten
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E16
  run_id: s4r3d-20260904T130156Z-16359-E16
  exit_code: 0
  verifier: config:executors.script.cai_dat_be_rong_do
  verified_at: 2026-09-04T13:03:38Z
  output: |
       TRAN: "Đã cắm và đang hoạt động bình thường ở mọi lượt" — ngang 274/198 · doc 16/16 · doi chung en 60/60 vua — main:2/div:0/div:1/div:0/div:1/div:1/form:0/div:0/div:0/div:0/span:1/span:1
    ket qua 360px: 78 nhan dich duoc · vi tran ma en vua=1 · ca hai cung tran=0 (bao rieng)
    cay lam viec da tro ve dung trang thai truoc khi chay.
    XANH: chan be-rong do dung chieu — 1 nhan tran o luot vi trong khi luot en vua, tai 360px.

## Việc của người ở cổng ký

Máy không quyết được bốn điều này:

1. **Nhận hay không nhận năm giới hạn đã khai** — nặng nhất là hai ô rỗng chưa ai
   nhìn thấy (đo được 1/3), và trạng thái không đủ quyền chỉ chứng được ở mức mã.
2. **E12 — chất lượng bản dịch.** Máy chỉ xác nhận từ vựng khớp `CONTEXT.md`
   (*công ty · cá nhân · thoả thuận*). Hai chỗ đáng nhìn: `luuTru.donVi` là mảnh câu
   (*"ngày. Mặc định là 180."*), và `tyGiaMoTaDau`/`tyGiaMoTaCuoi` cắt một câu làm hai khoá.
3. **Ba nợ có tên** — chấp nhận trả sau, hay đòi trả trước khi ký.
4. **`workspace` chưa có mục trong `CONTEXT.md`.** Thanh bên nay đọc *"Cài đặt công ty"*,
   trong khi *"công ty"* trên màn khác lại là một bản ghi. Cùng một chữ, hai vật.

### Re-pin lần 1 — 07/09, do chuỗi sáu vòng Việt hoá hợp nhất vào cùng cây

run_id: repin-20260906T215006Z-88260
sha: a99f80a2bf02c873af1500ddd1ca48bc1b6c153f · suites: 4 lệnh exit 0

### Re-pin lần 2 — 07/09, do vòng sửa `thuoc-cache-het-doi-tuong` chạm hai file cấu hình turbo

run_id: repin-20260907T005455Z-44758
sha: f8aa7f4a9e1ec9ce1be8585683103adf1a901431 · suites: 4 lệnh exit 0

### Re-pin lần 3 — 2026-09-16, do Chiến dịch ghim lại theo mốc kit 2.14.0 — sáu hồ sơ làn xanh; năm hồ sơ còn lại đỏ vì nguyên nhân thật, đi lượt riêng
run_id: repin-20260916T014000Z-73664
sha: 96ec6d9b0447bb8e3eafaf36c84dc9902372ebef · suites: 4 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · đạt-có-giới-hạn: E5=2

### Re-pin lần 4 — 2026-09-17, do chiến dịch ghim lại kit 2.14.0 (PR #47): làn eval thật trên cây đã chuyển đường ghi tạo phẩm; đo bằng phanlemanh@gmail.com
run_id: repin-20260917T051527Z-61120
sha: ed70d70dd0ec9ee7412b45e63c90c925500d50c6 · suites: 4 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · đạt-có-giới-hạn: E5=2

### Re-pin lần 5 — 2026-09-18, do ban khai o nhan len 10 sau khi PR #57 them muc Truong vao thanh ben
run_id: repin-20260918T131812Z-37957
sha: 7ea0e79dd739f9fb5254c3a6f6ee54312a6a2d85 · suites: 4 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · đạt-có-giới-hạn: E5=2

### Re-pin lần 6 — 2026-09-18, do them canh cay vao thuoc, tron onehub co ban va ban khai o nhan
run_id: repin-20260918T135152Z-29995
sha: 51b0f631670690e2f136fe1d77294193655aa382 · suites: 4 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · đạt-có-giới-hạn: E5=2

### Re-pin lần 7 — 2026-10-04, do sửa thước đỏ lô 2-4 (d2)
run_id: repin-20261004T153704Z-99356
sha: 2bf938e6511c00c6c2d29af571759b2afaad2a49 · suites: 7 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · đạt-có-giới-hạn: E5=2 · ngoài làn máy: E12 · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta
