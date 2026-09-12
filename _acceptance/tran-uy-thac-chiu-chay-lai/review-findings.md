## Trong hợp đồng

- **Bản đột biến «bo-record-va-update» lặng lẽ chỉ còn bỏ record, vì regex thứ hai vẫn tìm handler step.started đã bị gỡ**
  file: `_acceptance/tran-uy-thac-chiu-chay-lai/rang/hook-chet.mjs:46`
  severity: medium
  AC: AC-9
  source: conventions
  Bước thứ hai của hình dạng `bo-record-va-update` tìm chuỗi `builderDelegationState.update(() => next);\n\t\t},\n\t\t"step.started"`. Handler `step.started` có ở commit eb01ebe nhưng a3ede53 đã gỡ khỏi `apps/agent/agent/hooks/builder-delegation.ts`, nên phép thay đó không còn khớp. Đã chạy đúng hai phép thay trên bản hook ở HEAD: bước hai trả `matched: false`. Bản đột biến sinh ra là `const next = builderDelegationState.get(); builderDelegationState.update(() => next);`, tức update VẪN còn, trái với tên gọi. Chốt chặn `banDotBien === nguon` không bắt được, vì nó chỉ so cả chuỗi, mà bước một đã làm chuỗi đổi. Bài đo vẫn in «bi bat» và XANH, nhưng hình dạng «bỏ cả record lẫn update» mà hồ sơ khai là đã đo thì thực tế không được đo nữa. Đây đúng loại lỗi mà commit acf0ed9 («ba bản đột biến đều dẫn từ văn bản thật») định chặn. Cách vá: kiểm TỪNG phép thay có khớp không và gọi `chet(...)` khi một bước không khớp, hoặc viết lại bước hai theo mã hiện tại.
  Lý do trong hợp đồng: AC-9 đặt tên tường minh ba hình dạng đột biến phải được đo, trong đó có 'bỏ record và update'; finding cho thấy shape này ở HEAD chỉ còn thực sự bỏ record (update vẫn còn dưới dạng no-op), tức đột biến được chạy không đúng hình dạng mà AC-9 hứa đo.

- **hook-chet.mjs: dạng đột biến 2 chỉ áp được một nửa mà vẫn báo là đã đo đủ**
  file: `_acceptance/tran-uy-thac-chiu-chay-lai/rang/hook-chet.mjs:46`
  severity: medium
  AC: AC-9
  source: bugs
  Theo E9 trong evals.yaml, dạng `bo-record-va-update` phải bỏ cả lời gọi `recordBuilderDelegation` lẫn `builderDelegationState.update`. Phép thay thứ hai lại cần chuỗi `"step.started"` đứng ngay sau dòng `update`. Commit a3ede53 đã xoá handler `step.started` khỏi `apps/agent/agent/hooks/builder-delegation.ts`, nên phép thay đó giờ không làm gì và không báo gì.

  Tôi đã chạy đúng hai regex này trên file hook hiện tại. Kết quả: `record removed: true`, `update removed: false`. Bản đột biến thực chất là `const next = builderDelegationState.get(); builderDelegationState.update(() => next);`, không phải dạng "giữ gác + get(), bỏ record và update" mà E9 khai.

  Chốt `banDotBien === nguon` (dòng 138) chỉ bắt được khi cả hai phép thay cùng không ăn. Một phép ăn, một phép trượt thì lọt qua, và bộ đo vẫn in "bị bắt" cho một dạng khác với dạng đã hứa.

  Hôm nay kết quả tình cờ không đổi: `oSauLanMot` vẫn rỗng nên dạng này vẫn đỏ. Nhưng bằng chứng E9 đang ký cho một dạng đột biến không được chạy. Lần sau mã hook đổi, cũng chốt này sẽ tiếp tục giấu một phép thay trượt.

  Cách sửa: kiểm từng phép `.replace`, không kiểm cả chuỗi. Hoặc bỏ neo `step.started` và chỉ neo vào dòng `update`. Phép thay nào không ăn thì thoát mã 2.
  Lý do trong hợp đồng: Cùng lỗi với finding trên, mô tả chi tiết cơ chế: chốt so sánh toàn chuỗi không phát hiện được khi chỉ một trong hai phép thay của hình dạng 'bỏ record và update' khớp, nên hình dạng đo được không còn đúng như AC-9 đặt tên.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): răng hook-chet coi mọi dòng 'N fail' là đột biến đã bị bắt**
  Người dùng thấy gì: Công cụ kiểm tra tự động của tính năng này có thể báo nhầm là 'đã chặn được lỗi' ngay cả khi lỗi xảy ra vì một nguyên nhân không liên quan (ví dụ do thiếu file), nên trong tương lai một lỗi thật có thể không thực sự được kiểm tra dù báo cáo vẫn hiện xanh.
  file: `_acceptance/tran-uy-thac-chiu-chay-lai/rang/hook-chet.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): chốt 'phép cắt đã cắm vào mã' chỉ kiểm văn bản khác đi, nên hình dạng bo-record-va-update ở HEAD không phải hình dạng đã khai**
  Người dùng thấy gì: Cách công cụ kiểm tra xác nhận 'đã chặn đúng lỗi' hiện chỉ dựa vào việc đoạn mã có đổi khác đi hay không, chứ chưa tự chứng minh đúng phần cần xoá đã biến mất, nên nếu mã nguồn thay đổi tiếp trong tương lai, một sai sót có thể lọt qua mà báo cáo vẫn hiển thị an toàn.
  file: `_acceptance/tran-uy-thac-chiu-chay-lai/rang/hook-chet.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
