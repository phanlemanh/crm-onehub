---
schema_version: 1
slug: giam-phut-acceptance
feature: Workflow Acceptance thôi chạy lại bốn job nặng khi push lên onehub, huỷ lượt cũ khi PR đẩy chồng, và gộp ba job nhỏ thành một — giảm phút GitHub Actions mà không bỏ phép kiểm nào ở PR
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-09T16:19:10Z
prototype:
  base_commit: 5a36e1994
  disposition: không dựng bản thử — đo trên lượt chạy thật của kho
---

Gốc: phiên «GitHub Actions chi phí tối ưu» (09/10). Giám sát đợt `sau-14-10` ghi thành làn P8, hàng CI1
(`tra-loi/NGOAI-CI1-1.json`, 16:14:58Z).

## Vấn đề & ai gặp

Ngày 09/10 lúc khoảng 14:49Z, GitHub dừng mọi job vì vượt mức chi («recent account payments have failed or your spending
limit needs to be increased»), chặn mọi lượt gộp tới khi anh nạp tiền (Nhật ký đợt, 15:10Z). Kho là kho riêng tư, nên
GitHub tính tiền từng phút, và mỗi job bị làm tròn lên phút.

Số đo từ `gh run list` và `gh api …/jobs`, 29/09–09/10, mẫu 25 lượt mỗi workflow:

- Mỗi lần push lên PR tốn khoảng 45 phút tính tiền: CI khoảng 34 phút, Acceptance khoảng 12 phút (lệnh dựng 4,0 ·
  agent-okr Node 24 3,3 · acceptance gate 2,0 · luật kho 1,6 · điều phối 1,0).
- 10 ngày: CI 237 lượt, Acceptance 367 lượt, trong đó 130 lượt là push lên `onehub` chạy lại đủ năm job đã chạy ở PR.
- Tổng khoảng 11.000 phút mỗi 10 ngày, tức khoảng 33.000 phút mỗi tháng; hạn miễn phí của tài khoản là 2.000–3.000.

**Người gặp:** anh trả tiền; mọi phiên và mọi PR bị chặn gộp khi chạm mức chi.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Cây của `onehub` sau khi gộp giống cây đầu PR đã kiểm, vì giám sát chỉ gộp PR đã gộp `onehub` mới nhất | Lỗi do hai PR chồng nhau chỉ lộ ra ở PR kế tiếp | Đối chiếu tree sha của các commit gộp 7 ngày qua với tree sha đầu PR | Chưa thử |
| 2 | Gộp ba job nhỏ thành một không làm mất kết quả của bước sau khi bước trước đỏ | Một bước đỏ che bước khác | Phép đo hình workflow: bước sau mang `if: !cancelled()` | Chưa thử |
| 3 | Bỏ bốn job nặng khi push không làm đỏ hồ sơ đã ký nào đang đo `acceptance.yml` | Phải hạ thước của hồ sơ đã ký | Chạy lại script của sáu hồ sơ đó trên bản mới | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Acceptance có tiêu ít phút hơn rõ rệt mà PR vẫn chạy đủ mọi lệnh kiểm cũ không.
- Kết quả nào là SỐNG: Trong 7 ngày sau khi gộp: lượt Acceptance khi push lên `onehub` có trung vị ≤ 8 phút tính tiền (nay khoảng 12); lượt Acceptance của PR có trung vị ≤ 10 phút tính tiền (nay khoảng 12); mọi lệnh `run` của bản cũ vẫn chạy ở PR.
  [SUPERSEDED 2026-10-09 — anh chốt ở Cổng 1 lúc 16:33Z: giữ lệnh dựng khi push, ngưỡng push ≤ 8] Bản gốc ký ở Cổng Đáng: «lượt Acceptance khi push lên `onehub` có trung vị ≤ 4 phút tính tiền».
- Kết quả nào là CHẾT: Một lệnh kiểm cũ không còn chạy ở PR, hoặc `onehub` đỏ sau gộp vì lỗi mà chỉ lượt push cũ mới bắt được, hoặc lượt push lên `onehub` vẫn có trung vị > 8 phút.
- Timebox: Làm ngay trong đợt `sau-14-10` (làn P8, hàng CI1, gộp sau #342, #344 và E4); đo lần đầu 7 ngày sau ngày gộp.

## Hạng mục cùng lớp

F21 `ci-ma-tran-ba-o` (ma trận ba ô của `ci.yml`, tăng khoảng 30% phút CI — không chạm ở vòng này để giữ cửa sổ đo 7 ngày
của F22). Runner tự dựng trên Mac mini (ổ «CI SSD» đã sẵn sàng) — việc riêng, cần anh duyệt riêng và giám sát chọn giờ dời
ảnh đĩa Docker.

## Quyết định Cổng Đáng

2026-10-09T16:19:10Z, chủ kho: «build — duyệt thiết kế đã sửa, giữ bốn ngưỡng». Thiết kế đã sửa: chỉ `acceptance.yml` — concurrency theo PR; gộp acceptance gate, luật kho, điều phối thành job «acceptance gate» không `if`; `build` và `agent-okr-node24` chỉ chạy khi pull_request.
