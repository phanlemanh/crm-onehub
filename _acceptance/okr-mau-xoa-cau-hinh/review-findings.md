# Review findings: okr-mau-xoa-cau-hinh (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **docs/setup.md nói --xoa đưa cấu hình OKR về bản trước bộ mẫu, nhưng phiên bản của người thật lưu sau người mẫu vẫn mang cài đặt người mẫu đã bật**
  Người dùng thấy gì: Sau khi gỡ bộ OKR mẫu, nếu quản trị viên thật đã lưu cấu hình sau người mẫu thì cấu hình của họ vẫn giữ các cài đặt AI mà người mẫu đã bật, chỉ mất mã đơn vị mẫu. Tài liệu đang nói cấu hình quay hẳn về bản trước bộ mẫu, nên người đọc có thể tưởng mọi cài đặt do người mẫu bật đã được gỡ hết.
  file: `docs/setup.md`
  severity: low
  Đề xuất: known-limits

- **Spec checks the omx-xoa array-scan column list for inclusion only, while eval E1 requires equality (r1)**
  Người dùng thấy gì: Lệnh gỡ bộ OKR mẫu vẫn gỡ đúng. Chỉ là bài kiểm tự động kiểm lỏng hơn lời hứa viết trong tệp tiêu chí, nên người đọc hai chỗ sẽ thấy hai mức chặt khác nhau.
  file: `apps/api/test/okr-mau-cuoc-soan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — kiểm chuỗi có mặt cho hai con số đếm bằng nhau, nên không bắt được việc in đảo hai số (r1)**
  Người dùng thấy gì: Nếu sau này lệnh gỡ bộ mẫu in nhầm chỗ hai con số (số bản đã xoá và số bản đã gỡ mã), bài kiểm hiện tại vẫn báo xanh, và người chạy lệnh có thể đọc sai kết quả gỡ.
  file: `apps/api/test/okr-mau-cau-hinh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — phép đối chiếu cột mảng là hằng đúng, và evals đòi hai tập bằng nhau nhưng spec chỉ kiểm tập này chứa tập kia (r1)**
  Người dùng thấy gì: Nếu có thêm một cột danh sách mới ở loại khác ngoài sáu cột đã ghim, bài kiểm có thể không báo đỏ, và lệnh gỡ bộ mẫu có thể sót mã mẫu trong cột đó mà không ai hay.
  file: `apps/api/test/okr-mau-cuoc-soan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — omc-tra-lai đo hàm traLai() chạy giữa lượt, không đo trạng thái afterAll để lại (r1)**
  Người dùng thấy gì: Bài kiểm không chứng minh được rằng bảng cấu hình chương trình OKR sạch như cũ sau khi cả bộ test chạy xong. Nếu việc dọn cuối bị bỏ sót, cấu hình dùng chung có thể bị lẫn dữ liệu thử trong lượt kiểm kế tiếp.
  file: `apps/api/test/okr-mau-cau-hinh.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
