---
schema_version: 1
slug: thuoc-mot-cho-khai-quet-man
feature: "Thước «một chỗ khai» của K2b quét thật khu soạn: đường quét khai một chỗ, gốc nào rỗng thì đỏ"
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-08T16:47:19Z
prototype:
  base_commit: d089cb8da
  disposition: archive
---

## Vấn đề & ai gặp

Người ký Cổng 2 tin vào phép đo E7 của K2b (`soan-okr-khong-lac`): «tập kết quả nộp `da-ghi`/`tu-choi` khai đúng một
chỗ ở `packages/validation`, agent và khu soạn không khai lại». Nhưng `rang/mot-nguon.mjs` quét khu soạn bằng
`glob("apps/app/app/(app)/[slug]/okr/soan/**/*.ts*")`, và `glob` của Node đọc `(app)` và `[slug]` là cú pháp mẫu:
nhánh khu soạn khớp 0 tệp trong 22 tệp thật (đo 09/10 trên `d089cb8d`). Ai khai lại tập trong khu soạn thì E7 vẫn
xanh, hai nơi lệch nhau và người dùng thấy trạng thái nộp sai mà không ai được báo. Nguồn: Ngoài-4 của
`soan-okr-khong-lac`, Cổng 2 2026-10-08T16:47:19Z (luật 26 của đợt `sau-14-10`).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Khu soạn hôm nay không khai lại tập (sửa thước xong vẫn xanh) | Sửa thước làm E7 của K2b đỏ — lộ lỗi sản phẩm thật | Quét 22 tệp khu soạn bằng regex của thước | Có — 0 tệp khai, 09/10 |
| 2 | Chỉ `mot-nguon.mjs` mắc bẫy glob trong các thước của K2b | Thước khác cũng quét rỗng | `grep 'glob('` trong `_acceptance/*/rang/*.mjs` | Có — một tệp, 09/10 |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: thước «một chỗ khai» của K2b có thật sự quét khu soạn không.
- Kết quả nào là SỐNG: [đề xuất] trên cây lành, `mot-nguon.mjs` quét đủ ba lớp (agent, khu soạn, validation) với số tệp > 0 ở mỗi lớp và vẫn xanh; một bản sao khai lại tập trong khu soạn làm nó đỏ, gọi tên tệp.
- Kết quả nào là CHẾT: [đề xuất] còn một lớp quét khớp 0 tệp mà phép đo vẫn xanh, hoặc khai trùng trong khu soạn không làm nó đỏ.
- Timebox: [đề xuất] lượt S4 của chính hồ sơ; việc nội bộ của thước, không có phiên nghiệm thu người dùng.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Khuôn quét gốc bằng đọc thư mục, gốc rỗng thì đỏ | `_acceptance/ly-do-tu-choi-nop-theo-locale/rang/mot-nguon.mjs` (K2c, đã ký) | khuôn nội bộ | Có — chép cách làm | Phan Le Manh (Cổng 2 K2c) |

## Cổng 0

- **decision = build.** Căn cứ: luật 26 — Ngoài-4 của `soan-okr-khong-lac`, Cổng 2 2026-10-08T16:47:19Z.
- **disposition = archive.** Căn cứ: không có prototype.
- **Ngưỡng:** giữ `[đề xuất]` tới khi anh duyệt Cổng 1 (luật 27); đơn `yeu-cau/P7-14.json`.

## Thước đo thành công → ứng viên criterion

- Ba lớp quét đều > 0 tệp trên cây lành → AC-1.
- Khai trùng ở từng lớp làm thước đỏ, gọi tên tệp → AC-2.
- Gốc rỗng ở từng lớp làm thước đỏ, gọi tên gốc → AC-3.
