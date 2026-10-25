import "@crm/env/load";
import { HOP_DONG_MAU } from "./hop-dong-mau/cau-hinh";
import { kiemDuocNapHopDong } from "./hop-dong-mau/chan";

const chan = kiemDuocNapHopDong(process.env);
if (!chan.cho) {
	console.error(chan.cau);
	process.exit(HOP_DONG_MAU.ma.chan);
}

const { chayLenh } = await import("./hop-dong-mau/lenh");
process.exit(await chayLenh(process.argv.slice(2)));
