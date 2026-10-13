# Bộ câu hỏi mẫu — thiết kế

Hàng `cb` của `docs/plan/lo-trinh-kho-tai-lieu.json`, dãy P6 đợt r2. Câu giao: «Trợ lý kho được đo trên 50 câu
hỏi mẫu viết theo tài liệu của kho mẫu — câu trả lời được, câu phải nói không biết, câu hỏi qua Zalo — không
chờ người gom câu hỏi thật». Hàng `l5` (`sua-sau-chay-that`) đứng trên hàng này: thiếu góp ý thật thì nó sửa
theo kết quả đo trên bộ này.

## Có gì sẵn

- Script chấm `_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts --bo <tệp>`: dựng kho đo dùng-một-lần, gieo tám
  trang `_acceptance/tro-ly-doc-kho/bo-do/trang-mau/*.md`, hỏi mọi câu quy định qua `tro_ly_kho` (lượt một),
  hỏi lại mọi câu qua phiên Zalo của agent gốc (lượt hai), chấm «đúng trang», «từ chối đúng», «chuyển», «chuyển
  nhầm». Khuôn bộ là `khuonBo` của `quyet-do.ts`: bốn nhóm `co-trang`, `khong-co`, `khong-dau`,
  `khong-phai-quy-dinh`; khoá lạ bị bỏ qua khi đọc.
- Bộ «tạm» 40 câu `bo-do/mam-tam.json`, chủ kho chọn ở Cổng Phạm vi của `tro-ly-doc-kho`.
- Khuôn chuẩn hoá và tầng của bộ vàng ở `docs/plan/kho-tai-lieu-bo-vang.md` mục 2.

Hồ sơ `tro-ly-doc-kho` đã ký: hàng này không sửa tệp nào của nó, chỉ gọi script chấm.

## Làm gì

Mọi tệp sống trong `_acceptance/bo-cau-hoi-mau/`.

1. **`bo-mau.json`** — 50 câu, nhãn bộ `mau`, câu nguồn (`nguon`) mở đầu «Bộ mẫu giả», khuôn `khuonBo`
   (gồm `bienTheCua`: mã câu gốc của một biến thể S7) cộng năm khoá chỉ bộ này đọc:
   - `tang`: `S1` sự kiện đơn · `S2` cần hai trang · `S3` ngưỡng, ngoại lệ, điều kiện · `S6` không trang nào
     trả lời · `S7` chữ nhiễu · `ngoai-kho` không phải câu hỏi quy định.
   - `kieuChu`: `chuan` · `khong-dau` · `viet-tat` · `sai-chinh-ta` · `tron-anh` · `tin-zalo`.
   - `y`: ý trọng yếu — câu nguyên văn của trang mong đợi mà câu trả lời thiếu thì sai.
   - `ganTrang`: với câu S6 viết cho giống một trang (kiểu SQuAD 2.0), trang mà nó giống.
   - `mau: true` ở mọi câu.

   Tầng ánh xạ sang nhóm của script chấm: S1–S3 → `co-trang` (S2 mang `kho: hai-trang`, S3 mang
   `kho: nguong-ngoai-le`), S6 → `khong-co`, S7 → `khong-dau` (script chấm chấm nhóm này như `co-trang`),
   `ngoai-kho` → `khong-phai-quy-dinh`.

   Thành phần viết trước:

   | Tầng | Số câu | Ghi chú |
   | --- | --- | --- |
   | S1 | 15 | 30% bộ, theo `kho-tai-lieu-bo-vang.md` |
   | S2 | 5 | hai trang |
   | S3 | 8 | ngưỡng, ngoại lệ |
   | S6 | 8 | 4 gần trùng một trang, 4 ngoài hẳn |
   | S7 | 10 | 2 mỗi kiểu: không dấu, viết tắt, sai chính tả, trộn tiếng Anh, tin Zalo; biến thể của câu S1 hay S3 |
   | ngoài kho | 4 | câu CRM, OKR, chào hỏi |

   Lượt một hỏi 46 câu, lượt hai hỏi cả 50.

2. **`rang/kiem-bo.ts`** — kiểm một tệp bộ, mỗi luật một tên và một câu ghim: `khuon` (khuôn chặt, nhãn
   `mau`, mã `mNN` không trùng, nhãn giả) · `thanh-phan` (đếm theo tầng × kiểu chữ đúng bảng, nhóm và `kho`
   khớp tầng) · `trang-mong` (trang mong đợi và `ganTrang` có trong tám trang, S2 đủ hai nhóm trang, biến thể
   S7 trỏ một câu S1/S3 chữ chuẩn có cùng trang mong đợi) · `y-trong-yeu` (mỗi ý là chuỗi con NFC của một trang
   mong đợi; S7 chép ý của câu gốc; S6 và ngoài kho không có ý) · `rieng-tu` (không số điện thoại, email, số
   hợp đồng). Thoát 0 sạch, 1 có vi phạm.

3. **`rang/do-bo-mau.ts`** — ba chế độ:
   - `--do`: luôn đo mới. Gọi `cham-bo-do.ts --bo bo-mau.json` (lệnh gọi đổi được qua biến `BCM_LENH_CHAM`
     để bài kiểm tiêm script chấm giả) với `BANG_CHUNG` trỏ `.acceptance-runs/bo-cau-hoi-mau/`, đọc
     `cham-tung-cau.jsonl` của lượt một và lượt hai, so tập mã với bộ (thiếu hay trùng mã → thoát 2), dựng bảng
     theo tầng và theo kiểu chữ, danh sách câu không đạt (đầu vào của `l5`), chép nguyên các dòng «Tổng» của
     script chấm, ghi băm `bo-mau.json` và băm nội dung `apps/agent/agent/**` lúc đo, ghi cả vào
     `.acceptance-runs/bo-cau-hoi-mau/<lượt>/`, in lệnh `--ghi <thư mục>`. Lượt đủ mã là «đã đo»: thoát 0 dù script chấm thoát 0, 1 (dưới
     ngưỡng) hay 2 vì có câu lỗi gọi model — câu lỗi nằm ở cột lỗi và danh sách không đạt với nhãn `loi`. Script
     chấm không để lại thư mục lượt, hay jsonl thiếu hoặc trùng mã → thoát 2 «không đo được». (Sửa ngày
     2026-10-13 sau hai lượt đo thật đều có 2/96 câu lỗi model — chủ kho chọn lối (a).)
   - `--ghi <thư mục>`: chép `do-bo-mau.md`, `cham-tung-cau.jsonl`, `cham-bo-do-mau.md` vào `evidence/`.
   - Không cờ: chỉ kiểm. `evidence/do-bo-mau.md` và `evidence/cham-tung-cau.jsonl` phải có, mang băm
     `bo-mau.json` hiện tại, tập mã đủ, bảng tính lại từ jsonl khớp từng ô → thoát 0 «khop». Thiếu, lệch băm
     hay lệch ô → thoát 1 với câu ghim. Không gọi model, không ghi tệp.

   Vòng này đo bằng `--do` trong S3 rồi commit bằng chứng; eval S4 và mọi lượt ghim lại chạy chế độ kiểm.
   Băm mã trợ lý chỉ ghi để người đọc thấy số đã cũ so với trợ lý hay chưa; nó không vào khoá kiểm, nên sửa
   `apps/agent` không làm đỏ hồ sơ này. `l5` sửa trợ lý xong thì chạy `--do` rồi `--ghi`.

4. **`README.md`** — lệnh kiểm, lệnh đo, chi phí ước, cách thêm câu.

Hằng số (bảng thành phần, đường dẫn, mẫu riêng tư) ở `rang/bo-mau-config.ts`.

## Không làm

- Đòi trợ lý đạt ngưỡng: sửa trợ lý là việc của `l5` và nằm ngoài ranh giới hàng này.
- Câu thật: trỏ trang thật, còn script chấm chỉ gieo trang mẫu; bộ thật ở ngoài git theo
  `kho-tai-lieu-bo-vang.md` mục 3.
- Tầng S4, S5, chấm ý trọng yếu tự động, trang mẫu mới.

## Đặc tả UX

Không chạm màn nào: bỏ, ghi ở sổ quyết định.
