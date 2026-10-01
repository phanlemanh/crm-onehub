# Coverage scan — mien-so-chup-bo-okr-mau

## Ngữ cảnh

- Sản phẩm: thước `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs --ca chi-them` — chân sản phẩm: đào repo [SUY-TỪ-REPO: _acceptance/so-okr-tu-chay/contract.md AC-4, AC-14] [SUY-TỪ-REPO: _acceptance/bo-okr-mau/contract.md AC-3, AC-7, AC-8, AC-9, AC-10] [SUY-TỪ-REPO: apps/api/scripts/okr-mau.ts] [SUY-TỪ-REPO: apps/api/scripts/okr-mau/nap.ts] · chân ngành: [NGÀNH: Rails `ActiveRecord::ProtectedEnvironmentError`] và [NGÀNH: Laravel `db:seed` từ chối production khi thiếu `--force`] cho «công cụ gieo dữ liệu chỉ chạy trên máy dev»; [NGÀNH: ESLint `--report-unused-disable-directives`] cho «một miễn trừ phải hiện ra và phải kêu khi không còn đúng».
- Preset: test-matrix, chất vấn trục theo B1.

## Trục

- **Trục A — lối ghi `okrSoChup`:** tạo (`create*`) · xoá (`delete*`) · sửa (`update*`, `upsert`) · SQL thô (`$executeRaw*`, `$queryRaw*` có UPDATE/DELETE/TRUNCATE) · lồng (`soChup: { … }`)  [thước CE: tập `TAO`, `SUA`, `SQL_THO`, `SUA_LONG` của `soi-ma.mjs` — thước đã ký liệt kê đúng các lối này]
- **Trục B — chỗ đứng của lời gọi:** `nap.ts` trong hàm được miễn (`napTrong` cho tạo, `xoaTrong` cho xoá) · `nap.ts` ở hàm khác · tệp khác trong `apps/api/scripts/okr-mau/` · ngoài `okr-mau` (`apps/api/src`, `apps/agent`, `packages`)  [thước CE: chuỗi gọi đọc được từ `okr-mau.ts` → `lenh.ts` → `nap.ts`]
- **Trục C — chốt an toàn:** C1 xoá có lọc `keyResultId` · C2 lối vào `okr-mau.ts` chặn bằng `kiemDuocNap` trước khi nạp `lenh` · C3 mọi lời gọi `xoaTrong`/`napTrong` đi sau `kiemOkrThat` · C4 không ai ngoài công cụ nhập `okr-mau/nap` hay `okr-mau/lenh` — mỗi chốt đạt | vỡ  [thước CE: AC-9 và AC-10 của `bo-okr-mau` là hai lời hứa chốt C2, C3 đứng thay; ngành: Rails/Laravel chặn môi trường trước khi chạy gieo]
- **Trục D — nơi luật được nói ra:** thước · hợp đồng `so-okr-tu-chay` (AC-4, AC-14, Notes) · `evals.yaml` E8 · `docs/api.md`  [thước CE: bốn chỗ đang chép luật «ba chỗ ghi duy nhất», tìm bằng `grep okrSoChup`]

## Không gian

A × B (20 ô): có nghĩa và cần đo — tạo/xoá ở chỗ được miễn (2 ô, xanh khi chốt đạt) · mọi lối ở `nap.ts` hàm khác · mọi lối ở tệp `okr-mau` khác · mọi lối ngoài `okr-mau` (đỏ như cũ). Sửa/SQL thô/lồng ở hàm được miễn: đỏ, miễn không mở cho chúng.

C (8 ô): bốn chốt × đạt/vỡ; chốt vỡ thì hai ô miễn của A × B quay lại thành vi phạm.

D (4 ô): mỗi nơi nói ra luật phải nói cùng một luật.

## Core

1. Thước ở cây hiện tại xanh, in hai dòng miễn kèm bốn chốt đạt, ba chỗ tạo cũ vẫn in — vì đây là lời hứa chính: ô đỏ im của E8 thôi đỏ mà không giấu gì.
2. Xoá ở `nap.ts` hàm khác, xoá ở tệp `okr-mau` khác, `updateMany` và SQL thô trong `xoaTrong` → vẫn đỏ — vì miễn hẹp là điều kiện để (a) không thành lỗ thủng.
3. Mỗi chốt C1–C4 vỡ → đỏ với câu ghim gọi tên chốt — vì miễn có điều kiện chỉ có nghĩa khi điều kiện được đo.
4. Bốn nơi nói luật nói cùng một luật — vì `docs/api.md` đang hướng dẫn mọi phiên sau rằng chỉ có ba chỗ ghi.
5. Vòng này không chạm `apps/` hay `packages/` — vì chạm `nap.ts` làm hoá cũ eval của ~22 hồ sơ phủ `apps/**`.

## Later

- Chốt «`kiemOkrThat` thật sự lọc theo tiền tố mẫu» bằng AST — đã có phép thử hành vi riêng ở AC-10 của `bo-okr-mau`; đo lại nội dung hàm là việc của hồ sơ đó.
- Chốt «`where` chỉ chứa id mang tiền tố mẫu» theo luồng dữ liệu — C1 chỉ đòi có lọc `keyResultId`; truy nguồn biến `K` về `tapMau` cần phân tích luồng, quá tay cho một thước cú pháp.

## Never

- Miễn cả thư mục `apps/api/scripts/**` — mở cửa cho mọi công cụ sau này, chủ kho chọn miễn cho `okr-mau`.
- Giấu lệnh xoá khỏi thước (đặt ngoài `apps/`, tên model động) — là lách thước, đã loại khi trình hai hướng.
- Sửa `nap.ts` — hướng (b), chủ kho đã loại ngày 01/10.

## Cross-cutting áp mọi ô Core

- Mỗi phép đo có cặp hai chiều trên cùng tệp thật: cây lành xanh, bản sao bị phá đỏ với câu ghim.
- Phép đo chạy đúng lệnh của E8 (`config:executors.script.sot_soi_chi_them`), không chạy bản chép.
- Bản sao phá-thử đặt trong `tmpdir`, không trong cây (oxlint quét thư mục ẩn trong gói).
