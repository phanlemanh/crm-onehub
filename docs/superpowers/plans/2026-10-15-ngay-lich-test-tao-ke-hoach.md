# Kế hoạch — ngay-lich-test-tao-ke-hoach

| Task | Việc | Tệp | Phục vụ | Độc lập |
|---|---|---|---|---|
| T1 | `ngayGiuaThangNay()` chọn 16 khi hôm nay là 15 | `apps/app/test/noi-bon-nut.dom.tsx` | E1, E2 | có |
| T2 | Thước tám ô đồng hồ ghim và thước phạm vi | `_acceptance/ngay-lich-test-tao-ke-hoach/rang/ba-ngay.mjs` | E1, E2, E3 | không (sau T1) |

Cả hai đã làm ở S1/S3 (17d1b7e1e, 30b9c3adf). Verify: `bun _acceptance/ngay-lich-test-tao-ke-hoach/rang/ba-ngay.mjs` và
`--pham-vi` đều DAT; phá-thử thay tệp test bằng bản c1864a3a2 → `SAI sua 12:00 ngay 15 VN`. Sau S4: ghim lại hồ sơ
`noi-bon-nut-dieu-phoi` (tệp nằm trong `paths` của nó).
