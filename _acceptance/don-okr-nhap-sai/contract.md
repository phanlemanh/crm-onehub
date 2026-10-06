---
schema_version: 1
feature: Dọn được OKR nhập sai — mục tiêu chưa có lịch sử xoá được, mục tiêu đã bỏ ẩn khỏi danh sách mặc định và trông khác nháp, mục tiêu bỏ nhầm dùng lại được về Nháp; xoá vĩnh viễn thoả thuận, cá nhân, công ty chỉ được sau lưu trữ, lưu trữ lại giữ ngày đầu
slug: don-okr-nhap-sai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: draft
design_doc: docs/superpowers/specs/2026-10-07-don-okr-nhap-sai-design.md
---

# Acceptance Contract: don-okr-nhap-sai

## Context

Chủ kho dùng OKR «Theo đơn vị» trên production và thấy: mục tiêu nhập sai không xoá
được, chỉ bỏ được; danh sách mặc định hiện cả mục tiêu đã bỏ; nhãn «Đã bỏ» trông như
«Nháp». Đợt rà 15 loại bản ghi ngày 07/10 trên onehub `73bb599` xác nhận cả ba và thấy
thêm lỗ xoá vĩnh viễn bản ghi bán hàng chưa lưu trữ. Chủ kho duyệt chuẩn
`docs/vong-doi.md` và thiết kế lượt này cùng ngày, gồm năm điểm máy chọn sẵn.

Source input: design doc · `docs/vong-doi.md` · `CONTEXT.md` «Lưu trữ» · `docs/api.md`
«Deleting a record is archive first, purge later» và «OKR» · trang rà
`https://claude.ai/artifact/2Ucr6GWydao8aLpiagxyqW` · lời chủ kho trong phiên 07/10.

Từ dùng dưới đây: **có lịch sử** và **sạch** theo mục «Lịch sử của một mục tiêu» của
design doc; **người sửa được** = `assertSuaMucTieu` cho qua; **chu kỳ nhận ghi** =
`assertKyGhiDuoc` cho qua.

## Criteria

- **AC-1** — Given một mục tiêu nháp sạch có KR, việc, nguồn số, người tham gia, người
  theo dõi, người xem, căn chỉnh đi ra và dấu tạo từ mẫu, người sửa được, chu kỳ nhận
  ghi; When gọi `okr.xoaMucTieu`; Then mục tiêu và mọi dòng đi theo biến mất, `okrTrail`
  có đúng một dòng `xoa-muc-tieu` mang `objectiveId` cũ và `before` đủ tên, cấp, đơn
  vị, trạng thái, số KR; mọi dòng vết cũ của mục tiêu và mọi `OkrDeXuat` của nó còn
  nguyên.
- **AC-2** — Given mỗi loại lịch sử một mục tiêu (đã công bố; mỗi quan hệ lịch sử của
  mục tiêu; mỗi quan hệ lịch sử của KR) và một mục tiêu chờ duyệt; When gọi
  `okr.xoaMucTieu`; Then mỗi ca trả 400 với thông điệp gọi tên lý do (chờ duyệt: rút về
  Nháp trước), và mục tiêu cùng mọi bảng con đọc lại không đổi, `okrTrail` không thêm
  dòng; kể cả khi một lần cập nhật tuần đang giữ khoá hàng KR lúc `xoaMucTieu` được gọi
  — lời xoá chờ, rồi trả 400 và cả mục tiêu lẫn dòng cập nhật mới đều còn.
- **AC-3** — Given mô hình dữ liệu lúc chạy của Prisma; When so mọi trường quan hệ của
  `OkrObjective` và `OkrKeyResult` với hai cặp danh sách lịch sử / đi theo; Then mỗi
  quan hệ nằm đúng một danh sách, và một quan hệ thiếu làm bài đỏ gọi tên nó.
- **AC-4** — Given ma trận trạng thái (nháp sạch, nháp có lịch sử, chờ duyệt, đã công
  bố, đã bỏ chưa từng công bố, đã bỏ từng công bố) × người sửa được hay không × chu kỳ
  nhận ghi hay không; When đọc `okr.objective` và gọi `xoaMucTieu`, `dungLaiMucTieu`;
  Then `quyen.xoa` đúng khi và chỉ khi `xoaMucTieu` thành công, `quyen.dungLai` đúng khi
  và chỉ khi `dungLaiMucTieu` thành công, ở mọi ô.
- **AC-5** — Given người không sửa được đơn vị, vai «chỉ OKR», chu kỳ đã khoá và chu
  kỳ đã ẩn; When gọi hai thủ tục mới; Then bị từ chối với đúng lỗi các thủ tục ghi mục
  tiêu khác đang trả, không ghi gì; và ma trận thủ tục của vai «chỉ OKR» cùng bảng thủ
  tục ghi của chu kỳ ẩn có hai thủ tục mới.
- **AC-6** — Given một mục tiêu đã bỏ (từng công bố và chưa từng) trong chu kỳ nhận
  ghi; When gọi `okr.dungLaiMucTieu`; Then trạng thái về `nhap`, `droppedAt` null,
  `publishedAt` giữ nguyên, vết `dung-lai` một dòng; vượt trần số mục tiêu thì chế độ
  «chặn» trả 400 không ghi, chế độ «cảnh báo» ghi và trả `canhBao`; mục tiêu chưa bỏ
  trả 400 không ghi.
- **AC-7** (cross-layer) — Given một đơn vị có mục tiêu đang dùng và đã bỏ khác người
  phụ trách, loại, và một mục tiêu hạn chế người gọi không xem được; When gọi
  `okr.danhSach` và `okr.mine` không lọc trạng thái, rồi có lọc phụ trách, rồi lọc trạng
  thái «Đã bỏ»; Then không lọc trạng thái: `rows` không có mục tiêu đã bỏ, `daBo` đúng
  tập mục tiêu đã bỏ khớp các lọc còn lại và xem được, mặt «Trạng thái» vẫn đếm «Đã bỏ»;
  lọc «Đã bỏ»: `rows` chỉ có mục tiêu đã bỏ, `daBo` rỗng.
- **AC-8** (cross-layer) — Given «Theo đơn vị» của đơn vị có mục tiêu đã bỏ; When mở
  trang; Then danh sách chính không có mục tiêu đã bỏ, cuối danh sách có dòng gập «Đã bỏ
  (n)» đóng với n bằng số mục tiêu đã bỏ, đếm trên đầu thẻ chỉ đếm mục tiêu đang dùng;
  mở dòng gập thì thấy các mục tiêu đã bỏ; đơn vị không có mục tiêu đã bỏ thì không có
  dòng gập; đơn vị chỉ có mục tiêu đã bỏ thì có trạng thái rỗng và dòng gập.
- **AC-9** (cross-layer) — Given «Của tôi» với mục tiêu đã bỏ của người xem; When mở
  trang; Then như AC-8: danh sách chính không có, dòng gập «Đã bỏ (n)» đóng ở cuối với n
  bằng số mục tiêu đã bỏ của người đó, mở ra thấy.
- **AC-10** — Given một mục tiêu đã bỏ và một mục tiêu nháp hiện cạnh nhau; When nhìn
  hai khối; Then nhãn trạng thái của hai khối khác biến thể, khối đã bỏ không có thanh
  tiến độ và mang dấu đã bỏ, chữ «Đã bỏ» có trên khối.
- **AC-11** (cross-layer) — Given ngăn chi tiết của nháp sạch, nháp có lịch sử, đã công
  bố, đã bỏ sạch, đã bỏ có lịch sử; When mở menu «…»; Then nháp sạch có «Xoá mục tiêu»
  mà không có «Bỏ mục tiêu»; có lịch sử chưa bỏ thì ngược lại; đã bỏ có nút «Dùng lại»
  và có «Xoá mục tiêu» khi sạch. Chọn «Xoá mục tiêu» mở hộp hỏi lại có tên và số KR;
  xác nhận thì ngăn đóng, toast «Đã xoá mục tiêu» và mục tiêu rời danh sách; máy chủ từ
  chối thì toast đúng thông điệp và ngăn ở lại.
- **AC-12** (cross-layer) — Given một thoả thuận, một cá nhân, một công ty chưa lưu trữ;
  When gọi `purge` qua tRPC và qua REST `DELETE`, và `bulkPurge` với một id chưa lưu trữ
  lẫn một id đã lưu trữ; Then `purge` trả 400 thông điệp ghim và bản ghi còn; kết quả lô
  báo lỗi đúng id chưa lưu trữ, id đã lưu trữ bị xoá; lịch dọn với `guard` chạy như cũ.
- **AC-13** — Given một thoả thuận, một cá nhân, một công ty đã lưu trữ ngày D; When gọi
  `archive` và `bulkArchive` lần nữa; Then `archivedAt` vẫn là D và lời gọi trả tên như
  cũ; khôi phục rồi lưu trữ thì `archivedAt` là ngày mới.
- **AC-14** — Given `CONTEXT.md`, `docs/api.md` và các tệp chữ; When soi sau lượt này;
  Then từ điển có mục cho Xoá, Đã lưu trữ, Xoá vĩnh viễn, Bỏ · Dùng lại cạnh mục «Lưu
  trữ»; `docs/api.md` mô tả `xoaMucTieu`, `dungLaiMucTieu`, `daBo` và luật xoá vĩnh viễn
  chỉ sau lưu trữ; mọi chữ mới trên màn có bản vi và en khác nhau và dùng đúng bộ chữ.
- **AC-15** (judgment) — Given diff của lượt và ảnh màn; When người chấm đọc; Then «có
  lịch sử» có đúng một nguồn mà cả nút lẫn thủ tục đọc, đầu vào mới parse ở biên, màn
  dựng bằng thành phần `packages/ui`, và chữ trên màn nói rõ hệ quả: xoá thì mất hẳn,
  vết còn; dùng lại thì toast đúng câu chốt ở design doc theo hai nhánh có hay không
  bước duyệt.

## Coverage

Quét bằng `morphological-scan`; bản đầy đủ ở mục «Độ phủ» của design doc.

- **Trục A — bản ghi:** mục tiêu OKR · KR (nguồn lịch sử) · thoả thuận, cá nhân, công
  ty  [thước CE: `docs/vong-doi.md` lượt 1] → AC-1…AC-13
- **Trục B — việc:** xoá · bỏ · dùng lại · lưu trữ · xoá vĩnh viễn · hiện trong danh
  sách  [thước CE: thiết kế đã duyệt 07/10; NGÀNH: HubSpot «Restore deleted records»,
  Lattice «Delete a goal»] → AC-1, AC-6, AC-7…AC-9, AC-11…AC-13
- **Trục C — tình trạng:** nháp sạch · nháp có lịch sử · chờ duyệt · đã công bố · đã bỏ
  chưa công bố · đã bỏ từng công bố; đang dùng · đã lưu trữ  [thước CE:
  `TRANG_THAI_MUC_TIEU`, quan hệ của `OkrObjective`/`OkrKeyResult`] → AC-2, AC-3, AC-4,
  AC-12, AC-13
- **Trục D — đường vào:** ngăn chi tiết · Theo đơn vị · Của tôi · tRPC/REST trực tiếp ·
  theo lô · lịch dọn  [thước CE: router `okr`, `deals`, `contacts`, `companies`] →
  AC-5, AC-7…AC-9, AC-11, AC-12
- Cross-cutting: quyền và pha (AC-4, AC-5); vết (AC-1, AC-6); trần mục tiêu (AC-6);
  mục tiêu hạn chế (AC-7); khoá hàng khi cập nhật tuần chen giữa (AC-2);
  vi/en và bộ chữ (AC-14).
- [GIẢ ĐỊNH] Nháp sạch không có «Bỏ mục tiêu» trong menu — chỉ «Xoá».
- [GIẢ ĐỊNH] «Dùng lại» không hỏi lại vì đảo được bằng «Bỏ».
- [GIẢ ĐỊNH] `OkrDeXuat` và vết ở lại sau khi xoá; dấu tạo từ mẫu đi theo mục tiêu.
- [GIẢ ĐỊNH] Ba màn khác có mục tiêu (cây căn chỉnh, họp tuần, chấm điểm) không đổi
  lượt này.

## Out of scope

- Lượt 2, lượt 3 của `docs/vong-doi.md`: bộ chữ trên các màn khác, Hoàn tác khi lưu
  trữ bán hàng, dải báo bản ghi đã lưu trữ, Kanban, tác nhân, giai đoạn, chiến dịch, kế
  hoạch 30 ngày.
- Tài liệu (lượt 3b của lộ trình Kho tài liệu).
- Xoá nhiều mục tiêu một lúc; Hoàn tác sau khi xoá mục tiêu; thùng rác cho mục tiêu.
- Công cụ xoá hay dùng lại mục tiêu cho Kara.

## Notes
