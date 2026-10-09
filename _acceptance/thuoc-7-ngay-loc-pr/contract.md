---
schema_version: 1
feature: Thước đo 7 ngày của ci-ma-tran-ba-o đọc đúng các lượt CI của PR vào onehub trong cửa sổ 7 ngày, chạy được bằng đúng lệnh ghi trong hồ sơ, và báo lỗi thay vì đoán khi không xếp được một job `cancelled`
slug: thuoc-7-ngay-loc-pr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: draft
design_doc: _acceptance/thuoc-7-ngay-loc-pr/design.md
---

# Acceptance Contract: thuoc-7-ngay-loc-pr

## Context

Ngưỡng 7 ngày của F21 `ci-ma-tran-ba-o` (PR #331 gộp 2026-10-09T05:42:52Z) được đo bằng
`_acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs`. Đo 09/10: thước lọc theo tên branch nên đọc 0 lượt và thoát 0; lệnh `node`
ghi trong hợp đồng F21 chết ở `Bun.YAML`; không có cửa sổ thời gian; không đọc được trần thì lặng lẽ dùng trần hiện tại. Anh
định đoạt bốn mục đó là «mở hợp đồng mới» ở Cổng 2 của F21. Thiết kế và sự thật đo được ở `design.md`.

Vòng này viết lại thước tại chỗ, và thay E5 của F21 (`ci-ma-tran-ba-o/E5`, đo hành vi cũ) bằng AC-4 của hồ sơ này.

## Criteria

- AC-1: Given các lượt `ci.yml` có sự kiện `pull_request` tạo trong cửa sổ, When thước chạy với `--nhanh onehub`, Then mỗi
  lượt được gắn với PR qua `commits/<head_sha>/pulls` (PR có `head.ref` trùng branch của lượt): lượt của PR có base `onehub` —
  đang mở hay đã gộp — vào mẫu; lượt của PR base khác và lượt không gắn được PR nào không vào mẫu nhưng được đếm và in thành
  dòng riêng.
- AC-2: Given một job `cancelled` ở bất kỳ `run_attempt` nào của lượt (kể cả attempt đã bị attempt sau thay), When thước xếp nó, Then lớp lấy
  từ annotation GitHub ghi cho job: «exceeded the maximum execution time» → dừng vì trần, «higher priority waiting request» → bị
  đè, «canceled by» → dừng tay; job `cancelled` chưa từng bắt đầu (không có `started_at`) → dừng khi chưa chạy; job `cancelled` đã chạy mà
  annotation ngoài ba lớp hoặc không có annotation → thoát mã 2, in lượt, job và câu annotation, không in dòng kết luận.
- AC-3: Given một lượt trong mẫu, When thước tính, Then lượt xanh là lượt có job `ci-ok` của `run_attempt` cuối kết luận `success`;
  job dài nhất là max(`completed_at − started_at`) trên các job của `run_attempt` cuối; lượt không có job `ci-ok` đếm vào «không
  mang hình ma trận».
- AC-4: Given cửa sổ đã đóng và ≥ 10 lượt xanh, When thước kết luận, Then trung vị tính trên job dài nhất của các lượt XANH
  (số lượt chẵn lấy trung bình hai giá trị giữa); in SỐNG khi trung vị ≤ 15′ và 0 dừng vì trần, CHẾT khi trung vị > 20′ hoặc ≥ 1 dừng vì trần, «giữa hai ngưỡng» khi còn lại, và thoát 0; cửa sổ chưa đóng hoặc < 10
  lượt xanh thì in số tạm, không in SỐNG hay CHẾT, thoát 3. Thay `ci-ma-tran-ba-o/E5`.
- AC-5: Given không có `--tu`, When thước chạy, Then cửa sổ bắt đầu ở giờ (UTC) của commit gộp cuối trên dòng cha-đầu của
  `origin/<nhánh>` đã đổi `.github/workflows/ci.yml` và dài 7 ngày; `--tu`/`--den` ghi đè; dòng đầu ra in cửa sổ và nói cửa sổ
  đã đóng hay chưa.
- AC-6: Given đúng dòng lệnh Đường đo của F21, When chạy `node _acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs --nhanh onehub`
  và cùng lệnh với `bun`, Then cả hai chạy tới cuối và in cùng số đếm.
- AC-7: Given `gh` thoát khác 0 hoặc trả JSON hỏng, When thước đọc, Then thoát mã 2 và in lệnh `gh` hỏng, không in dòng kết
  luận.
- AC-8: Given cửa sổ có hơn 100 lượt `ci.yml`, When thước đọc, Then đếm đủ mọi lượt qua mọi trang.
- AC-9: Given `_acceptance/ci-ma-tran-ba-o/evals.yaml`, When hồ sơ này đã ký, Then E5 mang `status: not-run` và
  `superseded_by: thuoc-7-ngay-loc-pr#AC-4`, và kiểm lại bằng chứng của `ci-ma-tran-ba-o` nhận con trỏ, không báo xung đột.

## Coverage

- Trục A — lượt gắn với PR nào: PR mở base `onehub` | PR đã gộp base `onehub` | PR đóng không gộp | PR base khác | không gắn
  được [thước CE: 6 lượt từ 05:42Z 09/10 và cửa sổ cũ 08/10 16:00Z → 09/10 04:00Z có hai lượt `thu/ci-tach-job`]
- Trục B — kết cục job: xanh | đỏ | dừng vì trần | bị đè | dừng tay | dừng khi chưa chạy | `cancelled` lý do lạ [thước CE: annotation
  của 30 lượt `cancelled` gần nhất, đều hình một job trước #331; dừng tay và mọi lượt `cancelled` ở hình ma trận `[GIẢ ĐỊNH]` — chưa gặp trên
  kho tới 09/10 09:30Z]
- Trục C — `run_attempt`: attempt 1 | chạy lại [thước CE: lượt 37841386976, lần 1 dừng vì trần, attempt 2 xanh]
- Trục D — lượt so cửa sổ: trước | trong | sau | cửa sổ chưa đóng [thước CE: «Trong 7 ngày sau khi gộp» ở opportunity F21]
- Core → AC: A → AC-1; B → AC-2, AC-7; C → AC-2, AC-3; D → AC-4, AC-5; chạy được → AC-6; phân trang → AC-8; nối F21 → AC-9.
  Bản quét đủ: `coverage-scan.md`.

## Đường đo

- «Ngày đo của F21, thước in được trung vị và số dừng vì trần từ lượt CI thật của PR vào `onehub`» · `node
  _acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs --nhanh onehub` sau 2026-10-16T05:42:52Z · AC-4, AC-5, AC-6. Cùng ngày, E3
  so số lượt xanh và số dừng vì trần thước in với số đếm độc lập bằng `gh` trên cùng cửa sổ.
- «Không thoát 0 khi đã phải đoán» · lượt `cancelled` không xếp được → mã 2 · AC-2, AC-7.

## Out of scope

- Đo điều kiện CHẾT thứ ba của F21 («một gói có test không chạy ở ô nào») — `cmtb_phu_goi` đã đo ở mỗi lượt ghim lại; thước
  này chỉ in một dòng trỏ sang đó.
- Đọc trần (`timeout-minutes`) từ `ci.yml` của từng lượt — lượt PR chạy `ci.yml` của ref gộp, và annotation đã ghi lý do dừng.
- Lưu số đo vào tệp cho Cổng Giá trị — lần đo đầu đọc dòng in ra.
- Lượt `ci.yml` của sự kiện `push` (chỉ có ở `main`/`release`).
- Sửa khoá `cmtb_do_7_ngay` của `config.yaml` (luật thêm-không-sửa của đợt) — khoá còn đó nhưng không eval nào gọi.

## Notes

- Mã thoát của thước: 0 có kết luận · 2 không đo được · 3 chưa đủ để kết luận.
- Trước khi hồ sơ này ký, lưới trước-merge báo `ci-ma-tran-ba-o/E5` xung đột (con trỏ chưa có hồ sơ đã ký để trỏ tới). Không
  gộp trước chữ ký Cổng 2.
- Hai eval đọc GitHub thật trên cửa sổ cũ cố định. GitHub giữ nhật ký lượt chạy 90 ngày, nên sau khoảng đầu tháng 1/2027 hai
  eval đó mất dữ liệu đo.
