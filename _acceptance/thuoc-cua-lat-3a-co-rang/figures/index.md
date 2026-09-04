# Điểm quyết định của Cổng 1 — đếm ngưỡng N5 và đề bài hình

Máy kê từ artifact cuối S1. Ngưỡng N5: một điểm cần hình khi nó đi qua **từ ba
bước nối tiếp** hoặc **từ hai nhánh rẽ** trở lên.

| Điểm | Đếm | Hình |
| --- | --- | --- |
| `d-…-11021` bỏ đặc-tả-UX | 1 nhánh | dưới ngưỡng: 1 |
| `d-…-11022` vòng riêng thay vì mở rộng hợp đồng ③a | 2 nhánh | Hình 2 |
| `d-…-11023` sổ khai sinh chạy lại mỗi lượt, thay vì lời khai tĩnh trong hồ sơ | 4 bước nối tiếp | Hình 1 |
| `d-…-11024` véc-tơ phá mặc định là lật ngôn ngữ, không phải cây sao | 2 nhánh | Hình 1 |
| `d-…-11025` tách `dot-bien.mjs` khỏi khuôn cặp-hai-chiều | 2 nhánh | Hình 2 |
| `d-…-11026` không mở rộng sang giàn đo vòng ① và ② | 1 nhánh | dưới ngưỡng: 1 |
| Coverage — dòng `[NGÀNH: Stryker · PIT · mutmut]` chờ người gạch | 1 nhánh | dưới ngưỡng: 1 |

## Đề bài Hình 1 — «Một lượt khai sinh»

- Loại: sơ đồ luồng có nhánh (flowchart).
- Nút: `sổ khai sinh (khai-sinh.json)` → `chạy chiều lành` → `chân im? xanh` /
  `chân kêu? ⇒ ĐỎ: thước hỏng sẵn` → `áp véc-tơ phá (mặc định: lật lang=en)` →
  `chạy lại` → `đỏ ĐÚNG thông điệp ghim? ⇒ ĐẠT` / `còn xanh? ⇒ ĐỎ: chân không đo
  được gì` / `đỏ nhưng sai thông điệp? ⇒ ĐỎ: đỏ vì lý do khác` → `trả vật về
  nguyên trạng`.
- Một nhánh phụ vẽ **bánh cóc hai chiều**: `danh sách chân đo có thật` (các file
  trong `rang/` cộng bài kiểm khoá-chết, trừ bản khai miễn trừ) ↔ `sổ khai sinh`,
  hai mũi tên ngược nhau, mỗi mũi tên một nhãn đỏ (`chân có file, vắng mục trong
  sổ` · `mục trong sổ trỏ tới chân không còn file`). **Dân số KHÔNG lấy từ
  `evals.yaml`** — đó là lỗ mà phản biện context sạch bắt được: chân nào tài liệu
  quên nhắc tên thì không bao giờ bị đòi khai sinh.
- Nhánh «chân không đo được gì» phải có lối ra, không được cụt: `sửa cho đỏ được,
  hoặc XOÁ khỏi kho`, gắn mã `AC-13`.
- Nhãn bằng chữ thường, tiếng Việt. Không tên hàm, không mã thoát trên hình.
- Liên quan: AC-11, AC-2, AC-13, `d-…-11023`, `d-…-11024`, `d-…-11027`.

## Đề bài Hình 2 — «Chín khiếm khuyết, hai bệnh»

- Loại: sơ đồ phân nhóm (tree hoặc grouped map), hai nhóm.
- Nhóm trái **«xanh được mà không đỏ được» (8 cái)**, chia theo bốn lý do:
  `tập quan sát rỗng hoặc tự cấp` (khai-tiếng bỏ qua · nợ vòng ① vắng hai bên ·
  mẫu số bề mặt) · `chỉ kiểm một vế của quan hệ` (máy chủ về · bản dịch chưa
  ghim) · `vật đo do bên đọc nặn` (thẻ `<time>` tự dựng) · `đo nhầm vật`
  (dữ liệu biên đếm hàng thay vì đọc màn).
- Nhóm phải **«đỏ được, nhưng làm hỏng cây làm việc» (1 cái)**: `đột biến` —
  ghi chú: lớp lỗi này KHÔNG có trong bảng của bộ kit, và đó là lý do nó bị xếp
  nhầm bốn vòng liền.
- Mỗi lá gắn mã tiêu chí phủ nó (AC-1 … AC-10).
- Liên quan: `d-…-11022`, `d-…-11025`, mục Coverage.
