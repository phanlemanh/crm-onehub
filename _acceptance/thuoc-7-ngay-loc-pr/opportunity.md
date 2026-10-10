---
schema_version: 1
slug: thuoc-7-ngay-loc-pr
feature: Thước đo 7 ngày của ci-ma-tran-ba-o đọc đúng các lượt CI của PR vào onehub trong cửa sổ 7 ngày, chạy được bằng đúng lệnh ghi trong hồ sơ, và báo lỗi thay vì đoán khi không đọc được trần của lượt cũ
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-09
prototype:
  base_commit:
  disposition:
---

Gốc: Cổng 2 của `ci-ma-tran-ba-o` (F21, PR #331 gộp 2026-10-09T05:42:52Z, `c2e98dda8`). Anh định đoạt Ngoài-1..4 là «mở
hợp đồng mới», cùng hai phát hiện mức thấp của AC-6 (sổ quyết định `d-20261009T045839Z-5`…`-11`). Hàng F22 của đợt
`sau-14-10` (dãy P4, ưu tiên 5.5, mốc 15/10).

## Vấn đề & ai gặp

Ngưỡng SỐNG/CHẾT của F21 (trung vị job dài nhất ≤ 15′ trên ≥ 10 lượt xanh, 0 lượt huỷ vì trần, trong 7 ngày sau gộp)
được đo bằng `_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs`. Thước đó hiện không đo được gì.

Đo trên `onehub` `59d207677`, 2026-10-09T09:30Z:

| Lỗi | Đo bằng | Hiện trạng |
| --- | --- | --- |
| Lọc theo tên branch, mà `ci.yml` chỉ chạy ở PR | `bun …/do-7-ngay.mjs --nhanh onehub` | «0 luot, 0 luot xanh … chua du mau», thoát 0 |
| Lệnh ghi trong hồ sơ dùng `node`, script gọi `Bun.YAML` | `node …/do-7-ngay.mjs --nhanh onehub` | chết ngay ở `Bun.YAML` |
| Không có cửa sổ thời gian | đọc mã | lấy tới 200 lượt bất kể tuổi |
| Không đọc được `ci.yml` của lượt cũ thì lặng lẽ dùng trần hiện tại | đọc mã | `catch { return tranHienTai }` |
| Gắn lượt với PR qua `pull_requests[]` của API lượt chạy | `gh api actions/runs?event=pull_request&created>=…` | 6 lượt `ci.yml` kể từ khi gộp #331: 2 có base `onehub`, 4 có mảng `pull_requests` rỗng |

Dòng cuối là số đo mới của S0: lọc theo base bằng mảng `pull_requests` của lượt chạy sẽ đánh rơi phần lớn lượt.

**Người gặp:** anh, ở ngày đo 7 ngày (khoảng 2026-10-16): không có con số để quyết F21 sống hay chết, mà thước vẫn
thoát 0 như đã đo xong.

## Giả định chốt sinh tử

- GitHub giữ đủ dữ liệu job (giờ bắt đầu, giờ xong, kết luận) của mọi lượt `ci.yml` trong 7 ngày để đọc lại.
- Gắn được mỗi lượt với một PR vào `onehub` bằng một nguồn đáng tin hơn mảng `pull_requests` của lượt chạy.
- Đọc được trần (`timeout-minutes`) đúng của từng lượt, hoặc nói rõ là không đọc được, đủ để phân «huỷ vì trần» với
  «huỷ vì lượt mới đè».

## Câu hỏi mở cho Cổng Phạm vi

- Nguồn gắn lượt với PR: danh sách PR có base `onehub` (khớp branch và `head_sha`), hay sự kiện của lượt chạy?
- Trần của lượt PR: lượt `pull_request` chạy `ci.yml` của ref gộp, không phải của `head_sha`. Đọc ở đâu cho đúng, và
  không đọc được thì loại lượt khỏi mẫu hay dừng cả phép đo?
- Cửa sổ 7 ngày đếm từ đâu: giờ gộp #331 cố định, hay 7 ngày lùi từ lúc chạy?

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Ngày đo của F21, thước in được con số trung vị và số lượt huỷ vì trần từ lượt CI
  thật của PR vào `onehub`.
- Kết quả nào là SỐNG: Chạy đúng lệnh ghi trong hồ sơ F21 vào ngày đo cho ≥ 10 lượt xanh trong cửa sổ, và mỗi
  lượt huỷ được xếp vào «vì trần» hay «không vì trần» có căn cứ, không đoán.
- Kết quả nào là CHẾT: Ngày đo mà thước vẫn in «chưa đủ mẫu» dù GitHub có ≥ 10 lượt xanh của PR vào `onehub`,
  hoặc thoát 0 khi đã phải đoán trần.
- Timebox: xong và gộp trước 2026-10-15 (mốc của hàng), để kịp ngày đo 7 ngày của F21.

## Hạng mục cùng lớp

F21 `ci-ma-tran-ba-o` (hồ sơ chủ của thước). F9 `kiem-cheo-sau-gop` và `ci-test-duoi-tran` cũng đọc lượt CI qua `gh`.

## Quyết định Cổng Đáng

2026-10-09, chủ kho trả lời «Đồng ý» cho báo cáo của P4 nêu F22 đang chờ anh ký Cổng Đáng. Ngưỡng bỏ tiền tố «đề
xuất» khi anh duyệt Cổng Phạm vi ngày 09/10 (luật 27 của đợt).
