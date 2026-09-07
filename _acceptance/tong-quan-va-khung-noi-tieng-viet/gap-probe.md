---
slug: tong-quan-va-khung-noi-tieng-viet
at: 2026-09-08T00:00:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
claims_input: ok
---

# Phản biện context sạch — S1

Một agent tươi đọc đúng năm file (design doc · contract · evals · decisions ·
claims từ 10 hồ sơ trước), không đọc mã, không đọc hội thoại. Năm finding, cả năm
sửa vào artifact trong cùng lượt (one-pass, không re-probe).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E15(2) hứa "bằng chứng đã ký tái lập được sau khi sửa man-that-lib.mjs" nhưng hai mũi chạy lại là bộ quét AST không import GOM/DO_RONG; DO_RONG() mặc định không có đối chứng | S3 sửa GOM tiện tay đổi selector gốc cũ: E14(a) vẫn xanh vì GOM() và GOM(false) cùng đi đường mới, E15 xanh vì AST không chạm lib; năm bằng chứng đã ký nói dối | E15(2) chạy lại man-that.mjs của man-cai-dat KHÔNG tham số trên máy chủ thật, số chuỗi và số nhãn bề rộng BẰNG con số ghim trong evidence đã ký; chân AST đếm mọi mũi gọi GOM( và DO_RONG( ngoài rang/ của lát không truyền tham số | fixed: AC-14 và E15 viết lại đúng thế; thêm vế DO_RONG vào E14 |
| P1 | contract | Bảng không-dịch AC-7 chứa phần tử chỉ hiện khi dữ liệu có (bảy nhãn giai đoạn, mã tiền tệ) mà không khai điều kiện dữ liệu | Seed chỉ có 5/7 giai đoạn và mọi thoả thuận có tỷ giá: tập ứng viên thiếu 3 mục, E7 mã 2 vĩnh viễn; hoặc S3 cắt bảng cho khớp seed và bảng "đóng" thành bảng chép từ màn | Mỗi dòng khai `dieu_kien`; E7 kiểm seed qua nguon_san trước khi gom; dòng không dựng được đo mức mã với nhãn đọc THẬT từ deal-stage.ts qua import | fixed: AC-7 và E7 viết lại; bảy nhãn round-trip từ deal-stage.ts |
| P1 | contract | Trục B giá trị rỗng và đang tải không có AC; không eval màn nào dựng trạng thái rỗng; E2 mở ⌘K nhưng không gõ | Bảng của @crm/ui có chữ rỗng mặc định tiếng Anh khi thiếu prop; S3 quên truyền câu rỗng: AC-4 xanh, E16 xanh, E1 xanh trên seed có dữ liệu; nhân viên workspace mới thấy "No overdue tasks" | AC-3 dựng `/` ở trạng thái rỗng hai lượt, 5 assert = 5 câu rỗng; E2 gõ chuỗi không khớp để "Không có gì khớp." render; chiều đỏ: xoá prop câu rỗng thì chân đỏ gọi tên bảng | fixed: thêm AC-3 + E21 (tq_trang_thai_rong, dựng bằng scope=me của tài khoản không sở hữu gì); E2 thêm bước gõ; Coverage B đủ ba giá trị đo, đang-tải đo mức mã |
| P1 | evals | AC-5 hứa quan hệ (kho → tham số → toast) nhưng E5 chỉ đo vắng mặt literal; E5 và E11 khai hai mã khác nhau cho cùng vết toast; không eval nào dựng đăng xuất hỏng [d-20260907T131000Z-9909] | S3 giữ `catch {}` cũ, chỉ đổi chữ ký: E5 xanh, nhân viên đăng xuất hỏng không thấy gì mà Cổng 2 ký "đã đóng nợ" | E5 tách hai lớp (literal trong toast → mã 1; bảng lệch → mã 2) + chân quan hệ AST; đối chứng dương: bài kiểm đơn vị sign-out.ts với đăng xuất bị từ chối → toast.error nhận đúng chuỗi truyền vào, không redirect | fixed: E5 viết lại; thêm E20 test `tq_dang_xuat`; AC-5 nói rõ hai chân |
| P2 | contract | AC-2 biến thể ngăn kéo trên /chat gom cả thanh bên hội thoại — chữ của hồ sơ cua-so-tro-chuyen và tiêu đề hội thoại không có trong bảng nào | Seed có hội thoại: tiêu đề giống hệt hai lượt, không translate="no" vì thuộc hồ sơ khác → vế "mỗi cặp khác nhau" đỏ; S3 hoặc chạm component của hồ sơ khác hoặc thêm miễn trừ không chủ | Biến thể /chat gom chỉ `nav` rail trong SheetContent theo selector ghim, in số chuỗi đã trừ kèm tên hồ sơ chủ | fixed: AC-2 viết lại đúng thế |

## Cross-check — năm điểm thêm vào artifact

- Design doc đếm sai (13 tiêu chí / 17 phép đo) → sửa theo số thật sau vòng này: 17 tiêu chí, 21 phép đo.
- AC-6 chưa có vế màn cho `document.title` → E1 đọc thêm `document.title` hai lượt (khác nhau, `vi` có dấu); E6 đo quan hệ (giá trị `title` trả về từ hàm gọi `tongQuanMessages(getLocale())`), không đo import.
- E8 chưa ghim "đo được + không đo được = số dòng bảng" → thêm.
- Chuẩn WAI-ARIA landmarks tự nêu mà không đo → E2 thêm vế: tên truy cập của các `nav` trong một bề mặt gom phải khác nhau.
- E19 đọc `ban-dich.md` chưa khai nguồn → Notes của hợp đồng khai: S3 sinh `ban-dich.md` từ hai kho (như ③a), là phụ; hai kho thật là chính. Mọi `rang/*.mjs` suy ROOT từ `import.meta.url`; E15(1) kiểm.

Không lật quyết định nào trong sổ. Không finding P0.
