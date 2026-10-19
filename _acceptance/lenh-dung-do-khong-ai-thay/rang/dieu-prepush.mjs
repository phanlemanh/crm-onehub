export function buildTrongPrePush(prePush) {
	const khopVong = prePush.match(/for task in ([^;]+); do/);
	if (!khopVong)
		return { doc: false, dat: false, chu: "khong thay vong `for task in ...` trong .githooks/pre-push" };
	const danhSachTask = khopVong[1].trim().split(/\s+/);
	return {
		doc: true,
		dat: danhSachTask.includes("build"),
		chu: `danh sach task cua pre-push: ${danhSachTask.join(" ")}`,
	};
}
