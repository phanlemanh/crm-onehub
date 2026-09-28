---
schema_version: 1
slug: tro-ly-okr-de-xuat
feature: Góp ý khi bấm — người sửa một Mục tiêu hay KR bấm «Nhờ Trợ lý OKR góp ý», nhận vài đề xuất (câu cũ cạnh câu mới, câu hỏi chất lượng, chỗ Căn chỉnh) rồi nhận, sửa hay bác từng dòng; quản trị bật theo ba nấc tắt · chạy bóng · bật
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit: a62adb166
  disposition: archive
---

## Vấn đề & ai gặp

Lượt 9a (#182, lên `onehub` 28/09) dựng nền: sổ chi phí AI, trần tháng khu OKR, trợ lý
chạy cách ly chỉ đọc OKR, cấu hình bật theo việc × đơn vị. Nhưng **chưa ai dùng được**:
không màn nào có nút gọi trợ lý, và đề xuất trợ lý viết ra (bảng Đề xuất) không hiện ở đâu.
Lái thử 28/09 xác nhận trợ lý chạy trọn một lượt thật (18/18 cổng, 2 đề xuất,
0,0165 US$) chỉ khi phép đo gọi nó.

Ai gặp: người sửa được một Mục tiêu (chủ Mục tiêu, quản lý đơn vị) và người phụ trách KR,
trong mùa đặt OKR năm của cấp OneHub rồi mùa quý 1 của mọi phòng ban
(`docs/plan/lo-trinh-tro-ly-okr.md` mục 5 «9b», mục 8). Nếu 9b chưa xong trước mùa OKR năm,
cấp OneHub đặt OKR năm không có trợ lý (mục 7 cùng tệp).

Hai lỗi thật tách từ Cổng Bằng chứng 9a sẽ chặn 9b ngay lần bấm đầu, nên vào phạm vi lượt này:

- việc của trợ lý bị đóng «hong:het-lease» giữa chừng khi phiên con chạy quá ~30 giây —
  giữ chỗ 30 giây chỉ được gia hạn bởi phiên cha, mà phiên cha im khi phiên con chạy; đề
  xuất đang soạn bị mất (Ngoài-7/Ngoài-32 của 9a);
- kết quả kiểm «chưa có khoá mô hình» cũ chặn mọi việc Trợ lý OKR cho tới khi quản trị tắt
  rồi bật lại, dù khoá đã cắm (Ngoài-8/Ngoài-33 của 9a).

Theo chốt 28/09 (PR #183, «dựng hết bằng dữ liệu mẫu»): lượt này dựng và đo trên bộ OKR mẫu
(hạng mục M `bo-okr-mau`); dữ liệu thật (N1 ≥ 12 ca từ OKR quý 4) là điều kiện BẬT, không
phải điều kiện dựng. Thiết kế tới hết Cổng 1.5 rồi chờ M gộp mới viết mã.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Người đặt OKR muốn góp ý KHI BẤM, trên đúng Mục tiêu/KR đang sửa — không cần trợ lý tự chạy | Không ai bấm; tính năng chết im | Đếm lượt bấm trên số người sửa Mục tiêu trong 2 tuần bật ở cấp OneHub | Chưa thử |
| 2 | Chỉ đọc OKR (không dữ liệu đối tác) vẫn đủ để đề xuất có ích | Đề xuất chung chung, bị bác hàng loạt | Chạy bóng trên bộ OKR mẫu + judge chấm; rồi N1 ≥ 12 ca thật | Chưa thử |
| 3 | Chi phí góp ý của cả mùa nằm trong trần $9/tháng khu OKR | Mùa đặt OKR chạm trần, trợ lý tạm nghỉ đúng lúc cần nhất | Dự báo từ sổ chi phí trong tuần chạy bóng × số Mục tiêu dự kiến | Chưa thử |
| 4 | Nấc «chạy bóng» (sinh đề xuất, không hiện cho người) đủ để đo chất lượng trước khi bật | Bật mù, lỗi chất lượng lộ thẳng ra người dùng | Chạy bóng ≥ 1 tuần, đọc tỷ lệ câu bị bộ kiểm bỏ | Chưa thử |
| 5 | Độ trễ đủ nhanh để người chờ trong hộp thoại (p50 ≤ 8 s) | Người đóng hộp thoại trước khi có đề xuất | Đo trên phiên thật khi lái thử | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] Người sửa Mục tiêu/KR ở cấp OneHub có dùng đề xuất của Trợ lý OKR để viết OKR năm sắc hơn không, với độ trễ chấp nhận được và chi phí trong trần?
- Kết quả nào là SỐNG: [đề xuất] Trong 2 tuần bật ở cấp OneHub: tỷ lệ đề xuất được nhận (nguyên văn hoặc sửa rồi nhận) ≥ 30%; hoàn tác ≤ 10% số đã nhận; độ trễ p50 ≤ 8 s, p90 ≤ 15 s; 0 dòng có số mới lọt qua bộ kiểm; chi phí mỗi đề xuất được nhận ≤ 0,05 US$ và tháng ≤ 9 US$.
- Kết quả nào là CHẾT: [đề xuất] Sau ≥ 30 đề xuất đã hiện: tỷ lệ nhận < 10%, hoặc hoàn tác > 30% số đã nhận, hoặc có dòng số mới lọt qua bộ kiểm, hoặc khu OKR chạm trần tháng trước ngày 20.
- Timebox: [đề xuất] Dựng xong trước mùa OKR năm của cấp OneHub; đo tại phiên nghiệm thu sau 2 tuần bật ở cấp OneHub; bật cho mọi phòng ban trước mùa quý 1 chỉ khi đạt ngưỡng sống.

## Kết quả prototype

Không dựng prototype riêng. Nền 9a đã chạy thật (lái thử 28/09, ảnh ở
`_acceptance/tro-ly-okr-nen/evidence/lai-thu/`); bản mẫu bấm được của hộp thoại góp ý sẽ
dựng ở S1-D (design-pass) trước Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Nghiên cứu Tability và đối thủ OKR (cách góp ý, câu hỏi chất lượng) | `docs/reports/2026-09-26-tro-ly-okr/01–05` | triết-lý/logic | có | |
| Kiến trúc và lộ trình Trợ lý OKR (mã AI-01…AI-05, DO-06) | `docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md`, `docs/plan/lo-trinh-tro-ly-okr.md` | triết-lý/logic | có | |
| Giao diện góp ý của Tability/đối thủ | như trên | ngôn-ngữ-thiết-kế/hình-thái | không — dựng bằng `packages/ui` | |

## Cổng 0

- **decision = …** Căn cứ: …
- **disposition = archive** Căn cứ: không có code prototype; nền là mã 9a đã gộp.
- **Ngưỡng UAT chốt cùng lúc ký:** …

## Thước đo thành công → ứng viên criterion

- Tỷ lệ nhận · sửa · bác · hoàn tác theo đề xuất → AC ghi quyết định của người trên từng đề xuất và màn quản trị đọc được tỷ lệ.
- Chi phí mỗi đề xuất được nhận → AC nối sổ chi phí AI với đề xuất được nhận.
- Độ trễ p50/p90 → AC ghi thời điểm bấm và thời điểm đề xuất hiện.
- 0 số mới lọt bộ kiểm → AC bộ kiểm số chạy trước khi đề xuất hiện, eval có chiều đỏ.
- Chạy bóng không hiện gì cho người → AC nấc ba trạng thái.

## Out of scope từ khám phá

- Tóm tắt tuần cho phòng ban — lượt 9c.
- Hỏi đáp OKR trong chat, Slack, Zalo — lượt 10.
- Trợ lý tự chạy mà không ai bấm (góp ý chủ động) — bác: người chưa tin trợ lý thì đề xuất tự đến là nhiễu; giữ «khi bấm» cho mùa đầu.
- Trợ lý ghi thẳng vào OKR không qua người nhận — bác: luật 9a «không tự ghi vào OKR».
- Đọc dữ liệu đối tác để góp ý — bác: vai «chỉ OKR» và luật cách ly của 9a.
