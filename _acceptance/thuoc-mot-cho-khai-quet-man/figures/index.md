# Hình tại điểm quyết định — thuoc-mot-cho-khai-quet-man (Cổng 1)

| Điểm | Đếm | Hình |
|---|---|---|
| Sổ d-…-1 (approach): đọc thư mục thay glob của Node | 2 nhánh rẽ (thoát ký tự cho glob · đọc thư mục) | `truoc-sau.html` |
| Sổ d-…-6 (approach): chiều đỏ trên cây tạm cùng bố cục | 4 bước nối tiếp (dựng cây · bản cũ trên cây lành · thêm khai trùng · bản cũ và bản mới trên cùng cây) | `truoc-sau.html` (gộp với điểm trên) |
| Sổ d-…-2..5 (descope: coverage-scan, design-pass, đặc-tả-UX, ui-observed) | dưới ngưỡng: 1 bước mỗi điểm | — |
| Coverage `[GIẢ ĐỊNH]` | 0 dòng | — |
| gap-probe `human-gate1` | 0 mục | — |

## Đề bài `truoc-sau`

- Loại hình: hai làn so sánh (trước / sau) trên cùng một cây tạm.
- Làn trên «Thước cũ (d089cb8d)»: mẫu glob `…/(app)/[slug]/okr/soan/**/*.ts*` → khớp 0/22 tệp khu soạn → khai trùng `them.ts` trong khu soạn → thoát 0 «KET_QUA_NOP 1 cho» (lọt).
- Làn dưới «Thước mới»: `GOC_QUET` trong chung.mjs → đọc thư mục, khu soạn 22/22 → cùng `them.ts` → thoát 1 «tap ket qua khai 2 cho: …/soan/them.ts» (bắt).
- Nhánh phụ: gốc rỗng → thước mới thoát 1 «goc quet rong: khu-soan».
- AC liên quan: AC-1, AC-2, AC-3 (E1, E2, E3).
