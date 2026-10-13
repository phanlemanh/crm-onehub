# Review findings: cay-can-chinh-co-ly-do (round 3)

## Trong hợp đồng

Không có phát hiện nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E10: đối chứng tràn ngang bị dời ra body nên không còn chứng minh bộ đo bắt được tràn sinh ra từ trong cây; điểm mù ở 1440 của round 2 bị che chứ không được chẩn**
  Người dùng thấy gì: Phép kiểm tự động xem màn hình có bị cuộn ngang ở khổ rộng 1440 chưa chứng minh được là nó bắt được lỗi tràn sinh ra từ bên trong cây căn chỉnh. Nếu sau này nội dung cây tràn mà bị một khung bên ngoài giữ lại thì kiểm tra vẫn có thể báo ổn. Hiện chưa thấy màn nào bị cuộn ngang thật, nên người dùng chưa gặp lỗi nào.
  file: `_acceptance/cay-can-chinh-co-ly-do/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Phần hiện lý do và mức tin bị viết lại trong cây thay vì chuyển LyDoNoiGop/NGHIA_MUC_TIN vào packages/ui trước khi dùng lần hai (r2)**
  Người dùng thấy gì: Cách hiện lý do và mức tin trên cây được viết thành một bản riêng, không dùng chung với màn chi tiết mục tiêu. Hiện hai nơi vẫn hiện đúng, nhưng sau này sửa chữ hay dấu Kara ở một nơi thì nơi kia có thể không đổi theo.
  file: `apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx`
  severity: medium
  Đề xuất: known-limits

- **Schema canhCanChinh chép tay bốn trường của noiGopOutput thay vì suy ra từ schema có sẵn (r2)**
  Người dùng thấy gì: Hai chỗ trong hệ thống khai cùng một dạng dữ liệu lý do, nên sau này nếu chỉ siết một chỗ thì cây và màn mục tiêu có thể trả khác nhau. Hiện người dùng chưa thấy sai lệch nào.
  file: `apps/api/src/okr/okr-xem.contracts.ts`
  severity: low
  Đề xuất: wont-fix

- **LOC_MUC_TIN_CAY viết cứng các giá trị mức tin thay vì lấy từ enum dùng chung (r2)**
  Người dùng thấy gì: Nếu sau này đổi tên một mức tin ở phía máy chủ mà quên đổi ở bộ lọc, bộ lọc sẽ lặng lẽ không khớp nút nào và màn hiện rỗng. Hiện tại các tên đang khớp nên chưa ảnh hưởng người dùng.
  file: `apps/app/app/(app)/[slug]/okr/okr-search-params.ts`
  severity: low
  Đề xuất: wont-fix

- **Lọc theo mức tin bỏ cả nhóm «Chưa căn chỉnh», nên cạnh khớp trong nhóm đó biến mất dù số trên chip vẫn đếm chúng (r2)**
  Người dùng thấy gì: Khi lọc «Chưa có lý do» hay «Đặt cược», những nối nằm dưới nhóm mục tiêu chưa căn chỉnh bị giấu, trong khi số trên nút lọc vẫn đếm chúng. Người dùng có thể thấy số lớn hơn 0 nhưng màn báo không có mục tiêu nào.
  file: `apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): nút KR trong bài DOM mang objectiveId bằng chính id của nó, không giống writer (r2)**
  Người dùng thấy gì: Bài kiểm tự động của màn cây dùng dữ liệu giả hơi khác dữ liệu thật ở các nút KR, nên một lỗi đọc nhầm cạnh dưới KR có thể lọt qua mà bài kiểm vẫn xanh. Người dùng không thấy lỗi nào hiện nay.
  file: `apps/app/test/cay-can-chinh-ly-do.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): l3-quyen trên bộ mẫu đòi 0 vi phạm mà không đòi có cạnh nào (r2 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm quyền xem cạnh có thể vẫn xanh kể cả khi máy chủ không trả cạnh nào cho ai. Người dùng không bị ảnh hưởng, chỉ là lưới an toàn kiểm thử lỏng hơn mong muốn.
  file: `apps/api/test/okr-cay-ly-do.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «có mặt» thay cho quan hệ): ba ca L2 trong l3-canh so bằng tập mức tin, không so từng mã với mức của nó (r2 · tệp đã đổi)**
  Người dùng thấy gì: Một bài kiểm chỉ xác nhận có đủ ba mức tin chứ không xác nhận từng mục tiêu mẫu mang đúng mức của nó. Một bài kiểm khác đã kiểm từng mục tiêu nên rủi ro thực tế thấp.
  file: `apps/api/test/okr-cay-ly-do.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (assertion âm tính đứng một mình): «chip có số 0 vẫn bấm được» chỉ kiểm việc thiếu thuộc tính disabled (r2)**
  Người dùng thấy gì: Bài kiểm chưa chứng minh chắc rằng nút lọc có số 0 bấm được bằng cách khác ngoài việc không bị đánh dấu khoá. Nếu sau này nút bị khoá bằng cách khác, bài kiểm có thể không bắt được.
  file: `apps/app/test/cay-can-chinh-ly-do.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
