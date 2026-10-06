# Review findings: tat-preview-agent-okr (round 3)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A hand-written type sits beside the Zod schema instead of being derived with z.infer (r2)**
  Người dùng thấy gì: Chỉ là chuyện gọn gàng trong mã kiểm thử: nếu sau này luật tắt bản xem thử đổi hình dạng thì bài kiểm có thể lệch mà không báo. Người dùng cuối không bị ảnh hưởng, sửa tốn công hơn hậu quả.
  file: `apps/agent-okr/test/vercel-trien-khai.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **The wait limit and poll interval are copied into two scripts instead of living in the shared module (r2)**
  Người dùng thấy gì: Thời gian chờ kết quả triển khai được ghi ở hai nơi riêng; ai đổi một nơi mà quên nơi kia thì hai phép đo chờ lâu khác nhau. Không ảnh hưởng đến sản phẩm đang chạy.
  file: `_acceptance/tat-preview-agent-okr/rang/vercel-production.mjs`
  severity: low
  Đề xuất: wont-fix

- **vercel-production.mjs ignores a failed `git fetch` and measures a stale origin/onehub, which can give a false green on AC-5 (r2)**
  Người dùng thấy gì: Nếu máy không kéo được nhánh onehub mới nhất do lỗi mạng, phép kiểm bản Production có thể báo xanh dựa trên bản cũ, trong khi bản chứa cấu hình mới chưa được kiểm. Người ký cần biết để chạy lại khi mạng ổn.
  file: `_acceptance/tat-preview-agent-okr/rang/vercel-production.mjs`
  severity: medium
  Đề xuất: known-limits

- **tpa_vercel_production_xanh passes no sha, though E7 promises to measure the merge commit given as an argument (r2)**
  Người dùng thấy gì: Phép kiểm bản Production đo bản mới nhất của onehub chứ không đúng bản gộp của PR này. Nếu có PR khác gộp vào trước, kết quả có thể báo đỏ nhầm và đổ lỗi cho cấu hình mới.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): mã thoát E10 bo-tay không đòi có bản deploy tay làm mồi (r2)**
  Người dùng thấy gì: Bài thử để chứng minh phép đo không bị bản triển khai thủ công đánh lừa có thể báo đạt dù bản thủ công đã không còn trong dữ liệu, nên lời hứa này chưa chắc đã được thử thật.
  file: `_acceptance/tat-preview-agent-okr/rang/vercel-production.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ đòi chuỗi có mặt): ca json của pha-thu khớp chữ «JSON» trong khung mã nguồn, không phải trong dòng lỗi (r2)**
  Người dùng thấy gì: Bài thử cố ý làm hỏng tệp cấu hình có thể báo đạt dù lỗi thật không phải lỗi sai cú pháp, nên khả năng bắt cấu hình hỏng được chứng minh yếu hơn lời ghi.
  file: `_acceptance/tat-preview-agent-okr/rang/pha-thu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hand-written LuatTrienKhai type sits beside the zod schema instead of coming from z.infer (r1)**
  Người dùng thấy gì: Một chỗ trong bộ kiểm tra viết kiểu dữ liệu bằng tay thay vì suy ra từ khuôn mẫu, nên sau này sửa khuôn mẫu dễ quên sửa theo. Người dùng không thấy gì khác đi, chỉ tốn thêm công khi bảo trì.
  file: `apps/agent-okr/test/vercel-trien-khai.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **vercel-doc reads only the first 100 deployments, so the checks pinned to fixed commits will stop finding them over time (r1)**
  Người dùng thấy gì: Công cụ kiểm tra chỉ nhìn vào 100 lần triển khai gần nhất trên Vercel. Khi có thêm nhiều lần triển khai mới, các lần kiểm lại sau này có thể báo đỏ oan hoặc xanh oan dù cấu hình tắt Preview không đổi.
  file: `_acceptance/tat-preview-agent-okr/rang/vercel-doc.mjs`
  severity: medium
  Đề xuất: known-limits

- **TRAN_GIAY and NHIP_GIAY are repeated in two scripts even though the shared module vercel-doc.mjs exists (r1)**
  Người dùng thấy gì: Thời gian chờ và nhịp hỏi lại của công cụ kiểm tra được khai ở hai nơi, muốn đổi phải sửa cả hai. Không ảnh hưởng gì tới người dùng cuối.
  file: `_acceptance/tat-preview-agent-okr/rang/vercel-production.mjs`
  severity: low
  Đề xuất: wont-fix

- **E7: the git fetch result is never checked, so a stale origin/onehub can turn E7 green on a sha that has no vercel.json (r1)**
  Người dùng thấy gì: Nếu máy không tải được bản mới nhất của nhánh chính, bước kiểm tra Production sau khi trộn có thể báo thành công trên một phiên bản cũ chưa có tệp tắt Preview. Người ký có thể tưởng bản Production đã được kiểm đúng trong khi thực ra chưa.
  file: `_acceptance/tat-preview-agent-okr/rang/vercel-production.mjs`
  severity: medium
  Đề xuất: known-limits

- **trienKhaiCho reads only the newest 100 deployments, so E6, E8 and E10 will break as new deployments push their pinned shas out (r1)**
  Người dùng thấy gì: Các phép kiểm lại trên Vercel sẽ dần không tìm thấy những lần triển khai cũ khi có nhiều lần triển khai mới hơn, và báo lỗi dù không có gì hỏng trong sản phẩm. Ai chạy kiểm lại sau này cần biết điều đó để không tưởng là sự cố thật.
  file: `_acceptance/tat-preview-agent-okr/rang/vercel-doc.mjs`
  severity: medium
  Đề xuất: known-limits

- **bo-tay mode (E10) exits 0 without checking that the CLI deployment was found and skipped (r1)**
  Người dùng thấy gì: Phép kiểm chứng minh bản triển khai làm tay không đánh lừa được công cụ có thể báo đạt ngay cả khi bản làm tay đó đã biến mất khỏi danh sách. Khi đó lời hứa chỉ được chứng minh một nửa.
  file: `_acceptance/tat-preview-agent-okr/rang/vercel-production.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 (đo ref cố định thay vì sha đang kiểm): rang Production chế độ xanh lấy origin/onehub và không kiểm sha đó có apps/agent-okr/vercel.json (r1)**
  Người dùng thấy gì: Bước kiểm tra Production sau khi trộn luôn lấy đầu nhánh chính tại thời điểm chạy mà không xác nhận phiên bản đó đã có tệp tắt Preview. Có thể báo đạt trên một phiên bản chưa chứa thay đổi này.
  file: `_acceptance/tat-preview-agent-okr/rang/vercel-production.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (khớp khung mã nguồn thay vì đầu ra): ca «json» của pha-thu đòi chữ «JSON» mà dòng mã nguồn bun in ra luôn có (r1)**
  Người dùng thấy gì: Một ca thử cố ý làm hỏng tệp cấu hình có thể báo đúng vì lý do sai, ví dụ chỉ vì thiếu tệp chứ không phải vì JSON sai. Ca thử vì thế kém chặt hơn vẻ ngoài của nó.
  file: `_acceptance/tat-preview-agent-okr/rang/pha-thu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): chế độ bo-tay cho mã 0 mà không cần đã thấy và bỏ qua bản deploy tay (r1)**
  Người dùng thấy gì: Phép kiểm bản triển khai làm tay chỉ chứng minh là không thấy bản READY, chứ không chứng minh bản làm tay từng có mặt và đã bị loại. Lời hứa không bị bản làm tay đánh lừa vì thế yếu hơn mức cần có.
  file: `_acceptance/tat-preview-agent-okr/rang/vercel-production.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
