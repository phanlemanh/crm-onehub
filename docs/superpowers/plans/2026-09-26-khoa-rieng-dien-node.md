# Khoá riêng cho `dienNode` — kế hoạch thực thi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `dienNode` của hộp «Chuyển việc 30 ngày» không còn sinh hai phần tử cùng khoá React, và chữ trên màn giữ nguyên.

**Architecture:** Bỏ đoạn rỗng sau `split` rồi mới bọc `Fragment`. Khoá theo vị trí ký tự khi đó duy nhất, vì mỗi đoạn dài ít nhất một ký tự. `dienNode` được `export` để test DOM đo thẳng ma trận mẫu. Một răng quét máy rút các eval đã ký đang đo hộp và so đỏ ở HEAD với đỏ ở `merge-base`.

**Tech Stack:** React 19, bun test với preload happy-dom (`packages/ui/test/setup-dom.ts`), tRPC `createTRPCOptionsProxy` trên client giả, Bun script.

**Spec:** `docs/superpowers/specs/2026-09-26-khoa-rieng-dien-node-design.md` · hợp đồng `_acceptance/khoa-rieng-dien-node/contract.md` · evals `_acceptance/khoa-rieng-dien-node/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Lệnh eval là ref `config:executors.*` trong `_acceptance/config.yaml`, không hardcode.
- Test DOM chạy với `TZ=Asia/Ho_Chi_Minh` và preload `../../packages/ui/test/setup-dom.ts`, từ `apps/app`.
- Chữ tiếng Việt trong test/script không dấu (khuôn của các tệp test sẵn có).
- Script `rang/` không dùng `typeof` (lint:slop bắt).

## Review Focus

- Mẫu có đoạn chỉ khoảng trắng giữa hai chỗ trống (`"{a} {b}"`): khoảng trắng phải được giữ, không bị lọc bởi `.trim()`. Đã ghim ở ca 11 của Task 1.
- Mẫu rỗng `""`: kết quả là mảng rỗng, vẽ ra chữ rỗng, không lỗi. Đã ghim ở ca `""` của Task 1.
- Chỗ trống có khoá không có trong `gia`: vẽ chuỗi rỗng như trước. Đã ghim ở ca `"{z} la"`.
- Hộp vẽ lại khi phần xem trước đổi từ đang tải sang có dữ liệu: không cảnh báo ở lần vẽ lại. Đã ghim ở Task 1 (chờ hết Spinner rồi qua 5 nhịp).
- Bộ bắt `console.error` phải bắt được cảnh báo thật. Đã ghim ở ca `bo-bat-con-song` của Task 1.

---

### Task 1: Test DOM đỏ trước (E1, E2, E3)

`independent: false` — Task 2 cần tệp này để chứng xanh.

**Files:**
- Create: `apps/app/test/dien-node-khoa-rieng.dom.tsx`
- Modify: `_acceptance/config.yaml` (thêm `krdn_mau_that`, `krdn_ma_tran`, `krdn_bo_bat` vào `executors.test`)

**Interfaces:**
- Consumes: `ChuyenViecDialog`, `dienNode` từ `@/app/(app)/[slug]/settings/members/chuyen-viec-dialog` qua `await import` (namespace); `dien` từ `@/components/crm/record-sheet/plan-copy`; `keHoachNoiMessages` từ `@/lib/messages/ke-hoach-noi`.
- Produces: ba nhóm ca `mau-that`, `ma-tran`, `bo-bat-con-song`.

- [ ] **Step 1: Viết tệp test** — dựng như `apps/app/test/lam-moi-chuyen-viec.dom.tsx`: mock `@/lib/trpc/client` trả `createTRPCOptionsProxy` thật trên `createTRPCClient` với link giả tra dữ liệu theo `op.path`.
  - Bộ bắt: `beforeEach` bọc `console.error` để ghi lời gọi, `afterEach` trả bản gốc. Hàm `khoaTrung()` đếm số lời gọi mà đối số ghép lại chứa `same key`.
  - Nhóm `mau-that` là `test.each` bốn ca vi/en × 2/3 và 0/0, cùng `afterAll` so bộ đếm với hằng `4`.
  - Nhóm `ma-tran` là `test.each` mười một ca, cùng `afterAll` so với hằng `11`.
  - Nhóm `bo-bat-con-song` có một ca với đối chứng dương.
  - Các thông điệp ghim theo `evals.yaml`.
- [ ] **Step 2: Thêm ba khoá executor** vào `_acceptance/config.yaml`:
  - `krdn_mau_that: "cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dien-node-khoa-rieng.dom.tsx -t mau-that"`
  - `krdn_ma_tran` giống hệt, chỉ đổi thành `-t ma-tran`.
  - `krdn_bo_bat` giống hệt, chỉ đổi thành `-t bo-bat-con-song`.
- [ ] **Step 3: Chạy trên mã chưa sửa.**
  - Chạy: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dien-node-khoa-rieng.dom.tsx`
  - Kỳ vọng: 4 ca `mau-that` ĐỎ với thông điệp «khoa trung o …»; 11 ca `ma-tran` ĐỎ vì `dienNode` không phải hàm; `bo-bat-con-song` XANH.
- [ ] **Step 4: Commit** `test(khoa-rieng-dien-node): test DOM đỏ trước cho khoá trùng`.

### Task 2: Sửa `dienNode` (E1, E2 xanh)

`independent: false` — cần Task 1.

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx:25-37`

**Interfaces:**
- Produces: `export function dienNode(mau: string, gia: Record<string, ReactNode>): ReactNode[]`

- [ ] **Step 1: Sửa**

```tsx
export function dienNode(mau: string, gia: Record<string, ReactNode>): ReactNode[] {
	let viTri = 0;
	return mau
		.split(/(\{\w+\})/)
		.filter((phan) => phan !== "")
		.map((phan) => {
			const khoa = /^\{(\w+)\}$/.exec(phan)?.[1];
			const khoaReact = `${viTri}`;
			viTri += phan.length;
			return (
				<Fragment key={khoaReact}>
					{khoa === undefined ? phan : (gia[khoa] ?? "")}
				</Fragment>
			);
		});
}
```

- [ ] **Step 2: Chạy tệp test.** Kỳ vọng: 16/16 xanh, 0 dòng `same key` trong đầu ra.
- [ ] **Step 3: Chạy hai tệp DOM của hồ sơ cũ.** Chạy `lam-moi-chuyen-viec.dom.tsx` và `moi-phia-ke-hoach.dom.tsx`. Kỳ vọng: xanh như trước, 0 dòng `same key`.
- [ ] **Step 4: Commit** `fix(khoa-rieng-dien-node): bỏ đoạn rỗng trước khi khoá Fragment theo vị trí`.
- [ ] **Step 5: Phá thử** trên bản đã commit, rồi hoàn nguyên bằng `git checkout -- <tệp>`:
  - (a) bỏ `.filter` → `mau-that` 4 đỏ «khoa trung o …», `ma-tran` 7 đỏ «khoa trung trong mau …»;
  - (b) dùng `.filter((phan) => phan.trim() !== "")` → «chu sai trong mau {a} {b}»;
  - (c) bỏ phần bọc `console.error` trong `beforeEach` → «bo bat console khong con song».
  - Sau khi hoàn nguyên, chạy lại tệp test: 16/16 xanh.

### Task 3: Răng không-hồi-quy (E4)

`independent: false` — đo `diff` của Task 1–2.

**Files:**
- Create: `_acceptance/khoa-rieng-dien-node/rang/khong-hoi-quy.mjs`, chép từ `_acceptance/lam-moi-chuyen-viec-qua-loi-chung/rang/khong-hoi-quy.mjs`, với các chỗ đổi:
  - `SLUG`
  - `TEP_KHAI` = [dialog, test mới]
  - `DOI_CHUNG` = dialog → `moi-phia-deu-thay-ke-hoach:E3` và `lam-moi-chuyen-viec-qua-loi-chung:E1`
  - thêm bước kiểm `git rev-parse --verify origin/onehub`: thất bại thì thoát 2 «KHONG DO DUOC»
  - bỏ vế «tep ngoai vong»
  - `TEP_VONG` = hợp(`TEP_KHAI`, D)
  - in dòng «DO SAN» và tổng số
- Modify: `_acceptance/config.yaml` (thêm `executors.script.krdn_khong_hoi_quy: "bun _acceptance/khoa-rieng-dien-node/rang/khong-hoi-quy.mjs"`)

- [ ] **Step 1: Viết script, thêm khoá, commit.**
- [ ] **Step 2: Chạy nền** `bun _acceptance/khoa-rieng-dien-node/rang/khong-hoi-quy.mjs`. Kỳ vọng: mã 0; hai dòng «DOI CHUNG DUONG»; in `TEP_VONG`.
- [ ] **Step 3: Phá thử** trên bản sao đặt ở `.acceptance-runs/khoa-rieng-dien-node/` (theo memory «bản sao đột biến»), hoặc sửa tại chỗ sau khi đã commit rồi `git checkout`:
  - (a) xoá `chuyen.mutate(...)` trong hộp → mã 1 «vong nay lam do them … moi-phia-deu-thay-ke-hoach:E3»;
  - (b) bản sao đổi `origin/onehub` thành một ref không tồn tại → mã 2 «KHONG DO DUOC»;
  - (c) bản sao gọi `rut([])` ở bước đối chứng → mã 1 «bo rut tap hong».
- [ ] **Step 4: Chạy năm lệnh chứng của kho**: `bun run check-types`, `lint`, `lint:slop`, `test`, `build`.
- [ ] **Step 5:** Đặt contract sang `status: implemented`, commit.
