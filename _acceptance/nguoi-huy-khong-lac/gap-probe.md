---
slug: nguoi-huy-khong-lac
at: 2026-10-07T06:30:00Z
verdict: findings
p0: 0
p1: 1
p2: 3
---

# Gap-probe — nguoi-huy-khong-lac

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E3 chỉ đo r1h_huy xanh; không gì đo chính ca nguoi-huy chờ choTreo thay vì ngủ 20 ms, E1 là describe chép riêng có thể trôi | Ca nguoi-huy giữ Bun.sleep(20); máy chậm thì huỷ tới trước fetch, fetch giả từ chối ngay, route trả 502 không hoàn → E1, E2, E3 cùng xanh mà thước E4 đã âm thầm đổi sang đo huỷ-trước-fetch | Ca nguoi-huy ghim { daGoi: 1, huySan: 0 } 'huy-truoc-fetch n=<n>'; chiều đỏ bản sao Bun.sleep(0) | fixed: hai describe đi qua một hàm dùng chung huyKhiDangTreo(n, tre); AC-3 và E3 thêm vế huỷ-trong-lúc-chờ cùng chiều đỏ Bun.sleep(0). Phần kiểm nguyên văn chữ của khẳng định — rejected: đo chuỗi có mặt thay quan hệ; chiều đỏ gỡ nhánh route đã ghim quan hệ n + 1 |
| P2 | evals | huySan đọc cùng lúc huỷ thì luôn 0, vế đó không cắn | Route gọi lại fetch với signal đã huỷ sau khi huỷ → soLanHuySan = 1 mà E1 vẫn xanh | Đọc huySan sau khi cửa trả lời | fixed: E1 đọc daGoi lúc huỷ, huySan sau trả lời |
| P2 | design | choTreo không có hạn — hồi quy làm cửa không tới fetch lại treo 5000 ms không tên | Mock bước trước fetch ném lỗi → choTreo chờ mãi | choTreo nhận hạn, quá hạn ném 'cho-treo-qua-han'; chiều đỏ trên bản sao | fixed: choTreo(HAN_KHONG_LAC_MS) ném 'cho-treo-qua-han'; chiều đỏ ghi ở Notes |
| P2 | evals | Chiều đỏ E2 chỉ ghim ô treo; bốn ô còn lại đỏ với thông điệp mặc định | Bỏ dòng kiểm thì bốn ô đỏ không tên, không phân biệt đỏ-đúng-chỗ với khung hỏng | Mỗi ô một thông điệp; chiều đỏ đòi đủ năm dòng | fixed: mỗi ô quy về { kieu, dungLyDo } ghim 'fetch-gia-da-huy <ket>'; chiều đỏ đòi năm dòng đỏ |
