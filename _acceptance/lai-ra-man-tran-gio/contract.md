---
schema_version: 1
feature: Trần giờ và cô lập cho thước lai-ra-man — ca lái từng component không còn đỏ ngẫu nhiên trên CI, và khi quá hạn thì không kéo đỏ ca nào khác
slug: lai-ra-man-tran-gio
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-28T06:57:54Z
design_doc: docs/superpowers/specs/2026-09-28-lai-ra-man-tran-gio-design.md
---

# Acceptance Contract: lai-ra-man-tran-gio

## Context

`packages/ui/test/lai-ra-man.spec.tsx` là thước của hồ sơ đã ký
`chan-lai-component-ra-man`. Trong 33 lượt CI gần nhất (`rang/bang-do-ci.json`), ca «lai
tung component ra man» chạy 2812–4996 ms khi xanh và đỏ 3 lượt vì vượt trần mặc định 5000 ms
của bun. Bun không huỷ một test đã quá hạn: vòng lái vẫn chạy tiếp và xoá
`document.body` giữa lúc các ca sau đang vẽ, nên kéo đỏ «chuoi da va» và 20 ca render-diff
(run 36371259813 lượt 1). PR #183, #184, #185 đều vấp dù không chạm `packages/ui`.

Source input: prompt (phiên 2026-09-28, chủ kho duyệt thiết kế: trần tường minh + tín hiệu
dừng theo ca + root trong `finally`, đo trước/sau trên CI bằng hai PR nháp).

## Criteria

- AC-1: Given `packages/ui/test/lai-ra-man.spec.tsx`, When đọc cây cú pháp của nó, Then mỗi lời gọi `test(...)` trong tệp đều có tham số thứ ba là định danh `TRAN_LAI_MS`, và `TRAN_LAI_MS` là một hằng số nguyên khai ở cấp tệp — không ca nào chạy trên trần mặc định của bun.
- AC-2: Given bảng đo CI của hồ sơ (`rang/bang-do-ci.json`, ≥ 30 lượt, mỗi lượt có `run_id` và `attempt`), When so với `TRAN_LAI_MS`, Then `TRAN_LAI_MS` ≥ 4 × max(lượt xanh chậm nhất của ca lái, cận dưới lớn nhất của các lượt đỏ — số ms ghi lúc bị cắt là cận dưới của thời gian thật).
- AC-3: Given một bản sao của spec mà trần của RIÊNG ca lái bị ép xuống 300 ms, When chạy bản sao đó một mình trong một tiến trình bun, Then ca lái đỏ vì quá hạn, còn «mo tung nguyen ban» và «chuoi da va den man» đều xanh; và Given cùng bản sao nhưng bỏ hai lời gọi `luot.abort()`, When chạy lại, Then «chuoi da va den man» đỏ — tín hiệu dừng chính là thứ giữ các ca sau.
- AC-4: Given cùng một cây nguồn, và các tệp đỡ của spec (`packages/ui/test/setup-dom.ts`, `rang/luot-chay.mjs`, `rang/moi-mac-dinh.mjs` của hồ sơ chủ thước) không đổi so với `c895e5bf`, When chạy spec của vòng này và spec ở `c895e5bf` (bản trước vòng này), Then `ve-that.json` và `mo-nguyen-ban.json` do hai lượt ghi ra trùng nhau từng byte — trần và tín hiệu dừng không đổi bản vẽ mà hồ sơ đã ký đọc.
- AC-5: Given bảng đo «trước» và các lượt CI «sau» (lượt CI của PR, cộng hai PR nháp ép trần ca lái 500 ms — một có bản vá, một là onehub chưa vá), When người đọc số, Then lượt CI của PR xanh với ca lái dưới `TRAN_LAI_MS`; nhánh đo-thử có bản vá chỉ đỏ đúng ca lái; nhánh chưa vá đổ dây chuyền sang ca khác. (judgment)

## Coverage

- Trục A — ca lái so với trần: kịp trần | quá trần [thước CE: 33 lượt CI trong `rang/bang-do-ci.json`; NGÀNH: bun test — `timeout` theo ca, test quá hạn không bị huỷ (đo trên 1.3.12, xem design doc)]
- Trục B — ca bị ảnh hưởng khi ca lái quá trần: cùng tệp (`mo tung`, `chuoi da va`) | tệp sau trong cùng tiến trình (`render-diff.spec.tsx`) [thước CE: danh sách ca đỏ của run 36371259813 lượt 1]
- Trục C — nơi chạy: Mac mini | CI máy nhanh (~3 s) | CI máy chậm (~4,5–5 s) [thước CE: hai cụm trong bảng đo]
- Trục D — bản vẽ mà thước ghi ra: `ve-that.json` | `mo-nguyen-ban.json` [thước CE: hai lời gọi `ghi(...)` trong spec]
- Core → AC: có trần tường minh → AC-1 · trần có căn cứ → AC-2 · quá trần × cùng tệp × Mac → AC-3 · bản vẽ × cả hai tệp → AC-4 · quá trần × tệp sau × CI, kịp trần × CI → AC-5
- Giới hạn đo đã biết: ô «quá trần × tệp sau» chỉ đo được trên CI (AC-5, người chấm). Ở Mac, bun xếp render-diff trước lai-ra-man, nên răng máy của AC-3 chỉ phủ phần «cùng tệp».

## Out of scope

- Không tách vòng lái thành một test cho mỗi tệp component (đã loại, sổ quyết định).
- Không làm vòng lái nhanh hơn: không bớt nút bấm, không bớt trạng thái vẽ — mọi thay đổi như vậy làm đổi bản vẽ của hồ sơ đã ký.
- Không sửa các ca render-diff hay các tệp test khác của `packages/ui`.
- Không đổi thứ tự tệp của bun, không đổi `chay-tung-tep-dom.ts` hay lệnh `test` của gói.
- Không gửi bản vá lên `trycompai/crm` — thước này là của riêng kho.

## Notes

- AC-4 neo spec cũ ở `c895e5bff88f9b1f6a13ffc5885c37fe0b6d7ec8` (đỉnh onehub trước vòng này), không neo `merge-base`: sau khi merge thì merge-base tiến lên và phép so sẽ luôn đúng. Vòng sau muốn cố ý đổi bản vẽ thì phải dời neo này và ghi vào sổ.
- Mọi bản sao của E3/E4 ghi tạo phẩm vào `.acceptance-runs/lai-ra-man-tran-gio/<eval>-<pid>/`, không vào thư mục tạo phẩm của `chan-lai-component-ra-man`; răng kiểm sha256 tạo phẩm của hồ sơ đó trước/sau lượt và danh sách tệp của `packages/ui/test` trước/sau lượt. E3, E4 và làn ghim lại chạy tuần tự.
- `unmount` trong `finally` là phần hiện thực của AC-3 (root đang vẽ dở lúc bị dừng phải được tháo), không có eval riêng.
- Ghim lại `chan-lai-component-ra-man` bằng làn eval ở đỉnh nhánh, đi cuối cùng, và mọi hồ sơ mà `pre-merge-check.sh` (không kèm `--slug`) báo hoá cũ.
