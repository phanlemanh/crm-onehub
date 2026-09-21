# Hình tại điểm quyết định — khai-lang-gioi-thieu

| Điểm | Đếm | Hình |
|---|---|---|
| Finding P0 của gap-probe (human-gate1): đo chỗ gọi đoạn giới thiệu thế nào | hai nhánh rẽ → cần hình | `hai-loi-do-cho-goi.html` |
| Năm dòng descope trong sổ (coverage-scan, design-pass, đặc-tả-UX, ui-observed) và dòng approach rút vật | mỗi dòng một bước, không rẽ → dưới ngưỡng: 1 | — |

## Đề bài: hai-loi-do-cho-goi

- Loại hình: cây quyết định hai nhánh (decision tree / solution tree).
- Gốc: «Đoạn giới thiệu trên tấm hồ sơ công ty — ca đỏ prod ff3fb8bf — đo bằng gì?»
- Nhánh (a) «Giữ giới hạn có tên»: không đổi mã · E1–E3 đo cơ chế · chỗ gọi đo bằng quan sát prod của chủ kho sau khi gộp (/acceptance-gate:observed) · rủi ro: chỗ gọi mất ForeignText mà máy không đỏ.
- Nhánh (b) «Tách thành phần + E4»: tách khối giới thiệu thành thành phần trình bày nhỏ · thêm bài kiểm của kho dựng nó dưới tổ tiên lang="vi" · đòi vùng "en", chiều đỏ Received "vi" · giá: S3 thành một task, thêm một lượt S4.
- AC liên quan: AC-1, AC-2 (cơ chế); AC-4 mới nếu chọn (b).
