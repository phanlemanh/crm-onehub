---
schema_version: 1
feature: Trang chưa có bản đề xuất mở được — một luật «ai thấy trang» cho danh sách, màn đọc và «trang nhắc tới»; màn đọc nói trang đang chờ gì theo nguồn và chỉ lối viết tay
slug: trang-chua-de-xuat-mo-duoc
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-29T09:58:59Z
design_doc: docs/superpowers/specs/2026-09-29-trang-chua-de-xuat-mo-duoc-design.md
---

# Acceptance Contract: trang-chua-de-xuat-mo-duoc

## Context

Sự việc 2026-09-29 trên production: chủ kho (vai `owner`) thấy «Chính sách nhân viên» ở danh sách
Kho tài liệu, bấm vào thì gặp trang 404. Danh sách lọc bằng `dieuKienThay`
(`packages/db/src/tai-lieu-quyen.ts`); màn đọc và `nhacToi` dùng `thayTrang`
(`apps/api/src/tai-lieu/quyen.ts`), hàm này trả `false` với mọi người khi trang không có bản đề
xuất nào — đúng tình trạng của trang vừa tạo bằng «Tải nguồn lên» mà máy soạn chưa xong, lỗi, hay
nguồn cần gõ tay. Lượt này đưa màn đọc và `nhacToi` về chung một luật với danh sách, thêm người tạo
trang vào luật (lời hứa «người tạo» của `kho-tai-lieu` AC-3), và cho màn đọc nói trang đang chờ gì.

## Criteria

- AC-1: Given ma trận viết trước gồm sáu người (người tạo trang — cũng là người tải nguồn, chủ trang, `owner`, `admin`, thành viên khác, vai `okr`) × sáu trạng thái trang (đã duyệt · chờ duyệt lần đầu · máy đang soạn, chưa có bản đề xuất · cần gõ tay · máy chưa soạn được · bản đầu bị trả lại), trong đó ba trang có nguồn được tạo qua `taiLieuNguon.nhan` với người tải là người tạo và chủ trang là người khác, When mỗi người gọi `taiLieu.list`, `taiLieu.get` và `taiLieu.nhacToi` cho từng trang, Then `owner`, `admin` và chủ trang thấy cả sáu trang; And người tạo thấy cả sáu trang; And thành viên khác và vai `okr` chỉ thấy trang đã duyệt; And với mỗi người, tập trang `list` trả về bằng đúng tập trang `get` mở được và bằng tập trang `nhacToi` không trả `NOT_FOUND`. (cross-layer)
- AC-2: Given cùng ma trận của AC-1, When mỗi người gọi `taiLieuNguon.list` và `taiLieu.tim` với một từ có trong trang đã duyệt, Then mọi trang đích của mọi dòng nguồn người đó thấy, và mọi kết quả tìm của người đó, đều mở được bằng `taiLieu.get` của chính người đó; And ngược lại, mỗi trang mà `taiLieu.get` của người đó trả `choLanDau.nguon` khác `null` thì nguồn đó có trong `taiLieuNguon.list` của chính người đó — người không thấy nguồn nhận `nguon: null` và màn không có «Xem nguồn». (cross-layer)
- AC-3: Given một trang chưa có bản mà người gọi không được thấy và một slug không có trang nào, When người đó gọi `taiLieu.get` và `taiLieu.nhacToi` cho cả hai, Then hai lời đáp giống hệt nhau về mã (`NOT_FOUND`) và thông điệp; And danh sách không nhắc tới trang đó.
- AC-4: Given trang chưa có bản đang dùng ở từng trạng thái — còn bản chờ duyệt · nguồn mới nhất ở chờ đọc, chờ soạn, đang soạn · nguồn cần gõ tay · nguồn máy chưa soạn được có lý do · bản đầu bị trả lại và không còn bản chờ · không nguồn không bản đề xuất — When chủ trang gọi `taiLieu.get`, Then `choLanDau.dangCho` lần lượt là `duyet` · `may-soan` · `go-tay` · `loi` · `tra-lai` · `chua-co-ban`; And khi trang mang nhiều dấu hiệu cùng lúc thì theo thứ tự: còn bản chờ duyệt đứng trước mọi thứ, rồi đến trạng thái nguồn mới nhất (chờ đọc, chờ soạn, đang soạn, cần gõ tay, chưa soạn được), rồi bản bị trả lại — trang có bản bị trả lại mà nguồn mới hơn đang soạn lại báo `may-soan`, nguồn đã soạn xong cùng bản bị trả lại báo `tra-lai`; And `choLanDau.nguon` mang mã, tên tệp và lý do của nguồn mới nhất khi trang có nguồn, `null` khi không; And trang có bản đang dùng trả `choLanDau: null` như cũ. (cross-layer)
- AC-5: Given màn đọc của trang chưa có bản với mỗi giá trị `dangCho`, When màn hiện, Then khung trạng thái mang đúng tiêu đề và lời trong `apps/app/lib/messages/tai-lieu.ts` cho giá trị đó, lời có tên chủ trang và tên tệp nguồn khi có; And `may-soan` có nút «Xem nguồn» dẫn tới tab Nguồn tại dòng của nguồn đó; `go-tay` và `loi` có «Viết tay» và «Xem nguồn», `loi` hiện lý do; `tra-lai` và `chua-co-ban` có «Viết tay»; `duyet` giữ lời «Đang chờ … duyệt» và không có «Viết tay»; And tên chủ trang và tên tệp không bị trình duyệt dịch.
- AC-6: Given một trang chưa có bản và không còn bản chờ duyệt, When chủ trang (hoặc người tạo) mở «Viết tay», gõ nội dung và gửi duyệt, Then màn sửa mở trình soạn với nội dung gốc rỗng thay vì chuyển về màn đọc; And một bản đề xuất được ghi với bản gốc rỗng (`banGocId` null); And bấm «Gửi duyệt» trên màn sửa đưa người viết về màn đọc, màn báo đang chờ chủ trang duyệt mà không phải tải lại. (cross-layer)
- AC-7: Given bản chạy thật trong một phiên đo với một trang máy đang soạn và một trang cần gõ tay, When `owner` mở danh sách Kho và bấm dòng trang máy đang soạn, rồi mở trang cần gõ tay và bấm «Viết tay», Then màn đọc mở (không 404) với khung «Máy đang soạn»; And trang cần gõ tay mở trình soạn trống; And ở khổ 390, với tên tệp và lý do dài không dấu cách, màn đọc của cả bốn trạng thái máy đang soạn, cần gõ tay, máy chưa soạn được, bản đầu bị trả lại không cuộn ngang. (cross-layer)
- AC-8: Given các tệp giao diện lượt này chạm, When chạy sàn thiết kế tĩnh, Then không có màu, góc hay khoảng cách tự đặt ngoài `packages/ui`.
- AC-9: Given ảnh chụp màn đọc ở các trạng thái máy đang soạn, cần gõ tay, máy chưa soạn được, bản đầu bị trả lại ở khổ 390 và 1440, When người duyệt xem, Then một nhân viên văn phòng hiểu trang đang chờ gì và mình làm gì tiếp mà không cần giải thích, chữ theo từ điển (`CONTEXT.md`). (judgment)

## Coverage

Quét bằng `morphological-scan` (preset test-matrix, chất vấn trục) ở phiên 2026-09-29. Chân sản
phẩm: đào kho. Chân ngành: OWASP ASVS 4.0 mục V4 «Access Control» — một luật truy cập áp như nhau
ở mọi điểm vào, và từ chối không để lộ tài nguyên có tồn tại.

- Trục A — người xem: người tạo (= người tải nguồn trang mới) · chủ trang · `owner` · `admin` · thành viên khác · vai `okr` (AC-1, AC-2, AC-3). [SUY-TỪ-REPO: `apps/api/test/tai-lieu-san.ts`, `packages/db/src/tai-lieu-quyen.ts`] [thước CE: ma trận AC-3 của `_acceptance/kho-tai-lieu/contract.md`, AC-12 của `_acceptance/may-soan-de-xuat/contract.md`]
- Trục B — trạng thái trang: đã duyệt · chờ duyệt lần đầu · máy đang soạn · cần gõ tay · máy chưa soạn được · bản đầu bị trả lại · không nguồn không bản (AC-1, AC-4, AC-5). [SUY-TỪ-REPO: `packages/validation/src/tai-lieu-nguon.ts` (`TRANG_THAI_NGUON`), `TRANG_THAI_DE_XUAT`]
- Trục C — điểm vào tới trang: danh sách · màn đọc · «trang nhắc tới» · dòng tab Nguồn · ⌘K và `tim` · màn sửa (AC-1, AC-2, AC-6, AC-7). [SUY-TỪ-REPO: `apps/app/app/(app)/[slug]/tai-lieu/bang-nguon.tsx`, `apps/app/components/crm/quick-switcher.tsx`] [NGÀNH: OWASP ASVS V4 — mọi điểm vào cùng một luật]
- Không gian A × B × C = 252 ô; phủ bằng một phép đo quan hệ (AC-1 đủ A × B trên ba điểm vào đọc, AC-2 nối hai điểm vào dẫn tới trang) thay vì từng ô — lời hứa là quan hệ «thấy ở đây thì mở được ở kia».
- Cross-cutting: không thấy = không tồn tại (AC-3); chữ người nhập không dịch (AC-5); khổ 390 (AC-7).
- Later: `boLoc`, `sucKhoe`, `dangDung` nhận vế người tạo qua cùng hàm `dieuKienThay` — không đo riêng lượt này; tự làm mới màn khi máy soạn xong.
- Never: sửa luật thấy bản đề xuất hay luật thấy nguồn — chúng đúng, chỉ luật thấy trang lệch.
- Quyết định chủ kho 2026-09-29 (trả lời câu hỏi khi duyệt thiết kế): người tạo trang — kể cả người tải nguồn chọn người khác làm chủ trang — thấy trang chưa có bản của mình trong danh sách và mở được nó (sổ `d-20260929T095300Z-2`).

## Out of scope

- Trang 404 mặc định tiếng Anh của Next khi đường dẫn không có trang — việc riêng (`not-found.tsx` tiếng Việt cho vùng ứng dụng).
- Tự làm mới màn đọc khi máy soạn xong; người xem tải lại trang để thấy bản chờ duyệt.
- Đổi `dieuKienThayDeXuat` (ai thấy bản đề xuất) hay `dieuKienThayNguon` (ai thấy nguồn).
- Nút «Soạn lại» trên màn đọc — nó đã sống ở tab Nguồn; màn đọc chỉ dẫn tới đó.

## Notes

- Không migration: vế người tạo đọc cột `TaiLieuTrang.taoBoiId` đã có. Chạm `packages/db/prisma` giữa chừng thì lượt nâng T3.
- `thayTrang` bị xoá khỏi `apps/api/src/tai-lieu/quyen.ts`; `get` và `nhacToi` lọc bằng `dieuKienThay` trong truy vấn, như `propose`.
- `taiLieu.get` đổi khuôn `choLanDau` (thêm `dangCho`, `nguon`) — màn đọc là nơi đọc duy nhất.
- Hồ sơ đã ký có thước chạm `apps/api/src/tai-lieu/**` hay `apps/app/app/(app)/[slug]/tai-lieu/**` (`kho-tai-lieu`, `may-soan-de-xuat`, `tim-va-dieu-huong-kho` …) phải còn xanh; kiểm bằng `pre-merge-check` không `--slug` trước khi đẩy.
- Từ điển: lint W6 báo «trạng thái», «chờ duyệt», «kết quả» là chữ tránh của mục khác (Loại giai đoạn, Được phép vào, Số chốt). Ở hợp đồng này chúng mang nghĩa của Kho tài liệu (trạng thái nguồn và trang, bản chờ duyệt, kết quả tìm) — trùng chữ khác nghĩa, giữ như `kho-tai-lieu` và `tim-va-dieu-huong-kho`.
