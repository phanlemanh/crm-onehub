---
schema_version: 1
feature: Thước lái-ra-màn thôi đỏ khi kho chỉ thêm tệp nguồn — bỏ neo số tệp cố định, thay bằng quan hệ «mọi tệp git theo dõi đều được bộ duyệt thấy»; giữ neo chuỗi mặc định và neo bảng cũ
slug: neo-dan-so-khong-cung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [script]
status: draft
design_doc: docs/superpowers/specs/2026-09-24-neo-dan-so-khong-cung-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-24T01:40:00Z
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
- AC-3: Given bản sao mà `LOAI_TRU` của bộ duyệt bị thêm tên thư mục `lib`, When chạy `dan-so` của bản sửa, Then số tệp bộ duyệt in ra nhỏ hơn bản sao nguyên vẹn, và thoát 1 với dòng bắt đầu `BO-SOT:` nêu số tệp bị sót và ít nhất một đường dẫn dưới `apps/app/lib`; cùng ca, bản gốc thoát 1 với `DO: neo file` (chỉ bắt được vì số tệp giảm, không gọi tên tệp).
- AC-4: Given bản sao có thêm một tệp `.ts` CHƯA theo dõi git dưới `apps/app/lib`, When chạy `dan-so` của bản sửa, Then thoát 0 và số tệp in ra lớn hơn bản sao nguyên vẹn đúng 1 (bộ duyệt thấy tệp, quan hệ git không đỏ vì tệp chưa commit); cùng ca, bản gốc thoát 1 với `DO: neo file`.
- AC-5: Given một bản sao KHÔNG phải kho git (không `git init`), When chạy `dan-so` của bản sửa, Then thoát 2 với dòng `KHONG DO DUOC:` nhắc git — cả khi bản sao nằm ngoài mọi kho, lẫn khi bản sao nằm trong một thư mục bị git bỏ qua của kho khác (gốc git khác gốc đang đo); và bản sao mà cả bốn thư mục gốc rỗng thì vẫn thoát 2 `KHONG DO DUOC: tap nguon rong`.
- AC-6: Given cây làm việc ở HEAD, When chạy đúng lệnh cổng `cl_tieng_viet_den_man` và `cl_dan_so` trong `_acceptance/config.yaml`, Then cả hai thoát 0.
- AC-7: Given diff từ `git merge-base origin/onehub HEAD` tới HEAD, When liệt kê tệp đổi ngoài `_acceptance/**` và ngoài `risk_tiers.t1_skip_globs`, Then danh sách rỗng; một danh sách mẫu có `packages/ui/src/components/button.tsx` bị phép đo gọi tên.
- AC-8: Given HEAD, When đo làn của hồ sơ `chan-lai-component-ra-man` (mọi eval máy và bộ suite, chỉ đo không ghim), Then làn xanh; và `_acceptance/chan-lai-component-ra-man/decisions.jsonl` có một dòng JSON hợp lệ `type: revisit` nhắc `neo-dan-so-khong-cung`.

## Coverage

Không dùng skill morphological-scan: không gian là ba neo × hai hướng đã liệt tay dưới
đây (xem entry `descope` trong `decisions.jsonl`).

- Trục neo: số tệp — bỏ ghim, thay quan hệ (AC-1, AC-3, AC-4) | chuỗi mặc định — giữ (AC-2) | dòng bảng cũ — giữ, không đổi mã | tập rỗng — giữ (AC-5)
- Trục hướng lọt: đỏ nhầm khi kho chỉ thêm tệp (AC-1) | xanh nhầm khi bộ duyệt bỏ sót (AC-3) | đỏ nhầm vì tệp chưa commit (AC-4) | xanh im khi không có phía git hoặc phía git trỏ kho khác (AC-5)
- Trục chiều đo: bản sửa đúng (AC-1..AC-5) | bản gốc đỏ/khác ở đúng chỗ đã hứa (AC-1, AC-3) | cây thật qua lệnh cổng (AC-6) | phạm vi diff có mẫu dương (AC-7) | hồ sơ gốc vẫn xanh và có con trỏ (AC-8)

## Out of scope

- Đổi neo `mac_dinh` hay `dong_bang_cu` thành quan hệ — chúng là dây báo có nghĩa.
- Đổi `docFile()` sang đọc từ git — bộ duyệt vẫn đi đĩa; git chỉ là phía đối chiếu.
- Hai lỗi AC-2/AC-4 còn mở của #91 (đã đóng không merge).
- Sửa hợp đồng đã ký của `chan-lai-component-ra-man` — chỉ thêm một dòng `revisit` vào sổ của nó.

## Notes

Không có bề mặt người nhìn; không eval thiết kế, không `ui-check`.
