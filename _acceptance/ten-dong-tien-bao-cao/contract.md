---
schema_version: 1
feature: Một tên cho đồng tiền báo cáo ở mọi câu người dùng thấy, có mục trong từ điển sản phẩm
slug: ten-dong-tien-bao-cao
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-24-ten-dong-tien-bao-cao-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-24T08:23:02Z
---

# Acceptance Contract: ten-dong-tien-bao-cao

## Context

Ngoài-1 của hồ sơ `tien-te-chua-tai-khong-doan` (PR #117): thiết lập đồng tiền mà mọi tổng và báo cáo quy về đang mang hai tên — «Đồng tiền báo cáo» ở Cài đặt và ở thêm nhanh, «đồng tiền mặc định» ở tấm tạo thoả thuận. Người đọc lời báo lỗi ở tấm tạo không tìm ra thiết lập đó ở Cài đặt. Vòng này thống nhất về «đồng tiền báo cáo» và đưa khái niệm vào từ điển sản phẩm.

Source input: prompt của chủ kho 2026-09-24 («làm tiếp việc thống nhất tên gọi») + định tuyến Cổng 2 của `tien-te-chua-tai-khong-doan`.

## Criteria

- AC-1: Given tấm tạo thoả thuận, thiết lập tiền tệ đang tải, When gõ số tiền, Then dòng dưới ô là «Đang tải đồng tiền báo cáo…» ở tiếng Việt và "Loading the reporting currency…" ở tiếng Anh; When thiết lập tải lỗi, Then dòng là «Không tải được đồng tiền báo cáo — chọn đồng tiền bên cạnh để nhập số tiền.» / "Couldn't load the reporting currency — pick a currency next to the amount to enter it.".
- AC-2: Given mọi tệp mã của app và của bộ giao diện dùng chung (trừ bài kiểm), ở cả hai tiếng, When quét toàn bộ không phân biệt hoa thường, Then không chỗ nào chứa «đồng tiền mặc định» hay "default currency"; And ít nhất ba chỗ dùng «đồng tiền báo cáo» / "reporting currency" (Cài đặt, thêm nhanh, tấm tạo) — đối chứng dương.
- AC-3: Given từ điển sản phẩm `CONTEXT.md`, When đọc, Then có mục **Đồng tiền báo cáo** có câu định nghĩa, nói nó đặt ở Cài đặt → Tiền tệ, với dòng `_Avoid_` liệt «đồng tiền mặc định» và "default currency"; And bốn câu của AC-1 trong mã trùng từng ký tự với câu trong hợp đồng này.
- AC-4: Given ứng dụng chạy thật ở 1440, tiếng Việt, và yêu cầu thiết lập tiền tệ bị trả lỗi, When mở tấm tạo thoả thuận và gõ `150.000.000`, Then màn hiện đúng câu «Không tải được đồng tiền báo cáo — chọn đồng tiền bên cạnh để nhập số tiền.».
- AC-5: Given hai hồ sơ trước (`tien-te-chua-tai-khong-doan`, `o-so-tien-doc-theo-tieng`), When chạy làn máy của cả hai (bốn lệnh bộ chứng và mọi phép đo máy khai trong bộ đo của từng hồ sơ), Then mọi lệnh và mọi phép đo đều đạt (các bài kiểm và thước đo so chữ được cập nhật sang tên mới, hành vi không đổi).
- AC-6: Given hợp đồng đã duyệt của `tien-te-chua-tai-khong-doan`, When đọc sau vòng này, Then phần Criteria của nó không đổi ký tự nào, và phần Notes có một dòng trỏ sang `ten-dong-tien-bao-cao` là nơi thay chữ.

## Coverage

Chân sản phẩm: ba chỗ gọi tên thiết lập [SUY-TỪ-REPO: apps/app/lib/messages/settings.ts, apps/app/lib/messages/record-sheet.ts, apps/app/lib/messages/deals.ts], luật từ điển [SUY-TỪ-REPO: CLAUDE.md, CONTEXT.md]. Chân ngành: [NGÀNH: HubSpot — «Company currency» là một tên duy nhất ở mọi màn cài đặt và báo cáo], [NGÀNH: Salesforce — «Corporate Currency», một tên cho đồng quy đổi của tổ chức].

- Trục chỗ tên xuất hiện: Cài đặt · thêm nhanh · tấm tạo · từ điển [thước CE: grep hai cụm từ trên mọi bảng câu chữ]
- Trục tiếng: vi · en [thước CE: `LOCALES`]
- Trục trạng thái của tấm tạo: đang tải · tải lỗi [thước CE: hai câu của tấm tạo]
- Core: AC-1 … AC-6.
- Later/Never: xem Out of scope.

## Out of scope

- Đổi tên thiết lập trong mã (`reportingCurrency`) hay trong cơ sở dữ liệu.
- Rà các khái niệm tiền tệ khác (tỷ giá, quy đổi) để đưa vào từ điển.

## Notes

- Hợp đồng `tien-te-chua-tai-khong-doan` ghim nguyên văn câu cũ ở AC-1 và AC-2; vòng này không sửa hợp đồng đã duyệt đó mà thêm một dòng Notes trỏ sang đây.
- Known limits (Ngoài-1, Gate 2): E4 chạy thước màn thật của hồ sơ `tien-te-chua-tai-khong-doan`, nên ảnh mới nằm ở `.acceptance-runs/tien-te-chua-tai-khong-doan/evidence/`; ảnh đã lưu trong `evidence/` của hồ sơ đó chụp trước khi đổi chữ.
- Known limits (Ngoài-2, Gate 2): ba phép đo màn thật của hai hồ sơ trước (E8, E11 của `tien-te-chua-tai-khong-doan`; E9 của `o-so-tien-doc-theo-tieng`) có thước bị sửa ở vòng này; các thước đó đã chạy xanh (trong S4 và trong làn máy) nhưng ảnh trong hồ sơ đã ký chưa được chụp lại bằng một vòng S4 riêng.
- Known limits (Ngoài-3, Gate 2): thước quét chữ giữ con số 18 khẳng định bằng cách viết (mỗi nhánh luôn cộng đủ), nên phép so số khẳng định không bao giờ đỏ.
- Known limits (Ngoài-4, Gate 2): phép tìm tên cũ và phép kiểm có tên mới đọc tệp theo hai đường khác nhau; một bảng câu chữ bị lượt quét bỏ sót thì cả hai vẫn xanh.
- Known limits (Ngoài-5, Gate 2): mục từ điển chỉ được kiểm là có chữ «Cài đặt» và «Tiền tệ» ở bất kỳ đâu trong mục, không kiểm đường dẫn «Cài đặt → Tiền tệ».
