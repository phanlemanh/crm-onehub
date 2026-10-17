## Trong hợp đồng

- **AC-5: kiểm tra ô ngành null không bao giờ đỏ được, không xác nhận ô trống hiện như trước**
  file: `apps/app/test/dich-ten-nganh-bang-bang.dom.tsx:370`
  severity: medium
  AC: AC-5
  source: bugs
  detail: `expect(oNganhTheo(locale, "Cty Z").textContent?.trim()).not.toBe("null")` đúng với mọi cách hiện có thể xảy ra. React không bao giờ in giá trị null thành chữ "null". Nên nếu bỏ nhánh `if (!nganh) return <EmptyCellValue />` thì ô chỉ thành rỗng, rỗng vẫn khác "null", và test vẫn xanh. E6 ghi «dòng industry null → ô hiện EmptyCellValue như trước», nhưng test không có chiều đỏ cho vế này. Cần ghim đúng chữ mà EmptyCellValue hiện ra (dấu «—»), hoặc kiểm phần tử có class text-muted-foreground. Lý do vào hợp đồng: AC-5 cam kết «công ty không có ngành vẫn hiện ô trống như hôm nay» và phép kiểm duy nhất của vế này không thể đỏ, nên vế đó của AC-5 chưa được chứng minh.

- **Assertion âm-tính-một-mình (hình dạng 4): ca industry null chỉ khẳng định ô KHÔNG phải "null", không ghim EmptyCellValue**
  file: `apps/app/test/dich-ten-nganh-bang-bang.dom.tsx:352`
  severity: medium
  AC: AC-5
  source: measurement
  detail: Khối 'ac5' kiểm dòng Cty Z (industry null) bằng đúng một assert âm: `expect(oNganhTheo(locale, "Cty Z").textContent?.trim()).not.toBe("null")`. E6 hứa "dòng industry null → ô hiện EmptyCellValue như trước", mà EmptyCellValue (packages/ui/src/components/empty-cell.tsx) vẽ ra `<span class="text-muted-foreground">—</span>`. Assert hiện tại không có đối chứng dương và không ghim giá trị mong đợi: một mutant cho ô rỗng (""), "undefined", tên một ngành khác, hay bỏ hẳn nhánh `if (!nganh) return <EmptyCellValue />` mà ô vẫn trống, đều xanh. Lời hứa "ô trống như hôm nay" của AC-5 vì thế không được đo. Cách ghim đúng: so với chữ "—" hoặc tìm phần tử EmptyCellValue trong ô. Lý do vào hợp đồng: cùng lỗi với mục trên, vế «công ty không có ngành vẫn hiện ô trống như hôm nay» của AC-5 chỉ được kiểm bằng một assertion phủ định không ghim giá trị mong đợi.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bảng ngành mới làm hỏng cổng lint:slop của kho (rule anti-slop/no-known-value-widening)**
  Người dùng thấy gì: Nhánh này không qua được bước kiểm tra chất lượng mã của kho nên không đẩy lên được theo đường bình thường. Người dùng cuối không thấy gì khác, nhưng bản tên ngành tiếng Việt sẽ không đến tay họ cho tới khi sửa.
  Căn cứ: Không mất dữ liệu và không ảnh hưởng người dùng cuối, nhưng chặn việc đưa bản lên; sửa rất rẻ và chỉ cần làm một lần trước khi gộp.
  file: `apps/app/lib/ten-nganh.ts`
  severity: high
  Đề xuất: new-contract

- **E8: dòng «ngăn công ty hiện tên ngành» ở màn 1440 luôn đạt nhờ chữ có sẵn trong ô bảng, dù ngăn có mở hay không**
  Người dùng thấy gì: Khi chụp màn hình rộng, dòng máy tự báo «ngăn công ty hiện tên ngành: ĐÚNG» có thể đúng ngay cả khi ngăn không mở. Người duyệt nên xem ảnh chụp thay vì tin dòng đó ở khổ rộng.
  Căn cứ: Hệ quả chỉ là một dòng báo có thể gây yên tâm sai ở khổ rộng; ảnh chụp đi kèm vẫn cho thấy sự thật và người xem tự kiểm được.
  file: `_acceptance/dich-ten-nganh-bang-bang/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ (hình dạng 3): dòng kiểm ngăn công ty của E8 xanh nhờ chính cột bảng ở khổ 1440**
  Người dùng thấy gì: Ở màn hình rộng, dòng máy tự báo ngăn công ty đã hiện tên ngành Việt có thể đúng chỉ vì cột bảng bên cạnh đã có sẵn chữ đó. Chỉ ảnh chụp mới chứng được ngăn thật sự hiện đúng.
  Căn cứ: Chỉ làm một dòng báo tự động kém tin cậy ở khổ rộng, không ảnh hưởng người dùng cuối, và người duyệt xem ảnh là thấy ngay.
  file: `_acceptance/dich-ten-nganh-bang-bang/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
