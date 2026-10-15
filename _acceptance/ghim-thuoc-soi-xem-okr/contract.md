---
schema_version: 1
feature: "Thước «mọi lời đọc OKR có điều kiện xem» xanh lại và chạy ở CI trên từng PR"
slug: ghim-thuoc-soi-xem-okr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-15T22:22:57Z
design_doc: docs/superpowers/specs/2026-10-16-ghim-thuoc-soi-xem-okr-design.md
---

# Acceptance Contract: ghim-thuoc-soi-xem-okr

## Context

Thước E23 của hồ sơ đã ký `gioi-han-duyet-cay-okr` (`soi-ma.mjs --ca xem`) đỏ 8 lỗi trên onehub: 7 lời đọc mới của
#290, #300, #342, #395 đều nằm sau cổng xem (phân loại 15/10: lộ thật 0) và 1 dòng miễn thừa. Thước chỉ chạy khi ghim lại
hồ sơ, nên bốn PR lọt. Vòng này thêm bảy dòng miễn có lý do, bỏ dòng thừa, và cho CI chạy thước trên mọi PR và mọi push
lên `onehub`. Cổng Đáng: chủ kho, 2026-10-15T21:30:04Z.

Source input: `_acceptance/ghim-thuoc-soi-xem-okr/opportunity.md` · bảng phân loại
`_acceptance/ghim-thuoc-soi-xem-okr/nguon/phan-loai-soi-xem.md` · design doc.

## Criteria

- AC-1: Given cây của nhánh, When chạy `bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem` từ gốc kho, Then
  lệnh thoát 0, in «XANH» và «MIEN_XEM 114 dong».
- AC-2: Given bảy dòng miễn mới (`xoaMucTieu` × `tho:okrKeyResult`, `xoaMucTieu` × `okrObjective`, `lichSuMucTieu`, `mine`,
  `coKrSuaDuoc`, `congSuaCanChinh`, `suaLyDoCanChinh`), When trên một gương của thước (gốc giả trỏ tới mã thật) bỏ từng dòng
  một, Then mỗi lần thước thoát 1 và gọi đúng «thieu dieu kien xem: <tệp>:<dòng> <hàm> <bảng>» của chỗ ấy, không gọi chỗ nào
  khác; trả lại dòng `removeAlignment` → thoát 1 với «MIEN_XEM thua (khong khop loi goi nao): …#removeAlignment#okrAlignment»;
  xoá chữ lý do của một dòng mới → thoát 1 với «MIEN_XEM thieu ly do»; gương nguyên → thoát 0 «XANH»; và
  `--ca xem --chieu-do` sẵn có vẫn in «3/3 vi pham bi bat».
- AC-3: (judgment) Given bảng phân loại 15/10 và `soi-ma.mjs` của nhánh, When người chấm đọc lý do của bảy dòng miễn mới,
  Then mỗi lý do nêu đúng cổng ở tầng trên mà bảng ghi cho chỗ ấy (hàm cổng, hoặc vì sao đầu ra không rộng hơn điều kiện
  xem), và không khẳng định điều bảng không chứng.
- AC-4: Given `.github/workflows/acceptance.yml` của nhánh, When đọc nó như YAML, Then job `luat-kho` có đúng một bước tên «OKR read rule»,
  `run` của nó bằng nguyên văn lệnh `executors.script.ghd_soi_xem` của `_acceptance/config.yaml`; bước đứng sau
  `bun install --frozen-lockfile` và sau bước luật kho, không `continue-on-error`, `if` vắng hoặc là `${{ !cancelled() }}`;
  job không có `if`; `on.pull_request` không có `paths`, `paths-ignore`, `branches` (bước chạy trên mọi PR — theo khuyến
  nghị của Hỏi-1, sửa theo câu trả lời); `on.push.branches` có `onehub`. Sáu bản đột biến của tệp (bỏ bước · đổi tên bước ·
  thêm `continue-on-error` · thêm `if` cấp job · thêm `paths` cho `pull_request` · đổi `run` khác lệnh trong config) mỗi bản cho
  một thông điệp đỏ có tên.
- AC-5: (cross-layer) Given chuỗi `run` của bước ấy rút từ `acceptance.yml`, When chạy chuỗi đó trong gương, Then gương nguyên
  → thoát 0 và in «XANH»; gương bỏ dòng miễn `coKrSuaDuoc` → thoát khác 0 và in «DO» — đúng mã mà GitHub Actions dùng để
  đánh đỏ bước.
- AC-6: Given các thước của hồ sơ đã ký đang đọc chữ `acceptance.yml` và xanh trên nền vòng này (danh sách viết trước ở
  `evals.yaml`, E6a–E6c: `lkv_ci`, `cgdp_cong`, `kcb_khong_noi_tran`), When chạy lại chúng trên cây của nhánh, Then mỗi thước thoát 0; và năm thước đã đỏ sẵn trên nền (`gpct_hinh_acceptance`, `gpct_luong`, `dpvb_cong`,
  `gpa_hinh`, `gpa_khong_mat_lenh`) không sinh dòng lỗi nào trên nhánh mà nền không có (E6d).
- AC-7: Given `docs/api.md`, When đọc đoạn nói `soi-ma.mjs --ca xem` đỏ khi thiếu điều kiện, Then đoạn ấy nói job
  «acceptance gate» của `.github/workflows/acceptance.yml` chạy thước trên mọi pull request và mọi push lên `onehub`.

## Coverage

Quét tay ba trục.
- Trục loại dòng miễn: {thêm đúng chỗ · bỏ dòng thừa · thiếu lý do · lời đọc mới không miễn} → AC-1, AC-2 (cả bốn ô), AC-3
  (lý do đúng nghĩa).
- Trục nơi thước chạy: {máy trong ghim lại · CI trên PR nháp · CI trên PR sẵn sàng · CI trên push `onehub`} → E23 của
  `gioi-han` (ghim lại), AC-4 (ba ô CI: job không `if`, không qua bộ phân loại, `pull_request` không lọc, `push` có `onehub`).
- Trục lớp đo của bước CI: {hình workflow · hành vi lệnh · không làm hỏng thước khác của tệp} → AC-4, AC-5, AC-6.
- Lần chạy thật trên GitHub không đo ở S4 — xem Notes. `[CE chưa kiểm chứng]`

## Đường đo

- «`soi-ma --ca xem` xanh trên onehub ngay sau gộp» — số từ bước «OKR read rule» của lượt push đầu tiên lên `onehub` sau gộp
  (`gh run view <run> --json jobs`). AC-1 bảo đảm thước xanh, AC-4 bảo đảm bước có mặt ở push.
- «CI của PR đỏ khi thước đỏ» — AC-5 (mã thoát của chính chuỗi lệnh), AC-4 (bước không `continue-on-error`, job không `if`).
- «14 ngày sau gộp, 0 lần thước đỏ trên onehub mà CI của PR gốc xanh» — đếm tay bằng
  `gh run list -w acceptance.yml -b onehub -e push` rồi đọc kết luận bước «OKR read rule» của từng lượt và của lượt PR gốc.
  Không có script; số đọc vào ngày thứ 14. Mỗi lượt push đỏ phân loại trước khi tính: lấy sha head và sha base của lượt CI
  cuối của từng PR trong lô gộp, so với cha của commit gộp — «lệch base» (PR xanh trên base cũ, đỏ do PR khác cùng lô) hay
  «PR gốc xanh trên đúng base». Chỉ loại sau tính vào CHẾT.

## Out of scope

- Sửa hợp đồng đã ký của `gioi-han-duyet-cay-okr` (dòng Notes «ai gộp sau … chạy lại `soi-ma.mjs --ca xem`»).
- Đổi logic soi hay khoá miễn `tệp#hàm#bảng` của thước.
- Đặt bước CI làm check bắt buộc — `onehub` không có luật bảo vệ nhánh; đó là cài đặt kho của chủ kho.
- Lọc bước CI theo đường dẫn — theo khuyến nghị Hỏi-1 (`d-20261015T221306Z-7`); chủ kho chọn lọc thì mục này rời
  Out of scope và AC-4 đổi theo.
- Các `--ca` khác của `soi-ma.mjs` và thước của hồ sơ khác.

## Notes

- Sửa `rang/soi-ma.mjs` kéo `gioi-han-duyet-cay-okr` vào diff — PR ghim lại hồ sơ đó ở tip nhánh.
- Khoá miễn là `tệp#hàm#bảng`: lời đọc thứ hai trên cùng bảng trong cùng hàm đã miễn sẽ lọt — giới hạn có từ trước, không đổi
  ở vòng này.
- Năm thước của hồ sơ đã ký đọc `acceptance.yml` đã đỏ trên nền `d086bf8cf` trước vòng này (đo S1 16/10): `gpct_hinh_acceptance`, `gpct_luong` (`giam-phut-ci-nhap-t1`), `dpvb_cong` (`dieu-phoi-va-bien`, sập khi chạy), `gpa_hinh`, `gpa_khong_mat_lenh` (`giam-phut-acceptance`). Không nằm trong AC-6; báo giám sát.
- Bước chạy trên lượt `pull_request` (merge ref lúc chạy). Kho gộp theo lô với `--match-head-commit` và không chạy lại khi
  base dời, nên hai PR mỗi PR xanh riêng vẫn có thể làm onehub đỏ — lượt push lên onehub bắt điều đó; Đường đo tách ca này
  khỏi ngưỡng CHẾT.
- Lần chạy thật trên GitHub (bước «OKR read rule» xanh trong job «acceptance gate» của PR) đọc ở S5 sau khi PR mở; S4 chỉ
  đo hình workflow và hành vi lệnh trên máy.
