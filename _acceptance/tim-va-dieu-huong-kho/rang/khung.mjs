export const deLenNhau = (t) =>
	t.evaluate(() => {
		const h = document.querySelector("[data-slot='page-shell-title']");
		if (!h) return ["khong thay tieu de trang"];
		const vung = document.createRange();
		vung.selectNodeContents(h);
		const chu = [...vung.getClientRects()].filter(
			(r) => r.width > 0 && r.height > 0,
		);
		const nut = [
			...document.querySelectorAll("[data-slot='page-shell-actions'] > *"),
		];
		return nut.flatMap((n) => {
			const b = n.getBoundingClientRect();
			const cham = chu.some((a) => {
				const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
				const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
				return x > 0 && y > 0;
			});
			return cham ? [`tieu de de len nut «${n.innerText.trim()}»`] : [];
		});
	});
