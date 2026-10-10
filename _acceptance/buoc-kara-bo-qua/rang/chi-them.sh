set -eu
GOC=$(git merge-base HEAD origin/onehub)
XOA=$(git diff "$GOC" -- apps/app/test/agent-transcript.spec.ts packages/ui/test/kara-trang-thai-ui.dom.tsx packages/ui/test/bo-xuong-kara.dom.tsx | grep -c '^-[^-]' || true)
if [ "$XOA" -ne 0 ]; then
	echo "chi-them: $XOA dong kiem cu bi xoa hay sua"
	exit 1
fi
echo "chi-them: 0 dong kiem cu bi doi"
