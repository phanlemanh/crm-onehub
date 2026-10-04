---
schema_version: 1
feature: Bản nháp OKR có hai Mục tiêu trùng khoá, hay hai KR trùng khoá dưới cùng một Mục tiêu, bị schema banNhap từ chối ở biên công cụ nop_ban_nhap — agent nhận lỗi nêu đúng ô và nộp lại
slug: chan-trung-khoa-ban-nhap
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-04T04:26:06Z
design_doc: docs/superpowers/specs/2026-10-04-chan-trung-khoa-ban-nhap-design.md
---

# Acceptance Contract: chan-trung-khoa-ban-nhap

## Context

Schema `banNhap` (`packages/validation/src/okr-cuoc-soan.ts`) cho qua bản nháp có hai Mục tiêu
trùng `khoa`, hay hai KR trùng `khoa` dưới cùng một Mục tiêu. `chanTrungKhoa` trong
`apps/agent-okr/agent/lib/nop-ban-nhap.ts` chỉ chặn trùng `khoaDong` — với Mục tiêu và KR đó là tên
chuẩn hoá, không phải khoá. Bản nháp như vậy sinh hai dòng `okrDeXuat` cùng `khoaModel` và cùng
`createdAt`; lần nộp sau `docDaQuyet` giữ dòng `id` nhỏ hơn, nên tên trong `giuNguyen` và cha của
KR theo `chaKhoa` có thể sai.

Chủ kho chốt 04/10: chặn bằng `superRefine` trong schema `banNhap`, ở biên công cụ.

Source input: prompt (phiên 2026-10-04; phát hiện từ hồ sơ `nop-ban-nhap-chon-theo-khoa`, design
doc mục «Mã sản phẩm: không đổi»).

## Criteria

- AC-1: Given một bản nháp có hai Mục tiêu cùng `khoa` (kể cả hai khoá chỉ khác nhau ở khoảng trắng đầu/cuối), When parse bằng `banNhap`, Then parse thất bại với một issue tại `["mucTieu", i, "khoa"]` của Mục tiêu lặp lại, thông điệp `khoa Mục tiêu trùng: <khoa>`.
- AC-2: Given một bản nháp có hai KR cùng `khoa` dưới cùng một Mục tiêu, When parse bằng `banNhap`, Then parse thất bại với một issue tại `["mucTieu", i, "kr", j, "khoa"]` của KR lặp lại, thông điệp `khoa KR trùng trong cùng Mục tiêu: <khoa>`.
- AC-3: Given một bản nháp có nhiều chỗ trùng cùng lúc (ba Mục tiêu một khoá, và một cặp KR trùng), When parse, Then mỗi lần lặp có đúng một issue của riêng nó — không gộp, không dừng ở chỗ đầu.
- AC-4: Given bản nháp có hai KR cùng `khoa` dưới hai Mục tiêu khác nhau, hoặc KR cùng `khoa` với một Mục tiêu, hoặc hai Mục tiêu có khoá chỉ khác hoa/thường, When parse, Then parse thành công và dữ liệu ra bằng dữ liệu vào.
- AC-5: Given một cuộc soạn đang mở trên CSDL thật và một model giả gọi công cụ `nop_ban_nhap` (schema thật, `execute` thật) với bản nháp hai Mục tiêu trùng khoá rồi, ở bước sau, với bản đã sửa, When chạy một lượt `generateText`, Then sau bước một `execute` chưa chạy và cuộc có 0 dòng `okrDeXuat`; model nhận tool-result `error-text` mà mảng issue trong đó bằng đúng một issue `{ path: ["mucTieu", 1, "khoa"], message: "khoa Mục tiêu trùng: m1" }`; sau bước hai `execute` chạy đúng một lần và các dòng của lần nộp cuối có `khoaModel` đôi một khác nhau. (cross-layer)
- AC-6: Given cùng dựng cảnh với AC-5 nhưng bản nháp sai là hai KR trùng khoá dưới một Mục tiêu, When chạy một lượt, Then như AC-5, với số dòng `okrDeXuat` của cuộc sau bước một bằng số trước lượt và issue `{ path: ["mucTieu", 0, "kr", 1, "khoa"], message: "khoa KR trùng trong cùng Mục tiêu: k1" }`. (cross-layer)
- AC-7: Given bản sao của hai tệp kiểm (đơn vị và tích hợp) cùng một bản sao `okr-cuoc-soan.ts`, When chạy trên bản sao nguyên vẹn, Then cả hai xanh; When chỉ gỡ lời gọi `superRefine` trong bản sao, Then cả hai đỏ với chữ ký ghim: ca đơn vị đỏ đúng ở bốn ca từ chối và ba ca nhận vẫn xanh; ca tích hợp đỏ đúng ở hai ca, vì `execute` đã chạy ở bước một.
- AC-8: Given mô tả công cụ `nop_ban_nhap`, thông điệp trong `BAN_NHAP_LOI` và phần thay đổi của `okr-cuoc-soan.ts`, When đọc như agent sẽ đọc, Then mô tả nói rõ khoá là duy nhất giữa các Mục tiêu và giữa các KR của một Mục tiêu (và không cấm KR trùng khoá dưới hai Mục tiêu khác nhau); thông điệp nêu được khoá nào trùng; refine báo mọi lần lặp và so trên giá trị đã `trim`. (judgment)

## Coverage

- Trục A — loại dòng bị trùng: Mục tiêu | KR cùng cha | KR khác cha | KR trùng khoá Mục tiêu [thước CE: `khoaModel` trong `okr-kiem-de-xuat.ts` — hai dòng chung `khoaModel` mới là trùng]
- Trục B — dạng khoá: giống hệt | khác khoảng trắng đầu/cuối | khác hoa/thường [thước CE: `khoaNhap` là `z.string().trim()`; không hạ chữ]
- Trục C — số chỗ trùng: một | nhiều cùng lúc
- Trục D — lớp: schema (parse) | công cụ qua AI SDK + CSDL
- Core → AC: Mục tiêu × giống hệt/khoảng trắng → AC-1 · KR cùng cha → AC-2 · nhiều chỗ → AC-3 · KR khác cha, KR trùng khoá Mục tiêu, khác hoa/thường → AC-4 · lớp công cụ × Mục tiêu → AC-5 · lớp công cụ × KR → AC-6 · chiều đỏ của thước → AC-7 · lời nói với agent → AC-8
- Quét không gian bằng skill `morphological-scan` đã bỏ — sổ quyết định ghi lý do; bốn trục trên liệt tay.

## Out of scope

- Không đổi `nopBanNhap`, `chanTrungKhoa`, `docDaQuyet`: người gọi thẳng `nopBanNhap` (bài kiểm nội bộ) không qua schema nên không được che.
- Không dọn các dòng `okrDeXuat` trùng `khoaModel` đã ghi trên production trước bản vá.
- Không chặn KR trùng khoá giữa hai Mục tiêu khác nhau — `khoaModel` của chúng khác nhau.
- Không dựng máy chủ eve trong bài kiểm: bài tích hợp bọc schema bằng `tool()` của AI SDK.

## Notes

- Giới hạn đo đã biết: eve chuyển nguyên schema Zod vào `tool()` của AI SDK là đọc từ mã eve 0.29.4 (`harness/tools.js`, `shared/tool-schema.js`), không có bài kiểm giữ. Nâng eve thì đọc lại.
- Bài tích hợp nằm ở tệp riêng để không đụng `nop-ban-nhap.integration.spec.ts` mà PR #244 đang sửa.
