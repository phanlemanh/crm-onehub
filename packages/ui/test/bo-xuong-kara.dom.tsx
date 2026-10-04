import { afterEach, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { KaraBusyProvider } from "../src/components/kara/busy";
import { LocaleProvider } from "../src/components/locale-provider";
import type {
	ProposedChangeAction,
	ProposedChangeDecided,
} from "../src/components/proposed-change";
import type { Locale } from "../src/lib/locale";
import { messages } from "../src/lib/messages";

const THU_MUC_KARA = resolve(
	import.meta.dir,
	"..",
	"src",
	"components",
	"kara",
);

const nap = <T,>(bien: string, tep: string): Promise<T> =>
	import(process.env[bien] ?? join(THU_MUC_KARA, tep)) as Promise<T>;

const KhoiState = await nap<typeof import("../src/components/kara/state")>(
	"K1_TEP_STATE",
	"state.tsx",
);

const KhoiProposal = await nap<
	typeof import("../src/components/kara/proposal")
>("K1_TEP_PROPOSAL", "proposal.tsx");

const KhoiTranscript = await nap<
	typeof import("../src/components/kara/transcript")
>("K1_TEP_TRANSCRIPT", "transcript.tsx");

const KhoiComposer = await nap<
	typeof import("../src/components/kara/composer")
>("K1_TEP_COMPOSER", "composer.tsx");

const KhoiSteps = await nap<typeof import("../src/components/kara/steps")>(
	"K1_TEP_STEPS",
	"steps.tsx",
);

const KhoiArtifact = await nap<
	typeof import("../src/components/kara/artifact")
>("K1_TEP_ARTIFACT", "artifact.tsx");

const VI = messages("vi");

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function ve(cay: ReactElement, locale: Locale = "vi"): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() =>
		root?.render(<LocaleProvider locale={locale}>{cay}</LocaleProvider>),
	);
	return o;
}

function veLai(cay: ReactElement, locale: Locale = "vi") {
	act(() =>
		root?.render(<LocaleProvider locale={locale}>{cay}</LocaleProvider>),
	);
}

function phai(dieu: boolean, thongDiep: string) {
	if (!dieu) throw new Error(thongDiep);
}

function nutTen(goc: ParentNode, ten: string): HTMLButtonElement[] {
	return [...goc.querySelectorAll("button")].filter(
		(b) => (b.textContent ?? "").trim() === ten,
	);
}

async function cho(ms: number) {
	await act(async () => {
		await new Promise((ok) => setTimeout(ok, ms));
	});
}

function laChamBan(goc: ParentNode): boolean {
	return [...goc.querySelectorAll('[aria-hidden="true"]')].some(
		(e) => e.tagName === "SPAN" && e.children.length > 1,
	);
}

type KyVongState = {
	empty: boolean;
	status: boolean;
	thuLai: number;
	moTaO: boolean;
};

const KY_VONG_STATE: Record<
	"working" | "empty" | "error" | "off" | "unconfigured",
	KyVongState
> = {
	working: { empty: false, status: true, thuLai: 0, moTaO: false },
	empty: { empty: true, status: false, thuLai: 0, moTaO: false },
	error: { empty: true, status: false, thuLai: 1, moTaO: false },
	off: { empty: false, status: false, thuLai: 0, moTaO: true },
	unconfigured: { empty: true, status: false, thuLai: 0, moTaO: false },
};

describe("k1-state", () => {
	const { KaraState } = KhoiState;

	function dung(kind: keyof typeof KY_VONG_STATE, onRetry = () => {}) {
		switch (kind) {
			case "working":
				return <KaraState kind="working" label="⟦dang⟧" delayMs={0} />;
			case "empty":
				return <KaraState kind="empty" title="⟦t⟧" description="⟦m⟧" />;
			case "error":
				return <KaraState kind="error" what="soạn" onRetry={onRetry} />;
			case "off":
				return <KaraState kind="off" reason="⟦ly do⟧" />;
			case "unconfigured":
				return <KaraState kind="unconfigured" description="⟦ai bat⟧" />;
		}
	}

	test("năm kind theo bảng ghi trước", () => {
		let soO = 0;
		for (const kind of Object.keys(
			KY_VONG_STATE,
		) as (keyof typeof KY_VONG_STATE)[]) {
			const ky = KY_VONG_STATE[kind];
			const o = ve(dung(kind));
			const empty = o.querySelector('[data-slot="empty"]');
			phai(Boolean(empty) === ky.empty, `empty sai o ${kind}`);
			if (empty) {
				phai(
					empty.getAttribute("data-border") === "solid" &&
						empty.getAttribute("data-size") === "compact",
					`empty sai khuon o ${kind}`,
				);
			}
			phai(
				Boolean(o.querySelector('[role="status"]')) === ky.status,
				`status sai o ${kind}`,
			);
			phai(
				nutTen(o, VI.karaKhung.thuLai).length === ky.thuLai,
				`so nut thu lai sai o ${kind}`,
			);
			phai(
				Boolean(o.querySelector('[data-slot="field-description"]')) ===
					ky.moTaO,
				`mo ta sai o ${kind}`,
			);
			phai(
				!o.querySelector('[data-slot="alert"], [data-slot="spinner"]'),
				`co spinner tran o ${kind}`,
			);
			act(() => root?.unmount());
			root = null;
			document.body.innerHTML = "";
			soO += 1;
		}
		console.log(`so o: ${soO}`);
		expect(soO).toBe(5);
	});

	test("error: tiêu đề và Thử lại", () => {
		let goi = 0;
		const o = ve(dung("error", () => (goi += 1)));
		expect(o.textContent).toContain(VI.karaKhung.chuaDuoc("soạn"));
		act(() => nutTen(o, VI.karaKhung.thuLai)[0]?.click());
		expect(goi).toBe(1);
	});

	test("working hiện sau trễ, không trước", async () => {
		const o = ve(<KaraState kind="working" label="⟦dang doc⟧" delayMs={200} />);
		phai(!o.querySelector('[role="status"]'), "working hien truoc tre");
		await cho(260);
		const st = o.querySelector('[role="status"]');
		phai(
			Boolean(st?.textContent?.includes("⟦dang doc⟧")),
			"working khong hien",
		);
		phai(laChamBan(st as Element), "thieu cham ban");
	});

	test("gỡ trước hạn không cập nhật sau khi gỡ", async () => {
		const loi: unknown[] = [];
		const goc = console.error;
		console.error = (...a: unknown[]) => loi.push(a);
		try {
			ve(<KaraState kind="working" label="x" delayMs={100} />);
			act(() => root?.unmount());
			root = null;
			await cho(150);
		} finally {
			console.error = goc;
		}
		expect(loi).toEqual([]);
	});
});

function tepKara(): string[] {
	return readdirSync(THU_MUC_KARA, { withFileTypes: true })
		.filter((d) => d.isFile() && d.name.endsWith(".tsx"))
		.map((d) => d.name);
}

function laThuLaiDung(b: HTMLButtonElement): boolean {
	return (
		b.getAttribute("data-variant") === "outline" &&
		b.getAttribute("data-size") === "sm" &&
		!b.querySelector("svg")
	);
}

describe("k1-thu-lai", () => {
	const { KaraRetry, KaraState } = KhoiState;

	test("chữ Thử lại chỉ dùng trong state.tsx", () => {
		const ngoai = tepKara()
			.filter((t) => t !== "state.tsx")
			.filter((t) =>
				readFileSync(join(THU_MUC_KARA, t), "utf8").includes(
					"karaKhung.thuLai",
				),
			);
		expect(ngoai).toEqual([]);
	});

	test("KaraRetry một cỡ", () => {
		const o = ve(<KaraRetry onClick={() => {}} />);
		const nut = o.querySelector("button") as HTMLButtonElement;
		phai(nut.getAttribute("data-size") === "sm", "thu lai sai co");
		phai(!nut.querySelector("svg"), "thu lai co icon");
		phai(laThuLaiDung(nut), "thu lai sai bien the");
		expect(nut.textContent).toBe(VI.karaKhung.thuLai);
	});

	test("mọi Thử lại trong các khối đúng cỡ", () => {
		const o = ve(
			<>
				<KaraState kind="error" what="đọc" onRetry={() => {}} />
				<KhoiSteps.KaraSteps
					steps={[{ id: "a", label: "⟦doc⟧", state: "error" }]}
					onRetry={() => {}}
				/>
			</>,
		);
		const nut = nutTen(o, VI.karaKhung.thuLai);
		expect(nut.length).toBe(2);
		for (const b of nut) phai(laThuLaiDung(b), "thu lai sai co");
	});
});

type BoiCanh = "ban" | "ranh" | "ngoai";
type TrangThaiDeXuat = "cho" | "da-nhan" | "da-bo-qua";

const MA_TRAN_KHOA: readonly [TrangThaiDeXuat, BoiCanh][] = (
	["cho", "da-nhan", "da-bo-qua"] as const
).flatMap((t) =>
	(["ban", "ranh", "ngoai"] as const).map(
		(b) => [t, b] as [TrangThaiDeXuat, BoiCanh],
	),
);

function hanhDong(dem: { n: number }): ProposedChangeAction[] {
	return [
		{ id: "doi", label: "⟦doi⟧", tone: "primary", onClick: () => (dem.n += 1) },
		{ id: "bo", label: "⟦bo⟧", tone: "quiet", onClick: () => (dem.n += 1) },
	];
}

function daQuyet(
	t: TrangThaiDeXuat,
	undo: { n: number },
): ProposedChangeDecided | undefined {
	if (t === "cho") return undefined;
	return {
		decision: t === "da-nhan" ? "accepted" : "skipped",
		text: "⟦da quyet⟧",
		onUndo: () => (undo.n += 1),
	};
}

function boc(b: BoiCanh, cay: ReactElement): ReactElement {
	if (b === "ngoai") return cay;
	return (
		<KaraBusyProvider busy={b === "ban" ? { label: "⟦ban⟧" } : null}>
			{cay}
		</KaraBusyProvider>
	);
}

describe("k1-khoa", () => {
	const { KaraProposal } = KhoiProposal;

	test("ma trận 9 ô", () => {
		let soO = 0;
		for (const [t, b] of MA_TRAN_KHOA) {
			const dem = { n: 0 };
			const undo = { n: 0 };
			const o = ve(
				boc(
					b,
					<KaraProposal
						kind="rewrite"
						value="⟦moi⟧"
						before="⟦cu⟧"
						actions={hanhDong(dem)}
						decided={daQuyet(t, undo)}
					/>,
				),
			);
			const nutDx = [
				...o.querySelectorAll<HTMLButtonElement>("button[data-hanh-dong]"),
			];
			const hoanTac = nutTen(o, VI.proposedChange.undo);
			if (t === "cho" && b === "ban") {
				phai(nutDx.length === 2, `thieu nut o ${t}/${b}`);
				for (const n of nutDx) {
					phai(n.disabled === true, "cho mo khi ban");
					const id = n.getAttribute("aria-describedby");
					phai(
						Boolean(id) &&
							document.getElementById(id ?? "")?.textContent ===
								VI.karaKhung.dangSoanKhoa,
						"cho mo khi ban",
					);
				}
			} else if (t !== "cho" && b === "ban") {
				phai(hoanTac.length === 1, `thieu hoan tac o ${t}/${b}`);
				phai(hoanTac[0]?.matches(":disabled") === true, "hoan tac mo khi ban");
			} else if (t === "cho") {
				for (const n of nutDx) phai(!n.disabled, `khoa nham o ${t}/${b}`);
				act(() => nutDx[0]?.click());
				phai(dem.n === 1, `nut khong goi o ${t}/${b}`);
			} else {
				phai(
					hoanTac.length === 1 && !hoanTac[0]?.matches(":disabled"),
					`khoa nham o ${t}/${b}`,
				);
				act(() => hoanTac[0]?.click());
				phai(undo.n === 1, `hoan tac khong goi o ${t}/${b}`);
			}
			act(() => root?.unmount());
			root = null;
			document.body.innerHTML = "";
			soO += 1;
		}
		console.log(`so o: ${soO}`);
		expect(soO).toBe(9);
	});

	test("hết bận thì mở lại, không đổi props", () => {
		const dem = { n: 0 };
		const hd = hanhDong(dem);
		const cay = (busy: boolean) => (
			<KaraBusyProvider busy={busy ? { label: "⟦ban⟧" } : null}>
				<KaraProposal kind="rewrite" value="⟦moi⟧" actions={hd} />
			</KaraBusyProvider>
		);
		const o = ve(cay(true));
		phai(
			[
				...o.querySelectorAll<HTMLButtonElement>("button[data-hanh-dong]"),
			].every((n) => n.disabled),
			"cho mo khi ban",
		);
		veLai(cay(false));
		const nut = [
			...o.querySelectorAll<HTMLButtonElement>("button[data-hanh-dong]"),
		];
		phai(
			nut.length === 2 && nut.every((n) => !n.disabled),
			"khong mo lai khi het ban",
		);
	});

	test("KaraBusy lồng nhau: bận ở tầng cha thì con thấy bận", () => {
		const o = ve(
			<KaraBusyProvider busy={{ label: "⟦cha⟧" }}>
				<KaraBusyProvider busy={null}>
					<KaraProposal
						kind="rewrite"
						value="⟦moi⟧"
						actions={hanhDong({ n: 0 })}
					/>
				</KaraBusyProvider>
			</KaraBusyProvider>,
		);
		phai(
			[
				...o.querySelectorAll<HTMLButtonElement>("button[data-hanh-dong]"),
			].every((n) => n.disabled),
			"busy long nhau mat",
		);
	});
});

const ENTRIES = [
	{ id: "a", status: "pending", batchable: true },
	{ id: "b", status: "pending", batchable: true },
	{ id: "c", status: "pending", batchable: false },
	{ id: "d", status: "decided", batchable: true },
	{ id: "e", status: "decided", batchable: false },
] as const;

describe("k1-nhom", () => {
	const { KaraProposalGroup, KaraProposal } = KhoiProposal;

	function nhom(
		entries: readonly {
			id: string;
			status: "pending" | "decided";
			batchable: boolean;
		}[],
		goi: string[][],
		extra: Partial<Parameters<typeof KaraProposalGroup>[0]> = {},
	) {
		return (
			<KaraProposalGroup
				entries={entries}
				reason="⟦vi sao⟧"
				batch={{ label: "⟦nhan ca nhom⟧", onAccept: (ids) => goi.push(ids) }}
				{...extra}
			>
				{entries.map((e) => (
					<KaraProposal
						key={e.id}
						kind="rewrite"
						value={`⟦${e.id}⟧`}
						actions={hanhDong({ n: 0 })}
						decided={
							e.status === "decided"
								? { decision: "accepted", text: "⟦x⟧" }
								: undefined
						}
					/>
				))}
			</KaraProposalGroup>
		);
	}

	test("nhãn một lần, đếm từ đề xuất chờ, nhận cả nhóm", () => {
		const goi: string[][] = [];
		const o = ve(nhom(ENTRIES, goi));
		const nhan = o.querySelectorAll('[data-slot="kara-label"]');
		phai(nhan.length === 1, `nhan lap: ${nhan.length}`);
		const chu = nhan[0]?.textContent ?? "";
		phai(
			chu.includes(VI.karaKhung.nhomDeXuat("3")),
			`dem sai: ${chu.match(/\d+/)?.[0]} != 3`,
		);
		const deXuat = o.querySelectorAll('[data-slot="proposed-change"]');
		for (const d of deXuat)
			phai(
				!d.querySelector('[data-slot="kara-label"], [data-slot="kara-mark"]'),
				"nhan rieng tung dong",
			);
		const nut = nutTen(o, "⟦nhan ca nhom⟧")[0];
		act(() => nut?.click());
		phai(goi.length === 1, "nhan ca nhom khong goi");
		phai(
			JSON.stringify(goi[0]) === JSON.stringify(["a", "b"]),
			`gui id khong batchable: ${JSON.stringify(goi[0])}`,
		);
		veLai(
			nhom(
				ENTRIES.map((e) =>
					e.id === "c" ? { ...e, status: "decided" as const } : e,
				),
				goi,
			),
		);
		phai(
			(o.querySelector('[data-slot="kara-label"]')?.textContent ?? "").includes(
				VI.karaKhung.nhomDeXuat("2"),
			),
			"dem khong doi theo entries",
		);
	});

	test("khoá nút nhóm khi hết id hoặc khi bận", () => {
		const goi: string[][] = [];
		const o = ve(
			nhom(
				ENTRIES.map((e) => ({ ...e, batchable: false })),
				goi,
			),
		);
		phai(
			nutTen(o, "⟦nhan ca nhom⟧")[0]?.disabled === true,
			"nut nhom mo khi het id",
		);
		veLai(
			<KaraBusyProvider busy={{ label: "⟦ban⟧" }}>
				{nhom(ENTRIES, goi)}
			</KaraBusyProvider>,
		);
		phai(
			nutTen(o, "⟦nhan ca nhom⟧")[0]?.disabled === true,
			"nut nhom mo khi ban",
		);
	});

	test("biên nhận nhóm có Hoàn tác", () => {
		let undo = 0;
		const o = ve(
			nhom(ENTRIES, [], {
				batchDecided: { text: "⟦da them 2⟧", onUndo: () => (undo += 1) },
			}),
		);
		const st = [...o.querySelectorAll('[role="status"]')].find((e) =>
			e.textContent?.includes("⟦da them 2⟧"),
		);
		phai(Boolean(st), "thieu bien nhan nhom");
		act(() => nutTen(st as Element, VI.proposedChange.undo)[0]?.click());
		expect(undo).toBe(1);
	});
});

describe("k1-transcript", () => {
	const { KaraTranscript, KaraTurn, KaraSystemLine, KaraCheckpoint } =
		KhoiTranscript;
	const PHAN_TU = ["user", "kara", "system", "checkpoint"] as const;

	test("bốn phần tử viết trước", () => {
		let chon = 0;
		const o = ve(
			<KaraTranscript>
				<KaraTurn from="user">⟦nguoi⟧</KaraTurn>
				<KaraTurn from="kara">⟦kara⟧</KaraTurn>
				<KaraSystemLine>⟦he thong⟧</KaraSystemLine>
				<KaraCheckpoint summary="⟦tom tat⟧" onSelect={() => (chon += 1)} />
			</KaraTranscript>,
		);
		let khang = 0;
		for (const loai of PHAN_TU) {
			const el = o.querySelector(`[data-kara-turn="${loai}"]`);
			phai(Boolean(el), `thieu ${loai}`);
			khang += 1;
		}
		const nguoi = o.querySelector('[data-kara-turn="user"]');
		phai(
			Boolean(nguoi?.classList.contains("is-user")),
			"luot nguoi khong la Message user",
		);
		const kara = o.querySelector('[data-kara-turn="kara"]') as Element;
		phai(
			Boolean(kara.querySelector(".is-assistant")),
			"luot kara khong la Message assistant",
		);
		const avatar = kara.querySelectorAll('[data-slot="message-avatar"]');
		phai(avatar.length === 1, "avatar khong dung mot");
		phai(
			avatar[0]?.querySelectorAll('svg[aria-hidden="true"]').length === 1,
			"avatar khong co dau tia sang",
		);
		phai(
			avatar[0]?.querySelector(".sr-only")?.textContent === "Kara",
			"avatar thieu ten Kara",
		);
		phai(o.querySelectorAll("img").length === 0, "avatar co anh");
		khang += 5;
		const he = o.querySelector('[data-kara-turn="system"]') as Element;
		phai(
			!he.closest('[class*="is-assistant"], [class*="is-user"]'),
			"dong he thong nam trong bong bong",
		);
		phai(
			he.classList.contains("text-muted-foreground"),
			"dong he thong khong la chu phu",
		);
		khang += 2;
		const moc = o.querySelector(
			'[data-kara-turn="checkpoint"] button',
		) as HTMLButtonElement;
		phai(
			Boolean(moc) && moc.textContent === VI.karaKhung.moc("⟦tom tat⟧"),
			"moc khong la nut",
		);
		act(() => moc.click());
		phai(chon === 1, "moc khong goi");
		khang += 2;
		console.log(`so khang dinh: ${khang}`);
		expect(khang).toBe(13);
	});

	test("hội thoại rỗng mang dấu Kara", () => {
		const o = ve(<KaraTranscript />);
		const rong = o.querySelector('[data-slot="conversation-empty-state"]');
		phai(
			Boolean(rong?.querySelector('[data-slot="kara-mark"]')),
			"rong thieu dau Kara",
		);
		expect(rong?.textContent).toContain(VI.karaKhung.hoiThoaiRongTieuDe);
	});
});

async function guiChu(goc: ParentNode, chu: string) {
	const o = goc.querySelector("textarea") as HTMLTextAreaElement;
	const datGiaTri = Object.getOwnPropertyDescriptor(
		HTMLTextAreaElement.prototype,
		"value",
	)?.set;
	act(() => {
		datGiaTri?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
	await act(async () => {
		o.form?.requestSubmit();
		await new Promise((ok) => setTimeout(ok, 0));
	});
}

describe("k1-composer", () => {
	const { KaraComposer } = KhoiComposer;
	const O = ["gui", "ban-status", "ban-busy", "chip", "goi-y", "khoa"] as const;

	test("ma trận 6 ô", async () => {
		let soO = 0;
		for (const oo of O) {
			const goi = { gui: [] as string[], dung: 0, bo: 0, goiY: [] as string[] };
			const cay = (
				<KaraComposer
					onSubmit={(t) => goi.gui.push(t)}
					onStop={() => (goi.dung += 1)}
					status={oo === "ban-status" ? "busy" : "ready"}
					context={
						oo === "chip"
							? { label: "⟦ve KR 1.3⟧", onRemove: () => (goi.bo += 1) }
							: undefined
					}
					suggestions={oo === "goi-y" ? ["⟦g1⟧", "⟦g2⟧"] : undefined}
					onSuggestion={(t) => goi.goiY.push(t)}
					lockedReason={oo === "khoa" ? "⟦het luot⟧" : undefined}
				/>
			);
			const o = ve(
				oo === "ban-busy" ? (
					<KaraBusyProvider busy={{ label: "⟦b⟧" }}>{cay}</KaraBusyProvider>
				) : (
					cay
				),
			);
			if (oo === "gui") {
				await guiChu(o, "  chào  ");
				phai(
					JSON.stringify(goi.gui) === JSON.stringify(["chào"]),
					`gui sai: ${JSON.stringify(goi.gui)}`,
				);
			}
			if (oo === "ban-status" || oo === "ban-busy") {
				const nut = o.querySelector(
					`button[aria-label="${VI.promptInput.stop}"]`,
				) as HTMLButtonElement | null;
				phai(
					Boolean(nut),
					oo === "ban-busy" ? "busy khong doi nut" : "status khong doi nut",
				);
				act(() => nut?.click());
				phai(goi.dung === 1 && goi.gui.length === 0, `dung goi sai o ${oo}`);
			}
			if (oo === "chip") {
				phai((o.textContent ?? "").includes("⟦ve KR 1.3⟧"), "thieu chip");
				const go = o.querySelector(
					`button[aria-label="${VI.karaKhung.boNguCanh("⟦ve KR 1.3⟧")}"]`,
				) as HTMLButtonElement | null;
				phai(Boolean(go), "chip thieu nut go co ten");
				act(() => go?.click());
				phai(goi.bo === 1, "go chip khong goi");
				phai(
					document.activeElement === o.querySelector("textarea"),
					"go chip khong tra focus",
				);
			}
			if (oo === "goi-y") {
				act(() => nutTen(o, "⟦g2⟧")[0]?.click());
				phai(
					JSON.stringify(goi.goiY) === JSON.stringify(["⟦g2⟧"]),
					"goi y sai",
				);
			}
			if (oo === "khoa") {
				const ta = o.querySelector("textarea") as HTMLTextAreaElement;
				const gui = o.querySelector(
					'button[type="submit"]',
				) as HTMLButtonElement;
				phai(ta.disabled && gui.disabled, "khoa khong khoa");
				const mo = document.getElementById(
					ta.getAttribute("aria-describedby") ?? "",
				);
				phai(
					mo?.getAttribute("data-slot") === "field-description" &&
						mo.textContent === "⟦het luot⟧",
					"ly do khoa khong tro",
				);
			}
			act(() => root?.unmount());
			root = null;
			document.body.innerHTML = "";
			soO += 1;
		}
		console.log(`so o: ${soO}`);
		expect(soO).toBe(6);
	});

	test("chữ toàn khoảng trắng không gửi", async () => {
		const gui: string[] = [];
		const o = ve(<KaraComposer onSubmit={(t) => gui.push(t)} />);
		await guiChu(o, "   ");
		expect(gui).toEqual([]);
	});
});

describe("k1-steps", () => {
	const { KaraSteps } = KhoiSteps;
	const O = {
		xong: [
			{ id: "1", label: "⟦doc muc tieu⟧", state: "done" },
			{ id: "2", label: "⟦doc 3 KR⟧", state: "done" },
			{ id: "3", label: "⟦so voi quy truoc⟧", state: "done" },
		],
		"dang-chay": [
			{ id: "1", label: "⟦doc muc tieu⟧", state: "done" },
			{ id: "2", label: "⟦doc 3 KR⟧", state: "running" },
		],
		loi: [
			{ id: "1", label: "⟦doc muc tieu⟧", state: "done" },
			{ id: "2", label: "⟦doc 3 KR⟧", state: "error" },
		],
	} as const;

	test("ma trận 3 ô", () => {
		let soO = 0;
		for (const [ten, buoc] of Object.entries(O)) {
			const o = ve(<KaraSteps steps={buoc} />);
			const goc = o.querySelector("[data-kara-steps]") as Element;
			phai(goc?.getAttribute("data-slot") === "collapsible", "goc khong la Collapsible cua task");
			const trigger = o.querySelector("button") as HTMLButtonElement;
			const mo = goc.getAttribute("data-state") === "open";
			if (ten === "xong") {
				phai(trigger.textContent?.includes(VI.karaKhung.daLamBuoc("3")) === true, "tieu de xong sai");
				phai(!mo, "buoc xong khong gap");
			} else if (ten === "dang-chay") {
				phai(trigger.textContent?.includes("⟦doc 3 KR⟧") === true, "tieu de dang chay sai");
				phai(mo, "dang chay khong mo");
			} else {
				phai(mo, "loi khong mo");
				const loi = o.querySelector('[data-trang-thai="loi"]');
				phai(Boolean(loi?.querySelector('[data-slot="status-indicator"][data-tone="error"]')), "buoc loi thieu dau");
			}
			if (mo)
				for (const b of buoc)
					phai((o.textContent ?? "").includes(b.label), `thieu chu buoc ${b.label}`);
			phai(!o.querySelector("pre, code, [data-slot=code-block]"), "co khoi ma");
			act(() => root?.unmount());
			root = null;
			document.body.innerHTML = "";
			soO += 1;
		}
		console.log(`so o: ${soO}`);
		expect(soO).toBe(3);
	});
});

describe("k1-artifact", () => {
	const { KaraArtifact } = KhoiArtifact;
	const { KaraProposal } = KhoiProposal;

	function khung(busy: boolean) {
		return (
			<KaraArtifact
				title="⟦ban nhap⟧"
				meta="⟦9 dong⟧"
				actions={<button type="button">⟦phu⟧</button>}
				footer={<button type="button">⟦dua vao⟧</button>}
				busy={busy ? { label: "⟦dang soan⟧" } : null}
			>
				<KaraProposal kind="rewrite" value="⟦moi⟧" actions={hanhDong({ n: 0 })} />
			</KaraArtifact>
		);
	}

	test("đầu, thân, chân", () => {
		const o = ve(khung(false));
		const dau = o.querySelector('[data-slot="kara-artifact-header"]') as Element;
		const than = o.querySelector('[data-slot="kara-artifact-content"]') as Element;
		const chan = o.querySelector('[data-slot="kara-artifact-footer"]') as Element;
		phai(o.querySelectorAll('[data-slot="kara-mark"]').length === 1, "dau Kara lap");
		phai(Boolean(dau.querySelector('[data-slot="kara-mark"]')), "dau Kara khong o dau khung");
		phai((dau.textContent ?? "").includes("⟦9 dong⟧"), "meta khong o dau khung");
		phai(Boolean(dau.compareDocumentPosition(than) & Node.DOCUMENT_POSITION_FOLLOWING), "than khong sau dau");
		phai(Boolean(than.compareDocumentPosition(chan) & Node.DOCUMENT_POSITION_FOLLOWING), "chan khong sau than");
		phai(than.classList.contains("overflow-auto"), "than khong cuon rieng");
		phai([...o.querySelectorAll<HTMLButtonElement>("button[data-hanh-dong]")].every((n) => !n.disabled), "khoa nham khi ranh");
	});

	test("bận: đầu khung báo, thân khoá", async () => {
		const o = ve(khung(true));
		phai(
			[...o.querySelectorAll<HTMLButtonElement>("button[data-hanh-dong]")].every((n) => n.disabled),
			"than khong khoa khi ban",
		);
		await cho(1060);
		const st = o.querySelector('[data-slot="kara-artifact-header"] [role="status"]');
		phai(Boolean(st?.textContent?.includes("⟦dang soan⟧")), "dau khung thieu chu ban");
		phai(laChamBan(st as Element), "dau khung thieu cham ban");
	});
});
