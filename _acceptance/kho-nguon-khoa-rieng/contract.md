---
schema_version: 1
feature: Kho nguồn tài liệu dùng khoá Blob riêng KHO_TAI_LIEU_BLOB_TOKEN, tách khỏi khoá logo BLOB_READ_WRITE_TOKEN, để bật tải nguồn trên production mà không đẩy logo vào kho riêng tư
slug: kho-nguon-khoa-rieng
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: approved
design_doc: docs/superpowers/specs/2026-09-28-kho-nguon-khoa-rieng-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-28
---

# Acceptance Contract: kho-nguon-khoa-rieng

## Context

Kho nguồn tài liệu (Vercel Blob private, `packages/db/src/blob-nguon.ts`) và phần sao logo, ảnh
(Vercel Blob public, `packages/db/src/blob.ts`) cùng đọc `BLOB_READ_WRITE_TOKEN`. Một store chỉ là
public hoặc private, nên một tên biến không bật được cả hai đúng cách. Hồ sơ này cho kho nguồn biến
riêng `KHO_TAI_LIEU_BLOB_TOKEN` và **thay AC-5 của `may-soan-de-xuat`** (hợp đồng đó đã ký, không
sửa). Chủ kho chốt 2026-09-28: không lùi sang tên chung.

Source input: yêu cầu chủ kho 2026-09-28; Notes «Bản thật cần biến riêng cho kho nguồn» của
`_acceptance/may-soan-de-xuat/contract.md`; `docs/environment.md` «A new variable has three homes».

## Criteria

- AC-1: Given ma trận viết trước sáu ô của hai biến `KHO_TAI_LIEU_BLOB_TOKEN` và `BLOB_READ_WRITE_TOKEN` (bốn ô có/vắng, thêm ô khoá kho nguồn toàn khoảng trắng và ô khoá logo rỗng — rỗng và toàn khoảng trắng tính là vắng), When hỏi kho nguồn `khoNguonVercel().bat()` và kho logo `blobEnabled()` trong từng ô, Then kho nguồn bật khi và chỉ khi `KHO_TAI_LIEU_BLOB_TOKEN` có, kho logo bật khi và chỉ khi `BLOB_READ_WRITE_TOKEN` có; And ô «chỉ khoá logo» cho kho nguồn tắt, ô «chỉ khoá kho nguồn» cho kho logo tắt.
- AC-2: Given hai biến đặt hai giá trị khác nhau và một Blob API giả ghi lại header `authorization` của mọi yêu cầu, When kho nguồn ký URL tải lên, ký URL tải về và xoá một tệp, Then mọi yêu cầu kho nguồn gửi tới Blob API mang đúng token của `KHO_TAI_LIEU_BLOB_TOKEN`; And không yêu cầu nào mang token của `BLOB_READ_WRITE_TOKEN`; And có ít nhất ba yêu cầu được ghi (hai lần ký, một lần xoá).
- AC-3: Given API khởi động với `BLOB_READ_WRITE_TOKEN` đặt và `KHO_TAI_LIEU_BLOB_TOKEN` vắng (cấu hình khi production chỉ bật logo), When gọi các thủ tục nạp nguồn, Then `taiLieuNguon.trangThai` trả `{ bat: false }`; And `xinCho`, `nhan`, `taiVe` trả `PRECONDITION_FAILED` với thông điệp ghim «Chưa bật lưu tệp nguồn», không 500; And API khởi động không lỗi và các thủ tục của lượt 1 (tạo trang, đề xuất, duyệt, đọc) chạy như cũ; And `kyPut`, `kyGet` gọi thẳng trên kho nguồn từ chối với «Kho nguồn chưa bật: thiếu KHO_TAI_LIEU_BLOB_TOKEN». (cross-layer)
- AC-4: Given bảng năng lực của agent, When dựng nó trong sáu ô của AC-1 (bốn ô có/vắng, ô khoá kho nguồn toàn khoảng trắng, ô khoá logo rỗng), Then mục `LUU_NGUON` bật khi và chỉ khi `KHO_TAI_LIEU_BLOB_TOKEN` có và nêu nguồn là `KHO_TAI_LIEU_BLOB_TOKEN`; And mục «Picture storage» bật khi và chỉ khi `BLOB_READ_WRITE_TOKEN` có; And dựng bảng không ném lỗi trong ô nào.
- AC-5: Given kho mã, When quét các nhà của biến, Then `KHO_TAI_LIEU_BLOB_TOKEN` có mặt ở `.env.example` (kèm ghi chú store private, không gắn dự án), `apps/api/src/config/env.validation.ts`, `globalPassThroughEnv` của `turbo.json` gốc, `passThroughEnv` của mọi task `apps/api/turbo.json` và `apps/agent/turbo.json` đang khai `BLOB_READ_WRITE_TOKEN`, bảng năng lực ở `docs/environment.md`, mục «Kho tài liệu: nguồn» ở `docs/api.md`; And ghi chú ở `.env.example` nói store private và không gắn dự án; And mục «Kho tài liệu: nguồn» ở `docs/api.md` nêu tên mới và không còn nêu `BLOB_READ_WRITE_TOKEN`; And biến không nằm trong mảng `env` hay `globalEnv` nào của ba tệp `turbo.json`; And `packages/db/src/blob-nguon.ts` và mọi tệp agent gọi `khoNguonVercel` không đọc `BLOB_READ_WRITE_TOKEN`.
- AC-6: Given `.env` có `KHO_TAI_LIEU_BLOB_TOKEN` trỏ store private thật `kho-tai-lieu-nguon`, When chạy phép thử thật `_acceptance/may-soan-de-xuat/rang/blob-that.mjs` trong phiên đo riêng, Then bốn bước đạt: PUT vào URL ký, `sha256` của hàng khớp tệp, GET bằng URL ký trả đúng byte, GET không ký bị từ chối; And thiếu biến thì thoát mã 2 với «thieu KHO_TAI_LIEU_BLOB_TOKEN that»; And script không in giá trị khoá ở nhánh nào. (cross-layer)
- AC-7: Given bàn đo màn tải nguồn của `may-soan-de-xuat` (`rang/man-tai-nguon.mjs`, Blob API giả), When nó dựng lại API của phiên đo, Then API chạy với `KHO_TAI_LIEU_BLOB_TOKEN` giả và kho nguồn bật trên API đó (`trangThai` trả `{ bat: true }`) trước bước chụp đầu tiên.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix), 2026-09-28. Chân sản phẩm: đào repo
(`packages/db/src/blob-nguon.ts`, `packages/db/src/blob.ts`, `docs/environment.md`). Chân ngành:
tài liệu Vercel Blob — một store là public hoặc private, token không mang kiểu store; Twelve-Factor
App mục III Config — cấu hình khác nhau thì là biến khác nhau.

- Trục A — trạng thái hai biến: 2×2 ô cộng hai ô rỗng/khoảng trắng = vắng (AC-1, AC-3, AC-4). [thước CE: bảng chân trị hai biến, đủ 4/4, cộng hai ô trim]
- Trục B — bên đọc token: kho nguồn ở API (`kho-nguon.ts`) · agent đọc nguồn khi soạn (`dispatch.ts`, cùng `khoNguonVercel`) · bảng năng lực agent · logo và ảnh (`blob.ts`) · bàn đo (`blob-that.mjs`, `man-tai-nguon.mjs`) (AC-1..5, AC-6, AC-7 — đường agent đọc nguồn ghim tĩnh ở AC-5). [thước CE: `git grep BLOB_READ_WRITE_TOKEN` và `git grep blob-nguon` tại `8b76152a`]
- Trục C — nhà của biến: `.env.example` · `env.validation.ts` · turbo gốc · turbo api/agent · tài liệu (AC-5). [thước CE: `docs/environment.md` «A new variable has three homes»]
- Trục D — hành vi thấy được: bật/tắt · token nào gửi đi · thông điệp · không ném khi khởi động (AC-1..4). [thước CE: `AGENTS.md` «must never throw»]
- Later: thuộc tính telemetry `cap_kho_nguon` (`apps/api/src/telemetry/rollup.service.ts`); kiểm kiểu store (public/private) lúc khởi động.
- Never: lùi sang `BLOB_READ_WRITE_TOKEN` (chủ kho chốt A); đổi tên `BLOB_READ_WRITE_TOKEN` của logo (Vercel tự đặt tên đó khi gắn store vào dự án).
- [GIẢ ĐỊNH] Store public (logo) từ chối ghi `access: "private"`, nên một bản lùi sang tên chung sẽ mở nút rồi hỏng mọi lượt tải — lý do chọn A; chưa thử trên store public thật.

## Out of scope

- Đặt `KHO_TAI_LIEU_BLOB_TOKEN` hay `BLOB_READ_WRITE_TOKEN` lên các dự án Vercel — hỏi chủ kho sau merge.
- Lùi sang `BLOB_READ_WRITE_TOKEN` khi biến riêng vắng.
- Thuộc tính telemetry cho kho nguồn và cập nhật `docs/telemetry.md`.
- Đổi logic `packages/db/src/blob.ts` hay chuyển tệp logo, ảnh đã có.
- Kiểm store là public hay private lúc khởi động.

## Notes

- **Thay AC-5 của `may-soan-de-xuat`.** Hợp đồng đó ký 2026-09-28 và không sửa; dòng sổ quyết định
  trong hồ sơ đó trỏ sang đây. Test E5 của nó (`tai-lieu-nguon-tat.spec.ts`, ô cả hai biến vắng)
  vẫn đúng; ô «chỉ khoá logo» thuộc AC-3 ở đây.
- **Vòng này chạm thước của `may-soan-de-xuat`** (`packages/db/src/blob-nguon.ts`, `rang/blob-that.mjs`,
  `rang/man-tai-nguon.mjs`, `tai-lieu-nguon-tat.spec.ts`, `capabilities.ts`): hồ sơ đó ghim lại ở
  đầu nhánh, sau lần commit cuối.
- **Tiền đề của AC-6:** chủ kho tự thêm dòng `KHO_TAI_LIEU_BLOB_TOKEN=…` vào `.env` gốc (khoá
  của store `kho-tai-lieu-nguon`); máy không đọc, không in giá trị.
