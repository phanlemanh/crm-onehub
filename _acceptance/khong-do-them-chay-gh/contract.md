---
schema_version: 1
feature: Hai phép kiểm luồng tự động của kho (gpct_luot_that, gpct_nen_gop) chạy thật trong bàn đo, không bị tính «đỏ sẵn» ở cả hai cây
slug: khong-do-them-chay-gh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-19T13:49:00Z
design_doc: _acceptance/khong-do-them-chay-gh/design.md
---

# Acceptance Contract: khong-do-them-chay-gh

## Context

Phép đo «không đỏ thêm» của hồ sơ `chuyen-goi-dieu-phoi` (E10) dựng hai bản clone — `HEAD` và merge-base — rồi chạy lại
eval của các hồ sơ đã ký. Bản clone có `origin` là đường cục bộ và đứng ở `HEAD` tách, nên hai lệnh cần `gh`
(`gpct_luot_that`, `gpct_nen_gop`) thoát 2 ở cả hai cây và bị tính «đỏ sẵn»: phép đo báo xanh dù luồng đó hỏng. Vòng này
cho bản clone mang môi trường `gh` của cây gốc, và gộp luôn PR #396 (kiểm chéo đêm dựng lại cây khi checkout của bước phân
loại hỏng). «Bàn đo» trong các tiêu chí là `_acceptance/chuyen-goi-dieu-phoi/rang/khong-do-them.mjs`; «hàm đặt nền» là
`datNenBan` mà bàn đo gọi cho từng bản. «Chạy thật» nghĩa là chạy như ở cây gốc: khi cây gốc có PR mở của branch đang
đứng, cả hai lệnh chạy được; khi không có (lượt kiểm chéo đêm, cây trên `onehub`), `gpct_luot_that` thoát 2 ở chính cây gốc
— bàn đo khi ấy cũng thoát 2, đúng như cây gốc (Out of scope).

Source input: hàng F26 của `docs/plan/lo-trinh-okr.json` (Ngoài-3 của `chuyen-goi-dieu-phoi`, chủ kho chọn «mở hợp đồng
mới» ở Cổng Bằng chứng 12/10); ô `_acceptance/khong-do-them-chay-gh/opportunity.md`.

## Criteria

- AC-1: Given cây gốc đứng trên một branch tính năng và có `origin` trên GitHub, When bàn đo dựng bản `HEAD` và bản
  merge-base bằng `cloneDocLap` rồi hàm đặt nền, Then ở mỗi bản: URL `origin` bằng URL `origin` của cây gốc; `gh repo view`
  ra cùng `nameWithOwner` với cây gốc; tên branch đang đứng bằng tên branch của cây gốc; `HEAD`, `onehub` và
  `origin/onehub` bằng sha của bản.
- AC-2: Given nguồn của hàm đặt nền là một cây tách, hoặc một cây đứng trên `onehub`, When dựng bản `HEAD` và bản
  merge-base từ nguồn đó, Then với nguồn tách bản cũng tách; với nguồn `onehub` bản đứng trên `onehub`; và ở mọi bản URL
  `origin`, `HEAD`, `onehub`, `origin/onehub` đúng như AC-1.
- AC-3: Given cây gốc có PR nháp mở và hai lệnh `gpct_nen_gop`, `gpct_luot_that` (giải từ `_acceptance/config.yaml`) cùng
  thoát 0 ở cây gốc, When chạy hai lệnh ấy trong bản `HEAD` và bản merge-base của AC-1, Then ở bản `HEAD` cả hai thoát 0, ở
  bản merge-base cả hai thoát 0 hoặc 1 (lệnh chạy thật, mã thoát có thể khác vì workflow ở merge-base khác), và không đầu ra
  nào của bản có dòng `MA 2:`. Và trên cùng hai sha: bản dựng bằng `cloneDocLap` mà không qua hàm đặt nền thì `gpct_nen_gop`
  ra `MA 2: gh repo view`; bản chỉ được đặt URL `origin` mà vẫn tách thì `gpct_luot_that` ra `MA 2: nhanh HEAD khong co PR
  mo` — phép đo phải bắt được cả hai.
- AC-4: Given branch của vòng có PR nháp mở với lượt CI và Acceptance nháp đã chạy xong, When chạy bàn đo với `--chi
  gpct_luot_that,gpct_nen_gop`, Then dòng `chay:` liệt đúng hai khoá ấy và đứng trước khi dựng bản; các dòng báo từng lệnh nói
  về đúng hai khoá ấy; bàn in `xanh gpct_luot_that` và `xanh gpct_nen_gop`, không dòng `do san gpct_`, và kết `KET LUAN:
  xanh` mã 0. Và bản chép của bàn đo mà `dungBan` chỉ đặt `onehub` như trước vòng thì in `do san
  gpct_nen_gop` với nhật ký chứa `MA 2: gh repo view` — phép đo phải bắt được.
- AC-5: Given bàn đo chạy với `--chi-rut`, When không có `--chi`, Then dòng `chay:` liệt đúng mọi khoá của tập đã rút; When
  `--chi gpct_nen_gop`, Then dòng `chay:` chỉ có `gpct_nen_gop`; When `--chi` nêu một khoá không có trong tập, hoặc `--chi`
  không kèm danh sách, Then bàn thoát 2 với dòng `KHONG DO DUOC` gọi tên lỗi; và chạy đầy đủ (không `--chi-rut`) với khoá
  không có trong tập thì bàn cũng thoát 2 mà không dựng bản nào.
- AC-6: Given lượt kiểm chéo đêm mà cây bị mất hoặc bị làm bẩn giữa làn và bước phân loại, When bước phân loại check out
  một sha giữa khoảng, Then cây mất thì được dựng lại và lượt vẫn ra `do-moi`; cây bẩn ở tệp khác giữa hai sha thì phân
  loại vẫn chạy đúng sha, không `khong-chay-duoc`; cây bẩn ở tệp giống nhau giữa hai sha thì tệp bẩn không bị mang sang sha
  cũ; lệnh git hỏng thì `ly_do` mang dòng lỗi của git, không chỉ `Command failed`. Mỗi bảo đảm trong bốn bảo đảm ấy có một
  ca thử mang tên, và với mỗi bảo đảm có ít nhất một lần bỏ mảnh mã giữ nó (trong một bản chép) làm đúng ca đó đỏ.
- AC-7: Given `scripts/kiem-cheo/` sau vòng, When chạy toàn bộ bài kiểm của kiểm chéo, Then mọi ca xanh.

## Coverage

Bỏ coverage-scan — không gian là ba trục nhỏ đã liệt hết ở bảng «Ma trận» của design doc (entry «bỏ coverage-scan» trong
`decisions.jsonl`).

- Trục nguồn: branch tính năng (AC-1) | tách (AC-2) | `onehub` (AC-2)
- Trục cây: `HEAD` | merge-base — mọi AC-1…AC-3 đo cả hai
- Trục lệnh: `gpct_nen_gop` | `gpct_luot_that` (AC-3, AC-4)
- Trục lối hỏng của kiểm chéo: cây mất | bẩn tệp khác | bẩn tệp giống | git hỏng (AC-6)

## Out of scope

- `gpct_luot_that` trên cây không có PR mở (lượt kiểm chéo đêm, bàn đo chạy trên `onehub`) vẫn thoát 2 ở cả hai cây — đó
  là hành vi đã khai của E11 `giam-phut-ci-nhap-t1` («khong co -> ma 2»), không phải bàn.
- Không đổi hai lệnh `gpct_*` hay bàn đo riêng của `giam-phut-ci-nhap-t1` (bàn đó dùng worktree, `origin` vẫn là GitHub).
- Không sửa chữ `expected` của E10 trong `evals.yaml` của `chuyen-goi-dieu-phoi`.
- Không chạy trọn bàn đo ở lượt chấm của vòng — trọn bàn do lượt ghim lại `chuyen-goi-dieu-phoi` trước gộp chạy.

## Notes

- Vòng chạm `_acceptance/chuyen-goi-dieu-phoi/rang/**` và `scripts/kiem-cheo/**`, nên các hồ sơ đã ký có `paths` khớp —
  ít nhất `chuyen-goi-dieu-phoi` và `kiem-cheo-sau-gop` — cần ghim lại trước gộp.
- AC-4 cần PR nháp của branch đã mở và lượt CI nháp đã xong trước lượt chấm.
- PR #396 đóng khi PR của vòng mở.
