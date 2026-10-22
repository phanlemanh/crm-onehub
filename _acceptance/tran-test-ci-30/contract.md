---
schema_version: 1
feature: Nâng trần job test của CI từ 20 lên 30 phút
slug: tran-test-ci-30
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, docs]
status: approved
approved_by: manh
approved_at: 2026-10-22T13:16:29Z
design_doc: docs/superpowers/specs/2026-10-22-tran-test-ci-30-design.md
---

# Acceptance Contract: tran-test-ci-30

## Context

Việc phụ F-129 của đợt `viec-du-an-kho-tai-lieu` (dãy V2), Điều phối M5 giao 22/10. Không có ô Cổng Đáng, không mã
lộ trình. Hai ô `test (api)` và `test (app-ui)` của ma trận CI sát trần 20 phút: trong 40 lượt gần nhất (đo 22/10),
`test (api)` có 16 lượt xanh từ 17 phút trở lên và 2 lượt bị huỷ ở trần; `test (app-ui)` xanh với trung vị 18,4 phút.
Ba ô dùng chung một trần.

Hạng T2: chạm `.github/workflows/ci.yml` (không phải T1), một eval của hồ sơ đã ký, tài liệu và hồ sơ.

Source input: lời giao của giám sát đợt 22/10 · `.github/workflows/ci.yml` · `CONTRIBUTING.md` · luật 47 trong
`CLAUDE.md` · `_acceptance/giam-phut-ci-nhap-t1/evals.yaml` · design doc.

«Cây nền» là cha của commit đổi trần job `test` từ 20 thành 30 trong lịch sử `.github/workflows/ci.yml` (lúc soạn:
`onehub` ở `05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467`); khi thay đổi còn chưa commit, cây nền là `HEAD`.

## Criteria

- AC-1: Given `.github/workflows/ci.yml` ở cây nền và ở commit đổi trần, When so hai bản đã đọc thành cấu trúc và so
  từng dòng, Then hai bản lệch đúng một khoá `jobs.test.timeout-minutes`, từ 20 thành 30, và khác đúng một dòng — trần
  của job `check`, `phan-loai`, `ci-ok`, ma trận ba ô, dịch vụ, biến môi trường và các bước giữ nguyên; và `ci.yml` của
  cây hiện tại còn trần 30.
- AC-2: Given răng của eval đã ký `giam-phut-ci-nhap-t1/E3` (`rang/hinh.mjs ci`), When chạy nó trên cây nền và trên cây
  vòng này, Then hai lượt có cùng một tập mục kiểm và cùng một tập ca đột biến bị bắt; nền đạt mọi mục; cây chỉ khác nền
  ở mục `test.con-lai`, với lý do `timeout-minutes`.
- AC-3: Given `_acceptance/giam-phut-ci-nhap-t1/evals.yaml`, When so với cây nền, Then E3 khai `status: not-run` và
  `superseded_by: tran-test-ci-30#AC-2`, đúng hai dòng thêm ngay sau `cmd` của E3, không eval nào khác đổi; và hồ sơ này
  nêu thẻ `giam-phut-ci-nhap-t1/E3` đứng riêng.
- AC-4: Given vòng xong, When người đọc `docs/plan/2026-10-22-hat-giong-tach-o-api.md` và design doc, Then hạt giống nói
  điều kiện mở lại «trung vị test (api) > 22′» và vì sao chưa tách (khoảng 3′ cài đặt cho mọi lượt), và design doc có
  bảng số đo 40 lượt chia nhóm rời nhau cộng đủ 40 cho mỗi ô. (judgment)

## Coverage

Bỏ quét bằng skill (sổ quyết định, dòng «bỏ coverage-scan» mới nhất); trục lấy thẳng từ tệp:

- Trục A, khoá của `ci.yml`: khoá đổi (AC-1) · mọi khoá khác của mọi job và khoá gốc (AC-1).
- Trục B, eval đã ký đọc `ci.yml`: eval đổi màu vì vòng này (AC-2, AC-3) · eval không đổi màu (không đo bằng máy trong
  vòng này — sổ quyết định, dòng «KHÔNG chạy lại các eval khác»; lượt CI thật xanh trọn trước gộp) [thước CE: eval đang
  sống có `paths` khớp `.github/workflows/ci.yml` theo glob — 18 eval, đếm 22/10].
- Trục C, chỗ ghi lý do: hạt giống và bảng số đo (AC-4).

## Out of scope

- Tách ô `test (api)` thành nhiều ô: hạt giống, mở lại khi trung vị vượt 22′.
- Đổi trần job `check`, `phan-loai`, `ci-ok`, hay `acceptance.yml`.
- Làm bài api chạy nhanh hơn.
- Sửa `giam-phut-ci-nhap-t1/E2` (`rang/mot-nguon.mjs`) đỏ sẵn trên cây nền.
- Chạy lại 18 eval khác có `paths` khớp `ci.yml` trên cây nền và cây vòng này.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bảng số đo đầy đủ nằm ở design doc và mô tả PR.
- Lượt CI GitHub thật trên PR (ba ô `test`, `check`, `ci-ok`) phải xanh trọn trước gộp; đó là cổng gộp của kho, không
  phải eval của hồ sơ.
