## Trong hợp đồng

- **Hình dạng 4 (âm tính một mình): phần "0 dòng AgentTask chưa xong" của E5 xanh cả trước lẫn sau bản vá**
  file: `_acceptance/test-api-khong-de-viec-vo-chu/rang/dem-sot.ts:88`
  severity: medium
  AC: AC-5
  source: measurement
  detail: caGoi() gộp chuaXong.length + lienHe.length + congTy.length > 0 vào một điều kiện exit 1 duy nhất. Đối chứng dương duy nhất là _prisma_migrations >= 1, tức là chỉ kiểm cơ sở dữ liệu đã chạy migration, không kiểm lượt test có thật sự sinh dòng AgentTask. Bản ghi chiều đỏ evidence/chieu-do/vvc_ca_goi_api.truoc-va.log trên mã trước vá in "agentTask moi trang thai: []" và "agentTask chua xong=0": thành phần AgentTask ra 0 ngay cả trên mã lỗi, và exit 1 ở lần đó chỉ đến từ 11 liên hệ và 25 công ty. evals.yaml E5 tự thừa nhận "chiều đỏ của dòng việc do E4 gánh". Hệ quả: vế AgentTask trong AC-5 ("0 dòng AgentTask chưa xong", đúng loại hỏng làm đỏ claimDue ở gói agent) không có phép đo nào trong E5 phân biệt được mã đúng với mã sai. Vế đó chỉ dựa vào E4, mà E4 là một tình huống tự dựng trên một file, không phải cả gói.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hình dạng 4 (âm tính một mình): số "bo phan" của E1 bằng 0 theo cấu trúc, không bao giờ đỏ được**
    Người dùng thấy gì: Nếu luồng thiết lập ban đầu (onboarding) tạo ra bộ phận rồi để sót lại, bài kiểm tra hiện tại sẽ không phát hiện ra — phần này đã được ghi nhận từ trước là nằm ngoài phạm vi của tính năng dọn dẹp lần này.
    file: `_acceptance/test-api-khong-de-viec-vo-chu/rang/dem-sot.ts:38`
    severity: low
    Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
