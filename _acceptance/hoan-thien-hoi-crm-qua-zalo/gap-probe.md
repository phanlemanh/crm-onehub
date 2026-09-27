---
slug: hoan-thien-hoi-crm-qua-zalo
at: 2026-09-26T15:52:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Ô công cụ ghi × `builder`/`team-agent` không có AC; đối chứng dương của AC-1/E1 chỉ chạy phiên web | Chặn viết thành «ném khi purpose khác research» — Zalo vẫn đúng, web vẫn đúng, E1 xanh, nhưng `set_chat_title` ở builder và mọi công cụ ở team-agent bị từ chối bằng câu Zalo | Đối chứng thành ma trận công cụ × mọi mục đích khác `zalo`, số assert = số tệp × 3, chiều đỏ ghim «không từ chối ở phiên builder» | fixed: AC-1 và E1 đối chứng cả `research`, `builder`, `team-agent` (60 ca), chiều đỏ ghim tên; Coverage thêm ô này |
| P1 | evals | E5 dựng tin không chữ bằng tay, không ghim `event_name` [tra-loi-tin-nhac#F1] | Sticker thật tới với `event_name` khác; nếu webhook lọc theo `event_name` thì sticker bị bỏ trước `khongMa` mà E5 vẫn xanh | Ma trận mỗi loại tin một phần tử với `event_name` và thân lấy từ tài liệu Zalo hay payload production, đi qua `nhanWebhook` thật | fixed: E5 dựng bốn tin từ `test/fixtures/zalo-tin-that.json` (tin thật production), đổi `event_name` sang `message.sticker.received`/`message.image.received` và trường `sticker`/`photo_url`/`caption`, chiều đỏ thêm bộ lọc `event_name`; Coverage ghi nguồn và `[GIẢ ĐỊNH]` cho tin tệp |
| P1 | design | Nhìn lùi cấm «chữ số + dấu phân cách» làm lọt số điện thoại đứng liền sau số khác; đối chứng chỉ là ma trận cũ | Bot trả «0912345678,0987654321» — số thứ hai lọt nguyên, thủng ranh giới A, mọi ma trận vẫn xanh | Ma trận viết trước số điện thoại đứng liền sau số khác (phẩy, cách, gạch, sau số tiền), mỗi phần tử bị che | fixed: đổi cách sửa — tách trước đoạn có dạng số tiền (1–9, nhóm ba cùng dấu chấm hay phẩy), không nới luật số điện thoại; AC-6/E6 thêm ma trận bốn phần tử và chiều đỏ ghim «0912345678,0987654321»; bỏ biến thể cách-trắng khỏi ma trận số tiền |
| P2 | evals | `record_fact` của E2 chỉ có khẳng định âm tính, không đối chứng dương | Đầu vào hay mệnh đề đếm sai cột, số hàng không bao giờ đổi, nửa `record_fact` xanh rỗng | Gọi `record_fact` cùng đầu vào ở phiên web, thấy số hàng tăng đúng 1 | fixed: AC-2/E2 đối chứng web cho cả hai công cụ; mệnh đề đếm rút từ lần ghi đối chứng |
| P2 | evals | Tập công cụ ghi rút bằng phép bù từ cấu hình, chỉ chặn «≥ 20» | Một công cụ ghi xếp nhầm sang `doc` và một công cụ mới cùng thêm — tổng vẫn ≥ 20, công cụ xếp nhầm chạy được trên Zalo | Tập rút từ thư mục `toEqual` danh sách viết trước 20 tên | fixed: AC-1/E1 ghim danh sách 20 tên; chiều đỏ chuyển `get_linkedin_profile` sang `doc` |
