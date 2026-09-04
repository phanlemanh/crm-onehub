---
schema_version: 1
slug: man-cai-dat-noi-tieng-viet
verdict: PASS
round: 3
run_id: s4r3-20260904T121903Z-30646
verified_commit: f8c65619b81cc7a16f67922afef69fb6ddc253cd
verified_at: 2026-09-04T12:19:03Z
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
| E12 | AC-1 | — | judgment — **việc của người** |
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
