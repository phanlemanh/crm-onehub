# Review findings: muc-tieu-va-kr (round 6)

## Trong hợp đồng

(không có finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **NhipGon copies PaceIndicator from packages/ui into app code instead of adding a variant there**
  Người dùng thấy gì: Trên điện thoại, dấu nhịp tiến độ của KR là một bản sao riêng của thành phần dùng chung. Hiện hai bản hiển thị giống nhau. Sau này đổi tên nhịp ở một nơi mà quên nơi kia thì chữ có thể lệch giữa máy tính và điện thoại.
  file: `apps/app/app/(app)/[slug]/okr/tien-do-kr.tsx`
  severity: medium
  Đề xuất: known-limits

- **User-entered KR title interpolated into translatable text without translate="no"**
  Người dùng thấy gì: Trong khu «Góp vào» của chi tiết mục tiêu, tên KR do người dùng nhập nằm chung câu với chữ giao diện. Trình duyệt tự dịch có thể dịch luôn tên KR. Điều này chỉ xảy ra khi người xem bật dịch tự động.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **Same-named AN_DUOI_MD constant redefined with different values in two files in the same area**
  Người dùng thấy gì: Điểm ngắt giữa bố cục điện thoại và máy tính của bảng OKR bị viết ở ba chỗ. Người dùng không thấy gì khác, chỉ là sau này đổi điểm ngắt sẽ phải sửa nhiều nơi.
  file: `apps/app/app/(app)/[slug]/okr/bang-kr.tsx`
  severity: low
  Đề xuất: wont-fix

- **English 'tienDoTu' always pluralises KRs: 'from 1 KRs'**
  Người dùng thấy gì: Ở giao diện tiếng Anh, mục tiêu chỉ có một KR vẫn hiện «from 1 KRs». Chỉ sai ngữ pháp, số liệu vẫn đúng.
  file: `apps/app/lib/messages/okr.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): danh sách «viết sẵn» của E14 thiếu the-gop-y-okr, dù nguồn của chính danh sách gọi tên hồ sơ này**
  Người dùng thấy gì: Phép kiểm tra hồi quy cho vòng này bỏ sót một hồ sơ OKR đã ký là «thẻ góp ý». Nếu menu KR trong chi tiết mục tiêu hỏng, hồ sơ đó có thể đỏ mà phép kiểm này vẫn báo xanh.
  file: `_acceptance/muc-tieu-va-kr/rang/ho-so-cham.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đo qua vật thay): E8 ca (b) nói «không có [data-khu=vi-sao]» nhưng chỉ đo việc không có p[translate=no] bên trong khu**
  Người dùng thấy gì: Chi tiết mục tiêu có thể hiện nhầm khu «Vì sao lúc này» (tiêu đề trống) khi lý do chỉ toàn khoảng trắng, mà phép kiểm tra không bắt được. Người dùng sẽ thấy một khu rỗng.
  file: `apps/app/test/muc-tieu-va-kr.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
