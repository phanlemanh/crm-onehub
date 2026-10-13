import {
	bocPhanHoiKeoVe,
	type KeoVeOutput,
} from "../../../packages/validation/src/tin-hieu.ts";

export const KHOA_GIA = "khoa-thu-vong-kit";

export function mayChuGia(ds: KeoVeOutput["tep"]) {
	const sv = Bun.serve({
		port: 0,
		fetch: (req) =>
			req.headers.get("x-api-key") === KHOA_GIA
				? Response.json(bocPhanHoiKeoVe(ds))
				: new Response("{}", { status: 401 }),
	});
	return { url: `http://localhost:${sv.port}`, dung: () => sv.stop(true) };
}
