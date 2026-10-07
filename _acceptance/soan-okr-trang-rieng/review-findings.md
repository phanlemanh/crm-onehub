# Review findings: soan-okr-trang-rieng (round 1)

## Trong hợp đồng

- **Hình dạng 3 (khẳng định một chuỗi có mặt trong khi lời hứa là quan hệ giữa các giá trị): dòng phụ «n dòng · sửa lúc HH:MM» không phép đo nào so giờ với lần nộp cuối**
  file: `apps/app/test/soan-okr-trang.dom.tsx:301`
  severity: high
  AC: AC-3
  source: measurement
  detail: AC-3 hứa dòng phụ là «n dòng · sửa lúc HH:MM theo lần nộp cuối», và E3 hứa đo meta(9, '10:42') với giờ nộp cuối 10:42. Ô co-nhap của k2-trang-thai chỉ có `expect(dau?.textContent).toContain(m.man.soDong("7"))`. Trong bang-nhap.tsx:194-198 có hai nhánh: `gio ? m.dong.meta(String(soDong), gio) : m.man.soDong(String(soDong))`. Chuỗi «7 dòng» nằm trong cả hai nhánh, nên phép đo xanh dù giờ đúng, giờ sai hay không có giờ. Không bài nào trong apps/app/test gọi gioNopCuoi hay gioNop, và chẳng chứa «sửa lúc» ngoài bản ghim chữ của messages-guard. soan-okr.dom.tsx:839 cũng chỉ `toContain(m.man.soDong("7"))`. Ở man-ma-tran.mjs:56, dấu nhận của ST-soan-co-nhap là `coChu('[data-slot="kara-artifact-header"]', "dòng")`, nên tầng màn cũng không đo giờ. Giờ HH:MM lấy từ lần nộp cuối vì vậy không được đo ở tầng nào.
  lý do vào hợp đồng: AC-3 hứa dòng phụ «n dòng · sửa lúc HH:MM» theo lần nộp cuối; phép đo hiện tại xanh cả khi giờ sai hoặc vắng, nên lời hứa đó chưa được chứng minh.

- **Hình dạng 3 (đo có mặt thay vì quan hệ đúng N): E12b đếm Mục tiêu và KR chỉ trong hàng có tên mong đợi, nên tạo thừa thì không thấy**
  file: `_acceptance/soan-okr-trang-rieng/rang/man-so.mjs:181`
  severity: high
  AC: AC-12
  source: measurement
  detail: AC-12 hứa xác nhận «tạo đúng N Mục tiêu và M KR». Câu đếm `SELECT count(*) ... FROM "okrObjective" WHERE "cycleId"=$1 AND "departmentId"=$2 AND title = $3` truyền tham số TEN.m1, và câu KR ở dòng 182-185 cũng JOIN với `o.title = $3` (TEN.m1). Kịch bản bỏ qua Mục tiêu m2 ở dòng 148. Nếu bản lỗi vẫn tạo Mục tiêu m2 và các KR của nó, mt.n vẫn là 1 và kr.length vẫn là 3, nên bước 4 xanh. Phép đo chỉ chứng hàng mong đợi có mặt, không chứng tổng số tạo ra bằng N và M. Chiều đỏ ghim `dem-sai` chỉ nâng canMt lên 2, tức là đổi kỳ vọng chứ không đổi sản phẩm. Vì thế nó không bao giờ chạm được trường hợp tạo thừa. Hướng sửa: đếm mọi okrObjective và okrKeyResult của đơn vị và chu kỳ, so trước và sau khi đưa vào.
  lý do vào hợp đồng: AC-12 hứa xác nhận tạo đúng N Mục tiêu và M KR; phép đo chỉ đếm hàng có tên mong đợi nên không bắt được việc tạo thừa.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): k2-khung so hằng CO_O_HOI_THOAI chứ không đọc prop ResizablePanel đã dựng**
  file: `apps/app/test/soan-okr-trang.dom.tsx:178`
  severity: medium
  AC: AC-2
  source: measurement
  detail: E2b hứa defaultSize/minSize/maxSize được «đọc từ prop của ResizablePanel giả lập ghi lại props». Bài thật làm hai việc: `expect(KhungSoanXuat.CO_O_HOI_THOAI).toEqual({defaultSize: SOAN_UI..., minSize..., maxSize...})`, rồi so SOAN_UI với [380, 300, "50"]. Cả hai chỉ so một hằng xuất khẩu với một hằng cấu hình. Ô hội thoại ở khung-soan.tsx:90-92 nhận cỡ qua `{...CO_O_HOI_THOAI}`. Một bản sao bỏ dòng spread đó, hoặc truyền defaultSize khác, vẫn làm k2-khung xanh. Lý do là phần dựng ở dòng 192-207 chỉ đếm tay kéo, tab và data-o, không đọc cỡ ô nào.
  lý do vào hợp đồng: AC-2 hứa ô hội thoại mặc định 380 px, tối thiểu 300 px, tối đa nửa thân; phép đo chỉ so hằng với hằng nên bỏ dòng truyền cỡ vào ô vẫn xanh.

- **Hình dạng 5 (tuyên bố cả lớp nhưng chỉ đo vài điểm): E2 hứa ma trận khổ viết trước và mỗi ô tự cuộn, nhưng phanKhung chỉ đo 1440 và chỉ ô bản nháp**
  file: `_acceptance/soan-okr-trang-rieng/rang/man.mjs:209`
  severity: medium
  AC: AC-2
  source: measurement
  detail: AC-2 và AC-14 hứa «mỗi ô cuộn riêng». Các bước của E2 hứa ba điều: ma trận rộng viết trước {1024×768, 1280×900, 1440×1000} đo cỡ mặc định và hai biên kéo cho từng ô, rồi «số dòng in phải bằng 3»; ma trận hẹp {375×812, 768×1024, 1023×768}; và lăn chuột trên bản nháp «tương tự ô hội thoại». phanKhung không làm đủ. Nó chỉ dựng một khổ 1440×640 (dòng 157) và đo cỡ cùng kéo ở đó. Vòng hai tab chỉ lặp [768, 375] (dòng 222), thiếu 1023. Không có bản in nào đếm số ô. Ở dòng 204-210, script tính `{ hoi, ban }`, nhưng dòng 215 chỉ khẳng định `oCuon.ban`. `oCuon.hoi` bị bỏ, nên ô hội thoại tự cuộn không được đo ở E2. Ở E14, man-ma-tran.mjs:121 cũng chỉ kiểm trang không cuộn.
  lý do vào hợp đồng: AC-2 hứa mỗi ô cuộn riêng và các khổ 375, 768, 1024, 1440 không tràn; phép đo chỉ phủ một khổ, thiếu 1023 và bỏ ô hội thoại.

- **Hình dạng 4 (khẳng định thiếu đối chứng): E8c bước 2 và 3 khẳng định đích «trong khung nhìn» mà không chứng trước khi bấm nó nằm ngoài khung**
  file: `_acceptance/soan-okr-trang-rieng/rang/man.mjs:296`
  severity: medium
  AC: AC-8
  source: measurement
  detail: Ở bước 2, `trongKhung(t.p, "fieldset[data-noi]")` chỉ kiểm dòng nổi nằm trong khung cuộn sau khi bấm mốc. Theo kịch bản NOP_2 (kich-ban.mjs:65), dòng đổi đầu tiên là Mục tiêu m1 bị sửa chữ, tức dòng trên cùng của bản nháp. Bản nháp đang ở đầu và khổ là 1440×760, nên dòng này đã nằm trong khung trước khi bấm. Vì vậy, phần «đưa vào khung nhìn» xanh cả khi trang không cuộn tới. Ở bước 3 (dòng 299-317), script gán scrollTop=0 cho vùng cuộn của hội thoại nếu tìm thấy, nhưng không khẳng định mốc mới nhất đã ra khỏi khung trước khi bấm «vừa sửa». Nếu hội thoại vừa khung, `cuon` là undefined và mocVao đúng một cách tầm thường. Không có trạng thái đầu âm nào làm đối chứng, nên phép đo không phân biệt được «bấm làm cuộn» với «đích vốn đã hiện».
  lý do vào hợp đồng: AC-8 hứa bấm mốc đưa dòng đổi vào khung nhìn và bấm nhãn «vừa sửa» đưa mốc mới nhất vào khung nhìn; phép đo thiếu trạng thái đầu ngoài khung nên không phân biệt được cuộn thật với đích vốn đã hiện.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Soạn OKR page uses URL keys `tab` and `loc` outside SEARCH_PARAM, and both keys already belong to other features**
  Người dùng thấy gì: Ở màn hình hẹp, mở hoặc đóng một bản ghi bên cạnh có thể làm trang soạn nhảy từ tab Bản nháp về tab Trò chuyện, và tab của bản ghi có thể hiện sai.
  file: `apps/app/app/(app)/[slug]/okr/soan/cau-hinh.ts`
  severity: medium
  Đề xuất: new-contract

- **Failed group undo shows no error**
  Người dùng thấy gì: Khi bấm Hoàn tác trên biên nhận cả nhóm mà hệ thống từ chối hoặc mất mạng, màn hình không đổi và không có thông báo nào, nên người dùng tưởng đã hoàn tác mà thực ra chưa.
  file: `apps/app/app/(app)/[slug]/okr/soan/the-nhap.tsx`
  severity: medium
  Đề xuất: new-contract

- **Rejected or failed submissions still create a checkpoint and become the diff baseline**
  Người dùng thấy gì: Nếu Kara nộp bản nháp mà bị từ chối, hội thoại vẫn hiện mốc như đã nộp thành công, và lần nộp sau bị so với một bản chưa từng được lưu nên số liệu thay đổi hiển thị sai.
  file: `apps/app/app/(app)/[slug]/okr/soan/moc-nop.ts`
  severity: medium
  Đề xuất: new-contract

- **«Còn thiếu» buttons do nothing while the pending-only filter is on**
  Người dùng thấy gì: Khi đang bật chế độ chỉ xem dòng chờ, bấm vào mục Còn thiếu không có phản ứng gì, và người dùng không thấy cách tìm ô số còn thiếu cho tới khi tắt bộ lọc.
  file: `apps/app/app/(app)/[slug]/okr/soan/bang-nhap.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): cau-noi-server soi regex trên mã nguồn trang soạn thay vì đo cờ TrangSoan nhận lúc chạy**
  Người dùng thấy gì: Một kiểm tra nội bộ xem trang soạn có truyền đúng cờ cấu hình Kara hay không chỉ đọc chữ trong mã nguồn nên có thể báo xanh dù cờ sai, hoặc báo đỏ dù trang vẫn chạy đúng.
  file: `apps/app/test/soan-okr-song-lai.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/10 lỗi rơi vào file không bộ đo nào phủ (_acceptance/soan-okr-trang-rieng/rang/man-so.mjs, apps/app/test/soan-okr-song-lai.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
