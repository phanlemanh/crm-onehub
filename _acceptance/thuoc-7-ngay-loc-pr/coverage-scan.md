# Quét độ phủ — thuoc-7-ngay-loc-pr

Preset `test-matrix`. Không gian: mọi lượt `ci.yml` mà thước 7 ngày của F21 phải đọc, và mọi cách thước có thể đọc sai.

## Ngữ cảnh

- Sản phẩm: thước đo nội bộ của kho `crm-onehub`. Chân sản phẩm lấy từ kho:
  `[SUY-TỪ-REPO: _acceptance/ci-ma-tran-ba-o/opportunity.md]` (ngưỡng SỐNG/CHẾT),
  `[SUY-TỪ-REPO: .github/workflows/ci.yml]` (sự kiện, `concurrency`, trần từng job),
  `[SUY-TỪ-REPO: _acceptance/ci-ma-tran-ba-o/contract.md]` (dòng Đường đo).
- Chân ngành: tài liệu GitHub REST API — `[NGÀNH: GitHub REST «List jobs for a workflow run», tham số filter=latest|all]`,
  `[NGÀNH: GitHub REST «List pull requests associated with a commit»]`, `[NGÀNH: GitHub REST «workflow run» — pull_requests chỉ
  liệt PR đang mở khớp head]`, `[NGÀNH: GitHub Actions — timeout-minutes, concurrency cancel-in-progress]`. Cả bốn đã khớp với
  dữ liệu đo trên kho ngày 09/10 (xem trục A và B).

## Trục

- Trục A — lượt gắn với PR nào: PR mở có base `onehub` | PR đã gộp có base `onehub` | PR đóng không gộp có base `onehub` |
  PR có base khác | không gắn được PR nào. [thước CE: 6 lượt `ci.yml` từ 05:42Z 09/10 — 2 lượt của PR mở #335 có mảng
  `pull_requests`, 4 lượt của PR đã gộp #332/#333/#334 có mảng rỗng; `commits/<sha>/pulls` trả cả PR đã gộp]
- Trục B — kết cục một job: xanh | đỏ | huỷ vì trần | huỷ vì bị lượt mới đè | huỷ tay | huỷ lý do lạ | bỏ qua.
  [thước CE: annotation của 30 lượt huỷ gần nhất — 5 «exceeded the maximum execution time of 20m0s/30m0s», 25 «Canceling since a
  higher priority waiting request for ci-CI-<n>»; huỷ tay và lý do lạ chưa gặp `[GIẢ ĐỊNH]`]
- Trục C — lần chạy: lần đầu | chạy lại (lần trước huỷ vì trần, lần sau xanh). [thước CE: jobs API mặc định chỉ trả lần mới
  nhất; chưa thấy lượt chạy lại trên kho `[GIẢ ĐỊNH]`]
- Trục D — vị trí lượt so cửa sổ: trước cửa sổ | trong cửa sổ | sau cửa sổ | cửa sổ chưa đóng lúc đo. [thước CE: «Trong 7 ngày
  sau khi gộp» của opportunity F21]

## Không gian

A × B × C × D = 5 × 7 × 2 × 4 = 280 ô. Quét theo lát của trục A (quan trọng nhất: sai nó là đếm 0 lượt như hôm nay).

- A «base khác» và A «không gắn được» chỉ cần một câu trả lời chung cho mọi B × C × D: không vào mẫu, nhưng được đếm và in ra.
- B «bỏ qua» chỉ có ở `ci-ok` khi `needs` hỏng — đã do `ci-ok: if: always()` loại (hinh.mjs của F21); gạch: «trùng».
- D «trước/sau cửa sổ» chỉ cần một câu chung: không vào mẫu.

## Core

1. A «mở / đã gộp / đóng không gộp» × D «trong cửa sổ» đều vào mẫu — vì đo 7 ngày sau gộp thì phần lớn lượt thuộc PR đã gộp.
2. A «base khác / không gắn được» — đếm riêng và in, không im lặng bỏ.
3. B «huỷ vì trần» đọc từ annotation, không từ thời lượng hay `ci.yml` — vì lượt PR chạy `ci.yml` của ref gộp, không của `head_sha`.
4. B «huỷ lý do lạ» → dừng có tên, không đoán.
5. C «chạy lại» — trần ở lần trước vẫn đếm.
6. D «cửa sổ chưa đóng» — in số tạm, không kết luận.
7. Lệnh `node …` của hợp đồng F21 chạy được (cross-cutting của mọi ô).

## Later

- Đo điều kiện CHẾT thứ ba của F21 («một gói có test không chạy ở ô nào») — đã có `cmtb_phu_goi` đo ở mỗi lượt ghim lại.
- Ghi số đo vào một tệp lưu cho Cổng Giá trị — người đọc dòng in ra là đủ cho lần đo đầu.

## Never

- Đọc trần từ `ci.yml` của từng lượt — sai nguồn (ref gộp không phải `head_sha`) và thừa khi GitHub đã ghi lý do huỷ.
- Lọc theo tên branch — lý do của hồ sơ này.

## Cross-cutting áp mọi ô Core

- `gh` lỗi, JSON hỏng, hết hạn mức gọi → dừng có tên, không in kết luận.
- Phân trang: một tuần có thể quá 100 lượt.
- Chạy được bằng cả `node` lẫn `bun`.
