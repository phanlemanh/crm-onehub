# Review findings: okr-mau-xoa-cau-hinh (round 1)

## Trong hợp đồng

- **docs/setup.md still says `--xoa` touches nothing else, but it now rewrites config versions that aren't from the sample**
  AC: AC-8
  file: `docs/setup.md:73`
  severity: medium
  source: conventions
  detail: The command block in «Bộ OKR mẫu» still says `bun run okr:mau --xoa  # gỡ bộ mẫu, không đụng gì khác` (removes the sample set, touches nothing else). That is no longer true after this diff. In apps/api/scripts/okr-mau/nap.ts, xoaTrong now runs tx.okrProgramConfig.update on every version in cauHinhGat. Those versions were created by real users, and the update removes the `mau-okr-*` entries from their six *DonVi arrays. Deleting the versions made by sample users also rolls the active program config back to an earlier version. The new paragraph a few lines above describes both effects, so the one-line comment now contradicts it. A reader who skims the commands will think `--xoa` is safe for real data. The comment should say that `--xoa` also removes sample unit ids from other config versions and rolls back the active config.
  rationale: AC-8 đòi người mới đọc mục «Bộ OKR mẫu» biết --xoa gỡ mã đơn vị mẫu khỏi các phiên bản khác và cấu hình lùi về bản trước; dòng ghi chú «không đụng gì khác» trong khối lệnh nói ngược lại đúng mục đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Spec checks the omx-xoa array-scan column list for inclusion only, while eval E1 requires equality**
  Người dùng thấy gì: Lệnh gỡ bộ OKR mẫu vẫn gỡ đúng. Chỉ là bài kiểm tự động kiểm lỏng hơn lời hứa viết trong tệp tiêu chí, nên người đọc hai chỗ sẽ thấy hai mức chặt khác nhau.
  file: `apps/api/test/okr-mau-cuoc-soan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — kiểm chuỗi có mặt cho hai con số đếm bằng nhau, nên không bắt được việc in đảo hai số**
  Người dùng thấy gì: Nếu sau này lệnh gỡ bộ mẫu in nhầm chỗ hai con số (số bản đã xoá và số bản đã gỡ mã), bài kiểm hiện tại vẫn báo xanh, và người chạy lệnh có thể đọc sai kết quả gỡ.
  file: `apps/api/test/okr-mau-cau-hinh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — phép đối chiếu cột mảng là hằng đúng, và evals đòi hai tập bằng nhau nhưng spec chỉ kiểm tập này chứa tập kia**
  Người dùng thấy gì: Nếu có thêm một cột danh sách mới ở loại khác ngoài sáu cột đã ghim, bài kiểm có thể không báo đỏ, và lệnh gỡ bộ mẫu có thể sót mã mẫu trong cột đó mà không ai hay.
  file: `apps/api/test/okr-mau-cuoc-soan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — omc-tra-lai đo hàm traLai() chạy giữa lượt, không đo trạng thái afterAll để lại**
  Người dùng thấy gì: Bài kiểm không chứng minh được rằng bảng cấu hình chương trình OKR sạch như cũ sau khi cả bộ test chạy xong. Nếu việc dọn cuối bị bỏ sót, cấu hình dùng chung có thể bị lẫn dữ liệu thử trong lượt kiểm kế tiếp.
  file: `apps/api/test/okr-mau-cau-hinh.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
