# Hình tại điểm quyết định — loc-va-kieu-xem-chung

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — điều khiển lọc trạng thái (chip hay menu thả) | 2 nhánh rẽ | cần hình: «Hai lối lọc trạng thái của Thoả thuận» — khối mermaid trong design doc mục «Phương án» |
| Hỏi-2 — bảng trên điện thoại (để ngoài NM2 hay làm ngay) | 2 nhánh rẽ | cần hình: «Hai lối bảng trên điện thoại» — khối mermaid trong design doc mục «Phương án» |
| «Chia cột theo» dùng ViewSwitch (gap-probe P1, đã sửa) | 1 lối, căn cứ `docs/design.md` | dưới ngưỡng: máy quyết, không hỏi |

Bộ khuôn vẽ (`diagram-design`) không dùng ở phiên thợ này — hình ở dạng mermaid trong design doc, như hồ sơ NM4.

Đề bài «Hai lối lọc trạng thái»: hàng điều khiển Thoả thuận ở 1280 — lối A ba chip có số đếm; lối B nút menu thả, số đếm trong menu. Phục vụ AC-3.
Đề bài «Hai lối bảng trên điện thoại»: khổ 360 — lối A giữ hai cách (bảng cuộn ngang, thẻ dọc); lối B mọi DataTable thành thẻ dọc. Phục vụ Out of scope.
