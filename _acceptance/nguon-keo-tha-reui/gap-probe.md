---
slug: nguon-keo-tha-reui
at: 2026-09-28T11:34:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Chiều đỏ của E8/E9b (dùng lại phép đo đã ký) chỉ sửa hop-tai-nguon.tsx, không sửa tệp vòng này đổi | Vùng mới quên nối onFilesAdded mà ca âm tính của E8/E9b vẫn xanh; bỏ lyDoTuChoiTep trong thành phần không làm E8 đỏ vì hộp còn kiemTep | Chiều đỏ trên bản sao nguon-keo-tha.tsx chạy bằng chính lệnh msd_man_tai_loi/msd_man_hang_nguon | fixed: E8 và E9b thêm chiều đỏ «bản sao nguon-keo-tha.tsx bỏ onFilesAdded → ca đối chứng/trùng đỏ»; E8 ghi rõ chiều đỏ bỏ lyDoTuChoiTep thuộc E3 |
| P1 | evals | E10 đo tệp chữ, không đo nhãn nút thật theo ngôn ngữ | hop-tai-nguon truyền nhầm khoá mà messages-guard vẫn xanh; E11u chỉ chụp tiếng Việt | Ca DOM trên hộp tải thật vi và en, so trọn chuỗi từ tệp chữ | fixed: E10 thêm tệp apps/app/test/nguon-keo-tha-chu.dom.tsx (vi/en, so trọn chuỗi, chiều đỏ ghim «nhan nut khong lay tu tep chu»); AC-10 viết lại |
| P1 | design | Tác dụng phụ của móc: URL.createObjectURL cho mọi tệp, danh sách tệp riêng | Nếu môi trường DOM thiếu createObjectURL thì mọi lần chọn ném lỗi, E3/E8/E9b đỏ mà không được sửa test đã ký | Chạy thử trong môi trường test trước khi viết thành phần | fixed: đo 28/09 — bun test với preload jsdom có URL.createObjectURL (Bun tự có); design ghi tác dụng phụ, contract Notes ghi URL không thu hồi cho Word/PDF |
| P1 | evals | E1 gộp nhiều tệp mỗi kiểm mà chiều đỏ chỉ phá một; khong-doi trùng byte qua rỗng nếu sai đường; neo merge-base sống | Sai đường globals.css → cả hai phía thiếu → xanh giả; PR sau sửa button.tsx kéo hồ sơ này đỏ | Bản phá riêng từng ô; kiểm tồn tại hai phía; đổi neo | fixed: E1 thành ma trận kiểm × tệp, mỗi ô một bản phá; kiểm tồn tại hai phía; «nhánh không chạm» đo bằng diff từ điểm rẽ; bỏ ba tệp nóng khỏi paths; ghi Known limit xanh-rỗng sau gộp |
| P2 | contract | Tắt × kéo không có AC | Kéo qua vùng tắt vẫn bật data-keo, vùng mời thả mà thả không có gì | Thêm hàng tắt+dragenter vào ma trận E7 | fixed: AC-7 thêm vế tắt; E7 ma trận 5 hàng, chiều đỏ ghim «vung tat van bat data-keo»; design ghi vùng tắt vẫn nối móc để trình duyệt không tự mở tệp |
