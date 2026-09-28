import "@crm/env/load";
import { OKR_MAU } from "./okr-mau/cau-hinh";
import { kiemDuocNap } from "./okr-mau/chan";

const chan = kiemDuocNap(process.env);
if (!chan.cho) {
	console.error(chan.cau);
	process.exit(OKR_MAU.ma.chan);
}

const { chayLenh } = await import("./okr-mau/lenh");
process.exit(await chayLenh(process.argv.slice(2)));
