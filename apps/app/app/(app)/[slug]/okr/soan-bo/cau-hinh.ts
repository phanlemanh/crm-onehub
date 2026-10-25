const KHO_HAI_THE = 1024;

export const SOAN_BO = {
	tenToiThieu: 3,
	khoHaiThe: KHO_HAI_THE,
	truyVanHep: `(max-width: ${KHO_HAI_THE - 1}px)`,
	dauTachKhoa: "~",
	dongCho: ["mot", "hai"],
} as const;
