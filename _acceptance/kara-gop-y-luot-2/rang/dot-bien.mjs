import fs from "node:fs";
import path from "node:path";
import { ROOT, bam, chayVo, ghiRa, lenhCauHinh } from "./chung.mjs";

const OKR = "apps/app/app/(app)/[slug]/okr";
const CHAN = [
	"k3_khung", "k3_tai_loi", "k3_nho_loi", "k3_qua_han", "k3_tat", "k3_loi_dong",
	"k3_can_chinh", "k3_hai_hoan", "k3_chip", "k3_nhieu_kr", "k3_nhieu_kr_ui", "k3_neo_kr",
];

const thay = (a, b) => (s) => {
	const lan = s.split(a).length - 1;
	if (lan !== 1) throw new Error(`vet khong cam duoc: «${a}» xuat hien ${lan} lan`);
	return s.replace(a, b);
};
const noi = (...buoc) => (s) => buoc.reduce((x, f) => f(x), s);

const VET = [
	{ ten: "(a) bo media={false}", tep: `${OKR}/nhom-kara.tsx`, cam: thay("media={false}", "media"), doi: [["k3_khung", "tia sang trong vung"]] },
	{ ten: "(b) tai loi tra tat", tep: `${OKR}/gop-y-kara.ts`, cam: thay('if (danhSach.isError && ds === undefined) return "tai-loi";', 'if (danhSach.isError && ds === undefined) return "tat";'), doi: [["k3_tai_loi", "vung kara bien mat khi tai loi"]] },
	{ ten: "(c) quaHan doi batDau", tep: `${OKR}/gop-y-kara.ts`, cam: thay("thayDocLuc !== null &&\n\t\tMath.max(", "batDau !== null &&\n\t\tthayDocLuc !== null &&\n\t\tMath.max("), doi: [["k3_qua_han", "cho mai"]] },
	{ ten: "(d) in e.message", tep: `${OKR}/gop-y-kara.ts`, cam: thay("cauLoiDong(cause, mGopY)", "cause instanceof Error ? cause.message : String(cause)"), doi: [["k3_loi_dong", "lo cau tho: clx"]] },
	{ ten: "(e) callback chung cua mutation", tep: `${OKR}/gop-y-kara.ts`, cam: thay("await suaKr.mutateAsync({ id: d.keyResultId, title: truoc });", 'await new Promise<void>((xong, hong) => suaKr.mutate({ id: d.keyResultId ?? "", title: truoc }, { onSuccess: () => xong(), onError: hong }));'), doi: [["k3_hai_hoan", "kr1 khong ve cho"]] },
	{ ten: "(f) assertSuaDich luat cu", tep: "apps/api/src/okr/tro-ly.service.ts", cam: thay("await this.coKrSuaDuoc(userId, dich.objectiveId)", "false"), doi: [["k3_nhieu_kr", "nguoi phu trach hai kr bi tu choi"]] },
	{ ten: "(g) chi cuon toi vung", tep: "apps/app/components/crm/record-sheet/objective-sheet.tsx", cam: thay("noiDen.focus({ preventScroll: true });", ""), doi: [["k3_neo_kr", "neo sai: kr"]] },
	{ ten: "(h) chon lien ket dau danh sach khop dich", tep: `${OKR}/gop-y-kara.ts`, cam: noi(thay(" && !cu.has(g.alignmentId)", ""), thay("moi.length === 1", "moi.length > 0")), doi: [["k3_can_chinh", "go nham lien ket"]] },
];

const chay = (khoa) => {
	const r = chayVo(lenhCauHinh(khoa));
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
};

const nen = CHAN.map((k) => ({ k, ...chay(k) }));
const chuaXanh = nen.filter((x) => x.ma !== 0);
if (chuaXanh.length) {
	console.log(`KHONG DO DUOC: chua pha gi ma ${chuaXanh.map((x) => `${x.k}(${x.ma})`).join(" · ")} da khong xanh`);
	process.exit(2);
}
console.log(`chieu xanh: ${CHAN.length}/${CHAN.length} chan xanh tren cay lanh`);

let bat = 0;
for (const v of VET) {
	const duong = path.join(ROOT, v.tep);
	const truoc = fs.readFileSync(duong, "utf8");
	const bamTruoc = bam(v.tep);
	const ket = [];
	try {
		fs.writeFileSync(duong, v.cam(truoc));
		for (const [k, thongDiep] of v.doi) {
			const r = chay(k);
			ghiRa(`dot-bien-${v.ten.slice(1, 2)}-${k}.txt`, r.ra);
			ket.push({ k, do: r.ma !== 0, ghim: r.ra.includes(thongDiep), thongDiep });
		}
	} finally {
		fs.writeFileSync(duong, truoc);
	}
	if (bam(v.tep) !== bamTruoc) {
		console.log(`TEP KHONG TRA LAI: ${v.tep}`);
		process.exit(3);
	}
	const duBat = ket.every((x) => x.do && x.ghim);
	if (duBat) bat++;
	console.log(`${duBat ? "bat" : "MU"} ${v.ten}: ${ket.map((x) => `${x.k} ${x.do ? "do" : "XANH"}${x.ghim ? "" : ` (thieu «${x.thongDiep}»)`}`).join(" · ")}`);
}
console.log(`dot-bien: ${bat}/${VET.length} vet bi bat, tep tra lai nguyen`);
process.exit(bat === VET.length ? 0 : 1);
