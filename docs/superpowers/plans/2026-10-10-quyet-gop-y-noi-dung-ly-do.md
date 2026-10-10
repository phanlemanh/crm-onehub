# K3c — Quyết góp ý bị từ chối vì lý do cố định thì hiện đúng lý do: kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `okr.troLyQuyet` trả `{ ok: false, lyDo }` với chín mã lý do cố định có tên (bốn mã quyền và chu kỳ giữ lỗi HTTP — đơn P1-55, ngả C); app hiện câu của mã theo ngôn ngữ
trang thay cho câu «thử lại sau ít phút».

**Architecture:** Tập mã khai một chỗ ở `packages/validation/src/okr-tro-ly.ts`. Máy chủ bắt lỗi NGOÀI `$transaction`
(giao dịch đã huỷ, góp ý vẫn `cho`), đổi `BadRequestException`/`ForbiddenException` có thông điệp đúng một hằng `T.*`
thành mã, mọi lỗi khác ném lại. App đọc mã, lấy câu từ bản đồ `loiQuyet` vi/en; lý do «chưa sẵn sàng» và lỗi 5xx giữ
đường K3.

**Tech Stack:** NestJS + nestjs-trpc, Prisma, Zod, React 19 + TanStack Query, `bun test` (jsdom cho DOM).

**Spec:** `docs/superpowers/specs/2026-10-10-quyet-gop-y-noi-dung-ly-do-design.md` · hợp đồng
`_acceptance/quyet-gop-y-noi-dung-ly-do/contract.md` (AC-1…AC-8) · `evals.yaml` (E1…E8).

## Global Constraints

- Không viết chú thích trong code, kể cả code sửa.
- Ranh giới hàng K3c (`hang-viec.json`): `gop-y-kara.ts`, `lib/messages/okr-gop-y.ts`, `apps/app/test/gop-y-dung-cho*`,
  `apps/app/test/khung-gop-y*`, `_acceptance/quyet-gop-y-noi-dung-ly-do/**`, `tro-ly.service.ts`, `okr.contracts.ts`,
  `packages/validation/src/okr-tro-ly.ts`, `apps/api/test/quyet-gop-y-noi-dung-ly-do.spec.ts`, `_acceptance/config.yaml`,
  `docs/api.md`, design doc, kế hoạch này; cộng `PRODUCT-MAP.md`, `LO-TRINH.html`. Tệp khác → xin `cham-tep` trước.
- `okr-tro-ly.ts` và `config.yaml` chỉ thêm dòng. `tro-ly.service.ts` chỉ đổi thân `troLyQuyet`, hàm
  `lyDoKhongQuyetCua`, bảng `CAU_CUA_LY_DO_KHONG_QUYET`, dòng import. `okr.contracts.ts` chỉ đổi khối
  `troLyQuyetOutput` và dòng import.
- Chuỗi mã chỉ xuất hiện ở `okr-tro-ly.ts`, ở bảng ánh xạ của `tro-ly.service.ts` và ở bản đồ câu của `okr-gop-y.ts`; hai
  tệp sau khoá bằng `satisfies Record<LyDoKhongQuyet, …>`.
- Câu vi/en lấy NGUYÊN VĂN từ bảng «Câu cho người dùng» của design doc.
- Phân tích ở biên bằng Zod; không truyền `Record<string, unknown>`.
- Bài DOM so chuỗi nguyên thuỷ (luật 35); lần chạy đầu của tệp DOM mới có trần thời gian và đo RSS.
- Commit kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Mã đúng nhưng thông điệp của exception khác hằng một ký tự (hằng có tham số như `T.chuKy.daBo(ten)`) → không thành
   mã, rơi về câu thử lại. Bảng chỉ chứa hằng chuỗi; ca E1 bắt nếu một hằng ném thật khác hằng trong bảng.
2. Lỗi ném TRƯỚC `$transaction` (không có) và lỗi ném SAU `updateMany` (trong `ghiTheoDong`) phải cùng ra `cho` — E1 đọc
   lại `trangThai` cho mọi ca, E8 (b) ghim.
3. `lyDo` lạ từ máy chủ cũ hơn app (mã chưa có câu) → `laLyDoKhongQuyet` false → đường «chưa sẵn sàng» như K3, không
   `undefined` trên màn. Task 2 bước 1 có ca `lyDo: "ma-chua-co"`.
4. Câu Căn chỉnh dài xuống dòng — đã nhận hạn chế (entry «bỏ ui-observed»), không đo ở vòng này.
5. Hai lần quyết liền trên cùng góp ý lỗi cố định: lần hai vẫn đúng câu, không cộng dồn, không đọc lại `troLySanSang` —
   Task 2 bước 1 ca `k3c-san-sang (1)` bấm hai lần.

---

### Task 1: Tập mã, hợp đồng tRPC, máy chủ trả mã (E1, E2)

**Files:**
- Modify: `packages/validation/src/okr-tro-ly.ts` (thêm cuối tệp)
- Modify: `apps/api/src/okr/okr.contracts.ts:30-42` (import), `:165-168` (`troLyQuyetOutput`)
- Modify: `apps/api/src/okr/tro-ly.service.ts` (import `@crm/validation/okr-tro-ly` dòng 52-58; bảng + hàm sau `const T`
  dòng 103; thân `troLyQuyet` dòng 548-603)
- Modify: `docs/api.md:1093-1102` (đoạn `troLyQuyet`)
- Create: `apps/api/test/quyet-gop-y-noi-dung-ly-do.spec.ts`

**Verify:** `bun run test -- "cd apps/api && bun test test/quyet-gop-y-noi-dung-ly-do.spec.ts"` · Evals: E1, E2 ·
Independent: không (Task 2, 3 dùng `LY_DO_KHONG_QUYET`, `CAU_CUA_LY_DO_KHONG_QUYET`).

**Interfaces:**
- Produces: `LY_DO_KHONG_QUYET` (tuple 9 chuỗi), `type LyDoKhongQuyet`, `lyDoKhongQuyet` (`z.enum`),
  `laLyDoKhongQuyet(lyDo: string): lyDo is LyDoKhongQuyet` — từ `@crm/validation/okr-tro-ly`.
- Produces: `CAU_CUA_LY_DO_KHONG_QUYET: Record<LyDoKhongQuyet, readonly string[]>` và
  `lyDoKhongQuyetCua(loi: unknown): LyDoKhongQuyet | null` — xuất từ `apps/api/src/okr/tro-ly.service.ts`.
- Produces: `TroLyQuyetOutput` nhánh `ok: false` có `lyDo: LyDoKhongSanSang | LyDoKhongQuyet`.

- [ ] **Step 1: Thêm tập mã (cần cho bài kiểm biên dịch)**

Cuối `packages/validation/src/okr-tro-ly.ts`:

```ts
export const LY_DO_KHONG_QUYET = [
	"ky-da-an",
	"ky-da-khoa",
	"muc-tieu-da-bo",
	"dang-cho-duyet",
	"khong-sua-duoc-kr",
	"khong-sua-duoc-don-vi",
	"so-sai-kieu",
	"can-chinh-gioi-han",
	"can-chinh-chinh-no",
	"can-chinh-cung-cap",
	"can-chinh-chua-cong-bo",
	"can-chinh-khac-chu-ky",
	"can-chinh-da-gan",
] as const;

export type LyDoKhongQuyet = (typeof LY_DO_KHONG_QUYET)[number];

export const lyDoKhongQuyet = z.enum(LY_DO_KHONG_QUYET);

export function laLyDoKhongQuyet(lyDo: string): lyDo is LyDoKhongQuyet {
	return lyDoKhongQuyet.safeParse(lyDo).success;
}
```

- [ ] **Step 2: Chọn người xem-không-sửa của bộ mẫu**

Hai ca `khong-sua-duoc-*` cần một người XEM được `q4-kd-bac-1` (để không ra `NOT_FOUND`) nhưng không sửa được Mục tiêu và
không phụ trách KR nào của nó. Ứng viên: thành viên cùng khối không làm trưởng. Kiểm bằng một lượt gọi thật trong bài
(bước 3 có ca `nguoi-xem-dung` chạy trước ma trận): `okr.objective` với cookie người đó trả 200 và `okr.access` không có
khối/phòng của `q4-kd-bac-1` trong `headOf`. Tên người ghi vào hằng `NGUOI_XEM` của tệp kiểm; ca `nguoi-xem-dung` đỏ thì
đổi người, không đổi phép đo.

- [ ] **Step 3: Viết bài kiểm API (đỏ)**

`apps/api/test/quyet-gop-y-noi-dung-ly-do.spec.ts`:

```ts
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db, Prisma } from "@crm/db";
import {
	LY_DO_KHONG_QUYET,
	type DongGopY,
	type LyDoKhongQuyet,
} from "@crm/validation/okr-tro-ly";
import { BadRequestException } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { OKR } from "../src/okr/okr-config";
import { lyDoKhongQuyetCua } from "../src/okr/tro-ly.service";
import {
	batDauMau,
	CHO_DB,
	CHO_MA_TRAN,
	dongMau,
	dungUngDung,
	ghiCauHinh,
	gieoDong,
	goi,
	ketThucMau,
	kr,
	mt,
	NAC_CAU_HINH,
	phienMau,
	tienDongHo,
} from "./tro-ly-okr-san";

const T = OKR.thongDiep;
const MT = mt("q4-kd-bac-1");
const K2 = kr("q4-kd-bac-1-k2");
const DICH = mt("n2");
const MT_KHAC_KY = mt("q3-kd-bac");
const TRUONG = "nguyen-thi-lan";
const NGUOI_XEM = "<tên chọn ở bước 2>";

let app: NestExpressApplication;
let cookieTruong = "";
let cookieXem = "";

type TraLai = () => Promise<void>;
type Ca = {
	ma: LyDoKhongQuyet;
	dong: () => Promise<DongGopY>;
	cach: "nhan" | "sua";
	giaTri?: string;
	cookie: () => string;
	dat: (deXuatId: string) => Promise<TraLai>;
};

async function doiMucTieu(
	id: string,
	data: Pick<Prisma.OkrObjectiveUncheckedUpdateInput, "status" | "hienThi" | "level" | "cycleId">,
): Promise<TraLai> {
	const cu = await db.okrObjective.findUniqueOrThrow({
		where: { id },
		select: { status: true, hienThi: true, level: true, cycleId: true },
	});
	await db.okrObjective.update({ where: { id }, data });
	return async () => {
		await db.okrObjective.update({ where: { id }, data: cu });
	};
}

async function doiChuKy(
	data: Pick<Prisma.OkrCycleUncheckedUpdateInput, "phase" | "anLuc">,
): Promise<TraLai> {
	const { cycleId } = await db.okrObjective.findUniqueOrThrow({
		where: { id: MT },
		select: { cycleId: true },
	});
	const cu = await db.okrCycle.findUniqueOrThrow({
		where: { id: cycleId },
		select: { phase: true, anLuc: true },
	});
	await db.okrCycle.update({ where: { id: cycleId }, data });
	return async () => {
		await db.okrCycle.update({ where: { id: cycleId }, data: cu });
	};
}

async function doiKr(
	data: Pick<Prisma.OkrKeyResultUncheckedUpdateInput, "kind" | "startValue" | "targetValue">,
): Promise<TraLai> {
	const cu = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: K2 },
		select: { kind: true, startValue: true, targetValue: true },
	});
	await db.okrKeyResult.update({ where: { id: K2 }, data });
	return async () => {
		await db.okrKeyResult.update({ where: { id: K2 }, data: cu });
	};
}

const vietLaiTen = async () => {
	const { title } = await db.okrObjective.findUniqueOrThrow({ where: { id: MT }, select: { title: true } });
	return dongMau({ loai: "viet-lai", objectiveId: MT, truong: "title", truoc: title, sau: `${title} rõ hơn` });
};
const vietLaiKr = async () => {
	const { title } = await db.okrKeyResult.findUniqueOrThrow({ where: { id: K2 }, select: { title: true } });
	return dongMau({ loai: "viet-lai", objectiveId: MT, keyResultId: K2, truong: "kr.title", truoc: title, sau: `${title}, rõ từng tuần` });
};
const canChinh = async () =>
	dongMau({ loai: "can-chinh", objectiveId: MT, targetObjectiveId: DICH, lyDo: "Mục tiêu này góp vào giao đúng hẹn." });

const MA_TRAN: readonly Ca[] = [
	{ ma: "ky-da-an", dong: vietLaiTen, cach: "nhan", cookie: () => cookieTruong, dat: () => doiChuKy({ anLuc: new Date() }) },
	{ ma: "ky-da-khoa", dong: vietLaiTen, cach: "nhan", cookie: () => cookieTruong, dat: () => doiChuKy({ phase: "cham-diem" }) },
	{ ma: "muc-tieu-da-bo", dong: vietLaiTen, cach: "nhan", cookie: () => cookieTruong, dat: () => doiMucTieu(MT, { status: "da-bo" }) },
	{ ma: "dang-cho-duyet", dong: vietLaiTen, cach: "nhan", cookie: () => cookieTruong, dat: () => doiMucTieu(MT, { status: "cho-duyet" }) },
	{ ma: "khong-sua-duoc-kr", dong: vietLaiKr, cach: "nhan", cookie: () => cookieXem, dat: async () => async () => {} },
	{ ma: "khong-sua-duoc-don-vi", dong: vietLaiTen, cach: "nhan", cookie: () => cookieXem, dat: async () => async () => {} },
	{ ma: "so-sai-kieu", dong: vietLaiKr, cach: "nhan", cookie: () => cookieTruong, dat: () => doiKr({ kind: "tang-toi", startValue: 100, targetValue: 10 }) },
	{ ma: "can-chinh-gioi-han", dong: canChinh, cach: "nhan", cookie: () => cookieTruong, dat: () => doiMucTieu(MT, { hienThi: "gioi-han" }) },
	{
		ma: "can-chinh-chinh-no",
		dong: canChinh,
		cach: "nhan",
		cookie: () => cookieTruong,
		dat: async (id) => {
			await db.okrDeXuat.update({ where: { id }, data: { targetObjectiveId: MT } });
			return async () => {};
		},
	},
	{
		ma: "can-chinh-cung-cap",
		dong: canChinh,
		cach: "nhan",
		cookie: () => cookieTruong,
		dat: async () => {
			const { level } = await db.okrObjective.findUniqueOrThrow({ where: { id: MT }, select: { level: true } });
			return doiMucTieu(DICH, { level });
		},
	},
	{ ma: "can-chinh-chua-cong-bo", dong: canChinh, cach: "nhan", cookie: () => cookieTruong, dat: () => doiMucTieu(DICH, { status: "nhap" }) },
	{
		ma: "can-chinh-khac-chu-ky",
		dong: canChinh,
		cach: "nhan",
		cookie: () => cookieTruong,
		dat: async () => {
			const { cycleId } = await db.okrObjective.findUniqueOrThrow({ where: { id: MT_KHAC_KY }, select: { cycleId: true } });
			return doiMucTieu(DICH, { cycleId });
		},
	},
	{
		ma: "can-chinh-da-gan",
		dong: canChinh,
		cach: "nhan",
		cookie: () => cookieTruong,
		dat: async () => {
			const lk = await db.okrAlignment.create({ data: { objectiveId: MT, targetObjectiveId: DICH } });
			return async () => {
				await db.okrAlignment.delete({ where: { id: lk.id } });
			};
		},
	},
];

async function okrCua() {
	const [m, k, lk] = await Promise.all([
		db.okrObjective.findUniqueOrThrow({ where: { id: MT }, select: { title: true, whyNow: true } }),
		db.okrKeyResult.findUniqueOrThrow({ where: { id: K2 }, select: { title: true } }),
		db.okrAlignment.count({ where: { objectiveId: MT } }),
	]);
	return JSON.stringify([m.title, m.whyNow, k.title, lk]);
}

function quyet(deXuatId: string, ca: Pick<Ca, "cach" | "giaTri">, cookie: string) {
	tienDongHo();
	return goi(app, "okr.troLyQuyet", "mutation", { deXuatId, cach: ca.cach, giaTri: ca.giaTri }, cookie);
}

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	cookieTruong = await phienMau(TRUONG);
	cookieXem = await phienMau(NGUOI_XEM);
	await ghiCauHinh(app, await phienMau("le-hai-dang"), NAC_CAU_HINH.bat);
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

describe("k3c-ma-tran", () => {
	test("k3c-ma-tran nguoi-xem-dung: NGUOI_XEM xem duoc muc tieu", async () => {
		const tra = await goi(app, "okr.objective", "query", { id: MT }, cookieXem);
		expect(tra.status, `nguoi xem: status ${tra.status}`).toBe(200);
	}, CHO_DB);

	test("k3c-ma-tran moi ly do co dinh tra { ok: false, lyDo }, gop y van cho, okr khong doi", async () => {
		expect(MA_TRAN.map((c) => c.ma)).toEqual([...LY_DO_KHONG_QUYET]);
		expect(MA_TRAN.length).toBe(9);
		const lech: string[] = [];
		for (const ca of MA_TRAN) {
			const [id] = await gieoDong(MT, null, [await ca.dong()]);
			if (!id) throw new Error(`${ca.ma}: gieo khong ra dong`);
			const traLai = await ca.dat(id);
			try {
				const truoc = await okrCua();
				const tra = await quyet(id, ca, ca.cookie());
				const sau = await okrCua();
				const { trangThai } = await db.okrDeXuat.findUniqueOrThrow({ where: { id }, select: { trangThai: true } });
				const data = tra.data;
				const dung = tra.status === 200 && JSON.stringify(data) === JSON.stringify({ ok: false, lyDo: ca.ma });
				if (!dung) lech.push(`${ca.ma}: ok=${tra.status} lyDo=${JSON.stringify(data ?? tra.loi)}`);
				if (trangThai !== "cho") lech.push(`${ca.ma}: gop y khong con cho (trangThai=${trangThai})`);
				if (sau !== truoc) lech.push(`${ca.ma}: okr da doi`);
			} finally {
				await traLai();
				await db.okrDeXuat.update({ where: { id }, data: { trangThai: "bo-qua" } });
			}
		}
		expect(lech, lech.join("\n")).toEqual([]);
	}, CHO_MA_TRAN);
});

describe("k3c-ngoai", () => {
	test("k3c-ngoai bay ca loi ngoai tap giu duong cu", async () => {
		const lech: string[] = [];
		const ca = (ten: string, dung: boolean, thatTe: string) => {
			if (!dung) lech.push(`k3c-ngoai ${ten}: ${thatTe}`);
		};
		let so = 0;

		const khong = await quyet("clx0000khongco", { cach: "nhan" }, cookieTruong);
		ca("khong-co", khong.status === 404, `${khong.status} ${JSON.stringify(khong.data)}`);
		so++;

		const [daQuyet] = await gieoDong(MT, null, [await vietLaiTen()]);
		if (!daQuyet) throw new Error("gieo da-quyet");
		await db.okrDeXuat.update({ where: { id: daQuyet }, data: { trangThai: "bo-qua" } });
		const xung = await quyet(daQuyet, { cach: "nhan" }, cookieTruong);
		ca("da-quyet", xung.status === 409, `${xung.status} ${JSON.stringify(xung.data)}`);
		so++;

		const [hoi] = await gieoDong(MT, null, [dongMau({ loai: "hoi", objectiveId: MT, maVanDe: "khong-do-duoc", lyDo: "Câu hỏi giúp làm rõ cách đo." })]);
		if (!hoi) throw new Error("gieo hoi");
		const cach = await quyet(hoi, { cach: "sua", giaTri: "x" }, cookieTruong);
		ca("cach-khong-hop", cach.status === 400 && cach.loi.includes(T.troLy.cachKhongHop), `${cach.status} ${cach.loi}`);
		so++;

		const [hong] = await gieoDong(MT, null, [await vietLaiTen()]);
		if (!hong) throw new Error("gieo hong");
		await db.okrDeXuat.update({ where: { id: hong }, data: { loai: "loai-khong-co" } });
		const loi500 = await quyet(hong, { cach: "nhan" }, cookieTruong);
		const { trangThai } = await db.okrDeXuat.findUniqueOrThrow({ where: { id: hong }, select: { trangThai: true } });
		ca("hang-hong", loi500.status === 500 && trangThai === "cho", `${loi500.status} ${trangThai}`);
		so++;

		ca("cau-la", lyDoKhongQuyetCua(new BadRequestException("cau la")) === null, "khong null");
		so++;
		ca("error-cung-cau", lyDoKhongQuyetCua(new Error(T.canChinh.chuaCongBo)) === null, "khong null");
		so++;
		ca(
			"prisma",
			lyDoKhongQuyetCua(new Prisma.PrismaClientKnownRequestError(T.canChinh.daGan, { code: "P2002", clientVersion: "test" })) === null,
			"khong null",
		);
		so++;

		for (const t of [khong, xung, cach, loi500])
			if (JSON.stringify(t.data).includes('"ok":false')) lech.push(`k3c-ngoai tra ok:false: ${JSON.stringify(t.data)}`);
		expect(so).toBe(7);
		expect(lech, lech.join("\n")).toEqual([]);
	}, CHO_DB);
});
```

Cột `loai` của `okrDeXuat` là chuỗi tự do
ở CSDL; `dongTuHang` phân tích nó bằng Zod nên `loai-khong-co` ném lỗi Zod trong giao dịch.

- [ ] **Step 4: Chạy để thấy đỏ**

Run: `bun run test -- "cd apps/api && bun test test/quyet-gop-y-noi-dung-ly-do.spec.ts"`
Expected: FAIL — biên dịch: `lyDoKhongQuyetCua` không có trong `tro-ly.service`.

- [ ] **Step 5: Hợp đồng tRPC**

`apps/api/src/okr/okr.contracts.ts`: thêm `lyDoKhongQuyet,` vào khối import `@crm/validation/okr-tro-ly` (ngay trước
`lyDoKhongSanSang,`), rồi:

```ts
export const troLyQuyetOutput = z.discriminatedUnion("ok", [
	z.object({ ok: z.literal(true) }),
	z.object({
		ok: z.literal(false),
		lyDo: z.union([lyDoKhongSanSang, lyDoKhongQuyet]),
	}),
]);
```

- [ ] **Step 6: Bảng ánh xạ, hàm thuần, bắt lỗi ngoài giao dịch**

`tro-ly.service.ts` — import thêm `LY_DO_KHONG_QUYET, type LyDoKhongQuyet` vào khối `@crm/validation/okr-tro-ly`. Sau
`const T = OKR.thongDiep;`:

```ts
export const CAU_CUA_LY_DO_KHONG_QUYET = {
	"muc-tieu-da-bo": [T.daBo],
	"dang-cho-duyet": [T.dangChoDuyet],
	"so-sai-kieu": Object.values(T.soTheoKieu),
	"can-chinh-gioi-han": [T.canChinh.gioiHanKhongCanChinh],
	"can-chinh-chinh-no": [T.canChinh.chinhNo],
	"can-chinh-cung-cap": [T.canChinh.cungCap],
	"can-chinh-chua-cong-bo": [T.canChinh.chuaCongBo],
	"can-chinh-khac-chu-ky": [T.canChinh.khacChuKy],
	"can-chinh-da-gan": [T.canChinh.daGan],
} satisfies Record<LyDoKhongQuyet, readonly string[]>;

export function lyDoKhongQuyetCua(loi: unknown): LyDoKhongQuyet | null {
	if (!(loi instanceof BadRequestException || loi instanceof ForbiddenException))
		return null;
	const ma = LY_DO_KHONG_QUYET.find((m) =>
		CAU_CUA_LY_DO_KHONG_QUYET[m].some((cau) => cau === loi.message),
	);
	return ma ?? null;
}
```

Thân `troLyQuyet`: giữ nguyên callback, nối `.catch` sau `$transaction(...)`:

```ts
		return this.db
			.$transaction(async (tx) => {
				/* thân cũ, không đổi một dòng */
			})
			.catch((loi: unknown): TroLyQuyetOutput => {
				const lyDo = lyDoKhongQuyetCua(loi);
				if (lyDo === null) throw loi;
				return { ok: false, lyDo };
			});
```

(Khối `/* thân cũ */` chỉ để chỉ chỗ — không viết chú thích nào vào mã.) Biome có thể đổi thụt lề của thân cũ; dòng đổi vẫn
nằm trong thân `troLyQuyet`.

- [ ] **Step 7: Chạy để thấy xanh**

Run: `bun run test -- "cd apps/api && bun test test/quyet-gop-y-noi-dung-ly-do.spec.ts"`
Expected: PASS hai describe. Ca nào ra mã khác hay `ok:true`: đọc dòng lệch (`<mã>: ok=… lyDo=…`), sửa CÁCH DỰNG trạng thái
của ca (ví dụ `so-sai-kieu` cần sửa đích chứ không sửa tên thì đổi `dong` sang `cach: "sua"` trên trường số) — không đổi mã
mong đợi. Một mã không dựng được bằng đường thật nào → dừng, báo người: đó là đổi hợp đồng (entry `revisit`).

- [ ] **Step 8: docs/api.md**

Sau câu «…không để lại dòng `OkrTrail` nào.» của đoạn `troLyQuyet`, thêm: «Lý do cố định — chu kỳ ẩn hay khoá, Mục tiêu bỏ
hay chờ duyệt, không có quyền sửa, số sai kiểu, sáu luật Căn chỉnh — `troLyQuyet` trả `{ ok: false, lyDo }` với `lyDo`
thuộc `LY_DO_KHONG_QUYET` (`@crm/validation/okr-tro-ly`), bắt NGOÀI giao dịch nên góp ý vẫn `cho`. Bảng
`CAU_CUA_LY_DO_KHONG_QUYET` nối mỗi mã với hằng `OKR.thongDiep` mà bước ghi ném; lỗi khác giữ mã tRPC như cũ. App dịch mã
theo ngôn ngữ trang.»

- [ ] **Step 9: Kiểu và commit**

Run: `bun run check-types` → exit 0 (bắt cả `app` dùng `TroLyQuyetOutput`).

```bash
git add packages/validation/src/okr-tro-ly.ts apps/api/src/okr/okr.contracts.ts apps/api/src/okr/tro-ly.service.ts apps/api/test/quyet-gop-y-noi-dung-ly-do.spec.ts docs/api.md
git commit -m "feat(okr): troLyQuyet trả mã lý do có tên cho lý do cố định (K3c)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: App hiện câu của mã theo ngôn ngữ (E3, E4, E5)

**Files:**
- Modify: `apps/app/lib/messages/okr-gop-y.ts` (import kiểu; `loiQuyet` sau `loiDong` ở `vi` dòng 108-113 và `en` dòng
  239-248)
- Modify: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts` (import dòng 5-9; nhánh `!kq.ok` dòng 411-418)
- Create: `apps/app/test/gop-y-dung-cho-k3c.dom.tsx`

**Verify:** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-k3c.dom.tsx`
· Evals: E3, E4, E5 · Independent: không (cần Task 1).

**Interfaces:**
- Consumes: `LY_DO_KHONG_QUYET`, `type LyDoKhongQuyet`, `laLyDoKhongQuyet` (Task 1).
- Produces: `OkrGopYMessages["loiQuyet"]: Record<LyDoKhongQuyet, string>`.

- [ ] **Step 1: Viết bài DOM (đỏ)**

`apps/app/test/gop-y-dung-cho-k3c.dom.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, setSystemTime, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import { LY_DO_KHONG_QUYET, type LyDoKhongQuyet } from "@crm/validation/okr-tro-ly";
import {
	bamChuot,
	chiTietTu,
	cho,
	D_CAN,
	D_KR1,
	DetailSheet,
	datLai,
	deXuat,
	docCua,
	dsTroLy,
	dung,
	kho,
	LoiTrpc,
	MT_ID,
	mtSheet,
	nhip,
	nut,
	ObjectiveSheet,
	okrGopYMessages,
	qs,
	thaoHet,
} from "./khung-gop-y-dung-cho";

beforeEach(datLai);
afterEach(async () => {
	setSystemTime();
	await thaoHet();
});

const DAU_VIET = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const laCanChinh = (ma: string) => ma.startsWith("can-chinh-");

async function moSheet(locale: Locale, d: typeof D_KR1) {
	kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 1 }));
	kho.troLy = () => dsTroLy([d]);
	await dung(
		<DetailSheet onOpenChange={() => {}} open>
			<ObjectiveSheet objectiveId={MT_ID} />
		</DetailSheet>,
		`?record=objective:${MT_ID}`,
		locale,
	);
	await cho(() => deXuat(d.id) !== null, `${locale} gop y ${d.id}`);
}

async function quyetVaDoc(locale: Locale, d: typeof D_KR1): Promise<string> {
	const mL = okrGopYMessages(locale);
	const goc = () => deXuat(d.id) ?? document.body;
	await bamChuot(nut(d.loai === "can-chinh" ? mL.dong.canChinh : mL.de.doiTenKr, goc()));
	await cho(() => qs("[data-slot=field-error]", goc()) !== null, `${locale} cau loi ${d.id}`);
	await nhip(4);
	return qs("[data-slot=field-error]", goc())?.textContent ?? "";
}

async function maTran(locale: Locale): Promise<Map<LyDoKhongQuyet, string>> {
	const doc = new Map<LyDoKhongQuyet, string>();
	for (const ma of LY_DO_KHONG_QUYET) {
		const d = laCanChinh(ma) ? D_CAN : D_KR1;
		kho.ghiRieng.set("okr.troLyQuyet", async () => ({ ok: false, lyDo: ma }));
		await moSheet(locale, d);
		doc.set(ma, await quyetVaDoc(locale, d));
		await thaoHet();
	}
	return doc;
}

function kiemMaTran(locale: Locale, doc: Map<LyDoKhongQuyet, string>, chuaCongBo: string) {
	const mL = okrGopYMessages(locale);
	const lech: string[] = [];
	for (const ma of LY_DO_KHONG_QUYET) {
		const chu = doc.get(ma) ?? "";
		if (chu !== mL.loiQuyet[ma]) lech.push(`cau sai cho ${ma}: ${chu}`);
		if (chu === mL.loiDong["chua-san-sang"]) lech.push(`cau sai cho ${ma}: van la cau thu lai`);
		if (chu.includes(ma)) lech.push(`cau sai cho ${ma}: lo ma`);
		if (locale === "vi" && !DAU_VIET.test(chu)) lech.push(`cau sai cho ${ma}: khong dau`);
		if (locale === "en" && DAU_VIET.test(chu)) lech.push(`cau sai cho ${ma}: co chu viet`);
	}
	const theoCau = new Map<string, LyDoKhongQuyet>();
	for (const [ma, chu] of doc) {
		const trung = theoCau.get(chu);
		if (trung) lech.push(`cau trung: ${trung} = ${ma}`);
		theoCau.set(chu, ma);
	}
	if (!(doc.get("can-chinh-chua-cong-bo") ?? "").includes(chuaCongBo))
		lech.push(`cau sai cho can-chinh-chua-cong-bo: thieu «${chuaCongBo}»`);
	expect(doc.size).toBe(9);
	expect(theoCau.size, lech.join("\n")).toBe(9);
	expect(lech, lech.join("\n")).toEqual([]);
}

describe("k3c", () => {
	test("k3c-vi 9 ma: cau tieng Viet cua tung ma duoi dung gop y", async () => {
		kiemMaTran("vi", await maTran("vi"), "chưa công bố");
	}, 120_000);

	test("k3c-en 9 ma: cau tieng Anh cua tung ma, khong chu Viet", async () => {
		kiemMaTran("en", await maTran("en"), "not published");
	}, 120_000);

	test("k3c-san-sang ba ca: ma cua tap khong doc lai san sang; chua san sang va 5xx giu cau thu lai", async () => {
		const m = okrGopYMessages("vi");
		let so = 0;

		kho.ghiRieng.set("okr.troLyQuyet", async () => ({ ok: false, lyDo: "can-chinh-chua-cong-bo" }));
		await moSheet("vi", D_CAN);
		await nhip(4);
		const truoc = docCua("okr.troLySanSang").length;
		const lan1 = await quyetVaDoc("vi", D_CAN);
		await bamChuot(nut(m.dong.canChinh, deXuat(D_CAN.id) ?? document.body));
		await nhip(6);
		const lan2 = qs("[data-slot=field-error]", deXuat(D_CAN.id) ?? document.body)?.textContent ?? "";
		expect({ lan1, lan2, docThem: docCua("okr.troLySanSang").length - truoc }).toEqual({
			lan1: m.loiQuyet["can-chinh-chua-cong-bo"],
			lan2: m.loiQuyet["can-chinh-chua-cong-bo"],
			docThem: 0,
		});
		so++;
		await thaoHet();

		kho.ghiRieng.set("okr.troLyQuyet", async () => ({ ok: false, lyDo: "het-tran-ngay" }));
		await moSheet("vi", D_KR1);
		await nhip(4);
		const truoc2 = docCua("okr.troLySanSang").length;
		const chu2 = await quyetVaDoc("vi", D_KR1);
		await nhip(4);
		expect({ chu2, docLai: docCua("okr.troLySanSang").length > truoc2 }).toEqual({
			chu2: m.loiDong["chua-san-sang"],
			docLai: true,
		});
		so++;
		await thaoHet();

		kho.ghiRieng.set("okr.troLyQuyet", async () => {
			throw new LoiTrpc("INTERNAL_SERVER_ERROR", "Internal server error");
		});
		await moSheet("vi", D_KR1);
		expect(await quyetVaDoc("vi", D_KR1)).toBe(m.loiDong["chua-san-sang"]);
		so++;
		await thaoHet();

		kho.ghiRieng.set("okr.troLyQuyet", async () => ({ ok: false, lyDo: "ma-chua-co" }));
		await moSheet("vi", D_KR1);
		expect(await quyetVaDoc("vi", D_KR1)).toBe(m.loiDong["chua-san-sang"]);

		expect(so).toBe(3);
	}, 120_000);
});
```

`khung-gop-y-dung-cho.tsx` xuất sẵn `DetailSheet`, `ObjectiveSheet`, `okrGopYMessages`, `MT_ID`, `dung(man, thamSo,
locale)`. Ca `ma-chua-co` là Review Focus 3, không tính vào ba ca của E5. Mock `troLyQuyet` trả `lyDo` ngoài kiểu khai:
`ghiRieng` nhận `KetQuaGhi` có `lyDo: string`, nên không cần ép kiểu.

- [ ] **Step 2: Chạy lần đầu có trần, đo RSS (luật 35)**

Run (nền, dừng tay nếu quá 6 phút): `cd apps/app && /usr/bin/time -l bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-k3c.dom.tsx 2>&1 | tail -30`
Expected: FAIL biên dịch — `loiQuyet` không có trên `OkrGopYMessages`; ghi lại `maximum resident set size`.

- [ ] **Step 3: Bản đồ câu**

`okr-gop-y.ts`: dòng 2 `import type { LyDoKhongQuyet } from "@crm/validation/okr-tro-ly";`. Trong `vi`, sau khối
`loiDong`:

```ts
	loiQuyet: {
		"muc-tieu-da-bo": "Mục tiêu này đã bỏ nên không quyết được góp ý.",
		"dang-cho-duyet":
			"Mục tiêu đang chờ duyệt nên nội dung, KR và căn chỉnh đang khoá. Rút lại để sửa.",
		"so-sai-kieu": "Số trong góp ý không khớp kiểu đo của KR này.",
		"can-chinh-gioi-han": "Một bên đang ở mức giới hạn nên không căn chỉnh được.",
		"can-chinh-chinh-no": "Đích là chính Mục tiêu này nên không căn chỉnh được.",
		"can-chinh-cung-cap": "Đích không ở cấp cao hơn nên không căn chỉnh được.",
		"can-chinh-chua-cong-bo": "Đích chưa công bố nên chưa căn chỉnh được.",
		"can-chinh-khac-chu-ky": "Đích thuộc chu kỳ khác nên không căn chỉnh được.",
		"can-chinh-da-gan": "Mục tiêu này đã căn chỉnh vào đích đó rồi.",
	} satisfies Record<LyDoKhongQuyet, string>,
```

Trong `en`, sau `loiDong`:

```ts
	loiQuyet: {
		"muc-tieu-da-bo": "This objective was dropped, so the suggestion can't be decided.",
		"dang-cho-duyet":
			"The objective is awaiting approval, so its content, KRs and alignment are locked. Withdraw it to edit.",
		"so-sai-kieu": "The number in this suggestion doesn't fit how this KR is measured.",
		"can-chinh-gioi-han": "One side is restricted, so they can't be aligned.",
		"can-chinh-chinh-no": "The target is this objective itself, so it can't be aligned.",
		"can-chinh-cung-cap": "The target isn't at a higher level, so it can't be aligned to.",
		"can-chinh-chua-cong-bo": "The target is not published yet, so it can't be aligned to.",
		"can-chinh-khac-chu-ky": "The target is in another cycle, so it can't be aligned to.",
		"can-chinh-da-gan": "This objective is already aligned to that target.",
	},
```

- [ ] **Step 4: Nhánh `!kq.ok`**

`gop-y-kara.ts`: thêm `laLyDoKhongQuyet,` vào import `@crm/validation/okr-tro-ly`; thay khối `if (!kq.ok) { … }`:

```ts
					if (!kq.ok) {
						const cau = laLyDoKhongQuyet(kq.lyDo)
							? mGopY.loiQuyet[kq.lyDo]
							: null;
						if (cau === null) void sanSang.refetch();
						setLoiDong((cu) => ({
							...cu,
							[d.id]: cau ?? mGopY.loiDong["chua-san-sang"],
						}));
						return;
					}
```

- [ ] **Step 5: Chạy để thấy xanh**

Run: lệnh Verify của task. Expected: PASS ba test. Rồi
`cd apps/app && bun test ./test/messages-guard.spec.ts` → PASS (bản đồ en không có chữ Việt).

- [ ] **Step 6: Không làm đỏ bài K3**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx`
Expected: PASS (ca `k3-loi-dong` dùng `het-tran-ngay` nên vẫn là câu thử lại).

- [ ] **Step 7: Commit**

```bash
git add "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts" apps/app/lib/messages/okr-gop-y.ts apps/app/test/gop-y-dung-cho-k3c.dom.tsx
git commit -m "feat(okr): góp ý bị từ chối vì lý do cố định hiện câu của lý do theo ngôn ngữ (K3c)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Răng của hồ sơ — một nguồn, ranh giới, đột biến (E6, E7, E8)

**Files:**
- Create: `_acceptance/quyet-gop-y-noi-dung-ly-do/rang/mot-nguon.mjs`
- Create: `_acceptance/quyet-gop-y-noi-dung-ly-do/rang/ranh-gioi.mjs`
- Create: `_acceptance/quyet-gop-y-noi-dung-ly-do/rang/dot-bien.mjs`

**Verify:** `bun _acceptance/quyet-gop-y-noi-dung-ly-do/rang/mot-nguon.mjs` · `node …/ranh-gioi.mjs` ·
`bun …/dot-bien.mjs` · Evals: E6, E7, E8 · Independent: không (đo mã của Task 1–2).

- [ ] **Step 1: mot-nguon.mjs**

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const GOC_QUET = ["apps/api/src", "apps/app/app", "apps/app/lib", "packages/validation/src"];
const KHAI = "packages/validation/src/okr-tro-ly.ts";
const MIEN = ["apps/api/src/okr/tro-ly.service.ts", "apps/app/lib/messages/okr-gop-y.ts"];
const KHOA = "satisfies Record<LyDoKhongQuyet";

const argv = process.argv.slice(2);
const banSao = argv[argv.indexOf("--ban-sao") + 1];
const them = argv.includes("--ban-sao") && banSao === "them-tap";

function* tep(goc) {
	for (const muc of fs.readdirSync(goc, { withFileTypes: true })) {
		const p = path.join(goc, muc.name);
		if (muc.isDirectory()) {
			if (muc.name !== "node_modules") yield* tep(p);
		} else if (/\.(ts|tsx)$/.test(muc.name)) yield p;
	}
}

const { LY_DO_KHONG_QUYET } = await import(path.join(ROOT, KHAI));
const loi = [];
const mot = (cau) => loi.push(cau);

const danhSach = [];
for (const g of GOC_QUET) {
	const ds = [...tep(path.join(ROOT, g))];
	if (ds.length === 0) mot(`goc rong: ${g}`);
	danhSach.push(...ds);
}
if (them) danhSach.push(path.join(ROOT, "apps/app/lib/__ban-sao-them-tap__.ts"));

const choKhai = new Set();
for (const p of danhSach) {
	const rel = path.relative(ROOT, p);
	const noi = them && rel.endsWith("__ban-sao-them-tap__.ts")
		? `export const X = ["${LY_DO_KHONG_QUYET[0]}"] as const;`
		: fs.readFileSync(p, "utf8");
	const co = LY_DO_KHONG_QUYET.filter((ma) => noi.includes(`"${ma}"`));
	if (co.length === 0) continue;
	if (rel === KHAI) {
		choKhai.add(rel);
		continue;
	}
	if (MIEN.includes(rel)) {
		if (!noi.includes(KHOA)) mot(`mien ma khong khoa: ${rel}`);
		continue;
	}
	mot(`ma khai them: ${rel}`);
}

const { CAU_CUA_LY_DO_KHONG_QUYET } = await import(path.join(ROOT, "apps/api/src/okr/tro-ly.service.ts"));
for (const ma of LY_DO_KHONG_QUYET) {
	const cau = CAU_CUA_LY_DO_KHONG_QUYET[ma];
	if (!Array.isArray(cau) || cau.length === 0) mot(`thieu anh xa: ${ma}`);
	else if (cau.some((c) => typeof c !== "string")) mot(`hang khong phai chuoi: ${ma}`);
}

const { okrGopYMessages } = await import(path.join(ROOT, "apps/app/lib/messages/okr-gop-y.ts"));
for (const locale of ["vi", "en"]) {
	const khoa = Object.keys(okrGopYMessages(locale).loiQuyet ?? {}).sort();
	if (JSON.stringify(khoa) !== JSON.stringify([...LY_DO_KHONG_QUYET].sort()))
		mot(`ban do ${locale} lech tap: ${khoa.join(",")}`);
}

if (loi.length) {
	for (const l of loi) console.log(l);
	process.exit(1);
}
console.log(`mot-nguon: ${LY_DO_KHONG_QUYET.length} ma, ${choKhai.size} cho khai, anh xa du, hai ban do du`);
```

Run: `bun _acceptance/quyet-gop-y-noi-dung-ly-do/rang/mot-nguon.mjs` → `mot-nguon: 9 ma, 1 cho khai, anh xa du, hai ban
do du`. Run `… --ban-sao them-tap` → exit 1 `ma khai them: apps/app/lib/__ban-sao-them-tap__.ts`. Import
`tro-ly.service.ts` từ gốc kho mà bun không bật decorator (lỗi cú pháp `@Injectable`): chạy phần (2) trong một tiến trình con
`bun -e` với `cwd: apps/api` và in JSON ra stdout — không đổi điều kiện đo.

- [ ] **Step 2: ranh-gioi.mjs**

Chép `_acceptance/kara-gop-y-luot-2/rang/ranh-gioi.mjs`, đổi `SLUG = "quyet-gop-y-noi-dung-ly-do"`, `MA_HANG = "K3c"`,
`RANH_GIOI_CHEP` = mảng `ranh_gioi` của hàng K3c (Global Constraints), `CHAM_TEP = ["PRODUCT-MAP.md", "LO-TRINH.html"]`,
`CHAM_TEP_XIN = []`, `CHI_THEM = ["_acceptance/config.yaml", "packages/validation/src/okr-tro-ly.ts"]`; bỏ luật `STATE`.
Thêm luật khối theo số dòng trên tệp mới (`git show <toi>:<tệp>`, `toi` = `HEAD` thì đọc tệp làm việc) và tệp cũ
(`git show <tu>:<tệp>`):

```js
function khoi(noi, mo, dong) {
	const dongs = noi.split("\n");
	const ra = [];
	for (let i = 0; i < dongs.length; i++) {
		if (!mo.test(dongs[i])) continue;
		let j = i;
		while (j < dongs.length && !dong.test(dongs[j])) j++;
		ra.push([i + 1, j + 1]);
	}
	return ra;
}
const khoiImport = (noi) => khoi(noi, /^import\b/, /\bfrom\s+["']/);

const LUAT_KHOI = {
	"apps/api/src/okr/okr.contracts.ts": (noi) => [
		...khoiImport(noi),
		...khoi(noi, /^export const troLyQuyetOutput\b/, /^\]\);$/),
	],
	"apps/api/src/okr/tro-ly.service.ts": (noi) => [
		...khoiImport(noi),
		...khoi(noi, /^export const CAU_CUA_LY_DO_KHONG_QUYET\b/, /satisfies Record<LyDoKhongQuyet/),
		...khoi(noi, /^export function lyDoKhongQuyetCua\b/, /^}$/),
		...khoi(noi, /^\tasync troLyQuyet\(/, /^\t}$/),
	],
};

function dongDoiSo(tu, toi, tep) {
	const ra = [];
	let cu = 0;
	let moi = 0;
	for (const d of git("diff", "-U0", tu, toi, "--", tep).split("\n")) {
		const h = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(d);
		if (h) {
			cu = Number(h[1]);
			moi = Number(h[2]);
			continue;
		}
		if (/^(\+\+\+|---) /.test(d)) continue;
		if (d.startsWith("+")) ra.push({ ben: "moi", so: moi++ });
		else if (d.startsWith("-")) ra.push({ ben: "cu", so: cu++ });
	}
	return ra;
}
```

Với mỗi tệp trong `LUAT_KHOI` có trong diff: dòng `moi` phải nằm trong một khối của nội dung mới, dòng `cu` trong một khối
của nội dung cũ; lệch → `ngoai-khoi:<tệp>:<số dòng>`. Cờ `--gia-dong <tệp>:<n>` đẩy thêm `{ ben: "moi", so: n }` cho tệp đó
(tệp phải có trong `LUAT_KHOI`). Đầu ra xanh giữ `ranh-gioi: <n> tep, 0 ngoai (neo <kieu>)`.

Run: `node _acceptance/quyet-gop-y-noi-dung-ly-do/rang/ranh-gioi.mjs` → exit 0. Run `… --them apps/app/lib/x.ts` → exit 1
`ngoai-ranh-gioi:apps/app/lib/x.ts`. Lấy số dòng đầu tiên của `okr.contracts.ts` nằm ngoài mọi khối import và ngoài khối
`troLyQuyetOutput` (`grep -n "^export const" apps/api/src/okr/okr.contracts.ts | head -1`), run `… --gia-dong
apps/api/src/okr/okr.contracts.ts:<n>` → exit 1 `ngoai-khoi:apps/api/src/okr/okr.contracts.ts:<n>`.

- [ ] **Step 3: dot-bien.mjs**

```js
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = path.join(ROOT, ".acceptance-runs/quyet-gop-y-noi-dung-ly-do");
const SV = "apps/api/src/okr/tro-ly.service.ts";
const KARA = "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts";
const CHAN = ["k3c_api", "k3c_vi", "k3c_mot_nguon"];

function moiTruong() {
	const env = { ...process.env };
	for (const k of Object.keys(env)) if (k.startsWith("GIT_")) delete env[k];
	return env;
}
const chayVo = (lenh) => spawnSync("bash", ["-c", lenh], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20, env: moiTruong() });
const bam = (tep) => createHash("sha256").update(fs.readFileSync(path.join(ROOT, tep))).digest("hex");
function lenh(khoa) {
	const cfg = Bun.YAML.parse(fs.readFileSync(path.join(ROOT, "_acceptance/config.yaml"), "utf8"));
	const l = cfg.executors?.test?.[khoa] ?? cfg.executors?.script?.[khoa];
	if (!l) throw new Error(`thieu executors.*.${khoa}`);
	return l;
}
const chay = (khoa) => {
	const r = chayVo(lenh(khoa));
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
};
const thay = (a, b) => (s) => {
	const lan = s.split(a).length - 1;
	if (lan !== 1) throw new Error(`vet khong cam duoc: «${a}» xuat hien ${lan} lan`);
	return s.replace(a, b);
};
const noi = (...b) => (s) => b.reduce((x, f) => f(x), s);

const BAT_TRONG = [
	"if (ghiOkr) await this.ghiTheoDong(tx, userId, hang.id, dong, giaTri);",
	"if (ghiOkr)\n\t\t\t\t\ttry {\n\t\t\t\t\t\tawait this.ghiTheoDong(tx, userId, hang.id, dong, giaTri);\n\t\t\t\t\t} catch (loi) {\n\t\t\t\t\t\tconst lyDo = lyDoKhongQuyetCua(loi);\n\t\t\t\t\t\tif (lyDo === null) throw loi;\n\t\t\t\t\t\treturn { ok: false, lyDo };\n\t\t\t\t\t}",
];

const VET = [
	{ ten: "(a) bo anh xa can-chinh-chua-cong-bo", tep: SV, cam: thay('"can-chinh-chua-cong-bo": [T.canChinh.chuaCongBo],', '"can-chinh-chua-cong-bo": [],'), doi: [["k3c_mot_nguon", "thieu anh xa: can-chinh-chua-cong-bo"]] },
	{ ten: "(b) bat loi trong giao dich", tep: SV, cam: noi(thay(...BAT_TRONG), thay("const lyDo = lyDoKhongQuyetCua(loi);\n\t\t\t\tif (lyDo === null) throw loi;", "const lyDo = null;\n\t\t\t\tif (lyDo === null) throw loi;")), doi: [["k3c_api", ": gop y khong con cho"]] },
	{ ten: "(c) app luon cau thu lai", tep: KARA, cam: thay("const cau = laLyDoKhongQuyet(kq.lyDo)", "const cau = false && laLyDoKhongQuyet(kq.lyDo)"), doi: [["k3c_vi", "cau sai cho"]] },
];

fs.mkdirSync(RA, { recursive: true });
const nen = CHAN.map((k) => ({ k, ...chay(k) }));
const chuaXanh = nen.filter((x) => x.ma !== 0);
if (chuaXanh.length) {
	console.log(`KHONG DO DUOC: chua pha gi ma ${chuaXanh.map((x) => `${x.k}(${x.ma})`).join(" · ")} da khong xanh`);
	process.exit(2);
}
let bat = 0;
for (const v of VET) {
	const duong = path.join(ROOT, v.tep);
	const truoc = fs.readFileSync(duong, "utf8");
	const bamTruoc = bam(v.tep);
	const ket = [];
	try {
		fs.writeFileSync(duong, v.cam(truoc));
		for (const [k, ghim] of v.doi) {
			const r = chay(k);
			fs.writeFileSync(path.join(RA, `dot-bien-${v.ten.slice(1, 2)}-${k}.txt`), r.ra);
			ket.push({ k, do: r.ma !== 0, ghim: r.ra.includes(ghim), thongDiep: ghim });
		}
	} finally {
		fs.writeFileSync(duong, truoc);
	}
	if (bam(v.tep) !== bamTruoc) {
		console.log(`TEP KHONG TRA LAI: ${v.tep}`);
		process.exit(3);
	}
	const du = ket.every((x) => x.do && x.ghim);
	if (du) bat++;
	console.log(`${du ? "bat" : "MU"} ${v.ten}: ${ket.map((x) => `${x.k} ${x.do ? "do" : "XANH"}${x.ghim ? "" : ` (thieu «${x.thongDiep}»)`}`).join(" · ")}`);
}
console.log(`dot-bien: ${bat}/${VET.length} vet bi bat, tep tra lai nguyen`);
process.exit(bat === VET.length ? 0 : 1);
```

Chuỗi neo của vết (b) phụ thuộc thụt lề sau Biome: chạy thử, «xuất hiện 0 lần» thì chép đúng chuỗi từ tệp (`grep -n
"ghiTheoDong(tx" apps/api/src/okr/tro-ly.service.ts`), giữ ý vết: bắt lỗi của `ghiTheoDong` TRONG callback và vô hiệu
`.catch` ngoài. Vết (a) làm `CAU_CUA_LY_DO_KHONG_QUYET` vi phạm `satisfies`? Không — `[]` vẫn là `readonly string[]`;
kiểu không cứu, chỉ phép đo cứu.

Commit WIP trước khi chạy đột biến (bài học «phá-thử tại chỗ»): `git add -A _acceptance/quyet-gop-y-noi-dung-ly-do/rang && git commit -m "test(acceptance): răng K3c" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`.

Run: `bun _acceptance/quyet-gop-y-noi-dung-ly-do/rang/dot-bien.mjs` (nền, `run_in_background`, vài phút vì `k3c_api` chạy
ba lần) → `dot-bien: 3/3 vet bi bat, tep tra lai nguyen`, exit 0; `git status --short` sạch ngoài `.acceptance-runs`.

---

### Task 4: Năm cổng của kho, hồ sơ sang `implemented`

**Files:** `_acceptance/quyet-gop-y-noi-dung-ly-do/contract.md` (frontmatter `status`)

**Verify:** năm lệnh dưới · Evals: tất cả · Independent: không.

- [ ] **Step 1:** `bun run check-types && bun run lint && bun run lint:slop` → exit 0. Lỗi `lint:slop` dạng
  `no-known-value-widening` ở bảng ánh xạ → dùng `satisfies` như đã viết, không `as`.
- [ ] **Step 2:** `bun run test` (nền, giữ nhịp) → exit 0. `bun run build` → exit 0.
- [ ] **Step 3:** Chạy từng eval máy: `k3c_api`, `k3c_api_ngoai`, `k3c_vi`, `k3c_en`, `k3c_san_sang`, `k3c_mot_nguon`,
  `k3c_ranh_gioi`, `k3c_dot_bien` theo `_acceptance/config.yaml` → exit 0 cả tám.
- [ ] **Step 4:** contract `status: approved` → `status: implemented`; commit
  `chore(acceptance): quyet-gop-y-noi-dung-ly-do — implemented (K3c)` kèm trailer.
