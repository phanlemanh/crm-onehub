---
schema_version: 1
slug: soan-okr-khong-lac
feature: "Trang soạn OKR không lạc: không nhảy tab khi mở bản ghi bên cạnh, hoàn tác nhóm lỗi thì báo, lần nộp bị từ chối không thành mốc"
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-08T01:24:38Z
prototype:
  base_commit: 57dd87bf1
  disposition: archive
---

## Vấn đề & ai gặp

Trưởng phòng soạn OKR cùng Kara trên trang riêng (K2, #312). Phản biện của S4 ở K2 tìm ra ba lỗi; anh chọn
«mở hợp đồng mới» cho cả ba ở Cổng 2 của K2. Nguồn: Ngoài-3, 4, 5 của `soan-okr-trang-rieng`, Cổng 2 lúc
2026-10-08T01:24:38Z (luật 26 của đợt `sau-14-10`).

- Ngoài-3: ở khổ hẹp, mở hay đóng một bản ghi bên cạnh làm trang soạn nhảy từ tab Bản nháp về Trò chuyện, và tab
  của ngăn bản ghi có thể hiện sai. Trang soạn dùng khoá URL `tab` và `loc`, trùng khoá của ngăn bản ghi và màn tổ
  chức.
- Ngoài-4: bấm Hoàn tác trên biên nhận cả nhóm mà máy chủ từ chối hay mất mạng thì màn không đổi, không báo gì —
  lỗi được ghi vào dòng Mục tiêu đang ẩn trong biên nhận.
- Ngoài-5: lần Kara nộp bản nháp bị từ chối vẫn hiện thành mốc như đã nộp, và lần nộp sau bị so với một bản chưa
  từng lưu.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Kết quả công cụ nộp có `ketQua: "da-ghi" \| "tu-choi"` đọc được ở app | Không phân biệt được lần nộp bị từ chối | Đọc `apps/agent-okr/agent/lib/nop-ban-nhap.ts` (phía agent); phía app đo bằng E10 trên đường thật agent → lưu → tải | Phía agent: có (08/10). Phía app: chờ E10 |
| 2 | Đổi tên khoá URL không làm hỏng link đã chia sẻ | Link cũ có `tab=`/`loc=` mở sai | Hai khoá chỉ giữ trạng thái tạm của màn | Chấp nhận |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] trưởng phòng soạn OKR có còn bị lạc chỗ (nhảy tab, tưởng đã hoàn tác, tưởng Kara đã nộp) không.
- Kết quả nào là SỐNG: [đề xuất] ở lái-thử người-lạ trước R1, kịch bản chủ động gây đủ ba điều kiện (mở/đóng bản ghi ở 390 px, tắt mạng trước khi hoàn tác nhóm, một cuộc mà lần nộp kế bị từ chối); 0 lần vấp «nhảy tab», «tưởng đã hoàn tác» hay «mốc không có thật». Loại nào không gây được điều kiện thì không tính.
- Kết quả nào là CHẾT: [đề xuất] ≥ 1 lần vấp cùng loại ở cả hai người thử. Một người vấp một lần là vùng giữa — iterate.
- Timebox: [đề xuất] lái-thử người-lạ kế tiếp của dãy Kara OKR.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Không có | — | — | — | — |

## Cổng 0

- **decision = build.** Căn cứ: luật 26 — Ngoài-3/4/5 của `soan-okr-trang-rieng`, Cổng 2 2026-10-08T01:24:38Z.
- **disposition = archive.** Căn cứ: không có prototype.
- **Ngưỡng UAT chốt cùng lúc ký:** [đề xuất] như mục Ngưỡng — chờ anh duyệt ở Cổng 1 (luật 27).

## Thước đo thành công → ứng viên criterion

- Không nhảy tab → AC-1, AC-2.
- Hoàn tác nhóm lỗi có báo → AC-3, AC-4.
- Lần nộp bị từ chối không thành mốc → AC-5, AC-6, AC-7.

## Out of scope từ khám phá

- Ngoài-1, 2, 6, 7 của K2 — anh đã chọn «ghi Known limits».
- Giữ tương thích cho link cũ mang `tab=`/`loc=` của trang soạn — hai khoá chỉ là trạng thái tạm của màn.
