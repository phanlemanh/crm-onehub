---
schema_version: 1
slug: ci-ma-tran-ba-o
feature: CI của kho chạy test thành ma trận ba ô song song trên ba máy, và ci.yml thôi là tệp «không bao giờ sửa» của hãng — OneHub tự giữ
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-09
prototype:
  base_commit: 341a9d6c1
  disposition: nhánh thử `thu/ci-tach-job`, PR nháp phanlemanh/crm-onehub#323 — dùng làm nền, đóng khi hàng này gộp
---

Gốc: hàng F20 `ci-tach-job-de-xuat-hang` đo và thử cách tách bước test thành nhiều job để gửi hãng. Ngày 09/10 anh
quyết không gửi hãng (luật 47 của đợt `sau-14-10`).

## Vấn đề & ai gặp

Job CI `check-types, lint, test` chạy mọi bước tuần tự trên một máy 2 nhân: đêm 07–08/10, 52 job xanh có trung vị 26,9′,
p90 29,2′, 2 lượt bị huỷ ở trần 30′ (`docs/plan/ci-tach-job.md`, nhánh `docs/ci-tach-job-de-xuat-hang`). Trần của hãng là
20′ nên kho đã vá riêng lên 30′, và CLAUDE.md cấm mọi sửa khác vào `ci.yml` («không bao giờ vào `ci.yml` của hãng»).

Hai lượt thử ma trận ba ô trên nhánh nháp (#323): cả lượt 10,1′ và 11,2′, job dài nhất 9,8′ và 11,0′.

**Người gặp:** mọi phiên và mọi PR vào `onehub` — chờ CI ~27′, thỉnh thoảng phải chạy lại vì huỷ ở trần; người điều
phối xếp lượt gộp theo thời gian CI.

## Giả định chốt sinh tử

- Ba ô (`api` · `app` + `@crm/ui` · phần còn lại bằng bộ lọc loại trừ) phủ đủ mọi gói có test, kể cả gói thêm sau này.
- Mỗi ô một máy, cơ sở dữ liệu riêng (`test-run.ts`), nên ba ô không giẫm nhau.
- Kéo bản mới của hãng về `release` rồi gộp sang `onehub` giữ được bản `ci.yml` của OneHub mà không mất sửa đổi đáng giữ
  của hãng.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: CI của mọi PR vào `onehub` xong nhanh hơn rõ rệt mà không bỏ sót gói nào và không huỷ vì trần.
- Kết quả nào là SỐNG: Trong 7 ngày sau khi gộp: job dài nhất của lượt xanh có trung vị ≤ 15′ (trên ≥ 10 lượt); 0 lượt huỷ vì trần; mọi gói có test chạy ở đúng một ô.
- Kết quả nào là CHẾT: Có lượt huỷ vì trần, hoặc một gói có test không chạy ở ô nào, hoặc job dài nhất có trung vị > 20′.
- Timebox: làm ngay trong đợt `sau-14-10` (dãy P4, ưu tiên 1); đo lần đầu 7 ngày sau ngày gộp.

## Hạng mục cùng lớp

F20 `ci-tach-job-de-xuat-hang` (dừng; tài liệu đo giữ làm bằng chứng). F16 (đã đóng — song song trong một máy không ổn định).

## Quyết định Cổng Đáng

09/10/2026 00:35Z, chủ kho: «OneHub Center chủ động giải quyết để đảm bảo tự chủ, không liên quan trycompai» — `build`
(luật 47 của đợt `sau-14-10`). Không gửi gì lên trycompai.
