# so-moi-khong-chap-chon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Bốn bài so-moi của `nop-ban-nhap.integration.spec.ts` chọn số thử từ chính gói gửi mô hình, nên không đỏ khi tên gieo tình cờ mang chữ số.

**Architecture:** Một hàm `soVangKhoiGoi` trong spec đọc `soTrongGoi` qua `goiSoan` + `goiKiemTu` của sản phẩm; bốn bài gọi nó cho cuộc của mình. Một răng (`rang/va-cham.mjs`) dựng bản sao của test với `ma()` chèn sẵn 37·41·100·2031 và chạy spec mới (xanh) hoặc spec cũ đã ghim (đỏ đúng bốn bài).

**Tech Stack:** bun test, Prisma (Postgres riêng mỗi lượt qua `bun run test --`), node ESM cho răng.

**Spec:** `_acceptance/so-moi-khong-chap-chon/design.md` · hợp đồng `contract.md` · đo `evals.yaml`.

## Global Constraints

- Ranh giới: chỉ `apps/agent-okr/test/nop-ban-nhap.integration.spec.ts` và `_acceptance/so-moi-khong-chap-chon/**`; thêm hai dòng `executors.script` vào `_acceptance/config.yaml` (đã duyệt `tra-loi/P4-1.json`, chỉ thêm).
- Không chú thích trong code (AGENTS.md).
- Không thêm lời gọi `db.find*` trong spec (răng `quet-mau` so danh sách).
- Giữ nguyên, mỗi chuỗi đúng một lần, các mốc của `_acceptance/nop-ban-nhap-chon-theo-khoa/rang/dao-thu-tu.mjs`: tiêu đề hai bài, `\t\tconst ctx = nguCanh(PHIEN_1, canh.nguoiMo.id, canh.cuocSoanId);\n` là dòng đầu thân bài 2, `\t\tconst ra = await nop(lai, ctx);\n`, `\t\tconst m1 = await mucTieuChoTheoKhoa(canh.cuocSoanId, "m1");\n`, `\t\tawait nop(tron(), ctx);\n`, khẳng định `expect(chuaGo.biLoai.find((x) => x.khoa === "m3")?.maLoai).toBe("so-moi");`.
- Bản sao của răng đặt ở `.acceptance-runs/so-moi-khong-chap-chon/sao-*`, không trong gói.

## Review Focus

1. Số chọn trùng một số khác mà dòng nộp tình cờ chứa (vd số chốt kỳ trước) — hàm trả số ≥ gợi ý vắng khỏi gói; dòng chỉ mang đúng số đó. Phủ bởi E2 (fixture va chạm).
2. Gói đổi giữa lúc chọn và lúc nộp — bài không ghi CRM/trang giữa hai lúc; nếu có, bài 2/3 «trước khi gõ» đỏ có tên. Phủ bởi E1.
3. Bản sao của răng nạp `agent/` của cây khác — răng in đường đã nạp, lệch gốc thì thoát 2. Phủ trong Task 2 (phá-thử).
4. Fixture va chạm không ăn (đổi `ma()` không vào tên) — bài dò `RANG-VA-CHAM` thiếu số → thoát 2. Phủ trong Task 2 (phá-thử).
5. Răng anh em mất mốc — E5/E6/E7 chạy lại.

---

### Task 1: Spec chọn số từ gói

**Files:** Modify `apps/agent-okr/test/nop-ban-nhap.integration.spec.ts` (import; hằng; `beforeAll`; `banNhapTron` k13; bài 2, 3, 4).
**Phục vụ:** E1, E4, E5, E6, E7 · **independent:** false (Task 2 chạy spec này)

**Interfaces — Produces:** `soVangKhoiGoi(cuocSoanId: string, goiY: number): Promise<number>`; hằng `GOI_Y = { k13: 100, nguoiGo: 37, phienCu: 41, tenTrang: 2031 } as const`.

- [ ] Thay `const SO_NGUOI_GO = 37;` bằng `GOI_Y`; thêm `import { goiKiemTu, goiSoan } from "../agent/lib/goi-soan";` và:

```ts
async function soVangKhoiGoi(cuocSoanId: string, goiY: number): Promise<number> {
	const goi = await goiSoan(cuocSoanId, { vai: "member" });
	if (!goi) throw new Error(`thieu goi cua cuoc ${cuocSoanId}`);
	const { soTrongGoi } = await goiKiemTu(goi, { soNguoiGo: new Set() });
	const vang = (so: number): number =>
		soTrongGoi.has(String(so)) ? vang(so + 1) : so;
	return vang(goiY);
}
```

- [ ] `let soK13: number = GOI_Y.k13;` cấp mô-đun; cuối `beforeAll`: `soK13 = await soVangKhoiGoi(canh.cuocSoanId, GOI_Y.k13);`; `k13.ten` = `` `Đạt ${soK13} % đối tác gia hạn` ``.
- [ ] Bài 2: sau dòng `ctx` và sau cập nhật `m1`, `const so = await soVangKhoiGoi(canh.cuocSoanId, GOI_Y.nguoiGo);` thay mọi `SO_NGUOI_GO`.
- [ ] Bài 3: `const so = await soVangKhoiGoi(cuoc.id, GOI_Y.phienCu);` thay `SO_NGUOI_GO + 4`.
- [ ] Bài 4: `const so = await soVangKhoiGoi(cuoc.id, GOI_Y.tenTrang);` — `k3.viSao` = `` `Bám định hướng vận hành ${so}` ``, mong `viPham: \`số mới: ${so}\``.
- [ ] Verify: `bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/nop-ban-nhap.integration.spec.ts"` → 0 fail; `bun _acceptance/nop-ban-nhap-chon-theo-khoa/rang/dao-thu-tu.mjs xanh` / `do` → 0; `bun _acceptance/nop-ban-nhap-chon-theo-khoa/rang/quet-mau.mjs` → 0; `cd apps/agent-okr && bun run check-types`, `bunx biome check test/nop-ban-nhap.integration.spec.ts`.
- [ ] Commit.

### Task 2: Răng va chạm hai chiều

**Files:** Create `_acceptance/so-moi-khong-chap-chon/rang/va-cham.mjs`; Modify `_acceptance/config.yaml` (thêm `smk_va_cham_xanh`, `smk_va_cham_do` cạnh `nbn_*`).
**Phục vụ:** E2, E3 · **independent:** false (đọc spec của Task 1)

**Interfaces — Consumes:** spec của Task 1; `fixtures/spec-truoc.ts.txt` (spec ở 0426cc9d0).

- [ ] Răng: `GOC` = ba cấp trên `import.meta.dirname`; đối số `xanh|do`; chép `apps/agent-okr/test/support/` vào `.acceptance-runs/so-moi-khong-chap-chon/sao-<chieu>-<pid>/support/`, thay đúng một lần dòng `ma()` của `gieo.ts` để chèn `so37so41so100so2031so` (mốc vắng → thoát 2); symlink `node_modules`; chép spec (HEAD cho `xanh`, bản ghim cho `do`), đổi `from "../agent/` sang `GOC/apps/agent-okr/agent/`, thêm import `goiKiemTu, goiSoan` (bản cũ chưa có) và nối bài dò:

```ts
test("rang va cham", async () => {
	const goi = await goiSoan(canh.cuocSoanId, { vai: "member" });
	if (!goi) throw new Error("RANG-KHONG-DO-DUOC: thieu goi");
	const { soTrongGoi } = await goiKiemTu(goi, { soNguoiGo: new Set() });
	console.log("RANG-VA-CHAM", ["37", "41", "100", "2031"].filter((s) => soTrongGoi.has(s)).join(","));
});
```

  chạy `bun run test -- "cd <sao> && CRM_TELEMETRY_DISABLED=1 bun test ./so-moi.spec.ts"` từ `GOC`, xoá bản sao trong `finally`; in đường spec và `agent/` đã nạp.
  - `xanh`: mã 0 khi bun 0, `0 fail`, `RANG-VA-CHAM 37,41,100,2031`; thiếu dòng/số → 2; có bài đỏ → 1.
  - `do`: mã 0 khi `RANG-VA-CHAM 37,41,100,2031`, bun ≠ 0, và tập `(fail) nop-ban-nhap > …` khớp ĐÚNG bốn tiền tố; khác → 1; va chạm không ăn → 2.
- [ ] Verify: `bun …/va-cham.mjs xanh` → 0; `… do` → 0. Phá-thử (cùng fixture): `SMK_KHONG_CHEN=1` tắt chèn → `xanh` thoát 2 «va cham khong an»; chạy chế độ `xanh` trên bản ghim (biến `SMK_SPEC=truoc`) → thoát 1 nêu bốn bài đỏ.
- [ ] Thêm hai dòng config; `git diff _acceptance/config.yaml` chỉ có dòng `+`.
- [ ] Commit.
