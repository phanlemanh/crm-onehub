# Review findings — soan-okr-trang-rieng (round 2)

## Trong hợp đồng

- **Hoàn tác một Mục tiêu tính cả các KR mà Kara đã bỏ, rồi báo Kara là người dùng đã hoàn tác chúng**
  file: `apps/app/app/(app)/[slug]/okr/soan/the-nhap.tsx:458`
  severity: medium
  source: bugs
  AC: AC-5
  detail: Ở luat-ban-nhap.ts:103-108, soBanNhap tạo dòng «da-bo» từ những dòng đang chờ của lượt trước mà lần nộp mới không còn. Các dòng này được gán giả `trangThai: "bac"`. cayNhap gắn chúng vào Mục tiêu cha vẫn còn trong bản nháp theo chaKhoa (luat-ban-nhap.ts:36-41). Ở NhomMucTieu, dòng 458 tính `keo = con.filter((d) => HOAN_DUOC.has(d.trangThai))`, và HOAN_DUOC có "bac", nên các dòng da-bo giả này bị tính vào keo. Hậu quả có hai.

  Thứ nhất, biên nhận của Mục tiêu đã nhận ghi «· hoàn tác kèm N KR» với N đếm dư. Ví dụ, người dùng nhận Mục tiêu 1. Ở lượt sau, Kara nộp lại và bỏ một KR đang chờ của nó. Biên nhận khi đó tính luôn KR đã bỏ, trong khi ghiHoan ở API (soan-ban-nhap.ts) chỉ kéo các KR đã quyết thật trong tập hiện. Với Mục tiêu đã bỏ qua, `soAn = con.length` cũng đếm dư theo cùng cách.

  Thứ hai, khi bấm Hoàn tác, bang-nhap.tsx:121 gọi `s.themQuyetBang([d, ...keo].map((x) => quyetCua(x, "hoan")))`. Lệnh này thêm mục «hoan» cho cả KR da-bo. KR đó chưa từng có quyết định nào trong hàng chờ, nên rutGonQuyet (khoi-ngu-canh.ts:61-69) không tìm thấy cặp để triệt tiêu và giữ nguyên mục ấy. Kết quả: dòng hệ thống hiện «Sẽ gửi kèm lượt sau: … Bạn đã hoàn tác KR «X»». Khối ngữ cảnh của lượt kế cũng gửi cho Kara một quyết định người dùng không hề làm, với một KR mà chính Kara vừa bỏ.

  Hướng sửa: lọc dòng da-bo khỏi keo và soAn, ví dụ loại các dòng có `n.s.nhan.get(d.khoaDong) === "da-bo"`.

- **Hình dạng 4 (khẳng định thiếu đối chứng): E11b bước 1 «số giữ qua nộp lại» không chứng điều kiện id dòng đã đổi, và chiều đỏ khoa-theo-id dựng lỗi bằng tải lại trang chứ không bằng nộp lại**
  file: `_acceptance/soan-okr-trang-rieng/rang/man-so.mjs:88`
  severity: medium
  source: measurement
  AC: AC-11
  detail: Lời hứa của AC-11 là số được khoá theo khoaDong nên vẫn còn sau một lần nộp lại làm đổi id dòng. Dòng 87-88 chỉ IN `id dong doi sau nop lai: X/N`, gom trên cả 7 dòng, và không có kiem/buoc nào đòi id của hai dòng đang đo (k11, k12) phải khác trước. Bằng chứng E11b-output.html ghi 6/7, nghĩa là có một dòng giữ nguyên id, và script không nói được đó có phải k11 hay k12 không. Nếu dòng giữ id rơi đúng vào dòng đang đo, buoc(1) `giongSo(sauNop)` vẫn xanh với bản khoá theo kr.id. Chiều đỏ không bù được chỗ này: nhánh `doDo === "khoa-theo-id"` (dòng 89-107) viết lại sessionStorage sang khoá giả `id-cu-${i}` rồi `t.p.reload()` TRƯỚC khi đọc sauNop. Vì vậy chữ «mat so sau nop lai» sinh ra từ việc mất kho khi tải lại, tức là cùng cơ chế với doc-luc-dung, chứ không từ việc khoá theo id qua lượt nộp lại. Bản ghi đỏ còn cho thấy cả ba bước cùng đỏ một lúc. Hai hướng sửa: (a) đòi id của k11 và k12 sau nộp lại khác id trước, có thông điệp ghim; (b) cho chiều đỏ đi đúng đường nộp lại, không chèn reload.

- **Hình dạng 3 (khẳng định chuỗi có mặt trong khi lời hứa là quan hệ): dòng phụ «n dòng · sửa lúc HH:MM» chỉ có MỘT lần nộp nên không phân biệt được lần nộp cuối với lần nộp đầu**
  file: `apps/app/test/soan-okr-trang.dom.tsx:336`
  severity: low
  source: measurement
  AC: AC-3
  detail: E3 hứa giờ trên dòng phụ là «giờ lần nộp cuối». Ca co-nhap (dòng 328-357) chỉ dựng một tin nop (`nop("n-gio", ...)` với turnId luot-gio) và một sự kiện turn.started lúc 03:42Z, rồi `toContain(m.dong.meta("9", "10:42"))`. Có một lần nộp thì «cuối» trùng «đầu». Bên viết `gioNopCuoi` trong moc-nop.ts:140 dùng `transcript.findLast(...)`, và một bản sửa sai thành `find(...)` (lấy lần nộp đầu) vẫn xanh. grep cả apps/app/test không có bài nào khác gọi gioNopCuoi hay ghim meta với hai lần nộp khác giờ. Đây là phần còn sót của finding round 1 về dòng phụ: phép đo đã thêm giờ, nhưng quan hệ «cuối» trong số nhiều lần nộp vẫn chưa được thực thi. Cần ít nhất hai lần nộp ở hai turn khác giờ, rồi đòi giờ của lần sau.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): k2-khung đọc prop đã dựng nhưng ép thành chuỗi, nên đơn vị px/% chỉ được kiểm trên hằng CO_O_HOI_THOAI/SOAN_UI**
  file: `apps/app/test/soan-okr-trang.dom.tsx:204`
  severity: low
  source: measurement
  AC: AC-2
  detail: E2b hứa: ô hội thoại mang defaultSize 380 (số nguyên = pixel), minSize 300 (pixel), maxSize '50' (chuỗi = phần trăm), «đọc từ prop của ResizablePanel». Kiểu dữ liệu ở đây là ý nghĩa: react-resizable-panels 4.14 đọc số là px và chuỗi không đơn vị là %. Phép đo trên prop đã dựng là `expect(`co o hoi thoai: ${o?.defaultSize}/${o?.minSize}/${o?.maxSize}`).toBe("co o hoi thoai: 380/300/50")`. Template literal xoá mất kiểu, nên `maxSize={50}` (50 px) hay `defaultSize="380"` (380 %) trên phần tử đã dựng vẫn ra đúng chuỗi ấy. Hai expect phía sau (dòng 209-218) mới so kiểu, nhưng so trên hằng `KhungSoanXuat.CO_O_HOI_THOAI` và `SOAN_UI.ocHoiThoai`, tức là trên chỉ dẫn chứ không trên đầu ra. Một ghi đè tại chỗ gọi sau `{...CO_O_HOI_THOAI}` ở khung-soan.tsx:92 sẽ lọt. Nên so bằng `toEqual({defaultSize: 380, minSize: 300, maxSize: "50"})` trên `propsDaDung(...)`. Lớp màn E2 đo bề rộng pixel nên đỡ được phần nào; vì vậy mức thấp.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Soạn OKR page uses URL keys `tab` and `loc` outside SEARCH_PARAM, and both keys already belong to other features** (r1)
  Người dùng thấy gì: Ở màn hình hẹp, mở hoặc đóng một bản ghi bên cạnh có thể làm trang soạn nhảy từ tab Bản nháp về tab Trò chuyện, và tab của bản ghi có thể hiện sai.
  file: `apps/app/app/(app)/[slug]/okr/soan/cau-hinh.ts`
  severity: medium
  Đề xuất: new-contract

- **Failed group undo shows no error** (r1)
  Người dùng thấy gì: Khi bấm Hoàn tác trên biên nhận cả nhóm mà hệ thống từ chối hoặc mất mạng, màn hình không đổi và không có thông báo nào, nên người dùng tưởng đã hoàn tác mà thực ra chưa.
  file: `apps/app/app/(app)/[slug]/okr/soan/the-nhap.tsx`
  severity: medium
  Đề xuất: new-contract

- **Rejected or failed submissions still create a checkpoint and become the diff baseline** (r1)
  Người dùng thấy gì: Nếu Kara nộp bản nháp mà bị từ chối, hội thoại vẫn hiện mốc như đã nộp thành công, và lần nộp sau bị so với một bản chưa từng được lưu nên số liệu thay đổi hiển thị sai.
  file: `apps/app/app/(app)/[slug]/okr/soan/moc-nop.ts`
  severity: medium
  Đề xuất: new-contract

- **«Còn thiếu» buttons do nothing while the pending-only filter is on** (r1)
  Người dùng thấy gì: Khi đang bật chế độ chỉ xem dòng chờ, bấm vào mục Còn thiếu không có phản ứng gì, và người dùng không thấy cách tìm ô số còn thiếu cho tới khi tắt bộ lọc.
  file: `apps/app/app/(app)/[slug]/okr/soan/bang-nhap.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): cau-noi-server soi regex trên mã nguồn trang soạn thay vì đo cờ TrangSoan nhận lúc chạy** (r1)
  Người dùng thấy gì: Một kiểm tra nội bộ xem trang soạn có truyền đúng cờ cấu hình Kara hay không chỉ đọc chữ trong mã nguồn nên có thể báo xanh dù cờ sai, hoặc báo đỏ dù trang vẫn chạy đúng.
  file: `apps/app/test/soan-okr-song-lai.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
