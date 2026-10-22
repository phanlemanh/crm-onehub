---
schema_version: 1
feature: "Nhân viên quan hệ đối tác mở được tệp trong bản ghi mình phụ trách, và khi đổi người phụ trách thì quyền đi theo người mới"
slug: tep-theo-chu-ban-ghi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: approved
approved_by: manh
approved_at: 2026-10-22T01:00:24Z
design_doc: docs/superpowers/specs/2026-10-22-tep-theo-chu-ban-ghi-design.md
---

# Acceptance Contract: tep-theo-chu-ban-ghi

## Context

Hàng DA20 của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511), mã phạm vi F2. Chủ kho duyệt Cổng
Đáng (build) ngày 20/10/2026 («Tôi duyệt Cổng Đáng build cho cả 9 hàng»), ghi vào ô ngày 21/10. Mốc đợt 2026-10-22.
Hạng T3: luật quyền mới ở `packages/auth`.

Soạn trên giấy theo luật 45 của đợt: mã chỉ viết sau khi DA19 `truong-tep` (#532) gộp onehub, rồi hàng này gộp onehub vào
nhánh. Mọi thủ tục, khuôn và chữ của ô Tệp nhắc dưới đây (`fieldFiles.downloadUrl`, `fieldFiles.remove`, `byId` ›
`tepTheoTruong`, `TepTrongO`, `coTheMo`, `coTheXoa`, `coTheMoTep`) là của DA19, theo thiết kế và kế hoạch đã duyệt trên
`feat/truong-tep` (`89cb431c1`).

Hôm nay (onehub `33ddf1b02` cộng DA19 đã duyệt):

- Chỉ quản trị (`owner`, `admin`) mở được tệp; nhân viên phụ trách bản ghi cũng bị từ chối.
- Không đường đọc nào của API xét người phụ trách (`ownerId`) của người gọi.
- `Deal.ownerId` bắt buộc; `Company.ownerId`, `Contact.ownerId` có thể trống.
- Người phụ trách đổi qua `*.update` (phiếu, REST `PATCH`) và `*.bulkAssignOwner`; không đường nào khác đổi người phụ
  trách của bản ghi có sẵn (design doc mục 2).

Source input: `opportunity.md` · câu giao và ghi chú DA20 · `docs/plan/pham-vi-truong-hop-dong.md` (F2) ·
`docs/design.md` mục «Trường» › «Tệp» · `docs/api.md` mục «One organization» («Permissions come from `@crm/auth`») ·
thiết kế, hợp đồng và sổ quyết định DA19 · LUAT.md của đợt (luật 1–3, 7, 30–35, 45) · design doc.

## Criteria

- AC-1 (cross-layer): Given một thoả thuận, một công ty, một cá nhân, mỗi loại có trường Tệp với một tệp, và bốn người ở
  bảng thành viên: quản trị Q, nhân viên A, nhân viên B, vai «chỉ OKR» O, When mỗi người gọi `downloadUrl` và đọc `byId`
  trên bản ghi do A phụ trách, do Q phụ trách, và (công ty, cá nhân) không có người phụ trách, Then:
  - Q nhận URL ở mọi bản ghi;
  - A nhận URL ở bản ghi mình phụ trách; ở bản ghi người khác phụ trách và bản ghi không có người phụ trách nhận
    `FORBIDDEN`, câu trả lời không mang URL;
  - B nhận `FORBIDDEN` ở bản ghi A phụ trách;
  - O bị từ chối ngoài phạm vi ở mọi bản ghi, kể cả khi O được đặt làm người phụ trách;
  - `coTheMo` và `lyDoKhongMo` của mỗi tệp trong `byId` khớp đúng kết quả `downloadUrl` của cùng người, cùng bản ghi
    (`khong-phu-trach` khi có người phụ trách khác, `chua-co-phu-trach` khi không có ai, `null` khi mở được);
  - luật mở là một hàm duy nhất ở `@crm/auth`, và `downloadUrl` lẫn cờ `byId` đều gọi nó.
- AC-2 (cross-layer): Given tệp trên ba loại bản ghi do A phụ trách, When người phụ trách đổi từ A sang B qua từng đường:
  `deals.update`, `companies.update`, `contacts.update`, REST `PATCH /deals/{id}`, và `bulkAssignOwner` của ba loại; rồi
  công ty và cá nhân gỡ người phụ trách về trống; rồi đặt lại cho A, Then:
  - ngay lời gọi kế sau mỗi lần đổi: B nhận URL, A nhận `FORBIDDEN`; cờ `byId` của A và B đổi theo;
  - gỡ về trống: chỉ Q mở được, A và B nhận `FORBIDDEN`, `lyDoKhongMo` của họ là `chua-co-phu-trach`;
  - đặt lại cho A: A mở được lại;
  - không bảng hay hàng cấp quyền nào được ghi khi đổi: số hàng của mọi bảng ngoài bản ghi vừa sửa không đổi.
- AC-3 (cross-layer): Given A không phụ trách một thoả thuận có tệp, và A phụ trách công ty của thoả thuận ấy, When A đọc
  bản ghi, danh sách, bảng cột, tải tệp lên thoả thuận ấy, và xin mở tệp của cá nhân thuộc công ty ấy (cá nhân không có
  người phụ trách), Then:
  - A vẫn thấy tên, cỡ, số tệp trong `byId`, `list`, `deals.board` như DA19, và tải lên được;
  - A không mở được tệp của thoả thuận hay cá nhân ấy: người phụ trách công ty không được tính cho bản ghi khác;
  - một khoá API của A theo đúng luật của A;
  - A tải một tệp lên thoả thuận ấy rồi xin mở chính tệp đó: nhận `FORBIDDEN`, `byId` trả `coTheMo` false và
    `lyDoKhongMo` `khong-phu-trach` — người tải không được tính là người mở được;
  - một người đã bị gỡ khỏi nhóm mà vẫn là người phụ trách nhận `NOT_A_MEMBER` ở mọi thủ tục `fieldFiles.*`.
- AC-4 (cross-layer): Given một ô có ba tệp do A, B và Q tải lên, trên bản ghi do A phụ trách, When Q, A, B lần lượt xoá
  theo luật Hỏi-2, Then:
  - người được xoá xoá được, theo đúng đường xoá của DA19 (hàng mất, Blob vào hàng chờ xoá, dòng log);
  - người không được xoá nhận `FORBIDDEN`, tệp còn nguyên, và `coTheXoa` của họ cho tệp ấy là `false` trong `byId`;
  - nếu lối Hỏi-2 đã duyệt có vế người phụ trách: sau khi đổi người phụ trách sang B, `coTheXoa` và kết quả `remove`
    đi theo người mới như AC-2; lối không có vế ấy thì đổi người phụ trách không đổi quyền xoá.
- AC-5 (cross-layer): Given ô Tệp trên phiếu Thoả thuận, Công ty và Cá nhân nhận `tepTheoTruong` từ `byId` của loại ấy,
  When dựng ô với mỗi giá trị `lyDoKhongMo` và khi `downloadUrl` trả `FORBIDDEN` cho một tệp màn đang hiện «Mở» bật,
  Then, ở cả ba loại:
  - `khong-phu-trach`: «Mở» khoá, dòng «Chỉ <tên người phụ trách> và quản trị mở được tệp.», tên mang `translate="no"`;
  - `chua-co-phu-trach`: «Mở» khoá, dòng «Bản ghi chưa có người phụ trách nên chỉ quản trị mở được tệp.»;
  - `null`: «Mở» bật, không dòng lý do;
  - nút khoá có `aria-describedby` trỏ dòng lý do;
  - `FORBIDDEN` khi mở: lời báo «Bạn không còn phụ trách bản ghi này nên không mở được tệp.», `byId` của đúng loại bản
    ghi ấy được tải lại, không tab nào mở;
  - mã ô Tệp không tự so vai hay so id người phụ trách với người dùng.
- AC-6: Given mỗi lần gọi `downloadUrl` ở AC-1, When đọc log của API, Then:
  - lần mở được có một dòng `Field file opened` mang `tepId`, `fieldId`, id bản ghi, `userId`, `role`, `laPhuTrach`;
    `laPhuTrach` so thẳng `ownerId` của hàng bản ghi với `userId`, không suy từ kết quả của luật mở;
  - lần bị từ chối có một dòng `Field file open refused` mang cùng các khoá và `lyDo`;
  - không dòng nào chứa URL hay chữ ký của Blob;
  - dấu CHẾT của Đường đo đếm được từ các dòng ấy, và đếm đúng số lần mở sai người khi luật mở bị làm hỏng.
- AC-7: Given phiếu Thoả thuận có trường Tệp với hai PDF, ở 1280 và 375, với Q, A (phụ trách) và B, When mỗi người mở
  phiếu; Q đổi ô «Phụ trách» từ A sang B trên phiếu; A bấm «Mở» trên phiếu mở từ trước khi đổi; B tải lại và mở; rồi một
  cá nhân do A phụ trách và một công ty không có người phụ trách, Then:
  - A mở được tệp ở tab mới trước khi đổi; B thấy «Mở» khoá kèm «Chỉ <tên A> và quản trị mở được tệp.»;
  - sau khi đổi: A nhận lời báo mất quyền và nút khoá; B mở được;
  - cá nhân do A phụ trách: A mở được, B thấy dòng nêu tên A;
  - công ty không có người phụ trách: nhân viên thấy dòng «Bản ghi chưa có người phụ trách…»;
  - không cuộn ngang ở 375; dòng lý do đọc được bằng trình đọc màn.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`), preset `entity-feature`. Bốn trục:

- người gọi so với bản ghi: quản trị · nhân viên phụ trách · nhân viên không phụ trách · người đã tải tệp mà không phụ
  trách · vai «chỉ OKR» là người phụ trách · người đã rời nhóm vẫn mang `ownerId` · khoá API;
- trạng thái người phụ trách: là người gọi · người khác · chưa có · vừa đổi · vừa gỡ về trống;
- việc trên tệp: thấy tên và số · mở · cờ trong `byId` · xoá · tải lên · URL đã cấp trước lúc đổi;
- đường đổi người phụ trách: `*.update` (phiếu, REST) · `*.bulkAssignOwner` · tự tạo (chỉ lúc tạo) · Kara (không có) ·
  gỡ thành viên (không đổi `ownerId`).

Thước CE:

- bốn vai [SUY-TỪ-REPO: packages/validation/src/vai-workspace.ts];
- người phụ trách ba loại bản ghi [SUY-TỪ-REPO: packages/db/prisma/schema.prisma];
- bản ghi không có chủ thì chỉ quản trị [SUY-TỪ-REPO: docs/plan/lo-trinh-viec-du-an.json DA20; docs/design.md mục «Trường»];
- quyền đến từ `@crm/auth`, service và màn cùng dùng [SUY-TỪ-REPO: docs/api.md mục «One organization»];
- đường đổi người phụ trách [SUY-TỪ-REPO: apps/api/src/deals/deals.service.ts, companies.service.ts, contacts.service.ts,
  workspace.service.ts — soát mã 22/10, design doc mục 2];
- quyền tệp đi theo quyền bản ghi, không chép [NGÀNH: Salesforce Files «Set by Record»];
- quyền theo chủ bản ghi, nhóm riêng cho bản ghi không chủ [NGÀNH: HubSpot «Their records», «Unassigned»].

Ánh xạ Core sang AC: luật mở → AC-1; đi theo khi đổi → AC-2; phạm vi hẹp của luật → AC-3; xoá → AC-4; màn → AC-5, AC-7;
vết → AC-6. Later và Never ở `coverage-scan.md`.

## Đường đo

Ô Cổng Đáng để trống ngưỡng; máy đề xuất (Hỏi-5 của design doc):

- Thước: ở phiên nghiệm thu, ít nhất bốn trên năm nhân viên mở được hợp đồng của thoả thuận mình phụ trách mà không hỏi,
  và sau một lần đổi người phụ trách người mới mở được ngay · số từ: phiên nghiệm thu sau khi lên production (đếm tay) ·
  bảo đảm bởi: AC-1, AC-2, AC-7
- Thước: không lần mở nào bởi người không phải quản trị và không phụ trách bản ghi lúc mở (dấu CHẾT) · số từ: dòng log
  `Field file opened` có `laPhuTrach=false` và `role` không phải `owner`, `admin` · bảo đảm bởi: AC-6

Ngưỡng đã duyệt ở Cổng Phạm vi (Hỏi-5) được chép vào mục «Ngưỡng chết / ngưỡng UAT» của `opportunity.md` ngay sau khi
duyệt — câu hỏi phép đo, SỐNG, CHẾT, timebox — bốn trường quyết định của ô giữ nguyên; một dòng sổ trỏ tới lần chép ấy.

## Out of scope

- Giới hạn xem hay sửa bản ghi theo người phụ trách; mọi quyền theo bản ghi ngoài việc mở và xoá tệp.
- Nhóm, đội cùng phụ trách; người theo dõi; chia sẻ một tệp cho một người cụ thể.
- Cá nhân hay thoả thuận lấy người phụ trách của công ty.
- Thu hồi URL tải về đã cấp trước lúc đổi người phụ trách (theo khuyến nghị Hỏi-1).
- Câu lý do riêng khi người phụ trách đã rời nhóm; chặn gán người đã rời nhóm làm người phụ trách.
- Kara đọc tệp theo quyền người đang chat (DA23).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Không migration, không biến môi trường mới. Lùi được bằng cách trả `quyenMoTep` về luật «chỉ quản trị».
- Ba câu của `docs/vong-doi.md` không áp: hàng không thêm loại bản ghi hay trạng thái kết thúc. Luật xoá đổi theo Hỏi-2.
- Known limits (theo khuyến nghị Hỏi-1, Hỏi-4): URL tải về đã cấp trước lúc đổi người phụ trách còn dùng được tới hết hạn 300
  giây của DA19; người phụ trách đã rời nhóm vẫn được nêu tên trong dòng lý do.
- Vùng chung: `apps/app/lib/messages/crm.ts` sửa đúng dòng lý do DA19 thêm và thêm dòng mới; `_acceptance/config.yaml`
  chỉ thêm dòng (luật 7). `fields/**` và `record-sheet/**` là vùng của đợt (luật 31).
- Bài cũ của DA19 (`ttp-quyen`, `ttp-o-tep`) giữ xanh: fixture của chúng do quản trị phụ trách, và chữ lý do đọc từ bảng
  chữ. Bước đối chiếu bằng mắt của E10 DA19 nêu câu «Chỉ quản trị mở được tệp.» — kế hoạch S2 đổi bước ấy theo câu mới.
