---
schema_version: 1
feature: "Việc riêng chỉ người trong cuộc thấy — cả trên Gantt và mọi màn dự án"
slug: viec-rieng-chi-nguoi-trong-cuoc
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui, docs]
status: verified
approved_by: manh
approved_at: 2026-10-19T10:56:38Z
design_doc: docs/superpowers/specs/2026-10-19-viec-rieng-chi-nguoi-trong-cuoc-design.md
---

# Acceptance Contract: viec-rieng-chi-nguoi-trong-cuoc

## Context

Hàng DA11 (sửa gấp). Chủ kho ký Cổng Đáng ngày 19/10/2026: «Đồng ý theo khuyến nghị — T1: sửa gấp». Gốc là mục T1
của lượt tự lái DA4 (`_acceptance/du-an-gantt/evidence/tu-lai/PHAN-TICH.md`).

Khung việc ghi «Việc riêng — chỉ người trong cuộc thấy» cho mọi việc không gắn bản ghi. Nhưng luật thấy việc đã ký ở
DA4 cho ai đọc được phạm vi đối tác thấy mọi việc trong dự án.

Chủ kho chọn nghĩa A ngày 19/10 («A · đếm: có»):

- Việc trong dự án là việc chung. Việc riêng là việc không gắn bản ghi và không thuộc dự án. Luật thấy việc giữ nguyên.
- Khung việc nói đúng ai thấy.
- Lịch sử việc che tiêu đề và mã của việc mà người xem không thấy. Đây là chỗ lộ thật, cùng họ DA2b.
- Có lệnh đếm chỉ đọc để chủ kho tự chạy trên production.

Source input: hồ sơ `opportunity.md` · mục «Việc», «Dự án» của `CONTEXT.md` · `docs/api.md` mục «Việc» · hồ sơ
`du-an-gantt` và `viec-cha-khong-lo-tieu-de` · design doc.

Người trong mọi tiêu chí:

- A: người giao, thành viên.
- B: người thực hiện, thành viên.
- W: người theo dõi.
- X: thành viên không dính tới việc.
- Q: quản trị không dính tới việc.
- O: vai `okr`.

## Criteria

- AC-1 (cross-layer): Given bốn việc do A giao cho B, W theo dõi, gồm:
  - V0: không gắn bản ghi, không dự án;
  - V1: trong dự án P, không gắn bản ghi;
  - V2: gắn thoả thuận D, không dự án;
  - V3: gắn D và trong P.

  When từng người A, B, W, X, Q, O gọi `viec.get` cho từng việc,
  Then 24 ô khớp đáp án viết sẵn:
  - A, B, W đọc được cả bốn việc;
  - X và Q đọc được V1, V2, V3; với V0 thì nhận 404 cùng lời như mã lạ;
  - O nhận lỗi ở cả bốn việc;
  - ở mọi ô đọc được, `aiThay` là `rieng` cho V0, `du-an` cho V1, `ban-ghi` cho V2 và V3.

  Và với mọi việc: `aiThay` = `rieng` khi và chỉ khi X nhận 404.
- AC-2: Given bốn việc của AC-1, When B mở khung việc của từng việc ở khổ 1280, Then:
  - V0: ô «Gắn với» và dòng dưới tiêu đề ghi «Việc riêng — chỉ người trong cuộc thấy»;
  - V1: ô «Gắn với» ghi «Việc trong dự án — mọi người xem được dự án đều thấy việc này», dòng dưới tiêu đề ghi tên P;
  - V2, V3: ô «Gắn với» là tên D bấm được sang D.

  Không khung nào ngoài V0 có chữ «Việc riêng». Khung V1 ở khổ 375 không làm trang cuộn ngang.
- AC-3 (cross-layer): Given việc riêng V0 của A, When A chọn «Dự án: P» trong khung V0, Then:
  - không phải đóng khung rồi mở, «Gắn với» đổi sang chữ của V1;
  - `viec.get` của X đọc được V0 với `aiThay` = `du-an`.

  When A bỏ V0 khỏi P, Then «Gắn với» trở lại «Việc riêng — chỉ người trong cuộc thấy», và X lại nhận 404.
- AC-4 (cross-layer): Given hai việc V và W trong P, V do A giao cho B, W do A giao cho Y, W phải chờ V (vết
  `them-phu-thuoc` trên W nhắc V), When A rút V khỏi P (vết `go-phu-thuoc` trên W nhắc V), Then:
  - X gọi `viec.lichSu` cho W: hai vết đó mang `viec: null`; JSON của cả đầu ra API không chứa tiêu đề hay mã của V;
  - B gọi `viec.lichSu` cho W: thấy đủ tiêu đề V ở cả hai vết.

  Đối chứng dương: trước khi rút, X thấy tiêu đề V trong lịch sử W.
- AC-5 (cross-layer): Given V và W trong P, W chờ V, V do A giao cho B, When B dời hạn V làm W tự dời (vết `doi-han`
  hay `doi-bat-dau` của W mang `boi` là V), rồi A rút V khỏi P, Then:
  - lịch sử W mà X đọc có `boi` = `null` ở mọi vết tự dời, và JSON không chứa tiêu đề hay mã của V;
  - B đọc thấy `boi` đầy đủ.

  Đối chứng dương: trước khi rút, X thấy tiêu đề V trong vết tự dời.
- AC-6 (cross-layer): Given việc riêng P0 do A giao cho B, W theo dõi, When B thêm việc con K cho C (W không theo dõi
  K), Then:
  - W gọi `viec.lichSu` cho P0: vết `them-viec-con` vẫn còn, mang `sau: null`, không chứa tiêu đề hay mã của K;
  - W gọi `viec.get` cho P0: đầu ra không chứa tiêu đề hay mã của K;
  - B thấy đủ.

  When K bị xoá, Then lịch sử P0 mà B đọc vẫn còn đúng một vết `them-viec-con`, mang `sau: null` (Hỏi-1).
- AC-7: Given dữ liệu của AC-4, When X mở thẻ «Lịch sử» trong khung W ở khổ 1280, Then:
  - hai dòng vết phụ thuộc ghi «một việc bạn không có quyền xem» thay cho tiêu đề V;
  - không dòng nào chứa tiêu đề V;
  - các dòng còn lại giữ nguyên.

  When B mở cùng thẻ, Then hai dòng đó ghi tiêu đề V.
- AC-8 (cross-layer): Given dự án P có hai việc đã có ngày, U và V; V bắt đầu sớm hơn và kết thúc muộn hơn U,
  When A rút V khỏi P, Then với X và với A, không câu đọc nào sau đây còn chứa tiêu đề hay mã của V:
  - `duAn.lich`, `duAn.get`, `duAn.list`;
  - `viec.cuaToi` ở phạm vi P và ở phạm vi «Tất cả dự án»;
  - `viec.bang` ở phạm vi P.

  Và `soViec` của P giảm đúng 1, khoảng ngày của P (`batDauSom`, `hanMuon`) bằng đúng khoảng của U.
  Đối chứng dương: trước khi rút, cả sáu câu của cả X và A đều có V, và khoảng ngày của P bằng khoảng của V.
- AC-9 (judgment): Given `CONTEXT.md` và `docs/api.md`, When đọc, Then:
  - `CONTEXT.md` mục «Việc» định nghĩa việc riêng là việc không gắn bản ghi và không thuộc dự án, không còn câu «việc
    không gắn gì là việc riêng»;
  - mục «Dự án» vẫn nói ai đọc được phạm vi đối tác thì thấy mọi việc trong dự án;
  - `docs/api.md` mục «Việc» nêu `aiThay` (ba giá trị) và luật che trong lịch sử (việc người xem không đọc được hay đã
    xoá thì vết không mang tiêu đề hay mã của nó).
- AC-10 (cross-layer): Given một kho thử dựng qua các hàm ghi thật, có:
  - dự án P với hai việc chung W1, W2 không gắn bản ghi, cùng chờ việc V;
  - V bị rút khỏi P nên thành việc riêng. Lịch sử W1 và W2 mỗi bên có đúng một vết `them-phu-thuoc` và một vết
    `go-phu-thuoc` nhắc V; số vết đọc lại từ `viecVet` trước khi chạy lệnh;
  - mồi không được đếm:
    - việc riêng R2 bị nhắc trong lịch sử một việc riêng R3 (R3 là việc cha của R2);
    - việc G gắn thoả thuận, trong P, bị nhắc trong lịch sử W1.

  When chạy `bun run viec:dem-rieng` với `DATABASE_URL` của kho đó, Then:
  - lệnh thoát 0 và in JSON `{"viecDuAnKhongGan":2,"vetNhacViecRieng":4,"viecRiengBiNhac":1}`;
  - số hàng của `viec`, `viecVet`, `viecPhuThuoc` không đổi.

  When thân `transaction` của lệnh thử chèn một hàng, Then Postgres từ chối vì `transaction` chỉ đọc, và lệnh thoát khác 0.
  When thiếu `DATABASE_URL`, Then lệnh thoát 2 với lời nêu biến thiếu.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`), preset `entity-feature`. Bốn trục:

- loại việc theo luật thấy: riêng · dự án không gắn · gắn bản ghi · gắn và trong dự án;
- người xem: giao · làm · theo dõi · thành viên khác · quản trị · `okr`;
- mặt lộ: khung · lịch sử · màn dự án · lệnh đếm;
- lúc đổi loại: vào dự án · rút ra · xoá việc được nhắc.

Thước CE:

- ba vế của `dieuKienXemViec` [SUY-TỪ-REPO: packages/db/src/viec.ts];
- bảng 5 người của `viec-quyen.spec` [SUY-TỪ-REPO: apps/api/test/viec-quyen.spec.ts];
- bản quét đường đọc 19/10;
- [NGÀNH: Asana — việc riêng tư chỉ người cộng tác thấy; Dataverse — bẫy lộ tên bản ghi] theo khảo sát
  [SUY-TỪ-REPO: docs/plan/viec-du-an-nghien-cuu/05-phan-quyen-va-muc-tieu.md].

Ánh xạ Core sang AC:

- khung → AC-1, AC-2, AC-3;
- lịch sử → AC-4 đến AC-7;
- màn dự án → AC-8;
- từ điển → AC-9;
- đếm → AC-10.

Later và Never ở `coverage-scan.md`.

## Đường đo

- Thước: phiên nghiệm thu — người không trong cuộc đi hết các màn, không thấy việc nào khung hứa là riêng · số từ: phiên nghiệm thu sau khi lên production (đếm tay) · bảo đảm bởi: AC-1, AC-2, AC-4, AC-8
- Thước: quy mô đã lộ trước bản sửa · số từ: `bun run viec:dem-rieng` chủ kho chạy trên production · bảo đảm bởi: AC-10

## Out of scope

- Lọc Gantt, danh sách và con số dự án theo người xem (lối B). Chủ kho bỏ ngày 19/10. Dự án có danh sách thành viên là
  một lượt riêng nếu cần.
- Sửa hay xoá vết đã lưu trong cơ sở dữ liệu. Phép che chỉ làm ở đầu ra.
- Lịch sử dự án (`DuAnVet`): chưa có màn nào đọc nó. Khi thêm bên đọc thì phải che như AC-4.
- Các câu lỗi và `daDoi` nhắc tiêu đề việc khác: theo luật A, mọi việc được nhắc đều cùng dự án và thấy được.
- Vai «chỉ OKR» dùng Việc: chưa mở ở lượt này.
- Vá DA4 Ngoài-3, Ngoài-8, Ngoài-9: hàng DA12.

## Notes

- Không đổi `packages/db/src/viec.ts` (T3) hay `packages/db/prisma`. Chạm tới thì nâng T3.
- Chiều đỏ trong lịch sử: commit bài kiểm đứng trước commit sửa, và bài kiểm phải đỏ trên onehub `0d9ef3183`.
- Giới hạn đã biết của E8: vế «màn dự án không còn V» đã đúng trên onehub, nên không có chiều đỏ trong lịch sử. Chiều
  đỏ là một đột biến tay lúc dựng (bỏ lọc `duAnId` ở `DuAnService.lich`), ghi vào sổ S3, không chạy lại trong làn máy.
- Lệnh đếm không có cờ ghi. Chủ kho chạy nó trên production, máy không vào production.
