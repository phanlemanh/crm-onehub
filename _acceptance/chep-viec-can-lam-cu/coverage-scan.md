# Quét độ phủ — chep-viec-can-lam-cu (DA1b)

Preset `entity-feature` ghép `risk-premortem` (việc dời dữ liệu production: câu khung «14 ngày sau, chép này
hỏng — vì sao?»).

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub — chân sản phẩm: đào kho (`CONTEXT.md` mục «Việc», hồ sơ DA1
  `_acceptance/viec-chung/`, mã `activities.*`, `viec-ghi.ts`, `run-runtime.ts`, `ma-lech.ts`) · chân ngành:
  Salesforce và Odoo đều coi việc cần làm là một bản ghi có người sở hữu, không phải một dòng nhật ký
  [NGÀNH: docs/plan/viec-du-an-nghien-cuu.md mục 3]; cách dời dữ liệu theo «Parallel Change» (mở rộng → dời →
  thu hẹp; giữ cấu trúc cũ tới khi dời xong) [NGÀNH: Parallel Change, Danilo Sato, martinfowler.com].

## Trục

- **A. Vật đem chép** (một việc cần làm cũ là gì): mở · đã xong · do Tác nhân tạo (`meta.source = agent`) · do
  ma-lech tạo (`meta.platformBrokerId`) · người tạo không còn nhận được việc (vai «chỉ OKR», rời tổ chức) ·
  đã chép rồi · gắn một bản ghi | gắn nhiều (công ty + thoả thuận) | gắn kế hoạch 30 ngày
  [SUY-TỪ-REPO: packages/db/prisma/schema.prisma] [SUY-TỪ-REPO: apps/agent/agent/lib/ma-lech.ts]
  [thước CE: các cột của `Activity` + bốn đường ghi TASK đã đếm ở S0]
- **B. Thao tác**: đếm khô · chép thật · chép lại lần hai · chép hỏng giữa chừng · đảo · tạo mới sau chép
  (người qua API, Tác nhân `create_crm_activity`, ma-lech, bộ gieo mẫu)
  [SUY-TỪ-REPO: apps/api/src/activities/activities.service.ts] [NGÀNH: Parallel Change]
  [thước CE: vòng đời một lần dời dữ liệu — đếm, chạy, chạy lại, đảo]
- **C. Nơi việc hiện ra**: dòng thời gian (thẻ «Tất cả», «Sắp tới», «Đã xong», ô tích) · khối «Việc» của bản
  ghi · Việc của tôi · Tổng quan «Việc quá hạn» · nhắc buổi sáng · lịch sử bản ghi mà Tác nhân đọc
  (`accounts.ts`) [SUY-TỪ-REPO: apps/app/components/crm/timeline/timeline.tsx]
  [SUY-TỪ-REPO: apps/api/src/dashboard/dashboard.service.ts]
  [thước CE: mọi nơi đọc `ActivityType.TASK` theo `git grep` ở S0]
- **D. Kiểu hỏng**: sai (lệch số, sai người, sai trạng thái, sai hạn, sai gắn) · trùng (chép đôi, ma-lech giao
  hai lần) · mất (ẩn khi chưa chép, đảo xoá mất thay đổi) · lọt quyền (việc đối tác tới vai «chỉ OKR») · chết
  (lệnh chạy nhầm kho, hỏng nửa chừng) [NGÀNH: Parallel Change] [thước CE: ngưỡng chết của `opportunity.md`]

## Core

1. A(mở · xong · gắn mọi kiểu) × B(chép thật) × D(sai) — chép đủ trường, bản gốc giữ nguyên → AC-1.
2. A(đã chép) × B(chép lại, hỏng giữa chừng) × D(trùng · mất) → AC-2.
3. A(người tạo không nhận được việc) × B(chép) × D(lọt quyền) → AC-3.
4. B(đảo) × D(mất) → AC-4.
5. C(dòng thời gian · Tổng quan) × A(đã chép | chưa chép) × D(mất · trùng) → AC-5, AC-6.
6. B(tạo mới qua API) × D(trùng đường) → AC-6.
7. B(tạo mới qua Tác nhân) × D(sai người · trùng · lọt quyền) → AC-7.
8. B(tạo mới qua ma-lech) × A(ma-lech cũ chưa chép | đã chép) × D(trùng) → AC-8.
9. C(khối Việc · Việc của tôi · Tổng quan · nhắc) × A(đã chép) → AC-9.
10. B(đếm khô) × D(chết: chạy nhầm kho) + đường đo hai vế → AC-10.
11. C(dòng thời gian) quan sát trên bản chạy → AC-11.
12. Tài liệu cho người đọc sau → AC-12.

## Later

- Ô «người thực hiện» cho công cụ `create_crm_activity` của Tác nhân (năng lực mới, ngoài câu giao).
- Tác nhân đọc Việc khi tóm tắt lịch sử bản ghi (`accounts.ts` hôm nay đọc việc cần làm cũ, bản gốc còn nên
  không mất gì).
- Xoá hẳn loại `TASK` và các hàng gốc sau khi vế 14 ngày của ngưỡng đọc xong (hàng lộ trình riêng).
- Đổi nhãn tiếng Anh «Create tasks on CRM records» của bộ dựng Tác nhân.

## Never

- Chép bằng câu SQL trong migration — đi vòng `viec-ghi.ts` (luật «một chỗ ghi» của `docs/api.md` mục «Việc»)
  và không in được số trước/sau cho người bấm.
- Xoá bản gốc trong lượt này — mất đường đảo mà `opportunity.md` đã hứa.
- Tạo cùng lúc việc cần làm cũ và Việc (ghi đôi) — hai nơi cho một việc là đúng lỗi Việc sinh ra để sửa.

## Cross-cutting áp mọi ô Core

- Mọi lệnh ghi Việc đi qua `packages/db/src/viec-ghi.ts`, mỗi thay đổi một dòng vết.
- Không hàng nào ghi thẳng bảng trong dữ liệu mẫu (`CLAUDE.md` mục «Lộ trình là việc dựng»).
- Lệnh có ghi từ chối chạy khi chưa có cờ chạy thật; lệnh đếm luôn chỉ đọc.
