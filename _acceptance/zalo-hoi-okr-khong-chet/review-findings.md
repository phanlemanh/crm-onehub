# Review findings: zalo-hoi-okr-khong-chet (round 1)

## Trong hợp đồng

(không có finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The fix relies on an override that docs/agent.md says does not work on the installed eve, and no eval runs that path on real eve**
  Người dùng thấy gì: Nếu trợ lý Zalo vẫn tự chọn hỏi trợ lý OKR, bản sửa có thể không chặn được và lượt trả lời vẫn chết như cũ. Hiện chưa có phép thử nào trên máy thật cho trường hợp đó, chỉ mới thấy bot không gọi trong sáu lượt thử.
  file: `apps/agent/agent/tools/tro-ly-okr-ngoai.ts`
  severity: high
  Đề xuất: new-contract

- **The new transcript label is never used; web chat shows a raw tool name plus model-facing instructions**
  Người dùng thấy gì: Khi người dùng chat với Kara trên web và trợ lý bị từ chối, màn hình có thể hiện tên công cụ thô cùng đoạn hướng dẫn viết cho model thay vì câu thân thiện. Chỉ ảnh hưởng cách hiển thị, lượt trả lời vẫn không chết.
  file: `apps/app/lib/agent-transcript.ts`
  severity: medium
  Đề xuất: known-limits

- **c33.mjs reads a fixed shared run directory instead of the per-run directory E1 promises**
  Người dùng thấy gì: Nếu hai phép đo chạy cùng lúc, kết quả kiểm có thể lấy nhầm bằng chứng của lần chạy khác và báo xanh hoặc đỏ sai. Không ảnh hưởng người dùng cuối, chỉ làm số đo kém tin cậy.
  file: `_acceptance/zalo-hoi-okr-khong-chet/rang/c33.mjs`
  severity: medium
  Đề xuất: known-limits

- **The red direction moves a tracked source file out of the tree; a killed process leaves it out**
  Người dùng thấy gì: Nếu phép thử chiều đỏ bị ngắt giữa chừng, tệp sửa lỗi bị cất đi và không tự trả lại, nên bản gộp sau đó có thể lặng lẽ mất bản sửa. Khôi phục được bằng git nhưng dễ bị bỏ sót.
  file: `_acceptance/zalo-hoi-okr-khong-chet/rang/c33.mjs`
  severity: medium
  Đề xuất: known-limits

- **The subagent name is hardcoded instead of using the SUBAGENT_TRO_LY_OKR constant**
  Người dùng thấy gì: Nếu sau này trợ lý OKR bị đổi tên, bản sửa sẽ âm thầm ngừng có tác dụng mà không có lỗi báo trước, và bot Zalo lại chết lượt khi gặp câu hỏi OKR.
  file: `apps/agent/agent/tools/tro-ly-okr-ngoai.ts`
  severity: low
  Đề xuất: wont-fix

- **The dynamic tool replaces only what the model sees. A call to tro_ly_okr is still sent to the real subagent and the okr-uy-quyen hook kills the turn**
  Người dùng thấy gì: Khi bot Zalo vẫn gọi trợ lý OKR, lượt trả lời có thể vẫn chết và người hỏi nhận câu báo lỗi chung như trước. Bản sửa hiện chỉ làm bot ít gọi hơn chứ chưa chứng minh chặn được lần gọi đó.
  file: `apps/agent/agent/tools/tro-ly-okr-ngoai.ts`
  severity: high
  Đề xuất: new-contract

- **The in-place red run moves the committed tool file out of the tree with no protection against a kill**
  Người dùng thấy gì: Nếu phép thử chiều đỏ bị ngắt, thư mục làm việc tạm thời thiếu tệp sửa lỗi cho đến khi có người nhận ra. Khôi phục bằng một lệnh git nên hậu quả nhỏ.
  file: `_acceptance/zalo-hoi-okr-khong-chet/rang/c33.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (assertion âm tính một mình): E1 xanh chỉ đòi vắng dòng giết lượt, không cần tác nhân kích lỗi xảy ra, nên không phân biệt được code đã sửa với code chưa sửa**
  Người dùng thấy gì: Phép thử sáu lượt trên máy thật có thể báo xanh dù bản sửa không có tác dụng, vì bot thường không gọi trợ lý OKR. Nên xanh ở đó chỉ nói là không hồi quy, chưa chứng minh bản sửa hoạt động.
  file: `_acceptance/zalo-hoi-okr-khong-chet/rang/c33.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
