# Hộp thông báo trên web (TB1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mỗi mục nhắc buổi sáng thành một thông báo cho mọi người dùng CRM (kể cả người chưa nối Zalo/Slack), hiện ở chuông trên đầu trang có số chưa đọc, bấm vào là tới đúng chỗ.

**Architecture:** Lượt nhắc buổi sáng của tác nhân (`chayNhac`) ghi danh sách mục đã tính vào hàng lượt, rồi ghi thông báo vào bảng `ThongBao` TRƯỚC bước chọn kênh; Zalo/Slack giữ nguyên. Máy chủ mở router `thongBao` (phạm vi chung) cho chuông và trang Thông báo; ứng dụng hỏi lại số mỗi 60 giây. Nhịp chạy mỗi phút của tác nhân dọn thông báo quá 90 ngày. Một lệnh chỉ-đọc đối chiếu mục đã tính với thông báo theo ngày.

**Tech Stack:** Prisma (Postgres), NestJS + nestjs-trpc, eve (tác nhân), Next.js + TanStack Query + nuqs, bun test.

**Duyệt kế hoạch (Gate 1.5):** Manh Phan, 2026-10-14T03:27:06Z — «Duyệt kế hoạch» trong phiên.

**Spec:** `docs/superpowers/specs/2026-10-14-hop-thong-bao-tren-web-design.md` · hợp đồng `_acceptance/hop-thong-bao-tren-web/contract.md` · phép đo `_acceptance/hop-thong-bao-tren-web/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Hằng số tinh chỉnh được sống ở một chỗ: `THONG_BAO` trong `packages/validation/src/thong-bao.ts` — `soTrenChuong: 20`, `hoiLaiMs: 60 * GIAY_MS`, `giuNgay: 90`, `tranSo: 99`, `moiTrang: 30`. Test đọc hằng, không viết số.
- Parse ở biên: cột `noiDung` (Json) chỉ đọc qua `parseNoiDungThongBao`; payload lượt nhắc chỉ đọc qua `parseNhacPayload`.
- Client component chỉ nhập `@crm/ui/components/*`, tRPC client, React và `@crm/validation/thong-bao` (mô-đun này KHÔNG nhập `@crm/db`).
- Zalo/Slack: chữ và đường dẫn tin không đổi một byte (AC-3).
- Đường dẫn của thông báo (`duongDan`) là phần sau `/<slug>` của tin Zalo; ứng dụng dựng `href = "/" + slug + duongDan` (KHÔNG qua `workspaceUrl`, vì hàm đó chèn `/` trước `?`).
- Migration chỉ thêm bảng; mốc migration lấy giờ UTC thật lúc gộp, sau `20261013171218_kanban_viec` và `20261013172354_chep_viec_can_lam` của M5 (#375, 02:52Z).
- Việc nặng (suite cả kho, S4, push) đi qua khoá máy `chay-nang.sh`.
- Mọi phép đo mới có cặp hai chiều trên cùng fixture + thông điệp ghim (MEASURE-BIRTH-CLAUSE).

## Review Focus

1. Lượt nhắc bị thử lại sau khi đã ghi thông báo (lỗi gửi Zalo) — số thông báo không đổi. → Task 3 Step 1 (ô `htb-gop` e, `htb-kenh` 4).
2. Mục gộp đổi số qua đêm («3 tài liệu» → «5») — giữ một thông báo, nội dung số mới. → Task 2 Step 1 (`khoaThongBao` không mang số), Task 3 (ô `htb-gop` g).
3. Người vai chỉ OKR — chuông và bốn thủ tục chạy, không lộ dữ liệu đối tác. → Task 5 Step 7.
4. Thông báo dẫn tới bản ghi đã xoá / hết quyền — ngăn bản ghi nói lý do. → Task 6 (`thong-bao-mat-dich.dom.tsx`).
5. Khổ 375: ô bật ra không tràn, trang không cuộn ngang. → Task 8 (ô `chuong-375`, `trang-375`).

## Điều chỉnh khi thi công (S3)

- Gói `@crm/db` không phụ thuộc `@crm/validation` (chiều ngược lại đã có), nên đường ghi (`ghiThongBao`, `donThongBaoCu`) và lệnh đối chiếu sống ở tác nhân: `apps/agent/agent/lib/thong-bao-ghi.ts`, `apps/agent/agent/lib/thong-bao-doi-chieu.ts`, CLI `apps/agent/scripts/thong-bao-doi-chieu.ts`; lệnh gốc `"thong-bao:doi-chieu": "bun apps/agent/scripts/thong-bao-doi-chieu.ts"`. `chayNhac` nhận thêm `deps.ghiThongBao` để test tiêm lỗi (ô 6 của E12, ô 3 của E3) thay cho `mock.module`.
- Migration sinh bằng `prisma migrate diff --from-schema <schema HEAD> --to-schema prisma/schema.prisma --script`, không chạy `migrate dev` trên kho dev chung.

## Thứ tự và tính độc lập

Mọi task `independent: false` — mỗi task dùng tên/kiểu của task trước (khuôn → bảng → tác nhân → máy chủ → ứng dụng → đối chiếu → đo màn). Thi công tuần tự trong vòng chính.

---

### Task 1: Bản chụp tin Zalo/Slack trước vòng

**independent:** false (PHẢI là commit đầu tiên, trước mọi sửa `nhac-ke-hoach.ts`) · **phục vụ:** E3

**Files:**
- Create: `apps/agent/test/support/chup-tin-nhac.ts` (bộ sinh bản chụp)
- Create: `apps/agent/test/support/muc-mau.ts` (một mục mẫu đúng khuôn cho MỖI loại của `THU_TU_NHAC`, kiểu `ViecNhac`)
- Create: `apps/agent/test/fixtures/tin-nhac-truoc-tb1.json`

**Interfaces:**
- Produces: `MUC_MAU: Record<(typeof THU_TU_NHAC)[number], ViecNhac>`; tệp chụp `{ "<loai>": { "zalo": string, "slack": string, "duong": string | null } }`.

- [ ] **Step 1: Mục mẫu** — `muc-mau.ts` khai một `ViecNhac` cho mỗi loại, `satisfies Record<(typeof THU_TU_NHAC)[number], ViecNhac>` (thiếu loại là lỗi biên dịch). Ví dụ:

```ts
export const MUC_MAU = {
	"viec-qua-han": { loai: "viec-qua-han", viecId: "v1", tieuDe: "Gửi báo giá cho Hoà Phát", soNgay: 2, banGhi: null },
	"tai-lieu-cho-duyet": { loai: "tai-lieu-cho-duyet", so: 3 },
	"okr-tra-lai": { loai: "okr-tra-lai", objectiveId: "o1", nhan: "Tăng doanh thu Q4", nguoiTraLai: "Lan", lyDo: "thiếu KR đo được" },
} satisfies Record<(typeof THU_TU_NHAC)[number], ViecNhac>;
```

(đủ 21 loại; mỗi mục qua được `mucNhac.parse(maViec(v))` ở mã gốc).

- [ ] **Step 2: Bộ sinh chạy trên mã gốc** — `chup-tin-nhac.ts` nhận `--goc <thư mục cây gốc>`: nhập `dungTin` và `duongMo` từ `<goc>/apps/agent/agent/lib/…`; với mỗi loại gọi `dungTin("Lan", new Date("2026-10-14T01:30:00Z"), [MUC_MAU[loai]], lienKet, "tron", ZALO.tranKyTu, ZALO.loi.goiY)` (Zalo) và `dungTin(..., lienKet)` (Slack), `lienKet = await duongMo("https://crm.test")`, ghi `duong = lienKet(MUC_MAU[loai])`; ghi JSON sắp khoá. Vì `duongMo` ở mã gốc chưa xuất, chạy trong cây phụ tạm:

```bash
git worktree add /private/tmp/claude-501/tb1-goc 762acca38
sed -i '' 's/^async function duongMo(/export async function duongMo(/' /private/tmp/claude-501/tb1-goc/apps/agent/agent/lib/nhac-ke-hoach.ts
ln -s "$PWD/node_modules" /private/tmp/claude-501/tb1-goc/node_modules
bun run test -- "cd apps/agent && bun test/support/chup-tin-nhac.ts --goc /private/tmp/claude-501/tb1-goc --ra test/fixtures/tin-nhac-truoc-tb1.json"
git worktree remove --force /private/tmp/claude-501/tb1-goc
```

(sửa duy nhất ở cây phụ là chữ `export`; cây phụ bị xoá ngay; `bun run test --` cho kho thử có workspace slug để `duongMo` không trả null).

- [ ] **Step 3: Kiểm tệp chụp** — `jq 'keys | length' apps/agent/test/fixtures/tin-nhac-truoc-tb1.json` → `21`; mọi `duong` khác null.

- [ ] **Step 4: Commit** — `git add apps/agent/test/support/chup-tin-nhac.ts apps/agent/test/support/muc-mau.ts apps/agent/test/fixtures/tin-nhac-truoc-tb1.json && git commit -m "test(hop-thong-bao-tren-web): chup tin Zalo/Slack tu ma truoc vong"`

### Task 2: Khuôn thông báo, bảng `ThongBao`, đường ghi

**independent:** false (cần Task 1 đã commit) · **phục vụ:** E1, E2, E11 (hàm dọn), E10

**Files:**
- Create: `packages/validation/src/thong-bao.ts`; Modify: `packages/validation/package.json` (`"./thong-bao": "./src/thong-bao.ts"`)
- Modify: `packages/validation/src/nhac-ke-hoach.ts` (`nhacPayload` thêm `mucTinh`, `thongBaoLoi`)
- Modify: `packages/db/prisma/schema.prisma` (model `ThongBao`, quan hệ `thongBao ThongBao[] @relation("ThongBaoNguoiNhan")` ở `User`)
- Create: `packages/db/prisma/migrations/<UTC>_thong_bao/migration.sql` (sinh bằng `bun run db:migrate -- --name thong_bao`, chỉ `CREATE TABLE` + index + FK)
- Create: `apps/agent/agent/lib/thong-bao-ghi.ts`; Modify: `packages/db/package.json` (`"./thong-bao-ghi": "./src/thong-bao-ghi.ts"`)
- Test: `packages/validation/test/thong-bao.spec.ts`

**Interfaces:**
- Produces (validation): `THONG_BAO`; `LOAI_THONG_BAO` (bằng đúng `THU_TU_NHAC`, thứ tự giữ nguyên); `type LoaiThongBao`; `noiDungThongBao` (zod, hợp của 21 khuôn); `type NoiDungThongBao`; `parseNoiDungThongBao(v: unknown): NoiDungThongBao`; `khoaThongBao(nd: NoiDungThongBao, now: Date): string`; `moMotInput = z.object({ id: z.string().min(1) })`; `danhSachInput = z.object({ chiChuaDoc: z.boolean(), conTro: z.string().optional() })`.
- Produces (db): `ghiThongBao(db: Db, userId: string, viec: ViecNhac[], duong: (v: ViecNhac) => string, now: Date): Promise<{ tao: number; capNhat: number }>`; `donThongBaoCu(db: Db, now: Date): Promise<number>`.

- [ ] **Step 1: Test đỏ cho khoá** — `packages/validation/test/thong-bao.spec.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { khoaThongBao, LOAI_THONG_BAO, parseNoiDungThongBao } from "../src/thong-bao";

const SANG = new Date("2026-10-14T01:30:00Z");

describe("khoa-thong-bao", () => {
	test("muc gop khong mang so dem", () => {
		const a = khoaThongBao({ loai: "tai-lieu-cho-duyet", so: 3 }, SANG);
		const b = khoaThongBao({ loai: "tai-lieu-cho-duyet", so: 5 }, SANG);
		expect(a, "muc gop sinh thong bao moi khi so doi").toBe(b);
	});
	test("cap nhat tuan theo tuan, khong theo danh sach KR", () => {
		const t2 = khoaThongBao({ loai: "okr-cap-nhat", krIds: ["k1"], nhan: "x", soKr: 1 }, SANG);
		const t3 = khoaThongBao({ loai: "okr-cap-nhat", krIds: ["k1", "k2"], nhan: "x", soKr: 2 }, new Date("2026-10-15T01:30:00Z"));
		const tuanSau = khoaThongBao({ loai: "okr-cap-nhat", krIds: ["k1"], nhan: "x", soKr: 1 }, new Date("2026-10-20T01:30:00Z"));
		expect(t2).toBe(t3);
		expect(t2).not.toBe(tuanSau);
	});
	test("ban ghi khac thi khoa khac", () => {
		expect(khoaThongBao({ loai: "viec-qua-han", viecId: "v1", tieuDe: "a", banGhi: null }, SANG))
			.not.toBe(khoaThongBao({ loai: "viec-qua-han", viecId: "v2", tieuDe: "a", banGhi: null }, SANG));
	});
	test("noiDung sai khuon thi nem loi co ten", () => {
		expect(() => parseNoiDungThongBao({ loai: "khong-co" })).toThrow(/noiDung thong bao/);
	});
	test("21 loai", () => {
		expect(LOAI_THONG_BAO.length).toBe(21);
	});
});
```

- [ ] **Step 2: Chạy, đỏ** — `cd packages/validation && bun test test/thong-bao.spec.ts` → FAIL (module không có).

- [ ] **Step 3: Khuôn** — `packages/validation/src/thong-bao.ts`: `GIAY_MS`/`NGAY_MS` từ một gốc; `THONG_BAO` như Global Constraints + `loi: { khongCo: "Không có thông báo này." }`; `LOAI_THONG_BAO` liệt 21 loại theo đúng thứ tự `THU_TU_NHAC`; `noiDungThongBao = z.discriminatedUnion("loai", [...])` với một `z.object` cho mỗi khuôn (`ViecKeHoach` cho bốn loại kế hoạch qua `z.enum`, `NhacViec` cho ba loại Việc, mười khuôn OKR chép đúng `viecOkr` của `packages/db/src/okr-nhac.ts`, `ViecTaiLieu`, `ViecTomTat`, hai khuôn `ViecAi`) — KHÔNG nhập `@crm/db`; `parseNoiDungThongBao` bọc `safeParse`, lỗi → `throw new Error(\`noiDung thong bao sai khuon: ${issues}\`)`; `khoaThongBao` theo bảng:

| loại | khoá |
|---|---|
| `viec-*` | `loai:viecId` |
| `buoc-qua-han`, `buoc-sap-han` | `loai:planId:stepId` |
| `ke-hoach-im` | `loai:planId` |
| `moc-ngay` | `loai:planId:soNgay` |
| `okr-cap-nhat` | `loai:<thứ Hai VN của tuần>` |
| `okr-kr-im` | `loai:keyResultId` |
| `okr-duoc-giao` | `loai:objectiveId:keyResultId?` |
| `okr-nhac-ten` | `loai:commentId` |
| `okr-ghi-nhan` | `loai:ghiNhanId` |
| `okr-theo-doi`, `okr-cho-duyet`, `okr-tra-lai` | `loai:objectiveId` |
| `okr-hoi-y-*` | `loai:hoiYId` |
| `tai-lieu-cho-duyet` | `loai` |
| `okr-tom-tat` | `loai:tomTatId` |
| `ai-tran` | `loai:thang:muc` |
| `ai-doi-soat-lech` | `loai:thang` |

Thứ Hai VN tính bằng `homNayVN` của `./ngay-vn` lùi về thứ Hai. `nhacPayload` thêm `mucTinh: z.object({ ngay: z.string(), muc: z.array(mucNhac) }).optional()`, `thongBaoLoi: z.string().optional()`.

- [ ] **Step 4: Bảng** — `schema.prisma`:

```prisma
model ThongBao {
  id          String    @id @default(cuid())
  nguoiNhanId String
  nguoiNhan   User      @relation("ThongBaoNguoiNhan", fields: [nguoiNhanId], references: [id], onDelete: Cascade)
  nguon       String
  khoa        String
  noiDung     Json
  duongDan    String
  taoLuc      DateTime  @default(now())
  ngayDau     String
  thayNgay    String
  docLuc      DateTime?
  moLuc       DateTime?

  @@unique([nguoiNhanId, khoa, ngayDau])
  @@index([nguoiNhanId, taoLuc])
  @@index([nguoiNhanId, docLuc])
  @@index([taoLuc])
  @@map("thongBao")
}
```

Rồi `cd packages/db && bun run db:migrate -- --name thong_bao && bun run db:generate`; mở `migration.sql` kiểm chỉ có `CREATE TABLE "thongBao"`, ba `CREATE INDEX`, một `CREATE UNIQUE INDEX`, một FK `ON DELETE CASCADE`.

- [ ] **Step 5: Đường ghi** — `apps/agent/agent/lib/thong-bao-ghi.ts`:

```ts
import { khoaThongBao, THONG_BAO, type NoiDungThongBao } from "@crm/validation/thong-bao";
import type { Db } from "./client";
import { DAY_MS, ngayVN, type ViecNhac } from "./onboarding-nhac";

export async function ghiThongBao(db: Db, userId: string, viec: ViecNhac[], duong: (v: ViecNhac) => string, now: Date) {
	const homNay = ngayVN(now);
	const homQua = ngayVN(new Date(now.getTime() - DAY_MS));
	return db.$transaction(async (tx) => {
		let tao = 0;
		let capNhat = 0;
		for (const v of viec) {
			const noiDung: NoiDungThongBao = v;
			const khoa = khoaThongBao(noiDung, now);
			const cu = await tx.thongBao.findFirst({
				where: { nguoiNhanId: userId, khoa, thayNgay: { in: [homQua, homNay] } },
				orderBy: { taoLuc: "desc" },
				select: { id: true },
			});
			if (cu) {
				await tx.thongBao.update({ where: { id: cu.id }, data: { thayNgay: homNay, noiDung, duongDan: duong(v) } });
				capNhat += 1;
				continue;
			}
			const r = await tx.thongBao.createMany({
				data: [{ nguoiNhanId: userId, nguon: THONG_BAO.nguon.nhacBuoiSang, khoa, noiDung, duongDan: duong(v), ngayDau: homNay, thayNgay: homNay, taoLuc: now }],
				skipDuplicates: true,
			});
			tao += r.count;
		}
		return { tao, capNhat };
	});
}

export async function donThongBaoCu(db: Db, now: Date): Promise<number> {
	const { count } = await db.thongBao.deleteMany({ where: { taoLuc: { lt: new Date(now.getTime() - THONG_BAO.giuNgay * DAY_MS) } } });
	return count;
}
```

(`const noiDung: NoiDungThongBao = v` là chốt biên dịch: `ViecNhac` đổi khuôn mà khuôn thông báo không theo thì không biên dịch được. `THONG_BAO.nguon.nhacBuoiSang = "nhac-buoi-sang"`.)

- [ ] **Step 6: Xanh** — `cd packages/validation && bun test test/thong-bao.spec.ts` PASS; `bun run check-types` PASS. Phá thử: cho `tai-lieu-cho-duyet` khoá `loai:so` → ô «muc gop sinh thong bao moi khi so doi» đỏ; hoàn lại.

- [ ] **Step 7: Commit** — `git add packages/validation packages/db/prisma apps/agent/agent/lib/thong-bao-ghi.ts packages/db/package.json && git commit -m "feat(hop-thong-bao-tren-web): bang ThongBao, khuon noi dung, duong ghi"`

### Task 3: Lượt nhắc buổi sáng ghi thông báo trước khi chọn kênh

**independent:** false (cần Task 2) · **phục vụ:** E1, E2, E3, E10

**Files:**
- Modify: `apps/agent/agent/lib/nhac-ke-hoach.ts` (tách `duongTrongApp`, xuất `duongMo`, sửa `chayNhac`)
- Modify: `docs/agent.md` (mục nhắc buổi sáng: một đoạn về thông báo và `payload.mucTinh`)
- Test: `apps/agent/test/thong-bao-ghi.integration.spec.ts` (`htb-ghi`, `htb-gop`, `htb-kenh`, `htb-don` ở Task 4), `apps/agent/test/thong-bao-duong.spec.ts`

**Interfaces:**
- Consumes: `ghiThongBao`, `khoaThongBao`, `nhacPayload` (Task 2); `MUC_MAU`, tệp chụp (Task 1).
- Produces: `export function duongTrongApp(v: ViecNhac): string` (phần sau `/<slug>`, ví dụ `/viec?record=viec:v1`, `?record=plan:p1`); `export async function duongMo(appUrl): Promise<LienKet>` = `` `${appUrl}/${slug}${duongTrongApp(v)}` ``.

- [ ] **Step 1: Test đỏ** — `thong-bao-ghi.integration.spec.ts` khuôn `nhac-qua-zalo.integration.spec.ts` (`donDep`, `moXuong`, `gieoGui`, `noiSlack`/`khopSlack`, `noiZalo`/`batBot`, `zaloGia`, `slackGia`, `setSystemTime`, `voiToken`). Ba khối viết đúng `expected` E1, E2, E3 của `evals.yaml` (tập mục kỳ vọng rút bằng `viecCanNhac` trên cùng kho, không viết tay; ma trận loại rút từ `THU_TU_NHAC`; E3 ô 2 so `dungTin` + `duongMo` hiện tại với tệp chụp Task 1 cho đủ 21 loại, và kiểm thứ tự commit bằng `git merge-base --is-ancestor <commit thêm tệp chụp> <mỗi commit sửa nhac-ke-hoach.ts từ 762acca38>`). `thong-bao-duong.spec.ts`: với mỗi loại, `duongTrongApp(MUC_MAU[loai]) === tep[loai].duong.slice("https://crm.test/".length + slug.length)`; phần câu vi/en đo ở `apps/app/test/thong-bao-cau.spec.ts` (Task 6).

- [ ] **Step 2: Chạy, đỏ** — `htb_ghi`, `htb_gop`, `htb_kenh`, `htb_duong` của config → FAIL.

- [ ] **Step 3: Tách đường** — trong `nhac-ke-hoach.ts` chuyển thân `duongMo` thành `duongTrongApp(v)` trả phần sau `/${ctx.slug}` (giữ nguyên chuỗi từng nhánh), `duongMo` còn: `return (v) => \`${ctx.appUrl}/${ctx.slug}${duongTrongApp(v)}\``; xuất cả hai.

- [ ] **Step 4: Sửa `chayNhac`** — ngay sau `if (viec.length === 0) …`:

```ts
	const now = new Date();
	const mucTinh = { ngay: ngayVN(now), muc: maCuaAnToan(userId, viec) };
	await db.agentTask.update({ where: { id: task.id }, data: { payload: { ...payload, mucTinh } } });
	let thongBaoLoi: string | undefined;
	try {
		await ghiThongBao(db, userId, viec, duongTrongApp, now);
	} catch (loi) {
		thongBaoLoi = loi instanceof Error ? loi.message : String(loi);
		console.error(`[nhac] ghi thong bao hong nguoi=${userId}: ${thongBaoLoi}`);
		await db.agentTask.update({ where: { id: task.id }, data: { payload: { ...payload, mucTinh, thongBaoLoi } } });
	}
```

và mọi `update` payload phía sau giữ `mucTinh` (+ `thongBaoLoi` nếu có): `payload: { ...payload, mucTinh, ...(thongBaoLoi ? { thongBaoLoi } : {}), daGui: …, kenh: …, lechKenh: … }`.

- [ ] **Step 5: Xanh** — bốn lệnh ở Step 2 PASS, kèm `htb_kenh` chạy lại hai bộ cũ `nhac-qua-zalo`, `nhac-viec` không sửa assert. Phá thử từng chiều đỏ của E1, E2, E3 (đặt ghi sau nhánh kênh; bỏ ghi payload; bỏ điều kiện liên tục; khoá mang số; bỏ ràng buộc duy nhất; để lỗi nổi lên; đổi đường `okr-hoi-y-gop`), mỗi lần một bản sao, ghim thông điệp, hoàn lại.

- [ ] **Step 6: Commit** — `git add apps/agent/agent/lib/nhac-ke-hoach.ts apps/agent/test/thong-bao-ghi.integration.spec.ts apps/agent/test/thong-bao-duong.spec.ts docs/agent.md && git commit -m "feat(hop-thong-bao-tren-web): luot nhac ghi thong bao truoc khi chon kenh"`

### Task 4: Dọn thông báo quá 90 ngày trong nhịp chạy mỗi phút

**independent:** false (cần Task 2) · **phục vụ:** E11

**Files:**
- Create: `apps/agent/agent/lib/thong-bao-don.ts` (`donThongBaoDinhKy(now = new Date())` gọi `donThongBaoCu(db, now)`, log số đã dọn khi > 0)
- Modify: `apps/agent/agent/schedules/dispatch.ts` (thêm `donThongBaoDinhKy()` vào `Promise.all` cạnh `kiemBot()`, như `kiemBot` đang dọn `zaloUpdateSeen`)
- Test: `apps/agent/test/thong-bao-ghi.integration.spec.ts` khối `htb-don`

- [ ] **Step 1: Test đỏ** — khối `htb-don` đúng `expected` E11, gọi `donThongBaoDinhKy(now)`; thêm ô nối lịch: nạp `apps/agent/agent/schedules/dispatch.ts` bằng `Bun.Transpiler` lấy danh sách lời gọi trong `Promise.all` đầu của `run`, assert có `donThongBaoDinhKy` (giới hạn đã biết: đo cú pháp nối lịch, không chạy cả nhịp vì `drainAll` sẽ xử lý hàng chờ thật).
- [ ] **Step 2: Đỏ** → **Step 3: Viết** `thong-bao-don.ts` và nối vào `dispatch.ts` → **Step 4: Xanh** `htb_don`; phá thử `<=` và gỡ lời gọi khỏi `dispatch.ts` → hai ô đỏ ghim thông điệp; hoàn lại.
- [ ] **Step 5: Commit** — `git add apps/agent/agent/lib/thong-bao-don.ts apps/agent/agent/schedules/dispatch.ts apps/agent/test/thong-bao-ghi.integration.spec.ts && git commit -m "feat(hop-thong-bao-tren-web): don thong bao qua 90 ngay moi nhip"`


### Task 5: Router `thongBao` ở máy chủ

**independent:** false (cần Task 2) · **phục vụ:** E6, E7, E9

**Files:**
- Create: `apps/api/src/thong-bao/thong-bao.module.ts`, `thong-bao.router.ts`, `thong-bao.service.ts`, `thong-bao.contracts.ts`
- Modify: `apps/api/src/app.module.ts` (import `ThongBaoModule`, thêm cuối `imports`)
- Modify: `apps/api/src/generated/server.ts` (chỉ qua `bun run trpc:generate`)
- Modify: `apps/api/test/vai-chi-okr.spec.ts`
- Test: `apps/api/test/thong-bao.spec.ts`

**Interfaces:**
- Consumes: `THONG_BAO`, `moMotInput`, `danhSachInput`, `parseNoiDungThongBao` từ `@crm/validation/thong-bao` (Task 2); bảng `thongBao` (Task 2).
- Produces: thủ tục `thongBao.chuong` → `{ soChuaDoc: number; dong: DongThongBaoRa[] }`; `thongBao.danhSach({ chiChuaDoc, conTro? })` → `{ dong: DongThongBaoRa[]; conTroSau: string | null }`; `thongBao.moMot({ id })` → `{ ok: true }`; `thongBao.docHet()` → `{ soDaDoc: number }`. `DongThongBaoRa = { id; noiDung: NoiDungThongBao; duongDan: string; taoLuc: Date; daDoc: boolean }`.

- [ ] **Step 1: Viết test đỏ** — `apps/api/test/thong-bao.spec.ts`, khuôn `tin-hieu.spec.ts` (supertest trên `createApp()`, `gieoThanhVien`/`mintPhien` của `./phien-thu`, `setSystemTime`). Tiền tố `htb${TEST_RUN_ID}`; người `a`, `b`, `okr`. Gieo thông báo bằng `ghiThongBao` (đường ghi thật, Task 2), không `db.thongBao.create` tay. Ba khối:

```ts
describe("htb-mo", () => {
	test("htb-mo: bam mo dat docLuc va moLuc, giu lan bam dau", async () => {
		await don();
		setSystemTime(new Date("2026-10-14T01:30:00.000Z"));
		const [t1, t2, t3] = await gieoBa("a");
		const luc = new Date("2026-10-14T02:00:00.000Z");
		setSystemTime(luc);
		expect((await trpc("a", "thongBao.moMot", "mutation", { id: t2 })).status).toBe(200);
		const hang = await db.thongBao.findUniqueOrThrow({ where: { id: t2 } });
		expect(hang.moLuc?.toISOString(), "bam mo khong ghi luc mo").toBe(luc.toISOString());
		expect(hang.docLuc?.toISOString()).toBe(luc.toISOString());
		for (const id of [t1, t3])
			expect((await db.thongBao.findUniqueOrThrow({ where: { id } })).docLuc).toBeNull();
		expect(((await trpc("a", "thongBao.chuong", "query")).data as { soChuaDoc: number }).soChuaDoc).toBe(2);
		setSystemTime(new Date("2026-10-14T03:00:00.000Z"));
		await trpc("a", "thongBao.moMot", "mutation", { id: t2 });
		expect((await db.thongBao.findUniqueOrThrow({ where: { id: t2 } })).moLuc?.toISOString()).toBe(luc.toISOString());
	});
});
```

`htb-doc-het` (A 4 chưa đọc + 1 đã đọc, B 2 chưa đọc; so từng trường hàng của B trước/sau; `moLuc` của A không đổi; gọi lần hai không hàng nào đổi) và `htb-cua-minh` (ma trận 4 thủ tục × {a, b, không phiên}; `moMot` id của b do a gọi → 404 và hàng b không đổi; người `okr` gọi đủ bốn thủ tục → không 403) viết theo đúng `expected` của E7, E9 trong `evals.yaml`, mỗi assert âm ghim thông điệp như ở đó.

- [ ] **Step 2: Chạy, xác nhận đỏ** — `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao.spec.ts"` → FAIL 404 thủ tục không có.

- [ ] **Step 3: Contracts** — `thong-bao.contracts.ts`:

```ts
import { noiDungThongBao } from "@crm/validation/thong-bao";
import { z } from "zod";

export const dongThongBaoRa = z.object({
	id: z.string(),
	noiDung: noiDungThongBao,
	duongDan: z.string(),
	taoLuc: z.date(),
	daDoc: z.boolean(),
});
export type DongThongBaoRa = z.infer<typeof dongThongBaoRa>;
export const chuongOutput = z.object({ soChuaDoc: z.number().int(), dong: z.array(dongThongBaoRa) });
export const danhSachOutput = z.object({ dong: z.array(dongThongBaoRa), conTroSau: z.string().nullable() });
export const moMotOutput = z.object({ ok: z.literal(true) });
export const docHetOutput = z.object({ soDaDoc: z.number().int() });
```

- [ ] **Step 4: Service** — `thong-bao.service.ts`:

```ts
import type { Db } from "@crm/db";
import { THONG_BAO, parseNoiDungThongBao } from "@crm/validation/thong-bao";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type { DongThongBaoRa } from "./thong-bao.contracts";

const CHON = { id: true, noiDung: true, duongDan: true, taoLuc: true, docLuc: true } as const;

type HangThongBao = { id: string; noiDung: unknown; duongDan: string; taoLuc: Date; docLuc: Date | null };

function ra(h: HangThongBao): DongThongBaoRa {
	return { id: h.id, noiDung: parseNoiDungThongBao(h.noiDung), duongDan: h.duongDan, taoLuc: h.taoLuc, daDoc: h.docLuc !== null };
}

@Injectable()
export class ThongBaoService {
	private readonly logger = new Logger(ThongBaoService.name);

	constructor(@InjectDatabase() private readonly db: Db) {}

	async chuong(userId: string) {
		const [soChuaDoc, hang] = await Promise.all([
			this.db.thongBao.count({ where: { nguoiNhanId: userId, docLuc: null } }),
			this.db.thongBao.findMany({ where: { nguoiNhanId: userId }, orderBy: [{ taoLuc: "desc" }, { id: "desc" }], take: THONG_BAO.soTrenChuong, select: CHON }),
		]);
		return { soChuaDoc, dong: hang.map(ra) };
	}

	async danhSach(userId: string, chiChuaDoc: boolean, conTro: string | undefined) {
		const hang = await this.db.thongBao.findMany({
			where: { nguoiNhanId: userId, ...(chiChuaDoc ? { docLuc: null } : {}) },
			orderBy: [{ taoLuc: "desc" }, { id: "desc" }],
			take: THONG_BAO.moiTrang + 1,
			...(conTro ? { cursor: { id: conTro }, skip: 1 } : {}),
			select: CHON,
		});
		const coThem = hang.length > THONG_BAO.moiTrang;
		const trang = coThem ? hang.slice(0, THONG_BAO.moiTrang) : hang;
		return { dong: trang.map(ra), conTroSau: coThem ? (trang.at(-1)?.id ?? null) : null };
	}

	async moMot(userId: string, id: string, now: Date) {
		const hang = await this.db.thongBao.findFirst({ where: { id, nguoiNhanId: userId }, select: { moLuc: true, docLuc: true } });
		if (!hang) throw new NotFoundException(THONG_BAO.loi.khongCo);
		await this.db.thongBao.update({ where: { id }, data: { moLuc: hang.moLuc ?? now, docLuc: hang.docLuc ?? now } });
		this.logger.log({ message: "thong-bao.mo", userId });
		return { ok: true as const };
	}

	async docHet(userId: string, now: Date) {
		const { count } = await this.db.thongBao.updateMany({ where: { nguoiNhanId: userId, docLuc: null }, data: { docLuc: now } });
		this.logger.log({ message: "thong-bao.doc-het", userId, soDaDoc: count });
		return { soDaDoc: count };
	}
}
```

- [ ] **Step 5: Router + module** — `thong-bao.router.ts` theo khuôn `tin-hieu.router.ts`: `@Router({ alias: "thongBao" })`, `@UseMiddlewares(PhamViChungMiddleware)`, `TAG = ["Notifications"]`; `chuong` (`@Query`, `restMeta("GET", "/thong-bao/chuong", TAG)`), `danhSach` (`@Query`, input `danhSachInput`, `GET /thong-bao`), `moMot` (`@Mutation`, input `moMotInput`, `POST /thong-bao/{id}/mo`), `docHet` (`@Mutation`, không input, `POST /thong-bao/doc-het`); mỗi thủ tục gọi service với `ctx.user.id` và `new Date()`. Module: `imports: [TrpcModule]`, `providers: [ThongBaoService, ThongBaoRouter]`. `app.module.ts`: `import { ThongBaoModule } from "./thong-bao/thong-bao.module";` (giữ thứ tự chữ cái) và thêm `ThongBaoModule` cuối `imports`.

- [ ] **Step 6: Sinh kiểu** — `cd apps/api && bun run trpc:generate` (không sửa tay `src/generated/server.ts`).

- [ ] **Step 7: Ghim vai chỉ OKR** — `apps/api/test/vai-chi-okr.spec.ts`: thêm `"thongBao"` vào `ALIAS_CHO_PHEP` và mảng alias của ca `ghi-chung`; `DAU_VAO_HOP_LE` thêm `"thongBao.moMot": { id: "khong-co" }`, `"thongBao.docHet": {}`; `TU_PHUC_VU` thêm `"thongBao.moMot"`, `"thongBao.docHet"`; `SO_MUTATION_KHONG_DAU_VAO` tăng 1 (thêm `docHet`).

- [ ] **Step 8: Chạy xanh** — `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao.spec.ts test/vai-chi-okr.spec.ts"` → PASS. Phá thử (MEASURE-BIRTH): bản sao bỏ `nguoiNhanId` ở `docHet` → ô «danh dau het doi thong bao nguoi khac» đỏ; đổi middleware sang `AuthMiddleware` trần → ô vai okr đỏ. Hoàn lại.

- [ ] **Step 9: Commit** — `git add apps/api/src/thong-bao apps/api/src/app.module.ts apps/api/src/generated/server.ts apps/api/test/thong-bao.spec.ts apps/api/test/vai-chi-okr.spec.ts && git commit -m "feat(hop-thong-bao-tren-web): router thongBao — chuong, danh sach, mo mot, doc het"`

### Task 6: Chuông trên đầu trang và trang Thông báo

**independent:** false (cần Task 2, Task 5) · **phục vụ:** E4, E5, E6b, E7b, E8, E10 (câu), E10b, E15

**Files:**
- Modify: `apps/app/components/thong-bao/chuong-thong-bao.tsx` (thêm `ChuongThongBao` nối dữ liệu; giữ `ChuongThongBaoKhung`)
- Modify: `apps/app/components/thong-bao/trang-thong-bao.tsx` (giữ `TrangThongBaoThan`)
- Create: `apps/app/lib/thong-bao/dong.ts` (dựng `DongThongBao` từ `DongThongBaoRa`: câu, giờ, nhóm ngày VN, href có slug)
- Modify: `apps/app/lib/messages/thong-bao.ts` (thêm `cau` theo loại — vi/en)
- Create: `apps/app/app/(app)/[slug]/thong-bao/page.tsx`, `danh-sach-thong-bao-trang.tsx`, `khung-cho.tsx`, `thong-bao-search-params.ts`
- Modify: `apps/app/lib/search-param-keys.ts` (`thongBao: { loc: "loc" }`)
- Modify: `apps/app/components/app-header.tsx` (chèn `<ChuongThongBao />` trước `NutGuiTinHieu`)
- Modify: `apps/app/lib/trpc/cache.ts` (`thongBao: (options) => run([trpc.thongBao.chuong.queryKey()], [trpc.thongBao.danhSach.pathKey()], options)` + khai trong kiểu `CrmCache`)
- Test: `apps/app/test/thong-bao.dom.tsx`, `apps/app/test/thong-bao-mat-dich.dom.tsx`, `apps/app/test/thong-bao-cau.spec.ts` (mọi loại của `LOAI_THONG_BAO` có câu vi và en khác rỗng, không chứa `undefined`; dùng `MUC_MAU` của Task 1 qua đường tương đối `../../agent/test/support/muc-mau`; in số loại)

**Interfaces:**
- Consumes: `thongBao.*` (Task 5); `THONG_BAO`, `NoiDungThongBao`, `LOAI_THONG_BAO` (Task 2); `ChuongThongBaoKhung`, `TrangThongBaoThan`, `DanhSachNhomThongBao`, `DongThongBao` (đã có từ S1).
- Produces: `cauThongBao(locale: Locale, nd: NoiDungThongBao): string`; `dongTuRa(r: DongThongBaoRa, ctx: { locale; slug; now: Date }): DongThongBao`; `nhomTheoNgay(ds, ctx): NhomThongBao[]`.

- [ ] **Step 1: Test đỏ** — `apps/app/test/thong-bao.dom.tsx` theo khuôn `tin-hieu.dom.tsx` (mock `@/lib/trpc/client` bằng `truyVan`/`ghi`, `next/navigation` với `useParams: () => ({ slug: "ws" })`, `next/link`, `next-themes`; render trong `NuqsTestingAdapter hasMemory` › `QueryClientProvider` › `LocaleProvider` › `MobileNavProvider`). Ba khối `describe("chuong")`, `describe("trang")` viết đúng ma trận của E4, E5, E6b, E7b, E8: chuông qua `<AppHeader user={USER} />` cho ba vai × số {0, 1, 99, 100}; ca «hoi-lai» dùng đồng hồ giả của bun (`import { jest } from "bun:test"; jest.useFakeTimers()`), tiến `jest.advanceTimersByTime(THONG_BAO.hoiLaiMs)` (đọc từ hằng, không viết số) rồi `await act(...)`; `visibilitychange` phát trên `document` sau khi đặt `document.visibilityState` bằng `Object.defineProperty`. `thong-bao-mat-dich.dom.tsx`: render `PlanSheet`/`ViecSheet`/`ObjectiveSheet` với query trả lỗi `{ data: { code: "NOT_FOUND" } }` và `"FORBIDDEN"`, assert câu `karaBanGhiMessages("vi").khung.khongCon`/`khongQuyen` có mặt và không có `[data-slot=trang-loi-tam]`.

- [ ] **Step 2: Chạy, xác nhận đỏ** — lệnh `htb_chuong`, `htb_trang`, `htb_mat_dich` của `_acceptance/config.yaml`.

- [ ] **Step 3: Câu theo loại** — `lib/messages/thong-bao.ts` thêm `cau: { [loai in LoaiThongBao]: (nd) => string }` cho cả `en` và `vi`, dùng `dien()` với tham số của khuôn; kiểu `satisfies Record<LoaiThongBao, …>` để thiếu loại là lỗi biên dịch. Ví dụ vi:

```ts
"viec-qua-han": (nd) => dien("Việc «{tieuDe}» đã quá hạn {soNgay} ngày", { tieuDe: nd.tieuDe, soNgay: String(nd.soNgay ?? 0) }),
"tai-lieu-cho-duyet": (nd) => dien("{so} tài liệu đang chờ bạn duyệt", { so: String(nd.so) }),
"okr-tra-lai": (nd) => dien("Mục tiêu «{nhan}» bị trả lại: {lyDo}", { nhan: nd.nhan, lyDo: nd.lyDo }),
```

(đủ mọi loại của `LOAI_THONG_BAO`; chữ người nhập — `tieuDe`, `nhan`, `lyDo` — không dịch).

- [ ] **Step 4: Dựng dòng** — `lib/thong-bao/dong.ts`: giờ bằng `dateFormat(locale, { timeZone: NGAY_VN.muiGio, hour: "2-digit", minute: "2-digit" })`; ngày nhóm bằng `homNayVN` của `@crm/validation/ngay-vn`; «Hôm nay» khi `homNayVN(taoLuc) === homNayVN(now)`; trên chuông dòng «Trước đó» ghi `dd/MM, HH:mm`, trên trang ghi giờ trong nhóm ngày; `href = "/" + slug + duongDan` (không qua `workspaceUrl`, để trùng từng byte đường tin Zalo).

- [ ] **Step 5: Chuông nối dữ liệu** — `ChuongThongBao`: `useQuery({ ...trpc.thongBao.chuong.queryOptions(), refetchInterval: THONG_BAO.hoiLaiMs, refetchOnWindowFocus: true })`; `moMot` mutation gọi trong `onMo` (không chặn điều hướng của thẻ `a`), `onSuccess: () => void cache.thongBao()`; `docHet` mutation, lỗi → `toast.error(m.chuong.docHetLoi)`, thành công → `cache.thongBao()`; trạng thái `cho-tai`/`loi`/`xong` từ `isPending`/`isError`. Chèn vào `app-header.tsx` trước `<NutGuiTinHieu …>` (mọi vai).

- [ ] **Step 6: Trang** — `page.tsx` khuôn `tin-hieu/page.tsx` (`generateMetadata` từ `thongBaoMessages`, `PageShell` với tiêu đề + một câu mô tả, `Suspense` với `KhungChoThongBao`); khách dùng `useInfiniteQuery(trpc.thongBao.danhSach.infiniteQueryOptions({ chiChuaDoc }, { getNextPageParam: (t) => t.conTroSau ?? undefined }))`, lọc qua `useQueryState(SEARCH_PARAM.thongBao.loc, parseAsStringLiteral(["tat-ca", "chua-doc"]).withDefault("tat-ca"))`.

- [ ] **Step 7: Chạy xanh + thước thiết kế** — ba lệnh ở Step 2 PASS; `htb_thiet_ke` PASS (không P0); `cd apps/app && bun test test/proto-catalog.spec.ts` PASS. Phá thử từng chiều đỏ của E4, E5, E6b, E7b, E8, E10b (mỗi chiều một bản sao, ghim thông điệp), rồi hoàn lại.

- [ ] **Step 8: Commit** — `git add apps/app/components/thong-bao apps/app/lib/thong-bao apps/app/lib/messages/thong-bao.ts "apps/app/app/(app)/[slug]/thong-bao" apps/app/lib/search-param-keys.ts apps/app/components/app-header.tsx apps/app/lib/trpc/cache.ts apps/app/test/thong-bao.dom.tsx apps/app/test/thong-bao-mat-dich.dom.tsx && git commit -m "feat(hop-thong-bao-tren-web): chuong tren dau trang va trang Thong bao"`


### Task 7: Lệnh đối chiếu (đường đo)

**independent:** false (cần Task 3) · **phục vụ:** E12

**Files:**
- Create: `apps/agent/agent/lib/thong-bao-doi-chieu.ts` (`doiChieu(db, { tu: string; den: string }): Promise<KetQuaDoiChieu>`)
- Create: `apps/agent/scripts/thong-bao-doi-chieu.ts` (CLI: `--tu`, `--den`; đọc `DOI_CHIEU_DATABASE_URL`, KHÔNG đọc `DATABASE_URL`; `BEGIN READ ONLY` … `ROLLBACK` như `xem-truoc-luot-don.ts`; thiếu cờ → mã 2 gọi tên cờ; có mục mất → mã 1)
- Modify: `package.json` gốc (`"thong-bao:doi-chieu": "bun apps/agent/scripts/thong-bao-doi-chieu.ts"`), `packages/db/package.json` (`"./thong-bao-doi-chieu"`)
- Test: `apps/agent/test/thong-bao-doi-chieu.integration.spec.ts`

**Interfaces:**
- Produces: `KetQuaDoiChieu = { ngay: { ngay: string; nguoiCoLuot: number; coKenh: number; khongKenh: number; mucDaTinh: number; mucCoThongBao: number; mucMat: { userId: string; khoa: string }[]; luotThieuDanhSach: string[] }[]; nguoiCoThongBao: number; nguoiDaBamMo: number }`.

Luật đếm: mẫu số là `payload.mucTinh.muc` của mọi hàng `AgentTask` kind `nhac-ke-hoach` có subject mang ngày trong khoảng; hàng thiếu `mucTinh` vào `luotThieuDanhSach` và tính là mất; một mục «có thông báo» khi tồn tại `ThongBao` của người đó với `khoa = khoaThongBao(muc, …)` và `thayNgay >= ngay`. Có/không kênh đọc từ `outcome` (`khong-khop`/`khong-slack` = không kênh).

- [ ] **Step 1: Test đỏ** — đúng 7 ô của E12 (gieo ba ngày lượt nhắc THẬT bằng `lenLichNhac` + `chayNhac` với `setSystemTime`; ô 6 tiêm lỗi `ghiThongBao` cho một người không kênh qua `mock.module("@crm/db/thong-bao-ghi", …)` trong một ngày; ô 7 tạo một lượt bằng `lenLichNhac` rồi KHÔNG chạy `chayNhac`).
- [ ] **Step 2: Đỏ** → **Step 3: Viết** module + CLI → **Step 4: Xanh** `htb_doi_chieu`; phá thử «đếm mẫu số từ bảng ThongBao» và «bỏ qua hàng thiếu mucTinh» → ô 6, ô 7 đỏ ghim; hoàn lại.
- [ ] **Step 5: Commit** — `git add apps/agent/agent/lib/thong-bao-doi-chieu.ts apps/agent/scripts/thong-bao-doi-chieu.ts packages/db/package.json package.json apps/agent/test/thong-bao-doi-chieu.integration.spec.ts && git commit -m "feat(hop-thong-bao-tren-web): lenh doi chieu muc nhac voi thong bao"`

### Task 8: Phép đo màn thật (ui-check)

**independent:** false (cần Task 2–6) · **phục vụ:** E14

**Files:**
- Create: `_acceptance/hop-thong-bao-tren-web/rang/do-man.mjs` (puppeteer-core qua `createRequire`, như `_acceptance/lo-trinh-dong-bo-ho-so/rang/do-man.mjs`; chạy trong phiên đo của `scripts/lan-do/tien-de.mjs`)
- Create: `_acceptance/hop-thong-bao-tren-web/rang/gieo-thong-bao.ts` (trên kho đo: gỡ mọi kênh của người đo, tạo một Việc quá hạn và một mục OKR chờ duyệt qua đường ghi thật `@crm/db/viec-ghi` và service OKR, đặt đồng hồ 08:31 VN, gọi `lenLichNhac` + `chayNhac` thật)

- [ ] **Step 1** — viết `gieo-thong-bao.ts` và `do-man.mjs` theo ma trận 9 ô của E14; mỗi ô in `DUNG <canh>` hoặc `SAI <canh> — <lý do>`, chụp `evidence/<canh>.png` (nhớ gỡ `nextjs-portal`, `.tsqd-*`; mở chuông bằng bấm thật); dòng cuối `KET LUAN ma <0|1|2>`.
- [ ] **Step 2** — chạy `htb_do_man` (lệnh của config) qua khoá máy; mã 0. Phá thử: bản sao bỏ `ChuongThongBao` khỏi `app-header.tsx` → ô `chuong-*` SAI; hoàn lại.
- [ ] **Step 3: Commit** — `git add _acceptance/hop-thong-bao-tren-web/rang && git commit -m "test(hop-thong-bao-tren-web): do man that chuong va trang Thong bao"`

### Task 9: Kiểm toàn kho trước S4

**independent:** false · **phục vụ:** mọi eval (suite)

- [ ] **Step 1** — qua khoá máy: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`. Đỏ → sửa trong task gây ra, commit riêng.
- [ ] **Step 2** — đặt `status: implemented` trong `contract.md`, commit.
