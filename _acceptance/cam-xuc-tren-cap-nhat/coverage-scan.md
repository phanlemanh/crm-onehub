# Quét không gian AC — cam-xuc-tren-cap-nhat (preset entity-feature)

## Ngữ cảnh
- Sản phẩm: CRM của OneHub, khu Mục tiêu (OKR) — chân sản phẩm: đào repo [SUY-TỪ-REPO: docs/api.md mục OKR; CONTEXT.md; docs/plan/lo-trinh-okr.json hàng HT5] · chân ngành: [NGÀNH: Tability — Reply và Like trên từng check-in ở Recent updates, ngăn KR, trình chiếu] (`docs/findings/2026-10-22-hop-tuan/README.md` §5–§6, ảnh t07, t08); [NGÀNH: Slack — emoji reactions: chạm để thả, chạm lại để gỡ, di chuột để thấy ai].

## Trục
- Trục A — người: người cập nhật | đồng đội xem được | quản trị | người xem hẹp | người không xem được | vai «chỉ OKR»   [thước CE: `OkrAccessService.quyen`, `dieuKienXemMucTieu`, `vai-chi-okr.spec.ts`]
- Trục B — chỗ: Cập nhật gần đây | Họp tuần | ngăn KR | thẻ Trao đổi | trình chiếu | tin nhắc   [thước CE: `cau_giao` HT5; README §6 Tability]
- Trục C — việc: thả | gỡ | thả loại thứ hai | xem ai | trả lời lần mới nhất | trả lời lần cũ   [thước CE: `bat_khi` HT5; D5; NGÀNH Slack]
- Trục D — trạng thái lần cập nhật: mới nhất | cũ | cuối tuần | giữa tuần | cập nhật thay | chu kỳ ẩn | trước migration   [thước CE: `cuoiTrongTuan` (`packages/db/src/okr-hop-tuan.ts`), `assertKyChuaAn`, D6]

## Dựng không gian (lát cắt theo trục B)
- Cập nhật gần đây × (thả, gỡ, thả loại hai, xem ai) × mọi lần → có, cần.
- Cập nhật gần đây × trả lời × (mới nhất, cũ) → có, cần (D5).
- Họp tuần × (thả, gỡ, xem ai) × mới nhất → có, cần; × cũ → vô nghĩa (màn chỉ hiện lần mới nhất).
- Ngăn KR × (thả, gỡ, xem ai) × cuối tuần → có, cần; × giữa tuần → không có chỗ trên màn (ghi `[GIẢ ĐỊNH]`).
- Thẻ Trao đổi × trả lời → đã có (bình luận vẫn hiện), cần giữ.
- Trình chiếu × mọi việc → chưa có màn.
- Tin nhắc × báo cảm xúc → không có trong câu giao.
- Mọi chỗ × người không xem được → cần chặn (bat_khi).
- Mọi chỗ × chu kỳ ẩn → cần chặn ghi.
- Trả lời × trước migration → cần lấp khoá (Hỏi-2).

## Core
1. Thả/gỡ/thả loại hai trên mọi lần ở Cập nhật gần đây — câu giao.
2. Cùng tóm tắt ở Họp tuần (lần mới nhất) và ngăn KR (lần cuối tuần) trong cùng phiên — bat_khi.
3. Xem ai đã thả — câu giao.
4. Quyền xem và vai «chỉ OKR», chu kỳ ẩn — bat_khi + luật kho.
5. Trả lời trên từng lần + khoá checkInId + lấp dữ liệu cũ — D5, D6.
6. Bộ mẫu + đường đo — CLAUDE.md «thiếu dữ liệu thì dùng dữ liệu mẫu», ngưỡng Cổng Đáng.

## Later
- Trình chiếu (HT-C1) — khi màn có.
- Báo tin khi có cảm xúc (tin nhắc buổi sáng, Zalo) — đo ngưỡng trước, mở nếu tỷ lệ thấp vì người cập nhật không thấy.
- Ô trả lời ở Họp tuần và ngăn KR.
- Cảm xúc trên lần giữa tuần ở ngăn KR (Lịch sử chỉ hiện lần cuối của tuần).

## Never
- Ô chọn emoji tuỳ ý [NGÀNH: Slack] — bộ cố định giữ nghĩa trong ngữ cảnh OKR và không tải dữ liệu emoji ngoài.
- Cảm xúc ẩn danh — câu giao: người cập nhật thấy ai đã thả.
- Dùng `OkrGhiNhan` — ghi chú hàng HT5.

## Cross-cutting áp mọi ô Core
- `dieuKienXemMucTieu` trên mọi đọc; số truy vấn cố định; vết cho mọi ghi; lạc quan + lùi khi lỗi; 1280/375; bàn phím và nhãn đọc màn hình.
