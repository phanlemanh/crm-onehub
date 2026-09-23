# Review findings — bo-dung-chung-nhan-chuoi

## Trong hợp đồng

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): AC-7 của bo-dung-chung-nhan-chuoi chỉ grep tên lớp CSS trong markup SSR**
  AC: AC-7
  file: `packages/ui/test/data-table-locale.spec.tsx:98`
  severity: medium
  Test «chữ trong tiêu đề nằm trong lớp cắt kèm dấu ba chấm» chỉ khẳng định `toMatch(new RegExp(`data-slot="table-head-label"[^>]*class="line-clamp-2">${COT_DAI}`))` trên chuỗi `renderToStaticMarkup`. Nó kiểm chỉ dẫn gửi cho trình duyệt (tên lớp), không kiểm đầu ra đã vẽ. Markup tĩnh không có bề rộng cột, nên test không thể biết chữ có bị cắt hay có dấu «…» không. Lời hứa AC-7 của hồ sơ đó lại là «Given tiêu đề dài hơn bề rộng cột, When 768px, Then chữ bị cắt mang dấu ba chấm», và chieu_do của chính eval ghi «Phép đo phải chạy trên tiêu đề DÀI HƠN bề rộng cột — chạy trên tiêu đề ngắn thì nó xanh mà không đo gì». Diff này đổi chuỗi grep từ `class="truncate"` sang `class="line-clamp-2"` để theo lớp mới của bản sửa. Đổi bất kỳ CSS nào làm mất ellipsis mà vẫn giữ tên lớp thì test vẫn xanh. Ở _acceptance/bo-dung-chung-nhan-chuoi/evals.yaml E7 (dòng 163), khuôn máy mới chỉ còn `bdc_bo_dung_ui` (bun run test --filter=@crm/ui), nên phần «ảnh chụp ở 768px» trong cach_do bị bỏ, và phép grep tên lớp này thành phép đo duy nhất của lời hứa ellipsis.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **DataTable rewrites Button's base layout through className instead of adding a variant**
    Người dùng thấy gì: Nút tiêu đề cột sắp xếp đang bị chỉnh sửa cách hiển thị theo kiểu riêng, có thể khiến tiêu đề hai dòng bị vỡ bố cục nếu kiểu nút dùng chung thay đổi sau này.
    file: `packages/ui/src/components/data-table.tsx:693`
    severity: medium
    Đề xuất: new-contract

- **Measurement wrapper uses 3500/3501 as default ports; config.yaml's declared default is 3000/3001**
    Người dùng thấy gì: Công cụ tự động kiểm tra một tính năng khác dùng cổng kết nối riêng, có thể khiến việc xác nhận tính năng đó hoạt động đúng bị bỏ sót trên máy không có sẵn cổng đó.
    file: `_acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh:22`
    severity: low
    Đề xuất: new-contract

- **The arrow-to-text distance check in E3 always measures 0, so it can never fail**
    Người dùng thấy gì: Phép kiểm khoảng cách giữa mũi tên sắp xếp và chữ tiêu đề, thuộc một tính năng khác, không phát hiện được lỗi dù khoảng cách thực tế nhìn thấy rất lớn.
    file: `_acceptance/tieu-de-cot-doc-tron/rang/tieu-de-cot.mjs:204`
    severity: high
    Đề xuất: new-contract

- **The gate command for tieu-de-cot.mjs doesn't set DUOI_CONG, so a stray CHI_MAN shrinks the matrix and still exits 0**
    Người dùng thấy gì: Một bước kiểm tra tự động của tính năng khác có thể báo đạt dù chưa thực sự kiểm tra đủ, khiến lỗi có thể lọt qua mà không ai hay.
    file: `_acceptance/config.yaml:622`
    severity: medium
    Đề xuất: new-contract

- **chup.mjs swallows the table-load timeout and screenshots whatever page loaded as E9 evidence**
    Người dùng thấy gì: Ảnh chụp minh chứng cho một tính năng khác có thể lưu lại đúng lúc trang bị chuyển hướng sai, nhưng vẫn được tính là bằng chứng hợp lệ.
    file: `_acceptance/tieu-de-cot-doc-tron/rang/chup.mjs:24`
    severity: medium
    Đề xuất: new-contract

- **E8's paths leave out the ruler file this diff changed, so later changes to it won't mark E8 stale**
    Người dùng thấy gì: Nếu sau này có người sửa tiếp phần liên quan của một tính năng khác, hệ thống có thể không nhắc kiểm tra lại kết quả cũ đã ghi nhận.
    file: `_acceptance/tieu-de-cot-doc-tron/evals.yaml:167`
    severity: low
    Đề xuất: new-contract

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): phép đo khoảng cách mũi tên–chữ của AC-3 không bao giờ đỏ được**
    Người dùng thấy gì: Phép kiểm khoảng cách giữa mũi tên và chữ tiêu đề, thuộc một tính năng khác, luôn báo đạt bất kể khoảng cách thực tế lớn hay nhỏ.
    file: `_acceptance/tieu-de-cot-doc-tron/rang/tieu-de-cot.mjs:157`
    severity: high
    Đề xuất: new-contract

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): sáu eval khác tiêu chí của bo-dung-chung-nhan-chuoi cùng dùng một lệnh «mã 0» của cả bộ test**
    Người dùng thấy gì: Nếu chỉ một phần chữ tiếng Việt trong bảng bị lỗi hoặc bị xoá nhầm, hệ thống kiểm tra tự động có thể vẫn báo toàn bộ là đạt, khiến lỗi không bị phát hiện trước khi đến tay người dùng.
    file: `_acceptance/bo-dung-chung-nhan-chuoi/evals.yaml:23`
    severity: medium
    Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 7/9 lỗi rơi vào file không bộ đo nào phủ (_acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh, _acceptance/tieu-de-cot-doc-tron/rang/tieu-de-cot.mjs, _acceptance/config.yaml, _acceptance/tieu-de-cot-doc-tron/rang/chup.mjs, _acceptance/tieu-de-cot-doc-tron/evals.yaml, _acceptance/bo-dung-chung-nhan-chuoi/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
