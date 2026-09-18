---
schema_version: 2
feature_slug: man-xin-quyen-co-rang
verdict: PASS
failed_evals: []
verified_by: phiên verify độc lập, lệnh chạy tuần tự
enforcement_mode: strict
bypass_used: false
verified_commit: 82758dd15c332c228b5db13468ebdeaa5f9a8acc
human_signoff: Phan Le Manh 2026-09-17 — ký Cổng 2 trên verdict PASS (11 eval và 4 lệnh chứng đều xanh, 15 vết đột biến chứng minh từng thước đỏ được), với NĂM giới hạn đã khai. Ký trên hiểu biết rằng vòng 1 đi ba lượt, hai lượt tải bầy đầu bị chặn vì cùng một lớp lỗi và lượt ba đổi sang chạy tuần tự; rằng AC-9 đã được thu lại giữa chừng vì sàn thiết kế không chứng được mức P0 trên màn này; và rằng hai mươi lăm mục ngoài hợp đồng đã được định đoạt từng mục ở lượt ký này — hai mục ghi Known limits, hai mươi ba mục mở hợp đồng mới, phần lớn đến từ 26 commit của PR #48 và #50 chứ không phải sản phẩm của vòng này.
---

# Evidence Report: man-xin-quyen-co-rang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-9 | ui-check | PASS |
| E11 | AC-10 | script | PASS |

## Đường chạy của vòng này

Vòng 1 chạy ba lượt. Hai lượt đầu đi đường tải bầy — mỗi lệnh một agent, chạy
song song — và **cả hai trả BLOCKED vì cùng một lớp lỗi**: đúng một agent không
đọc được trạng thái hoàn tất của lệnh mình chạy, dù dòng kết nằm ngay trong
output của chính nó. Lượt một là `E11`, lượt hai là `E1`; cả hai lệnh ấy đo tay
đều xong trong vài giây.

Theo điều khoản dừng-vá, lượt ba KHÔNG vá tiếp chi tiết mà **đổi khuôn**: một
phiên tươi chạy tuần tự, mỗi lệnh đúng một lần, bắt mã thoát trước khi cắt
output. Mười lăm lệnh, mười lăm lượt sạch.

Lượt hai cũng làm lộ một điều thật về `AC-9`: sàn thiết kế không chứng được
mức P0 trên màn này. Hợp đồng đã được thu lại và khai giới hạn có tên trước
lượt ba — xem `Known limits`, và mục `descope` trong sổ quyết định.

## Bằng chứng từng chân

- eval: E1
  run_id: tuan-tu-man-xin-quyen-co-rang-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.xin_quyen_chuoi
  verified_at: 2026-09-17T00:20:08Z
  output: |
    DAT: 5 o, moi o quan he ba ve dat

- eval: E2
  run_id: tuan-tu-man-xin-quyen-co-rang-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.xin_quyen_ba_nhanh
  verified_at: 2026-09-17T00:20:08Z
  output: |
    GIOI HAN DA KHAI: nhanh chi-Microsoft chi do o lop kho chuoi, chua render that
    DAT: hai nhanh dung that dung cau cua minh, ba nhanh khac nhau o kho chuoi

- eval: E3
  run_id: tuan-tu-man-xin-quyen-co-rang-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.xin_quyen_khong_dich
  verified_at: 2026-09-17T00:20:08Z
  output: |
    DAT: 2 ten nha cung cap nguyen van va mang translate="no"

- eval: E4
  run_id: tuan-tu-man-xin-quyen-co-rang-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.xin_quyen_ghep_dong
  verified_at: 2026-09-17T00:20:08Z
  output: |
    Ran 3 tests across 1 file — 3 pass, 40 expect() calls

- eval: E5
  run_id: tuan-tu-man-xin-quyen-co-rang-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.xin_quyen_dang_cap
  verified_at: 2026-09-17T00:20:08Z
  output: |
    DAT: chu tren nut o trang thai dang cap

- eval: E6
  run_id: tuan-tu-man-xin-quyen-co-rang-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.xin_quyen_loi_nha_cung_cap
  verified_at: 2026-09-17T00:20:08Z
  output: |
    DAT: cau bao loi khi khong toi duoc nha cung cap

- eval: E7
  run_id: tuan-tu-man-xin-quyen-co-rang-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.xin_quyen_loi_dang_xuat
  verified_at: 2026-09-17T00:20:08Z
  output: |
    DAT: cau bao loi khi dang xuat that bai

- eval: E8
  run_id: tuan-tu-man-xin-quyen-co-rang-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.xin_quyen_tieu_de_tai_lieu
  verified_at: 2026-09-17T00:20:08Z
  output: |
    DAT: tieu de tai lieu doi theo tieng cua nguoi doc

- eval: E9
  run_id: tuan-tu-man-xin-quyen-co-rang-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.xin_quyen_be_rong
  verified_at: 2026-09-17T00:20:08Z
  output: |
    DAT: 15 khang dinh be rong tren 3 kho man, khong o nao bi cat tran

- eval: E10
  run_id: tuan-tu-man-xin-quyen-co-rang-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.xin_quyen_chup_san
  verified_at: 2026-09-17T00:20:08Z
  screenshot: evidence/E10-xin-quyen-vi.png · evidence/E10-xin-quyen-en.png
  network_observed: n-a (driver)
  observed: |
    Hai khung hinh chia doi man: nua trai la khung thuong hieu toi mau voi nhan CRM va cau quang cao; nua phai la than man xin quyen. Khung tieng Viet: tieu de «Con mot buoc nua», doan mo ta ve quyen doc thu va lich, hai nut xanh dam «Cap quyen Google» va «Cap quyen Microsoft» moi nut kem bieu tuong nha cung cap, lien ket «Dang xuat» chu tran ben duoi, roi cau rieng tu. Khung tieng Anh: cung bo cuc, cung so phan tu, chu da doi sang «One more step», «Grant Google access», «Grant Microsoft access», «Sign out». Ten hai nha cung cap hien nguyen van giong het nhau o ca hai khung. Khong chuoi nao bi cat tran, khong o anh vo.
  output: |
    da chup vi: duong=/grant-access tieu-de="Cấp quyền · OneHub CRM"
    da chup en: duong=/grant-access tieu-de="Grant access · OneHub CRM"
    DAT: hai anh chup dung man /grant-access, danh tinh da khang dinh

- eval: E11
  run_id: tuan-tu-man-xin-quyen-co-rang-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.xin_quyen_tien_de
  verified_at: 2026-09-17T00:20:08Z
  output: |
    DAT: gieo -> /grant-access dung; go gieo -> chuyen huong ve /het-quyen

## Lệnh chứng

- eval: SUITE-test
  run_id: tuan-tu-man-xin-quyen-co-rang-SUITE-test-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-09-17T00:20:08Z
  output: |
    lệnh chạy trọn, kết thúc sạch

- eval: SUITE-lint
  run_id: tuan-tu-man-xin-quyen-co-rang-SUITE-lint-r1
  exit_code: 0
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-17T00:20:08Z
  output: |
    lệnh chạy trọn, kết thúc sạch

- eval: SUITE-lint-slop
  run_id: tuan-tu-man-xin-quyen-co-rang-SUITE-lint-slop-r1
  exit_code: 0
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-17T00:20:08Z
  output: |
    lệnh chạy trọn, kết thúc sạch

- eval: SUITE-build
  run_id: tuan-tu-man-xin-quyen-co-rang-SUITE-build-r1
  exit_code: 0
  verifier: config:executors.script.build_khong_cache
  verified_at: 2026-09-17T00:20:08Z
  output: |
    lệnh chạy trọn, kết thúc sạch

## Known limits

Năm giới hạn đã khai trong hợp đồng, chữ ký ở Cổng 2 phủ cả năm:

1. **Nợ «browser check vẫn đếm ba» KHÔNG được vá ở vòng này.** Bộ thước của hồ sơ `cua-vao-noi-tieng-viet` vẫn liệt kê ba đường ở ba chỗ. Vòng này dựng thước RIÊNG cho màn thứ tư, nên `/grant-access` từ nay có phép đo trình duyệt — nhưng hợp đồng gốc vẫn tự mâu thuẫn với chính nó cho tới khi ai đó hợp nhất hai thước. Đánh đổi cố ý để không làm cũ bằng chứng đã ghim của hồ sơ gốc.
2. **Sàn thiết kế KHÔNG chứng được mức P0 trên màn này.** Bốn đường đã thử ở vòng chấm này đều cho số 0 rỗng nghĩa: chế độ tĩnh tự khai không thấy được tương phản tính ra, còn chế độ DOM qua jsdom không tính nổi `color-mix()`, `oklch(from currentColor …)`, `@layer` và `@container` của tệp kiểu. Lỗ năng lực công cụ, không phải sản phẩm hỏng — đọc mắt trên hai khung hình không thấy khuyết tật hạng P0 nào. AC-9 đã được thu lại và thôi tuyên điều nó không chứng được.
3. **Chỉ nhánh chỉ-Microsoft là chưa render thật.** Đo ở lớp kho chuỗi. Hai nhánh kia — chỉ-Google và cả-hai — đều dựng màn thật ở E2.
4. **AC-9 bắt CẮT TRẦN, không bắt TRÀN DÒNG.** Một cụm từ dài ở ô biết xuống dòng thì chữ xuống dòng chứ không bị cắt, nên phép đo không đỏ — đúng, vì đó không phải lỗi. Ca cắt trần thật là một từ liền không khoảng trắng, và chiều đỏ dùng đúng ca đó.
5. **Vòng này không sinh hay đổi một nét giao diện nào.** Không có buổi soi thiết kế trên bản bấm được, không có bản mô tả cấu trúc màn, không nạp bộ chuẩn giao diện nội bộ. Ba mục ghi trong sổ quyết định.

## Cặp hai chiều

Mọi phép đo của hồ sơ này sinh ra kèm một vết đột biến chứng minh nó ĐỎ được.
Bộ vết sống ở `rang/chieu-do.mjs`, chạy trên một bản sao kho ở cổng riêng —
không phải trên cây đang làm việc. Mười lăm vết, mười lăm lần thước đỏ đúng chỗ
và gọi đúng tên ô hỏng: năm vết cho `E1` (đủ năm khoá như bản khai đòi), một cho
`E2`, một cho `E3`, ba cho `E9` (hai vết tràn ở hai ô khác nhau, một vết gỡ hẳn
một nút để chứng chốt đếm nút), một cho `E5`, một cho `E6`, một cho `E7`, một cho
`E8`, và một cho `E10`.

Ba vết trong số đó tìm ra lỗi thật **trong chính thước**, không phải trong sản
phẩm: một khẳng định hằng-đúng ở ô biết xuống dòng; một bộ chọn theo vị trí lặng
lẽ trỏ sang nút khác khi một nút biến mất; và một nửa phép đo đọc cây khác nửa
kia. Không lần chạy xanh nào bắt được cả ba.

### Re-pin lần 1 — 2026-09-17, do hoá cũ do onehub viết lại cổng tiền đề tien-de.mjs
run_id: repin-20260917T170226Z-57366
sha: fa2628905af26ed41056ed2df1cd18216e9c29ef · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-09-17, do hoa cu do onehub nhan PR #53 sau lan ghim truoc
run_id: repin-20260917T171011Z-12715
sha: 82758dd15c332c228b5db13468ebdeaa5f9a8acc · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng
