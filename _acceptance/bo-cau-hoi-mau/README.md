# Bộ câu hỏi mẫu

50 câu hỏi giả viết theo tám trang mẫu của kho đo (`_acceptance/tro-ly-doc-kho/bo-do/trang-mau/`), để đo trợ lý
kho mà không chờ câu hỏi thật. Thiết kế ở `design.md`, hợp đồng ở `contract.md`.

## Bộ gồm gì

| Tầng | Số câu | Là gì |
| --- | --- | --- |
| S1 | 15 | một trang trả lời |
| S2 | 5 | cần hai trang |
| S3 | 8 | ngưỡng, ngoại lệ |
| S6 | 8 | không trang nào trả lời — 4 viết cho giống một trang (`ganTrang`), 4 ngoài hẳn |
| S7 | 10 | câu S1/S3 gõ kiểu người thật: không dấu, viết tắt, sai chính tả, trộn tiếng Anh, tin Zalo — 2 mỗi kiểu |
| ngoài kho | 4 | câu CRM, OKR, chào hỏi — đo việc Zalo không chuyển nhầm |

Mỗi câu có trang mang `y`: câu nguyên văn của trang mà câu trả lời đúng phải chứa.

## Lệnh

Từ gốc kho:

```bash
bun _acceptance/bo-cau-hoi-mau/rang/kiem-bo.ts
```

Kiểm năm luật (khuôn, thành phần, trang mong đợi, ý trọng yếu, riêng tư). Không gọi model.

```bash
bun _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts --do
```

Đo trợ lý thật qua `cham-bo-do.ts --bo`: hỏi 46 câu quy định qua `tro_ly_kho`, hỏi cả 50 câu qua Zalo. Cần
khoá AI Gateway trong `.env`; tự dựng kho đo dùng-một-lần. Khoảng 96 lượt hỏi, ước $2–4, vài chục phút. Kết
quả ghi vào `.acceptance-runs/bo-cau-hoi-mau/<lượt>/`, cuối cùng in lệnh `--ghi`.

```bash
bun _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts --ghi <thư mục lượt>
```

Chép báo cáo, `cham-tung-cau.jsonl` và câu trả lời vào `evidence/`. Commit để lệnh kiểm dùng được.

```bash
bun _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts
```

Chỉ kiểm bằng chứng đã lưu: băm bộ khớp, đủ mã, bảng tính lại khớp. Không gọi model, không ghi tệp. Sửa trợ lý
không làm lệnh này đỏ; dòng `bam tro-ly` trong báo cáo cho biết số đo trên mã trợ lý nào.

## Thêm hay sửa câu

Sửa `bo-mau.json` (giữ thành phần ở `rang/bo-mau-config.ts`, đổi bảng thì đổi cả `contract.md`), chạy
`kiem-bo.ts`, rồi `--do` và `--ghi`. Bộ đổi mà chưa đo lại thì lệnh kiểm báo «bam lech».

Câu hỏi thật không vào bộ này: chúng trỏ trang thật, mà script chấm chỉ gieo tám trang mẫu; bộ thật giữ ngoài git
theo `docs/plan/kho-tai-lieu-bo-vang.md` mục 3.
