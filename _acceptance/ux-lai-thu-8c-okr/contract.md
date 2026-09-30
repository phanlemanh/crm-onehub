---
schema_version: 1
feature: Sửa UX sau lái thử lượt 8c OKR — nhãn «Giới hạn» ở mọi danh sách mục tiêu, gỡ người báo trước OKR đang phụ trách, điều kiện chặn biết trước thì báo trước khi xác nhận, cây đơn vị đếm khớp khung, hộp gửi duyệt nêu người duyệt, người duyệt thấy lần trả lại trước, hạ «Công bố» sau khi trả lại, khung xương khi tải (lượt 8d)
slug: ux-lai-thu-8c-okr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: approved
approved_by: Manh Phan
approved_at: 2026-09-30T03:17:58Z
design_doc: docs/superpowers/specs/2026-09-30-ux-lai-thu-8c-okr-design.md
---

# Acceptance Contract: ux-lai-thu-8c-okr

## Context

Buổi lái thử lượt 8c ngày 30/09 trên app thật, với bộ OKR mẫu, cho thấy ba tính năng mới chạy
đúng nhưng người dùng vẫn bị bất ngờ: nội dung kín không có dấu ở danh sách, gỡ người sinh OKR
mồ côi mà không được báo, và bị từ chối sau khi đã xác nhận. Thêm năm chỗ luồng duyệt và cây
đơn vị lệch với điều người dùng thấy. Lượt này đưa luật máy chủ có sẵn ra trước mắt người
dùng: thêm trường vào đầu ra API và một truy vấn xem trước. Không bảng mới, không migration,
không đổi luật ghi nào.

Source input: báo cáo lái thử 30/09 (24 ảnh, 15 điểm UX) · câu giao của chủ kho ngày 30/09
(ba điểm Cao, năm điểm Vừa) · bốn lựa chọn thiết kế chủ kho duyệt cùng ngày ·
`_acceptance/gioi-han-duyet-cay-okr/contract.md` · `docs/plan/lo-trinh-okr.md` dòng 8d.

## Criteria

- AC-1: Given bộ OKR mẫu có mục tiêu giới hạn G (một người xem có tên V) và các mục tiêu công khai, When V, chủ G và một người không xem được đọc `okr.mine`, `okr.danhSach` (danh sách «Theo đơn vị»), `okr.byUnit`, `okr.alignmentTree` và (quản trị) `okr.moCoi` (Họp tuần không hiện mục tiêu giới hạn cho ai — luật số gộp của 8c — nên không nằm trong danh sách), Then mỗi mục trả về mang `hienThi` và `soNguoiXem`; số mục `gioi-han` ở từng ô danh sách × người bằng bảng viết trước; tập mục mang `hienThi: gioi-han` trong mỗi danh sách bằng đúng tập mục tiêu giới hạn người đó xem được có mặt trong danh sách ấy, và `soNguoiXem` bằng số hàng người xem của mục tiêu đó; người không xem được không nhận mục nào mang `gioi-han`.
- AC-2: Given dữ liệu danh sách có một mục tiêu giới hạn và một mục tiêu công khai, When Của tôi, Theo đơn vị, Cây căn chỉnh và OKR mồ côi vẽ thẻ mục tiêu, Then đúng thẻ giới hạn có nhãn khoá «Giới hạn» với gợi ý «Chỉ người liên quan và N người xem có tên thấy» (N = 0 dùng câu không số), thẻ công khai không có; nhãn trong danh sách không mở hộp nào; And khung mục tiêu dùng cùng thành phần nhãn từ `packages/ui` và vẫn mở hộp mức hiển thị cho người sửa được.
- AC-3: Given quản trị ở Cài đặt › Thành viên, người P đang phụ trách KR và mục tiêu ở kỳ đang mở và người Q không phụ trách gì, When quản trị mở hộp gỡ P, Then trong lúc đang đọc hộp nêu «Đang đọc OKR của người này…» và «Gỡ» vẫn bấm được; đọc xong hộp nêu đúng số KR và số mục tiêu mà `okr.transferPreview` trả cho P, nút chính là «Chuyển OKR…» mở hộp chuyển OKR của P, «Gỡ» vẫn bấm được; When mở hộp gỡ Q, Then hộp như trước lượt này; And khi đọc OKR lỗi, hộp nêu «Chưa đọc được OKR của người này» và vẫn cho gỡ; hộp dùng đúng số `transferPreview` đang trả (KR và mục tiêu ở kỳ còn ghi được, không gồm mục tiêu cá nhân), không tự đếm lại. (cross-layer)
- AC-4: Given ô «Công bố cần duyệt» bật và người gửi được đang xem một mục tiêu nháp chưa có KR, When khung vẽ đầu khung và dải «bị trả lại», Then nút «Gửi duyệt» khoá, dòng chữ «Thêm ít nhất một KR trước khi gửi duyệt» hiện ngay dưới nút và nối với nút qua `aria-describedby`, bấm nút không mở hộp hỏi lại; And khi mục tiêu có một KR, nút mở và không có dòng chữ đó.
- AC-5: Given quản trị ở Cài đặt › Tổ chức, các phòng ban: A còn OKR mở và còn người có phòng ban chính, B chỉ còn người, C chỉ còn OKR, E chỉ còn nằm trong một khuôn đang dùng, D không còn gì, When quản trị mở hộp lưu trữ từng phòng, Then hộp nêu đúng các lý do chặn mà truy vấn xem trước `org.luuTruXemTruoc` trả — A hai lý do (OKR kèm «Chuyển OKR…», người), B người, C OKR, E khuôn — nút «Lưu trữ» khoá ở A, B, C, E và mở ở D; And với mọi phòng ban của bộ mẫu cộng năm phòng gieo, tập lý do xem trước khớp đúng việc `org.archiveDepartment` từ chối (cùng lý do) hay cho lưu trữ phòng đó, vì cả hai gọi cùng một hàm kiểm. (cross-layer)
- AC-6: Given hộp «Chuyển OKR» và trần mục tiêu mỗi đơn vị của chương trình, When quản trị chọn đơn vị nhận và tập mục tiêu sao cho đơn vị nhận dưới trần, bằng trần, vượt trần, và vượt trần khi chương trình đặt «Chặn, không ghi», Then `okr.chuyenDonViXemTruoc` trả số mục tiêu sau khi chuyển và trần — đúng cặp số mà `okr.chuyenDonVi` dùng để ghép cảnh báo trên cùng đầu vào, ở cả bốn ca (chuyển OKR hôm nay chỉ cảnh báo, kể cả khi chương trình đặt chặn), hộp hiện cảnh báo nêu tên đơn vị nhận, số mục tiêu sau khi chuyển và trần trước khi bấm, nút chuyển vẫn bấm được; And đổi tập mục tiêu chọn thì kết quả xem trước tính lại; xem trước lỗi thì hộp nêu «Chưa kiểm được trần» và nút chuyển vẫn bấm được (máy chủ vẫn kiểm khi chuyển). (cross-layer)
- AC-7: Given bộ OKR mẫu có G giới hạn, When V (xem được), chủ G, một người không xem được và quản trị đọc `okr.countByUnit`, Then với mỗi người và mỗi đơn vị, số trên cây bằng số mục `cong-bo` trong `okr.danhSach` không lọc của đơn vị đó cho cùng người (danh sách họ thấy ở khung bên phải); And ba loại số thống kê — Sức khoẻ chương trình, tiến độ gộp của đơn vị và đơn vị cha, toàn cảnh — không đổi so với trước lượt này và bằng nhau cho cả bốn người.
- AC-8: Given ô duyệt bật và người gửi được T xem một mục tiêu nháp, When đọc `okr.objective`, Then `nguoiDuyetDuKien` là người mà hàm suy người duyệt trả cho mục tiêu đó, và sau khi T gửi duyệt thì bằng `choDuyet.nguoiDuyet`; ô duyệt tắt, người không gửi được hay mục tiêu không ở nháp thì trường là `null`; And hộp hỏi lại khi gửi duyệt có câu «<tên> sẽ duyệt.». (cross-layer)
- AC-9: Given một mục tiêu đã bị trả lại một lần với lý do L rồi được gửi lại, When người duyệt đọc mục tiêu, Then `choDuyet.lanTraLaiTruoc` mang đúng lý do L, người trả lại và thời điểm; ở lần gửi đầu trường là `null`; dải của người duyệt nêu «Lần trước … trả lại» kèm L, dùng «bạn» khi chính người đang xem đã trả lại; And bảng Vết hiện lý do ở dòng «Trả lại». (cross-layer)
- AC-10: Given người duyệt X vừa trả lại một mục tiêu và vẫn có quyền công bố, When X mở khung mục tiêu, Then nút «Công bố» ở đầu khung dùng biến thể phụ; And với người khác có quyền công bố, cùng mục tiêu hiện nút «Công bố» biến thể chính như trước lượt này.
- AC-11: Given «Theo đơn vị» đang chờ danh sách của đơn vị vừa chọn — kể cả khi còn giữ dữ liệu của đơn vị trước — When khung bên phải vẽ, Then hiện khung xương, không vẽ dữ liệu của đơn vị trước dưới tên đơn vị mới, có `aria-busy` và dòng «Đang tải…» cho trình đọc màn hình, không hiện câu «chưa đặt OKR»; And khi dữ liệu về rỗng thì hiện câu đó, khi có mục tiêu thì hiện danh sách.
- AC-12: Given phiên đo trên bộ OKR mẫu với cây đang xét, When người đo đi qua các trạng thái trong bảng Đặc tả UX của `design_doc` (nhãn «Giới hạn» ở danh sách, hộp gỡ người có OKR, nút gửi khoá, hộp gửi nêu người duyệt, dải lần trả lại trước, Vết có lý do, «Công bố» dạng phụ, hộp lưu trữ hai điều kiện, cảnh báo trần, khung xương) ở khổ 1440 và 390, Then mỗi trạng thái có một ảnh với đúng chữ khai trong bảng và không trang nào tràn ngang.

## Coverage

Bỏ quét độ phủ: phạm vi là danh sách đóng tám điểm do chủ kho chốt từ báo cáo lái thử —
xem dòng sổ `descope` «bỏ coverage-scan …». Trục đối chiếu duy nhất là tám điểm ↔ AC: (1) AC-1,
AC-2 · (2) AC-3 · (3) AC-4, AC-5, AC-6 · (4) AC-7 · (5) AC-8 · (6) AC-9 · (7) AC-10 · (8) AC-11;
AC-12 nhìn cả tám trên màn thật.

## Out of scope

- Các điểm mức Thấp của báo cáo lái thử: câu «nhận lý do trong nhắc buổi sáng», dải trả lại ở
  ngôi thứ ba, hai hộp lưu trữ khác giọng, nhãn mồ côi nêu tên người và KR, bộ đếm ký tự,
  cột tên KR ở khổ hẹp.
- Điểm «Cần đo»: độ trễ khối «Việc cần làm» — đo lại trên production trước khi mở việc.
- Đổi luật ghi nào ở máy chủ: luật gửi duyệt cần KR, luật lưu trữ, luật trần, luật suy người
  duyệt giữ nguyên.
- Chặn cứng việc gỡ người còn OKR — chủ kho chọn cảnh báo.
- Mục tiêu cá nhân của người bị gỡ: không chuyển được nên hộp gỡ không đếm, và nó vẫn vào danh
  sách OKR mồ côi — giới hạn đã ghi ở 8c (sổ `gioi-han-duyet-cay-okr` d-14).
- Áp chính sách «Chặn, không ghi» cho việc chuyển OKR: chuyển OKR hôm nay chỉ cảnh báo khi vượt
  trần, lượt này giữ nguyên.
- Đổi luật số thống kê: Sức khoẻ, tiến độ gộp, toàn cảnh vẫn không tính mục tiêu giới hạn.

## Notes
