---
schema_version: 1
feature: Soạn OKR khi chưa cấu hình cầu nối — nút không mời mở cuộc, màn nói thẳng chưa bật, cuộc chưa có lượt không bị tính vào trần, có hướng dẫn dựng apps/agent-okr trên Vercel
slug: soan-okr-song-lai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-04T00:01:00Z
design_doc: docs/superpowers/specs/2026-10-04-soan-okr-song-lai-design.md
---

# Acceptance Contract: soan-okr-song-lai

## Context

Trên production (đo 04/10) Soạn OKR chưa từng chạy: cửa `/eve/agents/okr` trả 503
`chua-cau-hinh-tro-ly-okr` vì app thiếu `OKR_AGENT_URL`, `OKR_AGENT_BRIDGE_SECRET` và chưa có dự án
Vercel cho `apps/agent-okr`. Nút vẫn mời, cuộc vẫn bị tính vào trần ba cuộc mỗi kỳ, màn chỉ nói «did
not answer». Lượt này làm ba việc: khi chưa cấu hình thì không mời và nói thẳng; trần chỉ đếm cuộc đã
có lượt; có hướng dẫn để chủ kho tự bật. Lượt 0 của lộ trình bộ xương Kara.

## Criteria

- AC-1: Given app chạy với `OKR_AGENT_BRIDGE_SECRET` trống, chu kỳ ở pha lập kế hoạch, và `okr.soanSanSang` trả lần lượt đủ 11 kết quả viết trước — 8 mã lý do của `soanSanSangOutput` (`don-vi-luu-tru`, `don-vi-chua-bat`, `don-vi-che-do-an`, `cuoc-an-dang-mo`, `con-cuoc-dang`, `het-cuoc-ky`, `het-tran-thang`, `chua-co-khoa-mo-hinh`) và 3 biến thể bật (nấc bật không cuộc đang, nấc bật có cuộc đang, nấc ẩn) — When quản trị và người sửa được đơn vị mở «Theo đơn vị» (22 ô), Then ở mọi ô hôm nay có nút thì hiện đúng một nút «Soạn OKR cùng Trợ lý» bị khoá kèm câu «Tính năng soạn nháp chưa được bật trên máy chủ này — quản trị viên OneHub cần bật nó.» nối bằng `aria-describedby`, không có «Tiếp tục cuộc đang soạn», không có nút danh sách cuộc, và không lời gọi `okr.soanMo` nào; ở mọi ô hôm nay không có nút thì vẫn không có nút; cờ sinh ở trang server từ `okrBridgeConfigured()`, đi qua `TheoDonVi` → `NutSoan` → `ManSoan`, và không tệp `"use client"` nào import `@/lib/agent-bridge`. (cross-layer)
- AC-2: Given app chưa cấu hình cầu nối và URL «Theo đơn vị» mang `?cuocSoan=<id>` của một cuộc `dang` có `soLuot = 0`, When trang mở, Then màn soạn hiện tiêu đề và mô tả đơn vị · kỳ, thân là trạng thái trống với cùng câu của AC-1, không có ô soạn, không gợi ý, không bản nháp, không request nào tới `/eve/agents/okr`, và `soLuot` của cuộc vẫn bằng 0 sau khi màn mở. (cross-layer)
- AC-3: Given trang thấy cầu nối đã cấu hình nhưng cửa `/eve/agents/okr` trả 503 với `error: "chua-cau-hinh-tro-ly-okr"` khi mở phiên, When màn soạn hiện lỗi, Then chỗ báo lỗi hiện câu của AC-1, không «did not answer» và không nút «Thử lại»; với 503 mang mã khác và với lỗi mạng, màn vẫn hiện như hôm nay.
- AC-4: Given một phòng ban mẫu với các cuộc trong kỳ theo ma trận viết trước — số cuộc có ≥ 1 lượt k ∈ {0, 1, 2, 3} (đều đã đóng, chia giữa `da-dua-vao` và `bo`) × số cuộc 0 lượt z ∈ {0, 3} (đều `bo`), cộng hai ô riêng: một cuộc `dang` 0 lượt (với k = 3) và một cuộc `dang` có lượt (với k = 2) — When gọi `okr.soanSanSang` và `okr.soanMo` qua tRPC, Then `soCuocDaDung` bằng đúng số cuộc có lượt ở mọi ô; ở ô không có cuộc `dang`, `soanMo` trả `het-cuoc-ky` đúng khi k ≥ trần (`TRO_LY_OKR_TRAN.soan.cuocMoiDonViMoiKy`, rút từ hằng) và ở mọi ô còn lại «mở được» — trả `ok` với một id mới khác mọi id đã gieo và số hàng `okrCuocSoan` của đơn vị tăng đúng 1; ở ô có cuộc `dang`, `soanSanSang` trả `cuocDang` đúng id đó và `soanMo` trả `con-cuoc-dang` như hôm nay; đơn vị khác và kỳ khác không ảnh hưởng; số «x/3» trên nút danh sách cuộc bằng số cuộc có lượt. (cross-layer)
- AC-5: Given app chạy với cầu nối cấu hình đủ, When đi lại các ca nút soạn đã ký của `soan-okr-cung-tro-ly` (nút mở, nút có danh sách cuộc, chế độ ẩn, hết cuộc, chưa có khoá mô hình, tiếp tục cuộc, mở cuộc qua cửa), Then mọi ca cho đúng kết quả như trước lượt này.
- AC-6: Given `docs/setup.md`, When đọc mục «Deploying `apps/agent-okr` to Vercel», Then mục nêu Root Directory `apps/agent-okr`, Framework preset, Build Command, phiên bản Node, mọi biến mà `apps/agent-okr/turbo.json` truyền cho `dev` (không thiếu, không thừa), hai biến phải thêm cho dự án app (`OKR_AGENT_URL`, `OKR_AGENT_BRIDGE_SECRET`) kèm câu «cùng giá trị» cho bí mật, và một bước kiểm `/health`; danh sách biến trong mục bằng đúng danh sách rút từ `turbo.json` lúc chạy bài.
- AC-7: Given màn thật chạy với `OKR_AGENT_BRIDGE_SECRET` rỗng, bộ OKR mẫu có một phòng ban bật soạn và một cuộc `dang` 0 lượt, When người sửa được đơn vị mở «Theo đơn vị» rồi mở `?cuocSoan=<id>` ở 1440 và 390, Then nhìn thấy nút khoá với câu của AC-1 và màn soạn trống với cùng câu, không trạng thái nào tràn ngang, và sàn thiết kế không có lỗi P0 trên hai màn.

## Coverage

Không gian: Người (quản trị · người sửa được đơn vị · người thường · người không sửa được) × Cầu nối
(có · không · có nhưng cửa từ chối) × Kết quả `soanSanSang` hôm nay (8 mã lý do + 3 biến thể bật = 11) × Lối vào
(nút · URL `?cuocSoan=` · lượt giữa phiên) × Lượt của cuộc (0 · ≥ 1) × Trạng thái cuộc (`dang` · `da-dua-vao` · `bo`).

- Core: không cấu hình × mọi kết quả có nút → AC-1; không cấu hình × URL → AC-2; cửa từ chối × lượt → AC-3; Lượt × Trạng thái → AC-4; có cấu hình × ca cũ → AC-5; hướng dẫn bật → AC-6; nhìn thấy → AC-7.
- Thước CE: bảng nút đóng `HINH_NUT_TAT` (`nut-soan.tsx`) và union `lyDo` của `soanSanSangOutput` (`okr.contracts.ts`) — bài AC-1 rút ma trận từ hai nguồn đó lúc chạy, không chép.
- Later: API từ chối `soanMo` khi chưa cấu hình; đổi tên Kara; trang riêng.
- Never: sửa tay bốn cuộc hỏng trên production (tự hết bị tính).

## Out of scope

- Trang riêng, bố cục hai nửa, bản nháp kiểu Artifact — lượt 2 của lộ trình.
- Đổi chữ «Trợ lý» sang «Kara», dấu `KaraMark` — lượt 1.
- API tự nhận biết «chưa cấu hình»: API không đọc biến cầu nối; cuộc rỗng không còn bị tính nên không cần.
- Đóng, xoá hay sửa bốn cuộc hỏng trên production.
- Tạo dự án Vercel `agent-okr` và đặt khoá — việc tay của chủ kho, theo mục hướng dẫn của AC-6.
- Thay câu chung «did not answer» cho các lỗi khác.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry
> `descope` trong `decisions.jsonl`.

## Hồ sơ đã ký bị thay

<!-- <<<BANG-THAY-THE -->
| hồ sơ/eval | đo gì | vì sao vỡ | thay bởi |
|---|---|---|---|
| soan-okr-cung-tro-ly/E9 | `soanMo` lần thứ 4 cùng đơn vị cùng kỳ → `het-cuoc-ky` (đếm mọi cuộc) | trần nay chỉ đếm cuộc đã có lượt; bài sửa để ba cuộc đầu có lượt, các vế khác giữ | AC-4 |
<!-- BANG-THAY-THE>>> -->

Ghim lại (đổi fixture, không đổi lời hứa): `soan-okr-cung-tro-ly/E12` — `soan-okr.dom.tsx` và
`khung-soan-okr.tsx` thêm `cauNoi=true` cho `NutSoan`/`ManSoan`; mọi ca giữ nguyên kỳ vọng (AC-5).
Bài `packages/db/test/okr-cuoc-soan.spec.ts` «đếm mọi trạng thái» không có eval đã ký nào chạy riêng;
nó đổi kỳ vọng theo AC-4 và chạy trong suite.

## Notes

- Trần vẫn đếm cuộc có lượt ở trạng thái `bo` và `da-dua-vao`: cuộc đã tốn AI là đã dùng.
- Cờ cầu nối là cờ của app; dự án app và dự án `agent-okr` phải cùng bí mật, lệch thì cửa trả 401/503 — AC-3 phủ ca 503.

### Known limits (Cổng Bằng chứng, 2026-10-04)

- Ngoài-1: E3/E4 mô tả là đi qua client eve thật với fetch giả, nhưng bài DOM tiêm lỗi vào
  `useEveAgent` đã mock; đường thật chỉ E11/E13 đo bằng trình duyệt.
- Ngoài-2: không phép đo nào lấy Response thật của cửa rồi cho `laChuaCauHinh` đọc — thân lỗi 503
  được chép tay ở bài DOM và ở thước màn; đổi khoá thân lỗi ở cửa thì E4/E11 vẫn xanh.
- Ngoài-3: ô ma trận E1 khẳng định `soanMo` 0 lời gọi mà không bấm nút khoá; «không chữ Tiếp»
  không có đối chứng dương ở nửa đã cấu hình.
- Ngoài-4: «hình hôm nay» của ma trận 22 ô rút từ chính `NutSoan` lúc đã cấu hình, không đối chiếu
  bảng viết trước — nút mất ở nhiều ô cùng lúc thì ma trận vẫn xanh.
- Ngoài-5: chiều đỏ `--kiem-do-do` của E11 và E13 dùng chung một kết luận nhận ba thông điệp, nên
  một lượt đỏ không nói phép đo nào đã cắn.
- Ngoài-6: thước hướng dẫn E10 chỉ đo chữ có mặt (Root Directory, «same value»), không đo quan hệ
  giá trị đúng chỗ.
