---
slug: don-okr-nhap-sai
at: 2026-10-06T23:20:00Z
verdict: findings
p0: 0
p1: 5
p2: 0
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E12 hứa mười ảnh nhưng bước chỉ chụp chín | Mã đúng ra chín ảnh, người chấm đọc «Mười ảnh» rồi chấm FAIL hoặc UNCERTAIN | Danh sách tên ảnh viết trước, so tập | fixed: thêm bước «Của tôi» ảnh E12-cua-toi; expected liệt mười tên và đòi so tập, in tên thiếu hay thừa |
| P1 | contract | Khoá hàng khi cập nhật tuần chen giữa chỉ trỏ design doc, không AC, không eval | Bỏ FOR UPDATE ở KR thì xoá cascade mất dòng cập nhật vừa ghi; mọi eval tuần tự vẫn xanh | Giao dịch thô giữ khoá KR, xoá phải chờ rồi trả 400 | fixed: AC-2 thêm vế chen giữa; E19 dong-thoi đọc pg_stat_activity, chiều đỏ bỏ khoá; design doc mục «Khoá khi cập nhật tuần chen giữa» |
| P1 | design | AC-15 và E18 đòi câu «phải gửi duyệt lại» mà thiết kế không chốt, và câu đó sai khi đơn vị tắt bước duyệt | Làm đúng thiết kế thì E18 FAIL; thêm câu cho qua thì đơn vị không duyệt thấy hướng dẫn sai | Chốt câu toast hai nhánh, E11 so nguyên văn | fixed: dungLaiMucTieu trả canGuiDuyet; design doc chốt hai câu; AC-15 và E18 trỏ câu chốt; E11 so cả hai nhánh |
| P1 | evals | E18 hỏi những điều không có trong inputs (nhãn ở tien-do-kr.tsx, khối ở khoi-muc-tieu.tsx, ảnh sau dùng lại) | Hội đồng chỉ đọc inputs nên chấm UNCERTAIN hoặc suy PASS mù | Mỗi vế trỏ ít nhất một tệp trong inputs | fixed: thêm tien-do-kr.tsx, khoi-muc-tieu.tsx, E12-sau-dung-lai.png, E12-cua-toi.png; câu hỏi gọi tên tệp từng vế (quyen.xoa tính trong okr.service.ts, đã có trong inputs) |
| P1 | evals | AC-8 gắn cross-layer mà chỉ có test DOM giả; AC-9 đi qua okr.mine mà không gắn cross-layer, không eval trên hệ thật | «Của tôi» thật làm rơi daBo khi truyền xuống; E9 vẫn xanh với dữ liệu giả, Cổng 2 ký sai | Bước «Của tôi» trên hệ thật, số trên màn so DB | fixed: AC-9 gắn cross-layer; E20 (AC-8) và E21 (AC-9) là script backend-effect cùng lần chạy E12, so số dòng gập với DB, có chiều đỏ |
