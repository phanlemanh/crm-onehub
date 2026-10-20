import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { useQuery } from "@tanstack/react-query";
import { act } from "react";
import type { CapNhatKr } from "@/app/(app)/[slug]/okr/cap-nhat-kr";
import type { ObjectiveOutput } from "../../api/src/okr/okr.contracts";
import {
	chiTietTu,
	cho,
	datLai,
	docCua,
	dung,
	goiCua,
	type KetQuaGhi,
	kho,
	kr,
	mucTieu,
	nguoiDung,
	nhip,
	nut,
	qs,
	thaoHet,
} from "./khung-gop-y-dung-cho";

const { useCapNhatKr } = await import("@/app/(app)/[slug]/okr/cap-nhat-kr");
const { useTRPC } = await import("@/lib/trpc/client");
const { okrMessages } = await import("@/lib/messages/okr");

const mo = okrMessages("vi");

const MT = "mt-ngan";
const BON_KR = ["k1", "k2", "k3", "k4"].map((id, i) =>
	kr(id, MT, {
		title: `KR thứ ${i + 1} của mục tiêu`,
		hienTaiQuaCapNhat: true,
		laCuaToi: true,
	}),
);

const chiTiet = (): ObjectiveOutput =>
	chiTietTu(mucTieu(MT, BON_KR, { canEdit: true }));

type Tay = { mo: CapNhatKr["mo"] | null };

const tay: Tay = { mo: null };

function DocKr({ keyResultId }: { keyResultId: string }) {
	const trpc = useTRPC();
	useQuery(trpc.okr.canhKr.queryOptions({ keyResultId }));
	useQuery(trpc.okr.dienBien.queryOptions({ keyResultId }));
	return null;
}

function ThuHook({ docKr }: { docKr: string }) {
	const capNhat = useCapNhatKr();
	tay.mo = capNhat.mo;
	return (
		<>
			<DocKr keyResultId={docKr} />
			{capNhat.hop}
		</>
	);
}

const hop = () => qs("[data-hop-cap-nhat-kr]");
const oGiaTri = (id: string) => qs<HTMLInputElement>(`[id="${id}-gia-tri"]`);

beforeEach(datLai);
afterEach(thaoHet);

describe("vk7-cap-nhat-ngan", () => {
	test("vk7-cap-nhat-ngan: hop mo voi tieu diem o o gia tri; mo K1 roi K3 khi phien con dang mo -> hop K3, gui dung K3 va phien sau, lam moi canhKr va lich su", async () => {
		const traPhien: ((kq: KetQuaGhi) => void)[] = [];
		kho.ghiRieng.set(
			"okr.moCapNhat",
			() => new Promise<KetQuaGhi>((r) => traPhien.push(r)),
		);
		const mt = chiTiet();
		const [k1, , k3] = mt.keyResults;
		if (!k1 || !k3) throw new Error("thieu KR mau");
		await dung(<ThuHook docKr={k3.id} />);
		await cho(
			() =>
				docCua("okr.canhKr").length === 1 &&
				docCua("okr.dienBien").length === 1,
			"doc KR lan dau",
		);
		const docTruoc = {
			canhKr: docCua("okr.canhKr").length,
			lichSu: docCua("okr.dienBien").length,
		};

		await act(async () => {
			tay.mo?.(mt, k1);
		});
		await cho(() => hop() !== null, "hop K1");
		const tieuDiemK1 = document.activeElement === oGiaTri(k1.id);
		await act(async () => {
			tay.mo?.(mt, k3);
		});
		await nhip(3);
		const krCuaHop = hop()?.getAttribute("data-hop-cap-nhat-kr");
		if (krCuaHop !== k3.id) throw new Error(`hop sai kr: ${krCuaHop}`);
		const tieuDiemK3 = document.activeElement === oGiaTri(k3.id);
		await act(async () => {
			traPhien[1]?.({ sessionId: "phien-2" });
		});
		await act(async () => {
			traPhien[0]?.({ sessionId: "phien-1" });
		});
		await nhip(2);

		const h = hop();
		if (!h) throw new Error("hop dong mat");
		const o = oGiaTri(k3.id);
		if (!o) throw new Error("khong co o gia tri K3");
		const u = nguoiDung();
		await act(async () => {
			await u.clear(o);
			await u.type(o, "33");
		});
		await act(async () => {
			await u.click(nut(mo.capNhat.mucTuTin.vua, h));
		});
		const gui = () =>
			h.querySelector<HTMLButtonElement>('[data-nut="gui-cap-nhat-kr"]');
		await cho(() => gui()?.disabled === false, "nut gui bat");
		const btn = gui();
		if (!btn) throw new Error("khong co nut gui");
		await act(async () => {
			await u.click(btn);
		});
		await cho(() => hop() === null, "hop dong sau gui");

		const lamMoi = {
			"canh-kr": docCua("okr.canhKr").length - docTruoc.canhKr,
			"lich-su": docCua("okr.dienBien").length - docTruoc.lichSu,
		};
		for (const [truyVan, lan] of Object.entries(lamMoi)) {
			if (lan < 1) throw new Error(`khong lam moi: ${truyVan}`);
		}
		if (!tieuDiemK1 || !tieuDiemK3)
			throw new Error(
				`o gia tri khong co tieu diem: K1 ${tieuDiemK1}, K3 ${tieuDiemK3}`,
			);
		expect({
			tieuDe: h.querySelector('[data-slot="dialog-description"]')?.textContent,
			khongDich: h
				.querySelector('[data-slot="dialog-description"]')
				?.getAttribute("translate"),
			phien: goiCua("okr.moCapNhat").map((g) => g.vao),
			gui: goiCua("okr.guiCapNhat").map((g) => g.vao),
		}).toEqual({
			tieuDe: k3.title,
			khongDich: "no",
			phien: [{ entry: "sheet" }, { entry: "sheet" }],
			gui: [
				{
					sessionId: "phien-2",
					items: [
						{ keyResultId: k3.id, value: 33, confidence: "vua", note: "" },
					],
				},
			],
		});
	});
});
