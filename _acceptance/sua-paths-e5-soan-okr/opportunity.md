---
schema_version: 1
slug: sua-paths-e5-soan-okr
feature: "Sửa paths chết trong evals.yaml của hồ sơ đã ký soan-okr-cung-tro-ly để lưới hoá cũ lọc theo paths được"
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-08T05:56:32Z
prototype:
  base_commit: b633a7e3b
  disposition: archive
---

## Vấn đề & ai gặp

Người gặp là các phiên thợ của đợt `sau-14-10` và người giữ hàng gộp. Đêm 07–08/10, hồ sơ đã ký `soan-okr-cung-tro-ly`
phải ghim lại bốn lần, mỗi lần khoảng 8 phút giữ khoá `s4`. Nguồn: LUAT.md của đợt, luật 31.

Nguyên nhân đo được: `lib/evidence-core.cjs` → `staleByPaths` đóng mặc định. Chỉ một mục `paths` không trỏ tới tệp nào
(`paths-khong-tro-toi-tep`) là bộ lọc tắt cho cả hồ sơ, và hồ sơ quay về luật cũ: mọi thay đổi mã làm nó cũ. Hồ sơ này
có hai mục chết:
- E5 trỏ `apps/app/app/(app)/[slug]/settings/to-chuc/**`, thư mục không còn; màn Cây tổ chức nay ở `settings/organization/`.
- E17 trỏ `apps/app/lib/messages/okr-tro-ly.ts`, tệp nay là `tro-ly-okr.ts`.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Sửa hai mục là bật lại bộ lọc | Còn mục chết thứ ba, bộ lọc vẫn tắt | Chạy `staleByPaths` thật trên bản đã sửa | Đã thử 08/10: `apply: true` |
| 2 | Bật bộ lọc bớt được lượt ghim lại | Lượt gộp nào cũng chạm vật hồ sơ đo | Chạy bộ lọc trên bốn lượt gộp gần nhất | Đã thử 08/10: 1/4 lượt hết cũ. 3/4 vẫn cũ đúng luật, vì E27 (luật kho) khai `apps/**` và `packages/**` |

## Ngưỡng chết / ngưỡng UAT

- Không đo được — [đề xuất] việc nội bộ của bộ đo, không có người dùng cuối. Thước nội bộ: bộ lọc `staleByPaths` của
  hồ sơ trả `apply: true` trên cây HEAD, và một lượt gộp chỉ chạm tệp ngoài mọi `paths` không còn làm hồ sơ cũ.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Không có | — | — | — | — |

## Cổng 0

- **decision = build.** Căn cứ: luật 26 không áp; luật 31 của đợt — Phan Le Manh ký «build F19» lúc 2026-10-08T05:56:32Z.
- **disposition = archive.** Căn cứ: không có prototype.
- **Ngưỡng UAT chốt cùng lúc ký:** Không đo được (việc nội bộ).

## Thước đo thành công → ứng viên criterion

- Bộ lọc của hồ sơ bật trên HEAD → AC-1.
- Bộ lọc chọn đúng tệp trong và ngoài `paths` → AC-2.

## Out of scope từ khám phá

- 11 hồ sơ đã ký khác cùng có `paths` chết (đo 08/10) — đã báo giám sát (`yeu-cau/P1-18.json`), cần Cổng Đáng riêng.
- Thu hẹp `paths` của E27: luật kho đo cả cây `apps/` và `packages/`, nên nó cũ sau mọi lượt gộp chạm mã là đúng luật.
