---
schema_version: 1
feature: Trưởng đơn vị mở Cập nhật gần đây trước buổi họp tuần, đọc mọi lần cập nhật của bộ OKR mình dẫn, mới nhất trước, và trả lời ngay dưới từng lần
slug: cap-nhat-gan-day
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-26-cap-nhat-gan-day-design.md
---

# Acceptance Contract: cap-nhat-gan-day

## Context

Hôm nay một lần cập nhật KR chỉ đọc được trong Lịch sử của chi tiết từng KR, và bình luận nằm ở thẻ Trao đổi của từng
mục tiêu. Vòng này thêm mục «Cập nhật gần đây» ở đầu thanh bên khu Mục tiêu, ngay dưới «Của tôi»: một dòng tin cho mọi
lần cập nhật KR của chu kỳ đang chọn, mới nhất trước, lọc bằng ba chip của khu, trả lời ngay dưới lần cập nhật mới nhất
của mỗi KR, bấm một dòng thì mở chi tiết KR. Máy chủ thêm một thủ tục chỉ đọc `okr.capNhatGanDay`; lần trả lời đi qua
`okr.addComment` sẵn có nên cũng là một bình luận ở thẻ Trao đổi. Không migration (D5 lối a, chủ kho 24/10).

«Lần cập nhật của chu kỳ» là mọi `OkrCheckIn` có KR thuộc mục tiêu đã công bố cấp OneHub, bộ phận, phòng ban của chu kỳ
đang chọn mà người xem được thấy. Thời điểm của một lần là `submittedAt` của phiên cập nhật. «Lần mới nhất» là lần có
thời điểm muộn nhất của KR ấy. Đo màn trên phiên đo riêng của cây (`tien-de.mjs`), dữ liệu mẫu, tiếng Việt, 1280×800
và 375×812. Bản mẫu: `/proto/cap-nhat-gan-day` (ảnh ở `evidence/design-pass/`).

Source input: hàng VK12 của `docs/plan/lo-trinh-okr.json` (quyết định D5, D7, D8, C5 trong `ghi_chu`), mã `B5c` của
`docs/plan/pham-vi-okr-vo-khu-1810.md`, ô `_acceptance/cap-nhat-gan-day/opportunity.md`

## Criteria

- AC-1: Given khu Mục tiêu, When mở bất kỳ trang nào của khu, Then thanh bên khu có đúng bảy mục, nhóm đầu là «Của tôi · Cập nhật gần đây» theo thứ tự ấy; mục «Cập nhật gần đây» là liên kết tới `/okr/cap-nhat-gan-day` mang `kyOkr` khi đường đang mang nó; ở trang ấy chỉ mục đó sáng; trang có `PageShellTitle` «Cập nhật gần đây» và đúng một câu mô tả, dựng trong `page.tsx`; And thước thanh bên của hồ sơ `vo-khu-muc-tieu` đổi `DO.soMuc` từ 6 sang 7 kèm một dòng sổ `fix` ở hồ sơ ấy (D7).
- AC-2 (cross-layer): Given một chu kỳ có lần cập nhật ở mọi cấp và trạng thái mục tiêu, When gọi `okr.capNhatGanDay` phạm vi Tất cả và đi hết các trang, Then tập `checkInId` gộp lại bằng đúng mọi lần cập nhật của KR thuộc mục tiêu `cong-bo` cấp OneHub, bộ phận, phòng ban của chu kỳ ấy — không lần nào của mục tiêu cá nhân, nháp, đã bỏ hay chu kỳ khác; thứ tự là thời điểm gửi giảm dần; mỗi dòng mang người cập nhật, chủ KR khi là lần cập nhật thay, KR, mục tiêu, bộ OKR, giá trị theo kiểu KR, mức tự tin, ghi chú và thời điểm; `total` bằng số lần ấy; And dòng tin trên màn hiện đúng các trường ấy theo đúng thứ tự.
- AC-3: Given một OKR giới hạn mà người xem hẹp không được xem, When người ấy gọi `okr.capNhatGanDay`, Then không lần cập nhật nào của OKR ấy có trong `rows`, `total` hay số của bất kỳ chip nào, còn quản trị chương trình gọi cùng chu kỳ thì thấy; And người mang vai «chỉ OKR» gọi được thủ tục (tên nó có trong tập của `apps/api/test/vai-chi-okr.spec.ts`).
- AC-4: Given cây có bộ phận B1 (phòng ban P1, P2), bộ phận B2 (P3) và OneHub, When chọn chip «Tôi dẫn» hay «Đang theo dõi», Then «Tôi dẫn» chỉ cho lần cập nhật của bộ đơn vị người xem làm trưởng — trưởng B1 thấy bộ B1, không thấy P1, P2, không ai có bộ OneHub, người không dẫn đơn vị nào thấy 0; «Đang theo dõi» cho mọi lần cập nhật của một bộ khi người xem theo dõi ít nhất một mục tiêu của bộ ấy trong chu kỳ; số trên mỗi chip bằng `total` khi chọn chip đó; chữ chip đúng «Tất cả · Tôi dẫn · Đang theo dõi» (C5).
- AC-5: Given hơn một trang lần cập nhật, When sang trang, đổi chip, đổi chu kỳ hay mở thẳng một đường dẫn, Then mỗi trang có tối đa 20 dòng và trang sau nối đúng sau trang trước, không trùng không sót; chip và trang ghi trên đường dẫn (`phamViBo` và tham số trang, `nuqs`) và mở thẳng ra đúng tập ấy; đường không mang `phamViBo` thì chip «Tất cả» sáng và thủ tục nhận phạm vi Tất cả (Hỏi-1, soạn theo khuyến nghị); đổi chip hay đổi chu kỳ về trang 1, đổi chu kỳ giữ chip; giá trị hỏng trên đường bị bỏ qua và trang vẫn dựng; And số truy vấn của một lần gọi không đổi khi số lần cập nhật hay số đơn vị tăng.
- AC-6 (cross-layer): Given lần cập nhật mới nhất của một KR, When người xem bấm «Trả lời», gõ và Gửi, Then lần trả lời được ghi bằng `okr.addComment` gắn đúng mục tiêu và KR ấy, tự nhắc tên người đã viết lần cập nhật ấy trừ khi đó là chính người trả lời hay người ấy không còn là thành viên (Hỏi-2, soạn theo khuyến nghị), hiện ngay dưới dòng mà không tải lại trang, và hiện ở thẻ Trao đổi của mục tiêu mang nhãn KR; dưới lần mới nhất hiện mọi bình luận gắn KR ấy từ thời điểm của lần đó trở đi, cũ trước; lần cập nhật cũ không có nút trả lời và không hiện bình luận (D5 lối a); Gửi tắt khi ô rỗng; gửi hỏng (chu kỳ đã ẩn) thì câu lỗi hiện dưới ô và chữ đã gõ còn nguyên.
- AC-7: Given dòng tin, When bấm tên KR hay vùng trống của một dòng, Then chi tiết KR (VK7, `useMoNganKr`) mở trên chính trang cho đúng KR ấy; bấm trong ô trả lời không mở; And ma trận lối mở KR của hồ sơ `ngan-kr-mot-cho` có thêm ô `cap-nhat-gan-day` kèm một dòng sổ `fix` ở hồ sơ ấy, và bộ quét của nó xanh với số lối bằng số ô (D8).
- AC-8: Given trang Cập nhật gần đây, When dữ liệu đang tải, tải lỗi, chưa có chu kỳ, chu kỳ chưa có lần cập nhật nào, chip đang chọn rỗng, hay có dữ liệu, Then lần lượt hiện ST-cng-cho, ST-cng-loi (có Thử lại), ST-cng-chuachuky, ST-cng-rong, ST-cng-rongloc (có «Xem tất cả»), ST-cng-codulieu như bảng trạng thái của design doc, và tiêu đề trang giữ ở mọi trạng thái.
- AC-9: Given phiên đo có dữ liệu mẫu, When chụp Cập nhật gần đây (Tất cả, và ô trả lời đang mở) ở 1280 và 375, Then ở 1280 thanh bên có mục mới sáng ngay dưới «Của tôi», hàng chip trên dòng tin, mỗi dòng đọc được người · thời điểm · KR · mục tiêu và bộ · giá trị và mức tự tin · ghi chú, chân có phân trang; ở 375 trang không tràn ngang, hàng chip cuộn trong chính nó, tên KR dài xuống dòng chứ không bị cắt mất.
- AC-10: Given bộ OKR mẫu (`bun run okr:mau`), When nạp, Then có theo dõi và lần trả lời ghi qua `OkrTraoDoiService` (không chèn thẳng bảng), đủ để một người mẫu dẫn đơn vị thấy chip «Đang theo dõi» khác 0 và ít nhất một lần cập nhật mới nhất có lần trả lời; nạp lại lần nữa không nhân đôi theo dõi hay lần trả lời.

## Coverage

Quét bằng `morphological-scan` (preset entity-feature, `_acceptance/cap-nhat-gan-day/coverage-scan.md`), chân ngành
`[NGÀNH: Tability — Recent updates]` (báo cáo 18/10, `docs/findings/2026-10-22-hop-tuan/README.md` §5).

- Trục A — người xem: trưởng phòng ban | trưởng bộ phận | thành viên | quản trị | người xem hẹp | vai «chỉ OKR» [thước CE: `OkrAccessService.quyen`, `dieuKienXemMucTieu`, `vai-chi-okr.spec.ts`] → AC-3, AC-4.
- Trục B — nguồn dòng: công bố OneHub | bộ phận | phòng ban | cá nhân | nháp hay đã bỏ | chu kỳ khác | cập nhật thay [thước CE: `CAP_MUC_TIEU`, `TRANG_THAI_MUC_TIEU`, cột `onBehalf`] → AC-2.
- Trục C — phạm vi và trang: Tất cả | Tôi dẫn | Đang theo dõi | trang đầu | trang sau | đổi chu kỳ | đường dẫn chép tay [thước CE: `CONTEXT.md` «Tôi dẫn · Đang theo dõi», `docs/design.md` «Hàng công cụ»] → AC-4, AC-5.
- Trục D — việc trên một dòng: đọc | mở chi tiết KR | trả lời lần mới nhất | lần cũ | trả lời bị từ chối [thước CE: `ghi_chu` của VK12 (D5, D8), `docs/design.md` «Bấm vào KR và cập nhật»] → AC-6, AC-7; cảm xúc `[NGÀNH: Tability]` ở Later (HT5).
- Lớp trạng thái × khổ: chờ | lỗi | chưa chu kỳ | rỗng | rỗng theo chip | có dữ liệu × 1280 | 375 [thước CE: `docs/design.md` «Nếp màn trong app»] → AC-8, AC-9.
- Lối vào: thanh bên | đường dẫn chép tay → AC-1, AC-5.
- `[GIẢ ĐỊNH]` cỡ dữ liệu: một chu kỳ cả công ty tới hàng chục nghìn lần cập nhật (vài trăm KR × 13 tuần, có KR cập nhật nhiều lần một tuần) — nên phân trang và đếm ở máy chủ.

## Đường đo

- Thước: một dòng cho mọi lần cập nhật tuần trong chu kỳ · số từ: bài kiểm API gộp `checkInId` mọi trang so tập viết trước của ca mẫu (E2), và bàn đo màn so số dòng đếm trên màn với `total` của API trên phiên đo (E3) · bảo đảm bởi: AC-2
- Thước: lọc Tất cả · Tôi dẫn · Đang theo dõi · số từ: bài kiểm API ma trận người xem × chip (E5) · bảo đảm bởi: AC-4
- Thước: lượt trưởng đơn vị mở trang trước buổi họp tuần (Cổng Giá trị, sau khi bật) · số từ: dòng `tRPC okr.capNhatGanDay` trong nhật ký API mang người và vai (`LoggingMiddleware`) · bảo đảm bởi: AC-2 (tên thủ tục cố định)

## Out of scope

- Trả lời trên từng lần cập nhật cũ, và cảm xúc dưới lần cập nhật — hàng HT5 (cần khoá lần cập nhật cho bình luận, T3).
- Nhắc tên người trong lần trả lời — vẫn làm ở thẻ Trao đổi của mục tiêu.
- Lần cập nhật của mục tiêu cá nhân, nháp, đã bỏ.
- Gom dòng tin theo tuần, tìm kiếm, lọc theo một bộ hay một người cụ thể, lọc «cấp dưới».
- Sửa hay xoá một lần cập nhật từ dòng tin.
- Loại thông báo mới cho lần trả lời — người viết lần cập nhật nhận tin qua đường nhắc tên sẵn có (Hỏi-2).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl` (xem skill feature-loop — repo chưa dùng feature-loop thì bỏ qua).

## Notes

- Không chạm tệp T3: không migration; quyền xem đi qua `OkrAccessService.quyen`, `nguCanhXem` và `dieuKienXemMucTieu`, chỉ gọi.
- Hai thước của hồ sơ đã ký đổi trong làn này theo quyết định chủ kho 24/10: `vo-khu-muc-tieu/rang/do-man-lib.mjs` (D7) và `ngan-kr-mot-cho/rang/quet-loi.mjs` (D8); mỗi hồ sơ một dòng sổ `fix`, ghim lại hai hồ sơ ở đuôi vòng.
- Lệch bản mẫu vo-khu-muc-tieu (`ManCapNhat`): chip dùng chữ «Tôi dẫn · Đang theo dõi» (C5) thay «Bộ OKR bạn dẫn · Bạn theo dõi»; trả lời qua ô mở dưới dòng thay nút trơn.
- Phiên làm là MacBook Pro, làm thay dãy V3 của đợt vo-khu-muc-tieu; PR xếp gộp sau bốn PR của Mac Studio (#567, #566, #560, #568).
