import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { PHIEN_CHO_EVE } from "@crm/validation/okr-cuoc-soan";

export const BI_MAT = "bi-mat-cua-okr-hoan-luot-du-dai-32-ky-tu";
export const AGENT_GIA = "http://127.0.0.1:65531";
export const CHO_TRO_LY_THU_MS = 300;

export type KetQuaTroLy = "nem" | "treo" | "luong-cham" | number;

export const MAU_LUONG = [1, 2, 3, 4, 5, 6].map(
	(i) => `{"type":"manh","so":${i}}\n`,
);
export const LUONG_NHIP_MS = 120;

export type PhienNguoi = {
	user: { id: string; email: string; name: string };
} | null;

export type CuocDoc = { soLuot: number; sessionId: string; cacPhien: string[] };

export type TrangThaiKhung = {
	phien: PhienNguoi;
	ketQua: KetQuaTroLy;
	soLanFetch: number;
	truocKhiTra: null | (() => Promise<void>);
};

export type Khung = {
	suffix: string;
	nguoi: string;
	trangThai: TrangThaiKhung;
	fetchGia: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
	gieo: () => Promise<void>;
	don: () => Promise<void>;
	cuoc: (
		duong: "mo-phien" | "gui-tiep",
		soLuot: number,
	) => Promise<{ id: string; duongCua: string }>;
	docCuoc: (id: string) => Promise<CuocDoc>;
	dangNhap: () => void;
};

export function taoKhung(ten: string): Khung {
	const suffix = `${process.env.TEST_RUN_ID ?? ten}-${ten}`;
	const nguoi = `${suffix}-nguoi`;
	const chuKy = `${suffix}-ky`;
	const trangThai: TrangThaiKhung = {
		phien: null,
		ketQua: 202,
		soLanFetch: 0,
		truocKhiTra: null,
	};

	async function fetchGia(
		_input: RequestInfo | URL,
		init?: RequestInit,
	): Promise<Response> {
		trangThai.soLanFetch += 1;
		const eve = `${suffix}-eve-${trangThai.soLanFetch}`;
		if (trangThai.truocKhiTra) await trangThai.truocKhiTra();
		const ket = trangThai.ketQua;
		if (ket === "nem") throw new TypeError("connect ECONNREFUSED tro-ly-gia");
		if (ket === "luong-cham")
			return new Response(luongCham(init?.signal), {
				status: init?.method === "GET" ? 200 : 202,
				headers: { "content-type": "application/x-ndjson" },
			});
		if (ket === "treo")
			return new Promise<Response>((_xong, hong) => {
				init?.signal?.addEventListener("abort", () =>
					hong(init.signal?.reason ?? new Error("abort")),
				);
			});
		if (ket >= 200 && ket < 300)
			return Response.json(
				{ ok: true, sessionId: eve, continuationToken: `eve:${eve}` },
				{ status: ket, headers: { "x-eve-session-id": eve } },
			);
		return Response.json({ ok: false, loi: "tro-ly-gia" }, { status: ket });
	}

	async function gieo() {
		await don();
		const now = new Date();
		await db.organization.upsert({
			where: { id: WORKSPACE_ID },
			create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: now },
			update: {},
		});
		await db.user.create({
			data: {
				id: nguoi,
				name: nguoi,
				email: `${nguoi}@thu.test`,
				emailVerified: true,
				createdAt: now,
				updatedAt: now,
			},
		});
		await db.member.create({
			data: {
				id: `member-${nguoi}`,
				organizationId: WORKSPACE_ID,
				userId: nguoi,
				role: "owner",
				createdAt: now,
			},
		});
		await db.okrCycle.create({
			data: {
				id: chuKy,
				kind: "quy",
				name: `Quý ${suffix}`,
				startsOn: new Date("2034-01-01"),
				endsOn: new Date("2034-03-31"),
				phase: "lap-ke-hoach",
			},
		});
	}

	async function don() {
		await db.okrCuocSoan.deleteMany({
			where: { id: { startsWith: `${suffix}-` } },
		});
		await db.okrCycle.deleteMany({ where: { id: chuKy } });
		await db.member.deleteMany({ where: { userId: nguoi } });
		await db.user.deleteMany({ where: { id: nguoi } });
	}

	let soCuoc = 0;
	async function cuoc(
		duong: "mo-phien" | "gui-tiep",
		soLuot: number,
	): Promise<{ id: string; duongCua: string }> {
		const id = `${suffix}-cuoc-${++soCuoc}`;
		const phien =
			duong === "mo-phien"
				? `${PHIEN_CHO_EVE}${id}`
				: `${suffix}-phien-${soCuoc}`;
		await db.okrCuocSoan.create({
			data: {
				id,
				cycleId: chuKy,
				level: "onehub",
				nguoiMoUserId: nguoi,
				sessionId: phien,
				cacPhien: [phien],
				nac: "bat",
				trangThai: "dang",
				soLuot,
			},
		});
		return {
			id,
			duongCua:
				duong === "mo-phien" ? "/eve/v1/session" : `/eve/v1/session/${phien}`,
		};
	}

	const docCuoc = (id: string): Promise<CuocDoc> =>
		db.okrCuocSoan.findUniqueOrThrow({
			where: { id },
			select: { soLuot: true, sessionId: true, cacPhien: true },
		});

	return {
		suffix,
		nguoi,
		trangThai,
		fetchGia,
		gieo,
		don,
		cuoc,
		docCuoc,
		dangNhap: () => {
			trangThai.phien = {
				user: { id: nguoi, email: `${nguoi}@thu.test`, name: nguoi },
			};
		},
	};
}

const TIEN_TO = "/eve/agents/okr/eve/v1/";

export type YeuCauCua = {
	request: Request;
	ctx: { params: Promise<{ path: string[] }> };
};

function luongCham(signal: AbortSignal | null | undefined) {
	const ma = new TextEncoder();
	return new ReadableStream<Uint8Array>({
		async start(dong) {
			for (const manh of MAU_LUONG) {
				await new Promise((xong) => setTimeout(xong, LUONG_NHIP_MS));
				if (signal?.aborted) {
					dong.error(signal.reason ?? new Error("abort"));
					return;
				}
				dong.enqueue(ma.encode(manh));
			}
			dong.close();
		},
	});
}

export function yeuCau(
	duong: string,
	cuocSoanId: string,
	header: string,
	signal?: AbortSignal,
	method: "POST" | "GET" = "POST",
): YeuCauCua {
	const url = `http://localhost:3000/eve/agents/okr${duong}`;
	const { pathname } = new URL(url);
	const path = pathname
		.slice(TIEN_TO.length)
		.split("/")
		.map((doan) => decodeURIComponent(doan));
	const request = new Request(url, {
		method,
		headers: { "content-type": "application/json", [header]: cuocSoanId },
		body: method === "POST" ? "{}" : undefined,
		signal,
	});
	return { request, ctx: { params: Promise.resolve({ path }) } };
}
