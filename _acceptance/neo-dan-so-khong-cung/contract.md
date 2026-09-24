---
schema_version: 1
feature: Thước lái-ra-màn thôi đỏ khi kho chỉ thêm tệp nguồn — bỏ neo số tệp cố định, thay bằng quan hệ «mọi tệp git theo dõi đều được bộ duyệt thấy»; giữ neo chuỗi mặc định và neo bảng cũ
slug: neo-dan-so-khong-cung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [script]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-24-neo-dan-so-khong-cung-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-24T01:45:00Z
---

# Acceptance Contract: neo-dan-so-khong-cung

## Context

`_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs dan-so` ghim số tệp
`.ts/.tsx` dưới bốn thư mục gốc. Mỗi PR thêm tệp nguồn làm lệnh cổng
`cl_tieng_viet_den_man` đỏ và chặn làn ghim lại hồ sơ `chan-lai-component-ra-man`;
sổ ghi sáu lần canh tay (389 → 478), không lần nào vì có chuỗi tiếng Anh mới. Vòng
này sửa thước, không sửa sản phẩm. Gốc: `e22d8288`.

Source input: prompt

Thuật ngữ:
- **bản sao** = thư mục tạm dựng từ các tệp git đang theo dõi (nội dung ở cây làm
  việc), nối `node_modules`, đã `git init` + commit một lần.
- **bản sửa** = `lai-ra-man.mjs` ở cây làm việc; **bản gốc** = `lai-ra-man.mjs` ở `e22d8288`.
- **tệp git theo dõi dưới gốc** = kết quả `git ls-files` của bản sao dưới bốn thư mục
  gốc, chỉ lọc đuôi `.ts/.tsx` (không lọc theo `LOAI_TRU` — phía git độc lập với bộ duyệt).

## Criteria

- AC-1: Given bản sao có thêm một tệp `.ts` mới đã commit dưới `apps/app/lib` không chứa giá trị mặc định nào, When chạy `dan-so` của bản sửa, Then thoát 0 và số tệp in ra lớn hơn bản sao nguyên vẹn đúng 1; cùng ca, bản gốc thoát 1 với dòng `DO: neo file ghim <neo của bản gốc> nhung do duoc <số nguyên vẹn + 1>`; đối chứng: bản gốc trên bản sao nguyên vẹn thoát 0.
- AC-2: Given bản sao có thêm một component đã commit với một tham số mang giá trị mặc định là chuỗi có chữ cái, When chạy `dan-so` của bản sửa, Then thoát 1 với dòng `DO: neo mac_dinh ghim <N> nhung do duoc <N+1>`; đối chứng: bản sao nguyên vẹn thì bản sửa thoát 0.
- AC-3: Given bản sao mà `LOAI_TRU` của bộ duyệt bị thêm tên thư mục `lib`, When chạy `dan-so` của bản sửa, Then số tệp bộ duyệt in ra nhỏ hơn bản sao nguyên vẹn, và thoát 1 với dòng bắt đầu `BO-SOT:` nêu số tệp bị sót BẰNG ĐÚNG số tệp bộ duyệt vừa mất, cùng ít nhất một đường dẫn nằm trong một thư mục `lib`; cùng ca, bản gốc thoát 1 với `DO: neo file` (chỉ bắt được vì số tệp giảm, không gọi tên tệp).
- AC-4: Given bản sao có thêm một tệp `.ts` CHƯA theo dõi git dưới `apps/app/lib`, When chạy `dan-so` của bản sửa, Then thoát 0 và số tệp in ra lớn hơn bản sao nguyên vẹn đúng 1 (bộ duyệt thấy tệp, quan hệ git không đỏ vì tệp chưa commit); cùng ca, bản gốc thoát 1 với `DO: neo file`.
- AC-5: Given một bản sao KHÔNG phải kho git (không `git init`), When chạy `dan-so` của bản sửa, Then thoát 2 với dòng `KHONG DO DUOC:` nhắc git — cả khi bản sao nằm ngoài mọi kho, lẫn khi bản sao nằm trong một thư mục bị git bỏ qua của kho khác (gốc git khác gốc đang đo); và bản sao mà cả bốn thư mục gốc rỗng thì vẫn thoát 2 `KHONG DO DUOC: tap nguon rong`; ca trong thư mục bị git bỏ qua phải in đúng dòng của nhánh gốc khác — bắt đầu `KHONG DO DUOC: goc git ` và chứa ` khac goc dang do ` — không nhận dòng `phia git rong` thay cho nó; đối chứng đột biến: bản sửa bị gỡ chặn so gốc git thì khẳng định này gọi tên bản đó là sai.
- AC-6: Given cây làm việc ở HEAD, When chạy đúng lệnh cổng `cl_tieng_viet_den_man` và `cl_dan_so` trong `_acceptance/config.yaml`, Then cả hai thoát 0.
- AC-7: Given diff từ `git merge-base origin/onehub HEAD` tới HEAD, When liệt kê tệp đổi ngoài `_acceptance/**` và ngoài `risk_tiers.t1_skip_globs`, Then danh sách rỗng; một danh sách mẫu có `packages/ui/src/components/button.tsx` bị phép đo gọi tên.
- AC-8: Given HEAD, When đo làn của hồ sơ `chan-lai-component-ra-man` (mọi eval máy và bộ suite, chỉ đo không ghim), Then làn xanh; và `_acceptance/chan-lai-component-ra-man/decisions.jsonl` có một dòng JSON hợp lệ `type: revisit` nhắc `neo-dan-so-khong-cung`.
- AC-9: Given một cây làm việc mà HEAD có nhiều hơn `e22d8288` một tệp `.ts` đã commit dưới bốn thư mục gốc, When chạy ba ca `them-tep`, `bo-sot`, `chua-theo-doi` của bộ đo từ chính cây đó, Then cả ba thoát 0 (bản gốc được dựng từ cây ở `e22d8288`, không từ cây hiện tại); đối chứng: bộ đo vòng 1 (`785a1d7e`) chạy ca `them-tep` trên cùng cây thoát 2 với dòng `TIEN DE: ban goc do san`.
- AC-10: Given bản sao có một tệp `.ts` đang theo dõi dưới `apps/app/lib` bị xoá khỏi đĩa mà chưa commit, hoặc bị `mv` sang tên mới mà chưa stage, When chạy `dan-so` của bản sửa, Then thoát 0 và không có dòng `BO-SOT:`; cùng hai ca, bản sửa vòng 1 (`785a1d7e`) thoát 1 với dòng `BO-SOT:` gọi tên đúng tệp đã xoá hay tên cũ.

## Coverage

Không dùng skill morphological-scan: không gian là ba neo × hai hướng đã liệt tay dưới
đây (xem entry `descope` trong `decisions.jsonl`).

- Trục neo: số tệp — bỏ ghim, thay quan hệ (AC-1, AC-3, AC-4) | chuỗi mặc định — giữ (AC-2) | dòng bảng cũ — giữ, không đổi mã | tập rỗng — giữ (AC-5)
- Trục hướng lọt: đỏ nhầm khi kho chỉ thêm tệp (AC-1, AC-9 cho chính bộ đo) | xanh nhầm khi bộ duyệt bỏ sót (AC-3) | đỏ nhầm vì tệp chưa commit — thêm (AC-4), xoá hay đổi tên (AC-10) | xanh im khi không có phía git hoặc phía git trỏ kho khác (AC-5)
- Trục chiều đo: bản sửa đúng (AC-1..AC-5) | bản gốc đỏ/khác ở đúng chỗ đã hứa (AC-1, AC-3) | cây thật qua lệnh cổng (AC-6) | phạm vi diff có mẫu dương (AC-7) | hồ sơ gốc vẫn xanh và có con trỏ (AC-8)

## Out of scope

- Đổi neo `mac_dinh` hay `dong_bang_cu` thành quan hệ — chúng là dây báo có nghĩa.
- Đổi `docFile()` sang đọc từ git — bộ duyệt vẫn đi đĩa; git chỉ là phía đối chiếu.
- Hai lỗi AC-2/AC-4 còn mở của #91 (đã đóng không merge).
- Sửa hợp đồng đã ký của `chan-lai-component-ra-man` — chỉ thêm một dòng `revisit` vào sổ của nó.

## Notes

Không có bề mặt người nhìn; không eval thiết kế, không `ui-check`.

- known-limits: `lenhTuConfig`/`globT1` trong bộ đo đọc `_acceptance/config.yaml` bằng tay thay vì `Bun.YAML.parse` — hôm nay ra đúng hai lệnh cổng; giá trị lệnh đổi kiểu viết (nháy đơn, escape, gập dòng) thì E6 có thể chạy lệnh khác lệnh cổng (Cổng 2 vòng 1, Ngoài-3, d-20260924T014042Z-11).
- known-limits: sổ quyết định: dòng con trỏ `d-20260924T012130Z-20` ở `chan-lai-component-ra-man` ghi tầng `gate2`, giờ đoán và `decided_by` cho một quyết định Cổng 2 chưa có; chín dòng sổ hồ sơ này mang giờ đoán tròn — đã sửa bằng dòng mới (sổ chỉ ghi thêm), dòng cũ còn đó (Cổng 2 vòng 2, Ngoài-1, d-20260924T020537Z-20).
- known-limits: `cau-hinh.mjs` chép tay bốn thư mục gốc thay vì import `GOC` từ `moi-mac-dinh.mjs` — thêm gốc một chỗ mà quên chỗ kia thì E5 (b) đỏ sai lý do (Cổng 2 vòng 2, Ngoài-2, d-20260924T020537Z-21).
- known-limits: `git archive | tar` trong bộ đo không có `pipefail` — lỗi dựng bản gốc hiện ra như `TIEN DE: ban goc do san` (vẫn thoát 2) (Cổng 2 vòng 2, Ngoài-3, d-20260924T020537Z-22).
- known-limits: `docGit` gọi `git ls-files` ngoài `try` — git hỏng giữa chừng thì thoát 1 thay vì 2 `KHONG DO DUOC` (Cổng 2 vòng 2, Ngoài-4, d-20260924T020537Z-23).
- known-limits: ca `cay-lech` không kiểm `git worktree remove` — worktree tạm có thể còn đăng ký mà không ai được báo (Cổng 2 vòng 2, Ngoài-5, d-20260924T020537Z-24).
- known-limits: mỗi bản sao để lại `$TMPDIR/chan-lai-component-ra-man-<băm>` không được xoá (Cổng 2 vòng 2, Ngoài-6, d-20260924T020537Z-25).
- known-limits: neo `dong_bang_cu` không có ca đỏ riêng; nó đi chung vòng so với `mac_dinh` mà AC-2 đã chứng (Cổng 2 vòng 2, Ngoài-7, d-20260924T020537Z-26).
