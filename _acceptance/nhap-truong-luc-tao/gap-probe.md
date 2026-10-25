---
slug: nhap-truong-luc-tao
at: 2026-10-21T14:44:00Z
verdict: findings
p0: 1
p1: 4
p2: 1
---

# Phản biện context sạch — nhap-truong-luc-tao

Một tác tử tươi đọc đúng sáu tệp (design, contract, evals, decisions, bài học từ feature trước, opportunity), không đọc
mã. Một lượt, không chạy lại sau khi sửa.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Nghĩa của Ô tích lúc tạo (chưa tích là trống hay false; bắt buộc là phải tích hay phải có giá trị) do máy tự quyết trong design, sổ không ghi, mâu thuẫn AC-3 và AC-7 | Trường «Đã ký NDA» bật Kara điền: form gửi false, hàng chờ Kara bỏ khoá, Kara không bao giờ điền; bật Bắt buộc với ý phải tích thì form không chặn; mọi eval vẫn xanh | Dòng sổ chi-nguoi hai lối; AC-3, AC-4, AC-7 theo lối chọn; E3, E4b, E7 thêm ca Ô tích | human-gate1: Hỏi-4 (d-…-16), nháp theo khuyến nghị «chưa tích là để trống, bắt buộc là phải tích»; AC-3, AC-4, design, E3, E4b, E7 đã viết theo lối ấy |
| P1 | evals | Vế «phiếu mở ra hiện đủ giá trị» của AC-3 không có eval đo | Phiếu mở bằng bản ghi create trả về, không kèm giá trị trường; phiếu trống, người gõ lại; E3, E3b vẫn xanh | E3 đọc giá trị trên phiếu vừa mở với bản ghi rút qua bộ đọc thật, có đối chứng | fixed: E3 thêm vế phiếu và đối chứng 'thuoc phieu mu' |
| P1 | evals | Fixture lỗi của E5 dựng tay qua formatter; E5b không ghim chỗ đặt khoá; lỗi thiếu bắt buộc không có AC về cách app hiện | Khoá chỉ nằm trong message; app không biết ô nào sai; khi danh sách trường lỗi, toast in câu tiếng Anh; mọi eval xanh | Fixture rút từ lượt ném thật; ghim đường dẫn khoá; vế mới ở AC-5 | fixed: AC-5 thêm vế thiếu bắt buộc khi danh sách trường lỗi; E4b, E5b sinh fixture lỗi từ lượt thật (GHI_FIXTURE_LOI_TAO=1) và so với tệp đã commit; E5b đọc khoá tại đường dẫn của hằng dùng chung, có đối chứng; design quyết định 6 |
| P1 | contract | AC-4 không nói trường bắt buộc đã lưu trữ thì không chặn | Dịch vụ quên archivedAt: null, mọi lượt tạo bị chặn vì một trường form không hiện; E4b vẫn xanh | AC-4 thêm vế; E4b thêm fixture trường bắt buộc đã lưu trữ | fixed: AC-4 vế «trường bắt buộc đã lưu trữ không chặn»; E4b ca cu_bat_buoc theo loại × đường |
| P1 | evals | Lớp kiểu trường không có ma trận toàn phần; tiền tệ báo cáo mặc định không có eval | Trường tự tạo kiểu URL, EMAIL, PHONE, LONG_TEXT gửi sai khuôn lúc tạo; ô Giá trị sau khi qua bảng đăng ký mặc định USD; mọi eval xanh | E3, E3b ma trận đủ kiểu, đếm số ca; ca tiền tệ có đối chứng | fixed: E3, E3b ma trận đủ mười kiểu của FIELD_TYPES (Tiền không có ở trường tự tạo; ô Giá trị chuẩn giữ bởi E1), đếm 10; E1 ca tiền tệ báo cáo VND có đối chứng USD |
| P2 | contract | Mẫu số của thước 80% gồm cả bản ghi do đường máy tạo | Tỉ lệ đọc sai ở Cổng Giá trị | Tách mẫu số theo nguồn tạo | fixed: Đường đo và opportunity.md chỉ đếm bản ghi `source = MANUAL`, đo trường đang hiện trên phiếu |
