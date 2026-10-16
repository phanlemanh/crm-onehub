## Trong hợp đồng

- **Bước 2 của thước in «8 o chu» vô điều kiện và không kiểm tên người phụ trách 120 ký tự như E2 đã khai**
  file: `_acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs:422`
  severity: low
  AC: AC-2
  source: bugs
  detail: Trong nhánh else của bước 2, `console.log("  8 o chu")` chạy bất kể `s.chu` bằng bao nhiêu. Dòng `expected` của E2 lại lấy chính chuỗi «8 o chu» làm bằng chứng. Phán quyết của bước vẫn đúng, vì khi `s.chu !== 8` thì `loi` đã có mục và `d.dat(2, false)`. Nhưng ai grep log tìm «8 o chu» thì vẫn thấy dòng đó cả khi bước đỏ. Bước của E2 còn khai một phép đo nữa: «innerText o Phu trach chua du ten 120 ky tu». Script không làm phép đo này. `doStats` chỉ đo `scrollWidth > clientWidth` và đếm `dt`/`dd`. Vì vậy, nếu ô Phụ trách hiện «—» (owner null) hoặc hiện sai tên mà không tràn, bước 2 vẫn xanh. Cách sửa: chỉ in «8 o chu» khi `s.chu === 8`, và thêm phép kiểm `innerText` của ô Phụ trách có chứa `TEN_NGUOI_DAI`.
  Lý do vào hợp đồng: AC-2 hứa rõ tên phụ trách 120 ký tự hiện đủ chữ ở ngăn khổ 375; phép đo không kiểm chữ của ô Phụ trách nên AC-2 không được chứng minh.

- **Hình dạng 5 (quét lớp nhưng chỉ đo tập con): E6 «không phần tử nào trong ngăn tràn» bỏ qua toàn bộ thân ngăn**
  file: `_acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs:302`
  severity: medium
  AC: AC-6
  source: measurement
  detail: doTranNgan (dòng 302-314) có `biCat`, hàm này bỏ mọi phần tử nếu một tổ tiên nằm dưới ngăn có `getComputedStyle(p).overflowX !== "visible"`. Trong ngăn thoả thuận, DetailSheetBody mang `overflow-y-auto` (apps/app/components/detail-sheet.tsx:294). Theo CSS, overflow-x khi đó được tính thành `auto`. TabsContent thì mang `overflow-hidden` (dòng 278). Hệ quả là mọi phần tử trong thân ngăn đều bị loại khỏi phép quét, kể cả StageStepper (deal-sheet.tsx:330, nằm trong DetailSheetBody); chỉ còn header, hàng số liệu và danh sách thẻ. AC-6 và bước của E6 hứa «không phần tử nào trong nội dung ngăn có rect.right > rect.right của ngăn + 1». Script chỉ in `dem` để biết đã đo bao nhiêu phần tử, không có mức sàn nào cho `dem`, và chiều đỏ duy nhất của E6 (chiều đo 7) chỉ đo bề rộng tiêu đề. Phần nội dung bị cắt trong khung cuộn là đúng loại tràn mà AC-6 cấm, vậy mà nó luôn qua.
  Lý do vào hợp đồng: AC-6 hứa không phần tử nào trong ngăn tràn khỏi bề ngang ngăn; phép quét bỏ qua cả thân ngăn nên lời hứa này không được kiểm.

- **Hình dạng 4 (âm tính một mình): E2 khai kiểm «innerText ô Phụ trách chứa đủ tên 120 ký tự» nhưng script không làm**
  file: `_acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs:405`
  severity: medium
  AC: AC-2
  source: measurement
  detail: Bước của E2 trong evals.yaml có ghi: «innerText o Phu trach chua du ten 120 ky tu». AC-2 cũng nói rõ «kể cả tên phụ trách 120 ký tự». Trong do-bo-cuc.mjs, hằng TEN_NGUOI_DAI chỉ được dùng một lần để gieo (`d.nguoiMoi(..., TEN_NGUOI_DAI)`, dòng 342), không lần nào được so với chữ trên màn. Bước 2 (dòng 405-428) chỉ đếm 4 ô, 8 dt/dd, so offsetTop và chạy phép quét âm tính `scrollWidth > clientWidth + 1`. Nếu tên phụ trách bị ẩn trên điện thoại, bị thay bằng chữ viết tắt, hoặc bị rút ngắn trước khi vẽ, phép quét âm tính vẫn qua vì không còn phần tử nào để tràn. Như vậy vế dương mà eval đã khai không tồn tại trong phép đo.
  Lý do vào hợp đồng: AC-2 nêu đích danh nhãn và giá trị mỗi ô hiện đủ chữ kể cả tên phụ trách 120 ký tự; phép đo chỉ quét âm tính nên vế dương của AC-2 không được chứng minh.

- **Hình dạng 4 (âm tính một mình, không có dữ liệu kích được): E4 «ngăn công ty cắt chữ» không có ô nào mang giá trị dài**
  file: `_acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs:358`
  severity: medium
  AC: AC-4
  source: measurement
  detail: Công ty được gieo bằng `d.lam(c, "companies.create", { name: TEN_CONG_TY })`, không truyền ownerId. companies.service.ts:329 lưu `ownerId: input.ownerId ?? null`, nên ô Phụ trách của ngăn công ty hiện EmptyCellValue. Ba ô còn lại là tiền, số đếm và ngày, đều ngắn. Tên 120 ký tự của công ty nằm ở tiêu đề, không nằm trong hàng số liệu. Vì vậy phép quét `cat` của bước 4 (dòng 470-478) không thể đỏ trước thay đổi mà vòng này làm cho company-sheet.tsx (`<OwnerCell owner={company.owner} xuongDongDienThoai />`). E7 cũng không có chiều đo nào chạy bước 4 (mọi chiều đều đặt chiBuoc là 1, 2, 3 hoặc 6), nên thông điệp «bch-man: ngan cong ty cat chu» chưa từng được ghim. Đây là một phép kiểm âm tính, không có ca dương nào có thể kích nó.
  Lý do vào hợp đồng: AC-4 hứa bốn ô hàng số liệu ngăn công ty hiện đủ chữ ở khổ 375, nhưng dữ liệu gieo không có ô nào mang giá trị dài nên phép đo không thể phát hiện việc cắt chữ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **OOS-3 trong hợp đồng và thẻ vẫn nói «KHÔNG sửa đầu ngăn», nhưng code của vòng này có sửa đầu ngăn**
  Người dùng thấy gì: Thẻ nghiệm thu vẫn ghi là phần đầu ngăn (tên bản ghi, nhãn giai đoạn góc phải) không bị sửa, trong khi vòng này có sửa nó để tên giai đoạn không bị cắt trên điện thoại. Người duyệt có thể hiểu sai phạm vi thay đổi nếu không được báo.
  file: `_acceptance/bo-cuc-hep-ngan-va-kanban/card-plain.json`
  severity: medium
  Đề xuất: known-limits

- **Dòng «8 o chu» mà E2 dựa vào luôn được in, kể cả khi số ô chữ không phải 8**
  Người dùng thấy gì: Nhật ký đo luôn có dòng «8 ô chữ» dù số ô thật khác 8, nên đọc nhật ký có thể tưởng nhầm. Kết quả xanh/đỏ của phép đo vẫn đúng.
  file: `_acceptance/bo-cuc-hep-ngan-va-kanban/rang/do-bo-cuc.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
