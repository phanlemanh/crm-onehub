import { afterEach, beforeEach, describe, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { tepTrongO } from "@crm/validation/tep-truong";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import ts from "typescript";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json };
type DauVao = Json | undefined;

const duLieu = new Map<string, (vao: DauVao) => Json>();
const tuChoi = new Set<string>();
let tabMo = 0;
let toastLoi: string[] = [];
let lamMoi: string[] = [];

function loiCam(): TRPCClientError<never> {
	const loi = new TRPCClientError<never>("cam");
	Object.defineProperty(loi, "data", { value: { code: "FORBIDDEN" } });
	return loi;
}

function thuTuc(ten: string) {
	const khoa = (vao?: DauVao) => (vao === undefined ? [ten] : [ten, vao]);
	const doc = (vao: DauVao): Json => {
		if (tuChoi.has(ten)) throw loiCam();
		const f = duLieu.get(ten);
		return f ? f(vao) : null;
	};
	return {
		queryKey: khoa,
		pathKey: () => [ten],
		queryFilter: () => ({ queryKey: [ten] }),
		queryOptions: (vao?: DauVao) => ({
			queryKey: khoa(vao),
			queryFn: async () => doc(vao),
		}),
		mutationOptions: () => ({
			mutationKey: [ten],
			mutationFn: async (vao: DauVao) => doc(vao),
		}),
	};
}

const MAT = new Set([
	"queryKey",
	"pathKey",
	"queryFilter",
	"queryOptions",
	"mutationOptions",
]);
type ThuTuc = ReturnType<typeof thuTuc>;
type TrpcGia = { [ten: string]: TrpcGia } & Partial<ThuTuc>;

function nhanh(duong: string[]): TrpcGia {
	return new Proxy<TrpcGia>(
		{},
		{
			get(_t, ten: string) {
				if (MAT.has(ten) && duong.length >= 2) {
					return thuTuc(duong.join("."))[ten as keyof ThuTuc];
				}
				return nhanh([...duong, ten]);
			},
		},
	);
}

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => nhanh([]) }));
mock.module("sonner", () => ({
	toast: {
		error: (chu: string) => toastLoi.push(chu),
		success: () => {},
	},
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/deals",
	useSearchParams: () => new URLSearchParams(),
}));

const { OTruongTuTao, nguCanhTepCua } = await import(
	"@/components/crm/fields/record-fields"
);
const { dealDetailOutput } = await import(
	"../../api/src/deals/deals.contracts"
);
const { companyDetailOutput } = await import(
	"../../api/src/companies/companies.contracts"
);
const { contactByIdOutput } = await import(
	"../../api/src/contacts/contacts.contracts"
);
const { quyenMoTep } = await import("../../../packages/auth/src/quyen-tep");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { crmMessages } = await import("@/lib/messages/crm");

const PHU_TRACH = "Ngô Thị Lan";
const TEN_TEP = "Hợp đồng ký.pdf";
const LOAI = [
	{ entity: "DEAL" },
	{ entity: "COMPANY" },
	{ entity: "CONTACT" },
] as const;
const LY_DO = ["khong-phu-trach", "chua-co-phu-trach", null] as const;
const NGON_NGU = ["vi", "en"] as const;

let roots: { o: HTMLElement; root: Root }[] = [];

beforeEach(() => {
	duLieu.clear();
	tuChoi.clear();
	tabMo = 0;
	toastLoi = [];
	lamMoi = [];
	window.open = (() => {
		tabMo += 1;
		return null;
	}) as typeof window.open;
});

afterEach(async () => {
	for (const s of roots) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	roots = [];
	document.body.innerHTML = "";
});

async function nhip(lan = 3) {
	for (let i = 0; i < lan; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function dung(phan: ReactElement, ngonNgu: "vi" | "en") {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	const goc = qc.invalidateQueries.bind(qc);
	qc.invalidateQueries = ((bo?: { queryKey?: unknown[] }) => {
		lamMoi.push(JSON.stringify(bo?.queryKey ?? []));
		return goc(bo);
	}) as typeof qc.invalidateQueries;
	await act(async () => {
		root.render(
			<QueryClientProvider client={qc}>
				<LocaleProvider locale={ngonNgu}>
					<TooltipProvider>{phan}</TooltipProvider>
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	roots.push({ o, root });
	await nhip();
	return o;
}

const DOC_BY_ID = {
	DEAL: dealDetailOutput.pick({
		id: true,
		archivedAt: true,
		owner: true,
		tepTheoTruong: true,
	}),
	COMPANY: companyDetailOutput.pick({
		id: true,
		archivedAt: true,
		owner: true,
		tepTheoTruong: true,
	}),
	CONTACT: contactByIdOutput.pick({
		id: true,
		archivedAt: true,
		owner: true,
		tepTheoTruong: true,
	}),
} as const;
const BY_ID = {
	DEAL: "deals.byId",
	COMPANY: "companies.byId",
	CONTACT: "contacts.byId",
} as const;
const NGUOI_PHU_TRACH = {
	id: "u-lan",
	name: PHU_TRACH,
	email: "lan@onehub.test",
	image: null,
};

function banGhi(
	entity: (typeof LOAI)[number]["entity"],
	lyDo: (typeof LY_DO)[number],
) {
	const phuTrachId =
		lyDo === "khong-phu-trach"
			? NGUOI_PHU_TRACH.id
			: lyDo === null
				? "u-toi"
				: null;
	const quyen = quyenMoTep({ vai: "member", userId: "u-toi", phuTrachId });
	const coChu = entity === "DEAL" || lyDo !== "chua-co-phu-trach";
	const tho = {
		id: "r1",
		archivedAt: null,
		owner: coChu
			? lyDo === null
				? { ...NGUOI_PHU_TRACH, id: "u-toi", name: "Tôi" }
				: NGUOI_PHU_TRACH
			: null,
		tepTheoTruong: {
			hop_dong: [
				{
					id: "t1",
					tenTep: TEN_TEP,
					kieu: "pdf",
					kichThuoc: 2048,
					taiLuc: "2026-10-22T03:00:00.000Z",
					taiBoi: { id: "u1", ten: "An" },
					coTheMo: quyen.coTheMo,
					coTheXoa: false,
					lyDoKhongMo:
						quyen.coTheMo || quyen.lyDo === "ngoai-pham-vi" ? null : quyen.lyDo,
				},
			],
		},
	};
	return DOC_BY_ID[entity].parse(tho);
}

function oPhieu(
	entity: (typeof LOAI)[number]["entity"],
	lyDo: (typeof LY_DO)[number],
) {
	return (
		<OTruongTuTao
			field={{
				id: "f1",
				key: "hop_dong",
				label: "Hợp đồng",
				type: "FILE",
				showOnSheet: true,
				required: false,
				options: [],
				value: null,
			}}
			saving={() => false}
			onSave={() => {}}
			nguoiDung={[]}
			nguCanhTep={nguCanhTepCua(entity, banGhi(entity, lyDo))}
		/>
	);
}

function nutMo(o: HTMLElement, chu: string) {
	return [...o.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) =>
			b.textContent?.includes(chu) &&
			b.getAttribute("aria-label")?.includes(TEN_TEP),
	);
}

async function goRoot() {
	for (const s of roots) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	roots = [];
}

function dongCan(lyDo: (typeof LY_DO)[number], nn: "vi" | "en"): string | null {
	const m = crmMessages(nn).tepTruong;
	if (lyDo === "khong-phu-trach") {
		return `${m.khongPhuTrach.truoc}${PHU_TRACH}${m.khongPhuTrach.sau}`;
	}
	return lyDo === "chua-co-phu-trach" ? m.chuaPhuTrach : null;
}

function kiemKhongDong(
	o: HTMLElement,
	nut: HTMLButtonElement,
	nn: "vi" | "en",
	ve: string,
) {
	const m = crmMessages(nn).tepTruong;
	const chu = o.textContent ?? "";
	if (
		[m.khongMo, m.chuaPhuTrach, m.khongPhuTrach.sau].some((x) =>
			chu.includes(x),
		)
	) {
		throw new Error(`tcb o tep: ${ve} thua dong`);
	}
	if (nut.hasAttribute("aria-describedby"))
		throw new Error(`tcb o tep: ${ve} aria`);
}

function kiemCoDong(
	o: HTMLElement,
	nut: HTMLButtonElement,
	lyDo: "khong-phu-trach" | "chua-co-phu-trach",
	can: string,
	nn: "vi" | "en",
	ve: string,
) {
	const m = crmMessages(nn).tepTruong;
	const chu = o.textContent ?? "";
	if (lyDo === "khong-phu-trach" && chu.includes(m.khongMo)) {
		throw new Error(`tcb o tep: ${lyDo} vi dong`);
	}
	if (!chu.includes(can)) throw new Error(`tcb o tep: ${ve} dong`);
	const id = nut.getAttribute("aria-describedby");
	const dong = id ? o.querySelector(`[id="${CSS.escape(id)}"]`) : null;
	if ((dong?.textContent ?? "") !== can)
		throw new Error(`tcb o tep: ${ve} aria`);
	if (lyDo === "khong-phu-trach") {
		const ten = [...o.querySelectorAll("[translate]")].find(
			(x) => x.textContent === PHU_TRACH,
		);
		if (ten?.getAttribute("translate") !== "no")
			throw new Error(`tcb o tep: ${ve} dich ten`);
	}
}

async function kiemMotO(
	entity: (typeof LOAI)[number]["entity"],
	lyDo: (typeof LY_DO)[number],
	nn: "vi" | "en",
) {
	const m = crmMessages(nn).tepTruong;
	const o = await dung(oPhieu(entity, lyDo), nn);
	const ve = `${entity} ${lyDo} ${nn}`;
	const nut = nutMo(o, m.nutMo);
	if (!nut) throw new Error(`tcb o tep: ${ve} nut`);
	if (nut.disabled !== (lyDo !== null))
		throw new Error(`tcb o tep: ${ve} khoa`);
	const can = dongCan(lyDo, nn);
	if (lyDo === null || can === null) kiemKhongDong(o, nut, nn, ve);
	else kiemCoDong(o, nut, lyDo, can, nn, ve);
	await goRoot();
}

describe("tcb-o-tep", () => {
	test("tcb-o-tep: 3 loại × 3 lý do × 2 ngôn ngữ, dòng lý do theo máy chủ", async () => {
		duLieu.set("fieldFiles.status", () => ({ bat: true }));
		let so = 0;
		for (const loai of LOAI) {
			for (const lyDo of LY_DO) {
				for (const nn of NGON_NGU) {
					await kiemMotO(loai.entity, lyDo, nn);
					so += 1;
				}
			}
		}
		if (so !== 18) throw new Error(`tcb o tep: thieu o ${so}`);
	});

	test("tcb-o-tep: mất quyền khi bấm Mở — báo, tải lại đúng loại, không mở tab", async () => {
		duLieu.set("fieldFiles.status", () => ({ bat: true }));
		tuChoi.add("fieldFiles.downloadUrl");
		let so = 0;
		for (const loai of LOAI) {
			toastLoi = [];
			lamMoi = [];
			tabMo = 0;
			const m = crmMessages("vi").tepTruong;
			const o = await dung(oPhieu(loai.entity, null), "vi");
			const nut = nutMo(o, m.nutMo);
			if (!nut || nut.disabled) throw new Error("tcb o tep: doi chung");
			await act(async () => nut.click());
			await nhip(5);
			if (!toastLoi.includes(m.matQuyen))
				throw new Error(`tcb o tep: mat quyen khong bao ${loai.entity}`);
			const dungKhoa = JSON.stringify([BY_ID[loai.entity], { id: "r1" }]);
			const khacLoai = Object.values(BY_ID)
				.filter((ten) => ten !== BY_ID[loai.entity])
				.map((ten) => JSON.stringify([ten, { id: "r1" }]));
			if (
				!lamMoi.includes(dungKhoa) ||
				lamMoi.some((k) => khacLoai.includes(k))
			) {
				throw new Error(`tcb o tep: khong tai lai ${loai.entity}`);
			}
			if (tabMo !== 0) throw new Error(`tcb o tep: mo tab ${loai.entity}`);
			so += 1;
			for (const s of roots) {
				await act(async () => s.root.unmount());
				s.o.remove();
			}
			roots = [];
		}
		if (so !== 3) throw new Error(`tcb o tep: thieu ca ${so}`);
	});

	test("tcb-o-tep: ô Tệp không tự so vai hay người phụ trách", () => {
		const goc = path.join(import.meta.dir, "..", "components", "crm", "fields");
		for (const ten of ["o-tep.tsx", "kieu-truong.tsx"]) {
			const nguon = readFileSync(path.join(goc, ten), "utf8");
			const sf = ts.createSourceFile(
				ten,
				nguon,
				ts.ScriptTarget.Latest,
				true,
				ts.ScriptKind.TSX,
			);
			const xem = (n: ts.Node) => {
				if (
					ts.isPropertyAccessExpression(n) &&
					["ownerId", "role"].includes(n.name.text)
				) {
					const dong =
						sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
					throw new Error(`tcb o tep: tu tinh quyen ${ten}:${dong}`);
				}
				if (
					ts.isBinaryExpression(n) &&
					[
						ts.SyntaxKind.EqualsEqualsEqualsToken,
						ts.SyntaxKind.ExclamationEqualsEqualsToken,
					].includes(n.operatorToken.kind) &&
					/ownerId|owner\.id|phuTrach/.test(n.getText(sf))
				) {
					const dong =
						sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
					throw new Error(`tcb o tep: tu tinh quyen ${ten}:${dong}`);
				}
				ts.forEachChild(n, xem);
			};
			xem(sf);
		}
	});
});
