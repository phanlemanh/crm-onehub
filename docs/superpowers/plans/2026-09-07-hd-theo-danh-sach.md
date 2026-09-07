# Kế hoạch thi công — `hd-theo-danh-sach`

> **Cho người thi công:** dùng `superpowers:subagent-driven-development` hoặc
> `superpowers:executing-plans`. Các bước dùng checkbox để theo dõi.
>
> **Hạng T3** — chạm `packages/auth/**`. Kế hoạch này phải được duyệt ở Cổng 1.5
> trước khi chạm một dòng mã.

**Mục tiêu:** `hd` chỉ gửi cho Google khi danh sách cho phép có **đúng một domain và
không địa chỉ lẻ nào**, để dạng trộn mà `.env.example` công bố và
`apps/api/test/workspace.spec.ts` khẳng định chạy được thật.

**Kiến trúc:** thêm một hàm thuần vào `packages/auth/src/workspace.ts` cạnh
`primaryWorkspaceDomain`; `auth.ts` chỉ gọi nó. Không đụng `isWorkspaceEmail`, không
đụng câu từ chối.

**Spec:** `docs/superpowers/specs/2026-09-07-hd-theo-danh-sach-design.md`

## Ràng buộc toàn cục

- Không viết chú thích trong code. Không `Record<string, unknown>`. Không
  `typeof x === "..."`.
- **Không sửa `apps/api/test/workspace.spec.ts`** — AC-3 bắt nó không đổi một ký tự,
  so với sha cố định `5ac85ef9f1a811afb4d101c832904fd5a691cfca`.
- **Không sửa `isWorkspaceEmail`** và không sửa hai câu từ chối trong `auth.ts`.
- Lệnh chứng: `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop`.

---

### Task 1: hàm thuần `googleHostedDomain()`

**Files:**
- Sửa: `packages/auth/src/workspace.ts`
- Sửa: `packages/auth/src/index.ts` (xuất ra)
- Test: `packages/auth/test/hosted-domain.spec.ts` (tạo)

**Interfaces:**
- Produces: `googleHostedDomain(): string | undefined` — trả `domains[0]` **chỉ khi**
  `domains.length === 1 && addresses.length === 0`; mọi ca khác trả `undefined`.
- Consumes: `allowList()` đã có trong cùng file. Không thêm hàm tách chuỗi mới —
  dùng lại đúng `allowList()`, vì AC-3 canh việc hàm tách dùng chung không đổi.

**Phục vụ:** E1 (bảng sáu dòng), E5 (cấu hình OneHub). `independent: false` — Task 2 phụ thuộc.

- [ ] **Bước 1: viết ca đỏ trước.** `packages/auth/test/hosted-domain.spec.ts`, bảng sáu
      dòng lấy nguyên từ AC-1, chạy trong một lượt bằng `test.each`:

```ts
const BANG = [
  ["onemount.com", "onemount.com", true],
  ["onemount.com,phanlemanh@gmail.com", undefined, true],
  ["phanlemanh@gmail.com", undefined, false],
  ["onemount.com,partner.com", undefined, true],
  [undefined, undefined, false],
  ["", undefined, false],
] as const;

test.each(BANG)("hd cho %p", (list, hd, allow) => {
  if (list === undefined) delete process.env.ALLOWED_SIGN_IN;
  else process.env.ALLOWED_SIGN_IN = list;
  expect(googleHostedDomain()).toBe(hd);
  expect(isWorkspaceEmail("ai@onemount.com")).toBe(allow);
});
```

- [ ] **Bước 2: chạy, phải ĐỎ** vì `googleHostedDomain` chưa tồn tại.
      Chạy: `cd packages/auth && bun test test/hosted-domain.spec.ts`
      Mong đợi: FAIL, không tìm thấy hàm.

- [ ] **Bước 3: viết hàm.** Trong `workspace.ts`, ngay dưới `primaryWorkspaceDomain`:

```ts
export function googleHostedDomain(): string | undefined {
	const { domains, addresses } = allowList();
	if (addresses.length > 0) return undefined;
	if (domains.length !== 1) return undefined;
	return domains[0];
}
```

      Rồi thêm `googleHostedDomain` vào danh sách xuất trong `packages/auth/src/index.ts`,
      cạnh `isWorkspaceEmail` và `primaryWorkspaceDomain`.

- [ ] **Bước 4: chạy, phải XANH cả sáu dòng.**
      Chạy: `cd packages/auth && bun test test/hosted-domain.spec.ts`
      Mong đợi: 6 pass, 0 fail.

- [ ] **Bước 5: cặp hai chiều đã có sẵn trong bảng** — dòng 1 là chiều dương (có đặt
      `hd`), năm dòng sau là chiều âm. Chứng thêm rằng thước biết đỏ: đổi tạm
      `domains.length !== 1` thành `domains.length === 0`, chạy lại, dòng 1 phải đỏ
      với thông điệp nêu `"onemount.com"` và `undefined`. Trả lại.

- [ ] **Bước 6: commit.**

```bash
git add packages/auth/src/workspace.ts packages/auth/src/index.ts packages/auth/test/hosted-domain.spec.ts
git commit -m "feat(auth): hd only when the allow-list is exactly one domain"
```

---

### Task 2: `auth.ts` gọi hàm thuần

**Files:**
- Sửa: `packages/auth/src/auth.ts` (dòng 48–49 và câu `import` ở dòng 28–30)

**Interfaces:**
- Consumes: `googleHostedDomain` từ `./workspace`.

**Phục vụ:** E2 (hàm thuần, đo bằng AST). `independent: false`.

- [ ] **Bước 1: đổi hai dòng.**

```ts
const hostedDomain = googleHostedDomain();
if (hostedDomain) google.hd = hostedDomain;
```

      và thêm `googleHostedDomain` vào câu `import { … } from "./workspace"` đã có.
      **Giữ nguyên** `primaryWorkspaceDomain` trong danh sách nhập — dòng 270 vẫn dùng
      nó cho câu từ chối.

- [ ] **Bước 2: kiểm không có gì khác đổi.**
      Chạy: `git diff packages/auth/src/auth.ts`
      Mong đợi: đúng hai khối — câu `import` và hai dòng `hostedDomain`. Không đụng
      khối `user.create.before`.

- [ ] **Bước 3: chạy kiểu và lint.**
      Chạy: `bun run check-types && bun run lint`
      Mong đợi: mã 0.

- [ ] **Bước 4: commit.**

```bash
git add packages/auth/src/auth.ts
git commit -m "fix(auth): read the hosted-domain decision from the allow-list, not the first domain"
```

---

### Task 3: chân đo hàm-thuần (E2)

**Files:**
- Tạo: `_acceptance/hd-theo-danh-sach/rang/ham-thuan.mjs`

**Phục vụ:** E2. `independent: true` so với Task 4, 5, 6.

- [ ] **Bước 1: viết chân.** Dùng `typescript` qua `createRequire` như các chân trước.
      Đọc `auth.ts` bằng AST, tìm câu gán cho `google.hd`, và khẳng định **biểu thức
      bên phải là một lời gọi hàm nhập từ `./workspace`** — KHÔNG được là biểu thức
      điều kiện đọc `addresses`/`domains` tại chỗ.
      Không tìm thấy chỗ gán → mã 2.

- [ ] **Bước 2: chạy trên cây lành, phải XANH.**

- [ ] **Bước 3: chiều đỏ.** Trong bản sao `auth.ts`, cấy lại logic vào thân dựng:
      `google.hd = allowList().addresses.length === 0 ? allowList().domains[0] : undefined;`
      Chạy lại → phải mã 1, nêu `file:dòng`. Trả lại bản gốc trong `finally`.

- [ ] **Bước 4: commit.**

---

### Task 4: chân canh cửa phân quyền (E3)

**Files:**
- Tạo: `_acceptance/hd-theo-danh-sach/rang/cua-phan-quyen-nguyen-ven.mjs`

**Phục vụ:** E3 — tiêu chí quan trọng nhất của vòng. `independent: true`.

- [ ] **Bước 1: ba phần trong một chân.**
      (a) `git diff 5ac85ef9f1a811afb4d101c832904fd5a691cfca..HEAD -- apps/api/test/workspace.spec.ts`
      phải RỖNG — **sha ghim, không dùng tên nhánh**.
      (b) chạy `cd apps/api && bun test test/workspace.spec.ts`, đọc và **in số ca xanh**.
      (c) đối chứng hành vi: nạp `isWorkspaceEmail` và chạy lại chính các hình dạng
      danh sách của bộ ca cũ (`acme.com` · `lewis@gmail.com` · `acme.com, contractor@gmail.com`
      · rỗng), so kết quả từng ca với bảng ghim trong chân.
      Không đọc được sha ghim, hoặc bộ test không chạy được → mã 2.

- [ ] **Bước 2: chạy trên cây lành, phải XANH.**

- [ ] **Bước 3: chiều đỏ.** Trong bản sao, sửa một dòng của `workspace.spec.ts` → mã 1,
      in ra diff. Trả lại.

- [ ] **Bước 4: commit.**

---

### Task 5: chân đo quan hệ câu từ chối (E4)

**Files:**
- Tạo: `_acceptance/hd-theo-danh-sach/rang/cau-tu-choi.mjs`

**Phục vụ:** E4. `independent: true`.

- [ ] **Bước 1: gọi THẬT đường từ chối**, không tìm chuỗi. Nạp module xác thực với
      từng hình dạng danh sách, gọi hook `user.create.before` với một địa chỉ ngoài
      danh sách, bắt `APIError` và đọc `message`. Khẳng định theo bảng hai dòng:
      `onemount.com` → câu nêu domain · `onemount.com,phanlemanh@gmail.com` → câu
      allow-list.
      Không gọi được đường từ chối → mã 2.

- [ ] **Bước 2: chạy, phải XANH cả hai dòng.**

- [ ] **Bước 3: chiều đỏ.** Trong bản sao, đảo nhánh chọn câu → mã 1, in cả hai câu.
      Trả lại.

- [ ] **Bước 4: commit.**

---

### Task 6: test tích hợp — một lượt bị từ chối không để lại hàng nào (E8)

**Files:**
- Tạo: `packages/auth/test/tu-choi-khong-de-lai-hang.integration.spec.ts`

**Phục vụ:** E8 (`layer: backend-effect`) — tiêu chí đo **cái thật sự đổi**.
`independent: true`.

- [ ] **Bước 1: dựng theo nếp có sẵn.** Đọc `packages/auth/test/organization.integration.spec.ts`
      trước khi viết — nó đã có khuôn nối cơ sở dữ liệu test của gói này. Dùng lại đúng
      khuôn ấy, đừng dựng khuôn mới.

- [ ] **Bước 2: hai ca trong một file.**
      **Đối chứng dương (chạy TRƯỚC):** với `ALLOWED_SIGN_IN="onemount.com,phanlemanh@gmail.com"`,
      cho một địa chỉ **TRONG** danh sách đi đường tạo người dùng → phải tạo **đúng một**
      hàng `user`. Không tạo → **mã 2**, vì khi ấy phép đo không phân biệt được «chặn
      đúng» với «đường callback không hề chạy».
      **Ca chính:** cùng cấu hình, một địa chỉ **NGOÀI** danh sách → đếm `user`,
      `account`, `session`, `verification` trước và sau; **bốn cặp phải bằng nhau**.
      Chân in đủ tám con số.

- [ ] **Bước 3: chạy, phải XANH.**
      Chạy: `cd packages/auth && bun test test/tu-choi-khong-de-lai-hang.integration.spec.ts`

- [ ] **Bước 4: chiều đỏ.** Đổi tạm hook từ `before` sang `after` trong bản sao — hàng
      `user` sẽ được tạo rồi mới ném → ca chính phải đỏ, nêu tên bảng và hai con số.
      Trả lại.

- [ ] **Bước 5: commit.**

---

### Task 7: chân không-chép-thước (E6)

**Files:**
- Tạo: `_acceptance/hd-theo-danh-sach/rang/mot-bo-thuoc.mjs`

**Phục vụ:** E6. `independent: true`.

- [ ] **Bước 1: viết từ đầu**, không chép ba bản đã có ở
      `chan-lai-component-ra-man`, `lenh-chung-khong-an-cache-doi`,
      `thuoc-cache-het-doi-tuong` — chính chân này canh việc đó.
- [ ] **Bước 2: chạy trên cây lành, phải XANH.**
- [ ] **Bước 3: chiều đỏ.** Chép một khối đặc 12 dòng từ một chân cũ → mã 1, nêu tên
      cả hai file. Trả lại.
- [ ] **Bước 4: commit.**

---

### Task 8: chạy trọn bốn lệnh chứng

**Phục vụ:** điều kiện vào S4. `independent: false`.

- [ ] `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` — cả bốn mã 0.
- [ ] `apps/app` về đúng ba cảnh báo lint có sẵn.
