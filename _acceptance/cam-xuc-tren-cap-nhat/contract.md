---
schema_version: 1
feature: Thành viên thả cảm xúc lên một lần cập nhật tuần ở Cập nhật gần đây, thẻ con Họp tuần của bộ OKR và ngăn KR, và người cập nhật thấy ai đã thả
slug: cam-xuc-tren-cap-nhat
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api, db]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-27T09:42:57Z
design_doc: docs/superpowers/specs/2026-10-27-cam-xuc-tren-cap-nhat-design.md
---

# Acceptance Contract: cam-xuc-tren-cap-nhat

## Context

Hôm nay cách duy nhất để ghi nhận một lần cập nhật KR là trả lời, và trả lời chỉ đặt được dưới lần mới nhất của mỗi KR
(VK12, D5 lối a). Vòng này thêm cảm xúc trên từng lần cập nhật — bốn loại cố định 👍 «Đồng ý» · 🎉 «Chúc mừng» · 💪 «Cố
lên» · 👀 «Đã xem» (Hỏi-1, soạn theo khuyến nghị) — hiện ở Cập nhật gần đây, thẻ con Họp tuần của bộ OKR và ngăn KR; và
mở trả lời trên mọi lần cập nhật ở Cập nhật gần đây (D5 lối b). Cảm xúc và trả lời cùng một khoá lần cập nhật (`OkrCheckIn`):
bảng mới `okrCamXuc` và cột `okrComment.checkInId` trong một migration (D6).

«Tóm tắt cảm xúc» của một lần cập nhật là danh sách, theo thứ tự cố định của bộ, các loại có ít nhất một người thả: loại,
số người, người xem có thả không, và tên tới `OKR_CAM_XUC.tenToiDa` người, cũ trước. «Lần của Họp tuần» là lần mới nhất của
KR; «lần của ngăn KR» là lần cuối trong mỗi tuần của Lịch sử. Đo màn trên phiên đo riêng của cây (`tien-de.mjs`), dữ liệu
mẫu, tiếng Việt, 1280×800 và 375×812. Bản mẫu: `/proto/cam-xuc-tren-cap-nhat`.

Source input: hàng HT5 của `docs/plan/lo-trinh-okr.json` (D5, D6 trong `ghi_chu`), mã `H8` của
`docs/plan/pham-vi-okr-hop-tuan-2210.md`, ô `_acceptance/cam-xuc-tren-cap-nhat/opportunity.md`

## Criteria

- AC-1 (cross-layer): Given một lần cập nhật của mục tiêu người xem được thấy, When người ấy chạm một cảm xúc dưới lần đó ở Cập nhật gần đây, Then `okr.thaCamXuc` ghi đúng một hàng `okrCamXuc` (lần cập nhật, người, loại) và một dòng vết `tha-cam-xuc`, trả tóm tắt cảm xúc mới của lần đó; chip của loại ấy hiện ngay dưới dòng với số tăng 1 và ở trạng thái đã thả của người xem, không tải lại trang.
- AC-2 (cross-layer): Given người xem đã thả một loại trên một lần cập nhật, When chạm lại đúng chip ấy, Then hàng của người ấy bị xoá, một dòng vết `go-cam-xuc` được ghi, số giảm 1 và chip biến mất khi về 0; một người có tối đa một hàng mỗi (lần cập nhật, loại) và thả nhiều loại khác nhau được; hai lần chạm đồng thời cùng loại để lại đúng một hàng hoặc không hàng nào, không lỗi hiện ra màn; chip đổi ngay khi chạm và bị tắt tới khi máy chủ trả; thả hỏng (chu kỳ đã ẩn, mất mạng) thì chip trở về đúng số và trạng thái trước khi chạm và một toast nói vì sao.
- AC-3 (cross-layer): Given một lần cập nhật có cảm xúc của nhiều người, When đọc `okr.capNhatGanDay`, `okr.hopTuan` (khi đó là lần mới nhất của KR) và `okr.dienBien` (khi đó là lần cuối của tuần), Then cả ba trả `checkInId` của lần ấy cùng một tóm tắt cảm xúc, bằng đúng tập hàng `okrCamXuc` của lần ấy; dòng Họp tuần của KR chưa có lần cập nhật mang `checkInId` rỗng và không có cảm xúc; And số truy vấn của mỗi thủ tục không đổi khi số lần cập nhật hay số cảm xúc tăng.
- AC-4: Given phiên đo có dữ liệu mẫu, When người mẫu thả một cảm xúc ở Cập nhật gần đây rồi, trong cùng phiên không tải lại, mở thẻ con Họp tuần của bộ ấy và ngăn KR của KR ấy, Then cả hai chỗ hiện chip của loại ấy với cùng số và ở trạng thái đã thả; chạm lại ở ngăn KR thì chip ở Cập nhật gần đây cũng gỡ khi quay lại.
- AC-5: Given một lần cập nhật có cảm xúc, When người cập nhật (hay bất kỳ ai xem được) di chuột lên một chip trên máy tính, hoặc chạm nút «Thả cảm xúc» ở bất kỳ khổ nào, Then tooltip của chip nêu tên người đã thả loại ấy, cũ trước, tới `OKR_CAM_XUC.tenToiDa` tên rồi «và n người khác»; bảng của nút «Thả cảm xúc» có hàng bốn cảm xúc và, dưới đó, mọi loại đã có người thả kèm đủ tên — ở 375 chạm nút mở bảng mà không đảo cảm xúc nào; mỗi chip có nhãn đọc màn hình gồm tên loại, số người và «bạn đã thả» khi đúng.
- AC-6 (cross-layer): Given một OKR giới hạn mà người xem hẹp không được xem, When người ấy gọi `okr.thaCamXuc` với một lần cập nhật của OKR ấy, Then nhận `khongThayMucTieu` như một id không tồn tại và không hàng nào được ghi; `okr.addComment` mang `checkInId` của lần ấy (dưới mục tiêu khác người ấy xem được, có hay không `keyResultId`) cũng nhận đúng câu ấy và không ghi; cảm xúc và `checkInId` của OKR ấy không có trong `capNhatGanDay`, `hopTuan`, `dienBien` của người ấy, và tên người xem hẹp không lọt vào tóm tắt của OKR khác; chu kỳ đã ẩn thì `thaCamXuc` bị từ chối; chu kỳ đang chấm điểm hay đã đóng thì thả được (Hỏi-4, soạn theo khuyến nghị); người mang vai «chỉ OKR» gọi được thủ tục; And `soi-ma.mjs --ca xem` biết `okrCamXuc` và xanh.
- AC-7 (cross-layer): Given mọi dòng của Cập nhật gần đây, When người xem bấm «Trả lời» dưới một lần cập nhật bất kỳ (không riêng lần mới nhất), gõ và Gửi, Then `okr.addComment` ghi bình luận mang đúng `checkInId` và KR của lần ấy; dưới mỗi dòng hiện đúng các bình luận mang `checkInId` của dòng ấy, cũ trước, kể cả dòng cũ; bình luận vẫn hiện ở thẻ Trao đổi của mục tiêu; `checkInId` của KR khác cùng mục tiêu bị từ chối bằng `capNhatKhacKr`, `checkInId` thuộc mục tiêu khác bị từ chối bằng `khongThayMucTieu`; nhắc tên người cập nhật giữ như VK12.
- AC-8 (cross-layer): Given cơ sở dữ liệu có bình luận gắn KR viết trước migration, When migration chạy, Then bảng `okrCamXuc` và cột `okrComment.checkInId` có trong cùng một migration; mỗi bình luận gắn KR mang `checkInId` của lần cập nhật muộn nhất của KR ấy có thời điểm không sau lúc viết bình luận, bình luận viết trước lần đầu và bình luận không gắn KR giữ rỗng (Hỏi-2, soạn theo khuyến nghị); And mọi lần trả lời VK12 đang hiện dưới lần mới nhất của một KR vẫn hiện dưới đúng dòng ấy sau migration.
- AC-9: Given ba màn với dữ liệu mẫu, When chụp ở 1280 và 375 các trạng thái ST-camxuc-trong, ST-camxuc-co, ST-camxuc-cua-toi, ST-camxuc-dang-gui, ST-camxuc-loi, ST-camxuc-nhieu, ST-camxuc-bang, ST-cng-traloi-moi-dong và ST-hop-chua-cap-nhat, Then mỗi trạng thái hiện như bảng trạng thái của design doc; ở 375 hàng chip xuống dòng trong khối của dòng, trang không tràn ngang; Tab tới được từng chip và nút «Thả cảm xúc», Enter hay Space đảo, Esc đóng bảng cảm xúc.
- AC-10: Given bộ OKR mẫu (`bun run okr:mau`), When nạp, Then có cảm xúc ghi qua `thaCamXuc` và trả lời mang `checkInId` ghi qua `addComment` (không chèn thẳng bảng), đủ để hơn một nửa lần cập nhật của tuần gần nhất có phản hồi và ít nhất một lần có đủ bốn loại với hơn `tenToiDa` người; nạp lại không nhân đôi; And `rang/ty-le-phan-hoi.sql` chạy trên bộ mẫu in đúng tỷ lệ viết trước của bộ ấy.

## Coverage

Quét bằng `morphological-scan` (preset entity-feature, `_acceptance/cam-xuc-tren-cap-nhat/coverage-scan.md`), chân ngành
`[NGÀNH: Tability — Reply và Like trên check-in]` (`docs/findings/2026-10-22-hop-tuan/README.md` §5–§6) và
`[NGÀNH: Slack — emoji reactions]`.

- Trục A — người: người cập nhật | đồng đội xem được | quản trị | người xem hẹp | người không xem được | vai «chỉ OKR» [thước CE: `OkrAccessService.quyen`, `dieuKienXemMucTieu`, `vai-chi-okr.spec.ts`] → AC-5, AC-6.
- Trục B — chỗ: Cập nhật gần đây | Họp tuần | ngăn KR | thẻ Trao đổi | trình chiếu | tin nhắc [thước CE: `cau_giao` của HT5, README §6] → AC-3, AC-4, AC-7; trình chiếu và tin nhắc ở Later.
- Trục C — việc: thả | gỡ | thả loại thứ hai | xem ai | trả lời lần mới nhất | trả lời lần cũ [thước CE: `bat_khi` của HT5, D5] → AC-1, AC-2, AC-5, AC-7.
- Trục D — trạng thái lần cập nhật: mới nhất | cũ | cuối tuần | giữa tuần | cập nhật thay | chu kỳ ẩn | chấm điểm hay đã đóng | dữ liệu trước migration [thước CE: `okr.dienBien` (`cuoiTrongTuan`), `assertKyChuaAn`, migration D6] → AC-3, AC-6, AC-8.
- Lớp trạng thái × khổ: trống | có | của tôi | đang gửi | lỗi | nhiều người × 1280 | 375 [thước CE: `docs/design.md` «Nếp màn trong app»] → AC-2, AC-9.
- `[GIẢ ĐỊNH]` cỡ: một lần cập nhật có tới vài chục người thả; trang 20 dòng — tóm tắt gom ở máy chủ một truy vấn.
- `[GIẢ ĐỊNH]` lần giữa tuần (không phải lần cuối của tuần) chỉ thấy cảm xúc ở Cập nhật gần đây — ngăn KR chỉ hiện lần cuối của mỗi tuần.

## Đường đo

- Thước: tỷ lệ lần cập nhật của các bộ OKR quý 4 đang chạy có ít nhất một cảm xúc hoặc một trả lời từ người khác người cập nhật, trong hai buổi họp tuần sau ngày bật · số từ: `_acceptance/cam-xuc-tren-cap-nhat/rang/ty-le-phan-hoi.sql` trên cơ sở dữ liệu production sau khi bật · bảo đảm bởi: AC-10 (lệnh cho đúng số viết trước trên bộ mẫu), AC-8 (trả lời cũ mang `checkInId`).

## Out of scope

- Trình chiếu (HT-C1) — chưa có màn.
- Báo tin cho người cập nhật khi có cảm xúc (tin nhắc buổi sáng, Zalo, thông báo).
- Ô trả lời ở Họp tuần và ngăn KR.
- Cảm xúc trên bình luận, mục tiêu hay KR; ô chọn emoji tuỳ ý.
- Dùng `OkrGhiNhan` cho cảm xúc.

## Vòng đời (docs/vong-doi.md — ba câu, máy đề xuất, người chốt ở Hỏi-3)

1. Dọn thế nào: Xoá — chạm lại chip đã thả là gỡ, không hỏi lại, không «Hoàn tác» (chạm thêm lần nữa là thả lại).
2. «Lịch sử» nghĩa là gì: không có — cảm xúc là một chạm của chính người thả, không ai dựa vào nó; vết `tha-cam-xuc` /
   `go-cam-xuc` giữ dấu vết. Lần cập nhật không xoá được (`krDaCapNhat`), nên cảm xúc không mồ côi.
3. Danh sách mặc định hiện gì: chỉ cảm xúc đang có; cảm xúc đã gỡ không tìm lại ở đâu (vết của mục tiêu có dòng gỡ).

## Notes

- Hỏi-1, Hỏi-2, Hỏi-3, Hỏi-4 soạn theo khuyến nghị; xem `decisions.jsonl`.
- Phản biện context sạch: `gap-probe.md` (1 P0, 4 P1 — đã sửa vào bộ này).
- `kr-sheet.tsx` thuộc vùng làn M5 (luật 19 của đợt) — sửa qua `cham-tep`.
