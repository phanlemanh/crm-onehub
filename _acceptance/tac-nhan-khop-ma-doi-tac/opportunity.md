---
schema_version: 1
slug: tac-nhan-khop-ma-doi-tac
feature: Môi giới mà nền tảng gửi lên với mã chưa khớp ai được tác nhân tra ra và ghép vào kế hoạch, thay vì nằm im
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-21T10:17:16Z
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Hạt giống Ngoài-1 của hồ sơ `dieu-phoi-30-ngay-dau`. Tại Cổng Bằng chứng ngày
2026-09-21, chủ kho định đoạt mục này là «mở hợp đồng mới».

Điểm nhận dữ liệu từ nền tảng OneHub khớp môi giới với Cá nhân CHỈ bằng mã
nền tảng, đúng từng ký tự. Mã không khớp ai thì API không đoán: nó ghi một việc
cho tác nhân, loại `onboarding-identify`, và đếm mục đó vào số «chuyển cho tác
nhân». Đúng luật kho: trí khôn sống ở `apps/agent`, không ở API.

Đọc mã ngày 2026-09-21 cho thấy đường đó đứt ngay sau khi ghi:

- `onboarding-identify` KHÔNG có trong `TASK_KINDS` (`packages/db/src/agent-tasks.ts`),
  sổ đăng ký duy nhất của các loại việc.
- `apps/agent/agent/lib/dispatch.ts` không có nhánh cho nó, nên việc rơi vào
  nhánh mặc định và tác nhân chỉ nhận câu `Handle this: <lý do>`. Nó không được
  dặn tra Cá nhân theo trường mã nền tảng, và không có công cụ nào ghi ghi danh.
- Payload `{planId, platformBrokerId}` chưa có khuôn ở `packages/validation`, trái
  luật «phân tích ở biên» của kho.

**Người gặp:** nhân viên quan hệ đối tác. Màn hồ sơ kế hoạch thiếu đúng những
môi giới mà nền tảng đã báo có, và không có dấu nào cho biết họ đang treo ở
đâu. Hôm nay rủi ro còn bằng không, vì điểm nhận chưa có bên gửi. Nó thành rủi
ro thật vào đúng ngày nền tảng bắt đầu gửi.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Mã không khớp phần lớn là vì Cá nhân đã có trong CRM mà chưa điền trường mã nền tảng, chứ không phải vì người đó chưa có trong CRM | Tác nhân phải TẠO Cá nhân mới, không chỉ ghép — việc to hơn và đụng luật chống trùng | Khi có lô thật đầu tiên, đếm tay mười mã không khớp: bao nhiêu người đã có trong CRM | Chưa thử — chưa có bên gửi |
| 2 | Tác nhân tra được đủ chắc bằng tên, số điện thoại, công ty để ghép mà không cần người duyệt | Mỗi ca phải có người bấm xác nhận, và ô này thành một hàng đợi duyệt chứ không phải một bước tự động | Chạy tác nhân trên một mẫu mã đã biết đáp án, đếm ca ghép sai | Chưa thử |
| 3 | Nền tảng OneHub sẽ thật sự gửi lô trong vòng tới | Ô này xây cho một luồng không có nước | Hỏi đội nền tảng một câu: ngày gửi lô đầu tiên | Chưa thử |

Giả định 3 quyết thời điểm: không có bên gửi thì ô này nên xếp lại, không bác.

## Ngưỡng chết / ngưỡng UAT

Bốn dòng dưới **đã chốt tại Cổng Đáng ngày 2026-09-21** — máy đề xuất, chủ kho ký «build».

- Câu hỏi phép đo trả lời: Một môi giới mà nền tảng báo có, mang mã chưa khớp ai, có tới được kế hoạch của mình mà không cần người đi tìm không?
- Kết quả nào là SỐNG: Đủ ba điều — (a) việc `onboarding-identify` có nhánh riêng ở tác nhân và có khuôn payload ở `packages/validation`; (b) trên một mẫu mã đã biết đáp án, tác nhân ghép đúng hoặc để trống — không ca nào ghép nhầm sang người khác; (c) ca tác nhân không chắc hiện ra cho người thấy trên hồ sơ kế hoạch, không nằm im.
- Kết quả nào là CHẾT: Có dù một ca ghép nhầm môi giới vào Cá nhân khác. Ghép nhầm tệ hơn để trống: nó làm sai phễu của một đối tác mà không ai biết để sửa.
- Timebox: Nửa ngày cho giả định 3 (hỏi đội nền tảng) TRƯỚC khi viết dòng nào. Có ngày gửi thì một ngày công cho khuôn payload, nhánh tác nhân và phép đo trên mẫu đã biết đáp án.

## Kết quả prototype

Chưa dựng gì.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Nếp khuôn payload việc tác nhân | `fieldBackfillPayload` ở `packages/validation` | triết-lý/logic | có | — |
| Nhánh `identify` sẵn có của tác nhân | `apps/agent/agent/lib/dispatch.ts` | triết-lý/logic | có — tra Cá nhân đã có cách, chỉ chưa có trường mã nền tảng | — |
| Luật trí khôn sống ở tác nhân, API không đoán danh tính | `AGENTS.md`, `docs/api.md` | triết-lý/logic | có — bắt buộc | — |

## Cổng 0

- **decision = build** — chủ kho, 2026-09-21: «build cả hai». Ký dù giả định 3
  (ngày nền tảng gửi lô đầu tiên) chưa thử: nhánh tác nhân dựng trước, để ngày
  có bên gửi thì đường đã liền.
- **Ngưỡng UAT chốt cùng lúc ký:** nguyên văn bốn dòng ở mục ngưỡng phía trên.

## Out of scope từ khám phá

- Tạo Cá nhân mới từ lô nền tảng — chỉ vào nếu giả định 1 sai.
- Nối thật với nền tảng OneHub (bên gửi) — việc của đội nền tảng.
