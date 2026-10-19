---
schema_version: 1
feature: Trang Lộ trình trong CRM hiện việc chưa hẹn mốc và tên hiển thị đúng như LO-TRINH.html, không còn cờ vàng «khối chưa mang mô hình hiển thị»
slug: trang-lo-trinh-mo-hinh-hien-thi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
veto_state: mo
veto_opened_at: 2026-10-19T13:48:09Z
design_doc: docs/superpowers/specs/2026-10-19-trang-lo-trinh-mo-hinh-hien-thi-design.md
---

# Acceptance Contract: trang-lo-trinh-mo-hinh-hien-thi

## Context

Kit 2.33.0 (nhận ở #483) ghi luật hiển thị của khối Mốc vào khối dữ liệu của `LO-TRINH.html` bằng năm khoá —
`ten_hien_thi`, `hien`, `viec_hien`, `con_lai`, `chua_hen_moc`. Trang Lộ trình của CRM đọc được năm khoá ấy nhưng vẫn tự
lọc: tự gán việc vào mốc, tự gom việc không mốc, lấy câu giao làm tên. Vòng này cho trang đọc năm khoá thay vì tự lọc,
để trang CRM và `LO-TRINH.html` không bao giờ nói hai điều khác nhau về cùng một lộ trình, kèm một ca đối chiếu trang
với tập hiển thị của khối thật.

Source input: hàng LT1f `docs/plan/lo-trinh-okr.json` · `_acceptance/trang-lo-trinh-mo-hinh-hien-thi/opportunity.md`
(Cổng Đáng: build, Phan Le Manh 19/10) · CHANGELOG kit 2.33.0, mục «crm, theo thứ tự» số 4 · thiết kế
`docs/superpowers/specs/2026-10-19-trang-lo-trinh-mo-hinh-hien-thi-design.md`.

Dữ liệu trong mọi bài kiểm rút từ `LO-TRINH.html` thật của cây (bên viết thật là bộ vẽ của kit), chỉ sửa khoá bằng code
trong lượt khi ca cần khoá lệch luật cũ.

## Criteria

- AC-1: Given khối mang mô hình hiển thị mà khoá của nó lệch luật tự lọc cũ của trang (một mã được mốc thứ hai liệt
  trong `viec_hien` dù mốc đầu cũng gắn nó; một mã nằm trong `chua_hen_moc` dù một mốc gắn nó), When trang dựng danh sách
  việc, Then mốc của mỗi việc là mốc mà `viec_hien` liệt nó, việc trong `chua_hen_moc` không có mốc, và cột Mốc của bảng,
  ngăn hồ sơ và bộ lọc «Chưa hẹn mốc» đều theo khoá chứ không theo luật cũ.
- AC-2: Given khối mang mô hình hiển thị, When người xem mở kiểu xem «Mốc», Then chỉ mốc có `hien` đúng được hiện và được
  liệt trong bộ lọc mốc — mốc có `hang` khác rỗng mà `hien` sai thì không; mỗi mốc hiện mang một dòng số đặt dưới tên lộ
  trình của mốc ở mọi bề rộng: còn việc thì «còn <con_lai>/<số việc của mốc> việc» (kèm «· <số việc của mốc − con_lai>
  đã giao» khi số ấy khác 0) / «<con_lai> of <số việc> left» (kèm «· <k> delivered»), hết việc thì «đã giao đủ <số việc>
  việc» / «All <số việc> delivered» — câu tiếng Việt giống từng chữ dòng số của mốc ấy trên `LO-TRINH.html`; và dòng số
  không đổi khi người xem đổi bộ lọc.
- AC-3: Given khối mang mô hình hiển thị, When người xem mở nhóm «Chưa hẹn mốc» ở kiểu xem «Mốc» hoặc chọn «Chưa hẹn
  mốc» ở bộ lọc mốc, Then tập việc hiện bằng đúng tập `chua_hen_moc` (giao với bộ lọc và vòng đời đang chọn), và số đếm
  của nhóm bằng số việc ấy.
- AC-4: Given một việc có `ten_hien_thi` khác câu giao (câu giao rỗng, kit lấy tên ngắn), When việc hiện ở bảng, bảng
  cột, dòng việc của kiểu xem «Mốc» và tiêu đề ngăn hồ sơ, Then mọi chỗ hiện `ten_hien_thi`, không chỗ nào hiện dòng tên
  trống; và ô tìm kiếm tìm ra việc ấy theo tên hiển thị.
- AC-5: Given khối của `LO-TRINH.html` thật của cây, When trang hiện kiểu xem «Mốc» với vòng đời «Tất cả» và không bộ
  lọc, Then với mọi lộ trình: tập mốc hiện bằng tập mốc có `hien` đúng, việc dưới mỗi mốc bằng `viec_hien` của mốc ấy, tên mỗi việc bằng `ten_hien_thi`, dòng số bằng `con_lai`/độ dài `viec_hien`, nhóm «Chưa hẹn mốc» bằng
  `chua_hen_moc`; và trang không hiện hộp «Trang có thể thiếu một phần».
- AC-6: Given tệp đóng gói hoặc bản chụp vẽ bằng kit chưa mang mô hình hiển thị, When người xem mở trang Lộ trình, Then
  trang không vỡ, việc nào thuộc mốc nào và nhóm «Chưa hẹn mốc» giống hệt luật trước vòng này trên cùng khối, mốc không có
  dòng số, và hộp «Trang có thể thiếu một phần» không bật chỉ vì khối thiếu mô hình hiển thị; Given cùng khối mới đi qua
  đường lưu bản chụp, When trang đọc bản chụp, Then trang hiện y như khi đọc tệp đóng gói.
- AC-7: Given người xem ở 375 px và 1280 px, tiếng Việt và tiếng Anh, nền sáng và tối, When trang hiện kiểu xem «Mốc» có
  mốc còn việc, mốc đã giao đủ và nhóm «Chưa hẹn mốc» mở, Then dòng số đứng dưới tên mốc, không chỗ nào cuộn ngang hay
  cắt chữ (không dấu ba chấm ở tên mốc, tên việc), và tên mốc, tên việc, tên lộ trình không bị trình duyệt dịch.

## Coverage

- Ngữ cảnh: chân sản phẩm [SUY-TỪ-REPO: apps/app/components/lo-trinh/xem-moc.tsx] [SUY-TỪ-REPO: scripts/lo-trinh.mjs]
  · chân ngành [NGÀNH: Linear — project milestones: việc không thuộc mốc nào gom dưới «No milestone», mốc đếm việc xong
  trên tổng].
- Trục A — nguồn khối: tệp đóng gói mới | tệp đóng gói cũ | bản chụp mới | bản chụp cũ [thước CE: hai đường đọc của
  `apps/app/lib/lo-trinh/doc-trang.ts`].
- Trục B — khoá: `ten_hien_thi` | `hien` | `viec_hien` | `con_lai` | `chua_hen_moc` [thước CE: CHANGELOG kit 2.33.0
  «năm khoá»].
- Trục C — chỗ hiện: kiểu xem Mốc | bảng | bảng cột | ngăn hồ sơ | bộ lọc mốc | tìm kiếm [SUY-TỪ-REPO:
  apps/app/components/lo-trinh/].
- Trục D — ca dữ liệu: khoá khớp luật cũ | khoá lệch luật cũ | câu giao rỗng | mốc gắn mã không có hàng.
- Core (7 ô): việc→mốc theo khoá → AC-1 · mốc hiện và dòng số → AC-2 · chưa hẹn mốc → AC-3 · tên ở mọi chỗ → AC-4 · đối
  chiếu khối thật → AC-5 · khối cũ và bản chụp → AC-6 · màn thật → AC-7.
- Later: cờ «hai việc cùng mã» trên trang (kit đã gắn cờ `ma-trung` ở «Cần sửa») · tên ngắn trên thẻ bảng cột.
- Never: trang tự tính lại mô hình hiển thị — kit là nguồn duy nhất.

## Đường đo

- Thước: trang CRM và khối của `LO-TRINH.html` cho cùng tập hiển thị (mốc hiện, việc dưới mốc, chưa hẹn mốc, tên, dòng
  số) — ngưỡng sống: khớp 100 % trên khối thật · số từ: bài đối chiếu của AC-5 chạy trên `LO-TRINH.html` của cây lúc giao
  và ở mỗi lượt CI sau đó · bảo đảm bởi: AC-5.

## Out of scope

- Sửa luật hiển thị của kit (`moHinhHienThi`, `tenHienThi`) hay bộ vẽ `LO-TRINH.html` — việc của kit.
- Đổi khuôn đọc `packages/validation/src/lo-trinh-du-lieu.ts` hay bản chép bộ đọc `doc-du-lieu.js` — #483 đã mang năm khoá.
- Đổi đường đẩy bản chụp, API hay bảng lưu bản chụp — chúng giữ nguyên khối; AC-6 chứng điều đó, không sửa chúng.
- Hiện cờ «hai việc cùng mã» trên trang — Later.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Ba câu vòng đời (`docs/vong-doi.md`): không loại bản ghi mới, không nút xoá hay lưu trữ, không trạng thái kết thúc mới
  — không áp.
- Đo 19/10 trên `LO-TRINH.html` của cây: ba lộ trình, 194 việc, 23 mốc — luật tự lọc cũ và năm khoá cho cùng tập; vòng
  này không đổi điều người xem thấy hôm nay ngoài dòng số của mốc. Giá trị của vòng là một nguồn sự thật.
- Giới hạn đã biết: năm khoá liệt MÃ, không liệt hàng. Hai hàng cùng mã (kit báo «hai việc cùng mã» ở «Cần sửa») đều
  hiện dưới mốc của mã ở trang CRM, còn khối Mốc của `LO-TRINH.html` chỉ liệt hàng đầu. Đo 19/10: 0 mã trùng.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-19:
  - Ngoài-1: Khi khối dữ liệu dời một việc sang mốc sau mà mốc cũ vẫn liệt việc ấy, trang có thể ghi «Trễ N ngày» cho việc thật ra còn N ngày và đếm nó vào bộ lọc «Trễ mốc»; dữ liệu thật hôm nay không rơi vào ca này.
  - Ngoài-2: Bài kiểm chưa chứng minh bộ lọc mốc liệt đủ các mốc hiện, chỉ chứng minh mốc không hiện thì vắng mặt.
  - Ngoài-4: Bài đối chiếu chỉ kiểm tên việc có nằm trong dòng, chưa kiểm dòng hiện đúng bằng tên ấy.
  - Ngoài-5: Bài kiểm chưa thật sự soi tên việc trên bảng cột và ngăn hồ sơ.
