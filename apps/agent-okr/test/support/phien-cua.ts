import { Client } from "eve/client";
import { mintOkr, yeuSach } from "./the-cua";

export function clientCua(v: {
	url: string;
	secret: string;
	userId: string;
	cuocSoanId: string;
}): Client {
	return new Client({
		host: v.url,
		auth: {
			bearer: () =>
				mintOkr(yeuSach({ sub: v.userId, cuocSoanId: v.cuocSoanId }), v.secret),
		},
		redirect: "manual",
	});
}

export function moPhien(v: {
	url: string;
	secret: string;
	userId: string;
	cuocSoanId: string;
}) {
	return clientCua(v).session();
}
