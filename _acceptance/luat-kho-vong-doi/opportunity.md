---
schema_version: 1
slug: luat-kho-vong-doi
feature: Luật thứ bảy «vòng đời» của scripts/luat-kho — máy bắt bản ghi có hai cách cất song song, danh sách mặc định lẫn bản đã cất, và nút xoá trên bản ghi đã có lịch sử — chạy ở CI
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-07
prototype:
  base_commit:
  disposition:
---

Gốc: chuẩn `docs/vong-doi.md` (chủ kho duyệt 07/10/2026), mục «Đợt», lượt 2: «Thêm luật thứ bảy "vòng đời" vào
`scripts/luat-kho` và chạy thước đó ở CI». Hàng V2L của đợt `sau-14-10` (dãy P4, README mục 2).

## Vấn đề & ai gặp

Đợt rà 07/10 thấy 15 loại bản ghi dọn dữ liệu theo nhiều kiểu riêng. Ví dụ: giai đoạn thoả thuận ghi «Xoá» mà thật ra chỉ
cất, tác nhân xoá được cả khi đang chạy, mục tiêu OKR nhập sai không xoá được. Chuẩn vòng đời chốt một luật chung,
nhưng hiện chỉ người soát mới giữ được nó. Tính năng sau có thể thêm «kiểu thứ mười sáu» mà không ai thấy cho tới khi
người dùng gặp.

Đo trên `onehub` `532e3317` (08/10/2026):

| Điều chuẩn cấm | Đo bằng máy | Hiện trạng |
| --- | --- | --- |
| Hai cách cất song song (`archivedAt` cùng `deletedAt`) | đọc `packages/db/prisma/schema.prisma` | 1 mô hình: `AgentDefinition` |
| Danh sách mặc định lẫn bản đã cất | đọc lời gọi `findMany` của mô hình có `archivedAt` ở các app máy chủ | 11 mô hình có `archivedAt`; khoảng 85 lời gọi `findMany` trên chúng; chỉ 3 service dùng `archivedFilter` — phần lớn là tra cứu nội bộ cố ý lấy cả bản đã cất |
| Nút xoá trên bản ghi đã có lịch sử | «lịch sử» do từng loại bản ghi tự khai bằng một hàm kiểm ở máy chủ | chưa có cách đo chung |

**Người gặp:** người dùng CRM thấy chữ, nút và danh sách không nhất quán giữa các màn; người làm tính năng mới không có máy nhắc khi lệch chuẩn.

## Giả định chốt sinh tử

- Một luật tĩnh trên mã nguồn (cùng khuôn sáu luật hiện có: đọc cây, có nền theo tệp cho vi phạm cũ, tự gài ca phá thử) bắt được đủ phần của chuẩn mà máy đo được, mà không báo động giả đến mức người ta tắt nó.
- Phần chuẩn là phán xét của người (ba câu ở Cổng Phạm vi, «lịch sử» nghĩa là gì) KHÔNG đưa vào luật máy.
- Chạy thước trong `acceptance.yml` (CI riêng của công ty) không làm job đó vượt trần.

## Câu hỏi mở cho Cổng Phạm vi

- Điều (b) «danh sách mặc định lẫn bản đã cất»: đo ở đâu — mọi `findMany` của mô hình có `archivedAt`, chỉ thủ tục `list` của router tRPC, hay chỉ những `findMany` có phân trang?
- Điều (a) «nút xoá trên bản ghi đã có lịch sử»: máy có đo không, hay chỉ đo hình dạng tương đương (xoá vĩnh viễn ở máy chủ phải từ chối bản chưa lưu trữ)?
- Vi phạm có sẵn (`AgentDefinition`, các danh sách cũ) vào nền theo tệp như sáu luật kia, hay chờ E5/V2 dọn xong rồi mới bật luật?

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: `[đề xuất]` Luật thứ bảy chạy ở mỗi PR và bắt được một vi phạm vòng đời mới trước khi gộp, mà không chặn oan PR nào.
- Kết quả nào là SỐNG: `[đề xuất]` Trong 14 ngày sau khi gộp: luật chạy ở CI mọi PR vào `onehub`; 0 lần chặn oan (vi phạm báo ra mà người soát thấy là đúng chuẩn); mỗi ca phá thử của luật (gài một vi phạm mới vào bản gương) bị bắt ở mọi lượt.
- Kết quả nào là CHẾT: `[đề xuất]` Có PR phải tắt luật hay thêm vào nền một dòng đúng chuẩn chỉ để qua CI; hoặc luật làm bước CI chứa nó dài thêm quá 2 phút.
- Timebox: `[đề xuất]` làm trong đợt `sau-14-10` (dãy P4); đo lần đầu 14 ngày sau ngày gộp.

## Hạng mục cùng lớp

E3 `danh-sach-keo-chung`, E5 `tac-nhan-va`, V2 `vong-doi-mot-cach-cat` (cùng chuẩn vòng đời, phần sản phẩm). Sáu luật hiện có của `scripts/luat-kho` (khuôn để bắt chước).

## Quyết định Cổng Đáng

07/10/2026 13:13:50Z, chủ kho: «Ký build cả 16 hàng» (luật 16 của đợt), gồm V2L. Ngưỡng giữ `[đề xuất]` theo luật 27 tới khi anh duyệt Cổng Phạm vi. Các câu hỏi mở ở trên chuyển sang Cổng Phạm vi của vòng.
