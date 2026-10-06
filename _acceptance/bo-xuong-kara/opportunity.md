---
schema_version: 1
slug: bo-xuong-kara
feature: "«Mọi bề mặt Kara dùng chung một bộ khung: lời, ô soạn, bước, trạng thái, đề xuất, bản nháp»"
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-10-04T05:45:00Z
prototype:
  base_commit:
  disposition:
lo_trinh_ma: K1
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

Mở từ hàng K1 của «OKR» (`docs/plan/lo-trinh-okr.json`). Quyết định `build` là của chủ kho
ngày 04/10: thứ tự lượt Kara 0 → 1 → 2 → 3 (đề xuất `de-xuat-kara.html`, bốn câu đã trả lời)
và «Khung Kara (K1…) chạy song song ngay, tới 14/10 chỉ chạm `packages/ui`» (lộ trình lên
trước 14/10, quyết định 7). Lệnh giao việc phiên P6 (chat 04/10) mở đúng hàng này. Máy ghi
lại chữ ký từ hai quyết định đó, không tự quyết; ngưỡng dưới đây do máy soạn từ đề xuất và
được trình lại ở Cổng Phạm vi.

Nguồn: `.acceptance-runs/dieu-phoi-1410/nguon/lai-thu-prod-0410/` (`de-xuat-kara.html` mục
03 «Sáu khối», mục 05 «Mười nguyên tắc»; `bao-cao.md`; `khao-sat-dong-nhat.md` mục 4–6).

## Vấn đề & ai gặp

«Mọi bề mặt Kara dùng chung một bộ khung: lời, ô soạn, bước, trạng thái, đề xuất, bản nháp»

- Bốn bề mặt Kara (Chat, Deal, Soạn OKR, Góp ý KR) dùng bốn bộ ô soạn, bong bóng, trạng thái
  khác nhau; nút «Thử lại» có bốn cỡ; lỗi có ba hình (`Empty`, `Alert`, chữ đỏ).
- Soạn OKR có 12 chỗ hở giữa hội thoại và bản nháp, 4 là lỗi hành vi.

**Người gặp:** người viết mã các lượt K2 (Soạn OKR trang riêng), K3 (góp ý lượt 2), K4 (khung
bản ghi), K5 (Chat + Deal); gián tiếp là mọi người dùng thấy Kara mỗi màn một kiểu.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: lượt K2 dựng được màn Soạn OKR trang riêng — có thanh kéo đổi cỡ,
  khoá dòng chưa quyết khi Kara đang soạn, nhận theo nhóm — chỉ bằng sáu khối của lượt này
  cùng đồ có sẵn trong `packages/ui`, không vẽ tay khối Kara nào trong `apps/app`?
- Kết quả nào là SỐNG: hợp đồng K2 không có AC nào phải viết lại hay bọc một trong sáu khối;
  ba điều chủ kho chốt dùng đúng prop/khối đã có (khoá, nhận theo nhóm, khung co giãn).
- Kết quả nào là CHẾT: K2 phải viết lại hoặc bọc từ hai khối trở lên để đáp ứng ba điều đó.
- Timebox: PR của lượt này mở trước 10/10/2026.

Không có phiên nghiệm thu người dùng cho lượt này: sáu khối chưa lên màn nào trước 14/10.
Cổng Giá trị đọc ngưỡng trên tại Cổng Phạm vi của K2.
