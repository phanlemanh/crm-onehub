export const LOI_NEN_DA_BIET = [
	/^Error: Route "\/\[slug\]": Next\.js encountered uncached data during prerendering or a navigation\.$/,
];

export function tachLoiConsole(loi, mau = LOI_NEN_DA_BIET) {
	const laBiet = (l) => mau.some((m) => m.test(l.trim()));
	return { biet: loi.filter(laBiet), moi: loi.filter((l) => !laBiet(l)) };
}
