---
schema_version: 1
feature: Người dùng bấm vào được hai màn điều phối 30 ngày đầu từ thanh điều hướng chính và thanh bên Cài đặt
slug: loi-vao-dieu-phoi-30-ngay
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-21T08:45:00Z
design_doc: docs/superpowers/specs/2026-09-21-loi-vao-dieu-phoi-30-ngay-design.md
---

# Acceptance Contract: loi-vao-dieu-phoi-30-ngay

## Context

PR #66 đưa lên prod màn danh mục «30 ngày đầu» và màn «Cài đặt › Điều phối 30
ngày», nhưng không có lối bấm vào nào — người dùng chỉ tới được khi gõ thẳng địa
chỉ. Lái thử trên `onehub.center` ngày 2026-09-21 xác nhận hai màn chạy mà không ai
thấy. Vòng này thêm đúng hai lối vào.

Source input: prompt (chủ kho, 2026-09-21: «vá hai lối vào luôn»), sau lái thử prod
của hồ sơ `dieu-phoi-30-ngay-dau`.

## Criteria

- AC-1: Given người đứng ở bất kỳ màn nào trong không gian làm việc, When nhìn thanh điều hướng chính, Then có một mục dẫn tới màn danh mục 30 ngày đầu, đứng ngay trước Cài đặt.
- AC-2: Given người đứng ở màn danh mục hoặc hồ sơ một kế hoạch, When nhìn thanh điều hướng chính, Then mục 30 ngày đầu được đánh dấu đang mở; còn khi đứng ở Cài đặt › Điều phối thì mục Cài đặt được đánh dấu, không phải mục 30 ngày đầu.
- AC-3: Given người đứng ở Cài đặt, When nhìn thanh bên Cài đặt, Then có một mục cuối dẫn tới Cài đặt › Điều phối 30 ngày, và mục đó được đánh dấu khi người đứng ở trang ấy.
- AC-4: Given giao diện tiếng Việt hoặc tiếng Anh, When đọc nhãn hai mục mới, Then nhãn khớp đúng tiêu đề của màn đích — «30 ngày đầu» / «First 30 days» và «Điều phối 30 ngày» / «Onboarding».

## Coverage

- Bỏ coverage-scan — việc chỉ có một chiều: hai lối vào cho hai màn đã có, không có không gian lựa chọn để quét (entry `d-20260921T082259Z-1` trong `decisions.jsonl`).

## Out of scope

- Khung chụp màn bằng máy (tiêu chí nhìn-thấy cũ AC-5) — chủ kho tự nhìn hai lối vào trên bản dev của nhánh vá ngày 2026-09-21 và xác nhận «ổn»; lý do ở dòng sổ quyết định bỏ ui-observed.
- Đổi nội dung hay bố cục của hai màn đích — chúng đã qua Cổng Bằng chứng ở hồ sơ `dieu-phoi-30-ngay-dau`.
- Hai hạt giống của hồ sơ đó (tác nhân tra mã đối tác không khớp; bộ lọc ra không kết quả) — mỗi cái sẽ là một hồ sơ riêng.
- Sắp xếp lại thứ tự bảy mục sẵn có của thanh điều hướng chính.
- Quyền xem: hai mục hiện cho mọi thành viên, giống bảy mục sẵn có; hai màn đích tự lo phần quyền của chúng.

## Notes

- Mã sửa đã được viết TRƯỚC khi có hợp đồng này (commit `a4ba5a9e`), vì chủ kho đòi vá ngay sau lái thử prod; hợp đồng và phép đo đến sau. Mỗi phép đo máy đã được phá thử trên vật thật (bỏ mục, đổi cách so khớp, đổi nhãn) và đỏ đúng ca với thông điệp ghim tên mục.
- Repo khai `feature_loop.ui_standards_skill: web-design-guidelines`, nhưng skill đó không có trong phiên này — artifact UI không có đối trọng chuẩn nội ngoài `docs/design.md`.
