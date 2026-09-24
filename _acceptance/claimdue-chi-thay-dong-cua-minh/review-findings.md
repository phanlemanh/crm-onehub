## Trong hợp đồng

Đã sửa trước vòng 2: đối chứng dương cho 'leaves work that is not due yet' và 'stops claiming once the work is finished' (0babbdde); hội đồng E12 trên bản đó chỉ thêm hai bài retireExhausted cùng lớp, đã sửa ở 8ae4b9ba. Nguồn finding dưới đây là review vòng 1 (vòng bị vô hiệu vì agent chấm sửa cây); finding tự nó đúng nên vẫn được xử lý.

- **Hình dạng 4 (khẳng định âm tính đứng một mình): 'leaves work that is not due yet' và 'stops claiming once the work is finished' chỉ đòi rỗng dưới bộ lọc MINE mới**
  file: `apps/agent/test/tasks.integration.spec.ts:102`
  severity: low
  AC: AC-8
  source: measurement
  detail: Sau khi đổi sang `claimDue(10, MINE)`, bài 'leaves work that is not due yet' (dòng 102-106) chỉ khẳng định `expect(claimed).toHaveLength(0)`. Trong cùng lời gọi không có dòng đến hạn nào của chính bài để làm đối chứng dương. Bài 'stops claiming once the work is finished' (dòng 171-182) gọi `await claimDue(10, MINE)` lần đầu mà không assert gì, rồi chỉ đòi `toHaveLength(0)`. Nếu nhánh `only` trả rỗng vô điều kiện, cả hai bài vẫn xanh. Lý do đỏ cũng không được ghim: không phân biệt 'lọc vì chưa đến hạn / đã xong' với 'không lọc được gì'. Các bài anh em ('claims due work and leases it' và các bài khác) có assert dương trên MINE nên phần nào che được. Dù vậy, từng bài riêng lẻ không tự chứng được điều tên nó hứa.
  rationale: AC-8 đích danh đòi mỗi bài trong ba khối đã đổi lọc vẫn đo đúng điều tên nó hứa và cấm khẳng định rỗng tự-đúng sau khi đổi nhánh lọc — đúng lỗi mà finding này mô tả.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có danh sách điểm): chín file 'ghi AgentTask' được viết tay, không đối chiếu với lớp**
  Người dùng thấy gì: Nếu sau này có thêm một chỗ mới ghi việc nghiên cứu vào hàng đợi, phép kiểm chống-đụng-hàng của CI sẽ không tự nhận ra chỗ mới đó — báo cáo vẫn hiện xanh như thể đã quét đủ, dù thực ra bỏ sót.
  file: `_acceptance/claimdue-chi-thay-dong-cua-minh/rang/chung-luot.sh`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).