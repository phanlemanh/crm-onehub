# Trang chưa có đề xuất mở được — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang nào danh sách Kho tài liệu cho một người thấy thì người đó mở được; màn đọc của trang chưa có bản nói đang chờ gì và chỉ lối viết tay.

**Architecture:** Một luật `dieuKienThay` (Prisma `where`) ở `packages/db/src/tai-lieu-quyen.ts`, thêm vế người tạo trang; `get` và `nhacToi` lọc bằng nó trong truy vấn, `thayTrang` bị xoá. `taiLieu.get` trả `choLanDau.dangCho` + `nguon` (lọc theo `dieuKienThayNguon`); `ManDoc` hiện khung theo `dangCho`; `/sua` mở trình soạn trống cho trang chưa có bản.

**Tech Stack:** NestJS + tRPC (`apps/api`), Prisma (`packages/db`), Next.js App Router client component (`apps/app`), bun test (+ jsdom preload cho `.dom.tsx`), puppeteer trong phiên đo (`bun run do:man`).

**Spec:** `docs/superpowers/specs/2026-09-29-trang-chua-de-xuat-mo-duoc-design.md` · hợp đồng `_acceptance/trang-chua-de-xuat-mo-duoc/contract.md` · evals `_acceptance/trang-chua-de-xuat-mo-duoc/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Không migration, không chạm `packages/db/prisma` (chạm = nâng T3).
- Chữ màn nằm ở `apps/app/lib/messages/tai-lieu.ts`, đủ `en` và `vi`; từ theo `CONTEXT.md`: «Nguồn», «Máy đang soạn», «Cần gõ tay», «Chủ trang», «Bản đề xuất».
- Giao diện chỉ dùng `@crm/ui` (`Alert`, `Button`, `Icon`); không `className` đổi màu, góc, khoảng cách.
- Người không được thấy nhận `NotFoundException(T.khongCo)` — cùng lời với slug không có.
- Thứ tự `dangCho`: `duyet` > trạng thái nguồn mới nhất (`CHO_DOC`/`CHO_SOAN`/`DANG_SOAN` → `may-soan`, `CAN_GO_TAY` → `go-tay`, `LOI` → `loi`) > `tra-lai` > `chua-co-ban`; `DA_SOAN` không phải dấu hiệu chờ.
- Test API chạy qua `bun run test -- "cd apps/api && bun test test/<tệp> -t <tên>"` (mỗi lượt một CSDL riêng); test DOM bằng `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/<tệp>`.
- Mỗi phép đo mới có chiều đỏ trên bản sao với thông điệp ghim (MEASURE-BIRTH-CLAUSE); phá-thử trên bản sao ở `.acceptance-runs/`, không phá tại chỗ.

## Review Focus

- Trang bị trả lại rồi được «Soạn lại» (bản `TRA_LAI` + nguồn `DANG_SOAN`) → phải báo «Máy đang soạn», không «bị trả lại» — ca ghép trong Task 2.
- Người thấy trang nhưng không thấy nguồn mới nhất (nguồn do người khác tải) → `nguon: null`, không nút «Xem nguồn» — Task 2 chiều ngược E2.
- Nguồn `LOI` có `lyDo` null → khung chỉ hiện tên tệp, không có dấu «:» treo — Task 3.
- Tên tệp dài liền không dấu cách ở khổ 390 → không cuộn ngang — Task 3 (`break-words` ở chữ) và Task 5 bước 2.
- Gửi bản đầu từ trình soạn trống rồi về màn đọc mà không tải lại → màn báo chờ duyệt — Task 4/Task 5 bước 4.

---

### Task 1: Một luật thấy trang cho list, get, nhacToi

Phục vụ E1, E2 (vế nguồn → trang, tìm), E3, E7. `independent: false` (Task 2–5 dựa vào nó).

**Files:**
- Modify: `packages/db/src/tai-lieu-quyen.ts` (`dieuKienThay`)
- Modify: `apps/api/src/tai-lieu/quyen.ts` (xoá `thayTrang`)
- Modify: `apps/api/src/tai-lieu/tai-lieu.service.ts` (`get`)
- Modify: `apps/api/src/tai-lieu/tai-lieu-tim.service.ts` (`nhacToi`)
- Create: `apps/api/test/tai-lieu-thay-trang.spec.ts`
- Modify: `docs/api.md` mục «Kho tài liệu: tìm, nhắc tới, sức khoẻ» (câu «Who sees what»: thêm `get`, `nhacToi`; người tạo trang)

**Interfaces:**
- Produces: `dieuKienThay(nguoi): Prisma.TaiLieuTrangWhereInput` — admin `{}`; khác `OR [banDangDungId not null, chuTrangId, taoBoiId, deXuat.some.taoBoiId]`.
- Produces: bộ gieo `gieoMaTran()` trong spec trả `Record<TrangThaiThu, string>` slug, với `TrangThaiThu = "da-duyet" | "cho-duyet" | "may-soan" | "go-tay" | "loi" | "tra-lai"`.

- [ ] **Step 1: Viết spec đỏ.** `tai-lieu-thay-trang.spec.ts`: `const gia = khoNguonGia(); dungSan(gia);` Gieo trong `beforeAll`:
  - `da-duyet`: `taoTrang(ten, "Chính sách thử nghiệm xyzthay.\n", "tao", "chu")` + `duyet(deXuatId, "chu")`.
  - `cho-duyet`: `taoTrang(..., "tao", "chu")`.
  - `tra-lai`: `taoTrang` + `traLai(deXuatId, "chu")`.
  - `may-soan`, `go-tay`, `loi`: `xinCho("tao", tenTep, docxNho("..."))` rồi `goi("taiLieuNguon.nhan", { pathname, tenTep, dich: { loai: "moi", ten, loaiTrang: "quy-dinh", chuTrangId: phien.chu.nguoi }, phieu }, "tao")`; sau đó `db.taiLieuNguon.update({ where: { id: nguonId }, data: { trangThai: "DANG_SOAN" | "CAN_GO_TAY" | "LOI", lyDo: <chỉ LOI> } })`; khẳng định trang không có `taiLieuDeXuat` nào.
  - Bảng `MONG: Record<Ai, readonly TrangThaiThu[]>` viết tay trước: `owner`, `admin`, `chu`, `tao` = cả sáu; `khac`, `okr` = `["da-duyet"]`.
  - Test `ma-tran`: với mỗi `ai` × mỗi trạng thái: `list` (lọc slug thuộc sáu trang thử, đủ trang theo `page`) có/không, `get` 200/404, `nhacToi` 200/404 — so với `MONG`; lệch thì `throw new Error(\`lech list/get: ${ai} ${tt}\`)` (và `lech list/nhacToi: …`). Đếm khẳng định, cuối test `expect(dem).toBe(108)`.
  - Test `diem-vao`: mỗi `ai`: mọi dòng `taiLieuNguon.list` → `get(trang.slug)` 200, lệch → `dong nguon dan toi 404: ${ai} ${tt}`; `taiLieu.tim` với «xyzthay» → mọi dòng `get` 200; `tao` có ≥ 3 dòng nguồn.
  - Test `khong-thay`: `khac` gọi `get`/`nhacToi` cho `may-soan` và cho slug `ma("khong-co")`: `{status, loi}` bằng nhau từng cặp, `404`, `loi === "Không tìm thấy trang hay bản đề xuất này."` (import `TAI_LIEU_API` từ `../src/tai-lieu/tai-lieu-config`); đối chứng `chu` → 200; `list` của `khac` không có slug đó. Lệch → `khong thay khac khong ton tai: get`.
- [ ] **Step 2: Chạy, xác nhận đỏ** — `bun run test -- "cd apps/api && bun test test/tai-lieu-thay-trang.spec.ts -t ma-tran"` → FAIL `lech list/get: owner may-soan`.
- [ ] **Step 3: Cài.**
  ```ts
  export function dieuKienThay(nguoi: NguoiXemTaiLieu): Prisma.TaiLieuTrangWhereInput {
  	if (laQuanTriTaiLieu(nguoi.role)) return {};
  	return {
  		OR: [
  			{ banDangDungId: { not: null } },
  			{ chuTrangId: nguoi.id },
  			{ taoBoiId: nguoi.id },
  			{ deXuat: { some: { taoBoiId: nguoi.id } } },
  		],
  	};
  }
  ```
  `get`: `findFirst({ where: { AND: [{ slug }, dieuKienThay(nguoi)] }, select: … })`, bỏ `deXuat: { distinct … }` và `thayTrang`; `if (!t) throw khongCo();`. `nhacToi`: `findFirst({ where: { AND: [{ slug }, dieuKienThay(nguoi)] }, select: { id: true } })`, `if (!dich) throw new NotFoundException(TAI_LIEU_API.thongDiep.khongCo)`. Xoá `thayTrang` khỏi `quyen.ts` và mọi import.
- [ ] **Step 4: Chạy xanh** ba test (`-t ma-tran`, `-t diem-vao`, `-t khong-thay`), cộng `tai-lieu.spec.ts`, `tai-lieu-quyen.spec.ts`, `tai-lieu-nhac-toi.spec.ts`, `tai-lieu-nhac-bang-tab.spec.ts`, `tai-lieu-nguon-cua-ai.spec.ts`.
- [ ] **Step 5: Chiều đỏ trên bản sao** — `git worktree add --detach .acceptance-runs/trang-chua-de-xuat-mo-duoc/sao HEAD` (symlink `.env`, `bun install --frozen-lockfile`), dựng lại bản kiểm cũ trong `get` → `ma-tran` đỏ ghim `lech list/get: owner may-soan`; bỏ vế `taoBoiId` → `diem-vao` đỏ ghim `dong nguon dan toi 404: tao may-soan`; đổi lời không-thấy → `khong-thay` đỏ ghim. Gỡ bản sao.
- [ ] **Step 6: Commit** `fix(tai-lieu): một luật thấy trang cho danh sách, màn đọc và trang nhắc tới`.

### Task 2: `get` nói trang đang chờ gì; viết tay qua `propose`

Phục vụ E2 (chiều ngược), E4, E6. `independent: false`.

**Files:**
- Modify: `apps/api/src/tai-lieu/tai-lieu.contracts.ts` (`taiLieuGetOutput.choLanDau`)
- Modify: `apps/api/src/tai-lieu/tai-lieu.service.ts` (`get`, hàm thuần `dangChoCua`)
- Modify: `apps/api/test/tai-lieu-thay-trang.spec.ts` (test `dang-cho`, `viet-tay`, vế ngược trong `diem-vao`)

**Interfaces:**
- Produces (API output):
  ```ts
  export const DANG_CHO = ["duyet", "may-soan", "go-tay", "loi", "tra-lai", "chua-co-ban"] as const;
  choLanDau: z.object({
  	chuTrang: nguoi,
  	dangCho: z.enum(DANG_CHO),
  	nguon: z.object({ id: z.string(), tenTep: z.string(), lyDo: z.string().nullable() }).nullable(),
  }).nullable()
  ```
  `DANG_CHO` đặt ở `packages/validation/src/tai-lieu.ts` (app và API cùng đọc), kiểu `DangCho`.
- Produces (service): `dangChoCua(v: { coCho: boolean; coTraLai: boolean; nguonMoi: TrangThaiNguon | null }): DangCho`.

- [ ] **Step 1: Test đỏ `dang-cho`.** Gieo trang đơn cho mỗi phần tử `TRANG_THAI_NGUON` (nhập hằng) qua `nhan` + `update`, trang `CHO_DUYET` (create), trang `TRA_LAI` không nguồn, trang không nguồn không đề xuất (tạo thẳng `db.taiLieuTrang.create` — không đường ghi nào sinh ra nó), trang ghép: (a) create + nguồn `DANG_SOAN` gắn cùng trang (`db.taiLieuNguon.create` với `trangId`) → `duyet`; (b) create + reject + nguồn mới hơn `DANG_SOAN` → `may-soan`; (c) create + reject + nguồn `LOI` → `loi`; (d) create + reject + nguồn `DA_SOAN` → `tra-lai`; (e) hai nguồn cũ `LOI`, mới `CAN_GO_TAY` (`taiLuc` tăng dần) → `go-tay`, `nguon.id` = nguồn mới; trang đã duyệt → `choLanDau` null. Bảng `MONG_CHO` viết trước; lệch → `dangCho sai: <ten-o>` (ô (b) tên `tra-lai-roi-soan-lai`); `expect(dem).toBe(Object.keys(MONG_CHO).length)`. Ô `loi`: `nguon.lyDo` bằng lý do đã đặt.
- [ ] **Step 2: Vế ngược trong `diem-vao`**: mỗi `ai` × sáu trang: `get` 200 và `choLanDau?.nguon` khác null → `nguon.id` ∈ id `taiLieuNguon.list` của `ai`, lệch → `nguon khong thay: ${ai} ${tt}`; đếm ô có nguồn > 0.
- [ ] **Step 3: Test đỏ `viet-tay`**: trang `go-tay` và trang `tra-lai`: `chu` và `tao` `propose` → 200, hàng mới `banGocId` null, `CHO_DUYET`; `get` → `dangCho` `duyet`; `khac` `propose` → 404 (lời `khongCo`). Lệch → `viet tay bi chan: ${ai} ${tt}`.
- [ ] **Step 4: Chạy đỏ** (`-t dang-cho`: thiếu `dangCho`).
- [ ] **Step 5: Cài.** `get` select thêm `deXuat: { select: { trangThai: true } }` (đủ để biết `coCho`/`coTraLai`), `nguon: { orderBy: [{ taiLuc: "desc" }, { id: "desc" }], take: 1, select: { id, tenTep, trangThai, lyDo, taiBoiId } }`; nguồn trả ra chỉ khi `await this.db.taiLieuNguon.count({ where: { AND: [{ id }, dieuKienThayNguon(nguoi)] } }) > 0`. `dangChoCua` thuần:
  ```ts
  const NGUON_CHO: Partial<Record<TrangThaiNguon, DangCho>> = {
  	CHO_DOC: "may-soan", CHO_SOAN: "may-soan", DANG_SOAN: "may-soan",
  	CAN_GO_TAY: "go-tay", LOI: "loi",
  };
  export function dangChoCua(v: { coCho: boolean; coTraLai: boolean; nguonMoi: TrangThaiNguon | null }): DangCho {
  	if (v.coCho) return "duyet";
  	const tuNguon = v.nguonMoi ? NGUON_CHO[v.nguonMoi] : undefined;
  	if (tuNguon) return tuNguon;
  	return v.coTraLai ? "tra-lai" : "chua-co-ban";
  }
  ```
  `NGUON_CHO` đặt trong `tai-lieu-config.ts` (hằng theo vùng). `propose` không đổi (đã lọc bằng `dieuKienThay`).
- [ ] **Step 6: Chạy xanh** `dang-cho`, `viet-tay`, `diem-vao`, cộng `bun run check-types`.
- [ ] **Step 7: Chiều đỏ trên bản sao**: đảo thứ tự (`coTraLai` trước nguồn) → `dangCho sai: tra-lai-roi-soan-lai`; trả nguồn không lọc + gieo nguồn mới hơn do `admin` tải cho trang `loi` → `nguon khong thay: tao loi`; thêm `banDangDungId: { not: null }` vào `propose` → `viet tay bi chan: chu go-tay`.
- [ ] **Step 8: Commit** `feat(tai-lieu): màn đọc biết trang chưa có bản đang chờ gì`.

### Task 3: Khung «đang chờ gì» trên màn đọc

Phục vụ E5, E8. `independent: false` (đọc kiểu Task 2).

**Files:**
- Modify: `apps/app/lib/messages/tai-lieu.ts` (`doc.cho.*` cho `en` và `vi`)
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/[trang]/man-doc.tsx`
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/[trang]/page.tsx` (truyền `choLanDau`)
- Create: `apps/app/test/tai-lieu-trang-cho.dom.tsx`

**Interfaces:**
- Consumes: `DangCho` (`@crm/validation/tai-lieu`), `duongNguon(id)`, `duongSuaTrang(slug)` (`@/lib/tai-lieu-man`).
- Produces: `TrangDoc.choLanDau: { dangCho: DangCho; nguon: { id: string; tenTep: string; lyDo: string | null } | null } | null` (thay cho `boolean`).

- [ ] **Step 1: Chữ.** `doc.cho: Record<DangCho, { tieuDe: string; than: string }>` + `doc.vietTay`, `doc.xemNguon`, `doc.lyDoNguon` (`"Nguồn {tep}: {lyDo}"`), `doc.chiNguon` (`"Nguồn {tep}."`). Bản `vi`:
  - `duyet`: «Trang này chưa hiện cho mọi người.» / «Đang chờ {ten} duyệt.» (giữ lời cũ)
  - `may-soan`: «Máy đang soạn bản đầu.» / «Bản soạn xong sẽ chờ {ten} duyệt.»
  - `go-tay`: «Cần gõ tay.» / «Nguồn là bản quét, máy không đọc được chữ. Gõ nội dung để gửi {ten} duyệt.»
  - `loi`: «Máy chưa soạn được.» / «Soạn lại ở tab Nguồn, hoặc viết tay để gửi {ten} duyệt.»
  - `tra-lai`: «Bản đầu đã bị trả lại.» / «Viết bản mới để gửi {ten} duyệt.»
  - `chua-co-ban`: «Trang chưa có bản nào.» / «Viết bản đầu để gửi {ten} duyệt.»
  - `vietTay`: «Viết tay» · `xemNguon`: «Xem nguồn». Bản `en` tương ứng.
- [ ] **Step 2: Test DOM đỏ** — mock `@/lib/trpc/client`, `next/navigation`, `next/link`, `@/components/page-shell` như `tai-lieu-man-duyet-may.dom.tsx`; render `ManDoc` cho sáu `dangCho` × `vi`/`en`, chữ so với `taiLieuMessages(locale).doc.cho[dc]` sau `dien`; nút theo bảng `NUT: Record<DangCho, string[]>` viết trước; `href` «Xem nguồn» = `/ws${duongNguon(id)}`, «Viết tay» = `/ws${duongSuaTrang(slug)}`; phần tử chứa tên chủ trang và tên tệp có `translate="no"`; ô `loi` với `lyDo: null` → có «Nguồn <tep>.» và không có «: » sau tên tệp. Lệch nút → `${dc}: thieu nut ${nhan}` / `${dc}: thua nut ${nhan}`.
- [ ] **Step 3: Chạy đỏ.**
- [ ] **Step 4: Cài** trong `ManDoc`: `const cho = trang.choLanDau;` khung `Alert data-cho-lan-dau={cho.dangCho} role="status"` dùng `d.cho[cho.dangCho]`; thân: `<span translate="no">` quanh chữ có tên; dòng nguồn (khi `cho.nguon` và `dangCho` ∈ `loi`/`go-tay`/`may-soan`) là `AlertDescription` thứ hai với tên tệp `translate="no"` và `className="break-words"` chỉ nếu `@crm/ui` `AlertDescription` chưa bẻ chữ — nếu cần thì thêm biến thể ở `packages/ui`, không ở chỗ gọi. Hàng nút: «Viết tay» (`Button asChild size="sm" variant="outline"` + `Link` tới `duongSuaTrang`) khi `dangCho` ∉ {`duyet`, `may-soan`}; «Xem nguồn» (`variant="ghost"`, `Link` tới `duongNguon(nguon.id)`) khi có `nguon` và `dangCho` ∈ {`may-soan`, `go-tay`, `loi`}. Chỗ `trang.choLanDau ? … : …` cũ đổi sang `cho ? … : …`. `page.tsx`: `choLanDau: trang.choLanDau ? { dangCho: trang.choLanDau.dangCho, nguon: trang.choLanDau.nguon } : null`.
- [ ] **Step 5: Chạy xanh** DOM test, `tai-lieu-man-duyet-may.dom.tsx`, `bun run check-types`, và sàn thiết kế: `for t in man-doc.tsx sua/page.tsx; do node <design-gate> --target … --mode static; done` (lệnh `tcd_san_thiet_ke`).
- [ ] **Step 6: Chiều đỏ trên bản sao**: ẩn «Viết tay» ở `go-tay` → `go-tay: thieu nut Viet tay`; thêm `className="bg-red-500"` vào khung → sàn thiết kế exit 1 nêu tên tệp.
- [ ] **Step 7: Commit** `feat(tai-lieu): màn đọc nói trang đang chờ gì và chỉ lối viết tay`.

### Task 4: `/sua` mở trình soạn trống cho trang chưa có bản

Phục vụ E6u (bước 3–4). `independent: false`.

**Files:**
- Modify: `apps/app/app/(app)/[slug]/tai-lieu/[trang]/sua/page.tsx`

- [ ] **Step 1:** Bỏ `if (trang.noiDung === null) redirect(...)`; khi `trang.choLanDau?.dangCho === "duyet"` vẫn chuyển về màn đọc (một bản đang chờ, không mở bản thứ hai từ màn đọc); còn lại render `ManSoan` với `banGoc: trang.noiDung ?? ""`. Import `redirect` giữ cho nhánh `duyet`.
- [ ] **Step 2:** `bun run check-types`; `tai-lieu-soan.dom.tsx` xanh (ManSoan không đổi).
- [ ] **Step 3: Commit** `feat(tai-lieu): viết tay bản đầu cho trang chưa có bản`.

### Task 5: Đo màn trong phiên đo

Phục vụ E6u, E7u, E9j (ảnh). `independent: false` (cần Task 1–4).

**Files:**
- Create: `_acceptance/trang-chua-de-xuat-mo-duoc/rang/man-trang-cho.mjs`

- [ ] **Step 1: Viết rang** theo khuôn `_acceptance/tim-va-dieu-huong-kho/rang/man-tim.mjs`: `HO_SO = "trang-chua-de-xuat-mo-duoc"`, `CAY_DO` cho bước 1 (khôi phục kiểm cũ trong `get` → `buoc 1: man doc 404`), 2 (bỏ `break-words` → `buoc 2: cuon ngang loi-390`), 3 (trả lại `redirect` khi `noiDung === null` → `buoc 3: khong mo trinh soan`), 4 (bỏ `await cache.taiLieu(slug)` trong `man-soan.tsx` → `buoc 4: man doc chua bao cho duyet`), dùng `chieuDo` của `kho-tai-lieu/rang/man-lib.mjs`. Gieo bằng `d.db`: `owner` = `nguoiMoi("owner", "owner", "Chủ kho thử")`, chủ trang = `nguoiMoi("chu", "member", "Chủ trang thử")`; bốn trang chưa có bản (`taiLieuTrang.create` `taoBoiId` owner, `chuTrangId` chủ trang) + `taiLieuNguon.create` (`sha256` ngẫu nhiên, `blobPathname` `kho-tai-lieu/nguon/<uuid>`, tên tệp dài `Chinh_sach_nhan_vien_2026_ban_cuoi_cung_da_ky_va_dong_dau.pdf`) trạng thái `DANG_SOAN`, `CAN_GO_TAY`, `LOI` (lý do dài không dấu cách); trang thứ tư `TRA_LAI` qua `lam(owner, "taiLieu.create")` + `lam(chu, "taiLieu.reject")`.
  - Bước 1 (1440): `moTrang(owner, RONG, "/tai-lieu")`, `bamSel(t, 'a[data-trang="<slug may-soan>"]')`, `choDuong`, khẳng định không có chữ 404 và `[data-cho-lan-dau]` innerText chứa `taiLieuMessages("vi").doc.cho["may-soan"].tieuDe`; ảnh `tcd-may-soan-1440.png`.
  - Bước 2: bốn trang × {1440, 390}: `cuonNgang(t)` rỗng ở 390 → `buoc 2: dat <tt>`; ảnh `tcd-<tt>-<kho>.png`.
  - Bước 3 (1440): trang `go-tay`, `bamChu(t, "a", "Viết tay")`, `choDuong(t, "/sua")`, trình soạn có mặt, chữ trình soạn rỗng; ảnh `tcd-viet-tay-1440.png`.
  - Bước 4: gõ chuỗi mốc `tcd-moc-<MA>`, bấm «Gửi duyệt», `choDuong` về `/<slug>`, khung chứa `doc.cho.duyet.tieuDe`; `db.taiLieuDeXuat.count({ where: { trang: { slug }, banGocId: null, noiDung: { contains: moc } } }) === 1`; ảnh `tcd-gui-ban-dau-1440.png`.
- [ ] **Step 2: Chạy** `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/trang-chua-de-xuat-mo-duoc/rang/man-trang-cho.mjs"` → `buoc 1..4: dat`, ảnh ở `.acceptance-runs/trang-chua-de-xuat-mo-duoc/evidence/`.
- [ ] **Step 3: Chiều đỏ** `--chieu-do=1`…`=4` → mỗi lượt «DO DUNG GHIM».
- [ ] **Step 4:** Chép ảnh sang `_acceptance/trang-chua-de-xuat-mo-duoc/evidence/`; mở từng ảnh xem bằng mắt.
- [ ] **Step 5: Commit** `test(trang-chua-de-xuat-mo-duoc): đo màn trang chưa có bản trong phiên đo`.
