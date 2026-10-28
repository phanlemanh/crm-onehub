# Review findings: hop-tuan-tren-bang (round 1)

## Trong hợp đồng

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): kiểm «B nằm trong Còn lại» chỉ chạy khi Còn lại đang mở, nên khi gập thì thành phép kiểm rỗng**
  AC: AC-7
  file: `apps/app/test/hop-tuan-tren-bang.dom.tsx:785`
  severity: high
  source: measurement
  detail: htb-sau-gui (E7) báo lỗi «bang chua xep B vao Con lai» chỉ khi `qs('[data-con-lai] [data-kr-hop="B"]') === null && data-con-lai === "mo"`. Bài không bấm mở Còn lại. Trạng thái `moConLai` ở `BangCoDuLieu` (hop-tuan.tsx) chỉ tự mở khi `vuaGui` được đặt qua `useBangHop` của chính bảng, mà lần gửi này đi từ nút đầu ngăn. Nên sau khi gửi, Còn lại ở «dong», điều kiện thứ hai sai, và lời hứa «bảng sau ngăn đã xếp lại» không bao giờ được đo. Thiếu Còn lại hẳn (getAttribute trả null) cũng lọt. Câu `dem += 1` vẫn tăng nên bài vẫn in 4/4. Bài cũng không kiểm « › → D » mà expected của E7 có ghi: chỉ có ‹ → C.
  lý do thuộc hợp đồng: AC-7 hứa «bảng sau ngăn đã xếp lại» và ‹ › đi dòng kề theo thứ tự mới; phép đo của lời hứa này rỗng nên AC-7 không được chứng minh.

- **Hình dạng 1 + 4 + 2: chín ca mức đổi được đo trên hàm chuMucDoi, không đo trên ô đã dựng; phần dựng chỉ có kiểm âm «không chứa 60»**
  AC: AC-3
  file: `apps/app/test/hop-tuan-tren-bang.dom.tsx:453`
  severity: high
  source: measurement
  detail: Expected của E3: «Mỗi ô: [data-muc-doi=<id>] có đúng hai dòng chữ; dòng trên và dòng dưới bằng chuỗi kỳ vọng», với «chín dòng mồi parse bằng hopTuanOutput». Bài làm khác ở ba chỗ. (1) Chín chuỗi kỳ vọng chỉ được so với `chuMucDoi(ca.d, "vi")`, tức hàm trung gian chứ không phải DOM (dòng 454–458). (2) `CA_MUC_DOI[].d` là object viết tay đúng kiểu `DongMucDoi` của bên đọc, không đi qua `hopTuanOutput.parse` (hình dạng 2). (3) Phần dựng thật (dòng 479–492) chỉ kiểm `o.length === 1 && children.length === 2`, rồi kiểm âm `!chu.includes("60")`. Chữ trên màn không bao giờ được so với «−0,09 tỷ đồng» hay «1,17 → 1,08 · so với 10/10». Ô dựng hai span rỗng, hoặc dựng chữ sai mà không có «60», thì vẫn xanh.
  lý do thuộc hợp đồng: AC-3 đòi ô mức đổi dựng ra có hai dòng đúng chuỗi cho chín ca; bài chỉ đo hàm trung gian, không đo ô trên màn.

- **Hình dạng 4 + 5: quét «tám nhãn không còn tiếng Việt ở locale en», nhưng hai nhãn không được dựng nên phép kiểm âm của chúng rỗng**
  AC: AC-9
  file: `apps/app/test/hop-tuan-tren-bang.dom.tsx:839`
  severity: medium
  source: measurement
  detail: htb-chu (a) quét `document.body.textContent` theo TAM_CHU_VI (tám chuỗi vi) và báo lỗi khi chuỗi có mặt. Dữ liệu dựng ở en gồm A (ghiChu null, mucDoi mặc định 9→12), C (giaTriMoi null) và D (tu=den). Không dòng nào có `mucDoi null` kèm `giaTriMoi` khác null, nên `mt.lanDau` («Lần đầu cập nhật») không bao giờ được dựng. Ngăn KR cũng không mở ở phần en, nên `mk.theoThuTuBang` («theo thứ tự bảng») không có trên màn. Với hai nhãn này, `!chu.includes(vi)` luôn đúng, kể cả khi thành phần viết cứng chuỗi. Bài không có đối chứng dương (ví dụ dựng cùng dữ liệu ở vi và thấy đủ tám chuỗi) để chứng tỏ cả tám chỗ đều có trên màn.
  lý do thuộc hợp đồng: AC-9 đòi nhãn mới có ở tệp chữ cả hai ngôn ngữ, không chuỗi cứng; hai trong tám nhãn không được đo thật.

- **Hình dạng 5: lời hứa «mở C qua lối của trang đơn vị và của Của tôi» chỉ đo bằng một URL tổng hợp**
  AC: AC-6
  file: `apps/app/test/hop-tuan-tren-bang.dom.tsx:722`
  severity: medium
  source: measurement
  detail: Expected của E6 (b) và AC-6 nói mở C từ trang đơn vị, Của tôi hay Tổng quan thì ngăn đếm theo position. Bài chỉ dựng `<RecordSheetHost />` trần với `?record=objective:mt-1,kr:C` (dòng 722). Nó không đi qua lối mở thật nào, dù khung đã có sẵn `dungTheoDonVi` và `dungCuaToi`. Một lối mở ở trang đơn vị hay Của tôi vô tình mang `thuTuKr` (ví dụ dùng chung hook mở của Họp tuần) sẽ không bị bắt. Lớp lối mở được khai, nhưng chỉ có một điểm và điểm ấy không thuộc lớp.
  lý do thuộc hợp đồng: AC-6 hứa mở KR từ trang đơn vị, Của tôi hay Tổng quan thì đi theo position; bài không đi qua lối mở thật nào.

- **Hình dạng 4: «router giả ghi 0 lần điều hướng» không có đối chứng dương, nên chưa đo được «không chuyển trang»**
  AC: AC-4
  file: `apps/app/test/hop-tuan-tren-bang.dom.tsx:554`
  severity: medium
  source: measurement
  detail: htb-cap-nhat (c) dùng `dieuHuong.soLan !== 0` để đo «đường dẫn vẫn là Họp tuần». Bộ đếm chỉ tăng khi có lời gọi `useRouter().push/replace` của mock next/navigation. hop-tuan.tsx, nut-cap-nhat-dong.tsx, cap-nhat-kr.tsx và hop-thoai-cap-nhat-kr.tsx đều không gọi useRouter. next/link bị khung mock (khung-gop-y-dung-cho.tsx:488). Nuqs đi qua adapter thử. Như vậy một lần rời bảng qua Link, nuqs hay window.location vẫn để bộ đếm ở 0. Bài không có bước dương nào cho thấy bộ đếm ghi được một lần điều hướng thật, và không kiểm pathname của `san.url()`.
  lý do thuộc hợp đồng: AC-4 hứa gửi cập nhật từ dòng thì đường dẫn vẫn là Họp tuần, không chuyển trang; bộ đếm không chứng minh được điều đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The hopTuanOutput response schema was loosened with .default() so that old test fixtures still parse**
  Người dùng thấy gì: Hiện bảng Họp tuần vẫn hiện đúng ghi chú và mức đổi. Nhưng nếu sau này máy chủ lỡ bỏ sót một trường, màn hình sẽ lặng lẽ hiện «Chưa cập nhật» hay ô đơn vị trống thay vì báo lỗi.
  Căn cứ: Hôm nay người dùng không thấy gì sai, rủi ro chỉ xuất hiện khi có lỗi khác về sau; sửa buộc phải đụng bài kiểm đã ký nên đắt, nên ghi lại để người ký quyết.
  file: `apps/api/src/okr/okr-xem.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **giaTri moved to gia-tri-kr.ts but bang-kr.tsx still re-exports it, and theo-don-vi/bang.tsx still imports it from the old place**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Chỉ là mã còn hai đường nhập cho cùng một hàm, dễ lệch về sau.
  Căn cứ: Không ảnh hưởng gì tới màn hình hay dữ liệu, và sửa sau rất rẻ khi có người chạm vào vùng này.
  file: `apps/app/app/(app)/[slug]/okr/bang-kr.tsx`
  severity: low
  Đề xuất: known-limits

- **muc-doi.tsx adds a third ngayThang (YYYY-MM-DD to DD/MM) for the OKR area when cap-nhat-tuan.tsx already exports one**
  Người dùng thấy gì: Người dùng không gặp gì. Ngày vẫn hiện đúng dạng dd/mm; chỉ có nguy cơ ba bản hàm đổi ngày lệch nhau về sau.
  Căn cứ: Không có hậu quả nhìn thấy được, không mất dữ liệu, và gộp lại sau rất rẻ.
  file: `apps/app/app/(app)/[slug]/okr/hop-tuan/muc-doi.tsx`
  severity: low
  Đề xuất: known-limits

- **Moving to the next or previous KR in board order keeps the first KR's objective underneath, so the back button opens the wrong objective**
  Người dùng thấy gì: Trưởng đơn vị đi họp bấm sang KR kế thuộc mục tiêu khác, rồi bấm «Về khung mục tiêu» thì mở nhầm mục tiêu của KR đầu tiên, không phải mục tiêu của KR đang xem.
  Căn cứ: Không mất dữ liệu và người dùng tự thoát được bằng cách đóng ngăn rồi mở lại, nhưng lỗi dễ gặp khi họp qua nhiều mục tiêu và gây khó hiểu giữa buổi họp.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
