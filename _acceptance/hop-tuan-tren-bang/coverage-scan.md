# Quét phủ — hop-tuan-tren-bang (HT2)

Preset `entity-feature` (thực thể: một dòng KR trên bảng Họp tuần).

## Ngữ cảnh

- Sản phẩm: CRM nội bộ của OneHub, khu Mục tiêu (OKR) — chân sản phẩm: đào repo
  [SUY-TỪ-REPO: docs/findings/2026-10-22-hop-tuan/README.md] [SUY-TỪ-REPO: docs/design.md] · chân ngành: Tability, chụp
  thật 22/10 [NGÀNH: Tability — docs/findings/2026-10-22-hop-tuan/tab/].

## Trục

- Trục A — phần của dòng: ghi chú mới nhất | mức đổi | nút Cập nhật | mở ngăn KR
  [thước CE: câu giao HT2 + bảng Tability ở §4 của README findings]
- Trục B — khổ: <768 | 768–1023 | ≥1024 [thước CE: `bat_khi` của HT2 (375, 768, 1440) + ranh giới `md`, `lg` của bảng]
- Trục C — lịch sử cập nhật của KR: chưa lần nào | một lần | nhiều lần khác tuần | hai lần cùng tuần | giá trị không đổi |
  KR mốc | có lần mà chưa ghi chú bao giờ | ghi chú cũ hơn lần mới nhất
  [thước CE: `packages/db/src/okr-hop-tuan.ts` (`LanCapNhat`) + luật tuần của `toan-canh-okr` AC-7]
- Trục D — nơi mở ngăn KR: dòng Đang bàn | dòng Còn lại | đường dẫn tải lại khi ngăn đang mở | chỗ khác (trang đơn vị,
  Của tôi, Tổng quan…) [thước CE: ma trận chín lối của VK7 E1 `_acceptance/ngan-kr-mot-cho/evals.yaml`]

## Core

1. Ghi chú mới nhất × mọi khổ × Đang bàn và Còn lại — lời hứa đầu của `bat_khi` → AC-2.
2. Mức đổi × trục C đủ tám giá trị (luật tuần, đơn vị KR, KR mốc) → AC-1 (API), AC-3 (hiển thị).
3. Nút Cập nhật × quyền (được / không được cập nhật) × gửi xong ở lại bảng → AC-4.
4. ‹ › × trục D: Đang bàn → Còn lại một thứ tự; mép đầu, mép cuối; tải lại; chỗ khác giữ VK7 → AC-5, AC-6.
5. Thứ tự sau khi gửi cập nhật từ ngăn (KR đổi phần) → AC-7.
6. Màn thật ba khổ, sáng tối, cả ngăn mở từ bảng → AC-8; tên truy cập, tiêu điểm, chữ hai tiếng → AC-9.
7. Hồ sơ đã ký không xấu hơn → AC-10.

## Later

- Chế độ trình chiếu riêng (HT-C1, chân trời).
- Mức đổi của tự tin («vừa → thấp») trên dòng — nhãn «Tụt» đã nói điều đó.
- Lọc hay sắp lại bảng theo mức đổi.

## Never

- Ô nhập trên dòng, gửi nhiều KR một lần — Lối (b), `docs/design.md` «Bấm vào KR và cập nhật».
- ‹ › theo thứ tự bảng khi mở ngăn từ chỗ khác — VK7 AC-2 giữ nguyên ngoài Họp tuần.

## Cross-cutting áp mọi ô Core

- Tải và lỗi của `okr.hopTuan` giữ nguyên HT1; lỗi gửi cập nhật giữ nguyên hộp hôm nay.
- Chữ người nhập (`translate="no"`), số theo locale, tên truy cập của nút.
- Sáng · tối.
