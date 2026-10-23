# Coverage scan — hop-dong-mau (DA22)

Preset `entity-feature`, chỉnh cho một lệnh nạp dữ liệu mẫu: entity là «bộ hợp đồng mẫu gắn vào ô Tệp».

## Ngữ cảnh

- Sản phẩm: CRM nội bộ của OneHub — chân sản phẩm: đào repo (`CLAUDE.md` mục «Lộ trình là việc dựng; thiếu dữ liệu thì
  dùng dữ liệu mẫu», hàng DA19/DA22/DA23 của `docs/plan/lo-trinh-viec-du-an.json`, thiết kế DA19 trên `feat/truong-tep`,
  `apps/api/scripts/okr-mau/**`, `apps/agent/agent/lib/tai-lieu-doc-chu.ts`) · chân ngành: CUAD (Contract Understanding
  Atticus Dataset — bộ hợp đồng có nhãn từng điều khoản, gồm «Agreement Date», «Effective Date», «Expiration Date»,
  «Renewal Term») làm chuẩn cho bộ đáp án trích thuộc tính hợp đồng.

## Trục

- **A. Dạng tệp:** PDF có lớp chữ | DOCX | PDF quét không lớp chữ | ảnh PNG/JPEG quét | PDF nhiều trang
  [thước CE: bốn kiểu nhận theo byte của DA19 (SUY-TỪ-REPO: docs/superpowers/specs/2026-10-21-truong-tep-design.md mục 3,
  nhánh feat/truong-tep); nhánh `can-go-tay` của `tai-lieu-doc-chu.ts` (SUY-TỪ-REPO: apps/agent/agent/lib/tai-lieu-doc-chu.ts)]
- **B. Cách viết thuộc tính trong tệp:** ngày viết chữ «ngày … tháng … năm …» | ngày số dd/mm/yyyy | hết hạn ghi thẳng
  ngày | hết hạn suy từ thời hạn («12 tháng kể từ ngày ký») | giá trị số có dấu chấm nghìn | giá trị bằng chữ kèm số |
  thuộc tính vắng hẳn
  [thước CE: NGÀNH: CUAD (Agreement Date, Effective Date, Expiration Date, Renewal Term); câu giao DA23 «ngày ký, ngày
  hết hạn và giá trị» (SUY-TỪ-REPO: docs/plan/lo-trinh-viec-du-an.json DA23)]
- **C. Lượt chạy × môi trường:** lần đầu trên kho cục bộ | chạy lại | chạy dở rồi chạy lại | kho xa hay production |
  kho tệp tắt (thiếu `TEP_BAN_GHI_BLOB_TOKEN`) | thiếu workspace | khoá trường «Hợp đồng» đã có với kiểu khác
  [thước CE: E7, E9, E11 của `_acceptance/bo-okr-mau/evals.yaml` (SUY-TỪ-REPO); AC-8 của DA19 (SUY-TỪ-REPO: nhánh
  feat/truong-tep, _acceptance/truong-tep/contract.md)]
- **D. Đích gắn:** thoả thuận mẫu | công ty mẫu | cá nhân mẫu | bản ghi thật của người dùng
  [thước CE: ba loại bản ghi có ô Tệp ở DA19; luật «Dữ liệu mẫu không lên production» (SUY-TỪ-REPO: CLAUDE.md)]

Ô có nghĩa sau B3: A × B cho 5 × 7 = 35 ô, gạch các ô PDF quét / ảnh × mọi cách viết (máy không đọc được chữ, nên cách
viết không đổi gì — gạch, lý do «vô-chữ») còn 21 + 2 ô quét; C × D cho 7 × 4 = 28 ô, gạch D=bản ghi thật × mọi C (cấm,
lý do «Never») còn 21. Tổng ≈ 44 ô có nghĩa.

## Core (≤20%)

1. A=PDF có lớp chữ × B=ngày viết chữ, hết hạn ghi ngày, giá trị số — ca chuẩn DA23 đo trước tiên.
2. A=PDF có lớp chữ × B=ngày số, hết hạn suy từ thời hạn — DA23 phải suy chứ không chép.
3. A=DOCX × B=giá trị bằng chữ kèm số — mammoth và cách viết giá trị thứ hai.
4. A=DOCX × B=thuộc tính vắng (không ghi giá trị) — đáp án `null`, để DA23 đo việc không bịa.
5. A=PDF quét không lớp chữ — nhánh «cần nhập tay» của DA23.
6. C=lần đầu × D=thoả thuận mẫu — đường ghi thật requestUpload → PUT → complete.
7. C=chạy lại — không nhân đôi tệp, bản ghi hay trường.
8. C=kho xa hay production — từ chối trước khi chạm kho và Blob.
9. C=kho tệp tắt, thiếu workspace, khoá trường lệch kiểu — thoát có tên, không ghi gì.

Chín ô trên 44 (≈20%).

## Later

- A=ảnh PNG/JPEG quét — DA23 chưa đọc ảnh (chưa OCR); PDF quét đã phủ nhánh «cần nhập tay».
- A=PDF nhiều trang, thuộc tính nằm trang sau — thêm khi DA23 đo trích theo trang.
- B=điều khoản gia hạn tự động (CUAD «Renewal Term») — DA23 chưa có trường cho nó.
- D=công ty mẫu, cá nhân mẫu — DA19 đã chứng ô Tệp trên ba loại; DA23 đo trích thuộc tính, không phụ thuộc loại bản ghi.
- C=gỡ bộ mẫu (`--xoa`) — gỡ đi qua lưu trữ rồi xoá vĩnh viễn của DA19; dữ liệu mẫu chỉ sống ở kho cục bộ.
- Tạo sẵn trường «Ngày ký», «Ngày hết hạn» bật «Kara điền» — việc của DA23, và tạo trường «Kara điền» xếp việc điền bù cho
  agent ngay lúc tạo.

## Never

- D=bản ghi thật của người dùng — dữ liệu mẫu không gắn vào dữ liệu người (CLAUDE.md).
- Hợp đồng thật của OneHub trong bộ mẫu — chưa có mẫu thật; có thì thay khuôn ở hàng khác (ghi chú DA22).
- Chèn thẳng bảng `fieldFile` hay Blob — trái luật «Dữ liệu mẫu vào qua đường ghi thật».

## Cross-cutting áp mọi ô Core

- Nhãn mẫu trên mọi tệp: tên tệp, siêu dữ liệu tài liệu, và (tệp có chữ) dòng đầu nội dung.
- Byte tất định: cùng tệp cho cùng `sha256` ở mọi lượt chạy, mọi máy — luật trùng của DA19 đứng trên điều này.
- Đáp án (ngày ký, ngày hết hạn, giá trị, có đọc được chữ không) đi cùng bộ tệp, một nguồn cho DA23.
