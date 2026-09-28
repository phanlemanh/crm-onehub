---
schema_version: 1
feature: Thước màn chữ E6u của bo-chu-lap-keo-tha mở hộp tải nguồn bằng khoá kho nguồn KHO_TAI_LIEU_BLOB_TOKEN sau khi PR #197 đổi tên khoá
slug: man-chu-theo-khoa-kho-nguon
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [script]
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-28T15:20:47Z
design_doc: docs/superpowers/specs/2026-09-28-man-chu-theo-khoa-kho-nguon-design.md
---

# Acceptance Contract: man-chu-theo-khoa-kho-nguon

## Context

PR #197 (`kho-nguon-khoa-rieng`) đổi khoá kho nguồn từ `BLOB_READ_WRITE_TOKEN` sang
`KHO_TAI_LIEU_BLOB_TOKEN` (`BLOB_NGUON.bienKhoa`). Thước màn thật E6u của hồ sơ đã ký
`bo-chu-lap-keo-tha` còn đặt và nhắc tên cũ, nên nút «Tải nguồn lên» khoá và thước thoát mã 2
«KHONG DO DUOC: … nut tai nguon khoa». E6u là `ui-check`, ngoài làn ghim lại, nên CI không bắt.
Đo 2026-09-28 tại `8797af8b`: trên Mac mini thước cũ vẫn thoát 0, vì `.env` checkout chính có
`KHO_TAI_LIEU_BLOB_TOKEN` thật và phiên đo nạp nó cho biến chưa đặt — thước đang mở nút bằng khoá
thật, không bằng khoá giả lệnh tưởng đã đặt. Chạy cùng lệnh với `KHO_TAI_LIEU_BLOB_TOKEN=` rỗng
(máy không có khoá thật) thì thoát 2 «nut tai nguon khoa — phien do thieu BLOB_READ_WRITE_TOKEN».
Chủ ngữ của hợp đồng này là cái thước, không phải sản phẩm.

Source input: yêu cầu chủ kho 2026-09-28; `_acceptance/kho-nguon-khoa-rieng/contract.md`; commit `f122f8ce`.

## Criteria

- AC-1: Given lệnh `executors.script.bclkt_man_chu` trên cây hiện tại, When chạy nó, Then lệnh đặt `KHO_TAI_LIEU_BLOB_TOKEN` bằng một khoá giả (không đọc khoá thật của `.env`), thước thoát 0 và in `buoc 1: dat` và `buoc 2: dat`; And hai ảnh `bclkt-tai-1440.png`, `bclkt-tai-390.png` cho thấy hộp tải nguồn đã mở với vùng kéo thả.
- AC-2: Given cùng thước chạy với `KHO_TAI_LIEU_BLOB_TOKEN=` rỗng tường minh, When phiên đo mở màn Tài liệu, Then thước thoát mã 2 với thông điệp ghim `nut tai nguon khoa — phien do thieu KHO_TAI_LIEU_BLOB_TOKEN`; And không in dòng `dat` nào.
- AC-3: Given chiều đỏ của thước (`man-chu.mjs --chieu-do`, bản sao `tai-lieu.ts` giữ câu gợi ý cũ), When một phép kiểm chạy nó hai lần — lần một với `KHO_TAI_LIEU_BLOB_TOKEN` giả, lần hai với biến đó rỗng tường minh, Then lần một thoát 0 và in `chieu do: DO DUNG GHIM: ma 1, in «chu vung keo tha man that lech»`; And lần hai thoát 2 và in `chieu do: ban sao thoat ma 2 (tien de thieu)` — chiều đỏ cần khoá kho nguồn, không đúng ghim nhờ khoá thật của `.env`.
- AC-4: Given tên khoá kho nguồn đọc từ `BLOB_NGUON.bienKhoa` ở `packages/db/src/blob-nguon.ts`, When quét bốn chỗ của thước — lệnh `bclkt_man_chu`, thông điệp tiền đề và thông điệp nút khoá của `man-chu.mjs`, khối E6u của `bo-chu-lap-keo-tha/evals.yaml`, Then cả bốn chỗ gọi đúng tên ấy và không chỗ nào còn `BLOB_READ_WRITE_TOKEN`; And lệnh đặt biến đó bằng chữ nguyên văn khác rỗng (không `$`, không backtick, không nháy) — một lệnh mở rộng biến từ shell làm phép quét đỏ; And đổi `bienKhoa` sang tên khác làm phép quét đỏ ở cả bốn chỗ.

## Coverage

Bỏ quét `morphological-scan` (xem sổ quyết định). Trục viết tay:

- Trục A — chỗ tên khoá xuất hiện trong thước: lệnh config · thông điệp tiền đề · thông điệp nút khoá · lời mô tả E6u (AC-4). [thước CE: `git grep BLOB_READ_WRITE_TOKEN -- _acceptance/bo-chu-lap-keo-tha _acceptance/config.yaml` tại `8797af8b`]
- Trục B — khoá khi chạy: giả đặt tường minh (AC-1, AC-3) · rỗng tường minh (AC-2, AC-3) · vắng mà `.env` có khoá thật — không xảy ra vì lệnh luôn đặt khoá giả bằng chữ nguyên văn (AC-1, AC-4); biến đặt tường minh thắng `.env` — đo 2026-09-28: ca rỗng tường minh khoá nút dù `.env` có khoá thật.
- Trục C — chiều đo: xanh (AC-1) · nút khoá mã 2 (AC-2) · chiều đỏ đúng ghim (AC-3).
- Later: quét thước của mọi hồ sơ tìm biến môi trường đã đổi tên.
- Never: sửa nút, API hay `blob-nguon.ts` trong vòng này.

## Out of scope

- Sửa sản phẩm (nút tải nguồn, API kho nguồn, `blob-nguon.ts`).
- Quét thước của các hồ sơ khác; `msd_blob_that` đặt `BLOB_READ_WRITE_TOKEN` có chủ ý (khoá logo giả).
- Đổi hợp đồng đã ký của `bo-chu-lap-keo-tha`.

## Notes

- **Vòng này chạm thước của `bo-chu-lap-keo-tha`** (`rang/man-chu.mjs`, `evals.yaml`, lệnh trong `config.yaml`). Ghim lại hồ sơ đó chỉ khi `pre-merge-check` không `--slug` báo hoá cũ; E6u sẽ nằm ở `evals_not_machine_touched` — E1 ở đây chạy đúng lệnh E6u và là bằng chứng màn.
- Ghi nhớ `hop-tai-nguon-can-khoa-blob-gia.md` (ngoài kho) cập nhật theo tên mới trong vòng này.
