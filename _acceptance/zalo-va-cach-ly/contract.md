---
schema_version: 1
feature: Bài kiểm Zalo của apps/agent thôi nhập mã apps/app; hai bài «câu chào» xuyên ứng dụng và hàm nhãn điều hướng dời nguyên văn sang test của apps/app — luật cách ly hai agent xanh trở lại
slug: zalo-va-cach-ly
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: []
status: verified
approved_by: Phan Le Manh
approved_at: 2026-10-07T21:02:48Z
design_doc: _acceptance/zalo-va-cach-ly/design.md
---

# Acceptance Contract: zalo-va-cach-ly

## Context

`node scripts/luat-kho/do-cay.mjs --du-luat` (khoá `luat_kho_cay_du`) thoát 1 trên `onehub` 0426cc9d0. Luật
`cach-ly-hai-agent` bắt `apps/agent/test/zalo-va.integration.spec.ts:7-8`: test của `apps/agent` nhập
`apps/app/lib/messages/khung-ung-dung` và `.../nhac-qua-zalo`. Hai bài trong khối `cau-chao` (cùng hàm `nhanDieuHuongKhac`) dùng hai bộ chữ đó
để kiểm rằng câu hướng dẫn của bot (`ZALO.loi.huongDan`, `apps/agent/agent/lib/zalo-config.ts`) trỏ đúng nhãn
«Nhắc buổi sáng» và nút «Nối Zalo» thật trên màn, và không có nhãn điều hướng nào đứng trước «Nhắc buổi sáng».
Lệnh đỏ này là E27 của hồ sơ đã ký `soan-okr-cung-tro-ly`, nên F13 và K2 không ghim lại được hồ sơ đó.

Luật chỉ soi tệp nằm TRONG một app agent. `zalo-config.ts` không nhập gì. Vì thế hai bài và hàm đó dời được sang một tệp
kiểm của `apps/app`, giữ nguyên phép kiểm, không nới luật.

## Criteria

- AC-1: Given cây ở HEAD, When chạy `node scripts/luat-kho/do-cay.mjs --du-luat`, Then thoát 0; dòng `XANH cach-ly-hai-agent` không kèm miễn trừ nền; và bộ tự kiểm của chính lệnh vẫn bắt ca «test của agent nhập app không phải Nest» (`DUNG pha-test-cua-agent-nhap-app-khong-phai-nest`) — luật không bị nới.
- AC-2: Given `apps/agent/test/zalo-va.integration.spec.ts` ở HEAD, When chạy cả tệp trên cơ sở dữ liệu riêng của lượt, Then mọi bài xanh, và tệp không còn import nào trỏ vào `apps/app`.
- AC-3: Given tệp mới `apps/app/test/zalo-cau-chao-nhan.spec.ts`, When chạy nó, Then hai bài «câu chào» xuyên ứng dụng xanh: câu hướng dẫn (lấy từ `ZALO` thật của agent) chứa nhãn «Nhắc buổi sáng» và nút «Nối Zalo» lấy từ bộ chữ thật của app, không nhãn điều hướng nào đứng trước «Nhắc buổi sáng»; bài đối chứng chèn «Cài đặt › » thì bị bắt. Tệp chỉ lấy ba tên đó qua ba dòng import, không tự khai lại.
- AC-4: Given bản ghim spec cũ (0426cc9d0) và hai tệp ở HEAD, When so hai bài đã dời và hàm `nhanDieuHuongKhac`, Then thân của chúng (mọi khẳng định, thông điệp ghim, bài đối chứng) trùng nguyên văn; spec agent ở HEAD bằng đúng bản ghim bỏ hai bài, hàm đó và hai dòng import (so bằng, không so tập con).
- AC-5: Given khoá `r1g_cau_chao` (eval «câu chào» của hồ sơ đã ký `zalo-va`), When chạy nó ở HEAD, Then nó chạy hai bài «câu chào» còn ở agent (2 pass) lẫn hai bài đã dời (2 pass), và thoát 0 — eval đó tiếp tục đo đủ lời hứa cũ.

## Coverage

- Trục A — nơi đặt phép kiểm: còn ở test agent (không nhập app) | dời sang test app (nhập hằng của agent) [thước CE: hàm luật `cach-ly-hai-agent` trong `scripts/luat-kho/do-cay.mjs` chỉ soi tệp trong app agent]
- Trục B — bài trong khối `cau-chao` (4 bài + 1 hàm): «người chưa nói nhận câu hướng dẫn» (CSDL, ở lại) | «câu hướng dẫn chỉ tới Nhắc buổi sáng và nút Nối Zalo» (dời) | «đối chứng chèn Cài đặt» (dời) | «không câu nào còn chữ Thông báo của bạn» (ở lại) | hàm `nhanDieuHuongKhac` (dời) [thước CE: bốn bài và một hàm liệt trong bản ghim]
- Core → AC: luật xanh → AC-1; phần ở lại xanh, hết import app → AC-2; phần dời xanh → AC-3; dời nguyên văn, không nới → AC-4; eval của hồ sơ zalo-va còn đo đủ → AC-5.

## Out of scope

- Dời nhãn «Nhắc buổi sáng», «Nối Zalo» sang một gói dùng chung để bot dựng câu từ cùng nguồn: đúng hơn về lâu dài nhưng đổi mã sản phẩm của hai app; để hồ sơ riêng.
- Đổi hay nới luật `cach-ly-hai-agent`.
- Sửa `evals.yaml` hay hợp đồng của `zalo-va` (giữ nguyên; chỉ dòng lệnh `r1g_cau_chao` trong `config.yaml` chạy thêm tệp mới, và hồ sơ được ghim lại).

## Notes

- Ngưỡng ở `opportunity.md` «làn ghim lại `soan-okr-cung-tro-ly` xanh» đo NGOÀI hồ sơ: P4 chạy làn ghim lại ở đỉnh nhánh trước khi xin `mo_merge`, kết quả nêu trên PR và báo giám sát; làn đỏ thì không mở PR.
- Sau khi vòng này xanh, ghim lại ở cuối nhánh (khoá `s4`, `mo_merge`): `soan-okr-cung-tro-ly` (trong ranh giới) và `zalo-va` — sửa dòng `r1g_cau_chao` làm pin của `zalo-va` hoá cũ; giám sát duyệt thêm `_acceptance/zalo-va/**` cho việc ghim lại (`tra-loi/P4-7.json`).
