---
slug: loc-va-kieu-xem-chung
at: 2026-10-14T17:03:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Không eval nào đo được chuyện bấm lọc ở Tài liệu thì danh sách đổi ngay trên trang. E5 chỉ đọc đường dẫn mà bộ thử nuqs ghi lại, E6 dựng màn từ đường dẫn, còn bước 2 của E7 mở trang mới. | Thợ ghi đường dẫn bằng nuqs nhưng truy vấn danh sách vẫn đọc giá trị máy chủ đưa xuống. Bấm chip thì đường dẫn đổi mà danh sách đứng yên, trong khi E5, E6, E7 đều xanh. | AC-5 thêm vế danh sách hiện hàng của bộ lọc mới ngay trên trang; E5 kiểm truy vấn được gọi lại với đầu vào mới và hàng hiện là hàng mới; E7 thêm bước bấm chip trên cùng trang; mỗi chỗ có chiều đỏ ghim riêng | fixed: AC-5 thêm vế; E5 kiểm truy vấn gọi lại trên cùng lần dựng và tên hàng đổi, chiều đỏ «lkx-tai-lieu: chon loai khong doi danh sach tren trang»; E7 bước 1b đếm điều hướng không tăng, chiều đỏ (4); design phương án 4 đổi sang truy vấn đọc khoá từ nuqs |
| P1 | design · contract · evals | Design ghi khoá Tài liệu là `chu` và `nhom`, còn hợp đồng và evals ghi `chuTrang` và `nhomDeXuat`. | Khoá sai thì E6 đỏ trên một bản làm đúng, hoặc thợ đổi tên khoá làm đường dẫn cũ mất bộ lọc mà không eval nào bắt. | Chốt theo `SEARCH_PARAM.taiLieu` trên c1864a3a2; E6 thêm ô đường dẫn chép tay | fixed: khoá thật là `chuTrang`, `nhomDeXuat` (`apps/app/lib/search-param-keys.ts`); design sửa; E6 thêm hai ô Tài liệu chép tay đúng khoá hôm nay, không qua serializer mới |
| P1 | evals | «Không còn page» sau khi đổi lọc không có đối chứng dương; E6 dựng Thoả thuận bằng `view=table`, vốn là mặc định. | Thợ quên đưa trang về 1 hay quên đọc `view` từ đường dẫn mà E3, E5, E6 vẫn xanh. | Dựng từ `?page=2` và khẳng định trước khi bấm; thêm ô `?view=board` | fixed: E3, E5 dựng từ `?page=2` và khẳng định trước khi bấm, E3 thêm chiều đỏ «không về trang 1»; E6 thêm ô Thoả thuận bảng cột `?view=board` với chiều đỏ «mất bảng cột» |
| P1 | evals | E7 ở khổ 360 không mở khối lọc gập của Thoả thuận; câu (3) của E7j bắt cả vùng cuộn ngang đã khai. | Chip của Thoả thuận không có trên ảnh 360 nên E7 đỏ trên bản đúng; hội đồng đánh FAIL vì bảng cuộn ngang đã descope. | Bước mở khối lọc; câu hỏi loại trừ hai vùng cuộn đã khai | fixed: E7 bước 1 bấm «Bộ lọc» ở Thoả thuận 360 trước khi chụp; đo cuộn ngang trên phần tử cuộn của trang; E7j câu (3) và AC-7 nêu tên hai vùng cuộn đã khai |
| P1 | design · contract | Dòng sổ d-…-3 gộp hai lựa chọn; «Cách chia giữ ToggleGroup» không có căn cứ, trong khi `docs/design.md` kể «theo đơn vị» là một kiểu xem. | Onboarding còn một nhóm chip tự ghép năm lựa chọn ở điện thoại mà không eval nào thấy. | Tách dòng sổ; nếu dùng ViewSwitch thì AC-4, E4 thêm ô | fixed: dòng d-20261014T170520Z-11 thay d-…-3 (căn cứ `docs/design.md`): «Chia cột theo» dùng ViewSwitch; AC-4 thêm khoá `cachChia`; E4 thành 3 công tắc × 2 dạng = 6 ô |
