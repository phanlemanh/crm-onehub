# Lịch sử hiện mọi lần cập nhật — kế hoạch thi công (SV7)

**Goal:** Mục Lịch sử của chi tiết KR hiện mọi lần cập nhật và biểu đồ mỗi lần một điểm, qua thủ tục mới `okr.lichSuKr`;
`okr.dienBien` giữ nguyên.

**Spec:** `docs/superpowers/specs/2026-10-28-lich-su-moi-lan-cap-nhat-design.md` · hợp đồng
`_acceptance/lich-su-moi-lan-cap-nhat/contract.md` (duyệt 28/10) · bộ đo `evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (`AGENTS.md`).
- Schema đầu ra tả đúng thứ được lưu, không `.default()` (`AGENTS.md` «Parse at the boundary»).
- `/packages/ui` là nguồn giao diện; biến thể mới đặt ở đó.
- Tệp bảo vệ (`okr-toan-canh.ts`, `packages/ui/src/lib/messages.ts`, hai tệp VK7, sổ VK7) chỉ sửa sau trả lời `cham-tep`
  V2-33.
- Không sửa thước hồ sơ đã ký nào khác (AC-10).

## Task 1 — `chuoiMoiLan` và đầu ra `lichSuKrOutput` (independent: true)

- Files: `apps/api/src/okr/dien-bien.ts`, `apps/api/src/okr/okr-xem.contracts.ts`.
- `chuoiMoiLan(kr, tuanKy, homNay, kyVongTuan): DiemMoiLan[]` — mỗi lần một điểm `{ngay, checkInId, giaTri, kyVong}`,
  tuần không lần một điểm chỉ `kyVong`, KR mốc `giaTri` null. `lichSuKrOutput` = `{kieu, dich, donVi, coCapNhat, lan,
  chuoi}`.
- Verify: `bun run check-types`. Phục vụ E2.

## Task 2 — Thủ tục `okr.lichSuKr` (independent: false — sau Task 1)

- Files: `apps/api/src/okr/okr-xem.service.ts` (`lichSuKr`, dùng `lanCuaKr`, `dieuKienXemMucTieu`, `camXuc.tomTat`),
  `apps/api/src/okr/okr.router.ts`, `apps/api/src/generated/**` (sinh lại).
- Thứ tự `lan`: giờ gửi rồi `id`.
- Verify: bài API mới `apps/api/test/lich-su-moi-lan-cap-nhat.spec.ts` ca `lsml-lan`, `lsml-chuoi`, `lsml-quyen`,
  `lsml-cam-xuc-api`, `lsml-dien-bien-giu`. Phục vụ E1, E2, E3, E9, E12.

## Task 3 — Biến thể nhịp «lần» của `TargetLineChart` (independent: true)

- Files: `packages/ui/src/components/target-line-chart.tsx`, `packages/ui/src/lib/messages.ts` (sau V2-33).
- Prop `nhip?: "tuan" | "lan"` đổi chú giải và đầu cột bảng ẩn; khoá dòng bảng ẩn theo chỉ số.
- Verify: `bun run check-types`, bài DOM E5. Phục vụ E5.

## Task 4 — Mục Lịch sử đọc `lichSuKr` (independent: false — sau Task 2, 3)

- Files: `apps/app/components/crm/record-sheet/lich-su-kr.tsx` (mới), `kr-sheet.tsx` (lời gọi), `apps/app/lib/trpc/cache.ts`
  (làm mới `okr.lichSuKr` cùng `okr.dienBien`), `apps/app/lib/messages/okr-toan-canh.ts` (sau V2-33).
- Dòng: `data-lan-cap-nhat=checkInId`, `data-ngay`, nhãn `luc()`, ghi chú `unclamped` + `translate="no"`, `HangCamXuc`
  theo `checkInId`; giữ `data-lich-su-kr`, `data-hang-cam-xuc`. Dữ liệu vắng (null) thì vào nhánh lỗi, không ném.
- Verify: bài DOM `apps/app/test/lich-su-moi-lan-cap-nhat.dom.tsx` ca E4–E8; năm tệp DOM đã ký của E13. Phục vụ E4–E8, E13.

## Task 5 — Lật VK7 Ngoài-1 (independent: false — sau Task 4, sau V2-33)

- Files: `apps/app/test/ngan-kr-mot-cho.dom.tsx` (ca `vk7-than-ngan` mồi `okr.lichSuKr`),
  `_acceptance/ngan-kr-mot-cho/rang/man.mjs` (`lichSau === lichTruoc + 1`), `_acceptance/ngan-kr-mot-cho/decisions.jsonl`.
- Verify: chạy tệp DOM của VK7 riêng. Phục vụ AC-10.

## Task 6 — Thước của vòng (independent: true)

- Files: `_acceptance/lich-su-moi-lan-cap-nhat/rang/man.mjs` (E10), `rang/pham-vi.mjs` (E11), `rang/ky-xanh.mjs` (E13).
- Mỗi thước có chiều đỏ trên bản sao.
- Verify: chạy từng thước; E10 qua `mot-luot.sh`.

## Review Focus

- Hai lần cùng phút: thứ tự theo `id` (E1 ca cùng phút).
- `lichSuKr` trả null trong khung thử của bài đã ký (E13).
- Giờ Việt Nam qua nửa đêm: `ngay` của lần 23:30 giờ UTC là ngày hôm sau (E1 so bằng `AT TIME ZONE`).
- KR mốc không có biểu đồ (E7).
- Cảm xúc gắn đúng lần (E8, E12).
