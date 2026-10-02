# Review findings: muc-tieu-va-kr (round 5)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **NhipGon copies PaceIndicator from packages/ui instead of adding a variant there**
  Người dùng thấy gì: Dấu nhịp ở bản gọn (danh sách và điện thoại) là một bản chép riêng. Hôm nay hai nơi hiện giống hệt nhau, nhưng nếu sau này đổi chữ hay màu của nhịp ở một nơi thì nơi kia có thể lệch.
  file: `apps/app/app/(app)/[slug]/okr/tien-do-kr.tsx`
  severity: medium
  Đề xuất: known-limits

- **English sheet.tienDoTu ignores plural: 'from 1 KRs'**
  Người dùng thấy gì: Ở bản tiếng Anh, mục tiêu chỉ có một KR sẽ hiện câu «from 1 KRs», sai số ít. Người dùng vẫn hiểu đúng, chỉ là câu chưa chuẩn.
  file: `apps/app/lib/messages/okr.ts`
  severity: low
  Đề xuất: known-limits

- **AN_DUOI_MD defined twice with different values in the same OKR area**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng hôm nay. Chỉ là nếu sau này đổi điểm ẩn cột ở một nơi mà quên nơi kia thì bảng có thể ẩn cột lệch nhau.
  file: `apps/app/app/(app)/[slug]/okr/khoi-muc-tieu.tsx`
  severity: low
  Đề xuất: wont-fix

- **nhanKr hardcodes the 'KR' label outside the messages module**
  Người dùng thấy gì: Nhãn KR1, KR2… hiện đúng ở mọi màn. Chữ «KR» chưa đi qua bộ từ điển tiếng Việt/Anh nên nếu sau này muốn đổi cách gọi thì phải sửa thêm một chỗ.
  file: `apps/app/app/(app)/[slug]/okr/kieu.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (đối chứng đỏ rỗng): chiều đỏ của E1 bật vì bộ chọn không thấy gì, không phải vì KR nằm ngoài khung**
  Người dùng thấy gì: Phép kiểm kiểm tra «KR có nằm trong cùng khung với mục tiêu không» được chứng minh là bắt được lỗi bằng một trường hợp quá dễ. Màn hình thật không bị ảnh hưởng, nhưng phép kiểm có thể bỏ sót một kiểu xếp sai tinh vi hơn trong tương lai.
  file: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính đứng một mình): E13 kết luận «không cuộn ngang/dọc» mà không khẳng định tên KR 120 ký tự có mặt trên màn; màn chấm điểm chắc chắn không có tên đó**
  Người dùng thấy gì: Phép kiểm «điện thoại không bị tràn ngang» chưa thật sự thử với một tên KR rất dài, nên nếu có tên dài làm vỡ bố cục thì phép kiểm hiện tại chưa chắc báo. Chưa có bằng chứng màn hình thật bị tràn.
  file: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính đo qua vật thay): E8 ca (c) khẳng định «không [data-khu=gop-vao]» bằng số dòng [data-gop-vao] = [], nên khu vẫn hiện mà rỗng cũng xanh**
  Người dùng thấy gì: Phép kiểm «mục tiêu không góp vào đâu thì không hiện khu Góp vào» chỉ đếm số dòng, nên nếu sau này khu đó hiện ra với tiêu đề mà không có dòng nào thì phép kiểm vẫn xanh.
  file: `apps/app/test/muc-tieu-va-kr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho giá trị): E13 màn chấm nhận mục tiêu đã có điểm chỉ cần nhãn «Điểm » ở đầu**
  Người dùng thấy gì: Trên điện thoại, nếu số điểm của một mục tiêu bị cắt mất mà chữ «Điểm» vẫn còn thì phép kiểm hiện tại vẫn báo đạt. Chưa có bằng chứng số điểm đang bị mất.
  file: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên lớp, đo điểm): dòng ST-mtkr-kr-may và ST-mtkr-kr-moc khai «mọi màn» nhưng ca chỉ dựng Của tôi (và sheet)**
  Người dùng thấy gì: Hiển thị KR nguồn máy và KR dạng mốc mới được kiểm ở «Của tôi» và sheet, chưa kiểm ở «Theo đơn vị» và «Chấm điểm». Nếu chỉ riêng hai màn đó hỏng ở hai loại KR này thì kiểm tra tự động chưa bắt được.
  file: `apps/app/test/muc-tieu-va-kr.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
