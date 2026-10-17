## Trong hợp đồng

- **Hình 4 (khẳng định âm tính đứng một mình): ở E12 lời hứa «mốc M giữ hoan_tat» thực ra là một hằng tự so với chính nó, còn vòng so sánh lại duyệt theo phía đầu ra**
  AC: AC-7
  file: `apps/api/test/ban-chup-lo-trinh.spec.ts:541`
  severity: medium
  detail: kiemDayGioMay trả về `{ khoa: m.ten, hoanTat: "2026-10-31" }`, tức một chuỗi viết cứng, không đọc lại từ bản chụp đã lưu. Bài test sau đó `expect(hoanTat).toBe("2026-10-31")` (dòng 549), nên dòng này luôn xanh. Ý 2 của E12 («moc M co du_kien.hoan_tat bang gia tri da dat») vì vậy không có đối chứng dương nào. Phần kiểm duy nhất còn lại là vòng `kq.banChup.duLieu.lo_trinh.forEach((l, i) => { const lt = tho.lo_trinh[i]; ... })` ở dòng 528. Vòng này duyệt mảng lo_trinh của ĐẦU RA và chỉ ném lỗi khi thấy lệch. Nếu bản chụp đọc lại bị mất hay cụt lo_trinh, hoặc mất mốc M, vòng sẽ không chạy tới phần tử đó và bài vẫn xanh. Bản phá thử chỉ gán du_kien = null nên không lộ ra lỗ này. Cần đọc du_kien.hoan_tat của M từ `kq.banChup` và so độ dài lo_trinh, moc với khối nguồn.
  rationale: AC-7 hứa mốc hiện đúng ngày dự kiến khi khối đi qua đường đẩy bản chụp và máy chủ lưu; phép đo E12 so một hằng viết cứng nên không chứng được vế đó.
  source: measurement

- **Hình 4 (khẳng định âm tính đứng một mình): «khối thật qua khuôn giữ nguyên bốn khoá» lấy đối chứng dương ở đầu vào, còn vòng so lại duyệt đầu ra**
  AC: AC-1
  file: `packages/validation/test/lo-trinh-du-lieu.spec.ts:212`
  severity: medium
  detail: kiemGiuKhoa duyệt `kq.duLieu.lo_trinh.forEach((lo, i) => { const lt = tho.lo_trinh[i]; lt?.hang.forEach... lt?.moc.forEach... })` và chỉ ném lỗi khi lệch. Nếu khuôn trả về ít lo_trinh hơn khối thô, phần dư không bao giờ được so. Biến coNgay ở dòng 242 tính bằng `khoiTho.parse(khoi)`, tức trên đầu vào, không trên `kq.duLieu`. Vì thế nó không chứng được rằng đầu ra còn mốc có du_kien. Đối chiếu với packages/validation/test/ban-chup-lo-trinh.spec.ts: ở đó coNgay++ nằm trong vòng duyệt đầu ra nên làm được đối chứng dương. Thêm nữa, trong LO-TRINH.html thật mọi qua_tai đều null (0/36 mốc), nên việc so qua_tai ở đây là null so với null, không chứng được khuôn giữ khoá này.
  rationale: AC-1 đòi khối mang bốn khoá mới đi qua khuôn đọc còn nguyên giá trị; phép đo đếm trên đầu vào nên không chứng được đầu ra còn giữ.
  source: measurement

- **Hình 3 (đo chuỗi có mặt thay cho quan hệ giữa các giá trị): ô bản chụp của E9 chỉ tìm tiền tố cố định của câu cách tính, không đối chiếu với ngay_tinh đã đặt**
  AC: AC-2
  file: `_acceptance/lo-trinh-hien-ngay-du-kien/rang/do-man.mjs:381`
  severity: medium
  detail: Phép kiểm là `chu.includes(t9.cachTinh("").split("(")[0].trim())`, tức chỉ tìm cụm «Máy tính lúc mốc bắt đầu» hoặc «Estimated by the system when the milestone started». cachTinhKhongNgay (câu dùng khi không có ngày tính) mở đầu bằng đúng cụm đó. Vậy nếu màn mất ngày tính, hoặc hiện sai ngày so với `luiNgay(hom, 6)` mà khoiBanChup đã đặt, ô vẫn được chấm DUNG. Lời hứa ở đây là một quan hệ: câu cách tính phải mang formatDay(ngay_tinh, lang). Phép kiểm cần so với `t9.cachTinh(formatDay(ngay_tinh, lang))`.
  rationale: AC-2 đòi câu cách tính mang ngày tính của mốc; phép đo chỉ tìm tiền tố nên màn mất hay sai ngày tính vẫn được chấm đúng.
  source: measurement

- **Hình 3 (đo chuỗi có mặt thay cho quan hệ giữa các giá trị): ý 4 của E9 «tên mốc mang translate=no» đi qua nhờ một phần tử khác trong cùng mốc**
  AC: AC-8
  file: `_acceptance/lo-trinh-hien-ngay-du-kien/rang/do-man.mjs:273`
  severity: medium
  detail: `khongDich: tieuDe.every((e) => e.querySelector("[translate=no]") !== null)` chỉ đòi mỗi `[data-lo-trinh-moc]` có MỘT con cháu bất kỳ mang translate=no. Trong xem-moc.tsx, ngay trong TimelineItem còn có `<span className="text-muted-foreground text-xs" translate="no">{x.lo}</span>`, là tên lộ trình chứ không phải tên mốc. Vì vậy nếu TimelineTitle mất translate="no", cả mười ô vẫn được chấm DUNG. Phép kiểm phải nhắm đúng phần tử tiêu đề, tức phần tử chứa x.moc.ten.
  rationale: AC-8 đòi tên mốc và tên lộ trình không bị dịch; phép đo chấp nhận bất kỳ phần tử nào mang translate=no trong mốc nên không chứng được riêng tên mốc.
  source: measurement

- **Hình 4 (khẳng định âm tính đứng một mình): ý 4 của E7 «việc đã giao, việc chưa hẹn mốc không có ngày dự kiến» xanh ngay cả khi không tìm thấy hàng hay ngăn nào**
  AC: AC-6
  file: `apps/app/test/lo-trinh-du-kien.dom.tsx:511`
  severity: medium
  detail: Bài test làm `expect(vung?.querySelector("[data-lo-trinh-du-kien]") ?? null, "viec da giao co ngay du kien").toBeNull()`. Ở đó `vung` lấy từ `oViec(cho, khoa)` (tức `neo?.closest("tr") ?? undefined`) hoặc từ `querySelector("[data-lo-trinh-chi-tiet-viec]")`. Nếu hàng của việc không hiện (bị lọc q hoặc vongDoi) hoặc ngăn hồ sơ không mở, `vung` là undefined hay null, và khẳng định vẫn xanh. Không có bước nào xác nhận hàng hay ngăn của việc đó thật sự có trên DOM trước khi khẳng định vắng mặt. Hai đường phá thử mà evals.yaml hứa cho E7 cũng không có trong tệp: «ban sao gan duKien cho viec da giao» (dòng 4) và «OUocLuong khong chan null» (dòng 3).
  rationale: AC-6 nói rõ việc đã giao và việc chưa hẹn mốc không hiện ngày dự kiến; phép đo xanh cả khi không có hàng hay ngăn nào để soi.
  source: measurement

- **Hình 4 (khẳng định âm tính đứng một mình): ý 3 của E3 «mốc hết việc không có dòng dự kiến» không xác nhận các mốc đó thật sự có trên màn**
  AC: AC-2
  file: `apps/app/test/lo-trinh-du-kien.dom.tsx:140`
  severity: low
  detail: Với mỗi khoá trong `het`, kiem chỉ kiểm `theoThuoc("data-lo-trinh-du-kien-moc", k).length > 0` để ném lỗi. Không có đối chứng dương rằng `[data-lo-trinh-moc=k]` của mốc đó được vẽ ra. XemMoc lọc bỏ mốc khi `x.ds.length === 0`, nên nếu bộ lọc hay vongDoi làm các mốc hết việc biến mất thì phép đo vẫn xanh mà không đo gì. Bản phá thử ở dòng 167 chép một nút giả rồi gắn khoá của het[0], nên không chứng được các mốc thật có mặt. Với dữ liệu hiện tại, cả 15 mốc hết việc đều có việc nên nhiều khả năng đang hiện, vì vậy tác động thấp. Lỗ hổng nằm ở cách đo chứ không ở số liệu hôm nay.
  rationale: AC-2 nói mốc đã hết việc không có dòng ngày dự kiến; phép đo vắng mặt không xác nhận các mốc ấy được vẽ ra, nên có thể không đo gì.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Test helper hand-writes the gio_may shape beside its Zod schema and casts JSON.parse to that type without parsing**
  Người dùng thấy gì: Không ảnh hưởng trang người dùng thấy. Nếu bộ công cụ đổi hình khối dữ liệu, các bài kiểm sẽ đỏ ở chỗ khó hiểu nguyên nhân hơn mức cần, nên người sửa mất thời gian dò.
  Căn cứ: Chỉ ảnh hưởng người viết bài kiểm, không làm mất hay sai dữ liệu của người dùng; lỗi nếu có sẽ hiện đỏ chứ không im lặng, và sửa sau vẫn rẻ.
  file: `apps/app/test/lo-trinh-du-kien-mau.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
