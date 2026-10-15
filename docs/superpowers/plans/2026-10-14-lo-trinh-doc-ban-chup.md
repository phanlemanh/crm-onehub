# LT1c — Lộ trình đọc bản chụp: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub Actions đẩy khối dữ liệu lộ trình sang API bằng khoá «Đẩy lộ trình»; API giữ một bản chụp mỗi nguồn; trang Lộ trình đọc bản chụp khi nó mới hơn bản đang chạy và hiện giờ lấy theo múi giờ trình duyệt.

**Architecture:** Bảng `BanChupLoTrinh` (một hàng mỗi `nguon`) ghi qua router tRPC `loTrinhBanChup` lộ ra REST `POST /rest/lo-trinh/ban-chup`, chặn bằng middleware khoá máy (khuôn khoá chỉ-kéo của TH1). Trang gọi một hàm `docDauVaoChoVai` — đọc bản chụp trong `"use cache"`, chọn nguồn bằng hàm thuần `chonNguon`, lọc vai ngoài vùng cache. Kịch bản `scripts/ban-chup-lo-trinh/day.ts` chạy trong workflow mới; `do-tre.ts` đo độ trễ từ git + chú thích check-run.

**Tech Stack:** Bun 1.3, NestJS + nestjs-trpc + trpc-to-openapi, better-auth `@better-auth/api-key` (đã vá), Prisma 7, Next.js 16 (`cacheComponents`), zod, bun:test + supertest, puppeteer-core (đo màn).

**Spec:** `docs/superpowers/specs/2026-10-14-lo-trinh-doc-ban-chup-design.md` · hợp đồng `_acceptance/lo-trinh-doc-ban-chup/contract.md` (approved 14/10) · phép đo `_acceptance/lo-trinh-doc-ban-chup/evals.yaml`.

## Global Constraints

- **Điều kiện mở Task 2, 3, 8:** TH1 (`tin-hieu-tu-ve-kho`, PR #404) đã gộp `onehub`; gộp `onehub` vào nhánh, `bun install`, `cd packages/db && bun run db:generate`. Task 1, 4, 5, 6, 7 không chạm mã TH1 và làm được trước (bảng «Thứ tự và phụ thuộc» cuối tệp).
- Không viết chú thích trong mã (AGENTS.md). Hằng số chỉnh được sống ở một đối tượng cấu hình mỗi khu: `BAN_CHUP_LO_TRINH` (`packages/validation/src/ban-chup-lo-trinh.ts`) và `LO_TRINH` (`apps/app/lib/lo-trinh/cau-hinh.ts`).
- Phân tích ở biên bằng zod; không truyền `Record<string, unknown>`. Hỏng phân tích là lỗi thật có thông điệp.
- Không sửa `apps/app/lib/lo-trinh/doc-du-lieu.js`, `scripts/lo-trinh*.mjs` hay tệp chép từ kit — chỉ nhập.
- Thư mục kịch bản mới là `scripts/ban-chup-lo-trinh/` (không khớp `scripts/lo-trinh*.mjs`).
- Migration đặt mốc UTC THẬT lúc tạo (`date -u +%Y%m%d%H%M%S`), tên `<mốc>_ban_chup_lo_trinh`.
- Khoá `day-lo-trinh` đứng SAU khoá mặc định trong `apiKey([...])`, `enableSessionForAPIKeys: false`.
- Client component không nhập `@crm/db`/`@crm/auth`; trang máy chủ tính, thành phần khách hiển thị.
- Chữ máy viết có khoá vi + en trong `apps/app/lib/messages/lo-trinh.ts`; dữ liệu lộ trình không dịch (`translate="no"` như LT1).
- Lệnh chạm DB chạy qua `bun run test -- "<lệnh>"` (kho riêng mỗi lượt); không `bun test` trần ở gói chạm DB.
- `biome check --write` chỉ trên đúng tệp đã sửa.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: vật lành xanh, bản sao bị phá đỏ với thông điệp ghim (khuôn MEASURE-BIRTH-CLAUSE). Lượt phá-thử commit trước khi `git checkout` (bộ nhớ `pha-thu-phai-commit-truoc`).
- Việc nặng (`bun run test` cả kho, `git push`) bọc bằng `bash ~/.claude/projects/-Users-manhphan-dev-crm/khoa-may/chay-nang.sh "LT1c <việc>" …`.

## Review Focus

1. **Khối 216 KB qua cầu REST** — trpc-to-openapi có thể đặt trần thân mặc định; một lần gửi thật bị 413 sẽ làm đường đẩy chết im. Ca E1 dùng khối thật của cây qua cầu REST thật (Task 3, bước 1).
2. **Khoá mới bị phép đo đường-đọc-khoá của TH1 bắt** — `_acceptance/tin-hieu-tu-ve-kho/rang/duong-doc-khoa.mjs` đòi mọi chỗ đọc khoá có ô trong bảng; thêm hai dòng `mien` và ghim lại hồ sơ TH1 (Task 2, bước 6; Task 8).
3. **Lọc vai bị cache theo người xem đầu** — `"use cache"` không được ôm `choVaiXem`; ca «owner rồi member» (Task 4).
4. **Giờ lấy định dạng ở máy chủ** — production chạy UTC; dòng giờ là thành phần khách, máy chủ không in giờ (Task 5).
5. **Hai lượt gửi chạy đua** — ghi phải nguyên tử (`UPDATE … WHERE commitLuc < $moi`), tạo hàng đầu bắt `P2002` (Task 1).

---

### Task 1: Khuôn bản chụp, bảng dữ liệu, hàm đọc/ghi

independent: false · phục vụ E1, E8, E14

**Files:**
- Create: `packages/validation/src/ban-chup-lo-trinh.ts`
- Modify: `packages/validation/package.json` (exports `"./ban-chup-lo-trinh"`)
- Modify: `packages/db/prisma/schema.prisma` (model `BanChupLoTrinh`)
- Create: `packages/db/prisma/migrations/<mốc UTC>_ban_chup_lo_trinh/migration.sql`
- Create: `packages/db/src/ban-chup-lo-trinh.ts`
- Modify: `packages/db/package.json` (exports `"./ban-chup-lo-trinh"`)
- Test: `packages/validation/test/ban-chup-lo-trinh.spec.ts` (khuôn), các ca DB nằm ở Task 3 (`apps/api/test/ban-chup-lo-trinh.spec.ts`)

**Interfaces:**
- Produces:
  - `BAN_CHUP_LO_TRINH = { nguonCrm: "crm", tranThanByte: 2 * MB, ketQua: ["nhan","trung","cu-hon"] } as const`
  - `banChupVao` (zod): `{ nguon: z.literal("crm"), sha: /^[0-9a-f]{40}$/, commitLuc: z.iso.datetime({offset:true}), duLieu: z.unknown().superRefine(qua phanTichLoTrinh), canhBao: z.array(z.string()).max(20) }` → `type BanChupVao`
  - `banChupRa` = `z.object({ ketQua: z.enum(BAN_CHUP_LO_TRINH.ketQua) })`
  - `phanTichBanChupLuu(hang: { sha; commitLuc: Date; layLuc: Date; duLieu: unknown; canhBao: string[] }): { ok: true; banChup: BanChupDoc } | { ok: false; duongKhoa; thongDiep }` với `BanChupDoc = { sha: string; commitLuc: string; layLuc: string; duLieu: LoTrinhDuLieu; canhBao: string[] }`
  - `ghiBanChupLoTrinh(db: Db, vao: BanChupVao, now: Date): Promise<"nhan" | "trung" | "cu-hon">`
  - `docBanChupLoTrinh(db: Db, nguon: string): Promise<{ sha; commitLuc: Date; layLuc: Date; duLieu: unknown; canhBao: string[] } | null>`

- [ ] **Step 1: Viết test khuôn đỏ** — `packages/validation/test/ban-chup-lo-trinh.spec.ts`: khối rút từ `LO-TRINH.html` của cây bằng `docDuLieu` (nhập `../../../apps/app/lib/lo-trinh/doc-du-lieu.js`) → `banChupVao.safeParse({nguon:"crm", sha:"a".repeat(40), commitLuc:"2026-10-14T08:00:00+07:00", duLieu, canhBao:[]})` ok; ma trận hỏng h1–h4, h6 của E6 cho ra `issues[0].path` đúng chuỗi ghim (`duLieu.khuon`, `duLieu.lo_trinh`, `sha`, `commitLuc`, `duLieu.lo_trinh.0.hang.<i>.ma`); kết quả parse giữ khoá `tin_hieu` (không bị lột).
- [ ] **Step 2: Chạy, thấy đỏ** — `cd packages/validation && bun test test/ban-chup-lo-trinh.spec.ts` → FAIL «Cannot find module».
- [ ] **Step 3: Viết khuôn**

```ts
import { z } from "zod";
import { type LoTrinhDuLieu, phanTichLoTrinh } from "./lo-trinh-du-lieu";

const MB = 1024 * 1024;

export const BAN_CHUP_LO_TRINH = {
	nguonCrm: "crm",
	tranThanByte: 2 * MB,
	tranCanhBao: 20,
	ketQua: ["nhan", "trung", "cu-hon"],
} as const;

const duLieuLoTrinh = z.unknown().superRefine((gt, ctx) => {
	const kq = phanTichLoTrinh(gt);
	if (!kq.ok)
		ctx.addIssue({
			code: "custom",
			path: kq.duongKhoa.split(".").filter(Boolean),
			message: kq.thongDiep,
		});
});

export const banChupVao = z.object({
	nguon: z.literal(BAN_CHUP_LO_TRINH.nguonCrm),
	sha: z.string().regex(/^[0-9a-f]{40}$/),
	commitLuc: z.iso.datetime({ offset: true }),
	duLieu: duLieuLoTrinh,
	canhBao: z.array(z.string()).max(BAN_CHUP_LO_TRINH.tranCanhBao),
});
export type BanChupVao = z.infer<typeof banChupVao>;

export const banChupRa = z.object({
	ketQua: z.enum(BAN_CHUP_LO_TRINH.ketQua),
});
export type KetQuaBanChup = z.infer<typeof banChupRa>["ketQua"];

export type BanChupDoc = {
	sha: string;
	commitLuc: string;
	layLuc: string;
	duLieu: LoTrinhDuLieu;
	canhBao: string[];
};

export function phanTichBanChupLuu(hang: {
	sha: string;
	commitLuc: Date;
	layLuc: Date;
	duLieu: unknown;
	canhBao: string[];
}):
	| { ok: true; banChup: BanChupDoc }
	| { ok: false; duongKhoa: string; thongDiep: string } {
	const kq = phanTichLoTrinh(hang.duLieu);
	if (!kq.ok) return kq;
	return {
		ok: true,
		banChup: {
			sha: hang.sha,
			commitLuc: hang.commitLuc.toISOString(),
			layLuc: hang.layLuc.toISOString(),
			duLieu: kq.duLieu,
			canhBao: hang.canhBao,
		},
	};
}
```

  (Nếu zod của kho không có `z.iso.datetime`, dùng `z.string().datetime({ offset: true })` — xem `packages/validation/src/tin-hieu.ts` để theo cùng nếp.)
- [ ] **Step 4: Chạy, thấy xanh**; lượt phá-thử: bản sao bỏ `superRefine` → ca h2 đỏ với thông điệp ghim «khoi hong van duoc luu»; commit lượt phá-thử trước khi hoàn lại.
- [ ] **Step 5: Model + migration**

```prisma
model BanChupLoTrinh {
  nguon     String   @id
  sha       String
  commitLuc DateTime
  layLuc    DateTime
  duLieu    Json
  canhBao   String[]
}
```

  `M=$(date -u +%Y%m%d%H%M%S)`; `cd packages/db && bunx prisma migrate dev --create-only --name ban_chup_lo_trinh` (đổi tên thư mục sang mốc `$M` nếu Prisma đặt khác), soát SQL chỉ có `CREATE TABLE "BanChupLoTrinh"`. `bun run db:generate`.
- [ ] **Step 6: Hàm đọc/ghi** `packages/db/src/ban-chup-lo-trinh.ts`

```ts
import type { BanChupVao } from "@crm/validation/ban-chup-lo-trinh";
import type { Db } from "./client";
import { Prisma } from "./generated/prisma/client";

export async function docBanChupLoTrinh(db: Db, nguon: string) {
	return db.banChupLoTrinh.findUnique({
		where: { nguon },
		select: { sha: true, commitLuc: true, layLuc: true, duLieu: true, canhBao: true },
	});
}

export async function ghiBanChupLoTrinh(
	db: Db,
	vao: BanChupVao,
	now: Date,
): Promise<"nhan" | "trung" | "cu-hon"> {
	const commitLuc = new Date(vao.commitLuc);
	const duLieu = vao.duLieu as Prisma.InputJsonValue;
	const doi = await db.banChupLoTrinh.updateMany({
		where: { nguon: vao.nguon, commitLuc: { lt: commitLuc } },
		data: { sha: vao.sha, commitLuc, layLuc: now, duLieu, canhBao: vao.canhBao },
	});
	if (doi.count === 1) return "nhan";
	try {
		await db.banChupLoTrinh.create({
			data: { nguon: vao.nguon, sha: vao.sha, commitLuc, layLuc: now, duLieu, canhBao: vao.canhBao },
		});
		return "nhan";
	} catch (loi) {
		if (!(loi instanceof Prisma.PrismaClientKnownRequestError && loi.code === "P2002")) throw loi;
	}
	const hang = await db.banChupLoTrinh.findUniqueOrThrow({ where: { nguon: vao.nguon }, select: { sha: true } });
	return hang.sha === vao.sha ? "trung" : "cu-hon";
}
```

  `vao.duLieu as Prisma.InputJsonValue` là chỗ duy nhất ép kiểu: giá trị đã qua `banChupVao` ở biên API. Nếu lint:slop chặn ép kiểu, đổi `banChupVao.duLieu` sang `z.json()` + `superRefine` để `z.infer` ra kiểu JSON.
- [ ] **Step 7:** `bunx biome check --write` các tệp vừa sửa; `bun run check-types`.
- [ ] **Step 8: Commit** — `feat(lo-trinh-doc-ban-chup): khuôn bản chụp, bảng BanChupLoTrinh, hàm đọc ghi`.

Verify: `cd packages/validation && bun test test/ban-chup-lo-trinh.spec.ts` · `bun run check-types`.

---

### Task 2: Loại khoá «Đẩy lộ trình»

independent: false · phục vụ E4, E5, E16 · **chỉ sau khi TH1 #404 đã gộp onehub**

**Files:**
- Modify: `packages/auth/src/api-keys.ts` — `KHOA_DAY_LO_TRINH = { configId: "day-lo-trinh", quyen: { loTrinh: ["day"] } } as const`; `LOAI_KHOA_API = ["toan-quyen", "keo-tin-hieu", "day-lo-trinh"]`; `loaiKhoaTuConfig` trả `"day-lo-trinh"` cho configId đó; thêm `configTuLoai(loai)` nếu thu hồi cần (soát `revoke` của TH1).
- Modify: `packages/auth/src/auth.ts` — `API_KEY_DAY_LO_TRINH_OPTIONS = { ...API_KEY_PLUGIN_OPTIONS, configId: KHOA_DAY_LO_TRINH.configId, enableSessionForAPIKeys: false }`; `apiKey([API_KEY_PLUGIN_OPTIONS, API_KEY_KEO_TIN_HIEU_OPTIONS, API_KEY_DAY_LO_TRINH_OPTIONS])`.
- Create: `packages/auth/src/khoa-day-lo-trinh.ts` — `taoKhoaDayLoTrinh({userId,name,expiresIn})`, `xacMinhKhoaDayLoTrinh(key): Promise<{apiKeyId; userId} | null>` (chép đúng khuôn `khoa-keo-tin-hieu.ts`, đổi hằng).
- Modify: `packages/auth/src/index.ts` (xuất ba tên mới).
- Modify: `apps/api/src/api-keys/api-keys.service.ts` — `create`: `loai === "day-lo-trinh"` → chủ/quản trị mới tạo (`ForbiddenException` khác), gọi `taoKhoaDayLoTrinh`; `list` trả thêm `taoDuocDayLoTrinh: laQuanTriWorkspace(role)`; `revoke` đúng configId.
- Modify: `apps/api/src/api-keys/api-keys.contracts.ts` (`taoDuocDayLoTrinh: z.boolean()`).
- Modify: `apps/app/app/(app)/[slug]/settings/api-keys/{loai-khoa.tsx,to-tao-khoa.tsx,create-api-key-sheet.tsx}` + `apps/app/lib/messages/<tệp lời khoá API của TH1>` — thêm lựa chọn «Đẩy lộ trình» / «Roadmap push», khoá kèm một dòng lý do khi `taoDuocDayLoTrinh` false (cùng nếp lựa chọn chỉ-kéo của TH1).
- Modify: `_acceptance/tin-hieu-tu-ve-kho/rang/bang-duong-doc-khoa.json` — thêm vào `mien` hai dòng: `apps/api/src/trpc/middlewares/khoa-day-lo-trinh.middleware.ts` («cổng của đường đẩy bản chụp lộ trình — đo ở E4 của lo-trinh-doc-ban-chup») và `packages/auth/src/khoa-day-lo-trinh.ts` («hàm xác minh khoá đẩy lộ trình mà cổng trên gọi»).
- Test: `apps/app/test/khoa-api-loai.dom.tsx` (describe `day-lo-trinh`); ca máy chủ ở Task 3.

**Interfaces:**
- Produces: `KHOA_DAY_LO_TRINH`, `taoKhoaDayLoTrinh`, `xacMinhKhoaDayLoTrinh`, `LOAI_KHOA_API` có `"day-lo-trinh"`, `apiKeys.list().taoDuocDayLoTrinh`.

- [ ] **Step 1:** Viết describe `day-lo-trinh` trong `khoa-api-loai.dom.tsx` (E5): quản trị thấy và chọn được «Đẩy lộ trình», mutation nhận `loai: "day-lo-trinh"`; thành viên thấy lựa chọn bị khoá + dòng lý do (chữ rút từ tệp lời). Chạy → đỏ.
- [ ] **Step 2:** Sửa `packages/auth` (ba tệp + tệp mới) theo khuôn TH1.
- [ ] **Step 3:** Sửa service/contracts API.
- [ ] **Step 4:** Sửa giao diện + lời; chạy `config:executors.test.ldbc_khoa_ui` → xanh. Phá-thử: ẩn lựa chọn với thành viên → đỏ «lua chon bien mat thay vi khoa»; commit phá-thử, hoàn lại.
- [ ] **Step 5:** `cd apps/api && bun run trpc:generate` (sinh lại `src/generated/server.ts`), `bun run check-types`.
- [ ] **Step 6:** (Chỉ sau khi điều phối báo «đã gộp #404 → <sha>».) Thêm hai dòng `mien` vào bảng đường-đọc-khoá của TH1 — CHỈ sửa `_acceptance/tin-hieu-tu-ve-kho/rang/bang-duong-doc-khoa.json`, KHÔNG chạm `contract.md` hay `evidence-report.md` của TH1; chạy `bun _acceptance/tin-hieu-tu-ve-kho/rang/duong-doc-khoa.mjs` (sau Task 3, khi middleware đã có) → xanh. Ghi một dòng sổ `fix` (stage S3) nói vì sao chạm hồ sơ TH1.
- [ ] **Step 7: Commit** — `feat(lo-trinh-doc-ban-chup): loại khoá Đẩy lộ trình`.

Verify: `config:executors.test.ldbc_khoa_ui` · `bun run check-types`.

---

### Task 3: Đường nhận bản chụp ở API

independent: false · phục vụ E1, E4, E6, E8, E14, E16

**Files:**
- Create: `apps/api/src/lo-trinh/lo-trinh.module.ts`, `lo-trinh-ban-chup.router.ts`, `lo-trinh-ban-chup.service.ts`
- Create: `apps/api/src/trpc/middlewares/khoa-day-lo-trinh.middleware.ts`
- Modify: `apps/api/src/trpc/context.types.ts` (`KhoaDayLoTrinhContext = BaseTrpcContext & { khoaDayLoTrinh: { apiKeyId; userId; role } }`), `apps/api/src/trpc/trpc.module.ts` (providers + exports), `apps/api/src/app.module.ts` (imports `LoTrinhModule`)
- Modify: `apps/api/src/create-app.ts` — chỉ khi bước 2 cho thấy trần mặc định của cầu REST < `BAN_CHUP_LO_TRINH.tranThanByte`: `createOpenApiExpressMiddleware({ …, maxBodySize: BAN_CHUP_LO_TRINH.tranThanByte })`.
- Modify: `apps/api/test/vai-chi-okr.spec.ts` (khai `loTrinhBanChup.day` vào danh sách thủ tục ghim, ngoài tầm vai okr)
- Modify: `apps/api/src/generated/server.ts` (sinh lại)
- Test: `apps/api/test/ban-chup-lo-trinh.spec.ts` — describe `ldbc-day`, `ldbc-khoa`, `ldbc-hong`, `ldbc-thu-tu` đúng ma trận E1/E4/E6/E8/E14 (dựng app bằng `createApp`, phiên bằng `gieoThanhVien`/`mintPhien` của `./phien-thu`, gọi REST bằng supertest với `API_KEY_HEADER`; khối dữ liệu rút từ `LO-TRINH.html` của cây qua `docDuLieu`, KHÔNG viết tay).

**Interfaces:**
- Consumes: Task 1 (`banChupVao`, `banChupRa`, `ghiBanChupLoTrinh`, `docBanChupLoTrinh`), Task 2 (`xacMinhKhoaDayLoTrinh`).
- Produces: REST `POST /rest/lo-trinh/ban-chup` body `BanChupVao` → `{ ketQua }`; tRPC `loTrinhBanChup.day`.

- [ ] **Step 1: Viết spec đỏ** — bốn describe theo `evals.yaml` (E1 dòng 1–4 + E14; E4 ma trận 7 khoá + 3 đường khác + tạo khoá; E6 h1–h6 + đối chứng; E8 dòng 1–5). Hai ca chạy đua dùng `Promise.all` trên hai `request()`.
- [ ] **Step 2: Chạy** `bun run test -- "cd apps/api && bun test test/ban-chup-lo-trinh.spec.ts"` → đỏ «404». Ghi lại: một lần gửi khối thật có ra 413 không (đó là Review Focus 1).
- [ ] **Step 3: Middleware** — chép `khoa-keo-tin-hieu.middleware.ts`, đổi sang `xacMinhKhoaDayLoTrinh`, gán `ctx.khoaDayLoTrinh`.
- [ ] **Step 4: Router + service**

```ts
@Router({ alias: "loTrinhBanChup" })
@UseMiddlewares(KhoaDayLoTrinhMiddleware)
export class LoTrinhBanChupRouter {
	private readonly logger = new Logger(LoTrinhBanChupRouter.name);
	constructor(@Inject(LoTrinhBanChupService) private readonly banChup: LoTrinhBanChupService) {}

	@Mutation({
		input: banChupVao,
		output: banChupRa,
		meta: restMeta("POST", "/lo-trinh/ban-chup", ["Roadmap"]),
	})
	async day(@Ctx() ctx: KhoaDayLoTrinhContext, @Input() input: BanChupVao) {
		const ketQua = await this.banChup.ghi(input);
		this.logger.log({ message: "lo-trinh.ban-chup", apiKeyId: ctx.khoaDayLoTrinh.apiKeyId, sha: input.sha, ketQua });
		return { ketQua };
	}
}
```

  Service: `ghi(vao) { return ghiBanChupLoTrinh(this.db, vao, new Date()); }` (tiêm `Db` theo nếp các service khác). Nhật ký không ghi nội dung khối.
- [ ] **Step 5:** Nối module, `trpc:generate`, khai `vai-chi-okr.spec.ts`; nếu bước 2 thấy 413 thì đặt `maxBodySize`.
- [ ] **Step 6: Chạy spec** → xanh; `config:executors.test.gth_vai` → xanh. Ba lượt phá-thử của E1/E4/E8 (lột khoá; đặt cấu hình đẩy trước mặc định; ghi đè vô điều kiện) → mỗi lượt đỏ với thông điệp ghim; commit phá-thử, hoàn lại.
- [ ] **Step 7: Commit** — `feat(lo-trinh-doc-ban-chup): đường nhận bản chụp ở API`.

Verify: `config:executors.test.ldbc_day`, `ldbc_khoa`, `ldbc_hong`, `ldbc_thu_tu`, `gth_vai`.

---

### Task 4: Trang đọc bản chụp và chọn nguồn

independent: false · phục vụ E9, E11, E15

**Files:**
- Modify: `apps/app/lib/lo-trinh/cau-hinh.ts` — thêm `nhipLamMoiMs: 60_000`, `nguonCrm: "crm"`.
- Create: `apps/app/lib/lo-trinh/chon-nguon.ts` — hàm thuần.
- Create: `apps/app/lib/lo-trinh/doc-ban-chup.ts` — `docBanChupCrm()` máy chủ (`"use cache"`, `cacheLife({ revalidate: LO_TRINH.nhipLamMoiMs / 1000 })`, đọc `@crm/db/ban-chup-lo-trinh`, bắt lỗi kết nối → `{ kieu: "loi", lyDo }`).
- Modify: `apps/app/lib/lo-trinh/doc-trang.ts` — `DauVaoLoTrinh` nhánh `co-du-lieu` thêm `nguon: NguonLoTrinh`; thêm `docDauVaoChoVai(vai, { docBanChup, banDung, ghiCanhBao })`.
- Modify: `apps/app/app/(app)/[slug]/lo-trinh/page.tsx` — chỉ gọi `docDauVaoChoVai`.
- Modify: `apps/app/next.config.ts` — `env: { …, LO_TRINH_DUNG_LUC: new Date().toISOString() }`.
- Modify: `turbo.json` — thêm `"VERCEL_ENV"` vào `globalPassThroughEnv`.
- Test: `apps/app/test/lo-trinh-ban-chup.spec.ts` — describe `doc` (E9), `chon-nguon` (E11), `vai` (E15).

**Interfaces:**
- Consumes: Task 1 (`phanTichBanChupLuu`, `docBanChupLoTrinh`).
- Produces:

```ts
export type NguonLoTrinh = { kieu: "ban-chup" | "ban-dung"; layLuc: string };
export type BanDung = { sha: string | null; dungLuc: string; moiTruong: string | null };

export function chonNguon(
	banChup: { sha: string; commitLuc: string; layLuc: string } | null,
	banDung: BanDung,
): NguonLoTrinh {
	if (banChup === null || banDung.moiTruong === "preview")
		return { kieu: "ban-dung", layLuc: banDung.dungLuc };
	const cungSha = banDung.sha !== null && banChup.sha === banDung.sha;
	const sauDung = Date.parse(banChup.commitLuc) > Date.parse(banDung.dungLuc);
	return cungSha || sauDung
		? { kieu: "ban-chup", layLuc: banChup.layLuc }
		: { kieu: "ban-dung", layLuc: banDung.dungLuc };
}

export function banDungHienTai(): BanDung;
export async function docDauVaoChoVai(
	vai: WorkspaceRole | null,
	nguon: { docBanChup: () => Promise<KetQuaDocBanChup>; banDung: BanDung; ghiCanhBao: (o: { ca: string; lyDo: string }) => void },
): Promise<DauVaoLoTrinh>;
```

  `KetQuaDocBanChup = { kieu: "co"; banChup: BanChupDoc } | { kieu: "khong" } | { kieu: "loi"; lyDo: string } | { kieu: "hong"; lyDo: string }`. `docDauVaoChoVai`: đọc → `chonNguon` → bản chụp thì `{ kieu: "co-du-lieu", duLieu, canhBao, nguon }`, ngược lại `docTrangLoTrinh(docTepLoTrinh())` gắn `nguon` bản dựng → cuối cùng `choVaiXem(…, vai)`. Ca `loi`/`hong` gọi `ghiCanhBao` đúng một lần. Lọc vai luôn chạy SAU vùng cache.

- [ ] **Step 1: Viết spec đỏ** — `chon-nguon`: ma trận 12 ô viết trước bằng mảng ca + một assert mỗi ô; ca không có sha. `doc`: bốn ô với bộ đọc tiêm vào, tệp đóng gói thật của cây. `vai`: 4 vai × 2 nguồn + «owner rồi member» + kiểm tĩnh `page.tsx` chỉ gọi `docDauVaoChoVai` (đọc tệp, regex). Kiểm `next.config.ts` có `LO_TRINH_DUNG_LUC` và `turbo.json` có `VERCEL_ENV` (đọc tệp thật).
- [ ] **Step 2: Chạy** `cd apps/app && bun test ./test/lo-trinh-ban-chup.spec.ts` → đỏ.
- [ ] **Step 3:** Viết `chon-nguon.ts`, `doc-ban-chup.ts`, sửa `doc-trang.ts`, `cau-hinh.ts`, `page.tsx`, `next.config.ts`, `turbo.json`. Trong `page.tsx`, vùng `"use cache"` chỉ bọc `docBanChupCrm()` và đọc tệp đóng gói; `requireSession` + `workspaceRoleOf` + `docDauVaoChoVai` ở ngoài.
- [ ] **Step 4: Chạy** → xanh. Ba phá-thử (`>=` thay `>`; bỏ nhánh preview; lọc chỉ nhánh bản dựng) → đỏ với thông điệp ghim; commit phá-thử, hoàn lại.
- [ ] **Step 5:** `bun run check-types` và `bun run lint` → xanh (dựng app để Task 8 kiểm cả kho).
- [ ] **Step 6: Commit** — `feat(lo-trinh-doc-ban-chup): trang chọn bản chụp hay bản dựng`.

Verify: `config:executors.test.ldbc_doc`, `ldbc_chon`, `ldbc_vai`.

---

### Task 5: Dòng giờ lấy trên trang

independent: false · phục vụ E12, E13

**Files:**
- Create: `apps/app/components/lo-trinh/dong-gio-lay.tsx` (`"use client"`; props `{ nguon: NguonLoTrinh }` — kiểu khai lại trong tệp, không nhập từ tệp máy chủ)
- Modify: `apps/app/components/lo-trinh/noi-dung.tsx` (nhánh `co-du-lieu`: `<div className="flex flex-col gap-3"><DongGioLay nguon={dauVao.nguon} /><TrangLoTrinh … /></div>` theo đúng bản mẫu đã duyệt)
- Modify: `apps/app/lib/messages/lo-trinh.ts` — `gioLay: { capNhat: (luc) => …, banDung: "(bản dựng)" | "(build)" }` vi + en
- Modify: `apps/app/app/proto/_modules/lo-trinh-doc-ban-chup/index.tsx` — dùng `DongGioLay` thật thay bản vẽ trong bản mẫu, dữ liệu `NoiDungLoTrinh` có `nguon`
- Modify: `apps/app/app/proto/_modules/trang-lo-trinh-trong-crm/du-lieu.ts` và `ngan-ho-so-trong-lo-trinh/du-lieu.ts` (thêm `nguon` vào dữ liệu `co-du-lieu` cho khớp kiểu)
- Test: `apps/app/test/lo-trinh-ban-chup.dom.tsx` describe `dong-gio`

**Interfaces:**
- Consumes: `NguonLoTrinh` (Task 4, khai lại cùng hình trong thành phần khách).
- Produces: `DongGioLay` với `data-slot="gio-lay-lo-trinh"`.

```tsx
"use client";
import { useLocale } from "@crm/ui/components/locale-provider";
import { formatNgayGio } from "@crm/ui/lib/format";
import { useSyncExternalStore } from "react";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";

export type NguonHien = { kieu: "ban-chup" | "ban-dung"; layLuc: string };
const khongDoi = () => () => {};

export function DongGioLay({ nguon }: { nguon: NguonHien }) {
	const locale = useLocale();
	const m = loTrinhMessages(locale);
	const mui = useSyncExternalStore(khongDoi, () => Intl.DateTimeFormat().resolvedOptions().timeZone, () => null);
	if (mui === null) return null;
	const gio = formatNgayGio(nguon.layLuc, locale, { timeZone: mui, phan: "ngay-gio" });
	return (
		<p className="text-muted-foreground text-sm" data-slot="gio-lay-lo-trinh">
			{m.gioLay.capNhat(gio)}
			{nguon.kieu === "ban-dung" ? ` ${m.gioLay.banDung}` : null}
		</p>
	);
}
```

- [ ] **Step 1:** Viết `dong-gio` (E12) — chạy với `TZ=America/New_York`; 2 nguồn × 2 ngôn ngữ; `renderToString` không có `data-slot="gio-lay-lo-trinh"`. Chạy `config:executors.test.ldbc_dong` → đỏ.
- [ ] **Step 2:** Viết thành phần + lời + nối `noi-dung.tsx` + cập nhật dữ liệu bản mẫu. Chạy → xanh. Phá-thử (cố định `timeZone: "Asia/Ho_Chi_Minh"`) → đỏ «gio lay khong theo mui gio nguoi xem»; commit, hoàn lại.
- [ ] **Step 3:** `config:executors.script.ldbc_thiet_ke` → không P0; `cd apps/app && bun test test/proto-catalog.spec.ts` xanh; chạy lại `test/lo-trinh.dom.tsx` của LT1 (`ltc_hien`, `ltc_loc`) → xanh.
- [ ] **Step 4: Commit** — `feat(lo-trinh-doc-ban-chup): dòng giờ lấy theo múi giờ người xem`.

Verify: `config:executors.test.ldbc_dong`, `config:executors.script.ldbc_thiet_ke`, `ltc_hien`.

---

### Task 6: Kịch bản đẩy và workflow

independent: false · phục vụ E2, E7, E10

**Files:**
- Create: `scripts/ban-chup-lo-trinh/day.ts`
- Create: `scripts/ban-chup-lo-trinh/test/day.test.ts`
- Create: `.github/workflows/ban-chup-lo-trinh.yml`
- Modify: `.env.example` (ghi `CRM_KHOA_DAY_LO_TRINH` — bí mật GitHub Actions, app không đọc)

**Interfaces:**
- Consumes: `banChupVao`, `banChupRa`, `BAN_CHUP_LO_TRINH` (Task 1); `docDuLieu` (bộ đọc chép từ kit); `phanTichLoTrinh`.
- Produces: `export async function day(o: { goc: string; env: Record<string, string | undefined>; fetch: typeof fetch; sha: string; commitLuc: string; in: (dong: string) => void; loi: (dong: string) => void }): Promise<0 | 1>`; chạy trực tiếp (`import.meta.main`) đọc `GITHUB_SHA`, `git log -1 --format=%cI`, `process.env`.

```ts
const URL_DAY = "/rest/lo-trinh/ban-chup";
const TIEU_DE = "ban-chup-lo-trinh";
const ghiChu = (ketQua: string) => `::notice title=${TIEU_DE}::${ketQua}`;
```

  Luồng `day`: thiếu `CRM_API_URL` hay `CRM_KHOA_DAY_LO_TRINH` → in `ghiChu("chua-cai")`, trả 0, không gọi mạng. Đọc `LO-TRINH.html` → `docDuLieu` → null thì `loi(...)`, trả 1. `banChupVao.safeParse(...)` hỏng → trả 1 kèm đường khoá. `fetch(new URL(URL_DAY, CRM_API_URL), { method: "POST", headers: { "content-type": "application/json", "x-api-key": khoa }, body })` → lỗi mạng → 1; không 2xx → `loi` kèm thân trả về, trả 1; 2xx → `banChupRa.parse(json)` → in `ghiChu(ketQua)`, trả 0.

  Workflow:

```yaml
name: Bản chụp lộ trình
on:
  push:
    branches: [onehub]
    paths: [LO-TRINH.html]
  workflow_dispatch:
concurrency:
  group: ban-chup-lo-trinh
  cancel-in-progress: false
jobs:
  day:
    if: github.repository == 'phanlemanh/crm-onehub'
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 2
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version-file: package.json
      - run: bun install --frozen-lockfile --filter @crm/validation
        env:
          CRM_SKIP_HOOKS: "1"
      - run: bun scripts/ban-chup-lo-trinh/day.ts
        env:
          CRM_API_URL: ${{ secrets.CRM_API_URL }}
          CRM_KHOA_DAY_LO_TRINH: ${{ secrets.CRM_KHOA_DAY_LO_TRINH }}
```

  (Nếu `bun install --filter` không cài đủ cho `zod`, dùng `bun install --frozen-lockfile` với `CRM_SKIP_HOOKS=1` như workflow TH1.)

- [ ] **Step 1:** Viết `day.test.ts` — describe `day` (E2: máy chủ giả trả theo `banChupRa`, thân gửi đúng, ma trận 4 kết quả → đúng một dòng notice; đọc workflow bằng parser YAML `Bun.YAML`/`yaml` theo nếp test TH1), `ma-thoat` (E7 năm ô), `chua-cai` (E10 ba ô, đếm fetch = 0), `thu-tu` (E8 phần kịch bản: `cu-hon`/`trung` → 0). Chạy `bun test scripts/ban-chup-lo-trinh/test` → đỏ.
- [ ] **Step 2:** Viết `day.ts` + workflow + `.env.example`. Chạy → xanh. Ba phá-thử (cancel-in-progress true; nuốt lỗi fetch; thoát 2 khi thiếu khoá) → đỏ với thông điệp ghim; commit, hoàn lại.
- [ ] **Step 3: Commit** — `feat(lo-trinh-doc-ban-chup): GitHub Actions đẩy bản chụp lộ trình`.

Verify: `config:executors.test.ldbc_lenh`.

---

### Task 7: Lệnh đo độ trễ

independent: true · phục vụ E17

**Files:**
- Create: `scripts/ban-chup-lo-trinh/do-tre.ts`
- Create: `scripts/ban-chup-lo-trinh/test/do-tre.test.ts`
- Create: `scripts/ban-chup-lo-trinh/test/mau/gh-run-list.json`, `gh-annotations.json` (lưu từ một lần gọi `gh` thật trên kho: `gh run list --workflow acceptance.yml --json databaseId,headSha,status,conclusion,createdAt,updatedAt --limit 3` và `gh api repos/phanlemanh/crm-onehub/check-runs/<id>/annotations`; chỉ giữ khuôn trường, thay giá trị)

**Interfaces:**
- Produces: `export function tinhDoTre(o: { doi: { sha: string; commitLuc: string }[]; luot: { headSha: string; conclusion: string | null; updatedAt: string; ketQua: string | null }[]; nhipMs: number }): { dong: DongDo[]; ketLuan: "đạt" | "không đạt" }` với `DongDo = { sha; commitLuc; xongLuc: string | null; treMs: number | null; co: string[] }`; CLI `bun scripts/ban-chup-lo-trinh/do-tre.ts --tu <YYYY-MM-DD>` gọi `git log origin/onehub --first-parent --format=%H%x09%cI --since=<tu> -- LO-TRINH.html`, `gh run list --workflow ban-chup-lo-trinh.yml --json …`, `gh api …/check-runs/<id>/annotations` (lấy notice `ban-chup-lo-trinh`).

  Luật: lượt «đã đẩy» = conclusion `success` và `ketQua ∈ {nhan, trung}`; mỗi lần đổi ghép với lượt đã đẩy SỚM NHẤT có `commitLuc(lượt.headSha) ≥ commitLuc(lần đổi)` (phủ lần bị thế chỗ); trễ = `xongLuc − commitLuc + nhipMs`; cờ `"> 10 phút"` khi trễ > 10 phút; cờ `"> 1 giờ"` khi trễ > 1 giờ hoặc không có lượt; cờ `"không có lượt đẩy"` khi không có lượt; kết luận «đạt» khi không dòng nào có cờ.

- [ ] **Step 1:** Viết `do-tre.test.ts` với ma trận a–f của E17 + đối chứng. Chạy → đỏ.
- [ ] **Step 2:** Viết `do-tre.ts`. Chạy → xanh. Ba phá-thử (tính từ `createdAt`; coi mọi lượt xanh là đã đẩy; ghép chỉ theo `headSha`) → đỏ với thông điệp ghim; commit, hoàn lại.
- [ ] **Step 3: Commit** — `feat(lo-trinh-doc-ban-chup): lệnh đo độ trễ bản chụp`.

Verify: `config:executors.test.ldbc_lenh`.

---

### Task 8: Đo màn, tài liệu, kiểm cả kho

independent: false · phục vụ E3, E3b; dọn đường cho S4

**Files:**
- Create: `_acceptance/lo-trinh-doc-ban-chup/rang/do-man.mjs` (theo khuôn `_acceptance/gui-tin-hieu-trong-crm/rang/do-man.mjs`: chạy dưới `tieu-de-cot-doc-tron/rang/mot-luot.sh`, `tien-de.mjs` dựng kho đo riêng, `dev:session` cho chủ và một thành viên, puppeteer-core qua `createRequire`; bốn pha thứ tự cố định của E3; `emulateTimezone` cho hai ô New York; ảnh vào `BANG_CHUNG`; in dòng `KET LUAN` cuối với mã 0/1/2)
- Modify: `docs/api.md` (mục «Bản chụp lộ trình: Actions đẩy, CRM giữ bản mới nhất» — khoá thứ ba, thứ tự cấu hình, đường REST, luật cũ hơn/trùng, nhật ký không ghi nội dung)
- Modify: `docs/production.md` (workflow `ban-chup-lo-trinh.yml`, ba bước cài một lần của chủ kho, cách đọc ghi chú lượt)
- Modify: `_acceptance/lo-trinh-doc-ban-chup/contract.md` → `status: implemented` (việc cuối của S3)

- [ ] **Step 1:** Viết `do-man.mjs`; chạy `config:executors.script.ldbc_do_man` (tiền cảnh, Bash timeout 600000) → `KET LUAN` mã 0; soát 16 ảnh.
- [ ] **Step 2:** Phá-thử: `docBanChupCrm` trả `{kieu:"khong"}` cố định → pha 2 SAI «trang khong doc ban chup»; commit, hoàn lại.
- [ ] **Step 3:** Viết tài liệu.
- [ ] **Step 4:** Kiểm cả kho qua khoá máy: `bash ~/.claude/projects/-Users-manhphan-dev-crm/khoa-may/chay-nang.sh "LT1c kiểm cả kho" bash -c 'bun run test && bun run check-types && bun run lint && bun run lint:slop && bun run build'` → xanh. Chạy `bun _acceptance/tin-hieu-tu-ve-kho/rang/duong-doc-khoa.mjs` → xanh.
- [ ] **Step 5:** Đặt `status: implemented`; commit — `feat(lo-trinh-doc-ban-chup): đo màn, tài liệu; hợp đồng implemented`.
- [ ] **Step 6:** Ghim lại hồ sơ TH1 (`tin-hieu-tu-ve-kho`) bị chạm ở Task 2 bước 6 bằng làn ghim lại tại HEAD (`repin-lane.mjs --root . --slug tin-hieu-tu-ve-kho --reason "LT1c thêm hai chỗ miễn vào bảng đường đọc khoá" --write`) qua khoá máy — trước S5, sau khi S4 xanh, để chỉ ghim một lần trên đỉnh cuối. Trước khi đẩy: `scripts/pre-merge-check.sh . --base origin/onehub` KHÔNG kèm `--slug`, để bắt mọi hồ sơ khác bị kéo vào diff.

Verify: `config:executors.script.ldbc_do_man` · bộ năm lệnh chứng của kho.

---

## Thứ tự và phụ thuộc

| Task | Cần trước | Chạy được trước khi TH1 gộp |
|---|---|---|
| 1 Khuôn + bảng | — | có |
| 2 Loại khoá | TH1 #404 gộp, Task 1 | không |
| 3 Đường nhận API | 1, 2 | không |
| 4 Trang chọn nguồn | 1 | có (không chạm khoá) |
| 5 Dòng giờ lấy | 4 | có |
| 6 Kịch bản đẩy | 1 | có |
| 7 Lệnh đo | — | có |
| 8 Đo màn + tài liệu + kiểm kho | 1–7 | không |

Task 1, 4, 5, 6, 7 không đụng mã TH1 nên làm được ngay sau Gate 1.5, trước lô 12:00Z; Task 2, 3, 8 chờ #404.
