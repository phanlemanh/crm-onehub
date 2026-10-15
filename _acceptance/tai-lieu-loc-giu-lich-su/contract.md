---
schema_version: 1
feature: "Ở màn Tài liệu, đổi bộ lọc rồi bấm lùi thì về bộ lọc trước, và thanh lọc không chớp thành khung chờ mỗi lần lọc"
slug: tai-lieu-loc-giu-lich-su
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: docs/superpowers/specs/2026-10-15-tai-lieu-loc-giu-lich-su-design.md
---

# Acceptance Contract: tai-lieu-loc-giu-lich-su

## Context

Hàng phát sinh từ Cổng Bằng chứng của `loc-va-kieu-xem-chung` (NM2, #418): chủ kho ký 15/10 với Ngoài-3 (bấm lùi rời
hẳn màn Tài liệu thay vì về bộ lọc trước) và Ngoài-4 (cả thanh lọc chớp thành khung chờ mỗi lần lọc) «mở hợp đồng
mới». Giám sát duyệt hàng (P4-9). Hạng T2: chỉ chạm `apps/app/app/(app)/[slug]/tai-lieu/**`.

Source input: quyết định Cổng Bằng chứng NM2 (`_acceptance/loc-va-kieu-xem-chung/decisions.jsonl`, dòng Ngoài-3,
Ngoài-4) · design doc của NM2 mục «Đặc tả UX › Luồng» (nút lùi đi qua từng lần đổi bộ lọc) · design doc của hàng này.

## Criteria

- AC-1: Given Tài liệu › Trang và › Chờ duyệt, When người dùng đổi loại trang, đơn vị, chủ trang, lưu trữ, nhóm đề
  xuất, bỏ lọc hay sang trang, Then mỗi lần đổi ghi một mục lịch sử mới (nuqs `history: "push"`), không ghi đè mục hiện
  tại.
- AC-2: Given danh sách Tài liệu › Trang (hay Chờ duyệt) đã có dữ liệu, When người dùng đổi một bộ lọc hay sang trang
  và truy vấn mới chưa về, Then khối lọc (chip loại, ô chọn đơn vị và chủ trang, nút lưu trữ, nút bỏ lọc) và phân trang
  không bị gỡ khỏi trang lần nào, phần tử vừa bấm vẫn giữ tiêu điểm, và danh sách cũ còn hiện với `aria-busy="true"` và
  một tín hiệu chờ người nhìn thấy được (vùng danh sách mờ đi, `data-dang-tai`); When truy vấn về, Then danh sách mới
  thay danh sách cũ, `aria-busy` bỏ và vùng danh sách hết mờ.
- AC-3: Given lần đầu mở Tài liệu › Trang hay › Chờ duyệt khi chưa có dữ liệu nào, When truy vấn đang chờ, Then vẫn hiện
  khung xương như hôm nay; When truy vấn lỗi, Then vẫn hiện khung lỗi có nút thử lại như hôm nay.
- AC-5: Given danh sách Tài liệu › Trang (hay Chờ duyệt) đã có dữ liệu, When người dùng đổi một bộ lọc và truy vấn
  mới lỗi, Then hiện khung lỗi có nút thử lại như lần đầu (không treo danh sách cũ, không khung xương), `aria-busy` không
  còn "true", và bấm thử lại gọi truy vấn lần nữa.
- AC-4: Given bản dựng thật của cây chạy trong phiên đo, có ít nhất ba trang tài liệu khác loại và hai đơn vị mỗi đơn
  vị có trang, When người dùng đổi
  loại, rồi đổi đơn vị, rồi bấm lùi của trình duyệt hai lần, Then sau lần lùi thứ nhất đường dẫn và chip về đúng trạng
  thái sau lần đổi loại, sau lần lùi thứ hai về trạng thái ban đầu, và trang vẫn ở Tài liệu; And khi truy vấn danh sách
  bị trì hoãn (bàn đo chặn được ít nhất một lượt gọi), khối lọc không biến mất lần nào, tiêu điểm còn trên chip vừa
  bấm, và vùng danh sách mờ đi trong lúc chờ rồi hết mờ khi xong.

## Coverage

Quét theo khuôn test-matrix của `morphological-scan` (bài toán nhỏ, hai lỗi đã gọi tên ở Cổng Bằng chứng NM2).

- Trục màn: Tài liệu › Trang | Tài liệu › Chờ duyệt [thước CE: hai chỗ gọi `useLocTaiLieu` có truy vấn danh sách
  theo `git grep` trên 2bfcef2f8]
- Trục thao tác: đổi loại | đơn vị | chủ trang | lưu trữ | nhóm đề xuất | bỏ lọc | sang trang [thước CE: bảy hành động
  của E5 NM2]
- Trục trạng thái truy vấn: lần đầu chưa có dữ liệu | đổi lọc khi đã có dữ liệu | lỗi [thước CE: ba nhánh `!data`,
  `isError`, có dữ liệu của hai màn]
- Core: thao tác × lịch sử (AC-1); đổi lọc khi đã có dữ liệu × hai màn (AC-2); lần đầu và lỗi × hai màn (AC-3); đổi
  lọc mà lỗi × hai màn (AC-5); lùi thật trên trình duyệt (AC-4).
- Later: lịch sử khi đổi bộ lọc ở các màn `DataTable` khác.

## Out of scope

- Lịch sử khi đổi bộ lọc ở Thoả thuận, Liên hệ, Công ty, Onboarding và các màn `DataTable` khác — giữ nếp hôm nay (chỉ
  sang trang ghi lịch sử).
- Các Known limits của NM2 (Ngoài-1, 2, 5–9) — không thuộc câu giao.

## Đường đo

- bỏ đường-đo — hàng phát sinh từ Cổng Bằng chứng, không có ô cơ hội và ngưỡng; xem sổ quyết định.

## Notes

- Nhánh chồng lên `feat/loc-va-kieu-xem-chung` (#418); gộp sau #418.
