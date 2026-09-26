import { AsyncLocalStorage } from "node:async_hooks";

const KHO_NGU_CANH = Symbol.for("eve.context-storage");

type KhoaNguCanh = { readonly name: string };

class NguCanhThu {
	readonly #gia = new Map<string, object>();

	has(khoa: KhoaNguCanh): boolean {
		return this.#gia.has(khoa.name);
	}

	get<T extends object>(khoa: KhoaNguCanh): T | undefined {
		return this.#gia.get(khoa.name) as T | undefined;
	}

	require<T extends object>(khoa: KhoaNguCanh): T {
		const gia = this.get<T>(khoa);
		if (gia === undefined) throw new Error(`ngu canh thu thieu ${khoa.name}`);
		return gia;
	}

	set<T extends object>(khoa: KhoaNguCanh, gia: T): T {
		this.#gia.set(khoa.name, gia);
		return gia;
	}

	ensure<T extends object>(khoa: KhoaNguCanh, taoMoi: () => T): T {
		return this.get<T>(khoa) ?? this.set(khoa, taoMoi());
	}
}

function khoChay(): AsyncLocalStorage<NguCanhThu> {
	const kho = Reflect.get(globalThis, KHO_NGU_CANH);
	if (!(kho instanceof AsyncLocalStorage)) {
		throw new Error("eve chua dung kho ngu canh — nap mot cong cu truoc");
	}
	return kho;
}

export function trongNguCanhEve<T>(chay: () => Promise<T>): Promise<T> {
	return khoChay().run(new NguCanhThu(), chay);
}
