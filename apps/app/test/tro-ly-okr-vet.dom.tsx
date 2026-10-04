import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { VetOutput } from "../../api/src/okr/okr.contracts";

const HAI = { id: "hai", name: "Trần Minh Hải", email: "hai@onehub.vn" };

function thuTuc(duong: string) {
	const doc = (): unknown => (duong === "users.list" ? [HAI] : null);
	return {
		queryKey: () => [duong],
		pathKey: () => [duong],
		queryOptions: () => ({
			queryKey: [duong],
			queryFn: async () => doc(),
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () =>
		new Proxy(
			{},
			{
				get: (_g, khong: string) =>
					new Proxy(
						{},
						{ get: (_h, ten: string) => thuTuc(`${khong}.${ten}`) },
					),
			},
		),
}));

const { BangVet } = await import("@/app/(app)/[slug]/okr/bang-vet");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { okrGopYMessages } = await import("@/lib/messages/okr-gop-y");
const { okrMessages } = await import("@/lib/messages/okr");

const g = okrGopYMessages("vi").vet;
const mOkr = okrMessages("vi");

function vet(
	id: string,
	action: VetOutput["action"],
	before: VetOutput["before"],
	after: VetOutput["after"],
	note: string | null,
	keyResultId: string | null = null,
): VetOutput {
	return {
		id,
		at: "2026-10-05T03:15:00.000Z",
		actor: HAI,
		action,
		keyResultId,
		before,
		after,
		note,
	};
}

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

async function ve(trail: VetOutput[]): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">
					<BangVet
						trail={trail}
						keyResults={[]}
						alignments={[
							{
								alignmentId: "al-1",
								targetObjectiveId: "mt-onehub",
								targetKeyResultId: "kr-onehub",
								unitName: "OneHub",
								objectiveTitle: "Tăng trưởng 2027",
								keyResultTitle: "Thoả thuận mới cả năm",
							},
						]}
					/>
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	dangMo.push({ o, root });
}

function viec(id: string): string {
	const hang = document.body.querySelector(`[data-vet-hang="${id}"]`);
	if (!hang) throw new Error(`khong thay hang vet ${id}`);
	return (
		hang.querySelector("[data-viec]")?.textContent?.replace(/\s+/g, " ") ?? ""
	);
}

function canNoiTroLy(id: string, mong: string): void {
	const thay = viec(id);
	if (!thay.includes(g.theoKara))
		throw new Error(`vet khong noi tro ly: hang ${id} hien "${thay}"`);
	expect(thay).toBe(mong);
}

describe("vet theo de xuat cua Tro ly OKR", () => {
	test("hang sua ten co note tro-ly-okr hien «Sửa tên — theo đề xuất của Kara»", async () => {
		await ve([
			vet(
				"v1",
				"sua",
				{ title: "Triển khai CRM mới" },
				{ title: "Không thoả thuận nào bị mất dấu" },
				"tro-ly-okr:dx-1",
			),
		]);
		canNoiTroLy("v1", "Sửa tên — theo đề xuất của Kara");
		const hang = document.body.querySelector('[data-vet-hang="v1"]');
		expect(hang?.querySelector('[data-khoa="title"]')?.textContent).toBe(
			"Tên: Triển khai CRM mới → Không thoả thuận nào bị mất dấu",
		);
	});

	test("hang sua ten KR co note hien «Sửa tên — theo đề xuất…», cung ten KR", async () => {
		await ve([
			vet(
				"v2",
				"sua-kr",
				{ title: "Gọi 50 cuộc mỗi tuần" },
				{ title: "Khách mới hẹn gặp được" },
				"tro-ly-okr:dx-2",
				"kr-1",
			),
		]);
		canNoiTroLy("v2", "Sửa tên — theo đề xuất của Kara");
	});

	test("hang sua vi sao luc nay co note hien ten truong viet thuong", async () => {
		await ve([
			vet(
				"v3",
				"sua",
				{ whyNow: "Cũ" },
				{ whyNow: "Mới hơn" },
				"tro-ly-okr:dx-3",
			),
		]);
		canNoiTroLy("v3", "Sửa vì sao lúc này — theo đề xuất của Kara");
	});

	test("hang gan can chinh co note giu ten viec va noi tro ly", async () => {
		await ve([
			vet(
				"v4",
				"gan-can-chinh",
				null,
				{ targetKeyResultId: "kr-onehub" },
				"tro-ly-okr:dx-4",
			),
		]);
		canNoiTroLy(
			"v4",
			`${mOkr.hanhDong["gan-can-chinh"]} — theo đề xuất của Kara`,
		);
	});

	test("doi chung: hang khong note hien nhu cu", async () => {
		await ve([vet("v5", "sua", { title: "A cũ" }, { title: "A mới" }, null)]);
		expect(viec("v5")).toBe(mOkr.hanhDong.sua);
	});

	test("note dang la khong lam hong dong va khong noi tro ly", async () => {
		const LA = [
			"tro-ly-okr:",
			"tro-ly-okr: ",
			"tro-ly-okr",
			"TRO-LY-OKR:dx-1",
			"lý do đổi đích: khách huỷ",
			"",
		];
		await ve(
			LA.map((note, i) =>
				vet(`la-${i}`, "sua", { title: "B cũ" }, { title: "B mới" }, note),
			),
		);
		for (const [i] of LA.entries()) {
			expect({ note: LA[i], viec: viec(`la-${i}`) }).toEqual({
				note: LA[i],
				viec: mOkr.hanhDong.sua,
			});
			expect(
				document.body.querySelector(
					`[data-vet-hang="la-${i}"] [data-khoa="title"]`,
				)?.textContent,
			).toBe("Tên: B cũ → B mới");
		}
	});
});
