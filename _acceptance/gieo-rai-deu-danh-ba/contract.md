---
schema_version: 1
feature: Bộ gieo rải mẫu đều qua các trang danh bạ, thay vì cắt 200 người đầu bảng
slug: gieo-rai-deu-danh-ba
owner: omre.cnsp4@onemount.com
risk_tier: T2
surfaces: [cli]
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-07T14:50:59Z
---

# Acceptance Contract: gieo-rai-deu-danh-ba

## Context

Danh bạ môi giới của nhatot xếp theo sản lượng **giảm dần**. Bộ gieo hiện dừng
ngay khi gom đủ `--limit` địa chỉ rồi cắt `found[:limit]`
(`__main__.py:210` và `:228`), nên mọi lượt cào chỉ lấy phần đầu bảng. Đo trên
kho ngày 07/09: 98 hồ sơ, thấp nhất 36 tin, **không ai dưới 20** — hai mức
«Thấp» và «Ngủ» của trục Sản lượng rỗng, và thước «phân khúc này so phần còn
lại» chỉ chia được Cao với Vừa.

Nâng `directory_max_pages` không chữa được: bộ gieo vẫn cắt từ đầu. Phải rải
mẫu qua toàn bộ dải đã đọc.

Source input: `_acceptance/tiep-thi-tuyen-doi-tac/uat-session.md` rủi ro 3 · sổ quyết định `d-20260907T125000Z-tran-trang`

## Criteria

- AC-1: Given trang danh bạ cho nhiều địa chỉ hơn trần `--limit`, When gieo, Then danh sách trả về trải khắp dải — có ít nhất một địa chỉ thuộc phần cuối dải, không phải toàn phần đầu.
- AC-2: Given số địa chỉ tìm được không vượt trần, When gieo, Then trả về đủ mọi địa chỉ, đúng thứ tự, không cắt và không rải.
- AC-3: Given một trần NHỎ HƠN số địa chỉ tìm được, When rải mẫu, Then trả về ĐÚNG số lượng bằng trần, và không địa chỉ nào lặp lại — kể cả khi một trang danh bạ liệt hai thẻ trỏ cùng một người. (Trần lớn hơn hoặc bằng số tìm được là nhánh của AC-2.)
- AC-4: Given cùng một dải đầu vào, When rải mẫu hai lần, Then hai lần cho cùng một kết quả — không có yếu tố ngẫu nhiên.
- AC-5: Given không khai trần, When gieo, Then trả về mọi địa chỉ tìm được.
- AC-6: Given đường gieo từ trang danh bạ, When gieo với một trần nhỏ hơn số địa chỉ có, Then bộ gieo vẫn đọc tới hết `directory_max_pages` chứ không dừng sớm vì đã đủ trần — chính cú dừng sớm đó làm mẫu dồn về đầu bảng.

## Coverage

- Trục nhánh: nhiều hơn trần (AC-1, AC-3, AC-4) | ít hơn hoặc bằng trần (AC-2) | không trần (AC-5) [thước CE: ba nhánh của một phép cắt]
- Trục tầng: hàm rải thuần (AC-3, AC-4) | vòng đọc trang (AC-1, AC-6) [thước CE: một hàm thuần và một vòng có tác dụng phụ]
- Bỏ coverage-scan — không gian là ba nhánh × hai tầng, đếm được bằng tay (entry d-gieo-descope-scan)

## Out of scope

- Đường gieo từ **sơ đồ site** giữ nguyên hành vi cắt-đầu. Sơ đồ của nhatot không liệt trang môi giới (đo 04/09) nên đường đó chết ở kho này; bỏ dừng-sớm ở đó là mở đường đọc cả sơ đồ không trần, một rủi ro chi phí mới không ai xin.
- Đổi `directory_max_pages` — số đó là việc người chỉnh, không phải việc vòng này.
- Rải mẫu có trọng số hay ngẫu nhiên có hạt giống — vòng này rải đều theo bước cố định, đủ để chạm cả hai đầu dải.
- Đổi ngưỡng 60/20/1.

## Notes

- Đổi lấy: mỗi lượt cào nay đọc tới hết trần trang thay vì dừng khi đủ, nên tốn thêm thời gian đọc danh bạ. Ở trần đang ship là 8 trang, lượt cào cũ dừng sau khoảng 2 trang, nên phần thêm là 6 lượt tải danh bạ. Trần nâng lên 30 thì phần thêm là 28 lượt.
- Hàm rải là hàm thuần, đặt ở mô-đun riêng để kiểm được ở mức đơn vị, theo đúng nếp một-việc-một-mô-đun của gói.
