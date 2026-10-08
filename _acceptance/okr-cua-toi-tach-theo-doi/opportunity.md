---
schema_version: 1
slug: okr-cua-toi-tach-theo-doi
feature: Tách «Đang theo dõi» khỏi tab «Của tôi» của OKR
owner: manh.phan@onemount.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-07T11:05:00Z
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Soạn bổ sung sau khi gộp (PR #300, b9e51ffa), theo luật 28 của đợt `sau-14-10`. Nguồn: yêu cầu của chủ kho ngày 07/10 và sổ quyết định của hồ sơ.

Tab «Của tôi» ở `/onehub/okr` của tài khoản `phanlemanh` hiện cả bộ OKR của người khác. `okr.mine` gom năm vai cùng lúc: phụ trách, mục tiêu cá nhân, tham gia, giữ KR, và theo dõi. Một mục tiêu người đó chỉ theo dõi vì vậy nằm lẫn trong danh sách chính, ngang hàng với việc của chính họ.

Chủ kho chọn phương án A ngày 07/10:

- Mục tiêu chỉ theo dõi ra khỏi danh sách chính và nằm trong nhóm gập «Đang theo dõi (n)», ngay dưới danh sách chính, trên nhóm «Đã bỏ». Nhóm này gập sẵn.
- Mục tiêu chỉ theo dõi mà đã bỏ thì ẩn.
- Mục tiêu vừa là của mình vừa đang theo dõi giữ ở danh sách chính, không hiện hai lần.

**Người gặp:** mọi người dùng OKR có theo dõi mục tiêu của đơn vị khác, nhất là trưởng phòng và người điều phối theo dõi nhiều đơn vị.

## Ngưỡng chết / ngưỡng UAT

Ngưỡng soạn sau khi gộp, anh duyệt 08/10 trong phiên giám sát.

- Câu hỏi phép đo trả lời: người mở «Của tôi» có còn thấy OKR không phải của mình lẫn trong danh sách chính không, và khi cần thì có tìm được mục mình đang theo dõi không?
- Kết quả nào là SỐNG:
  - ở lái-thử người-lạ, ≥ 4/5 người chỉ đúng đâu là mục tiêu của mình, đâu là mục đang theo dõi;
  - ≥ 4/5 người tự mở được nhóm «Đang theo dõi» khi được hỏi về một mục mình theo dõi;
  - 0 báo cáo «thấy OKR người khác trong Của tôi» trong 2 tuần sau khi giao.
- Kết quả nào là CHẾT:
  - lại có báo cáo thấy OKR người khác trong danh sách chính; hoặc
  - ≥ 2/5 người không tìm thấy mục mình theo dõi vì nhóm gập sẵn.
- Timebox: một vòng feature-loop T2 (đã giao 07/10). Đo trong 2 tuần sau khi giao.
