const MAU = /Kara|Trợ lý/;

function baoNeuCo(context, node, chu) {
	if (chu !== null && chu !== undefined && MAU.test(String(chu)))
		context.report({
			node,
			message: `chu cung: ${String(chu).trim().slice(0, 60)}`,
		});
}

const khongChuCung = {
	meta: { type: "problem" },
	create(context) {
		return {
			JSXText(node) {
				baoNeuCo(context, node, node.value);
			},
			Literal(node) {
				if (node.parent?.type === "ImportDeclaration") return;
				baoNeuCo(context, node, node.value);
			},
			TemplateElement(node) {
				baoNeuCo(context, node, node.value?.cooked);
			},
		};
	},
};

export default {
	meta: { name: "chu-kara" },
	rules: { "khong-chu-cung": khongChuCung },
};
