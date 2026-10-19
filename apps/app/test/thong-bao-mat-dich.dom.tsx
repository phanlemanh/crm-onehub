import { afterEach, describe, expect, mock, test } from "bun:test";
import { cho, dat, dongHet, mo } from "./khung-gop-y";

const eveThat = await import("eve/react");
mock.module("eve/react", () => ({
	...eveThat,
	useEveAgent: () => ({
		status: "ready",
		error: undefined,
		data: { messages: [] },
		session: null,
		send: async () => {},
	}),
}));

const { DetailSheet } = await import("@/components/detail-sheet");
const { KhungViec } = await import("@/components/viec/khung-viec");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { karaBanGhiMessages } = await import("@/lib/messages/kara-ban-ghi");
const { trangLoiMessages } = await import("@/lib/messages/trang-loi");

const TRANG_LOI = trangLoiMessages("vi").tieuDe;

const VI = karaBanGhiMessages("vi").khung;

type Ma = "NOT_FOUND" | "FORBIDDEN";

const CA = [
	{ ma: "NOT_FOUND", lyDo: "khong-con", tieuDe: VI.khongCon.tieuDe },
	{ ma: "FORBIDDEN", lyDo: "khong-quyen", tieuDe: VI.khongQuyen.tieuDe },
] as const satisfies readonly { ma: Ma; lyDo: string; tieuDe: string }[];

const khung = () => document.querySelector("[data-khung-tai-loi]");

afterEach(async () => {
	await dongHet();
});

describe("mat-dich", () => {
	for (const ca of CA) {
		test(`mat-dich: thong bao dan toi viec ${ca.ma} — ngan Viec noi ly do`, async () => {
			dat("users.list", () => []);
			dat("viec.get", () => {
				throw Object.assign(new Error("loi-tho"), { data: { code: ca.ma } });
			});
			await mo(
				<DetailSheet open onOpenChange={() => {}}>
					<LocaleProvider locale="vi">
						<KhungViec viecId="v-mat" />
					</LocaleProvider>
				</DetailSheet>,
				{ searchParams: "record=viec:v-mat" },
			);
			await cho(() => khung() !== null, `viec ${ca.ma} khung`);
			expect(
				document.body.textContent?.includes(TRANG_LOI),
				"thong bao dan toi ban ghi da xoa mo trang loi chung",
			).toBe(false);
			expect(khung()?.getAttribute("data-ly-do")).toBe(ca.lyDo);
			expect(khung()?.textContent ?? "").toContain(ca.tieuDe);
			expect(khung()?.textContent ?? "").not.toContain("loi-tho");
		});
	}
});
