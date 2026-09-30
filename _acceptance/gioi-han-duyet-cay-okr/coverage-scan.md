# Quét độ phủ — gioi-han-duyet-cay-okr (preset entity-feature)

## Ngữ cảnh

- Sản phẩm: OneHub Center, khu OKR — chân sản phẩm: đào kho [SUY-TỪ-REPO: CONTEXT.md, docs/api.md mục «The organization tree» và «OKR», apps/api/src/okr/okr-access.service.ts, apps/api/src/to-chuc/to-chuc.service.ts] · chân ngành: Perdoo «Make OKRs or KPIs private» (support.perdoo.com/en/articles/5040665), Microsoft Viva Goals «Approval workflows» (learn.microsoft.com/en-us/viva/goals/approval-workflows), Leapsome «FAQ Goals & OKRs» (pending approval, tự duyệt khi ngoài luồng), Tangible Growth «what happens if our team structure changes» (OKR của đội đã xoá còn lại, ô đơn vị trống).

## Trục

- **Trục A — luật:** mức hiển thị (công khai · giới hạn) · bước duyệt (tắt · bật) · cây đổi (lưu trữ đơn vị · xoá hẳn đơn vị · dời phòng ban sang bộ phận khác · trưởng đổi hay rời · người phụ trách rời · chuyển OKR sang đơn vị khác) [thước CE: dòng 8c mục 10 lộ trình; ba mã; NGÀNH: Perdoo, Viva Goals, Tangible Growth]
- **Trục B — đường chạm dữ liệu:** danh sách (theo đơn vị, của tôi, danh sách lọc) · đọc theo id (khung mục tiêu, diễn biến, việc cạnh KR, trao đổi, lịch sử số) · số gộp (toàn cảnh, họp tuần, sức khoẻ, đếm theo đơn vị, khối của tôi) · căn chỉnh (cây, đích chọn được) · nhắc (việc của tôi, nhắc buổi sáng Zalo/Slack) · ghi dựa trên mục tiêu (theo dõi, bình luận, ghi nhận, mang sang, ghi số bằng khoá API) · xuất kỳ, bảng chấm · trợ lý OKR (hàng đợi) · cửa vào (tRPC, cầu REST, khoá API) [thước CE: sổ router `okr.*` rút lúc chạy — báo cáo đọc mã 29/09 liệt kê 30 thủ tục đọc; ma trận bốn đường vào của `vai-chi-okr`]
- **Trục C — người:** quản trị · trưởng cấp trên (trưởng bộ phận của phòng ban) · trưởng đơn vị · người phụ trách mục tiêu · người phụ trách KR · người tham gia · người xem có tên · thành viên khác · vai «chỉ OKR» không liên quan [thước CE: `OkrAccessService.quyen`, «Trưởng đơn vị», «Người phụ trách (OKR)»]
- **Trục D — trạng thái:** mục tiêu nháp · chờ duyệt · công bố · bỏ × pha lập kế hoạch/đang chạy · chấm điểm/đã đóng [thước CE: `TRANG_THAI_MUC_TIEU`, `PHA_CHU_KY`, `assertKyGhiDuoc`]

Trục B có 9 giá trị — đã thử tách «cửa vào» ra trục riêng; giữ chung vì cửa vào nhân mọi giá trị còn lại (cross-cutting, xem dưới).

## Core

1. Hiển thị × đặt mức (người sửa được, pha ghi được) — đặt, đổi, người xem có tên, vết.
2. Hiển thị × mọi đường đọc × người không xem được — vắng hẳn, đọc theo id trả 404 như không tồn tại; đối chứng người xem được.
3. Hiển thị × số gộp — giới hạn không vào số gộp nào, ai cũng thấy cùng số [NGÀNH: Perdoo — «excluded from dashboards»].
4. Hiển thị × căn chỉnh — mục tiêu giới hạn không góp vào, không nhận góp [NGÀNH: Perdoo — «cannot be aligned»].
5. Hiển thị × ghi dựa trên mục tiêu × người không xem được — 404, không hàng.
6. Hiển thị × nhắc — người không xem được không nhận tên mục tiêu qua kênh nào.
7. Duyệt × bật × gửi, duyệt, trả lại, rút — ma trận người × thao tác; người duyệt suy từ cây [NGÀNH: Viva Goals — quản lý của chủ đội duyệt].
8. Duyệt × hai đường công bố (nút, nhập bảng tính) — không đường nào lách.
9. Duyệt × tắt — y như hôm nay (hồi quy) [NGÀNH: Leapsome — tự duyệt khi ngoài luồng].
10. Duyệt × nhắc — người duyệt thấy mục chờ mình; người gửi thấy lần bị trả lại.
11. Cây đổi × lưu trữ, xoá hẳn đơn vị còn OKR — từ chối có tên, không 500.
12. Cây đổi × chuyển OKR sang đơn vị khác — giữ KR, lịch sử, vết.
13. Cây đổi × dời, trưởng rời, người phụ trách rời — mồ côi hiện ra cho quản trị [NGÀNH: Tangible Growth — OKR của đội đã xoá còn lại với ô đơn vị trống, không ai thấy].

## Later

- Mức «trong đơn vị» (thành viên phòng ban thấy) — Perdoo chỉ có riêng/công khai; thêm khi có người hỏi.
- Căn chỉnh cho mục tiêu giới hạn — cần dòng giữ chỗ không tên trên cây.
- Nhiều tầng duyệt, người duyệt chọn tay, duyệt lại khi sửa sau công bố.
- Quản trị sửa OKR của đơn vị không trưởng.
- Cảnh báo ở hộp gỡ thành viên khi người đó còn phụ trách OKR.
- Gộp, tách đơn vị thành một thao tác của cây tổ chức.

## Never

- Mức hiển thị theo từng KR — KR sống trong mục tiêu, tách mức là hai luật đọc chồng nhau.
- Ẩn mục tiêu khỏi quản trị — quản trị phải thấy để sửa mồ côi và chạy chương trình [NGÀNH: Perdoo — «Admins can see all goals»].
- Xoá dây OKR khi xoá đơn vị — vết và điểm cuối kỳ là lịch sử, không bỏ.

## Cross-cutting áp mọi ô Core

- Ba cửa vào (tRPC, cầu REST, khoá API) đi qua cùng lớp dịch vụ — đo cả ba.
- Vết cho mọi ghi mới (`doi-hien-thi`, `gui-duyet`, `duyet`, `tra-lai`, `rut-duyet`, `chuyen-don-vi`).
- Pha: mọi ghi mới khoá theo `assertKyGhiDuoc`.
- Bộ OKR mẫu mang đủ ca: một mục tiêu giới hạn, một chờ duyệt, một phòng ban lưu trữ còn OKR quý 3 đã khép.
- Ba trạng thái màn và khổ 390.
