---
schema_version: 1
slug: menu-con-loc-dien-thoai
feature: «Menu con của bộ lọc mở được trên điện thoại — không còn nằm ngoài màn ở khổ 375»
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-08T00:51:04Z
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Tách từ E7 `datatable-loc-ro` (mục OOS-6 của hợp đồng, yêu cầu P3-5, luật 24 của đợt sau-14-10). Đo màn thật
07/10 ở khổ 375: bấm một tiêu chí trong menu «Lọc» của danh sách thoả thuận thì menu con (`DropdownMenuSubContent`
trong `FacetSubmenu` của `DataTable`) đặt ở x=359, rộng 208, trong khung rộng 375 — nằm ngoài màn, không chọn
được lựa chọn nào. Có từ trước E7 (onehub 0426cc9d0). Radix đặt menu con cố định bên phải menu cha; khi cả hai
phía đều thiếu chỗ nó giữ phía phải và tràn ra ngoài.

**Người gặp:** mọi người dùng CRM trên điện thoại lọc danh sách thoả thuận, cá nhân, công ty, thành viên — và
bất cứ menu nào dùng menu con của `packages/ui` (thao tác hàng loạt).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: trên điện thoại, người dùng có tự mở một tiêu chí lọc và chọn được một lựa chọn không?
- Kết quả nào là SỐNG: ở lái-thử người-lạ trên điện thoại, 5/5 người mở được một tiêu chí và chọn một lựa chọn mà không cần xoay ngang hay phóng to; menu con nằm trọn trong màn ở 375 và 1440.
- Kết quả nào là CHẾT: còn bất kỳ người nào không chạm được lựa chọn vì menu con tràn khỏi màn.
- Timebox: một vòng feature-loop T2 trong đợt sau-14-10; không vượt sang E3.
