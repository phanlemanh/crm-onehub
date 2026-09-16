import { PROTO_CATALOG } from "../../../apps/app/app/proto/catalog.ts";
import { PROTO_COMPONENTS } from "../../../apps/app/app/proto/registry.ts";
import { thoat } from "./may-chu.mjs";

const loi = [];
const doi = (d, c) => {
	if (!d) loi.push(c);
};

if (PROTO_CATALOG.length < 1)
	thoat(2, "san cung: catalog rong — moi cau 'moi muc deu hop le' duoi day dung vo nghia");

const mau = PROTO_CATALOG.find((m) => m.slug === "duong-proto");
if (mau === undefined) thoat(2, "san cung: khong thay muc duong-proto");
if (mau.states.length !== 5)
	thoat(2, `san cung: duong-proto khai ${mau.states.length} state, cho 5`);

for (const muc of PROTO_CATALOG) {
	doi(muc.slug.trim() !== "", `muc co slug rong: ${JSON.stringify(muc)}`);
	doi(muc.ten.trim() !== "", `muc "${muc.slug}" co ten rong`);
	doi(muc.states.length > 0, `muc "${muc.slug}" KHONG khai state nao`);

	const ids = muc.states.map((s) => s.id);
	doi(new Set(ids).size === ids.length, `muc "${muc.slug}" co state id trung: ${ids.join(", ")}`);

	for (const s of muc.states) {
		doi(s.id.trim() !== "", `muc "${muc.slug}" co state id rong`);
		doi(s.nhan.trim() !== "", `muc "${muc.slug}" state "${s.id}" co nhan rong`);
	}
}

const trongSo = PROTO_CATALOG.map((m) => m.slug);
const trongBang = [...PROTO_COMPONENTS.keys()];

for (const s of trongSo)
	doi(trongBang.includes(s), `slug "${s}" co trong so dang ky nhung THIEU Component trong registry`);
for (const s of trongBang)
	doi(trongSo.includes(s), `slug "${s}" co Component trong registry nhung KHONG co trong so dang ky`);

if (loi.length === 0) {
	console.log(`OK so-dang-ky: ${PROTO_CATALOG.length} muc, ${trongBang.length} component`);
	process.exit(0);
}
for (const c of loi) console.error(`  - ${c}`);
thoat(1, `so-dang-ky: ${loi.length} dieu khong dat`);
