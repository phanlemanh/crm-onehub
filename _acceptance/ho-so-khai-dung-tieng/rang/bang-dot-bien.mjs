const HO_SO = "_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs";
const MOT_DUONG = "_acceptance/ho-so-khai-dung-tieng/rang/mot-duong.mjs";
const HOI_QUY = "_acceptance/ho-so-khai-dung-tieng/rang/hoi-quy-nam-cho.mjs";

const CS = "apps/app/components/crm/record-sheet/company-sheet.tsx";
const CN = "apps/app/components/crm/record-sheet/contact-sheet.tsx";
const RP = "apps/app/components/crm/record-sheet/record-parts.tsx";
const TL = "apps/app/components/crm/timeline/timeline-entry.tsx";
const CD = "apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx";
const FT = "packages/ui/src/components/foreign-text.tsx";
const NGOAI = "apps/app/components/crm/record-sheet/record-actions.tsx";

export const chanHoSo = (ten) => ({ lenh: "bun", doi_so: [HO_SO, ten] });
export const chanKiem = () => ({
	lenh: "bun",
	doi_so: ["test", "--preload", "./test/setup-dom.ts", "test/khai-tieng.spec.tsx"],
	duoi: "packages/ui",
});

export const DOT_BIEN = [
	{ chan: "E1", mo_ta: "go ForeignText quanh gioi thieu cong ty", tep: CS,
		cu: `							<DetailSheetProse>
								<ForeignText lang="en">{company.description}</ForeignText>
							</DetailSheetProse>`,
		moi: "							<DetailSheetProse>{company.description}</DetailSheetProse>",
		do: chanHoSo("gioi-thieu"), ghim: "lech-boc:gioi-thieu" },
	{ chan: "E2", mo_ta: "go ForeignText quanh tom tat ca nhan", tep: CN,
		cu: `			<DetailSheetProse>
				<ForeignText lang="en">{brief.narrative}</ForeignText>
			</DetailSheetProse>`,
		moi: "			<DetailSheetProse>{brief.narrative}</DetailSheetProse>",
		do: chanHoSo("tom-tat-lien-he"), ghim: "lech-boc:tom-tat-lien-he" },
	{ chan: "E3", mo_ta: "bo khai lang cho phan tu nganh cua MetaLine", tep: CS,
		cu: `parts={[{ text: location }, { text: company.industry, lang: "en" }]}`,
		moi: "parts={[{ text: location }, { text: company.industry }]}",
		do: chanHoSo("nganh"), ghim: "lech-boc:nganh" },
	{ chan: "E4", mo_ta: "tra headline dong thoi gian ve template literal", tep: TL,
		cu: `	const headline = change ? (
		<>
			<ForeignText lang="en">{dealStageLabel(change.from)}</ForeignText>
			{" → "}
			<ForeignText lang="en">{dealStageLabel(change.to)}</ForeignText>
		</>
	) : (
		entry.subject
	);`,
		moi: `	const headline = change
		? \`\${dealStageLabel(change.from)} → \${dealStageLabel(change.to)}\`
		: entry.subject;`,
		do: chanHoSo("dong-thoi-gian"), ghim: "lech-boc:dong-thoi-gian" },
	{ chan: "E5", mo_ta: "khai lang cho phan tu dia danh (khai thua)", tep: CS,
		cu: `parts={[{ text: location }, { text: company.industry, lang: "en" }]}`,
		moi: `parts={[{ text: location, lang: "en" }, { text: company.industry, lang: "en" }]}`,
		do: chanHoSo("khong-khai-thua"), ghim: "lech-boc:khong-khai-thua" },
	{ chan: "E6a", mo_ta: "doi mot cho goi ve <p lang=en> viet tay", tep: CD,
		cu: `<ForeignText lang="en">
												{dealStageLabel(value)}
											</ForeignText>`,
		moi: `<p lang="en">{dealStageLabel(value)}</p>`,
		do: { lenh: "bun", doi_so: [MOT_DUONG] }, ghim: "CON VIET TAY" },
	{ chan: "E6b", mo_ta: "them ForeignText o tep NGOAI ban kiem ke", tep: NGOAI,
		cu: "export function RecordActions({",
		moi: `import { ForeignText } from "@crm/ui/components/foreign-text";

export function RangThuaNgoaiKiemKe() {
	return <ForeignText lang="en">x</ForeignText>;
}

export function RecordActions({`,
		do: { lenh: "bun", doi_so: [MOT_DUONG] }, ghim: "THUA" },
	{
		chan: "E6c",
		mo_ta: "dinh nghia ForeignText tai cho thay vi nhap tu @crm/ui",
		tep: RP,
		cu: `import { ForeignText } from "@crm/ui/components/foreign-text";`,
		moi: [
			"function ForeignText({ lang, className, children }) {",
			"	return <span lang={lang} className={className}>{children}</span>;",
			"}",
		].join("\n"),
		do: { lenh: "bun", doi_so: [MOT_DUONG] },
		ghim: "KHONG NHAP TU @crm/ui",
	},
	{ chan: "E7a", mo_ta: "bo attribute lang khoi ForeignText", tep: FT,
		cu: "<span lang={lang} className={className}>", moi: "<span className={className}>",
		do: chanKiem(), ghim: "chieu a" },
	{ chan: "E7b", mo_ta: "khai lang cho MOI phan tu cua MetaLine", tep: RP,
		cu: "		rest.push({ text: value, lang: part?.lang });",
		moi: '		rest.push({ text: value, lang: part?.lang ?? "en" });',
		do: chanKiem(), ghim: "chieu b" },
	{ chan: "E7c", mo_ta: "khu trung lap tren phan tu tho thay vi tren text", tep: RP,
		cu: "		const key = value.toLowerCase();", moi: "		const key = JSON.stringify(part);",
		do: chanKiem(), ghim: "chieu c" },
	{ chan: "E8", mo_ta: "ve ForeignText khong dieu kien, ke ca khi gia tri rong", tep: CS,
		cu: `					{company.description ? (`,
		moi: `					<DetailSheetProse>
						<ForeignText lang="en">{company.description}</ForeignText>
					</DetailSheetProse>
					{company.description ? (`,
		do: chanHoSo("ho-so-trong"), ghim: "phan-tu-rong-dem-duoc:" },
	{ chan: "E9", mo_ta: "boc ForeignText quanh ca khoi Gioi thieu", tep: CS,
		cu: `						<DetailSheetSection title={m.section.about}>
							<DetailSheetProse>
								<ForeignText lang="en">{company.description}</ForeignText>
							</DetailSheetProse>
						</DetailSheetSection>`,
		moi: `						<ForeignText lang="en">
							<DetailSheetSection title={m.section.about}>
								<DetailSheetProse>{company.description}</DetailSheetProse>
							</DetailSheetSection>
						</ForeignText>`,
		do: chanHoSo("tieng-trang"), ghim: "tieng-viet-lot" },
	{ chan: "E12", mo_ta: "bo attribute lang khoi ForeignText (nhin tu man danh sach)", tep: FT,
		cu: "<span lang={lang} className={className}>", moi: "<span className={className}>",
		do: { lenh: "bun", doi_so: [HOI_QUY] }, ghim: "MAN DANH SACH" },
];

export const CHAN_UI = [
	"gioi-thieu", "tom-tat-lien-he", "nganh", "dong-thoi-gian",
	"khong-khai-thua", "ho-so-trong", "tieng-trang",
];
