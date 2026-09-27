## Trong hợp đồng

(không có phát hiện nào ánh xạ được vào AC — mọi tiêu chí AC-1..AC-8 đều đạt qua Evidence ở evidence-report.md.)

Findings: []

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New run failure codes RUNNER_FAILED / RUNNER_NO_RESULT are missing from the UI reason map, so the run history shows the raw provider error**
    Người dùng thấy gì: Khi bộ chạy gặp một số kiểu lỗi mới, người dùng có thể thấy một dòng lỗi kỹ thuật của nhà cung cấp thay vì một câu giải thích dễ hiểu trong lịch sử chạy.
    file: `apps/agent/agent/lib/dong-luot-tac-nhan.ts`
    severity: medium
    Đề xuất: known-limits

- **A stricter stored-result parser can silently wipe a run's stored result, including noActionNeeded, and may flip the run to FAILED**
    Người dùng thấy gì: Một số lượt đang chạy dở từ trước khi cập nhật có thể bị mất kết quả đã lưu, kể cả trạng thái không cần làm gì, mà không có cảnh báo nào cho người dùng.
    file: `apps/agent/agent/lib/run-runtime.ts`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): model của từng phiên được đo qua hàm trợ giúp trong lib/model.ts, còn việc nối vào phiên thật chỉ được đo bằng cách quét mã nguồn**
    Người dùng thấy gì: Phép kiểm hiện tại xác nhận mã nguồn có gọi đúng hàm chọn model, nhưng chưa chắc chắn mọi phiên chạy thật sự áp dụng đúng model đã chọn trong mọi cách viết mã có thể có.
    file: `apps/agent/test/model-theo-vai.integration.spec.ts`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 5 (tuyên cả lớp nhưng số assert khác số phần tử): tên test nói «ba chỗ dùng chung một khuôn» nhưng chỉ có hai assert đồng nhất**
    Người dùng thấy gì: Tên phép kiểm nói xác nhận ba chỗ dùng chung một quy tắc dữ liệu nhưng thực tế chỉ xác nhận hai, nên một bản sao lệch ở chỗ thứ ba có thể lọt qua mà không bị phát hiện.
    file: `apps/agent/test/khuon-di-dong.spec.ts`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 3 (assert «có mặt» trong khi lời hứa là quan hệ giá trị): phép gọi thật chỉ kiểm hai khoá có tồn tại, không kiểm kiểu và giá trị đã yêu cầu**
    Người dùng thấy gì: Phép kiểm gọi model thật chỉ xác nhận có đủ trường dữ liệu trả về, chưa xác nhận đúng kiểu hay đúng giá trị như đã yêu cầu, nên một kết quả sai kiểu vẫn có thể được coi là đạt.
    file: `_acceptance/tac-nhan-model-rieng/rang/goi-that.ts`
    severity: low
    Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
