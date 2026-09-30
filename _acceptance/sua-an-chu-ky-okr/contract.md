---
schema_version: 1
feature: Sửa và ẩn chu kỳ OKR tạo nhầm — chu kỳ trống ở lập kế hoạch sửa được mọi ô, chu kỳ chưa đóng sửa được tên, chu kỳ trống gỡ được, chu kỳ có dữ liệu ẩn được có lý do và hiện lại được; chu kỳ ẩn vắng khỏi mọi ô chọn, kỳ mặc định, kiểm quý chồng, mang sang, nhắc và ghi mới; vết luôn còn
slug: sua-an-chu-ky-okr
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: approved
approved_by: Manh Phan
approved_at: 2026-09-30T06:43:16Z
design_doc: docs/superpowers/specs/2026-09-30-sua-an-chu-ky-okr-design.md
---

# Acceptance Contract: sua-an-chu-ky-okr

## Context

Chủ kho thử trên production ngày 30/09: tạo nhầm chu kỳ thì không sửa, không xoá được.
Mã onehub `9cda3569` chỉ có tạo, đẩy pha tới và mở lại kỳ đã đóng — theo quyết định
`d-20260925T033813Z-12` của `dat-okr-trong-crm`. Sáu lỗ đo được ghi ở design doc mục
«Vì sao». Chủ kho duyệt cách A ngày 30/09: một cột «đã ẩn» riêng, pha giữ nguyên, một
điều kiện lọc dùng chung cho mọi nơi tự tìm chu kỳ.

Source input: design doc (cùng ngày) · `coverage-scan.md` · `CONTEXT.md` «Chu kỳ» ·
`_acceptance/dat-okr-trong-crm/decisions.jsonl` d-20260925T033813Z-12 ·
`_acceptance/khep-ky-okr/contract.md` (luật «Mở lại kỳ», `lyDo`) · lời chủ kho trong
phiên 30/09.

Từ dùng dưới đây: **trống** = không dòng nào ở mọi quan hệ có khoá ngoại trỏ tới chu kỳ
— hôm nay sáu: mục tiêu mọi trạng thái, lần hỏi ý, quý con kể cả đã ẩn, đợt rà, điểm KR,
mang sang tới; tập này là hằng `QUAN_HE_GIU_CHU_KY`, đối chiếu với lược đồ; **có dữ
liệu** = không trống; **đã ẩn** = `anLuc` khác rỗng.

## Criteria

- AC-1: Given hàm thuần `viecChuKy` ở `@crm/validation/okr-chu-ky`, When chạy trên bảng ca viết trước phủ đủ tích pha (bốn) × trống/có dữ liệu × đã ẩn/chưa × loại (năm có 0 hoặc ≥ 1 quý chưa ẩn, quý), Then mỗi ca trả đúng năm cờ `{ suaMoiO, suaTen, go, an, hienLai }` viết trước theo bảng luật của design doc; And `okr.cycles` trả cho mỗi chu kỳ `anLuc`, `quyConHien` và `viec` bằng đúng `viecChuKy` của tình trạng đọc từ cơ sở dữ liệu trên một bộ gieo có đủ năm dạng (trống lập kế hoạch, có dữ liệu đang chạy, đã đóng, đã ẩn, năm còn quý hiện).
- AC-2: Given chu kỳ trống ở «Lập kế hoạch» (một năm và một quý của năm khác), When quản trị gọi `okr.suaChuKy` đổi tên, ngày đầu, ngày cuối, khoảng nghỉ, thứ cập nhật, Then đọc lại cơ sở dữ liệu thấy đúng các giá trị gửi, và `okrTrail` có đúng một dòng `sua-chu-ky` mang trước/sau của các ô đã đổi; And quý đổi ngày ra ngoài năm cha, quý đổi ngày chồng một quý chưa ẩn cùng năm, ngày đầu ≥ ngày cuối, khoảng nghỉ ra ngoài chu kỳ — bị từ chối với câu ghim, bản ghi và `okrTrail` không đổi; And quý đổi ngày chồng một quý ĐÃ ẨN cùng năm — ghi được.
- AC-3: Given ba chu kỳ mà `viecChuKy` cho `suaMoiO` = false và `suaTen` = true — có dữ liệu ở «Đang chạy», trống ở «Đang chạy», trống ở «Chấm điểm» — When quản trị gọi `okr.suaChuKy` trên từng cái chỉ đổi tên, rồi đổi tên kèm một ô khác (ngày cuối, khoảng nghỉ, thứ cập nhật — mỗi ô một ca), Then đổi tên ghi được với một dòng vết; mỗi ca kèm ô khác bị từ chối với câu ghim «chỉ sửa được tên», bản ghi không đổi (kể cả tên); And `suaChuKy` trên chu kỳ «Đã đóng» và trên chu kỳ đã ẩn bị từ chối với câu ghim, bản ghi không đổi.
- AC-4: Given tập quan hệ rút từ lược đồ (mọi trường quan hệ tới `OkrCycle` trừ `okrTrail`) bằng đúng hằng `QUAN_HE_GIU_CHU_KY`, và với MỖI quan hệ trong tập một chu kỳ chỉ có dữ liệu ở quan hệ đó (hôm nay sáu: mục tiêu đã bỏ, lần hỏi ý, quý con đã ẩn, đợt rà, điểm KR, mang sang tới), cùng một chu kỳ trống ở «Đang chạy», When quản trị gọi `okr.goChuKy` trên từng cái, Then chu kỳ trống biến khỏi `okrCycle`, `okrTrail` có một dòng `go-chu-ky` mang bản chụp tên, loại, ngày và pha, và dòng `tao-chu-ky` cũ của nó vẫn đọc được; And mọi chu kỳ có dữ liệu bị từ chối với câu ghim (không lỗi khoá ngoại, không 500), `okrCycle` và mọi bảng con đọc lại không đổi; And hằng lệch lược đồ thì bài đỏ nêu tên quan hệ thiếu.
- AC-5: Given chu kỳ quý có dữ liệu, When quản trị gọi `okr.anChuKy` không lý do, lý do 9 ký tự, lý do 10 ký tự; rồi `okr.hienChuKy`; và trên các ca biên — chu kỳ trống, chu kỳ đã ẩn, năm còn một quý chưa ẩn, hiện lại quý khi năm cha đã ẩn, hiện lại quý khi đã có quý chưa ẩn chồng ngày cùng năm, Then lý do dưới 10 ký tự bị từ chối; lý do 10 ký tự đặt `anLuc`, pha giữ nguyên, một dòng vết `an-chu-ky` với lý do ở `note`; hiện lại đưa `anLuc` về rỗng, pha giữ nguyên, một dòng vết `hien-chu-ky`; mọi ca biên bị từ chối với câu ghim (năm còn quý nêu số quý, hiện lại chồng nêu tên quý chồng) và bản ghi không đổi; And bốn cặp chạy đồng thời (bài giữ thủ tục thứ nhất sau khi khoá) — ẩn năm N ∥ hiện quý của N, hiện quý K ∥ hiện quý L chồng ngày, ẩn chu kỳ ∥ tạo mục tiêu vào nó, gỡ chu kỳ trống ∥ tạo mục tiêu vào nó — cho đúng một bên thành công, bên kia từ chối với câu ghim (không 500, không lỗi khoá ngoại) — trừ khi lượt tạo mục tiêu đến trước lượt ẩn: khi đó cả hai hợp lệ, vì mục tiêu có trước rồi chu kỳ mới ẩn — và đọc lại thấy luật không vỡ: không năm ẩn nào có quý hiện, không hai quý hiện chồng ngày, không mục tiêu nào được tạo sau lúc chu kỳ của nó bị ẩn, không mục tiêu nào trỏ tới chu kỳ đã gỡ.
- AC-6: Given bốn vai workspace, When thành viên thường và vai «chỉ OKR» gọi `suaChuKy`, `goChuKy`, `anChuKy`, `hienChuKy` qua tRPC và qua khoá API, Then cả bốn bị từ chối theo vai quản trị và bản ghi không đổi; And ma trận phạm vi `vai-chi-okr` tự dò đủ bốn thủ tục mới và vẫn xanh.
- AC-7: Given quý A đã ẩn, pha «Đang chạy», phủ hôm nay, và quý B chưa ẩn, pha «Lập kế hoạch», cũng phủ hôm nay, cùng năm; và một năm đã ẩn, When gọi `okr.cycles`, `okr.createCycle` một quý chồng ngày quý A, và `createCycle` một quý thuộc năm đã ẩn, Then `currentId` là B (không bao giờ là một chu kỳ đã ẩn; chỉ còn chu kỳ đã ẩn thì `null`); quý chồng quý A tạo được; quý thuộc năm đã ẩn bị từ chối với câu ghim.
- AC-8: Given một chu kỳ đang chạy đã ẩn có mục tiêu đã công bố, KR nguồn máy, KR của một người sắp rời, lần hỏi ý đang mở, và một chu kỳ đang chạy chưa ẩn có dữ liệu y hệt, When gọi MỌI thủ tục mutation của router `okr` (tự dò từ router, mỗi thủ tục một dòng trong bảng ca viết trước hoặc một dòng miễn có lý do) nhắm vào chu kỳ đã ẩn hay bản ghi con của nó, và chạy từng nơi tự tìm chu kỳ trong `rang/noi-doc-chu-ky.json` — `mangSang` từ kỳ trước cùng loại, cập nhật tuần của tôi, nhắc buổi sáng (cập nhật tuần, liên quan OKR, chờ duyệt, Hỏi ý), chụp số hằng ngày, chuyển việc khi người rời, đích và cây căn chỉnh, OKR còn mở của đơn vị, Then mọi ghi vào chu kỳ đã ẩn bị từ chối với câu ghim và bản ghi không đổi, cùng lệnh trên chu kỳ chưa ẩn thì được; thủ tục mutation mới mà thiếu dòng thì bài đỏ nêu tên; `mangSang` chọn kỳ kế chưa ẩn; mọi danh sách, nhắc, bản chụp và việc chuyển chỉ chứa dòng của chu kỳ chưa ẩn — so theo id, không đếm; And cùng bộ gieo khi chu kỳ được hiện lại thì các dòng của nó quay lại. (cross-layer)
- AC-9: Given danh sách viết trước `rang/noi-doc-chu-ky.json` (mỗi dòng `tệp` + `hàm`, nhóm «lọc» hoặc «miễn» kèm lý do) và mã của `apps/api/src`, `packages/db/src`, `apps/agent/agent`, When chạy bài soi mã `rang/soi-ma.mjs --ca ky-con-hien`, Then tập (tệp, hàm) có truy vấn đọc chu kỳ không theo id — điều kiện `cycle: {` kể cả lồng qua bảng con, `cycleId: { in`, lọc theo `startsOn`/`endsOn`, `okrCycle.findMany/findFirst/count/groupBy`, `$queryRaw` có `okrCycle` — BẰNG tập khai báo (so tập, không so số); mọi chỗ nhóm «lọc» có `KY_CON_HIEN` trong cùng điều kiện; And một bản sao thiếu `KY_CON_HIEN` ở một chỗ «lọc», một tệp giả tìm kỳ theo `endsOn`, và một tệp giả đọc qua `okrKeyResult` với `objective: { cycle: … }` đều làm bài đỏ, nêu tệp và hàm.
- AC-10: Given `okr.cycles` trả một chu kỳ đã ẩn, When khu OKR dựng ô chọn kỳ, giải `?kyOkr=<id đã ẩn>`, và chọn kỳ mặc định tab Hỏi ý, Then ô chọn không có chu kỳ đã ẩn; id đã ẩn rơi về `currentId`; kỳ mặc định Hỏi ý bỏ qua chu kỳ đã ẩn ở «Lập kế hoạch»; And ô «Thuộc năm» của sheet «Mở chu kỳ» không có năm đã ẩn.
- AC-11: Given quản trị ở Cài đặt › Chương trình OKR trong trình duyệt thật của cây đang xét, có năm chu kỳ gieo (trống lập kế hoạch, có dữ liệu đang chạy, năm còn quý hiện, đã đóng, đã ẩn), When mở menu «…» của từng hàng; sửa mọi ô của chu kỳ trống; sửa tên chu kỳ có dữ liệu; gỡ chu kỳ trống; ẩn chu kỳ có dữ liệu (ô lý do trống rồi đủ); hiện lại; và đăng nhập thành viên thường, Then menu từng hàng đúng các mục của `viec` (năm còn quý: «Ẩn chu kỳ» tắt kèm «Còn <n> quý đang hiện»); sheet sửa chỉ bật ô tên khi có dữ liệu, kèm dòng giải thích; gỡ hỏi lại bằng hộp tông huỷ; ẩn tắt nút tới khi đủ lý do; sau mỗi việc bảng cập nhật và cơ sở dữ liệu đọc lại đúng như thao tác; hàng đã ẩn ở cuối với nhãn «Đã ẩn» và menu chỉ «Hiện lại»; ô chọn kỳ ở khu OKR không có chu kỳ vừa ẩn; thành viên thấy nút «…» tắt kèm dòng giải thích; ảnh 390 và 1440 không tràn ngang. (cross-layer)
- AC-12: Given các tệp lượt này thêm hoặc sửa, When chạy cổng thiết kế tĩnh, bộ quét «Dấu hiệu vẽ tay» và soi mã, Then không vi phạm P0; không dấu hiệu vẽ tay trong `apps/app`; nút Huỷ của hộp mới bọc `DialogClose`/`SheetClose`; không chú thích mã mới, không `Record<string, unknown>`, không `useEffect` trần trong tệp mới; `viecChuKy`, `suaChuKyInput` và `KY_CON_HIEN` mỗi thứ định nghĩa đúng một chỗ; chữ mới có vi và en khác nhau; `docs/api.md` và `CONTEXT.md` có luật sửa, gỡ, ẩn. (judgment)
- AC-13: Given cơ sở dữ liệu có OKR từ trước lượt này, When chạy `migration` của lượt này, Then nó chỉ có `ALTER TABLE "okrCycle" ADD COLUMN "anLuc"` (cột rỗng được, không mặc định khác rỗng) và chỉ mục nếu có; không `UPDATE`, `DELETE`, `DROP`, `ALTER COLUMN`; mọi chu kỳ cũ đọc lại có `anLuc` rỗng và mọi bảng OKR cũ giữ số dòng.

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — việc:** sửa mọi ô · sửa tên · gỡ · ẩn · hiện lại  [thước CE: năm việc của thiết kế đã duyệt 30/09; NGÀNH: Perdoo edit/archive/delete cadence] → AC-1, AC-2, AC-3, AC-4, AC-5, AC-11
- **Trục B — tình trạng:** trống lập kế hoạch · trống pha khác · có dữ liệu · đã đóng · đã ẩn  [thước CE: sáu quan hệ trỏ tới `OkrCycle` + `PHA_CHU_KY`] → AC-1, AC-2, AC-3, AC-4, AC-5
- **Trục C — người gọi:** quản trị · thành viên · vai «chỉ OKR»  [thước CE: `assertQuanTri`, `vai-chi-okr.spec.ts`] → AC-6, AC-11
- **Trục D — nơi đọc chu kỳ:** ô chọn và kỳ mặc định · Hỏi ý · quý chồng · mang sang · nhắc · cập nhật tuần · chụp số · chuyển việc · ghi mới  [thước CE: `rang/noi-doc-chu-ky.json` — 15 chỗ lọc, 6 chỗ miễn, quét năm mẫu ngày 30/09; bài soi mã so tập] → AC-7, AC-8, AC-9, AC-10
- Cross-cutting: vết cho mọi việc (AC-2…AC-5); khoá hàng `FOR UPDATE` (design doc «API»); màn đọc cờ máy chủ (AC-1, AC-11); vi/en, `translate="no"`, 390/1440 (AC-11, AC-12); migration chỉ thêm (AC-13).
- [GIẢ ĐỊNH] Đọc theo id (sheet mục tiêu, «Theo đơn vị» với `cycleId` truyền vào) không lọc chu kỳ ẩn — dữ liệu vẫn tra được bằng đường dẫn cũ, chỉ không ghi.
- [GIẢ ĐỊNH] Ẩn không được với chu kỳ trống (trống thì gỡ); năm còn quý chưa ẩn thì không ẩn được, không có ẩn dây chuyền.
- [GIẢ ĐỊNH] Sửa tên được ở mọi pha trừ «Đã đóng»; đổi loại và năm cha không có — sai thì gỡ hoặc ẩn rồi tạo lại.
- [GIẢ ĐỊNH] Lý do ẩn dùng khuôn `lyDo` của «Mở lại kỳ» (10–500 ký tự); hiện lại không cần lý do.
- [GIẢ ĐỊNH] Chu kỳ đã ẩn vẫn ở bảng Cài đặt (cuối bảng); không ở ô chọn kỳ của khu OKR.
- [GIẢ ĐỊNH] Nhận finding Nhóm 2 của design-pass: thêm `disabled` vào `DatePicker` của `packages/ui` để sheet «chỉ sửa tên» tắt ô ngày bằng chính ô chọn ngày (bản mẫu tạm dùng `Input` tắt).

## Out of scope

- **Lùi pha** — lượt 7 đã chốt chỉ có «Mở lại kỳ».
- **Sửa ngày khi đã có dữ liệu** — kỳ vọng theo ngày, bản chụp số và điểm đã tính theo ngày cũ.
- **Xoá chu kỳ có dữ liệu** — vết phải sống (`d-20260925T033813Z-12`); khác Perdoo có chủ ý.
- **Ẩn năm kéo theo quý, chuyển mục tiêu từ chu kỳ nhầm sang chu kỳ đúng, bộ lọc «hiện chu kỳ đã ẩn» ở khu OKR** — Later trong `coverage-scan.md`.
- **Dọn chu kỳ nhầm đang có trên production** — chủ kho làm bằng chính màn này sau khi gộp.

> Rationale từng mục: `decisions.jsonl`.

## Notes

- Luật đã đọc: `AGENTS.md`, `docs/api.md` (mục OKR: khoá pha, vết, quyền, `vai-chi-okr`), `docs/design.md` (kể cả «Vẽ tay là bậc cuối»), `docs/settings.md` (Tạo mới và hỏi lại, Trạng thái), `docs/proto.md`, `CONTEXT.md` «Chu kỳ»; skill `web-design-guidelines` (xác nhận trước thao tác phá, lỗi nêu cách sửa, trạng thái trên URL); hồ sơ `dat-okr-trong-crm`, `khep-ky-okr`.
- Hạng T3: chạm `packages/db/prisma` (một cột). Có Cổng 1.5.
- Hồ sơ đã ký có thể phải ghim lại: `dat-okr-trong-crm` (bảng chu kỳ, `okr.cycles` thêm trường), `khep-ky-okr` (`mangSang` bỏ kỳ ẩn; menu chu kỳ), `vai-chi-okr` (bốn thủ tục mới), `dot-hoi-y-tuong-okr` (kỳ mặc định Hỏi ý, nhắc Hỏi ý), `so-okr-tu-chay` (chụp số).
- Không có `opportunity.md` (vòng mở từ phản hồi thử trên production, không qua Cổng Đáng) — không section «Đường đo», không phiên nghiệm thu.
