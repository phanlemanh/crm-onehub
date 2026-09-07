# Lệnh dựng đỏ mà không cổng nào thấy

> Hồ sơ nghiệm thu: `_acceptance/lenh-dung-do-khong-ai-thay/`
> Hạng **T2** — chạm `apps/app/**` và cấu hình bộ lệnh chứng.

## Lỗi, nói gọn

`bun run build` của kho **đỏ**, và đã đỏ suốt bốn vòng Việt hoá đã ký.

`apps/app/next.config.ts` bật `cacheComponents: true` (Next 16). Luật của nó:
mỗi màn phải dựng được một **vỏ tĩnh** không chạm dữ liệu của lượt truy cập —
`cookies()`, `headers()`, `params`, `searchParams`, `fetch` chưa đệm — trừ khi
phần chạm được bọc trong `<Suspense>`.

Các vòng Việt hoá đưa `getLocale()` vào thân **19 màn** của `apps/app`:

```ts
export async function getLocale(): Promise<Locale> {
	const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
	…
}
```

Gọi ở thân màn, ngoài mọi `<Suspense>`, nên vỏ tĩnh không dựng nổi. Next dừng
lượt dựng ở màn đầu tiên vấp phải.

## Đây là lỗi của bản rẽ, không phải của hãng

Ba số đo, không suy đoán:

- `apps/app/lib/locale/server.ts` **không tồn tại** trên nhánh `release`.
- **Không màn nào** của hãng gọi `getLocale` (`git grep` trên `release`: 0).
- Hãng **đã bật** `cacheComponents: true` từ trước.

Tức hãng giao một kho dựng được; ta thêm một hàm đọc dữ liệu lượt truy cập vào
19 màn và làm nó đỏ.

## Vì sao không cổng nào thấy

Bộ lệnh chứng của kho có **bốn** lệnh — `test` · `check-types` · `lint` ·
`lint:slop` — và **không có `build`**. Ba nơi cùng chép đúng bốn lệnh ấy:
`.githooks/pre-push`, `.github/workflows/ci.yml`, và
`feature_loop.suite_keys` của `_acceptance/config.yaml`.

Một lệnh không ai chạy thì không phải bằng chứng. Đây mới là lỗ thật: bản vá 19
màn sửa hôm nay, còn lỗ này để nguyên thì vòng sau lại lọt.

## Cách sửa màn — đã đo trên một màn thật

Đưa phần đọc `getLocale()` vào **trong** một `<Suspense>` ở ngoài cùng:

```tsx
export default function GeneralSettingsPage() {
	return (
		<Suspense fallback={<PageShellLoading />}>
			<GeneralSettingsShell />
		</Suspense>
	);
}

async function GeneralSettingsShell() {
	const t = settingsMessages(await getLocale());
	return ( … nguyên văn thân cũ … );
}
```

Đã thử thật trên `settings/page.tsx`: lượt dựng đi qua được màn ấy và
`settings/connections`, rồi dừng ở màn kế chưa sửa. Tức cách sửa đúng, và mỗi
màn sửa được độc lập.

**`generateMetadata()` KHÔNG cần đụng.** Nó cũng gọi `getLocale()` ở 22 màn,
nhưng lượt dựng sau khi vá thân vẫn qua — đo được, không đoán. Next cho metadata
động; chỉ vỏ tĩnh của thân mới bị chặn.

## Cái giá, nói thẳng

Vỏ tĩnh của 19 màn ấy nay là ô chờ `PageShellLoading` thay vì tiêu đề. Người
dùng thấy một nhịp chờ ngắn hơn trước ở tiêu đề màn. Đổi lại ứng dụng dựng
được — hiện giờ nó không dựng được chút nào, nên đây không phải đánh đổi giữa
hai thứ tốt.

Không đổi một chữ nào trên màn: cùng khoá, cùng kho chuỗi, cùng hai thứ tiếng.

## Lệnh dựng vào bộ chứng

Thêm `bun run build` thành lệnh chứng thứ **năm**, ở ba nơi:

| Nơi | Sửa gì |
| --- | --- |
| `_acceptance/config.yaml` | một ổ cắm `build_khong_cache` + thêm vào `feature_loop.suite_keys` |
| `.githooks/pre-push` | thêm `build` vào danh sách task |
| `.github/workflows/acceptance.yml` | thêm một bước chạy nó |

**Không đụng `.github/workflows/ci.yml`** — `CLAUDE.md` cấm: CI riêng của công ty
sống ở `acceptance.yml`, không bao giờ vào `ci.yml` của hãng.

Ổ cắm phải **ép chạy lại**, cùng lối `check_types_khong_cache` đã có: task
`build` còn đệm trong turbo, nên một ổ cắm không ép sẽ trả xanh từ đệm và lặp
lại đúng lớp lỗi «bản khai vô tác dụng» vòng `thuoc-cache-het-doi-tuong` đã đóng.

## Sẽ KHÔNG làm

- **Không đổi `getLocale()`.** Nó đọc cookie và `accept-language` là đúng; vấn đề
  là chỗ gọi, không phải hàm.
- **Không dựng lối chọn tiếng qua middleware hay qua đoạn đường dẫn.** Đó là một
  thiết kế khác, đắt hơn nhiều, và không cần để dựng được.
- **Không đụng `generateMetadata`** — đã đo là không phải nguyên nhân.
- **Không thêm `build` vào `ci.yml` của hãng.**

## Gửi ngược lên hãng

Không có gì để gửi: lỗi là của bản rẽ. Nhưng việc `ci.yml` của hãng không chạy
`build` là một lỗ của hãng — ghi lại làm mục ngoài hợp đồng để người quyết, chứ
vòng này không tự vá kho của hãng.
