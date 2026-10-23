## Ngữ cảnh
- Sản phẩm: CRM của OneHub — chân sản phẩm: đào repo (`CONTEXT.md` mục «Thông báo», «Nhắc buổi sáng», «Bot Zalo»;
  `docs/agent.md` mục nhắc buổi sáng; `docs/connections.md` mục Zalo; hồ sơ TB1 `hop-thong-bao-tren-web`) · chân
  ngành: GitHub Settings › Notifications (mỗi loại chọn kênh), Linear Settings › Notifications (loại × kênh), Slack
  (mức thông báo theo loại).

## Trục
- Trục A — Nguồn × mức của loại: nhắc buổi sáng · Cần làm | nhắc buổi sáng · Để biết | sự kiện · Cần làm
  (tác nhân cần trả lời) | sự kiện · Để biết (tác nhân xong/hỏng, tín hiệu đổi chỗ)
  [thước CE: `LOAI_THONG_BAO` (26 loại) × `THONG_BAO.nguon` (3 nguồn) — SUY-TỪ-REPO: packages/validation/src/thong-bao.ts]
- Trục B — Kênh của người nhận: không kênh | Zalo | Slack | ưu tiên Zalo nhưng chỉ Slack dùng được (lệch) | Zalo chưa
  bật cho xưởng
  [thước CE: `chonKenh` — SUY-TỪ-REPO: packages/db/src/kenh-thong-bao.ts]
- Trục C — Cài đặt của loại: mặc định | tắt kênh ngoài | bật kênh ngoài (loại mặc định tắt) | tắt hết mọi mục hôm nay
  | hàng cài đặt mang loại lạ
  [thước CE: NGÀNH: GitHub, Linear — mỗi loại một lựa chọn kênh, có mặc định]
- Trục D — Thời điểm đẩy: lượt sáng | sự kiện mới (trong 30 phút, sau lúc bật) | sự kiện cũ (trước lúc bật / quá 30
  phút) | chạy lại / hai nhịp chồng | gửi hỏng rồi thử lại | hết lượt thử
  [thước CE: luật «Zalo lỗi thì ném» — SUY-TỪ-REPO: docs/agent.md]
- Cắt ngang: chỉ của mình (quyền); song ngữ tên loại; 1280/375; chờ/lỗi/lưu hỏng.

## Dựng không gian (4 × 5 × 5 × 6 = 600 ô — quét theo lát của trục C)

- C=mặc định: mọi ô A×B phải ra đúng như trước vòng (nhắc sáng gửi như cũ; sự kiện không ra kênh) → **Core** (AC-2).
- C=tắt kênh ngoài × A(nhắc sáng) × B(Zalo, Slack) × D(lượt sáng) → **Core** (AC-3); × B(không kênh) → vô nghĩa (không
  có gì để tắt).
- C=tắt hết × D(lượt sáng) → **Core** (AC-3, lượt đóng không gửi).
- C=bật × A(sự kiện) × B(Zalo, Slack) × D(sự kiện mới) → **Core** (AC-4); × D(sự kiện cũ) → **Core** (AC-4 vế không gửi);
  × B(không kênh) → **Core** (AC-4 vế không lỗi); × D(chạy lại, hỏng, hết lượt) → **Core** (AC-5).
- C=bật × A(nhắc sáng) — chính là mặc định, đã phủ.
- C=loại lạ → **Core** gộp vào AC-6 (đọc bỏ qua, ghi từ chối).
- Màn × trạng thái × khổ → **Core** (AC-7); bảng mức → **Core** (AC-1); đường đo → **Core** (AC-8); từ điển → AC-9.

## Core
1. Bảng mức + mặc định một chỗ — mọi ô của trục A đi qua nó (AC-1).
2. Mặc định không đổi hành vi — ngưỡng Cổng Đáng (AC-2).
3. Lọc tin sáng theo cài đặt — vế «tự chọn loại nào» của câu giao (AC-3).
4. Đẩy sự kiện qua kênh khi bật — vế «một nguồn nhiều kênh» cho nguồn ngoài nhắc sáng (AC-4).
5. Hỏng / chạy lại / không trùng (AC-5).
6. Thủ tục cài đặt và quyền (AC-6).
7. Màn cài đặt và lối từ chuông (AC-7).
8. Đường đo kênh ngoài ↔ chuông (AC-8).

## Later
- Công tắc cả mức («tắt hết Để biết qua Zalo») — một nút cho cả thẻ.
- Gom nhiều thông báo sự kiện thành một tin; giờ yên lặng (không đẩy ban đêm).
- Hiện mức Cần làm / Để biết trên chuông (lọc, nhóm).
- Gộp «Dòng Trợ lý OKR» vào bảng loại thông báo.
- Đổi tên trang «Nhắc buổi sáng» thành trang thông báo của người.
- Chọn Zalo và Slack cùng lúc cho một loại (hai cột) — tuỳ Hỏi-1.

## Never
- Tắt chuông theo loại — pham-vi N4 «web luôn bật».
- Đẩy qua thư, trình duyệt, ứng dụng điện thoại — không có kênh ấy trong CRM.
- Đổi sang Slack khi Zalo hỏng — luật `docs/agent.md`.
- Gửi lại thông báo cũ khi người vừa bật loại — tạo sóng tin.

## Cross-cutting áp mọi ô Core
- Chỉ người nhận đọc/đổi cài đặt của mình; vai chỉ OKR dùng được.
- Mỗi thông báo đẩy tối đa một lần.
- Tên loại và câu song ngữ; dữ liệu người nhập (tiêu đề, tên) giữ nguyên chữ.
