---
schema_version: 1
feature: Thước «không chạm thước đã ký» của bo-chu-lap-keo-tha bắt được tệp đã ký bị đổi tên hoặc dời ra khỏi vùng cấm
slug: khong-cham-thuoc-bat-doi-ten
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: approved
design_doc: docs/superpowers/specs/2026-09-28-khong-cham-thuoc-bat-doi-ten-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-28T14:12:52Z
---

# Acceptance Contract: khong-cham-thuoc-bat-doi-ten

## Context

`_acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs` liệt tệp đổi bằng `git diff --name-only`
không kèm `--no-renames`, nên một tệp đã ký bị `git mv` ra khỏi vùng cấm chỉ hiện đường mới và
thước báo «0 tep bi cam». Người ký hồ sơ `bo-chu-lap-keo-tha` chọn «mở hợp đồng mới» cho ba mục
ngoài hợp đồng cùng lỗ này (sổ `d-20260928T132632Z-6..8`).

Source input: prompt của chủ kho 28/09 — «chạy chip thêm --no-renames cho thước khong-cham-thuoc»,
«làm ở đây».

## Criteria

- AC-1: Given một nhánh đã commit `git mv` đưa một tệp đã ký ra khỏi vùng cấm — một tệp test đã ký (`packages/ui/test/nguon-keo-tha.dom.tsx`), hoặc một tệp dưới `_acceptance/nguon-keo-tha-reui/` dời sang `docs/`, When thước chạy `--tu <trước> --den <sau>` trên khoảng đó, Then nó thoát mã 1 và dòng `cham thuoc da ky:` nêu đường CŨ của tệp.
- AC-2: Given `git mv apps/app/test/tai-lieu-nguon.dom.tsx` đã stage mà chưa commit, When thước chạy chế độ mặc định (so điểm rẽ khỏi `origin/onehub` với cây làm việc), Then nó thoát mã 1 và nêu đường cũ.
- AC-3: Given cây không chạm tệp đã ký, When thước chạy chế độ mặc định, Then nó thoát 0 với «0 tep bi cam»; And sửa nội dung chưa commit của một tệp test đã ký vẫn ra mã 1 nêu tệp đó; And ref không phân giải được vẫn ra mã 2 «KHONG DO DUOC».
- AC-4: Given nhánh của vòng này, When eval E5b của hồ sơ `bo-chu-lap-keo-tha` chạy nguyên văn, Then nó thoát 0.

## Coverage

Bỏ quét `morphological-scan` — xem entry `descope` «bỏ coverage-scan» trong `decisions.jsonl`.
Không gian liệt tay:

- Trục A — cách chạm: đổi tên/dời | sửa nội dung | không chạm [thước CE: ba trạng thái một đường có thể có trong `git diff` sau khi tắt dò đổi tên — xoá+thêm, sửa, vắng]
- Trục B — trạng thái git: đã commit | đã stage chưa commit | chưa stage [thước CE: hai chế độ của thước — `--tu/--den` đọc commit, mặc định đọc cây làm việc]
- Trục C — loại vùng cấm: tệp test đích danh | thư mục hồ sơ đã ký [thước CE: hai danh sách `TEP_CAM`, `THU_MUC_CAM` của thước]
- Core: đổi tên×commit×tệp test (AC-1 C1); đổi tên×commit×thư mục (AC-1 C2); đổi tên×stage×tệp test (AC-2 C3); không chạm (AC-3 C4); sửa×chưa stage×tệp test (AC-3 C5); ref hỏng (AC-3 C6); eval của hồ sơ gốc (AC-4).
- Later: đổi tên chưa stage — git không coi là đổi tên khi chưa stage (thấy xoá + tệp chưa theo dõi), thước đã bắt bằng nhánh sẵn có; đổi tên×thư mục×stage — cùng nhánh mã với C3.

## Out of scope

- Mở rộng danh sách vùng cấm hay đổi cách chọn điểm rẽ của thước.
- Sửa thước của hồ sơ khác, hay đưa `--no-renames` vào một thư viện dùng chung cho mọi `rang/`.
- Đổi evals, hợp đồng hay bằng chứng đã ký của `bo-chu-lap-keo-tha` ngoài phần ghim lại do máy sinh.

## Notes

- Vòng chạm `rang/` của hồ sơ đã ký `bo-chu-lap-keo-tha`, nên hồ sơ đó được ghim lại bằng `repin-lane.mjs` ở đỉnh nhánh sau khi gộp `origin/onehub`.
- Phép đo C1–C6 dựng worktree tạm từ HEAD, nên thước đo là bản ĐÃ COMMIT; sửa thước mà chưa commit thì phép đo vẫn chạy bản cũ.
