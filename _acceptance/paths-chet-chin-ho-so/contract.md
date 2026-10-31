---
schema_version: 1
feature: Chín hồ sơ đã ký thôi bị đòi ghim lại sau mọi PR chỉ vì một mục paths trỏ vào tệp đã đổi tên
slug: paths-chet-chin-ho-so
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: implemented
design_doc: docs/superpowers/specs/2026-10-31-paths-chet-chin-ho-so-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-31
---

# Acceptance Contract: paths-chet-chin-ho-so

## Context

Bộ lọc hoá cũ theo `paths` của kit (`staleByPaths`) đóng mặc định: một mục `paths` không trỏ tới tệp nào trên cây git
làm bộ lọc tắt cho CẢ hồ sơ, nên hồ sơ bị đòi ghim lại sau mọi PR. Đo 31/10 trên `onehub` ed4e85288: chín hồ sơ đã ký
mang 25 mục chết (10 đường khác nhau). Phần lớn là tệp đã xoá, không phải đổi tên. Hai hồ sơ còn một lý do
khác tắt bộ lọc: eval `judgment` đang chạy mà không khai `paths` (goi-y-mo-ke-hoach E9, hoi-dap-okr E9j) — Hỏi-1. Chủ kho cho phép (B12, luật 39 của
đợt) sửa `evals.yaml` của đúng chín hồ sơ này, đo hai chiều từng mục, trình trên thẻ Cổng Bằng chứng.

Source input: hàng F38 của `docs/plan/lo-trinh-okr.json`; ô cơ hội `_acceptance/paths-chet-chin-ho-so/opportunity.md`;
bảng sửa `_acceptance/paths-chet-chin-ho-so/rang/bang-sua.json`.

## Criteria

- AC-1: Given chín hồ sơ ở bảng sửa, When phân loại mọi mục `paths` của `evals.yaml` bằng `phanLoaiMucPaths` của kit trên `git ls-files`, Then không còn mục nào bị từ chối; và cùng thước chạy trên một `evals.yaml` mẫu có một mục chết thì gọi đúng tên mục đó.
- AC-2: Given mỗi hồ sơ trong chín, When đưa cho `staleByPaths` một tệp không khớp mục `paths` nào, Then bộ lọc chạy (không rơi về luật cũ) và không giữ tệp ấy — một PR không chạm vật của hồ sơ không làm nó hoá cũ.
- AC-3: Given mỗi mục `paths` còn lại của chín hồ sơ, When đưa cho `staleByPaths` một tệp khớp mục ấy cùng một tệp ngoài, Then bộ lọc giữ đúng tệp khớp và bỏ tệp ngoài — một PR chạm vật của hồ sơ vẫn làm nó hoá cũ.
- AC-4: Given 27 dòng của bảng sửa, When so tập `paths` từng eval của chín hồ sơ với gốc ed4e85288, Then tập bị bỏ đúng bằng các đường cũ của bảng và tập được thêm đúng bằng các đường mới — không mục sống nào bị gỡ hay thu hẹp ngoài bảng.
- AC-5: Given `evals.yaml` của chín hồ sơ so với gốc ed4e85288, When liệt mọi dòng thêm hay bớt, Then mọi dòng đổi đều là dòng `paths:` — không lệnh, kỳ vọng, trạng thái hay tiêu chí nào đổi.
- AC-6: Given `_acceptance/gom-tin-hieu-tu-chay/decisions.jsonl` so với gốc, When đọc từng dòng, Then mọi dòng đọc được thành JSON, và dòng khác gốc chỉ khác đúng một dấu `}` thừa ở cuối.
- AC-7: Given F37 đã gộp và lượt ghim lại đã chạy, When đọc dòng `repin` cuối của từng hồ sơ trong chín và của gom-tin-hieu-tu-chay, Then dòng ấy trùng `verified_commit`, có sau lần sửa của vòng này ở hồ sơ ấy (`evals.yaml`, hay `decisions.jsonl` với gom-tin-hieu-tu-chay), và mọi bộ kiểm cùng mọi eval máy thoát 0.

## Coverage

- Trục hồ sơ: 9 hồ sơ của bảng sửa [thước CE: đo 31/10 trong vi_sao của hàng F38; AC-1 quét lại cả chín]
- Trục loại mục chết: tệp đã xoá ở eval đã nghỉ · tệp đã xoá có tệp thay · đường chưa từng có [thước CE: `git log --diff-filter=D` từng đường, ghi ở cột căn cứ của bảng sửa]
- Trục chiều đo: im (PR không chạm) · cũ (PR chạm) [thước CE: câu bat_khi của hàng F38]
- Trục ràng buộc thước đã ký: chỉ dòng `paths` đổi [thước CE: luật 39 của đợt, luật tạm 18/10]
- Trục sổ hỏng: 4 dòng của gom-tin-hieu-tu-chay, hồ sơ đã ký thứ mười — Hỏi-2 [thước CE: lời giao của giám sát 31/10; hồ sơ nằm trong 13 hồ sơ ghim sau F37 của docs/plan/pham-vi-don-dep-3110.md]
- Trục eval thiếu paths: judgment đang chạy không khai paths — Hỏi-1 [thước CE: lý do eval-ngoai-may-thieu-paths của staleByPaths]

## Đường đo

- Thước: số mục `paths` chết trong chín hồ sơ · số từ: thước E1 (`rang/chet.mjs`) · bảo đảm bởi: AC-1
- Thước: PR không chạm mục `paths` nào của hồ sơ thì không gọi tên hồ sơ ấy · số từ: thước E2 (`rang/hai-chieu.mjs`, chiều im) · bảo đảm bởi: AC-2
- Ghi chú ngưỡng: câu «PR chỉ đổi tài liệu không còn gọi tên chín hồ sơ» của ô cơ hội không đạt nguyên văn được — tro-ly-okr-nen và toan-canh-okr khai `CONTEXT.md`, `docs/*.md` trong `paths`, nên PR sửa các tệp ấy gọi tên chúng là đúng. Thước đọc ngưỡng theo câu trên.

## Out of scope

- Ghim lại 61 hồ sơ của nhánh `chore/ho-so-nghi-va-khong-do-dot-2` và 5 hồ sơ `lai-ra-man` — đi chung lượt ghim với F38 sau F37, nhưng là vật của nhánh khác.
- Sửa kit để một mục chết không tắt bộ lọc của cả hồ sơ — đó là luật đóng mặc định của kit, gửi kit nếu cần.
- Sửa bước chạy (`steps`) của eval E21 của toan-canh-okr vẫn mở `/okr/suc-khoe` — ngoài luật 39 (chỉ `paths`).
- Hồ sơ đã ký nào khác ngoài chín hồ sơ — luật tạm 18/10 vẫn giữ.

## Notes

- Sửa `evals.yaml` của hồ sơ đã ký làm chính chín hồ sơ này hoá cũ một lần; lượt ghim lại sau F37 (AC-7) gỡ nó.
- Hàng F38 đứng trên F37 (luật 38): S4 và lượt ghim chạy sau khi F37 gộp.
