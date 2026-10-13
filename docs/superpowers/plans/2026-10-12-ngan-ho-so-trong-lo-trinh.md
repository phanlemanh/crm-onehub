# Ngăn hồ sơ trong trang Lộ trình — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang Lộ trình đọc dải tóm tắt hồ sơ (khối `lo-trinh-du-lieu` bản 2) và chỉ vai `owner` nhận tầng chủ kho.

**Architecture:** Đã có trên nhánh (S1): khuôn Zod bản 2 và kiểu «cho người xem», hai thành phần ngăn (`TomTatHoSo`, `SoLieuLamViec`) trong thẻ con của `HoSoViec`, hàm lọc thuần `choVaiXem`, tệp mẫu thật, bản mẫu `/proto`, bài kiểm E1–E6 và phép đo E7–E11. Còn lại ba chỗ nối: bộ đọc bản 2, cách đọc khối bản 1, và trang máy chủ đọc vai rồi lọc.

**Tech Stack:** Next (apps/app), React, Zod (`@crm/validation`), bun test + jsdom, `@crm/auth` (`workspaceRoleOf`).

**Spec:** `docs/superpowers/specs/2026-10-12-ngan-ho-so-trong-lo-trinh-design.md`; hợp đồng `_acceptance/ngan-ho-so-trong-lo-trinh/contract.md`.

## Global Constraints

- Không chú thích trong mã. Không `useEffect` trong mã app.
- Bộ đọc là bản chép NGUYÊN VĂN hàm `docDuLieu` của kit `7f65e5a0` (băm thân hàm `22731adb548207f7b15bde61d74dc3719204882666b36bf71b59fa9d6fdcac10`).
- Không tệp nào dưới các đường của trang chứa chữ `_acceptance` hay `docs/plan`.
- Không cài kit chưa phát hành vào crm; không đưa `LO-TRINH.html` của kit nhánh chính vào gốc kho.

## Review Focus

- Trang gốc vẽ bằng kit 2.26 (bản 1) sau khi thay bộ đọc: người xem không thấy băng «một phần trang có thể thiếu» — E6 ca 1 ghim.
- Vai `null` (người đăng nhập nhưng không còn là thành viên): coi như không phải owner — E5 ghim năm vai.
- Bộ đọc bản 2 trên khối bản 2 không còn sinh câu «khuôn mới hơn» — E6 đối chứng dương ghim.
- Trang máy chủ chỉ trao `dauVao` cho mã khách, không kèm vai — E5 bước 2 ghim.
- Phép đo bản chép của LT1 đỏ tới khi crm nhận kit 2.27 — đúng điều kiện, ghi ở Notes của hợp đồng; không sửa phép đo LT1 để xanh giả.

---

### Task 1: Bộ đọc bản 2 và khối bản 1 không băng cảnh báo

independent: false · phục vụ E1, E6, E7

**Files:**
- Modify: `apps/app/lib/lo-trinh/doc-du-lieu.js` (thay toàn bộ bằng thân hàm kit, giữ `export function docDuLieu`)
- Modify: `apps/app/lib/lo-trinh/doc-trang.ts`

**Interfaces:**
- Produces: `docTrangLoTrinh(html: string | null): DauVaoLoTrinh` — với `phien_ban === 1` trả `canhBao: []`.

- [ ] **Step 1: Chạy bài kiểm đỏ sẵn**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 60000 --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ho-so.dom.tsx -t khoan-dung`
Expected: FAIL «doi chung duong: ban 2 nguyen khong canh bao».

- [ ] **Step 2: Chép hàm** — rút thân `docDuLieu` từ `scripts/lo-trinh.mjs` của kit `7f65e5a0` (bằng `catHam` của `rang/sinh-mau-x2.mjs`), ghi vào `doc-du-lieu.js`.

- [ ] **Step 3: Khối bản 1** trong `doc-trang.ts`:

```ts
	return {
		kieu: "co-du-lieu",
		duLieu: kq.duLieu,
		canhBao: kq.duLieu.phien_ban === 1 ? [] : canhBao,
	};
```

- [ ] **Step 4: Kiểm** — `-t khoan-dung` xanh; `./test/lo-trinh.dom.tsx` 17/17; `node _acceptance/ngan-ho-so-trong-lo-trinh/rang/ban-chep.mjs --pha-thu` → `KET LUAN ma 2`.

- [ ] **Step 5: Commit** `feat(lo-trinh): bộ đọc khối bản 2 của kit; khối bản 1 không băng cảnh báo`.

### Task 2: Trang máy chủ đọc vai rồi lọc tầng chủ kho

independent: false · phục vụ E5

**Files:**
- Modify: `apps/app/app/(app)/[slug]/lo-trinh/page.tsx`

**Interfaces:**
- Consumes: `choVaiXem(dauVao, vai)` (`apps/app/lib/lo-trinh/cho-vai.ts`), `workspaceRoleOf(userId)` (`@crm/auth`).

- [ ] **Step 1: Chạy bài kiểm đỏ sẵn** — `bun test … ./test/ngan-ho-so-vai.dom.tsx -t vai` → FAIL.

- [ ] **Step 2: Sửa `NoiDung`:**

```tsx
async function NoiDung() {
	const session = await requireSession();
	const vai = await workspaceRoleOf(session.user.id);
	return <NoiDungLoTrinh dauVao={choVaiXem(await docDauVao(), vai)} />;
}
```

- [ ] **Step 3: Kiểm** — `-t vai` 4/4 xanh (gồm chiều đỏ trên hai bản sao trang).

- [ ] **Step 4: Commit** `feat(lo-trinh): trang máy chủ gỡ tầng chủ kho cho vai khác owner`.

### Task 3: Soát bộ chứng và phép đo màn

independent: false · phục vụ E8, E9, E11 và bộ năm lệnh của kho

- [ ] **Step 1:** `bunx tsc --noEmit -p apps/app`; `bunx biome check` trên các tệp đã đổi.
- [ ] **Step 2:** `node _acceptance/ngan-ho-so-trong-lo-trinh/rang/sinh-mau-x2.mjs --kiem --pha-thu` → ma 0; `node …/chu-viet-thang.mjs --pha-thu` → ma 0; `bun …/chup.mjs` → ma 0 (8 ô).
- [ ] **Step 3:** `bun run check-types`, `bun run lint`, `bun run lint:slop` qua khoá máy; `bun run test` và `bun run build` để S4 chạy (bộ chứng của làn chấm).
- [ ] **Step 4:** Đặt hợp đồng `status: implemented`, commit, vào S4.
