---
schema_version: 1
feature: Tách «Đang theo dõi» khỏi tab «Của tôi» của OKR
slug: okr-cua-toi-tach-theo-doi
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [api, ui]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-07T11:05:00Z
design_doc: docs/superpowers/specs/2026-10-07-okr-cua-toi-tach-theo-doi-design.md
---

# Acceptance Contract: okr-cua-toi-tach-theo-doi

## Context

Tab «Của tôi» của khu Mục tiêu đang hiện cả mục tiêu người gọi chỉ bấm «Theo dõi», trộn
vào bảng chính không một dấu hiệu nào — chủ kho thấy OKR của người khác trong bộ OKR của
mình trên production. `okr.mine` gom vai «theo dõi» từ commit `49bd46b6d`, trái với mô tả
trang, AC-10 của `dat-okr-trong-crm` và mục «Theo dõi (mục tiêu)» của `CONTEXT.md`. Vòng
này đưa «Của tôi» về bốn vai và đặt mục tiêu chỉ-theo-dõi vào một nhóm gập riêng.

Source input: prompt (chủ kho, 07/10) — phương án A đã chốt trong phiên.

## Criteria

- AC-1: Given chu kỳ C có sáu mục tiêu chưa bỏ, mỗi cái nối người dùng U bằng đúng một quan hệ — U phụ trách; mục tiêu cá nhân của U do người khác phụ trách; U tham gia; U phụ trách một KR; U chỉ theo dõi; không quan hệ nào —, When U gọi `okr.mine({ cycleId: C })`, Then `objectives` có đúng bốn mục tiêu của bốn quan hệ đầu, `dangTheoDoi` có đúng mục tiêu U chỉ theo dõi, và mục tiêu không quan hệ không có ở mảng nào.
- AC-2: Given bốn mục tiêu chưa bỏ, mỗi cái nối U bằng một trong bốn quan hệ «của tôi» ở AC-1 VÀ U cũng theo dõi, When U gọi `okr.mine`, Then cả bốn ở `objectives` và không cái nào ở `dangTheoDoi`.
- AC-3: Given bốn mục tiêu đã bỏ nối U bằng bốn quan hệ «của tôi» và một mục tiêu đã bỏ U chỉ theo dõi, When U gọi `okr.mine`, Then `daBo` có đúng bốn mục tiêu đầu, và mục tiêu chỉ-theo-dõi đã bỏ không có ở `objectives`, `daBo` hay `dangTheoDoi`.
- AC-4: Given một mục tiêu U đã theo dõi rồi bị đặt mức hiển thị giới hạn không gồm U, When U gọi `okr.mine`, Then mục tiêu đó không có ở mảng nào; And đối chứng: đặt lại công khai thì nó trở về `dangTheoDoi`.
- AC-5: Given U có mục tiêu của mình và mục tiêu chỉ theo dõi ở chu kỳ đang xem, When mở Mục tiêu › Của tôi, Then bảng chính chỉ có mục tiêu của U; ngay dưới là nút «Đang theo dõi (n)» với n bằng số mục tiêu chỉ-theo-dõi, đóng sẵn, đứng trên «Đã bỏ (m)» khi có; bấm nút thì nhóm mở bảng đúng các mục tiêu đó.
- AC-6: Given U không giữ mục tiêu nào nhưng đang theo dõi ít nhất một mục tiêu ở chu kỳ đang xem, When mở Của tôi, Then trạng thái rỗng `ST-cuatoi-rong` vẫn hiện như hôm nay và nút «Đang theo dõi (n)» ở ngay dưới nó.
- AC-7: Given U không theo dõi mục tiêu nào ngoài mục tiêu của mình, When mở Của tôi, Then không có nút hay vùng «Đang theo dõi» nào trên màn.
- AC-8: Given giao diện tiếng Anh và U có mục tiêu chỉ theo dõi, When mở Của tôi, Then nút nhóm đọc «Following (n)».
- AC-9: Given U đang ở Của tôi với một mục tiêu M trong nhóm «Đang theo dõi», When mở nhóm, mở M, bấm «Đang theo dõi» để tắt rồi đóng sheet, Then M không còn trên màn (nhóm biến mất nếu M là cái cuối) mà không cần tải lại trang, và `okr.mine` đọc lại không còn M ở mảng nào; And đối chứng: theo dõi lại M từ «Theo đơn vị» rồi quay về Của tôi thì M trở lại nhóm. (cross-layer)

## Coverage

Quét bằng `morphological-scan` (preset entity-feature × test-matrix), 07/10.

- Trục A — quan hệ của U với mục tiêu: phụ trách | cá nhân của U | tham gia | giữ KR | chỉ theo dõi | không quan hệ [thước CE: mệnh đề `OR` của `mine` trong `apps/api/src/okr/okr.service.ts` + quan hệ của `OkrObjective` trong `packages/db/prisma/schema.prisma`]
- Trục B — trạng thái mục tiêu: chưa bỏ (nháp · chờ duyệt · công bố) | đã bỏ [thước CE: `TRANG_THAI_MUC_TIEU` trong `packages/validation/src/okr-muc-tieu.ts`]
- Trục C — trùng vai: một vai | vai «của tôi» + theo dõi [thước CE: bốn vai × theo dõi, AC-2]
- Trục D — màn: bảng chính có/rỗng × nhóm theo dõi có/rỗng × ngôn ngữ vi/en [thước CE: hai nhánh của `cua-toi.tsx` + `okrMessages` vi/en]
- Cross-cutting: quyền xem (`nguCanhXem`) áp mọi ô — AC-4; cập nhật sau khi bấm theo dõi/bỏ theo dõi — AC-9.
- Ô Core: A1–4×B-chưa-bỏ (AC-1, AC-2) · A1–4×B-đã-bỏ (AC-3) · A5×B-chưa-bỏ (AC-1) · A5×B-đã-bỏ (AC-3) · A6 (AC-1) · D bốn tổ hợp (AC-5, AC-6, AC-7) · en (AC-8).
- Đối chiếu ngành: [NGÀNH: Asana Goals «My goals»] chỉ gom mục tiêu bạn là chủ — cùng hướng tách «theo dõi» khỏi «của tôi».
- Mục tiêu chỉ-theo-dõi mà đã bỏ không cần chỗ trong «Của tôi» — chủ kho duyệt trong thiết kế ngắn 07/10 (giả định in nghiêng thứ nhất), dòng sổ descope thứ hai.

## Out of scope

- Nhãn vai trò trên từng mục tiêu («Bạn phụ trách / tham gia / giữ KR») — phương án C, không chọn.
- Hiện mục tiêu chỉ-theo-dõi đã bỏ ở bất kỳ nhóm nào của «Của tôi».
- Việc OKR của người theo dõi (`okr.viecCuaToi`, gộp cập nhật trong 24 giờ) — không đổi.
- Nhớ trạng thái mở/gập của nhóm qua các lần vào trang.
- Thêm nhóm «Đang theo dõi» vào «Theo đơn vị» hay «Toàn cảnh».

## Notes

- `GET /okr/mine` thêm trường `dangTheoDoi`; trường cũ không đổi nghĩa, trừ `objectives` thôi chứa mục tiêu chỉ-theo-dõi — đó là bản sửa.
- `CONTEXT.md` mục «Theo dõi (mục tiêu)» thêm một câu về nhóm «Đang theo dõi».
- Bảng ánh xạ của AC-10 `dat-okr-trong-crm` («gom mục tiêu tôi phụ trách, tôi tham gia, có KR tôi phụ trách») vẫn đúng; vòng này là bản sửa đưa mã về khớp nó.
- Hồ sơ đã ký chạm lời hứa (đã tra 07/10 bằng `git grep` `okr.mine`/`mineOutput` trên `_acceptance/*/{contract.md,evals.yaml,rang/*}`): **`cap-nhat-tuan-okr` AC-9 / E17** hứa «`okr.mine` có mục tiêu đang theo dõi» và test `apps/api/test/okr-cap-nhat.spec.ts` (khối `trao-doi`) đọc nó từ `objectives`. Kiểm ở S3 (07/10): người M trong ca đó phụ trách KR1 của mục tiêu O, tức O là «của tôi» với M — khẳng định cũ vẫn đúng sau vòng này, test chạy xanh không sửa gì; không đổi test đã ký nào. Các hồ sơ còn lại đọc `okr.mine` (`dat-okr-trong-crm`, `gop-y-dung-cho`, `muc-tieu-va-kr`, `ux-lai-thu-8c-okr`) chỉ đọc vai phụ trách/tham gia/giữ KR hoặc dựng fixture `mineOutput`: fixture thêm `dangTheoDoi: []`, khẳng định không đổi.
