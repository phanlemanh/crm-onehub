# Review findings: muc-tieu-va-kr (round 3)

## Trong hợp đồng

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): thước không-vẽ-tay bỏ sót lớp viền trần `border`**
  file: `_acceptance/muc-tieu-va-kr/rang/khong-ve-tay.mjs:16`
  severity: medium
  AC: AC-8
  source: measurement
  detail: AC-8 và E11 hứa: không `SimpleTableRow` nào trong okr/** hay objective-sheet.tsx được mang lớp màu nền, viền hoặc bo góc. Thước định nghĩa lớp cấm là `lopCam: /^-?(bg-|border-|rounded)/`. `rounded` không cần gạch nên bắt được cả `rounded` trần, còn viền thì phải có `border-`. Vì vậy lớp viền trần `border` (1px mọi cạnh), cũng như `!border` sau khi bỏ `!`, đều đi lọt. Thử: `<SimpleTableRow className="border">` hay `className={cn("p-2", "border")}` cho `goc("border") = "border"`, regex không khớp, script thoát 0. Ma trận tự kiểm chín dạng (dòng 19-29) chỉ là các điểm-case `border-b-0`, `border-t`, `data-[state=open]:border-t`. Không có dạng `border` trần, nên chính bộ tự kiểm không phát hiện ra lỗ này. Thước tuyên đo cả lớp «viền», nhưng ma trận không phủ đủ phần tử của lớp đó.
  rationale: AC-8 cấm rõ mọi lớp viền đặt lên hàng bảng tại chỗ gọi, mà phép đo của lời cấm này để lọt lớp viền trần nên không chứng minh được lời hứa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **NhipGon copies PaceIndicator from packages/ui into app code**
  Người dùng thấy gì: Dấu nhịp trên màn hình điện thoại và trên máy tính hiện do hai đoạn mã riêng vẽ. Hôm nay hai bên giống nhau, nhưng sau này sửa một bên có thể làm lệch bên kia.
  file: `apps/app/app/(app)/[slug]/okr/tien-do-kr.tsx`
  severity: medium
  Đề xuất: new-contract

- **Row layout for the objective block is hand-copied from BangKr's column list**
  Người dùng thấy gì: Độ rộng cột của hàng mục tiêu được chép tay từ bảng KR. Nếu sau này ai đổi độ rộng hoặc thêm cột ở bảng KR, hàng mục tiêu có thể lệch cột mà không có gì báo.
  file: `apps/app/app/(app)/[slug]/okr/khoi-muc-tieu.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): «hàng tiêu đề không chiếm chỗ nhìn thấy» chỉ đo bằng việc có lớp `sr-only`**
  Người dùng thấy gì: Việc hàng tiêu đề cột thật sự không chiếm chỗ trên màn hình mới được kiểm bằng chỉ dẫn, chưa đo trên trình duyệt thật. Nếu có lệch, người dùng sẽ thấy tiêu đề cột lặp lại hoặc cột chia sai giữa các khung mục tiêu.
  file: `packages/ui/test/simple-table-hang.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): dòng «mọi màn» của bảng trạng thái chỉ dựng trên một hoặc hai màn**
  Người dùng thấy gì: Trạng thái KR nguồn máy và KR mốc mới được thử trên một hai màn, chưa thử hết các màn như bảng trạng thái hứa. Một màn chưa thử có thể hiển thị khác mà chưa ai biết.
  file: `apps/app/test/muc-tieu-va-kr.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): «mũi tên chỉ phải khi thu» chỉ đo bằng tên lớp**
  Người dùng thấy gì: Hướng mũi tên khi thu gọn mục tiêu mới được kiểm qua tên lớp, chưa đo góc quay thật. Nếu sai, người dùng thấy mũi tên chỉ hướng lạ nhưng thu và mở vẫn chạy đúng.
  file: `apps/app/test/muc-tieu-va-kr.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (assertion âm tính một mình): reduced-motion chỉ kiểm `0s`, đối chứng không-giảm chỉ được ghi chứ không khẳng định**
  Người dùng thấy gì: Phép thử chế độ giảm chuyển động chưa chứng minh mũi tên có chuyển động khi người dùng không bật chế độ đó. Người dùng bật chế độ giảm chuyển động vẫn không thấy mũi tên chuyển.
  file: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
