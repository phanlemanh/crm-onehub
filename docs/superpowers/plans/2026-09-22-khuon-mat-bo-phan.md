# Khuôn mất bộ phận — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bộ phận còn nằm trong một khuôn bất kỳ (kể cả đã lưu trữ) thì không xoá vĩnh viễn được.

**Architecture:** Một hàm quét mọi khuôn trong `OnboardingService` trả bản đồ `departmentId → khuôn[]`; `purgeable` của bộ phận và `purgeDepartment` cùng đọc bản đồ đó. Không đổi schema, không đổi màn.

**Tech Stack:** NestJS + nestjs-trpc, Prisma, bun test + supertest.

**Spec:** `docs/superpowers/specs/2026-09-22-khuon-mat-bo-phan-design.md` · hợp đồng `_acceptance/khuon-mat-bo-phan/contract.md` · bộ đo `_acceptance/khuon-mat-bo-phan/evals.yaml`.

## Global Constraints

- Không chú thích trong code. Không `console.log`.
- Thông điệp người đọc nằm trong `ONBOARDING.thongDiep` của `onboarding-config.ts`.
- `lint:slop`: không tham số kiểu `unknown`/`object`, không spread rỗng có điều kiện.
- Không sửa `apps/api/test/sua-luu-tru.spec.ts` (hồi quy E5, E6).

---

### Task 1: Bài kiểm đỏ — `khuon-mat-bo-phan.spec.ts`

**Files:** Create `apps/api/test/khuon-mat-bo-phan.spec.ts`
**Phục vụ:** E1, E2, E3, E4 · `independent: false`

Khung giống `sua-luu-tru.spec.ts` (tiền tố `kmbp`, `beforeAll` dựng `AppModule` + phiên quản trị, `afterAll` dọn theo tiền tố). Bốn khối:

- `kmbp-chan-xoa` (E1): B trong K đã lưu trữ → `purgeable false`, purge 400 chứa tên K, hàng còn; B2 trong K1 + K2 → 400 chứa cả hai; purge K1 → B2 vẫn 400, chứa K2, không chứa K1; đối chứng C → true/200.
- `kmbp-khoi-phuc` (E2): sau purge bị từ chối, restore B rồi K → 200, K còn đủ bước giao B.
- `kmbp-thu-tu-don` (E3): lối a (purge K rồi B) và lối b (restore, updateTemplate bỏ B, archive cả hai) → `purgeable true`, purge 200, hết hàng.
- `kmbp-khop` (E4): ma trận bốn ca viết trước; mỗi ca so `archiveDepartment().purgeable` = danh sách, và danh sách = (purge === 200).

- [ ] Viết tệp
- [ ] Chạy `config:executors.test.kmbp_*` → đỏ ở E1/E3-b/E4 (máy chủ cũ cho xoá)

### Task 2: Máy chủ chặn xoá

**Files:** Modify `apps/api/src/onboarding/onboarding.service.ts`, `apps/api/src/onboarding/onboarding-config.ts`
**Phục vụ:** E1–E6 · `independent: false`

- `ONBOARDING.thongDiep.boPhanConTrongKhuon(khuon: string[])`.
- `private async khuonNhacBoPhan(): Promise<Map<string, { name: string; archived: boolean }[]>>` quét mọi khuôn một lượt.
- `khuonDungBoPhan(id)` lọc bản đồ theo `!archived`.
- `boPhanRa(row, bịNhắc: boolean)`; mọi thủ tục trả bộ phận truyền cờ từ bản đồ.
- `purgeDepartment`: sau `chuaLuuTru` và `daDung`, bản đồ có id → 400 `boPhanConTrongKhuon`.

- [ ] Sửa
- [ ] Chạy bốn lệnh `kmbp_*` + `slt_api_xoa_vinh_vien` + `slt_api_chan_luu_tru` → xanh
- [ ] Phá thử: bỏ nhánh kiểm khuôn trong `purgeDepartment` → E1 đỏ đúng thông điệp ghim; hoàn lại
- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop`
- [ ] Commit
