---
schema_version: 1
slug: t1-ma-doc
feature: tệp T1 mà bài kiểm, bản dựng hay runtime đọc không còn được CI và pre-push tính là nhẹ; một nguồn luật trong _acceptance/config.yaml cho cả hai, có răng giữ danh sách đủ
owner: manh@mstar.vn
stage: decided
decision: build
decided_by: manh
decided_at: 2026-10-17T01:14:52Z
prototype:
  base_commit: 8f975afb4
  disposition: archive
---

Gốc: `_acceptance/pre-push-t1/` — lượt chấm S4 của `pre-push-t1` (PR phanlemanh/crm-onehub#451), hai mục ngoài hợp đồng Ngoài-1 (mức cao) và
Ngoài-3 (mức vừa) trong `_acceptance/pre-push-t1/review-findings.md`. Chủ kho chọn «mở hợp đồng mới» cho hai mục
này (17/10).

## Vấn đề & ai gặp

`risk_tiers.t1_skip_globs` khai `docs/**` và `**/*.md` là T1. Từ vòng `giam-phut-ci-nhap-t1`, CI bỏ job nặng
(check-types, lint, test, build) cho PR sẵn sàng mà mọi tệp là T1; từ `pre-push-t1`, pre-push bỏ `test` và `build`
cho lần đẩy mà mọi tệp là T1. Cả hai dùng chung `quyetDinh` + `tepT1` + `docGlobT1` của `.github/scripts/phan-loai.mjs`.

Nhưng một số tệp T1 là đầu vào thật của bài kiểm hay của runtime. Đếm bằng lệnh trên cây `8f975afb4` (quét mọi tệp
mã không-T1 dưới `apps/` `packages/` tìm tên tệp T1 kèm đủ các đoạn thư mục, trong tệp có lời gọi đọc tệp):

- `docs/design.md` ← `packages/ui/test/status-tone.spec.ts` (bảng màu trạng thái phải khớp bảng trong tài liệu)
- `docs/telemetry.md` ← `packages/telemetry/test/allowlist.spec.ts`
- `docs/setup.md`, `CONTEXT.md` ← `apps/api/test/okr-mau-chan.spec.ts`
- `docs/environment.md` ← `apps/agent/test/zalo-qua-webhook.integration.spec.ts`
- 5 spec trong `docs/superpowers/specs/` ← 8 bài kiểm `.dom.tsx` / `.spec.ts` của `apps/app`, `apps/api`
- `LO-TRINH.html` ← `apps/app/lib/lo-trinh/doc-tep.ts` (runtime của trang Lộ trình) và 7 bài kiểm
- `_acceptance/soan-okr-cung-tro-ly/rang/ma-tran-quyen.md` ← `apps/api/test/soan-okr-quyen.spec.ts`
- `scripts/pre-merge-check.sh`, `lib/workspace-record.cjs` ← `.github/scripts/phan-loai.mjs` (chính bộ phân loại,
  mà `packages/ui/test/pre-push-t1.spec.ts` chạy)
- mọi tệp T1 nằm dưới `apps/**`, `packages/**`: prompt chạy thật của agent (`apps/agent/agent/**/instructions.md`,
  eve nạp theo quy ước, không qua tên tệp trong mã), fixture `.md` của bài kiểm.

PR hay lần đẩy chỉ sửa một trong các tệp đó được tính là nhẹ, nên bài kiểm đọc nó không chạy ở PR lẫn ở pre-push.
Lệch chỉ lộ ra ở lần đẩy nặng sau, hoặc ở onehub sau khi gộp. Câu `vi_sao` của khối `t1Only` trong
`.githooks/gate-shape.json` lại nói «không đổi mã nào test hay build đọc» — sai sự thật.

**Người gặp:** thợ và điều phối ba máy (lỗi lộ muộn, PR khác đỏ oan trên onehub); chủ kho (đọc câu `vi_sao` sai).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Một khoá loại trừ riêng đọc cùng chỗ với `t1_skip_globs` đủ để CI và pre-push cùng đổi, không sửa bộ cổng chép từ kit | Phải sửa `scripts/pre-merge-check.sh` chép từ kit — phí bản rẽ | Hai bên gọi chung `docGlobT1` / `tepT1`; đổi ở đó, chạy bài kiểm của cả hai | Chưa thử |
| 2 | Quét tĩnh tìm đủ đầu vào thật | Một tệp đọc bằng tên ghép lúc chạy lọt lưới | Gộp `apps/**` `packages/**` nguyên khối (bắt prompt theo quy ước); khai giới hạn cho tên ghép | Chưa thử |
| 3 | Thêm tệp vào danh sách nặng không làm PR tài liệu thường phải có hồ sơ nghiệm thu | Mỗi lần sửa `docs/design.md` phải mở vòng | Khoá mới chỉ CI và pre-push đọc; `t1_skip_globs` không đổi, cổng nghiệm thu đọc như cũ | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Không đo được — việc nội bộ của bộ công cụ, không có người dùng cuối để mời phiên nghiệm thu; giá trị là đóng một lỗ đã gọi tên (Ngoài-1, Ngoài-3), đo bằng ca đỏ trên chính các tệp đã liệt kê.

## Chính sách đợt

Chạm trần 3 lượt → thu phạm vi · đỏ sẵn trên nền → tách vòng vệ sinh · giữ cỡ khi tiêu chí là rào chắn. Xếp đầu lộ trình mới sau điểm dừng đóng đợt M5 (Điều phối M5, 17/10); đường nền vào làn khoảng 05:30Z.

## Kết quả prototype

Không dựng bản thử — phép đo là bộ phân loại chạy trên danh sách tệp.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Bộ khớp glob `match_globs` | `scripts/pre-merge-check.sh` (chép từ acceptance-gate-kit) | triết-lý/logic | có — dùng nguyên, không sửa | |

## Cổng 0

- **decision = build** Căn cứ: đóng hai lỗ Ngoài-1, Ngoài-3 của pre-push-t1 mà chủ kho chọn «mở hợp đồng mới».
- **Ngưỡng UAT chốt cùng lúc ký:** Không đo được (giữ như đề xuất).
- **disposition = archive** Căn cứ: không có code bản thử.

## Thước đo thành công → ứng viên criterion

- PR hay lần đẩy chỉ chạm một tệp trong danh sách đầu vào → nặng (đủ job / đủ năm lệnh).
- PR hay lần đẩy chỉ chạm tài liệu không ai đọc (vd `docs/api.md`) → vẫn nhẹ như hôm nay.
- Thêm một bài kiểm đọc tệp T1 mới mà không khai → `bun run test` đỏ, gọi tên tệp.

## Out of scope từ khám phá

- Cho cổng nghiệm thu của kit (hồ sơ bắt buộc, hoá cũ bằng chứng) hiểu danh sách mới — bộ cổng là bản chép của kit; muốn thì mở chip sang `~/dev/acceptance-gate-kit`.
- Tệp được đọc bằng tên ghép lúc chạy (vd `${slug}-design.md`) ngoài `apps/` `packages/` — quét tĩnh không thấy; khai giới hạn.
- Mã dưới `scripts/**` không chạy trong `bun run test` (vd `scripts/kiem-cheo`, `scripts/tin-hieu`) — CI không chạy chúng nên không có chiều đỏ để mất.

## Quyết định Cổng Đáng

2026-10-17T01:14:52Z, chủ kho: «build — giữ dòng «Không đo được» như đề xuất».
