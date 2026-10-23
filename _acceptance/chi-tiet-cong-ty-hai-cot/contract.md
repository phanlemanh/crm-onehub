---
schema_version: 1
feature: "Phiếu Công ty: chi tiết hai cột như Liên hệ, ô Tệp đủ rộng, vùng kéo thả xuống dòng khi hẹp"
slug: chi-tiet-cong-ty-hai-cot
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-23-chi-tiet-cong-ty-hai-cot-design.md
---

# Acceptance Contract: chi-tiet-cong-ty-hai-cot

## Context

Rà soát 23/10 mọi màn có đính kèm tệp: chỉ phiếu Công ty hẹp — tab Tổng quan xếp toàn bộ mục Chi tiết vào cột phải
320px, ô Tệp còn khoảng 152px ở màn 1440, chữ vùng kéo thả xuống mỗi dòng một chữ. Phiếu Liên hệ và Thoả thuận đã trải
Chi tiết hai cột, ô Tệp chiếm trọn hàng (~810px). Vòng này đưa phiếu Công ty về cùng khung, và sửa vùng kéo thả dùng chung
để phần chữ rơi xuống dưới nút khi hẹp (gặp ở cả ba phiếu trên điện thoại). Hạng T2: chạm `apps/app` và `packages/ui`,
không chạm API, cơ sở dữ liệu hay đường T3.

Source input: prompt (rà soát trong phiên 23/10, chủ kho bấm «Mở vòng») · design doc.

## Criteria

- AC-1: Given một công ty có mô tả và một trường Tệp đang có một tệp, When mở ngăn công ty ở tab Tổng quan ở khổ 1440
  và ở khổ 768, Then mục Giới thiệu đứng trên mục Chi tiết, mục Chi tiết rộng bằng bề ngang nội dung ngăn (không còn cột
  bên phải hẹp), và các trường của mục Chi tiết xếp hai cột.
- AC-2: Given công ty ấy, When nhìn ô Tệp ở khổ 1440, Then ô Tệp chiếm trọn một hàng của mục Chi tiết (vùng giá trị rộng
  ít nhất 600px), tên tệp 60 ký tự hiện đủ chữ không cắt «…», nút Mở và Xoá cùng hàng với tên tệp, và nút «Chọn tệp»
  cùng hàng với chữ «Kéo tệp vào đây».
- AC-3: Given ngăn công ty, ngăn liên hệ và ngăn thoả thuận, mỗi bản ghi có một trường Tệp, When mở ở khổ 375, Then
  trong vùng kéo thả, chữ «Kéo tệp vào đây» nằm trọn một dòng, khối chữ nằm dưới nút «Chọn tệp», và dòng mô tả kiểu tệp
  không bị bóp hẹp hơn nửa bề ngang vùng kéo thả.
- AC-4: Given ngăn công ty có tệp, When mở ở khổ 375, Then trang không cuộn ngang và không phần tử nào trong ngăn tràn
  khỏi bề ngang ngăn.
- AC-5: Given ngăn liên hệ và ngăn thoả thuận có tệp, When mở ở khổ 1440, Then bố cục giữ như hôm nay: Chi tiết hai cột,
  ô Tệp chiếm trọn hàng, nút «Chọn tệp» cùng hàng với chữ «Kéo tệp vào đây».
- AC-6: Given một công ty chưa có mô tả và Kara chưa điền xong các trường, When mở ngăn ở khổ 1440, Then không có mục
  Giới thiệu rỗng, Chi tiết là mục đầu tiên của tab, dòng Kara chờ nằm ngay dưới Chi tiết và rộng bằng Chi tiết, và mục
  Hoạt động web vẫn hiện sau đó.
- AC-7: Given trang Tài liệu, When mở hộp thoại tải nguồn ở khổ 1440, Then vùng kéo thả giữ như hôm nay: nút «Chọn tệp»
  cùng hàng với chữ của vùng.

## Coverage

Quét theo khuôn test-matrix của `morphological-scan` (`coverage-scan.md`).

- Trục phiếu: Công ty | Liên hệ | Thoả thuận [thước CE: `git grep nguCanhTep` trên onehub 05f9574fb — ba nơi gắn ô Tệp]
- Trục khổ: 375 (ngăn kéo điện thoại) | 768 (từ `md`, dưới `lg`) | 1440 (từ `lg`) [thước CE: `lg` là ngưỡng của cột phải
  cũ, `md` là ngưỡng ngăn kéo / ngăn bên, `sm` là ngưỡng hai cột của Chi tiết]
- Trục vùng: Giới thiệu | Chi tiết | ô Tệp (dòng tệp + vùng kéo thả) | dòng Kara chờ | Hoạt động web [thước CE: các mục
  `company-sheet.tsx` dựng ở tab Tổng quan]
- Trục nơi dùng vùng kéo thả: ô Tệp | hộp thoại Tài liệu › tải nguồn [thước CE: `git grep NguonKeoTha` trên onehub
  05f9574fb — hai nơi gọi]
- Trục dữ liệu: có mô tả | không mô tả; tên tệp dài 60 ký tự [thước CE: ảnh chủ kho gửi 23/10 — tên «OKR Q4 2026 …» bị cắt]
- Core: Công ty × 1440, 768 × thứ tự và bề rộng (AC-1); Công ty × 1440 × ô Tệp (AC-2); ba phiếu × 375 × vùng kéo thả
  (AC-3); Công ty × 375 × tràn ngang (AC-4); Liên hệ, Thoả thuận × 1440 hồi quy (AC-5); Công ty không mô tả × Kara chờ
  (AC-6); hộp thoại Tài liệu › tải nguồn × 1440 — nơi thứ hai dùng vùng kéo thả (AC-7).
- Later: ô Tệp đầy 10 tệp; Liên hệ, Thoả thuận × 768 (cùng khung đã chạy, không đổi).
- Never: phiếu Kế hoạch, KR (không có ô Tệp); cột Kara trong khung bản ghi (việc của `docs/ai-ux.md` §11).

## Out of scope

- Đổi khung phiếu Liên hệ, Thoả thuận — chỉ đo hồi quy.
- Đặt nhãn lên trên giá trị cho trường rộng ở điện thoại — nhãn vẫn 104px bên trái như mọi trường.
- Hai trường «Phụ trách» và «Người phụ trách» cùng hiện trên phiếu Công ty — có từ trước, không thuộc câu giao.
- Cột Kara bên phải khung bản ghi.

## Notes

- Lý do giữ Giới thiệu đứng đầu: commit fc236a253 của hãng tách cột vì «tám hàng trường đứng trên đoạn giới thiệu, người
  dùng cuộn qua trường mới tới phần chữ». Câu Hỏi-1 trên thẻ.
