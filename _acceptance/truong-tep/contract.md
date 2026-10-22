---
schema_version: 1
feature: "Nhân viên quan hệ đối tác gắn tệp hợp đồng vào ô Tệp trên phiếu thoả thuận, công ty hay liên hệ, và lọc được bản ghi nào chưa có"
slug: truong-tep
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: signed-off
approved_by: manh
approved_at: 2026-10-21T22:32:36Z
design_doc: docs/superpowers/specs/2026-10-21-truong-tep-design.md
---

# Acceptance Contract: truong-tep

## Context

Hàng DA19 của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511), mã phạm vi F1. Chủ kho duyệt Cổng
Đáng (build) ngày 20/10/2026 («Tôi duyệt Cổng Đáng build cho cả 9 hàng»), ghi vào ô ngày 21/10. Mốc đợt 2026-10-22.
Hạng T3: thêm giá trị enum `FILE` và hai bảng ở `packages/db/prisma`.

Soạn trên giấy theo luật 44 của đợt: mã chỉ viết sau khi DA18 `loc-moi-truong` (#526) gộp onehub, rồi hàng này gộp
onehub vào nhánh. Lọc «Có tệp / Chưa có tệp» đứng trên bảng lọc theo kiểu và cách mã hoá `field:<khoá>=<giá trị>` của
DA18.

Hôm nay trên onehub `110a07377`:

- Bản ghi CRM không giữ được tệp nào; hợp đồng nằm ngoài CRM.
- Giá trị trường là một hàng một cột mỗi trường × bản ghi (`FieldValue`), không chứa được nhiều tệp.
- `coerceValue` nhận chuỗi cho mọi kiểu không có nhánh riêng (`default` → `text`), nên một kiểu mới không chặn thì
  `*.update` và Kara ghi chữ vào nó.
- Chỉ Kho tài liệu tải tệp lên Blob riêng tư (`blob-nguon.ts`); không đường xoá bản ghi nào xoá Blob.

Quyền tạm của hàng (ghi chú hàng, `docs/design.md` mục «Trường» › «Tệp»): ai đọc được dữ liệu đối tác thấy tên và số
tệp; chỉ quản trị (`owner`, `admin`) mở hay tải về. Quyền theo chủ bản ghi là DA20.

Source input: `opportunity.md` · câu giao và ghi chú DA19 · `docs/plan/pham-vi-truong-hop-dong.md` (F1) ·
`docs/design.md` mục «Trường» · `docs/vong-doi.md` · `docs/api.md` mục «Kho tài liệu: nguồn» và «Deleting a record» ·
thiết kế DA18 · LUAT.md của đợt (luật 1–2, 7, 30–31, 35, 44) · design doc.

## Criteria

- AC-1 (cross-layer): Given quản trị ở Cài đặt › Trường của Thoả thuận, Công ty và Cá nhân, When tạo một trường kiểu
  «Tệp», sửa nó, và thử đổi kiểu một trường Tệp đã có tệp, Then:
  - `fields.create` lưu trường `type: FILE` cho cả ba loại bản ghi, và `fields.list` trả nó;
  - ô chọn kiểu có «Tệp»; khi kiểu là Tệp, form không có «Kara điền» và lời dặn Kara, còn «Hiện trên phiếu», «Hiện trong
    bảng», «Hiện trong bộ lọc» như mọi kiểu;
  - đổi kiểu một trường Tệp đã có ít nhất một tệp bị từ chối như trường đã có giá trị, kiểu không đổi;
  - nhân viên không phải quản trị không tạo được trường, như hôm nay.
- AC-2 (cross-layer): Given một thoả thuận, một công ty, một cá nhân, mỗi loại có trường Tệp bật «Hiện trên phiếu» và
  «Hiện trong bảng», When nhân viên tải lên một PDF, một DOCX, một PNG và một JPEG qua `requestUpload` → PUT lên URL đã ký
  → `complete`, Then:
  - mỗi tệp thành một hàng `FieldFile` đúng trường và đúng bản ghi, mang tên, kiểu nhận theo byte, cỡ, `sha256` do máy
    chủ tính, người tải và lúc tải;
  - `byId` của bản ghi trả `tepTheoTruong[<khoá>]` gồm đủ bốn tệp theo thứ tự tải;
  - `list` của loại bản ghi và `deals.board` trả `soTepTheoTruong[<khoá>] = 4` cho bản ghi ấy và `0` cho bản ghi chưa có
    tệp;
  - byte không đi qua API: `requestUpload` trả URL PUT của kho Blob, không phải đường của API;
  - trên kho Blob riêng tư thật (khoá xin qua `can-nguoi` R3-1): tệp tải lên đọc lại được qua URL đã ký với đúng
    `sha256`, đường dẫn trần không đọc được, và xoá rồi thì đọc lại không còn.
- AC-3 (cross-layer): Given một ô Tệp có sẵn một PDF, When tải lên một tệp mỗi ca từ chối sau, Then mỗi ca bị từ chối
  với lời tiếng Việt nêu cách sửa, không hàng `FieldFile` nào được ghi, và Blob đã PUT của ca ấy bị xoá:
  - đuôi `.pdf` mà byte không phải PDF (kiểu nhận theo byte, không theo tên);
  - kiểu ngoài PDF, DOCX, PNG, JPEG;
  - quá 20 MB, hoặc 0 byte; byte thật quá 20 MB dù cỡ khai ở `requestUpload` nhỏ hơn;
  - DOCX chứa macro (`word/vbaProject.bin`);
  - ô đã đủ trần số tệp (Hỏi-5);
  - phiếu giả, phiếu của ô khác, phiếu hết hạn, pathname đã thuộc một tệp khác;
  - bản ghi đã lưu trữ; trường đã lưu trữ; trường thuộc loại bản ghi khác; trường không phải kiểu Tệp;
  - và ca trùng: đúng byte của PDF đã có trong cùng ô trả `{ trung: true, tepId }` của hàng cũ, Blob mới bị xoá, ô vẫn
    một tệp; cùng byte ấy ở một bản ghi khác thì được nhận.
- AC-4 (cross-layer): Given một ô có tệp, When quản trị, nhân viên (`member`) và người vai «chỉ OKR» đọc bản ghi và xin
  mở tệp, Then:
  - quản trị và nhân viên đều thấy tên, cỡ, số tệp;
  - chỉ quản trị nhận URL tải về từ `downloadUrl`, URL hết hạn sau không quá 300 giây;
  - nhân viên nhận `FORBIDDEN`, không có URL nào trong câu trả lời;
  - vai «chỉ OKR» bị từ chối ở mọi thủ tục `fieldFiles.*` và không thấy tệp qua `byId`;
  - mỗi tệp trong `byId` mang `coTheMo` và `coTheXoa` do máy chủ tính cho người đang gọi; luật mở tệp là một hàm duy
    nhất ở máy chủ, và màn khoá «Mở», ẩn «Xoá» bằng đúng hai cờ ấy.
- AC-5 (cross-layer): Given Thoả thuận, Công ty, Cá nhân có trường Tệp bật «Hiện trong bộ lọc», với bản ghi có tệp, bản ghi
  chưa từng có tệp và bản ghi đã xoá hết tệp, When gọi `list` của ba loại và `deals.board` với `fields: {<khoá>:
  ["some"]}`, `["none"]`, `["some", "none"]`, lưu bộ lọc «chưa có» thành bộ lọc đã lưu, và dùng bộ lọc Cá nhân ấy làm đoạn
  chiến dịch, Then:
  - `some` trả đúng bản ghi có ít nhất một tệp; `none` trả đúng bản ghi không có tệp nào, gồm bản ghi đã xoá hết tệp;
  - hai giá trị cùng nhau trả mọi bản ghi;
  - `facetCounts` có số đếm cho `some` và `none`, mỗi số bằng `total` khi lọc riêng giá trị ấy cùng các bộ lọc khác;
  - đường dẫn mang `field:<khoá>=none`, cùng cách mã hoá của DA18; bộ lọc đã lưu giữ khuôn `SavedViewFilters`;
  - số thành viên chiến dịch bằng `total` của `contacts.list` cùng bộ lọc;
  - giá trị khác `some`, `none` trên trường Tệp: `BAD_REQUEST` nêu tên trường, như giá trị hỏng của DA18.
- AC-6 (cross-layer): Given một ô có hai tệp do hai người tải lên, When người dùng xoá một tệp theo luật của Hỏi-1 và
  Hỏi-2, Then:
  - người được xoá thấy hộp hỏi lại nêu tên tệp; xác nhận thì hàng `FieldFile` mất, Blob của nó bị xoá, ô còn một tệp;
  - người không được xoá nhận `FORBIDDEN`, `coTheXoa` của tệp ấy là `false` trong `byId`, và nút «Xoá» không có trên dòng
    tệp ấy;
  - một dòng log `Field file removed` mang `fieldId`, id bản ghi, `tepId`, `userId`;
  - bản ghi đã lưu trữ thì xoá bị từ chối, như tải lên;
  - xoá Blob hỏng thì hàng vẫn mất, đường dẫn nằm trong `BlobChoXoa`, và lượt dọn kế tiếp xoá nó.
- AC-7 (cross-layer): Given ba loại bản ghi có tệp, một trường Tệp có tệp, và kho Blob giả đếm lượt xoá, When lưu trữ rồi
  khôi phục một bản ghi, xoá vĩnh viễn một bản ghi bằng tay, bằng `bulkPurge` và bằng lịch dọn `purgeExpired`, lưu trữ
  trường, xoá trường, và bỏ dở một lượt tải sau khi PUT, Then:
  - lưu trữ và khôi phục không đổi tệp nào;
  - mỗi đường xoá vĩnh viễn và xoá trường làm mất mọi hàng `FieldFile` liên quan, ghi đúng các đường dẫn ấy vào
    `BlobChoXoa` trong cùng giao dịch, và sau commit xoá đúng các Blob ấy, không Blob nào khác;
  - giao dịch lùi thì không Blob nào bị xoá và `BlobChoXoa` không có hàng mới;
  - Blob xoá hỏng: xoá vĩnh viễn vẫn thành công, lỗi ghi log không ném, hàng `BlobChoXoa` còn với `lanThu` tăng, và lịch
    dọn hằng ngày xoá nó khi Blob trả lời lại;
  - lưu trữ trường giữ tệp, khôi phục trường thì tệp hiện lại.
  - tệp đã PUT mà không `complete`: trước hạn phiếu lượt dọn không đụng nó; sau hạn phiếu lượt dọn xoá Blob và hàng chờ;
    tệp đã `complete` không còn hàng chờ nào.
- AC-8 (cross-layer): Given `TEP_BAN_GHI_BLOB_TOKEN` vắng hay chỉ có khoảng trắng, trong khi `KHO_TAI_LIEU_BLOB_TOKEN` và
  `BLOB_READ_WRITE_TOKEN` có giá trị, When gọi `status`, `requestUpload`, `complete`, `downloadUrl`, `remove`, đọc bản ghi có
  tệp, và mở phiếu, Then:
  - `status` trả `{ bat: false }`; `requestUpload`, `complete`, `downloadUrl` trả `PRECONDITION_FAILED` với lời tiếng
    Việt; API khởi động và mọi thủ tục khác chạy như thường;
  - tên và số tệp đã có vẫn đọc được; `remove` xoá hàng và để đường dẫn trong `BlobChoXoa`;
  - không yêu cầu nào tới Blob mang khoá của Kho tài liệu hay kho logo — ở cả lúc có khoá (mọi yêu cầu mang đúng
    `Bearer` của khoá tệp) lẫn lúc vắng;
  - biến có ở `.env.example` kèm ghi chú, ở `env.validation.ts` và `turbo.json` của API;
  - Kho tài liệu chạy y như trước: theo Hỏi-7, không tệp nào của nó đổi và bốn bộ bài của nó xanh nguyên văn.
- AC-9 (cross-layer): Given một trường Tệp, When ghi một chuỗi, số hay `null` vào nó qua `companies.update`,
  `contacts.update`, `deals.update` và qua công cụ `set_field_value` của Kara, sort danh sách theo `field:<khoá Tệp>`, và
  mở form tạo bản ghi, Then:
  - mọi lối ghi bị từ chối bằng «Ô Tệp chỉ nhận tệp tải lên.», không hàng `FieldValue` nào cho trường ấy, tệp của ô không
    đổi;
  - sort theo trường Tệp bị bỏ như khoá không sắp được của DA17, không lỗi;
  - form tạo và ô thêm nhanh theo Hỏi-6 (khuyến nghị: không có ô Tệp, lệch có chủ ý ghi ở Known limits);
  - mọi bảng theo kiểu (`COLUMNS`, sort, lọc, `KIEU_TRUONG`, `TYPE_KEY`) có dòng `FILE`, và mọi `switch` trên kiểu trường
    có nhánh `FILE` tường minh.
- AC-10: Given phiếu Thoả thuận có trường Tệp, ở 1280 và 375, với ba vai, When người kéo hai PDF vào ô, chọn một tệp sai
  kiểu, xoá một tệp, mở danh sách và lọc «Chưa có tệp», rồi xem cùng phiếu khi thiếu khoá và khi bản ghi đã lưu trữ, Then:
  - mỗi tệp hiện «Đang tải lên…» rồi thành một dòng có tên (cắt dòng, đủ tên khi trỏ chuột), cỡ, ngày, người tải;
  - tệp sai kiểu báo lỗi tiếng Việt trên đúng dòng của nó, tệp khác vẫn tải;
  - nhân viên thấy «Mở» khoá và dòng «Chỉ quản trị mở được tệp.»; quản trị mở được tệp ở tab mới;
  - xoá hỏi lại nêu tên tệp; bảng hiện «n tệp» hay «—»; menu Bộ lọc có «Có tệp (n)», «Chưa có tệp (n)»;
  - thiếu khoá: vùng tải và «Mở» khoá kèm lý do; bản ghi đã lưu trữ: ô chỉ đọc;
  - không cuộn ngang ở 375; mọi nút có tên đọc được bằng trình đọc màn.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`), preset `entity-feature`. Bốn trục:

- vòng đời tệp: tải một · tải nhiều · trùng · bị từ chối · xem tên và số · mở · xoá khỏi ô · bản ghi lưu trữ · bản ghi
  xoá vĩnh viễn (tay, lô, lịch dọn) · trường lưu trữ · trường xoá;
- người × quyền: quản trị · nhân viên · vai «chỉ OKR» · người cầm URL lọt · Kara · lệnh nạp mẫu (DA22);
- mặt: Cài đặt › Trường · phiếu ba loại · ô bảng · thẻ bảng cột · form tạo · bộ lọc và số đếm · bộ lọc đã lưu và chiến
  dịch · sort · lối ghi chữ;
- hạ tầng: khoá có · khoá thiếu · xoá Blob hỏng · Blob giả theo hợp đồng · Blob riêng tư thật.

Thước CE:

- sáu mặt của bảng kiểu và dòng «Tệp» [SUY-TỪ-REPO: docs/design.md mục «Trường»];
- ghi chú hàng: nhiều tệp, PDF DOCX ảnh, ký trước, quyền tạm, purgeExpired xoá kèm Blob
  [SUY-TỪ-REPO: docs/plan/lo-trinh-viec-du-an.json DA19];
- chuỗi tải lên và luật thiếu khoá [SUY-TỪ-REPO: docs/api.md mục «Kho tài liệu: nguồn»];
- vòng đời [SUY-TỪ-REPO: docs/vong-doi.md; docs/api.md mục «Deleting a record is archive first, purge later»];
- vai [SUY-TỪ-REPO: packages/validation/src/vai-workspace.ts];
- mã hoá bộ lọc [SUY-TỪ-REPO: docs/superpowers/specs/2026-10-21-loc-moi-truong-design.md, nhánh feat/loc-moi-truong];
- kiểu Tệp gắn vào bản ghi, tối đa 10 tệp mỗi thuộc tính [NGÀNH: HubSpot CRM «File» property].

Ánh xạ Core sang AC: tạo trường → AC-1; tải lên → AC-2; từ chối và trùng → AC-3; quyền → AC-4; lọc → AC-5; xoá tệp →
AC-6; vòng đời bản ghi và trường → AC-7; khoá → AC-8; lối ghi chữ, sort, form tạo, bảng kiểu → AC-9; mắt người → AC-10.
Lệnh nạp mẫu (DA22) đi đường của AC-2 và AC-3 (tệp trùng trả hàng cũ, nên chạy lại không nhân đôi). Later và Never ở
`coverage-scan.md`.

## Đường đo

Ô Cổng Đáng để trống ngưỡng; máy đề xuất (Hỏi-3 của design doc):

- Thước: ở phiên nghiệm thu, ít nhất bốn trên năm người gắn được một hợp đồng PDF vào thoả thuận và lọc ra thoả thuận
  chưa có hợp đồng mà không hỏi · số từ: phiên nghiệm thu sau khi lên production (đếm tay) · bảo đảm bởi: AC-2, AC-5,
  AC-10
- Thước: không tệp nào mở được bởi người không phải quản trị trước khi DA20 lên (dấu CHẾT) · số từ: dòng log
  `downloadUrl` mang `role` của người gọi (`LoggingMiddleware` in `role` mỗi dòng tRPC) · bảo đảm bởi: AC-4
- Thước: `BlobChoXoa` không còn hàng quá ba ngày trên production (dấu CHẾT) · số từ: `SELECT count(*) FROM
  "blobChoXoa" WHERE "xoaSau" < now() - interval '3 days'` · bảo đảm bởi: AC-7

## Out of scope

- Mở tệp theo chủ bản ghi, quyền đi theo khi đổi chủ (DA20).
- Kara đọc chữ trong tệp (DA23); Kara tạo trường Tệp.
- Bộ hợp đồng mẫu (DA22).
- Xem trước PDF trên phiếu; quét mã độc.
- Ô Tệp trong form tạo và ô thêm nhanh; «Bắt buộc» cho trường Tệp.
- Đổi tên tệp, sắp lại tệp trong ô, sort theo số tệp.
- HEIC, XLSX, ZIP.
- Mục «Đã lưu trữ» cho tệp trong ô (theo khuyến nghị Hỏi-1).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Ba câu của `docs/vong-doi.md` (design doc mục 7): dọn = Xoá tệp, hỏi lại một lần (Hỏi-1); «lịch sử» của một tệp: không
  có ở hàng này, nên Xoá chứ không Lưu trữ; danh sách: ô hiện mọi tệp, bản ghi đã lưu trữ tìm lại ở nút «Đã lưu trữ».
- Migration một tệp, tên theo giờ UTC thật lúc viết (luật 1), chỉ thêm. Giá trị enum `FILE` không gỡ được khỏi Postgres
  khi lùi; gỡ hai bảng là đủ để lùi phần dữ liệu.
- Kho Blob riêng tư mới, khoá `TEP_BAN_GHI_BLOB_TOKEN`, xin qua `can-nguoi` R3-1 trước S3. Không dùng
  `KHO_TAI_LIEU_BLOB_TOKEN` (luật 35).
- Theo khuyến nghị Hỏi-7, kho tệp viết riêng (`blob-tep-truong.ts`), không sửa tệp nào của Kho tài liệu; bài kiểm của
  Kho tài liệu là hàng rào hồi quy (E8b).
- Known limits (theo khuyến nghị Hỏi-6, Hỏi-8): form tạo và ô thêm nhanh chưa có ô Tệp — lệch có chủ ý so với bảng kiểu
  của `docs/design.md`, hạt giống mở sau khi DA16 gộp; tệp tải lên không quét mã độc.
- Vùng chung: `apps/app/lib/messages/crm.ts`, `.env.example`, `_acceptance/config.yaml` chỉ thêm dòng (luật 7).
  `fields/**` và `record-sheet/**` là vùng của đợt (luật 31). DA15 (Cài đặt › Trường) và DA16 (form tạo) chạy song song
  ở V1 và V3: hàng nào gộp sau thì gộp onehub và giữ dòng của cả hai.
- Không `cham-tep` mới cho `DataTable`: «Có tệp», «Chưa có tệp» dùng mặt lọc danh sách lựa chọn có sẵn.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-22:
  - Ngoài-1: trường Tệp tạo bằng đường khác ngoài màn Cài đặt vẫn bật được «Kara điền»; Kara xếp việc rồi bị từ chối khi ghi, chỉ tốn lượt chạy.
  - Ngoài-8: nhiều lượt tải lên cùng lúc vào một ô có thể vượt trần 10 tệp.
  - Ngoài-9: trường Tệp bật «Kara điền» qua API làm Kara xếp việc điền cho mọi bản ghi mà không ghi được gì.
  - Ngoài-12: bài kiểm quyền vai OKR đọc thoả thuận có một vế không bao giờ đỏ được.
  - Ngoài-13: bài kiểm vòng đời chỉ kiểm tệp mong đợi có trong tập đã xoá, không kiểm tập ấy đúng bằng.
  - Ngoài-14: bài kiểm lưu bộ lọc có thể xanh trên một bảng xem rỗng.
  - Ngoài-16: bài kiểm kho thật chỉ kiểm đường trần không trả 200, chưa từng thấy đỏ thật.
  - Ngoài-18: đối chứng dương của bài «kho tắt» chạy trên kho giả, không qua đường đọc khoá thật.
  - Ngoài-20: tệp DOCX mẫu của bài nhận kiểu là chuỗi chứa đúng chuỗi con bộ nhận tìm, không phải tệp zip thật.
  - t9 (trong hợp đồng, AC-3): tệp đặt đuôi lệch byte nhưng byte thuộc bốn kiểu vẫn được nhận và ghi kiểu theo byte; kho giữ kiểu khai theo tên nên «Mở» có thể hỏng với tệp như vậy.
